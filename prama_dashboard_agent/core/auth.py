import os
import hashlib
from typing import Optional, Tuple

from prama_dashboard_agent.core import db as core_db

try:
    import bcrypt  # type: ignore
    HAS_BCRYPT = True
except Exception:
    HAS_BCRYPT = False


def _hash_password_pbkdf2(password: str, salt: bytes) -> str:
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 200_000)
    return salt.hex() + ":" + dk.hex()


def _verify_password_pbkdf2(password: str, stored: str) -> bool:
    try:
        salt_hex, dk_hex = stored.split(":", 1)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(dk_hex)
        calc = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 200_000)
        return hashlib.sha256(calc + expected).hexdigest() == hashlib.sha256(expected + calc).hexdigest()
    except Exception:
        return False


def hash_password(password: str) -> str:
    if HAS_BCRYPT:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")
    # Fallback PBKDF2 with random salt
    salt = os.urandom(16)
    return _hash_password_pbkdf2(password, salt)


def verify_password(password: str, hashed: str) -> bool:
    if HAS_BCRYPT and hashed.startswith("$2b$"):
        try:
            return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
        except Exception:
            return False
    return _verify_password_pbkdf2(password, hashed)


def verify_credentials(email: str, password: str) -> Optional[Tuple[int, str, str]]:
    user = core_db.get_user_by_email(email)
    if not user:
        return None
    user_id, email_val, password_hash, role = user
    if verify_password(password, password_hash):
        return (user_id, email_val, role)
    return None


def signup_user(email: str, password: str, is_admin: bool = False) -> bool:
    if not email or not password:
        return False
    role = "admin" if is_admin else "user"
    password_hash = hash_password(password)
    return core_db.create_user(email, password_hash, role)