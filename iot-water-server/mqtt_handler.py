import paho.mqtt.client as mqtt
import json
from datetime import datetime

class MQTTHandler:
    def __init__(self):
        self.client = mqtt.Client()
        self.latest_data = {
            "pump_state": False,
            "auto_mode": True,
            "temperature": 0.0,
            "humidity": 0.0,
            "soil_moisture": [],
            "timestamp": ""
        }
        self._username = None
        self._password = None
        self.connected = False
        self.setup_callbacks()

    def setup_callbacks(self):
        self.client.on_message = self.on_message
        self.client.on_connect = self.on_connect

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print("MQTT Connected (rc=0)")
            self.connected = True
            try:
                self.client.subscribe("pump/status")
            except Exception as e:
                print(f"MQTT subscribe failed: {e}")
        else:
            print(f"MQTT Connect failed with rc={rc}")
            self.connected = False

    def on_message(self, client, userdata, msg):
        try:
            data = json.loads(msg.payload.decode())
            self.latest_data.update(data)
            self.latest_data["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"📡 Received MQTT: {data}")
        except Exception as e:
            print(f"Error parsing MQTT: {e}")

    def connect(self, broker="localhost", port=1883):
        # Apply credentials if provided
        if self._username is not None:
            self.client.username_pw_set(self._username, self._password)
        try:
            self.client.connect(broker, port, 60)
            self.client.loop_start()
        except Exception as e:
            print(f"MQTT connect exception: {e}")

    def publish(self, topic, payload):
        self.client.publish(topic, payload)

    def get_latest_data(self):
        return self.latest_data

    def set_credentials(self, username: str, password: str):
        self._username = username
        self._password = password

    def is_connected(self):
        return bool(self.connected)
