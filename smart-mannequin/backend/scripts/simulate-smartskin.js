// scripts/simulate-smartskin.js
// Generator data dummy real-time Smart Skin ke backend Express (Port 4013)
// Mengirim data batch setiap 2.5 detik untuk Suhu, Tekanan (FSR), Getaran (Piezo), dan Flex/Strain

const http = require('http');

const DURATION_SECONDS = 180;
const INTERVAL_MS = 2500;
const TARGET_PORT = process.env.PORT || 4013;
const TARGET_PATH = '/sensor-reading/batch';
const MANNEQUIN_ID = 1;

console.log('🚀 Memulai simulasi sensor real-time Smart Skin ke Backend Express...');
console.log(`⏱️  Durasi: ${DURATION_SECONDS} detik`);
console.log(`📡 Target endpoint: http://localhost:${TARGET_PORT}${TARGET_PATH}`);
console.log(`🤖 Mannequin ID: ${MANNEQUIN_ID}\n`);

const startTime = Date.now();
let step = 0;

function randomInRange(min, max, decimals = 1) {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(decimals));
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

function generateBatch(t) {
  const wave = Math.sin(t / 15);
  const waveFast = Math.sin(t / 6);
  const waveCos = Math.cos(t / 12);

  const readings = [];

  // 1. Flex & Strain Gauge (8 Lokasi: Depan & Belakang)
  FLEX_LOCATIONS.forEach((loc, idx) => {
    const locWave = Math.sin(t / 10 + idx);
    const flexValFront = Math.round(52000 + locWave * 24000 + randomInRange(-2500, 2500));
    const flexValBack = Math.round(54500 + locWave * 22000 + randomInRange(-2000, 2000));
    readings.push({
      sensorType: 'flex',
      location: loc,
      sensorNumber: 1,
      side: 'front',
      value: flexValFront,
    });
    readings.push({
      sensorType: 'flex',
      location: loc,
      sensorNumber: 2,
      side: 'back',
      value: flexValBack,
    });
  });

  // 2. Temperature (MCP9808) - Depan & Belakang
  TRIPLE_LOCATIONS.forEach((loc, idx) => {
    const tempFront = Number((32.0 + wave * 2.5 + randomInRange(-0.4, 0.4)).toFixed(2));
    const tempBack = Number((33.1 + wave * 2.2 + randomInRange(-0.3, 0.5)).toFixed(2));
    readings.push({
      sensorType: 'temperature',
      location: loc,
      sensorNumber: 1,
      side: 'front',
      value: tempFront,
    });
    readings.push({
      sensorType: 'temperature',
      location: loc,
      sensorNumber: 2,
      side: 'back',
      value: tempBack,
    });
  });

  // 3. Pressure (FSR) - Depan & Belakang
  TRIPLE_LOCATIONS.forEach((loc, idx) => {
    const pressFront = Number(Math.max(0, 30.0 + waveFast * 18.0 + randomInRange(-3.0, 3.0)).toFixed(2));
    const pressBack = Number(Math.max(0, 33.5 + waveFast * 16.0 + randomInRange(-2.5, 3.5)).toFixed(2));
    readings.push({
      sensorType: 'pressure',
      location: loc,
      sensorNumber: 1,
      side: 'front',
      value: pressFront,
    });
    readings.push({
      sensorType: 'pressure',
      location: loc,
      sensorNumber: 2,
      side: 'back',
      value: pressBack,
    });
  });

  // 4. Vibration (Piezo) - Depan & Belakang
  TRIPLE_LOCATIONS.forEach((loc, idx) => {
    const vibFront = Number(Math.max(0, 0.75 + waveCos * 0.45 + randomInRange(-0.1, 0.1)).toFixed(3));
    const vibBack = Number(Math.max(0, 0.88 + waveCos * 0.40 + randomInRange(-0.1, 0.15)).toFixed(3));
    readings.push({
      sensorType: 'vibration',
      location: loc,
      sensorNumber: 1,
      side: 'front',
      value: vibFront,
    });
    readings.push({
      sensorType: 'vibration',
      location: loc,
      sensorNumber: 2,
      side: 'back',
      value: vibBack,
    });
  });

  return readings;
}

function sendBatch(readings) {
  const payload = JSON.stringify({
    mannequinId: MANNEQUIN_ID,
    readings,
  });

  const req = http.request(
    {
      hostname: '127.0.0.1',
      port: TARGET_PORT,
      path: TARGET_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 2000,
    },
    (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(
          `[${elapsed}s] Sent ${readings.length} readings → HTTP ${res.statusCode}`
        );
      });
    }
  );

  req.on('error', (err) => {
    console.error(`❌ Send error: ${err.message}`);
  });

  req.write(payload);
  req.end();
}

const timer = setInterval(() => {
  const elapsedSec = (Date.now() - startTime) / 1000;
  if (elapsedSec >= DURATION_SECONDS) {
    clearInterval(timer);
    console.log('\n✅ Simulasi selesai!');
    process.exit(0);
  }

  step++;
  const readings = generateBatch(step);
  sendBatch(readings);
}, INTERVAL_MS);
