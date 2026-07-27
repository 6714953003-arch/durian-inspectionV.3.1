ESP8266 Integration สำหรับ Project-iot (เอกสารภาษาไทย)

โฟลเดอร์นี้มีตัวอย่างสเก็ตช์ Arduino สำหรับ ESP8266 ที่เชื่อมต่อกับระบบ Project-iot โดย:

- อ่านค่าเซนเซอร์ DHT22 (อุณหภูมิ/ความชื้น) และเซนเซอร์ความชื้นดินแบบอะนาล็อก
- ส่งค่าที่อ่านได้เป็น JSON ไปยัง MQTT broker
- สมัครรับคำสั่งควบคุมปั๊มผ่าน topic และส่งสถานะปั๊มกลับไปยัง broker

ไฟล์ในโฟลเดอร์นี้
- `ESP8266.ino` — สเก็ตช์ตัวอย่าง (DHT22 + Soil analog + MQTT)

ความต้องการ (Requirements)
- Arduino IDE หรือ PlatformIO
- บอร์ด: ESP8266 (เช่น NodeMCU, Wemos D1)
- ไลบรารีที่ต้องติดตั้ง:
  - `PubSubClient` (สำหรับ MQTT)
  - `DHT sensor library` (ของ Adafruit)
  - `ArduinoJson` (สำหรับจัดการ JSON)

การต่อสาย (ตัวอย่าง)
- DHT22 data -> D2 (GPIO4)
- Soil analog -> A0
- Pump control (relay) -> D1 (GPIO5)  (ใช้รีเลย์ที่มี optoisolation สำหรับปั๊มจริง)

หัวข้อ (MQTT topics)
- ส่งข้อมูล (publish): `sensors/<deviceId>/reading` (JSON)
- สมัครรับคำสั่ง (subscribe): `pump/+/control` (รับ `on`/`off` หรือ `1`/`0`)
- ส่งสถานะปั๊ม: `pump/status`

ตัวอย่าง payload (JSON) สำหรับการอ่านค่า:
```
{
  "deviceId": "A1B2C3D4E5F6",
  "temperature": 31.2,
  "humidity": 72.1,
  "soil_moisture_raw": 512,
  "pump_state": "off",
  "timestamp": 123456789
}
```

วิธีใช้งาน (Upload)

1) Arduino IDE

```text
1. เปิด Arduino IDE
2. ติดตั้งบอร์ด ESP8266 (Boards Manager → esp8266)
3. ติดตั้งไลบรารี: PubSubClient, DHT sensor, ArduinoJson (Library Manager)
4. เปิดไฟล์ `esp8266/ESP8266.ino`
5. แก้ค่า WiFi และ MQTT ที่ส่วนบนของไฟล์
6. เลือกบอร์ด (NodeMCU 1.0) และพอร์ต USB
7. กด Upload
```

2) PlatformIO (แนะนำสำหรับการพัฒนา)

เพิ่มไฟล์ `platformio.ini` ในโฟลเดอร์นี้ (ตัวอย่าง):

```ini
[env:nodemcuv2]
platform = espressif8266
board = nodemcuv2
framework = arduino
monitor_speed = 115200
lib_deps =
  knolleary/PubSubClient
  adafruit/DHT sensor library
  bblanchon/ArduinoJson
```

จากนั้นรันใน Terminal (PlatformIO):
```bash
# คอมไพล์และอัปโหลด
pio run -e nodemcuv2 -t upload

# ดู serial monitor
pio device monitor -e nodemcuv2
```

การตั้งค่าในโค้ด
- แก้ค่า `WIFI_SSID`, `WIFI_PASS`, `MQTT_BROKER`, `MQTT_PORT`, `MQTT_USER`, `MQTT_PASS` ที่ส่วนบนของ `ESP8266.ino`
- ในสภาพแวดล้อมนี้ Mosquitto เปิด `allow_anonymous true` ดังนั้น `MQTT_USER` และ `MQTT_PASS` สามารถเว้นว่างไว้ได้ โดยไม่ต้องใส่ค่า

ข้อควรระวัง (Notes)
- โค้ดตัวอย่างควบคุมปั๊มผ่าน GPIO และรีเลย์เป็นตัวอย่างเท่านั้น — สำหรับการใช้งานจริงให้ใช้โมดูลรีเลย์ที่ออกแบบมาสำหรับโหลดสูงและป้องกันด้วยวงจรแยกไฟฟ้า
- หากต้องการความปลอดภัยในการสื่อสาร ควรตั้งค่า MQTT TLS/SSL และใช้บัญชีผู้ใช้/รหัสผ่านสำหรับ broker
- ปรับ `PUBLISH_INTERVAL_MS` ให้เหมาะสมกับเครือข่ายและการใช้งาน

ต้องการให้ผมสร้าง `platformio.ini` ให้เลยหรือจะให้เพิ่มตัวอย่างการอัปโหลด OTA (over‑the‑air)?


