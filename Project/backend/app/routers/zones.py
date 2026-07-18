from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user, get_db
from app.models import TreeLatestReading, User, Zone
from app.schemas import TreeSummary, ZoneSummary

router = APIRouter()


@router.get("/zones/{zone_id}", response_model=ZoneSummary)
def get_zone(zone_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> ZoneSummary:
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    trees = []
    for tree in zone.trees:
        latest = db.query(TreeLatestReading).filter(TreeLatestReading.tree_id == tree.id).first()
        trees.append(TreeSummary(
            id=tree.id,
            name=tree.name,
            zoneId=tree.zone_id,
            temperature=float(latest.temperature or 0) if latest else 0,
            humidity=float(latest.humidity or 0) if latest else 0,
            light=float(latest.light or 0) if latest else 0,
            tempStatus=latest.temp_status if latest else "normal",
            humidStatus=latest.humid_status if latest else "normal",
            lightStatus=latest.light_status if latest else "normal",
            online=tree.online,
            pumpOn=bool(latest.pump_on) if latest else False,
            pumpMode=latest.pump_mode if latest else "auto",
            lastUpdated=latest.updated_at.isoformat() if latest and latest.updated_at else "now",
        ))
    return ZoneSummary(id=zone.id, name=zone.name, trees=trees)
