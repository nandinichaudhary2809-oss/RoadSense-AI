
import sqlite3
from pathlib import Path

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from jose import JWTError

from security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)

DATABASE = Path(__file__).resolve().parent / "roadsense.db"

router = APIRouter(prefix="/auth", tags=["Authentication"])
bearer_scheme = HTTPBearer()


def init_users_table():
    with sqlite3.connect(DATABASE) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'citizen'
            )
        """)


init_users_table()


class SignupData(BaseModel):
    email: EmailStr
    password: str


class LoginData(BaseModel):
    email: EmailStr
    password: str


@router.post("/signup")
def signup(data: SignupData):
    if len(data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters",
        )

    password_hash = hash_password(data.password)

    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.execute(
                "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
                (str(data.email).lower(), password_hash, "citizen"),
            )
            user_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="Email already registered")

    return {
        "message": "Signup successful",
        "user_id": user_id,
        "role": "citizen",
    }


@router.post("/login")
def login(data: LoginData):
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        user = conn.execute(
            "SELECT * FROM users WHERE email = ?",
            (str(data.email).lower(),),
        ).fetchone()

    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "sub": str(user["id"]),
        "role": user["role"],
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
        },
    }


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        with sqlite3.connect(DATABASE) as conn:
            conn.row_factory = sqlite3.Row
            user = conn.execute(
                "SELECT id, email, role FROM users WHERE id = ?",
                (int(user_id),),
            ).fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return dict(user)

    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    return user
