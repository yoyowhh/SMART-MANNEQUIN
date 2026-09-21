const fs = require('node:fs/promises');
const path = require('node:path');

const DEFAULT_URL = 'http://localhost:4013/sensor/lora';
const DEFAULT_INTERVAL_MS = 1000;
const DEFAULT_DURATION_SEC = 60;
const DEFAULT_TIMEOUT_MS = 1200;
const DEFAULT_RETRY_BASE_MS = 500;
const DEFAULT_RETRY_MAX_MS = 5000;
const DEFAULT_WAIT_DRAIN_SEC = 30;
const DEFAULT_BACKUP_FILE = path.join('scripts', 'lora-simulator-backup.json');
const DEFAULT_WORKERS = 3;
const DEFAULT_MID = 1;
const DEFAULT_MICROS = [1, 2, 3];

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function toFixedNum(value, digits = 4) {
  return Number(value.toFixed(digits));
}

function parseMicro(value) {
  const micro = Number(value);
  if (!Number.isInteger(micro) || micro < 1 || micro > 3) {
    throw new Error('Invalid micro value. Allowed micro: 1, 2, 3.');
  }

  return micro;
}

function parseArgs(argv) {
  const argMap = new Map();
  const looseArgs = [];

  for (const arg of argv) {
    if (!arg.startsWith('--')) {
      looseArgs.push(arg);
      continue;
    }

    const [rawKey, ...rest] = arg.slice(2).split('=');
    const key = rawKey.trim();
    const value = rest.join('=').trim();

    if (key) {
      argMap.set(key, value);
    }
  }

  const intervalMs = Number(argMap.get('interval') || DEFAULT_INTERVAL_MS);
  const durationSec = Number(argMap.get('duration') || DEFAULT_DURATION_SEC);
  const timeoutMs = Number(argMap.get('timeout') || DEFAULT_TIMEOUT_MS);
  const retryBaseMs = Number(argMap.get('retry-base') || DEFAULT_RETRY_BASE_MS);
  const retryMaxMs = Number(argMap.get('retry-max') || DEFAULT_RETRY_MAX_MS);
  const waitDrainSec = Number(argMap.get('wait-drain') || DEFAULT_WAIT_DRAIN_SEC);
  const url = argMap.get('url') || DEFAULT_URL;
  const dryRun = argMap.has('dry-run');
  const resumeBackup = !argMap.has('no-resume');
  const backupFile = argMap.get('backup-file') || DEFAULT_BACKUP_FILE;
  const workers = Number(argMap.get('workers') || DEFAULT_WORKERS);
  const mid = Number(argMap.get('mid') || DEFAULT_MID);
  const microsRaw = argMap.get('micros');

  // PowerShell can split `--micros=1,2,3` into `--micros=1 2 3`.
  // Collect both explicit `--micros` value and trailing loose numeric args.
  const microsTokens = [];
  if (microsRaw) {
    microsTokens.push(...microsRaw.split(/[\s,]+/));
  }

  for (const value of looseArgs) {
    if (!/^\s*\d+(\s*[\s,]\s*\d+)*\s*$/.test(value)) {
      continue;
    }
    microsTokens.push(...value.split(/[\s,]+/));
  }

  const micros = microsTokens.length
    ? microsTokens
        .map((v) => v.trim())
        .filter(Boolean)
        .map((v) => parseMicro(v))
    : [...DEFAULT_MICROS];

  if (!Number.isFinite(intervalMs) || intervalMs < 200) {
    throw new Error('Invalid --interval value. Use milliseconds >= 200.');
  }

  if (!Number.isFinite(durationSec) || durationSec < 1) {
    throw new Error('Invalid --duration value. Use seconds >= 1.');
  }

  if (!Number.isFinite(timeoutMs) || timeoutMs < 200) {
    throw new Error('Invalid --timeout value. Use milliseconds >= 200.');
  }

  if (!Number.isFinite(retryBaseMs) || retryBaseMs < 100) {
    throw new Error('Invalid --retry-base value. Use milliseconds >= 100.');
  }

  if (!Number.isFinite(retryMaxMs) || retryMaxMs < retryBaseMs) {
    throw new Error('Invalid --retry-max value. Must be >= retry-base.');
  }

  if (!Number.isFinite(waitDrainSec) || waitDrainSec < 0) {
    throw new Error('Invalid --wait-drain value. Use seconds >= 0.');
  }

  if (!Number.isFinite(workers) || workers < 1 || workers > 16) {
    throw new Error('Invalid --workers value. Use integer between 1 and 16.');
  }

  if (!Number.isInteger(mid) || mid < 1) {
    throw new Error('Invalid --mid value. Use integer >= 1.');
  }

  if (micros.length === 0) {
    throw new Error('Invalid --micros value. Provide at least one micro.');
  }

  return {
    url,
    intervalMs,
    durationSec,
    timeoutMs,
    retryBaseMs,
    retryMaxMs,
    waitDrainSec,
    dryRun,
    resumeBackup,
    backupFile,
    workers: Math.floor(workers),
    mid,
    micros,
  };
}

function buildMicro1Payload(mid) {
  return {
    micro: 1,
    mid,
    bmeData: {
      humidity: toFixedNum(rand(45, 90), 2),
      pressure: toFixedNum(rand(950, 1020), 2),
      approximate_altitude: toFixedNum(rand(5, 45), 2),
      temperature: toFixedNum(rand(29.5, 37.8), 2),
      sensor_id: 1001,
    },
    mpuData: {
      temperature: toFixedNum(rand(31, 37.4), 2),
      x_acceleration: toFixedNum(rand(-3.5, 3.5), 4),
      y_acceleration: toFixedNum(rand(-3.5, 3.5), 4),
      z_acceleration: toFixedNum(rand(-3.5, 3.5), 4),
      x_kalman: toFixedNum(rand(-3, 3), 4),
      y_kalman: toFixedNum(rand(-3, 3), 4),
      z_kalman: toFixedNum(rand(-3, 3), 4),
      x_rotation: toFixedNum(rand(-400, 400), 3),
      y_rotation: toFixedNum(rand(-400, 400), 3),
      z_rotation: toFixedNum(rand(-400, 400), 3),
      sensor_id: 1002,
    },
    soundData1: {
      value: toFixedNum(rand(20, 140), 0),
      sensor_id: 601,
    },
    soundData2: {
      value: toFixedNum(rand(20, 140), 0),
      sensor_id: 602,
    },
  };
}

function buildMicro2Payload(mid) {
  return {
    micro: 2,
    mid,
    adxlRightData: {
      x_axis: toFixedNum(rand(-2.5, 2.5), 4),
      y_axis: toFixedNum(rand(-2.5, 2.5), 4),
      z_axis: toFixedNum(rand(-2.5, 2.5), 4),
      x_kalman: toFixedNum(rand(-2.5, 2.5), 4),
      y_kalman: toFixedNum(rand(-2.5, 2.5), 4),
      z_kalman: toFixedNum(rand(-2.5, 2.5), 4),
      sensor_id: 201,
    },
    adxlLeftData: {
      x_axis: toFixedNum(rand(-2.5, 2.5), 4),
      y_axis: toFixedNum(rand(-2.5, 2.5), 4),
      z_axis: toFixedNum(rand(-2.5, 2.5), 4),
      x_kalman: toFixedNum(rand(-2.5, 2.5), 4),
      y_kalman: toFixedNum(rand(-2.5, 2.5), 4),
      z_kalman: toFixedNum(rand(-2.5, 2.5), 4),
      sensor_id: 202,
    },
    lidarData: {
      value: toFixedNum(rand(30, 260), 2),
      kalmanvalue: toFixedNum(rand(30, 260), 2),
      sensor_id: 901,
    },
    mpu6050Data: {
      temperature: toFixedNum(rand(31, 37.2), 2),
      x_acceleration: toFixedNum(rand(-3.5, 3.5), 4),
      y_acceleration: toFixedNum(rand(-3.5, 3.5), 4),
      z_acceleration: toFixedNum(rand(-3.5, 3.5), 4),
      x_kalman: toFixedNum(rand(-3, 3), 4),
      y_kalman: toFixedNum(rand(-3, 3), 4),
      z_kalman: toFixedNum(rand(-3, 3), 4),
      x_rotation: toFixedNum(rand(-400, 400), 3),
      y_rotation: toFixedNum(rand(-400, 400), 3),
      z_rotation: toFixedNum(rand(-400, 400), 3),
      sensor_id: 1002,
    },
    mqData: {
      value: toFixedNum(rand(100, 900), 2),
      co: toFixedNum(rand(0.1, 20), 3),
      co2: toFixedNum(rand(350, 1800), 2),
      nh3: toFixedNum(rand(0.05, 15), 3),
      no2: toFixedNum(rand(0.01, 10), 3),
      smoke: toFixedNum(rand(1, 200), 2),
      sensor_id: 101,
    },
    mqData2: {
      value: toFixedNum(rand(100, 900), 2),
      co: toFixedNum(rand(0.1, 20), 3),
      co2: toFixedNum(rand(350, 1800), 2),
      nh3: toFixedNum(rand(0.05, 15), 3),
      no2: toFixedNum(rand(0.01, 10), 3),
      smoke: toFixedNum(rand(1, 200), 2),
      sensor_id: 103,
    },
  };
}

function buildMicro3Payload(mid) {
  const payload = {
    micro: 3,
    mid,
  };

  for (let index = 1; index <= 8; index += 1) {
    const sensorId = 1100 + index;
    const pressureValue = toFixedNum(rand(0.05, 17.5), 4);
    const forceValue = toFixedNum(rand(0.2, 80), 4);
    payload[`fsr${index}Data`] = {
      value: pressureValue,
      pressure_value: pressureValue,
      force_value: forceValue,
      sensor_id: sensorId,
    };
  }

  return payload;
}

function buildDecodedPayload(micro, mid) {
  if (micro === 1) {
    return buildMicro1Payload(mid);
  }

  if (micro === 2) {
    return buildMicro2Payload(mid);
  }

  return buildMicro3Payload(mid);
}

function buildRequestBody(micro, mid) {
  return {
    uplink_message: {
      decoded_payload: buildDecodedPayload(micro, mid),
    },
  };
}

async function postJson(url, payload, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const startedAt = Date.now();
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const elapsedMs = Date.now() - startedAt;
    const text = await res.text();

    return {
      ok: res.ok,
      status: res.status,
      elapsedMs,
      body: text,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function ensureBackupDir(backupFile) {
  const dir = path.dirname(backupFile);
  await fs.mkdir(dir, { recursive: true });
}

async function loadBackupQueue(backupFile, enabled) {
  if (!enabled) {
    return [];
  }

  try {
    const raw = await fs.readFile(backupFile, 'utf8');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const now = Date.now();
    return parsed
      .filter((item) => item && typeof item === 'object' && item.payload && item.micro)
      .map((item) => ({
        id:
          item.id ||
          `${item.tick || 'old'}-m${item.micro}-${Math.random().toString(36).slice(2, 8)}`,
        tick: Number(item.tick || 0),
        micro: parseMicro(item.micro),
        sampledAt: Number(item.sampledAt || now),
        payload: item.payload,
        attempts: Number(item.attempts || 0),
        nextAttemptAt: Number(item.nextAttemptAt || now),
      }));
  } catch {
    return [];
  }
}

async function saveBackupQueue(backupFile, queue) {
  await ensureBackupDir(backupFile);
  await fs.writeFile(backupFile, JSON.stringify(queue), 'utf8');
}

async function deleteBackupQueue(backupFile) {
  try {
    await fs.unlink(backupFile);
  } catch {
    // Ignore missing file.
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function computeBackoffMs(attempts, baseMs, maxMs) {
  const raw = baseMs * 2 ** Math.max(0, attempts - 1);
  return Math.min(maxMs, raw);
}

async function runSimulator(config) {
  const startedAt = Date.now();
  const endAt = startedAt + config.durationSec * 1000;

  let tick = 0;
  let enqueued = 0;
  let delivered = 0;
  let sendFailed = 0;
  let nextTickAt = startedAt;
  let running = true;
  let backupDirty = false;

  const queue = await loadBackupQueue(config.backupFile, config.resumeBackup);

  if (queue.length > 0) {
    console.log(`[resume] Loaded ${queue.length} pending item(s) from backup.`);
  }

  const persistQueue = async () => {
    if (!backupDirty) {
      return;
    }

    backupDirty = false;
    await saveBackupQueue(config.backupFile, queue);
  };

  const takeReadyItem = () => {
    const now = Date.now();
    const index = queue.findIndex((item) => item.nextAttemptAt <= now);
    if (index < 0) {
      return null;
    }

    const [item] = queue.splice(index, 1);
    backupDirty = true;
    return item;
  };

  const senderLoop = async (workerId) => {
    while (running || queue.length > 0) {
      const item = takeReadyItem();

      if (!item) {
        await sleep(40);
        continue;
      }

      if (config.dryRun) {
        delivered += 1;
        console.log(
          `[send#${workerId}] tick=${String(item.tick).padStart(3, '0')} micro=${item.micro} status=  0 latency=   0 ms ok=true q=${queue.length}`,
        );
        continue;
      }

      let result;
      try {
        result = await postJson(config.url, item.payload, config.timeoutMs);
      } catch (error) {
        result = {
          ok: false,
          status: -1,
          elapsedMs: 0,
          body: error instanceof Error ? error.message : 'Unknown error',
        };
      }

      if (result.ok) {
        delivered += 1;
      } else {
        sendFailed += 1;
        item.attempts += 1;
        const backoffMs = computeBackoffMs(
          item.attempts,
          config.retryBaseMs,
          config.retryMaxMs,
        );
        item.nextAttemptAt = Date.now() + backoffMs;
        queue.push(item);
        backupDirty = true;
      }

      console.log(
        `[send#${workerId}] tick=${String(item.tick).padStart(3, '0')} micro=${item.micro} status=${String(result.status).padStart(3, ' ')} latency=${String(result.elapsedMs).padStart(4, ' ')} ms ok=${result.ok} attempts=${item.attempts} q=${queue.length}`,
      );
    }
  };

  const senderPromises = Array.from({ length: config.workers }, (_, idx) =>
    senderLoop(idx + 1),
  );

  console.log('=== LoRa Device Simulator ===');
  console.log(`URL        : ${config.url}`);
  console.log(`Interval   : ${config.intervalMs} ms`);
  console.log(`Duration   : ${config.durationSec} s`);
  console.log(`Timeout    : ${config.timeoutMs} ms`);
  console.log(`Retry base : ${config.retryBaseMs} ms`);
  console.log(`Retry max  : ${config.retryMaxMs} ms`);
  console.log(`Wait drain : ${config.waitDrainSec} s`);
  console.log(`Dry run    : ${config.dryRun}`);
  console.log(`Backup     : ${config.backupFile}`);
  console.log(`Workers    : ${config.workers}`);
  console.log(`Mid        : ${config.mid}`);
  console.log(`Micros     : ${config.micros.join(', ')}`);

  while (Date.now() < endAt) {
    const now = Date.now();
    if (now < nextTickAt) {
      await new Promise((resolve) => setTimeout(resolve, nextTickAt - now));
    }

    const tickStart = Date.now();
    tick += 1;

    for (const micro of config.micros) {
      const payload = buildRequestBody(micro, config.mid);
      const item = {
        id: `${tick}-m${micro}-${Date.now()}`,
        tick,
        micro,
        sampledAt: tickStart,
        payload,
        attempts: 0,
        nextAttemptAt: Date.now(),
      };

      queue.push(item);
      enqueued += 1;
      backupDirty = true;
    }

    await persistQueue();

    console.log(
      `[tick ${String(tick).padStart(3, '0')}] enqueued=${config.micros.length} pending=${queue.length}`,
    );

    const tickElapsed = Date.now() - tickStart;
    if (tickElapsed > config.intervalMs) {
      console.log(
        `[tick ${String(tick).padStart(3, '0')}] warning: tick processing ${tickElapsed} ms exceeds interval ${config.intervalMs} ms`,
      );
    }

    nextTickAt += config.intervalMs;
  }

  const drainUntil = Date.now() + config.waitDrainSec * 1000;
  while (Date.now() < drainUntil && queue.length > 0) {
    await sleep(100);
  }

  running = false;
  await Promise.all(senderPromises);

  if (queue.length === 0) {
    await deleteBackupQueue(config.backupFile);
  } else {
    await saveBackupQueue(config.backupFile, queue);
  }

  const totalSec = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log('=== Summary ===');
  console.log(`Ticks produced: ${tick}`);
  console.log(`Enqueued      : ${enqueued}`);
  console.log(`Delivered     : ${delivered}`);
  console.log(`Send failed   : ${sendFailed}`);
  console.log(`Pending backup: ${queue.length}`);
  console.log(`Runtime       : ${totalSec} s`);
}

async function main() {
  try {
    const config = parseArgs(process.argv.slice(2));
    await runSimulator(config);
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Simulator error:', message);
    console.error(
      'Usage: npm run simulate:lora -- --url=http://localhost:4013/sensor/lora --interval=1000 --duration=60 --timeout=1200 --micros=1,2,3 --mid=1 --workers=3 --retry-base=500 --retry-max=5000 --wait-drain=30 [--dry-run] [--no-resume] [--backup-file=scripts/lora-simulator-backup.json]',
    );
    process.exit(1);
  }
}

void main();
