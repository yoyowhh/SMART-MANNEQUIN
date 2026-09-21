# SMART - Unified Web Application & Sensor Dashboard

Workspace ini menggabungkan seluruh fungsionalitas sensor **Smart Mannequin** dan **Smart Skin** ke dalam **1 Website Frontend tunggal (React)** dan **1 Backend tunggal (Express.js + MySQL)**.

---

## 🚀 Cara Menjalankan (1 Perintah)

Jalankan perintah berikut di root folder `SMART`:

```bash
npm run dev
```

Perintah ini akan menyalakan 2 service secara otomatis:
- **Frontend Web** (React / Vite) pada `http://localhost:5173`
- **Backend API & WebSocket** (Express.js) pada `http://localhost:4013`

---

## 🌐 Akses Website

Buka browser dan akses:

| Menu | URL di Browser | Keterangan |
| :--- | :--- | :--- |
| **Dashboard Utama** | [http://localhost:5173/](http://localhost:5173/) | Halaman sambutan & navigasi menu |
| **Dashboard SmartSkin** | [http://localhost:5173/1/sensor/smartskin](http://localhost:5173/1/sensor/smartskin) | Dashboard Real-time Smart Skin (Suhu, FSR, Piezo, Flex, Anatomi Hotspot, & Log Riwayat Sensor) |
| **Sensor Mannequin Lainnya** | [http://localhost:5173/1/sensor/sound](http://localhost:5173/1/sensor/sound) | Sound, Gas, Lidar, Camera, MPU, ADXL, BME, Loadcell |

---

## 📡 Simulasi Data Real-Time

Untuk menguji aliran data sensor secara langsung tanpa perangkat keras:

```bash
# Menjalankan simulasi SELURUH sensor sekaligus (Smart Skin, LoRa Mannequin, & Load Cell):
npm run simulate:all

# Atau menjalankan simulasi per kelompok:
npm run simulate:smartskin
npm run simulate:lora
```

---

## 📁 Struktur Direktori

```text
SMART/
├── package.json                         # Runner tunggal untuk FE dan BE
├── README.md                            # Dokumentasi workspace
├── .gitignore                           # Git ignore
│
└── smart-mannequin/                     # Aplikasi Terintegrasi
    ├── frontend/                        # React + Vite (Port 5173)
    └── backend/                         # Express.js + Socket.io + MySQL (Port 4013)
```

---

## 🛠️ Pilihan Perintah Lainnya

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan Frontend & Backend bersamaan |
| `npm run dev:fe` | Hanya menjalankan Frontend (port 5173) |
| `npm run dev:be` | Hanya menjalankan Backend (port 4013) |
| `npm run install:all` | Instalasi dependensi FE dan BE |
| `npm run simulate:smartskin` | Simulator data sensor Smart Skin |
| `npm run simulate:lora` | Simulator LoRa Mannequin |
