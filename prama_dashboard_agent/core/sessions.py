import os
import time
import hashlib
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Tuple

import streamlit as st
from cryptography.fernet import Fernet
from extra_streamlit_components import CookieManager

from prama_dashboard_agent.core import db as core_db

COOKIE_NAME = "prama_session"
SECRET_KEY_PATH = Path(os.getenv("PRAMA_SECRET_PATH", Path(__file__).resolve().parents[2] / "data" / "secret.key"))

_cookie_manager: Optional[CookieManager] = None


def _get_cookie_manager() -> CookieManager:
    global _cookie_manager
    if _cookie_manager is None:
        _cookie_manager = CookieManager()
    return _cookie_manager


def ensure_secret_key() -> None:
    SECRET_KEY_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not SECRET_KEY_PATH.exists():
        key = Fernet.generate_key()
        SECRET_KEY_PATH.write_bytes(key)


def _get_fernet() -> Fernet:
    ensure_secret_key()
    key = SECRET_KEY_PATH.read_bytes()
    return Fernet(key)


def _encrypt(value: str) -> str:
    f = _get_fernet()
    return f.encrypt(value.encode("utf-8")).decode("utf-8")


def _decrypt(value: str) -> Optional[str]:
    try:
        f = _get_fernet()
        return f.decrypt(value.encode("utf-8")).decode("utf-8")
    except Exception:
        return None


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _now_str() -> str:
    return datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")


def _future_str(hours: int) -> str:
    ts = datetime.utcnow() + timedelta(hours=hours)
    return ts.strftime("%Y-%m-%d %H:%M:%S")


def create_session_and_set_cookie(user_id: int, remember_me: bool = False) -> None:
    token = os.urandom(32).hex()
    token_hash = _hash_token(token)
    expires_at = _future_str(24 * 7 if remember_me else 12)

    core_db.add_session(user_id=user_id, token_hash=token_hash, expires_at=expires_at, persistent=remember_me)

    payload = f"{token}|{expires_at}"
    enc = _encrypt(payload)
    cm = _get_cookie_manager()
    cm.set(COOKIE_NAME, enc, expires=(30 if remember_me else 1))


def get_current_session() -> Optional[Tuple[int, str, str]]:
    cm = _get_cookie_manager()
    enc = cm.get(COOKIE_NAME)
    if not enc:
        return None

    payload = _decrypt(enc)
    if not payload or "|" not in payload:
        return None

    token, expires_at = payload.split("|", 1)
    try:
        if datetime.strptime(expires_at, "%Y-%m-%d %H:%M:%S") < datetime.utcnow():
            return None
    except Exception:
        return None

    token_hash = _hash_token(token)
    sess = core_db.get_session_by_token_hash(token_hash)
    if not sess:
        return None

    _, user_id, _, db_expires_at, _ = sess
    try:
        if datetime.strptime(db_expires_at, "%Y-%m-%d %H:%M:%S") < datetime.utcnow():
            return None
    except Exception:
        return None

    # load user
    from prama_dashboard_agent.core.db import get_connection
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT email, role FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    email, role = row[0], row[1]
    return (user_id, email, role)


def logout_current_session() -> None:
    cm = _get_cookie_manager()
    enc = cm.get(COOKIE_NAME)
    if enc:
        payload = _decrypt(enc)
        if payload and "|" in payload:
            token, _ = payload.split("|", 1)
            core_db.delete_session_by_token_hash(_hash_token(token))
    cm.delete(COOKIE_NAME)