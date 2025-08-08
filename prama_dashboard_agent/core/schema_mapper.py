from typing import Dict, Any
import pandas as pd


def infer_schema(df: pd.DataFrame) -> Dict[str, Any]:
    schema = {"columns": {}, "numeric": [], "categorical": [], "other": []}
    for col in df.columns:
        dtype = str(df[col].dtype)
        non_null = df[col].dropna()
        is_numeric = pd.api.types.is_numeric_dtype(df[col])
        is_bool = pd.api.types.is_bool_dtype(df[col])
        is_datetime = pd.api.types.is_datetime64_any_dtype(df[col])

        # Heuristic: treat low-cardinality object columns as categorical
        if is_numeric and not is_bool:
            schema["numeric"].append(col)
            kind = "numeric"
        elif is_bool or (not is_datetime and not is_numeric and non_null.nunique() <= 50):
            schema["categorical"].append(col)
            kind = "categorical"
        else:
            schema["other"].append(col)
            kind = "other"

        schema["columns"][col] = {
            "dtype": dtype,
            "kind": kind,
            "non_null_count": int(non_null.shape[0]),
            "unique": int(non_null.nunique()),
        }

    return schema