from __future__ import annotations

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.auth import get_current_user, get_db
from app.models import LoginHistory, User
from app.schemas import HistoryRecord

router = APIRouter()


@router.get("/history/logins", response_model=list[HistoryRecord])
def history_logins(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[HistoryRecord]:
    rows = db.query(LoginHistory).order_by(LoginHistory.created_at.desc()).all()
    return [HistoryRecord(
        id=row.id,
        user=row.username or "Unknown",
        email=row.email or "—",
        action=row.action,
        status=row.status,
        ip=row.ip_address or "—",
        device=row.device or "Unknown",
        timestamp=row.created_at.strftime("%Y-%m-%d %H:%M:%S") if row.created_at else "",
    ) for row in rows]


@router.get("/history/logins/export")
def export_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Response:
    rows = db.query(LoginHistory).order_by(LoginHistory.created_at.desc()).all()
    csv_lines = ["id,user,email,action,status,ip,device,timestamp"]
    for row in rows:
        csv_lines.append(
            ",".join([
                str(row.id),
                (row.username or "Unknown").replace(",", " "),
                (row.email or "—").replace(",", " "),
                row.action,
                row.status,
                row.ip_address or "—",
                row.device or "Unknown",
                (row.created_at.strftime("%Y-%m-%d %H:%M:%S") if row.created_at else ""),
            ])
        )
    return Response(content="\n".join(csv_lines), media_type="text/csv")
