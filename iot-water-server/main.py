from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from mqtt_handler import MQTTHandler

app = FastAPI(title="IoT Water Pump System")
mqtt_handler = MQTTHandler()

# เชื่อมต่อ MQTT ด้วยค่าจาก environment variable หากมี
mqtt_broker = "localhost"
mqtt_port = 1883
mqtt_user = None
mqtt_pass = None

import os
if os.getenv("MQTT_BROKER"):
    mqtt_broker = os.getenv("MQTT_BROKER")
if os.getenv("MQTT_PORT"):
    try:
        mqtt_port = int(os.getenv("MQTT_PORT"))
    except ValueError:
        mqtt_port = 1883
if os.getenv("MQTT_USER") and os.getenv("MQTT_PASS"):
    mqtt_user = os.getenv("MQTT_USER")
    mqtt_pass = os.getenv("MQTT_PASS")
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