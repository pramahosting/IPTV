import os
from pathlib import Path
import pandas as pd

from prama_dashboard_agent.core import db as core_db
from prama_dashboard_agent.core import auth as core_auth
from prama_dashboard_agent.core.sessions import ensure_secret_key

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
LOGS_DIR = BASE_DIR / "logs"
OUTPUT_DIR = BASE_DIR / "output"
SAMPLE_DIR = BASE_DIR / "sample_data"


def write_sample_csv() -> None:
    SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
    csv_path = SAMPLE_DIR / "banking_customers.csv"
    if not csv_path.exists():
        df = pd.DataFrame(
            {
                "customer_id": list(range(1, 51)),
                "age": [25, 33, 41, 29, 35, 45, 52, 27, 38, 31] * 5,
                "income": [45000, 62000, 78000, 56000, 68000, 90000, 120000, 50000, 70000, 65000] * 5,
                "balance": [1500, 3000, 5000, 2000, 3500, 8000, 12000, 1800, 4200, 2600] * 5,
                "region": [
                    "North",
                    "South",
                    "East",
                    "West",
                    "North",
                    "South",
                    "East",
                    "West",
                    "North",
                    "South",
                ]
                * 5,
                "is_active": [True, False, True, True, False, True, False, True, True, False] * 5,
            }
        )
        df.to_csv(csv_path, index=False)


def write_sample_sql() -> None:
    SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
    sql_path = SAMPLE_DIR / "sample.sql"
    if not sql_path.exists():
        sql_path.write_text(
            """
-- Sample SQL for a 'customers' table
CREATE TABLE IF NOT EXISTS customers (
    customer_id INTEGER PRIMARY KEY,
    age INTEGER,
    income INTEGER,
    balance INTEGER,
    region TEXT,
    is_active BOOLEAN
);

INSERT INTO customers (customer_id, age, income, balance, region, is_active) VALUES
(1,25,45000,1500,'North',1),
(2,33,62000,3000,'South',0),
(3,41,78000,5000,'East',1),
(4,29,56000,2000,'West',1),
(5,35,68000,3500,'North',0);
            """.strip()
        )


def create_default_admin() -> None:
    # Create admin if not exists
    user = core_db.get_user_by_email("admin@local")
    if not user:
        core_auth.signup_user("admin@local", "admin123", is_admin=True)


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    core_db.initialize_db()
    ensure_secret_key()
    create_default_admin()
    write_sample_csv()
    write_sample_sql()

    print("Project initialized. Admin: admin@local / admin123")


if __name__ == "__main__":
    main()