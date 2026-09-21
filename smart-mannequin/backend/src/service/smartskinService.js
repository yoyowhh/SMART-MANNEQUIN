'use strict';

const db = require('../dbconfig');
const { emitSensorBatch } = require('../utils/socket');

// In-memory cache of last seen timestamp per mannequin
const lastSeenMap = new Map();

/**
 * Normalizes location string: e.g. "right_arm" -> "right arm"
 */
function normalizeLocation(loc) {
  if (!loc) return 'back';
  return String(loc).toLowerCase().replace(/_/g, ' ').trim();
}

/**
 * Save batch readings to MySQL and broadcast via Socket.io
 * readings: Array<{ sensorType, value, location, sensorNumber }>
 */
async function saveBatchReadings(rawReadings, mannequinId = 1) {
  if (!Array.isArray(rawReadings) || rawReadings.length === 0) {
    return { count: 0 };
  }

  const now = new Date();
  lastSeenMap.set(Number(mannequinId), now);

  const formattedForDb = [];
  const broadcastBatch = [];

  for (const r of rawReadings) {
    const sensorType = String(r.sensorType || 'temperature').toLowerCase();
    const location = normalizeLocation(r.location);
    const sensorNumber = Number(r.sensorNumber) || 1;
    const value = Number(r.value) || 0;

    formattedForDb.push([
      sensorType,
      location,
      sensorNumber,
      value,
      mannequinId,
      now,
    ]);

    broadcastBatch.push({
      sensorType,
      location,
      sensorNumber,
      value,
      timestamp: now,
      mannequin_id: mannequinId,
    });
  }

  // 1. Bulk insert to MySQL
  const query = `
    INSERT INTO smartskin_readings (sensor_type, location, sensor_number, value, mannequin_id, timestamp)
    VALUES ?
  `;

  await db.query(query, [formattedForDb]);

  // 2. Broadcast via WebSocket immediately
  emitSensorBatch(broadcastBatch);

  return { count: broadcastBatch.length };
}

/**
 * Get latest reading for each sensor type
 */
async function getLatestReadings(mannequinId = 1) {
  const sensorTypes = ['temperature', 'pressure', 'vibration', 'flex', 'strain'];
  const results = [];

  for (const type of sensorTypes) {
    const [rows] = await db.execute(
      `SELECT * FROM smartskin_readings 
       WHERE sensor_type = ? AND mannequin_id = ?
       ORDER BY id DESC LIMIT 1`,
      [type, mannequinId]
    );

    if (rows.length > 0) {
      results.push({
        sensorType: rows[0].sensor_type,
        value: Number(rows[0].value),
        location: rows[0].location,
        sensorNumber: rows[0].sensor_number,
        timestamp: rows[0].timestamp,
        mannequin_id: rows[0].mannequin_id,
      });
    } else {
      results.push({
        sensorType: type,
        value: null,
        location: null,
        sensorNumber: 1,
        timestamp: null,
        mannequin_id: mannequinId,
      });
    }
  }

  return results;
}

/**
 * Get paginated sensor readings
 */
async function getPaginatedReadings({
  mannequinId = 1,
  sensorType,
  location,
  page = 1,
  limit = 20,
  date,
}) {
  const offset = (Number(page) - 1) * Number(limit);
  let whereClauses = ['mannequin_id = ?'];
  let params = [mannequinId];

  if (sensorType && sensorType !== 'all') {
    whereClauses.push('sensor_type = ?');
    params.push(sensorType);
  }

  if (location && location !== 'all') {
    whereClauses.push('location = ?');
    params.push(normalizeLocation(location));
  }

  if (date) {
    whereClauses.push('DATE(timestamp) = ?');
    params.push(date);
  }

  const whereSql = whereClauses.join(' AND ');

  const [countRows] = await db.execute(
    `SELECT COUNT(*) as total FROM smartskin_readings WHERE ${whereSql}`,
    params
  );
  const total = countRows[0].total;

  const [rows] = await db.query(
    `SELECT * FROM smartskin_readings WHERE ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  return {
    data: rows.map((r) => ({
      id: r.id,
      sensorType: r.sensor_type,
      location: r.location,
      sensorNumber: r.sensor_number,
      value: Number(r.value),
      timestamp: r.timestamp,
      mannequin_id: r.mannequin_id,
    })),
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)) || 1,
  };
}

/**
 * Export CSV
 */
async function exportReadingsCsv({ mannequinId = 1, sensorType, location, date }) {
  const paginated = await getPaginatedReadings({
    mannequinId,
    sensorType,
    location,
    page: 1,
    limit: 10000,
    date,
  });

  const header = 'ID,Timestamp,Sensor Type,Location,Sensor Number,Value,Mannequin ID\n';
  const rows = paginated.data.map(
    (r) =>
      `${r.id},"${r.timestamp}",${r.sensorType},"${r.location}",${r.sensorNumber},${r.value},${r.mannequin_id}`
  );

  return header + rows.join('\n');
}

/**
 * Health check
 */
function getHealth(mannequinId = 1) {
  const lastSeen = lastSeenMap.get(Number(mannequinId));
  if (!lastSeen) {
    return { status: 'offline', lastSeenSeconds: null, lastPacketAt: null };
  }

  const diffSec = Math.floor((Date.now() - lastSeen.getTime()) / 1000);
  let status = 'online';
  if (diffSec > 60) status = 'offline';
  else if (diffSec > 15) status = 'stale';

  return {
    status,
    lastSeenSeconds: diffSec,
    lastPacketAt: lastSeen.toISOString(),
  };
}

module.exports = {
  saveBatchReadings,
  getLatestReadings,
  getPaginatedReadings,
  exportReadingsCsv,
  getHealth,
};
