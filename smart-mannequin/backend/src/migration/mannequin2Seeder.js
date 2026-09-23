'use strict';

const db = require('../dbconfig');

async function seedMannequin2Data() {
  try {
    console.log('\x1b[34m[Mannequin 2 Seeder]\x1b[0m Checking/Seeding data for Mannequin #2...');

    // 1. Pastikan Mannequin #2 terdaftar di tabel mannequin
    await db.execute(`
      INSERT INTO mannequin (id, name, created_at, updated_at)
      VALUES (2, 'Mannequin 2 (Anthropometric Test Unit)', NOW(), NOW())
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);

    // 2. Daftar tabel sensor yang memerlukan data untuk Mannequin #2
    const sensorTables = [
      { name: 'bme280', pk: 'event_id' },
      { name: 'adxl_tangan_kanan', pk: 'event_id' },
      { name: 'adxl_tangan_kiri', pk: 'event_id' },
      { name: 'adxl_kaki_kanan', pk: 'event_id' },
      { name: 'adxl_kaki_kiri', pk: 'event_id' },
      { name: 'ky_kanan', pk: 'event_id' },
      { name: 'ky_kiri', pk: 'event_id' },
      { name: 'lidar', pk: 'event_id' },
      { name: 'lidartest', pk: 'event_id' },
      { name: 'mpu6050', pk: 'event_id' },
      { name: 'mq2', pk: 'event_id' },
      { name: 'loadcell_1', pk: 'event_id' },
      { name: 'loadcell_2', pk: 'event_id' },
      { name: 'loadcell_3', pk: 'event_id' },
      { name: 'loadcell_4', pk: 'event_id' },
      { name: 'loadcell_5', pk: 'event_id' },
      { name: 'loadcell_6', pk: 'event_id' },
      { name: 'smartskin_readings', pk: 'id', limit: 1000 },
      { name: 'thermal_camera', pk: 'event_id' },
      { name: 'witsensor', pk: 'event_id' },
    ];

    for (const item of sensorTables) {
      const table = item.name;
      const pk = item.pk;
      const limit = item.limit || 100;

      try {
        // Cek apakah data mannequin_id = 2 sudah ada
        const [checkRows] = await db.execute(
          `SELECT COUNT(*) as cnt FROM ${table} WHERE mannequin_id = 2`
        );

        if (checkRows[0].cnt === 0) {
          // Ambil kolom-kolom tabel kecuali primary key auto-increment
          const [cols] = await db.execute(`DESCRIBE ${table}`);
          const nonPkCols = cols.map((c) => c.Field).filter((f) => f !== pk);

          // Cek apakah ada data di mannequin_id = 1 untuk disalin
          const [sourceRows] = await db.execute(
            `SELECT COUNT(*) as cnt FROM ${table} WHERE mannequin_id = 1`
          );

          if (sourceRows[0].cnt > 0) {
            const selectCols = nonPkCols
              .map((c) => (c === 'mannequin_id' ? '2 AS mannequin_id' : `\`${c}\``))
              .join(', ');

            const insertCols = nonPkCols.map((c) => `\`${c}\``).join(', ');

            const insertSql = `
              INSERT INTO \`${table}\` (${insertCols})
              SELECT ${selectCols}
              FROM \`${table}\`
              WHERE mannequin_id = 1
              ORDER BY \`${pk}\` DESC
              LIMIT ${limit}
            `;

            await db.execute(insertSql);
            console.log(`\x1b[32m[Mannequin 2 Seeder]\x1b[0m Seeded ${table} for Mannequin #2 successfully.`);
          }
        }
      } catch (tableErr) {
        // Abaikan jika tabel tidak ada / kolom berbeda
        console.warn(`[Mannequin 2 Seeder] Skip ${table}:`, tableErr.message);
      }
    }

    console.log('\x1b[32m[Mannequin 2 Seeder]\x1b[0m Inisialisasi data Mannequin #2 selesai!');
  } catch (err) {
    console.error('[Mannequin 2 Seeder] Error seeding mannequin 2 data:', err);
  }
}

module.exports = { seedMannequin2Data };
