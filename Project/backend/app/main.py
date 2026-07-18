from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import get_current_user
from app.config import CORS_ORIGINS
from app.database import init_db
from app.routers.alerts import router as alerts_router
from app.routers.auth import router as auth_router
from app.routers.dashboard import router as dashboard_router
from app.routers.history import router as history_router
from app.routers.pump import router as pump_router
from app.routers.settings import router as settings_router
from app.routers.trees import router as trees_router
from app.routers.zones import router as zones_router
from app.seed import seed_database

app = FastAPI(title="SensorHub", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS.split(",") if CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    init_db()
    seed_database()


app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(dashboard_router, prefix="/api", tags=["dashboard"])
app.include_router(zones_router, prefix="/api", tags=["zones"])
app.include_router(trees_router, prefix="/api", tags=["trees"])
app.include_router(pump_router, prefix="/api", tags=["pump"])
app.include_router(alerts_router, prefix="/api", tags=["alerts"])
app.include_router(history_router, prefix="/api", tags=["history"])
app.include_router(settings_router, prefix="/api", tags=["settings"])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
