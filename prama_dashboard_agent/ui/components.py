import streamlit as st


def render_header(title: str) -> None:
    col1, col2 = st.columns([1, 6])
    with col1:
        st.image(
            "https://raw.githubusercontent.com/streamlit/brand/master/logos/mark/streamlit-mark-color.png",
            width=48,
        )
    with col2:
        st.title(title)