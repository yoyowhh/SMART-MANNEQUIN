'use strict';

const db = require('../dbconfig');
const moment = require('moment-timezone');

async function seedLoadcellData() {
  try {
    const [rows1] = await db.execute('SELECT COUNT(*) as c FROM loadcell_1 WHERE mannequin_id = 1');
    if (rows1[0].c > 0) {
      console.log('\x1b[32m[Loadcell Seeder]\x1b[0m loadcell_1 already has data, skipping.');
      return;
    }

    console.log('\x1b[34m[Loadcell Seeder]\x1b[0m Seeding sample data for loadcell_1 to loadcell_5...');

    const now = moment().tz('Asia/Jakarta');

    const datasets = [
      {
        table: 'loadcell_1',
        sensor_id: 801,
        values: [3.13, 3.07, 3.11, 3.07, 3.11, 3.17, 3.25, 3.18, 3.50, 4.55],
      },
      {
        table: 'loadcell_2',
        sensor_id: 802,
        values: [5.26, 5.25, 5.30, 5.29, 5.26, 5.29, 5.30, 180.35, 5.31, 5.33],
      },
      {
        table: 'loadcell_3',
        sensor_id: 803,
        values: [4.69, 4.59, 4.69, 4.73, 4.70, 4.68, 4.73, 4.67, 4.68, 4.66],
      },
      {
        table: 'loadcell_4',
        sensor_id: 804,
        values: [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
      },
      {
        table: 'loadcell_5',
        sensor_id: 805,
        values: [33.28, 33.26, 33.27, 33.26, 33.27, 33.25, 33.34, 33.64, 33.19, 33.22],
      },
    ];

    for (const ds of datasets) {
      for (let i = 0; i < ds.values.length; i++) {
        const val = ds.values[i];
        const timeStr = now.clone().subtract((ds.values.length - i) * 3, 'seconds').format('YYYY-MM-DD HH:mm:ss');
        const query = `
          INSERT INTO ${ds.table} 
          (value, kalmanvalue, sensor_id, mannequin_id, inputed_at, lateral_value, extension_value, flexion_value)
          VALUES (?, ?, ?, 1, ?, 0, ?, 0)
        `;
        await db.execute(query, [val, val, ds.sensor_id, timeStr, val]);
      }
    }

    console.log('\x1b[32m[Loadcell Seeder]\x1b[0m Successfully seeded loadcell_1 to loadcell_5!');
  } catch (err) {
    console.error('\x1b[31m[Loadcell Seeder Error]\x1b[0m', err.message);
  }
}

module.exports = { seedLoadcellData };
