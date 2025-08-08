from typing import Optional
import pandas as pd
import streamlit as st
from sqlalchemy import create_engine, text

from prama_dashboard_agent.core.data_connectors.base import ConnectionParams


DB_TYPES = [
    "PostgreSQL",
    "MySQL",
    "MSSQL",
    "Hive",
    "Iceberg (via Trino)",
]


def _build_sqlalchemy_url(params: ConnectionParams) -> str:
    if params.db_type == "PostgreSQL":
        return f"postgresql+psycopg2://{params.username}:{params.password}@{params.host}:{params.port}/{params.database}"
    if params.db_type == "MySQL":
        return f"mysql+pymysql://{params.username}:{params.password}@{params.host}:{params.port}/{params.database}"
    if params.db_type == "MSSQL":
        driver = "ODBC+Driver+17+for+SQL+Server"
        return (
            f"mssql+pyodbc://{params.username}:{params.password}@{params.host}:{params.port}/"
            f"{params.database}?driver={driver}"
        )
    if params.db_type == "Hive":
        return f"hive://{params.username}:{params.password}@{params.host}:{params.port}/{params.database}"
    if params.db_type == "Iceberg (via Trino)":
        # catalog required (e.g., iceberg), schema optional
        catalog = params.catalog or "iceberg"
        schema = params.schema or "default"
        return f"trino://{params.username}@{params.host}:{params.port}/{catalog}/{schema}"
    raise ValueError("Unsupported DB type")


def connection_wizard() -> Optional[ConnectionParams]:
    with st.expander("Database Connection Wizard", expanded=False):
        db_type = st.selectbox("Database Type", DB_TYPES)
        host = st.text_input("Host", value="localhost")
        port_default = 5432 if db_type == "PostgreSQL" else 3306 if db_type == "MySQL" else 1433 if db_type == "MSSQL" else 10000 if db_type == "Hive" else 8080
        port = st.number_input("Port", min_value=1, max_value=65535, value=port_default)
        username = st.text_input("Username")
        password = st.text_input("Password", type="password")
        database = st.text_input("Database", value="postgres" if db_type == "PostgreSQL" else "") if db_type != "Iceberg (via Trino)" else None
        catalog = st.text_input("Catalog", value="iceberg") if db_type == "Iceberg (via Trino)" else None
        schema = st.text_input("Schema", value="default") if db_type == "Iceberg (via Trino)" else None
        table = st.text_input("Table name (schema.table or table)")
        if st.button("Connect & Preview"):
            if db_type != "Iceberg (via Trino)" and not database:
                st.error("Database is required")
                return None
            params = ConnectionParams(
                db_type=db_type,
                host=host,
                port=int(port),
                username=username,
                password=password,
                database=database,
                catalog=catalog,
                schema=schema,
                table=table,
            )
            return params
    return None


def fetch_table_as_dataframe(params: ConnectionParams) -> pd.DataFrame:
    url = _build_sqlalchemy_url(params)
    engine = create_engine(url)
    table = params.table
    if not table:
        raise ValueError("Table name is required")

    query = f"SELECT * FROM {table} LIMIT 5000"
    with engine.connect() as conn:
        df = pd.read_sql(text(query), conn)
    return df