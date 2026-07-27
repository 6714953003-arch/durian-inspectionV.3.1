import os

from fastapi.testclient import TestClient

os.environ.setdefault("DB_URL", "sqlite:///./test_sensorhub.db")
os.environ.setdefault("JWT_SECRET", "test-secret-value-for-ci")
os.environ.setdefault("DEFAULT_ADMIN_PASSWORD", "Admin@1234")

from app.database import init_db
from app.main import app
from app.seed import seed_database

# Initialize database before creating test client
init_db()
seed_database()

client = TestClient(app)


def test_login_and_dashboard_auth():
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "Admin@1234"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["access_token"]
    assert body["user"]["username"] == "admin"

    dashboard = client.get(
        "/api/dashboard/summary",
        headers={"Authorization": f"Bearer {body['access_token']}"},
    )
    assert dashboard.status_code == 200
    payload = dashboard.json()
    assert payload["treeCount"] >= 1
    assert payload["zoneCount"] >= 1


def test_dashboard_requires_auth():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 401
