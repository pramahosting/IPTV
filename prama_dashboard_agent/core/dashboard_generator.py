from typing import Dict, Any
import pandas as pd
import streamlit as st


def build_dashboard(df: pd.DataFrame, schema: Dict[str, Any]) -> None:
    numeric_cols = [col for col in df.columns if col in schema.get("numeric", [])]
    categorical_cols = [col for col in df.columns if col in schema.get("categorical", [])]

    cols = st.columns(2)

    if numeric_cols:
        with cols[0]:
            sel_num = st.multiselect("Numeric columns for histograms", numeric_cols, default=numeric_cols[:2])
            for col in sel_num:
                st.subheader(f"Histogram: {col}")
                st.bar_chart(df[col].dropna().value_counts(bins=20).sort_index())

    if categorical_cols:
        with cols[1]:
            sel_cat = st.multiselect("Categorical columns for bar charts", categorical_cols, default=categorical_cols[:2])
            for col in sel_cat:
                st.subheader(f"Bar chart: {col}")
                st.bar_chart(df[col].astype(str).value_counts())