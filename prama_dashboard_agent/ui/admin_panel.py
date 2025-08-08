import streamlit as st

from prama_dashboard_agent.core import db as core_db
from prama_dashboard_agent.core import auth as core_auth


def render_admin_panel() -> None:
    st.header("Admin Panel")

    st.subheader("Add User")
    with st.form("add_user_form"):
        email = st.text_input("Email")
        password = st.text_input("Password", type="password")
        is_admin = st.checkbox("Admin")
        submitted = st.form_submit_button("Create User")
        if submitted:
            if core_auth.signup_user(email=email, password=password, is_admin=is_admin):
                st.success("User created")
            else:
                st.error("Failed to create user (email may exist)")

    st.subheader("Users")
    users = core_db.list_users()
    if not users:
        st.info("No users found")
        return

    for uid, email, role in users:
        col1, col2, col3 = st.columns([4, 2, 2])
        with col1:
            st.write(f"{email} ({role})")
        with col2:
            st.write(f"ID: {uid}")
        with col3:
            if st.button("Delete", key=f"del_{uid}"):
                core_db.delete_user(uid)
                st.success("Deleted")
                st.experimental_rerun()