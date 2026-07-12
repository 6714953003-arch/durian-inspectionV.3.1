ติดตั้ง
pip install -r requirements.txt

วิธีรันเซิร์ฟเวอร์
สร้างไฟล์ run.sh
#!/bin/bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

รันด้วย:
chmod +x run.sh
./run.sh

หรือรันด้วยคำสั่ง:
uvicorn main:app --host 0.0.0.0 --port 8000

การเข้าถึง
Dashboard: http://YOUR_SERVER_IP:8000
API Status: http://YOUR_SERVER_IP:8000/api/status

