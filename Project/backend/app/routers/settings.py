from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user, get_db
from app.models import SystemSetting, Threshold, User
from app.schemas import SettingsPayload, ThresholdItem

router = APIRouter()


@router.get("/settings")
def get_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict[str, object]:
    entry = db.query(SystemSetting).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Settings not found")
    return {
        "theme_mode": entry.theme_mode,
        "language": entry.language,
        "refresh_rate_s": entry.refresh_rate_s,
        "alert_sound": entry.alert_sound,
        "email_alert": entry.email_alert,
    }


@router.put("/settings")
def update_settings(payload: SettingsPayload, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict[str, object]:
    entry = db.query(SystemSetting).first()
    if not entry:
        entry = SystemSetting()
        db.add(entry)
    entry.theme_mode = payload.theme_mode
    entry.language = payload.language
    entry.refresh_rate_s = payload.refresh_rate_s
    entry.alert_sound = payload.alert_sound
    entry.email_alert = payload.email_alert
    db.commit()
    return {"status": "ok"}


@router.get("/thresholds", response_model=list[ThresholdItem])
def get_thresholds(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[ThresholdItem]:
    rows = db.query(Threshold).all()
    return [ThresholdItem(parameter=row.parameter, min_value=float(row.min_value), max_value=float(row.max_value)) for row in rows]


@router.put("/thresholds")
def update_thresholds(payload: list[ThresholdItem], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict[str, object]:
    for item in payload:
        row = db.query(Threshold).filter(Threshold.parameter == item.parameter).first()
        if not row:
            row = Threshold(parameter=item.parameter)
            db.add(row)
        row.min_value = item.min_value
        row.max_value = item.max_value
    db.commit()
    return {"status": "ok"}
