from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user, get_db
from app.models import Alert, User
from app.schemas import AlertItem

router = APIRouter()


@router.get("/alerts", response_model=list[AlertItem])
def list_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[AlertItem]:
    rows = db.query(Alert).order_by(Alert.created_at.desc()).all()
    return [AlertItem(id=row.id, treeId=row.tree_id, zoneId=row.zone_id, type=row.type, message=row.message, isRead=row.is_read, createdAt=row.created_at.strftime("%Y-%m-%d %H:%M:%S") if row.created_at else "") for row in rows]


@router.post("/alerts/{alert_id}/read")
def mark_read(alert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict[str, object]:
    row = db.query(Alert).filter(Alert.id == alert_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Alert not found")
    row.is_read = True
    db.commit()
    return {"status": "ok"}


@router.post("/alerts/read-all")
def mark_all_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict[str, object]:
    db.query(Alert).update({Alert.is_read: True})
    db.commit()
    return {"status": "ok"}
