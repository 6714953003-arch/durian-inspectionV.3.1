"""
Seed database with initial data for development and testing.
Creates:
  - 1 admin user (username: admin, password: Admin@1234)
  - 3 zones
  - 10 trees (matching mockData.ts)
  - Initial thresholds
  - System settings
"""

from __future__ import annotations

from datetime import datetime

from app.auth import get_password_hash
from app.database import SessionLocal
from app.models import (
    Alert,
    PumpCommand,
    SensorReading,
    SystemSetting,
    Threshold,
    Tree,
    TreeLatestReading,
    User,
    Zone,
)


def seed_database() -> None:
    """Seed the database with initial data if not already present."""
    session = SessionLocal()
    try:
        # Check if already seeded
        if session.query(User).count() > 0:
            return

        # Create admin user
        admin = User(
            username="admin",
            email="admin@example.com",
            password_hash=get_password_hash("Admin@1234"),
            role="admin",
        )
        session.add(admin)
        session.flush()

        # Create zones
        zones = [
            Zone(name="Zone 1"),
            Zone(name="Zone 2"),
            Zone(name="Zone 3"),
        ]
        session.add_all(zones)
        session.flush()

        # Create trees (matching mockData.ts)
        trees_data = [
            # Zone 1
            {"name": "ต้นที่ 1", "zone_id": zones[0].id, "device_id": "sensor_001"},
            {"name": "ต้นที่ 2", "zone_id": zones[0].id, "device_id": "sensor_002"},
            {"name": "ต้นที่ 3", "zone_id": zones[0].id, "device_id": "sensor_003"},
            # Zone 2
            {"name": "ต้นที่ 4", "zone_id": zones[1].id, "device_id": "sensor_004"},
            {"name": "ต้นที่ 5", "zone_id": zones[1].id, "device_id": "sensor_005"},
            {"name": "ต้นที่ 6", "zone_id": zones[1].id, "device_id": "sensor_006"},
            # Zone 3
            {"name": "ต้นที่ 7", "zone_id": zones[2].id, "device_id": "sensor_007"},
            {"name": "ต้นที่ 8", "zone_id": zones[2].id, "device_id": "sensor_008"},
            {"name": "ต้นที่ 9", "zone_id": zones[2].id, "device_id": "sensor_009"},
            {"name": "ต้นที่ 10", "zone_id": zones[2].id, "device_id": "sensor_010"},
        ]

        trees = [Tree(**tree_data, online=True) for tree_data in trees_data]
        session.add_all(trees)
        session.flush()

        # Create tree latest readings
        readings = [
            TreeLatestReading(
                tree_id=trees[0].id,
                temperature=28.4,
                humidity=72,
                light=450.0,
                soil_moisture=65.5,
                ph=6.8,
                temp_status="normal",
                humid_status="warning",
                pump_on=False,
                pump_mode="auto",
            ),
            TreeLatestReading(
                tree_id=trees[1].id,
                temperature=29.1,
                humidity=68,
                light=480.0,
                soil_moisture=70.2,
                ph=6.9,
                temp_status="normal",
                humid_status="normal",
                pump_on=False,
                pump_mode="off",
            ),
            TreeLatestReading(
                tree_id=trees[2].id,
                temperature=31.2,
                humidity=75,
                light=520.0,
                soil_moisture=55.0,
                ph=6.7,
                temp_status="warning",
                humid_status="warning",
                pump_on=True,
                pump_mode="on",
            ),
            TreeLatestReading(
                tree_id=trees[3].id,
                temperature=27.8,
                humidity=65,
                light=410.0,
                soil_moisture=68.0,
                ph=7.0,
                temp_status="normal",
                humid_status="normal",
                pump_on=False,
                pump_mode="auto",
            ),
            TreeLatestReading(
                tree_id=trees[4].id,
                temperature=33.5,
                humidity=58,
                light=510.0,
                soil_moisture=45.5,
                ph=6.5,
                temp_status="warning",
                humid_status="normal",
                pump_on=True,
                pump_mode="on",
            ),
            TreeLatestReading(
                tree_id=trees[5].id,
                temperature=29.9,
                humidity=70,
                light=490.0,
                soil_moisture=62.0,
                ph=6.8,
                temp_status="normal",
                humid_status="normal",
                pump_on=False,
                pump_mode="auto",
            ),
            TreeLatestReading(
                tree_id=trees[6].id,
                temperature=36.8,
                humidity=85,
                light=580.0,
                soil_moisture=78.5,
                ph=6.6,
                temp_status="critical",
                humid_status="critical",
                pump_on=True,
                pump_mode="on",
            ),
            TreeLatestReading(
                tree_id=trees[7].id,
                temperature=30.2,
                humidity=63,
                light=450.0,
                soil_moisture=58.0,
                ph=7.1,
                temp_status="normal",
                humid_status="normal",
                pump_on=False,
                pump_mode="off",
            ),
            TreeLatestReading(
                tree_id=trees[8].id,
                temperature=34.1,
                humidity=61,
                light=500.0,
                soil_moisture=50.5,
                ph=6.7,
                temp_status="warning",
                humid_status="normal",
                pump_on=False,
                pump_mode="auto",
            ),
            TreeLatestReading(
                tree_id=trees[9].id,
                temperature=28.7,
                humidity=69,
                light=470.0,
                soil_moisture=64.0,
                ph=6.9,
                temp_status="normal",
                humid_status="normal",
                pump_on=False,
                pump_mode="off",
            ),
        ]
        session.add_all(readings)

        # Create thresholds
        thresholds = [
            Threshold(parameter="temperature", min_value=15.0, max_value=35.0),
            Threshold(parameter="humidity", min_value=30.0, max_value=90.0),
            Threshold(parameter="light", min_value=200.0, max_value=1000.0),
            Threshold(parameter="soil_moisture", min_value=40.0, max_value=80.0),
            Threshold(parameter="ph", min_value=6.0, max_value=7.5),
        ]
        session.add_all(thresholds)

        # Create system settings
        settings = SystemSetting(
            theme_mode="dark",
            language="th",
            refresh_rate_s=5,
            alert_sound=True,
            email_alert=True,
        )
        session.add(settings)

        session.commit()
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()
