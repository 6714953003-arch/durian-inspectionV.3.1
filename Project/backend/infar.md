backend/
├── app/
│   ├── main.py                 # FastAPI app entrypoint, mount routers, startup MQTT client
│   ├── config.py                # โหลด .env ด้วย pydantic-settings
│   ├── database.py               # SQLAlchemy async engine/session
│   ├── models.py                 # SQLAlchemy ORM models (ตาม schema หัวข้อ 4)
│   ├── schemas.py                # Pydantic request/response models
│   ├── auth.py                   # JWT create/verify, password hash, get_current_user dependency
│   ├── mqtt_client.py            # เชื่อมต่อ Mosquitto, subscribe telemetry, publish pump commands
│   ├── websocket_manager.py      # broadcast live data ไปยัง connected clients
│   └── routers/
│       ├── auth.py
│       ├── dashboard.py
│       ├── zones.py
│       ├── trees.py
│       ├── pump.py
│       ├── alerts.py
│       ├── history.py
│       └── settings.py
├── alembic/                      # migration scripts
├── requirements.txt
├── .env.example
└── seed.py                       # สร้างข้อมูลเริ่มต้น (3 zones, 10 trees ตาม mockData.ts)