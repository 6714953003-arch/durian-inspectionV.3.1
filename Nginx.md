ติดตั้ง Nginx บน Ubuntu Server
# ติดตั้ง Nginx
sudo apt update
sudo apt install nginx -y

# วางไฟล์ HTML
sudo nano /var/www/html/index.html
# วาง HTML ด้านบนลงไป แล้วกด Ctrl+O, Enter, Ctrl+X

# เริ่ม Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# เช็คสถานะ
sudo systemctl status nginx

เปิด port บน Oracle VM (ต้องทำทั้ง 2 ที่)
# Ubuntu firewall
sudo ufw allow 80
sudo ufw allow 443

# Oracle Cloud Console
# ไปที่ VCN → Security List → Ingress Rules
# เพิ่ม port 80 (TCP) และ 443 (TCP) จาก 0.0.0.0/0

ขั้นตอนการใช้งาน

1.Upload โค้ด ESP8266 ใหม่ → เปิด Serial Monitor จด IP เช่น 192.168.1.42
2.แก้บรรทัดนี้ใน HTML ก่อนวางบน Ubuntu

# bash
const ESP_IP = "http://192.168.1.42:8080";

3.วางไฟล์ HTML บน Ubuntu ตาม path /var/www/html/index.html
4.เปิดเบราว์เซอร์ไปที่ IP ของ Ubuntu Server
5.หน้าเว็บจะโหลด HTML จาก Ubuntu แต่ปุ่มจะ fetch ไปหา ESP8266 ในวงแลน

⚠️ มือถือและ ESP8266 ต้องอยู่ใน WiFi วงแลนเดียวกัน ถึงจะ fetch ข้าม IP ได้ครับ ถ้าต้องการให้เปิดจากนอกบ้านได้ด้วย ต้องทำ VPN หรือ port forward เพิ่มเติม

# bash run-webapp
sudo python3 -m http.server 80 --directory /var/www/html

python3 -m http.server 8000 --directory /var/www/html >/tmp/web-test.log 2>&1 & sleep 1 && curl -I http://127.0.0.1:8000/index.html


