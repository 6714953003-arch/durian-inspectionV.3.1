App
├── LoginPage
└── AuthenticatedLayout
    ├── Sidebar (เมนูซ้าย: Dashboard / Zones / Settings / History)
    ├── Topbar (user info, logout)
    └── Pages
        ├── DashboardPage
        │   ├── StatCard (ความชื้นเฉลี่ยรวม)
        │   ├── StatCard (จำนวนโซนที่กำลังรดน้ำ)
        │   └── StatCard (อุณหภูมิ/ความชื้นอากาศเฉลี่ย)
        ├── ZoneListPage
        │   └── ZoneCard[] (การ์ดต่อโซน: ชื่อ, ค่าความชื้นล่าสุด, สถานะปั๊ม, ปุ่ม "ดูรายละเอียด")
        ├── ZoneDetailPage
        │   ├── LiveChart (ความชื้นดิน + อุณหภูมิ, อัปเดตทุก 5 วิ)
        │   ├── StatusCard (สถานะปั๊ม: เปิด/ปิด)
        │   └── ManualControlCard (ปุ่ม override เปิด/ปิดปั๊ม, ตั้งค่า threshold)
        ├── HistoryPage
        │   ├── DateRangePicker
        │   ├── CompareLineChart (เทียบ 2 โซน)
        │   └── ExportButton (CSV/PNG)
        └── SettingsPage (จัดการโซน, ผู้ใช้)