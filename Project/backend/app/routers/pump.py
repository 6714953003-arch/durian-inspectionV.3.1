from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user, get_db
from app.models import Tree, TreeLatestReading, User
from app.schemas import TreeSummary

router = APIRouter()


@router.post("/trees/{tree_id}/pump")
def set_tree_pump(tree_id: int, payload: dict[str, str], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict[str, object]:
    tree = db.query(Tree).filter(Tree.id == tree_id).first()
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")
    latest = db.query(TreeLatestReading).filter(TreeLatestReading.tree_id == tree.id).first()
    if not latest:
        latest = TreeLatestReading(tree_id=tree.id)
        db.add(latest)
    latest.pump_mode = payload.get("mode", "auto")
    latest.pump_on = payload.get("mode") == "on"
    db.commit()
    return {"status": "ok", "mode": latest.pump_mode}


@router.post("/zones/{zone_id}/pump")
def set_zone_pump(zone_id: int, payload: dict[str, str], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict[str, object]:
    trees = db.query(Tree).filter(Tree.zone_id == zone_id).all()
    if not trees:
        raise HTTPException(status_code=404, detail="Zone not found")
    for tree in trees:
        latest = db.query(TreeLatestReading).filter(TreeLatestReading.tree_id == tree.id).first()
        if not latest:
            latest = TreeLatestReading(tree_id=tree.id)
            db.add(latest)
        latest.pump_mode = payload.get("mode", "auto")
        latest.pump_on = payload.get("mode") == "on"
    db.commit()
    return {"status": "ok", "zone_id": zone_id, "mode": payload.get("mode", "auto")}
