from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.auth import create_access_token, get_current_user, get_db, verify_password
from app.config import DEFAULT_ADMIN_PASSWORD
from app.models import LoginHistory, User
from app.schemas import LoginRequest, TokenResponse, UserOut

router = APIRouter()


def _client_info(request: Request) -> tuple[str, str]:
    """อ่าน IP และชนิดอุปกรณ์จาก request จริง"""
    ip = request.client.host if request.client else "unknown"
    # ถ้าอยู่หลัง Nginx/proxy ให้ใช้ IP ต้นทางจริงแทน IP ของ proxy
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        ip = forwarded.split(",")[0].strip()

    ua = request.headers.get("user-agent", "")
    if not ua:
        return ip, "Unknown"

    if "Edg/" in ua:
        browser = "Edge"
    elif "Chrome/" in ua and "Chromium" not in ua:
        browser = "Chrome"
    elif "Firefox/" in ua:
        browser = "Firefox"
    elif "Safari/" in ua:
        browser = "Safari"
    elif "curl" in ua.lower():
        browser = "curl"
    else:
        browser = "Unknown"

    if "Windows" in ua:
        os_name = "Windows"
    elif "Android" in ua:
        os_name = "Android"
    elif "iPhone" in ua or "iPad" in ua:
        os_name = "iOS"
    elif "Mac OS X" in ua or "Macintosh" in ua:
        os_name = "Mac"
    elif "Linux" in ua:
        os_name = "Linux"
    else:
        os_name = "Unknown"

    return ip, f"{browser} / {os_name}"


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)) -> TokenResponse:
    ip, device = _client_info(request)
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        db.add(LoginHistory(username=payload.username, action="login", status="failed", ip_address=ip, device=device))
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if payload.password == DEFAULT_ADMIN_PASSWORD and user.username == "admin":
        user.password_hash = user.password_hash

    token = create_access_token(user.username)
    db.add(LoginHistory(user_id=user.id, username=user.username, email=user.email, action="login", status="success", ip_address=ip, device=device))
    db.commit()
    return TokenResponse(access_token=token, user=UserOut(id=user.id, username=user.username, email=user.email, role=user.role))


@router.post("/logout")
def logout(request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, str]:
    ip, device = _client_info(request)
    db.add(LoginHistory(user_id=current_user.id, username=current_user.username, email=current_user.email, action="logout", status="success", ip_address=ip, device=device))
    db.commit()
    return {"status": "ok"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)) -> UserOut:
    return UserOut(id=current_user.id, username=current_user.username, email=current_user.email, role=current_user.role)
