from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import create_access_token, get_current_user, get_db, verify_password
from app.config import DEFAULT_ADMIN_PASSWORD
from app.models import LoginHistory, User
from app.schemas import LoginRequest, TokenResponse, UserOut

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        db.add(LoginHistory(username=payload.username, action="login", status="failed", ip_address="127.0.0.1", device="local"))
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if payload.password == DEFAULT_ADMIN_PASSWORD and user.username == "admin":
        user.password_hash = user.password_hash

    token = create_access_token(user.username)
    db.add(LoginHistory(user_id=user.id, username=user.username, email=user.email, action="login", status="success", ip_address="127.0.0.1", device="local"))
    db.commit()
    return TokenResponse(access_token=token, user=UserOut(id=user.id, username=user.username, email=user.email, role=user.role))


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, str]:
    db.add(LoginHistory(user_id=current_user.id, username=current_user.username, email=current_user.email, action="logout", status="success", ip_address="127.0.0.1", device="local"))
    db.commit()
    return {"status": "ok"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)) -> UserOut:
    return UserOut(id=current_user.id, username=current_user.username, email=current_user.email, role=current_user.role)
