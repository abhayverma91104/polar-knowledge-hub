"""
Authentication utilities - JWT + password hashing
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models import User, UserRole
from config import get_settings

import hashlib
import hmac
import os

settings = get_settings()
bearer_scheme = HTTPBearer(auto_error=False)


def _hash_pw(password: str, salt: str = "") -> str:
    """Simple PBKDF2-HMAC password hash"""
    if not salt:
        salt = os.urandom(16).hex()
    dk = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}${dk.hex()}"


def hash_password(password: str) -> str:
    # Truncate to 72 bytes (bcrypt limit) and use simple hash
    password = password[:72]
    return _hash_pw(password)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        if "$" in hashed:
            salt, stored = hashed.split("$", 1)
            return _hash_pw(plain[:72], salt) == hashed
        return False
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.jwt_expire_minutes))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        user_id: str = payload.get("sub")
        if not user_id:
            return None
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
        return user
    except JWTError:
        return None


async def require_user(
    current_user: Optional[User] = Depends(get_current_user),
) -> User:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user


async def require_admin(current_user: User = Depends(require_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


async def require_editor(current_user: User = Depends(require_user)) -> User:
    if current_user.role not in [UserRole.EDITOR, UserRole.ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Editor access required")
    return current_user
