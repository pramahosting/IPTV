from typing import List, Dict, Any
import numpy as np
import pandas as pd


def _numeric_insights(df: pd.DataFrame, numeric_cols: List[str]) -> List[str]:
    insights: List[str] = []
    for col in numeric_cols:
        series = df[col].dropna()
        if series.empty:
            continue
        mean_val = series.mean()
        median_val = series.median()
        max_val = series.max()
        min_val = series.min()
        insights.append(
            f"Column '{col}': mean={mean_val:.2f}, median={median_val:.2f}, min={min_val:.2f}, max={max_val:.2f}"
        )
    return insights


def _categorical_insights(df: pd.DataFrame, categorical_cols: List[str]) -> List[str]:
    insights: List[str] = []
    for col in categorical_cols:
        series = df[col].dropna().astype(str)
        if series.empty:
            continue
        vc = series.value_counts().head(3)
        top_vals = ", ".join([f"{idx} ({cnt})" for idx, cnt in vc.items()])
        insights.append(f"Top categories in '{col}': {top_vals}")
    return insights


def generate_insights(df: pd.DataFrame, schema: Dict[str, Any]) -> List[str]:
    numeric_cols = schema.get("numeric", [])
    categorical_cols = schema.get("categorical", [])

    insights: List[str] = []
    insights.extend(_numeric_insights(df, numeric_cols))
    insights.extend(_categorical_insights(df, categorical_cols))

    # Add more insight modules here as needed
    return insights