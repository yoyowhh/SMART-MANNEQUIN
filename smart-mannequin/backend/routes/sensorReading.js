'use strict';

const express = require('express');
const router = express.Router();
const smartskinService = require('../src/service/smartskinService');

// Batch ingest (public machine-to-machine, no auth)
router.post('/batch', async (req, res) => {
  try {
    const mannequinId = Number(req.body.mannequinId || req.query.mid || req.body.mannequin_id || 1);
    const readings = req.body.readings || req.body;

    if (!Array.isArray(readings) || readings.length === 0) {
      return res.status(400).json({ status: 'failed', message: 'Readings array is empty or missing' });
    }

    const result = await smartskinService.saveBatchReadings(readings, mannequinId);
    res.json({ status: 'ok', message: 'Batch saved successfully', count: result.count });
  } catch (err) {
    console.error('Error saving batch:', err);
    res.status(500).json({ status: 'failed', message: err.message });
  }
});

// Single reading ingest (fallback)
router.post('/', async (req, res) => {
  try {
    const mannequinId = Number(req.body.mannequinId || req.query.mid || 1);
    const { sensorType, location, sensorNumber, value } = req.body;
    const result = await smartskinService.saveBatchReadings(
      [{ sensorType, location, sensorNumber, value }],
      mannequinId
    );
    res.json({ status: 'ok', count: result.count });
  } catch (err) {
    res.status(500).json({ status: 'failed', message: err.message });
  }
});

// Latest readings per sensor type
router.get('/latest', async (req, res) => {
  try {
    const mannequinId = Number(req.query.mannequin_id || req.query.mid || 1);
    const data = await smartskinService.getLatestReadings(mannequinId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ status: 'failed', message: err.message });
  }
});

// Paginated sensor readings (Logs table)
router.get('/paginated', async (req, res) => {
  try {
    const { mannequin_id, mid, sensorType, location, page, limit, date } = req.query;
    const result = await smartskinService.getPaginatedReadings({
      mannequinId: Number(mannequin_id || mid || 1),
      sensorType,
      location,
      page,
      limit,
      date,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ status: 'failed', message: err.message });
  }
});

// Export CSV
router.get('/export', async (req, res) => {
  try {
    const { mannequin_id, mid, sensorType, location, date } = req.query;
    const csv = await smartskinService.exportReadingsCsv({
      mannequinId: Number(mannequin_id || mid || 1),
      sensorType,
      location,
      date,
    });

    const m = mannequin_id || mid || 1;
    const filename = `smartskin_logs_m${m}_${date || 'all'}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ status: 'failed', message: err.message });
  }
});

// Health check
router.get('/health', (req, res) => {
  const mid = Number(req.query.mid || req.query.mannequin_id || 1);
  const health = smartskinService.getHealth(mid);
  res.json(health);
});

module.exports = router;
