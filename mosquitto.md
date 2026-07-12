# ติดตั้ง Mosquitto
sudo apt update
sudo apt install mosquitto mosquitto-clients -y

## เปิดใช้งานและตั้งค่าเริ่มต้น
# เปิดบริการอัตโนมัติเมื่อบูตเครื่อง
sudo systemctl enable mosquitto

# เริ่มบริการ
sudo systemctl start mosquitto

# ตรวจสอบสถานะ
sudo systemctl status mosquitto

## ตั้งค่า Mosquitto (แนะนำให้มี Password)
# สร้างไฟล์ config
sudo nano /etc/mosquitto/conf.d/mosquitto.conf

# สร้าง Username และ Password
sudo mosquitto_passwd -c /etc/mosquitto/passwd [your_mqtt_user]
(ระบบจะให้ใส่รหัสผ่าน 2 ครั้ง)

sudo mosquitto_passwd -c /etc/mosquitto/passwd turean
pass=ksyn828354

## รีสตาร์ท Mosquitto
sudo systemctl restart mosquitto
sudo systemctl status mosquitto

## ทดสอบ MQTT Broker
# บน Ubuntu Server เอง:
# Terminal 1: Subscribe
mosquitto_sub -h localhost -p 1883 -u your_mqtt_user -P your_password -t "pump/#" -v

# Terminal 2: Publish (ทดสอบ)
mosquitto_pub -h localhost -p 1883 -u your_mqtt_user -P your_password -t "pump/status" -m "{\"pump_state\":\"ON\"}"

# เปิด Port Firewall (ถ้าเปิด UFW)
sudo ufw allow 1883/tcp
sudo ufw reload

# การตั้งค่าในโค้ด ESP8266
const char* mqtt_server = "IP_ของ_Ubuntu_Server";   // เช่น 192.168.1.100
const char* mqtt_user   = "your_mqtt_user";
const char* mqtt_pass   = "รหัสผ่านที่ตั้งไว้";