from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user, get_db
from app.models import Tree, TreeLatestReading, User, Zone
from app.schemas import DashboardSummary, TreeSummary, ZoneSummary

router = APIRouter()


@router.get("/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> DashboardSummary:
    trees = db.query(Tree).all()
    zones = db.query(Zone).all()
    latest = {item.tree_id: item for item in db.query(TreeLatestReading).all()}
    tree_count = len(trees)
    zone_count = len(zones)
    values = [latest.get(tree.id) for tree in trees]
    temps = [float(item.temperature or 0) for item in values]
    humids = [float(item.humidity or 0) for item in values]
    lights = [float(item.light or 0) for item in values]
    return DashboardSummary(
        treeCount=tree_count,
        zoneCount=zone_count,
        tempMin=min(temps) if temps else 0,
        tempMax=max(temps) if temps else 0,
        tempAvg=sum(temps) / len(temps) if temps else 0,
        humidMin=min(humids) if humids else 0,
        humidMax=max(humids) if humids else 0,
        humidAvg=sum(humids) / len(humids) if humids else 0,
        lightMin=min(lights) if lights else 0,
        lightMax=max(lights) if lights else 0,
        lightAvg=sum(lights) / len(lights) if lights else 0,
    )


@router.get("/zones", response_model=list[ZoneSummary])
def zones(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[ZoneSummary]:
    zones_db = db.query(Zone).all()
    result: list[ZoneSummary] = []
    for zone in zones_db:
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
        result.append(ZoneSummary(id=zone.id, name=zone.name, trees=trees))
    return result


@router.get("/trees", response_model=list[TreeSummary])
def trees(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[TreeSummary]:
    items = db.query(Tree).all()
    result = []
    for tree in items:
        latest = db.query(TreeLatestReading).filter(TreeLatestReading.tree_id == tree.id).first()
        result.append(TreeSummary(
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
    return result
