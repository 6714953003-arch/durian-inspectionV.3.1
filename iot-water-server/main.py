from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from mqtt_handler import MQTTHandler

app = FastAPI(title="IoT Water Pump System")
mqtt_handler = MQTTHandler()

import os
mqtt_broker = os.getenv("MQTT_BROKER", "localhost")
try:
    mqtt_port = int(os.getenv("MQTT_PORT", "1883"))
except ValueError:
    mqtt_port = 1883
mqtt_user = os.getenv("MQTT_USER")
mqtt_pass = os.getenv("MQTT_PASS")

try:
    # Prefer local file if present
    import mqtt_local
    mqtt_broker = getattr(mqtt_local, "MQTT_BROKER", mqtt_broker)
    mqtt_port = getattr(mqtt_local, "MQTT_PORT", mqtt_port)
    mqtt_user = getattr(mqtt_local, "MQTT_USER", mqtt_user)
    mqtt_pass = getattr(mqtt_local, "MQTT_PASS", mqtt_pass)
    # If mqtt_local exposes an apply_to(handler) helper, call it
    if hasattr(mqtt_local, "apply_to"):
        try:
            mqtt_local.apply_to(mqtt_handler)
        except Exception:
            pass
except Exception:
    pass

if mqtt_user and mqtt_pass:
    mqtt_handler.set_credentials(mqtt_user, mqtt_pass)

print(f"Connecting MQTT broker={mqtt_broker} port={mqtt_port} user={mqtt_user}")
mqtt_handler.connect(mqtt_broker, mqtt_port)

@app.get("/")
async def dashboard():
    with open("dashboard.html", "r", encoding="utf-8") as f:
        return HTMLResponse(f.read())

@app.get("/api/status")
async def get_status():
    data = mqtt_handler.get_latest_data()
    data_copy = data.copy()
    data_copy['mqtt_connected'] = mqtt_handler.is_connected()
    return data_copy


@app.get("/api/mqtt-status")
async def mqtt_status():
    return {"connected": mqtt_handler.is_connected()}

@app.post("/api/pump/{action}")
async def control_pump(action: str):
    if action == "on":
        mqtt_handler.publish("pump/control", "ON")
    elif action == "off":
        mqtt_handler.publish("pump/control", "OFF")
    return {"status": "success"}

@app.post("/api/mode/{mode}")
async def set_mode(mode: str):
    mqtt_handler.publish("pump/mode", mode.upper())
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)