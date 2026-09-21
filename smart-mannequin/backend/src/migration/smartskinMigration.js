'use strict';

const db = require('../dbconfig');

async function initSmartskinTables() {
  try {
    console.log('\x1b[34m[SmartSkin DB]\x1b[0m Checking/Initializing Smart Skin tables in MySQL...');

    // 1. Locations table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS smartskin_locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Sensor Types table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS smartskin_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        unit VARCHAR(20) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Sensors table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS smartskin_sensors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        external_id INT NOT NULL,
        location_id INT NOT NULL,
        sensor_type_id INT NOT NULL,
        mannequin_id INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_smartskin_sensor (location_id, sensor_type_id, external_id, mannequin_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Readings table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS smartskin_readings (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        sensor_type VARCHAR(50) NOT NULL,
        location VARCHAR(100) NOT NULL,
        sensor_number INT NOT NULL DEFAULT 1,
        value DECIMAL(12,4) NOT NULL,
        mannequin_id INT NOT NULL DEFAULT 1,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_type_mannequin (sensor_type, mannequin_id, timestamp),
        INDEX idx_loc_mannequin (location, mannequin_id, timestamp),
        INDEX idx_timestamp (timestamp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed default locations
    const defaultLocations = [
      'right arm', 'left arm', 'back', 'right leg', 'left leg',
      'right shoulder', 'left shoulder',
      'right elbow', 'left elbow',
      'right waist', 'left waist',
      'right knee', 'left knee',
    ];

    for (const loc of defaultLocations) {
      await db.execute(
        `INSERT IGNORE INTO smartskin_locations (name) VALUES (?)`,
        [loc]
      );
    }

    // Seed default sensor types
    const defaultTypes = [
      { name: 'temperature', unit: '°C' },
      { name: 'pressure',    unit: 'N' },
      { name: 'vibration',   unit: 'V' },
      { name: 'flex',        unit: 'Ω' },
      { name: 'strain',      unit: 'µε' },
    ];

    for (const t of defaultTypes) {
      await db.execute(
        `INSERT INTO smartskin_types (name, unit) VALUES (?, ?) ON DUPLICATE KEY UPDATE unit = VALUES(unit)`,
        [t.name, t.unit]
      );
    }

    console.log('\x1b[32m[SmartSkin DB]\x1b[0m Smart Skin tables & seeders ready!');
  } catch (err) {
    console.error('\x1b[31m[SmartSkin DB Error]\x1b[0m Failed to init tables:', err.message);
  }
}

module.exports = { initSmartskinTables };
