# Lora API Documentation

## Endpoint

**POST** `/lora`

Endpoint ini digunakan untuk menerima dan menyimpan data sensor dari perangkat LoRa ke database berdasarkan jenis microcontroller (micro 1, 2, atau 3) dan mannequin id.

---

## Request

### Headers
- `Content-Type: application/json`

### Query Parameters
- `micro` (string, optional): Jenis microcontroller yang mengirim data (`1`, `2`, atau `3`).
- `mid` (integer, optional): ID mannequin. Default: 1.

### Body
Payload dapat bervariasi tergantung pada jenis microcontroller. Data utama diambil dari salah satu dari:
- `uplink_message.decoded_payload`
- `object.uplink_message.decoded_payload`
- `object`
- `decoded_payload`

Contoh struktur body:
```json
{
  "uplink_message": {
    "decoded_payload": {
      "micro": "1",
      "mid": 2,
      "mpuData": { ... },
      "bmeData": { ... },
      "soundData1": { ... },
      "soundData2": { ... }
    }
  }
}
```

---

## Response

### Success
- **Status:** 200 OK
- **Body:**
```json
{
  "status": "ok",
  "message": "success to store lora data",
  "data": { ... }
}
```

### Error
- **Status:** 400/404/500
- **Body:**
```json
{
  "status": "failed",
  "message": "Error message"
}
```

---

## Penjelasan micro

### micro = "1"
- Data yang diterima: `bmeData`, `mpuData`, `soundData1`, `soundData2`
- Data yang disimpan: BME, MPU, KY (sound)

### micro = "2"
- Data yang diterima: `adxlRightData`, `adxlLeftData`, `lidarData`, `mpu6050Data`, `mqData`, `mqData2`
- Data yang disimpan: ADXL (kanan & kiri), Lidar, MPU, MQ

### micro = "3"
- Data yang diterima: `fsr1Data` sampai `fsr8Data`
- Data yang disimpan: FSR (1-8)

---

## Validasi
- Jika `mid` (mannequin id) > 1, dicek ke database. Jika tidak ditemukan, akan mengembalikan error 404.
- Jika parameter `micro` tidak valid (kosong atau > 3), akan mengembalikan error 400.
- Jika payload kosong, akan mengembalikan error 400.

---

## Contoh Request

### micro 1
```json
{
  "uplink_message": {
    "decoded_payload": {
      "micro": "1",
      "mid": 2,
      "mpuData": { "temperature": 25, "x_acceleration": 0.1 },
      "bmeData": { "temperature": 24, "humidity": 60 },
      "soundData1": { "value": 100 },
      "soundData2": { "value": 120 }
    }
  }
}
```

### micro 2
```json
{
  "uplink_message": {
    "decoded_payload": {
      "micro": "2",
      "mid": 2,
      "adxlRightData": { "x_axis": 1, "y_axis": 2, "z_axis": 3 },
      "adxlLeftData": { "x_axis": 4, "y_axis": 5, "z_axis": 6 },
      "lidarData": { "distance": 100 },
      "mpu6050Data": { "temperature": 26 },
      "mqData": { "value": 200 },
      "mqData2": { "value": 210 }
    }
  }
}
```

### micro 3
```json
{
  "uplink_message": {
    "decoded_payload": {
      "micro": "3",
      "mid": 2,
      "fsr1Data": { "value": 10 },
      "fsr2Data": { "value": 20 },
      "fsr3Data": { "value": 30 },
      "fsr4Data": { "value": 40 },
      "fsr5Data": { "value": 50 },
      "fsr6Data": { "value": 60 },
      "fsr7Data": { "value": 70 },
      "fsr8Data": { "value": 80 }
    }
  }
}
```

---

## Catatan
- Endpoint ini digunakan oleh perangkat LoRa untuk mengirimkan data sensor ke server.
- Data yang diterima akan disimpan ke database sesuai dengan jenis microcontroller dan mannequin id.
- Pastikan payload dan parameter sesuai agar data dapat diproses dengan benar.
