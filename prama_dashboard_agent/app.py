import os
import time
import uuid
import pandas as pd
import streamlit as st
from typing import Optional, Tuple

from prama_dashboard_agent.core import db as core_db
from prama_dashboard_agent.core import auth as core_auth
from prama_dashboard_agent.core import sessions as core_sessions
from prama_dashboard_agent.core.dashboard_generator import build_dashboard
from prama_dashboard_agent.core.insight_engine import generate_insights
from prama_dashboard_agent.core.schema_mapper import infer_schema
from prama_dashboard_agent.core.data_connectors.sqlalchemy_connector import connection_wizard, fetch_table_as_dataframe
from prama_dashboard_agent.ui.admin_panel import render_admin_panel
from prama_dashboard_agent.ui.components import render_header

APP_TITLE = "Prama Dashboard Agent"


def init_app_once() -> None:
    core_db.initialize_db()
    core_sessions.ensure_secret_key()


def require_auth() -> Optional[Tuple[int, str, str]]:
    session = core_sessions.get_current_session()
    if session:
        return session

    # Login / Signup UI
    st.sidebar.header("Login / Signup")
    auth_mode = st.sidebar.radio("Mode", ["Login", "Signup"], horizontal=True)

    with st.sidebar.form("auth_form", clear_on_submit=False):
        email = st.text_input("Email")
        password = st.text_input("Password", type="password")
        remember_me = st.checkbox("Remember Me")
        submitted = st.form_submit_button("Submit")

    if submitted:
        if auth_mode == "Signup":
            created = core_auth.signup_user(email=email, password=password, is_admin=False)
            if created:
                st.success("Signup successful. You can now log in.")
            else:
                st.error("Signup failed. Email may already exist or invalid.")
        else:
            user = core_auth.verify_credentials(email=email, password=password)
            if not user:
                st.error("Invalid credentials")
                return None
            user_id, email_val, role = user
            core_sessions.create_session_and_set_cookie(user_id=user_id, remember_me=remember_me)
            st.experimental_rerun()

    return None


def logout_flow() -> None:
    if st.sidebar.button("Logout"):
        core_sessions.logout_current_session()
        st.success("Logged out")
        time.sleep(0.5)
        st.experimental_rerun()


def main():
    st.set_page_config(page_title=APP_TITLE, layout="wide")
    init_app_once()

    render_header(APP_TITLE)

    session_info = require_auth()
    if not session_info:
        st.info("Please log in to continue.")
        return

    user_id, email, role = session_info

    st.sidebar.caption(f"Logged in as: {email}")
    if role == "admin":
        open_admin = st.sidebar.checkbox("Open Admin Panel")
    else:
        open_admin = False

    logout_flow()

    if open_admin and role == "admin":
        render_admin_panel()
        return

    st.header("Data Input")

    tabs = st.tabs(["Upload CSV", "Connect Database"])
    df = None

    with tabs[0]:
        uploaded_file = st.file_uploader("Upload CSV", type=["csv"]) 
        if uploaded_file is not None:
            try:
                df = pd.read_csv(uploaded_file)
                st.success("CSV loaded successfully")
            except Exception as exc:
                st.error(f"Failed to read CSV: {exc}")

    with tabs[1]:
        conn_params = connection_wizard()
        if conn_params is not None:
            with st.spinner("Connecting and fetching preview..."):
                try:
                    df = fetch_table_as_dataframe(conn_params)
                    st.success("Fetched data from database")
                except Exception as exc:
                    st.error(f"Failed to fetch table: {exc}")

    if df is None:
        st.info("Upload a CSV or connect to a database to continue.")
        st.stop()

    st.header("Data Overview")
    st.dataframe(df.head(200))

    schema = infer_schema(df)
    st.subheader("Schema & Types")
    st.json(schema)

    st.subheader("Summary Statistics")
    st.write(df.describe(include="all").transpose())

    st.header("Dashboard")
    selected_columns = st.multiselect(
        "Select columns to visualize", options=list(df.columns), default=list(df.columns)[:5]
    )

    if selected_columns:
        build_dashboard(df[selected_columns], schema)

    st.header("Business Insights")
    insights = generate_insights(df, schema)
    for insight in insights:
        st.markdown(f"- {insight}")

    st.header("Ask the Data (Ollama)")
    user_question = st.text_input("Question about the data (optional)")
    if st.button("Ask") and user_question:
        try:
            from prama_dashboard_agent.core.llm.ollama_client import OllamaClient
            client = OllamaClient()
            preview = df.head(50).to_csv(index=False)
            prompt = (
                "You are a data analyst. Given the first 50 rows of CSV data and a question, "
                "answer concisely with bullet points if possible.\n\n"
                f"CSV:\n{preview}\n\nQuestion: {user_question}\n"
            )
            response = client.generate(prompt)
            st.write(response)
        except Exception as exc:
            st.error(f"LLM error: {exc}")


if __name__ == "__main__":
    main()