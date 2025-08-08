import os
import sqlite3
from pathlib import Path
from typing import Optional, Tuple, List

BASE_DIR = Path(os.getenv("PRAMA_BASE_DIR", Path(__file__).resolve().parents[2]))
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "app.db"


def get_connection() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_db() -> None:
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token_hash TEXT NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            persistent INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        """
    )

    conn.commit()
    conn.close()


def get_user_by_email(email: str) -> Optional[Tuple[int, str, str, str]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, email, password_hash, role FROM users WHERE email = ?", (email,))
    row = cur.fetchone()
    conn.close()
    if row:
        return (row[0], row[1], row[2], row[3])
    return None


def create_user(email: str, password_hash: str, role: str = "user") -> bool:
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
            (email, password_hash, role),
        )
        conn.commit()
        conn.close()
        return True
    except sqlite3.IntegrityError:
        return False


def list_users() -> List[Tuple[int, str, str]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, email, role FROM users ORDER BY id")
    rows = cur.fetchall()
    conn.close()
    return [(row[0], row[1], row[2]) for row in rows]


def delete_user(user_id: int) -> None:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))
    cur.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()


def add_session(user_id: int, token_hash: str, expires_at: str, persistent: bool) -> None:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO sessions (user_id, token_hash, expires_at, persistent) VALUES (?, ?, ?, ?)",
        (user_id, token_hash, expires_at, 1 if persistent else 0),
    )
    conn.commit()
    conn.close()


def get_session_by_token_hash(token_hash: str) -> Optional[Tuple[int, int, str, str, int]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, user_id, token_hash, expires_at, persistent FROM sessions WHERE token_hash = ?",
        (token_hash,),
    )
    row = cur.fetchone()
    conn.close()
    if row:
        return (row[0], row[1], row[2], row[3], row[4])
    return None


def delete_session_by_token_hash(token_hash: str) -> None:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM sessions WHERE token_hash = ?", (token_hash,))
    conn.commit()
    conn.close()