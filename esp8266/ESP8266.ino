/*
  ESP8266 MQTT example for Project-iot
  - Connects to WiFi
  - Publishes sensor readings (DHT + analog soil) as JSON to MQTT
  - Subscribes to pump control topics and publishes pump status

  Wiring (example):
  - DHT22 data -> D2 (GPIO4)
  - Soil analog -> A0
  - Pump control (simulated) -> D1 (GPIO5) (use a relay module between pin and pump)

  Required libraries:
  - ESP8266 board support (Arduino IDE / PlatformIO)
  - PubSubClient
  - DHT sensor library (by Adafruit)
  - ArduinoJson (optional but used here)

  Topics used (configurable):
  - Publish readings: sensors/<device_id>/reading
  - Subscribe control: pump/+/control  (e.g., pump/zone1/control)
  - Publish pump status: pump/status
*/

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ====== CONFIG ======
// Replace with your WiFi credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

// MQTT broker (match your Project-iot broker)
// For this environment the broker is reachable at 10.0.3.249.
// If you run Mosquitto on another machine or network, replace this with that host IP.
const char* MQTT_BROKER = "10.0.3.249";
const uint16_t MQTT_PORT = 1883;
const char* MQTT_USER = ""; // set if needed
const char* MQTT_PASS = ""; // set if needed

// Unique device id (use MAC or custom id)
String deviceId;

// Topics
String topic_reading; // sensors/<deviceId>/reading
const char* topic_sub_control = "pump/+/control"; // wildcard subscription
const char* topic_pump_status = "pump/status";

// Pins
// Use raw GPIO numbers for compatibility with ESP8266 boards.
// NodeMCU D2 = GPIO4, D1 = GPIO5.
#define DHTPIN 4
#define DHTTYPE DHT22
#define SOIL_PIN A0
#define PUMP_PIN 5

// Timings
const unsigned long PUBLISH_INTERVAL_MS = 10000; // 10s

DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastPublish = 0;

void connectWiFi() {
  Serial.printf("Connecting to %s\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print('.');
    if (++tries > 60) break; // give up after ~30s
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("WiFi connected, IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("WiFi connect failed");
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  // Payload is not null-terminated
  String t = String(topic);
  Serial.print("MQTT message on topic: "); Serial.println(t);

  String msg;
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];
  Serial.print("Payload: "); Serial.println(msg);

  // Simple handling: look for "on" or "off" in payload
  if (msg.indexOf("on") >= 0 || msg.indexOf("1") >= 0) {
    digitalWrite(PUMP_PIN, HIGH);
    publishPumpStatus(true);
  } else if (msg.indexOf("off") >= 0 || msg.indexOf("0") >= 0) {
    digitalWrite(PUMP_PIN, LOW);
    publishPumpStatus(false);
  }
}

void publishPumpStatus(bool on) {
  StaticJsonDocument<200> doc;
  doc["deviceId"] = deviceId;
  doc["state"] = on ? "on" : "off";
  doc["timestamp"] = millis();
  char buffer[256];
  size_t n = serializeJson(doc, buffer);
  client.publish(topic_pump_status, buffer, n);
  Serial.print("Published pump status: "); Serial.println(buffer);
}

void connectMQTT() {
  if (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    String clientId = "esp8266-" + deviceId;
    if (client.connect(clientId.c_str(), MQTT_USER, MQTT_PASS)) {
      Serial.println("connected");
      // Subscribe to control topics
      client.subscribe(topic_sub_control);
      // Publish initial pump status
      publishPumpStatus(digitalRead(PUMP_PIN) == HIGH);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5s");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(100);

  // derive deviceId from MAC
  uint8_t mac[6];
  WiFi.macAddress(mac);
  char macStr[13];
  sprintf(macStr, "%02X%02X%02X%02X%02X%02X", mac[0],mac[1],mac[2],mac[3],mac[4],mac[5]);
  deviceId = String(macStr);
  topic_reading = "sensors/" + deviceId + String("/reading");

  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW);

  dht.begin();

  connectWiFi();

  client.setServer(MQTT_BROKER, MQTT_PORT);
  client.setCallback(mqttCallback);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  if (!client.connected()) {
    connectMQTT();
  }
  client.loop();

  unsigned long now = millis();
  if (now - lastPublish >= PUBLISH_INTERVAL_MS) {
    lastPublish = now;

    float temp = dht.readTemperature();
    float hum = dht.readHumidity();
    int soil = analogRead(SOIL_PIN);

    if (isnan(temp) || isnan(hum)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }

    StaticJsonDocument<256> doc;
    doc["deviceId"] = deviceId;
    doc["temperature"] = temp;
    doc["humidity"] = hum;
    doc["soil_moisture_raw"] = soil;
    doc["pump_state"] = (digitalRead(PUMP_PIN) == HIGH) ? "on" : "off";
    doc["timestamp"] = now;

    char payload[512];
    size_t len = serializeJson(doc, payload);
    client.publish(topic_reading.c_str(), payload, len);

    Serial.print("Published reading to "); Serial.println(topic_reading);
    Serial.println(payload);
  }
}
