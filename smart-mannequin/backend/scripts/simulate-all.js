// scripts/simulate-all.js
// Simulator Master Terintegrasi: Menjalankan simulasi data real-time untuk SELURUH sensor
// - Smart Skin (Suhu, FSR, Piezo, Flex & Strain Gauge Depan & Belakang di 8 lokasi)
// - Sensor Mannequin LoRa (BME280, MPU6050, ADXL345, Suara KY-038, Gas MQ, Lidar)
// - Sensor Load Cell (Leher 801, Paha Kiri 802, Paha Kanan 803, Kaki Kiri 804, Kaki Kanan 805)

const http = require('http');

const TARGET_PORT = process.env.PORT || 4013;
const INTERVAL_MS = 2500;

// Ambil daftar mannequin ID dari argumen CLI (misal: --mid=1 atau --mid=1,2)
const args = process.argv.slice(2);
const midArg = args.find((a) => a.startsWith('--mid='));
const TARGET_MIDS = midArg ? midArg.split('=')[1].split(',').map(Number) : [1, 2];

console.log('================================================================');
console.log('🚀 MEMULAI SIMULASI SEMUA SENSOR REAL-TIME (ALL-IN-ONE)');
console.log(`📡 Target Backend: http://localhost:${TARGET_PORT}`);
console.log(`⏱️  Interval pengiriman: ${INTERVAL_MS} ms`);
console.log(`🤖 Target Mannequin ID: ${TARGET_MIDS.join(', ')}`);
console.log('================================================================\n');

let step = 0;

function rand(min, max, decimals = 2) {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(decimals));
}

function postJson(path, body) {
  return new Promise((resolve) => {
    const payload = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port: TARGET_PORT,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let resData = '';
        res.on('data', (c) => (resData += c));
        res.on('end', () => resolve({ status: res.statusCode, data: resData }));
      },
    );
    req.on('error', (err) => resolve({ error: err.message }));
    req.write(payload);
    req.end();
  });
}

const FLEX_LOCATIONS = [
  'right shoulder', 'left shoulder',
  'right elbow', 'left elbow',
  'right waist', 'left waist',
  'right knee', 'left knee',
];

const TRIPLE_LOCATIONS = [
  'back', 'left arm', 'right arm', 'left leg', 'right leg',
];

async function simulateCycle() {
  step += 1;
  const t = step;
  const now = new Date().toLocaleTimeString();

  const wave = Math.sin(t / 8);
  const waveFast = Math.sin(t / 3);
  const waveCos = Math.cos(t / 6);

  // 1. SMART SKIN BATCH (Flex & Strain, Temperature, Pressure, Vibration)
  const skinReadings = [];
  FLEX_LOCATIONS.forEach((loc, idx) => {
    const locWave = Math.sin(t / 6 + idx);
    skinReadings.push({
      sensorType: 'flex',
      location: loc,
      sensorNumber: 1,
      side: 'front',
      value: Math.round(52000 + locWave * 22000 + rand(-2000, 2000, 0)),
    });
    skinReadings.push({
      sensorType: 'flex',
      location: loc,
      sensorNumber: 2,
      side: 'back',
      value: Math.round(54000 + locWave * 20000 + rand(-2000, 2000, 0)),
    });
  });

  TRIPLE_LOCATIONS.forEach((loc) => {
    skinReadings.push({
      sensorType: 'temperature',
      location: loc,
      sensorNumber: 1,
      side: 'front',
      value: Number((32.0 + wave * 2.5 + rand(-0.4, 0.4, 2)).toFixed(2)),
    });
    skinReadings.push({
      sensorType: 'temperature',
      location: loc,
      sensorNumber: 2,
      side: 'back',
      value: Number((33.2 + wave * 2.2 + rand(-0.3, 0.5, 2)).toFixed(2)),
    });
    skinReadings.push({
      sensorType: 'pressure',
      location: loc,
      sensorNumber: 1,
      side: 'front',
      value: Number(Math.max(0, 30.0 + waveFast * 18.0 + rand(-3.0, 3.0, 2)).toFixed(2)),
    });
    skinReadings.push({
      sensorType: 'pressure',
      location: loc,
      sensorNumber: 2,
      side: 'back',
      value: Number(Math.max(0, 33.5 + waveFast * 16.0 + rand(-2.5, 3.5, 2)).toFixed(2)),
    });
    skinReadings.push({
      sensorType: 'vibration',
      location: loc,
      sensorNumber: 1,
      side: 'front',
      value: Number(Math.max(0, 15.0 + waveCos * 10.0 + rand(-2.0, 2.0, 2)).toFixed(2)),
    });
    skinReadings.push({
      sensorType: 'vibration',
      location: loc,
      sensorNumber: 2,
      side: 'back',
      value: Number(Math.max(0, 16.5 + waveCos * 9.5 + rand(-2.0, 2.0, 2)).toFixed(2)),
    });
  });

  // 2. LORA MICRO 1 (BME, MPU, Sound)
  const loraMicro1 = {
    micro: 1,
    mid: MANNEQUIN_ID,
    bmeData: {
      humidity: rand(50, 75),
      pressure: rand(980, 1015),
      approximate_altitude: rand(15, 30),
      temperature: Number((31.5 + wave * 2).toFixed(2)),
      sensor_id: 1001,
    },
    mpuData: {
      temperature: Number((33.0 + wave * 1.5).toFixed(2)),
      x_acceleration: Number((waveFast * 2.0).toFixed(4)),
      y_acceleration: Number((waveCos * 1.8).toFixed(4)),
      z_acceleration: Number((9.8 + rand(-0.5, 0.5)).toFixed(4)),
      x_kalman: Number((waveFast * 1.8).toFixed(4)),
      y_kalman: Number((waveCos * 1.6).toFixed(4)),
      z_kalman: 9.8,
      x_rotation: rand(-120, 120, 1),
      y_rotation: rand(-120, 120, 1),
      z_rotation: rand(-120, 120, 1),
      sensor_id: 1002,
    },
    soundData1: {
      value: Math.round(45 + Math.abs(waveFast) * 40 + rand(-5, 5, 0)),
      sensor_id: 601,
    },
    soundData2: {
      value: Math.round(42 + Math.abs(waveCos) * 35 + rand(-5, 5, 0)),
      sensor_id: 602,
    },
  };

  // 3. LORA MICRO 2 (ADXL, Lidar, MQ Gas)
  const loraMicro2 = {
    micro: 2,
    mid: MANNEQUIN_ID,
    adxlRightData: {
      x_axis: Number((wave * 1.5).toFixed(4)),
      y_axis: Number((waveCos * 1.2).toFixed(4)),
      z_axis: Number((9.8 + rand(-0.3, 0.3)).toFixed(4)),
      x_kalman: Number((wave * 1.4).toFixed(4)),
      y_kalman: Number((waveCos * 1.1).toFixed(4)),
      z_kalman: 9.8,
      sensor_id: 201,
    },
    adxlLeftData: {
      x_axis: Number((-wave * 1.5).toFixed(4)),
      y_axis: Number((-waveCos * 1.2).toFixed(4)),
      z_axis: Number((9.8 + rand(-0.3, 0.3)).toFixed(4)),
      x_kalman: Number((-wave * 1.4).toFixed(4)),
      y_kalman: Number((-waveCos * 1.1).toFixed(4)),
      z_kalman: 9.8,
      sensor_id: 202,
    },
    lidarData: {
      value: Number((120 + wave * 45 + rand(-3, 3)).toFixed(2)),
      kalmanvalue: Number((120 + wave * 45).toFixed(2)),
      sensor_id: 901,
    },
    mpu6050Data: {
      temperature: Number((32.5 + wave * 1.2).toFixed(2)),
      x_acceleration: Number((wave * 1.5).toFixed(4)),
      y_acceleration: Number((waveFast * 1.2).toFixed(4)),
      z_acceleration: 9.8,
      x_kalman: Number((wave * 1.4).toFixed(4)),
      y_kalman: Number((waveFast * 1.1).toFixed(4)),
      z_kalman: 9.8,
      x_rotation: rand(-90, 90, 1),
      y_rotation: rand(-90, 90, 1),
      z_rotation: rand(-90, 90, 1),
      sensor_id: 1002,
    },
    mqData: {
      value: rand(200, 350),
      co: rand(1.2, 3.5),
      co2: rand(420, 580),
      nh3: rand(0.5, 2.1),
      no2: rand(0.1, 0.8),
      smoke: rand(10, 25),
      sensor_id: 101,
    },
    mqData2: {
      value: rand(180, 320),
      co: rand(1.0, 3.0),
      co2: rand(400, 550),
      nh3: rand(0.4, 1.8),
      no2: rand(0.1, 0.7),
      smoke: rand(8, 22),
      sensor_id: 103,
    },
  };

  // 4. LORA MICRO 3 (FSR 1..8)
  const loraMicro3 = {
    micro: 3,
    mid: MANNEQUIN_ID,
  };
  for (let i = 1; i <= 8; i++) {
    const val = Number((5.0 + Math.sin(t / 5 + i) * 3.5 + rand(-0.5, 0.5)).toFixed(2));
    loraMicro3[`fsr${i}Data`] = {
      value: Math.max(0, val),
      pressure_value: Math.max(0, val),
      force_value: Math.max(0, val * 3.2),
      sensor_id: 1100 + i,
    };
  }

  // 5. LOAD CELL SENSORS (801..805)
  const loadcellReadings = [
    { id: 801, name: 'Leher', val: Number((3.15 + waveFast * 0.8 + rand(-0.1, 0.1)).toFixed(2)) },
    { id: 802, name: 'Paha Kiri', val: Number((5.25 + wave * 1.5 + rand(-0.2, 0.2)).toFixed(2)) },
    { id: 803, name: 'Paha Kanan', val: Number((4.70 + waveCos * 1.2 + rand(-0.2, 0.2)).toFixed(2)) },
    { id: 804, name: 'Kaki Kiri', val: Number((0.00 + Math.max(0, waveFast * 0.5) + rand(0, 0.05)).toFixed(2)) },
    { id: 805, name: 'Kaki Kanan', val: Number((33.20 + wave * 1.8 + rand(-0.3, 0.3)).toFixed(2)) },
  ];

  // Send to all target mannequin IDs
  for (const mid of TARGET_MIDS) {
    const lora1 = { ...loraMicro1, mid };
    const lora2 = { ...loraMicro2, mid };
    const lora3 = { ...loraMicro3, mid };

    const sendPromises = [
      postJson('/sensor-reading/batch', { mannequinId: mid, readings: skinReadings }),
      postJson(`/sensor/lora?mid=${mid}`, lora1),
      postJson(`/sensor/lora?mid=${mid}`, lora2),
      postJson(`/sensor/lora?mid=${mid}`, lora3),
      postJson(`/sensor/thermal?mid=${mid}`, {
        value: Number((34.0 + wave * 1.5).toFixed(2)),
        center_temp: Number((34.0 + wave * 1.5).toFixed(2)),
        low_temp: Number((31.5 + wave * 1.2).toFixed(2)),
        high_temp: Number((36.5 + wave * 1.8).toFixed(2)),
        sensor_id: 702,
      }),
      ...loadcellReadings.map((lc) =>
        postJson(`/sensor/loadcell?mid=${mid}`, {
          sensor_id: lc.id,
          value: lc.val,
          kalmanvalue: lc.val,
          lateral: 0,
          extension: lc.val,
          flexion: 0,
        }),
      ),
    ];

    await Promise.all(sendPromises);
  }

  console.log(
    `[${now}] Step #${step} dikirim ke Mannequin [${TARGET_MIDS.join(', ')}]: ` +
    `SmartSkin (${skinReadings.length} titik) | ` +
    `LoRa (BME, MPU, Sound, ADXL, Lidar, Gas, FSR) | ` +
    `Loadcell (Leher: ${loadcellReadings[0].val}, Paha: ${loadcellReadings[1].val}/${loadcellReadings[2].val}, Kaki: ${loadcellReadings[3].val}/${loadcellReadings[4].val})`,
  );
}

// Start simulation interval
simulateCycle();
const interval = setInterval(simulateCycle, INTERVAL_MS);

process.on('SIGINT', () => {
  clearInterval(interval);
  console.log('\n🛑 Simulasi dihentikan.');
  process.exit(0);
});
