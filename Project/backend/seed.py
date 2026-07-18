from app.database import SessionLocal, init_db
from app.models import Alert, LoginHistory, PumpCommand, SystemSetting, Threshold, Tree, TreeLatestReading, User, Zone
from app.auth import get_password_hash


def seed_database() -> None:
    init_db()
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            admin = User(username="admin", email="admin@sensorhub.io", password_hash=get_password_hash("Admin@1234"), role="admin")
            db.add(admin)
            db.flush()
            db.add(LoginHistory(user_id=admin.id, username=admin.username, email=admin.email, action="login", status="success", ip_address="127.0.0.1", device="seed"))

        if db.query(Zone).count() == 0:
            zones = [Zone(name="Zone 1"), Zone(name="Zone 2"), Zone(name="Zone 3")]
            db.add_all(zones)
            db.flush()
            trees = [
                Tree(zone_id=zones[0].id, name="ต้นที่ 1", device_id="tree-001", online=True),
                Tree(zone_id=zones[0].id, name="ต้นที่ 2", device_id="tree-002", online=True),
                Tree(zone_id=zones[0].id, name="ต้นที่ 3", device_id="tree-003", online=True),
                Tree(zone_id=zones[1].id, name="ต้นที่ 4", device_id="tree-004", online=True),
                Tree(zone_id=zones[1].id, name="ต้นที่ 5", device_id="tree-005", online=True),
                Tree(zone_id=zones[1].id, name="ต้นที่ 6", device_id="tree-006", online=True),
                Tree(zone_id=zones[2].id, name="ต้นที่ 7", device_id="tree-007", online=True),
                Tree(zone_id=zones[2].id, name="ต้นที่ 8", device_id="tree-008", online=True),
                Tree(zone_id=zones[2].id, name="ต้นที่ 9", device_id="tree-009", online=True),
                Tree(zone_id=zones[2].id, name="ต้นที่ 10", device_id="tree-010", online=True),
            ]
            db.add_all(trees)
            db.flush()
            for index, tree in enumerate(trees, start=1):
                reading = TreeLatestReading(
                    tree_id=tree.id,
                    temperature=28.4 + index * 0.2,
                    humidity=70 - index * 1.5,
                    light=4000 + index * 100,
                    soil_moisture=65.0,
                    ph=6.2,
                    temp_status="normal",
                    humid_status="normal",
                    light_status="normal",
                    pump_on=False,
                    pump_mode="auto",
                )
                db.add(reading)

        if db.query(Threshold).count() == 0:
            db.add_all([
                Threshold(parameter="temperature", min_value=25, max_value=32),
                Threshold(parameter="humidity", min_value=60, max_value=80),
                Threshold(parameter="light", min_value=3000, max_value=8000),
            ])

        if db.query(SystemSetting).count() == 0:
            db.add(SystemSetting(theme_mode="dark", language="th", refresh_rate_s=5, alert_sound=True, email_alert=True))

        if db.query(Alert).count() == 0:
            db.add(Alert(tree_id=1, zone_id=1, type="info", message="Seeded data initialized", is_read=False))

        if db.query(PumpCommand).count() == 0:
            db.add(PumpCommand(tree_id=1, zone_id=1, mode="auto"))

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
    print("Seed complete")
