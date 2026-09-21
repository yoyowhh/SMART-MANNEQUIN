const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  if (req.method !== "GET") {
    return next();
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // Allow public/guest reading of sensor metrics
  if (!token) {
    return next();
  }

  jwt.verify(token, "secrettoken", (err, user) => {
    if (err) {
      // If token expired/invalid, still allow reading
      return next();
    }
    req.user = user;
    next();
  });
}

const cLogger = (req, res, next) => {
  const timestamp = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Jakarta",
    hour12: false,
  });

  const response = res.json;
  const colorizeStatus = (status) => {
    if (status >= 500) return `\x1b[31m${status}\x1b[0m`;
    if (status >= 400) return `\x1b[33m${status}\x1b[0m`;
    if (status >= 300) return `\x1b[36m${status}\x1b[0m`;
    if (status >= 200) return `\x1b[32m${status}\x1b[0m`;
    return status;
  };

  res.json = function (body) {
    const status = colorizeStatus(res.statusCode);
    console.log(`[${timestamp}] ${status} ${req.method} ${req.originalUrl} | \x1b[36mReq:\x1b[0m ${JSON.stringify(req.body)} | \x1b[36mQuery:\x1b[0m ${JSON.stringify(req.query)} | \x1b[36mRes:\x1b[0m ${JSON.stringify(body)}`);
    return response.call(this, body);
  };

  next();
};

// ✅ Decoder RAK7268 Built-in NS
const decodeRAKPayload = (req, res, next) => {
  try {
    const rawData = req.body?.data || req.body?.payload?.data;
    if (req.body && rawData && typeof rawData === 'string') {
      console.log('\x1b[35m[RAK Decoder]\x1b[0m Detected RAK7268 payload');

      const bytes = Buffer.from(rawData, 'base64');
      const micro = req.query.micro;

      const readInt16 = (i) => {
        if (i + 1 >= bytes.length) return 0;
        const val = (bytes[i] << 8) | bytes[i + 1];
        return val > 32767 ? val - 65536 : val;
      };

      if (micro == '1') {
        req.body = {
          micro: 1,
          mid: parseInt(req.query.mid) || 1,
          bmeData: {
            temperature: readInt16(0) / 100.0,
            humidity: readInt16(2) / 100.0,
            pressure: readInt16(4) / 100.0,
            approximate_altitude: readInt16(6) / 100.0,
            sensor_id: 1001
          },
          mpuData: {
            temperature: readInt16(8) / 100.0,
            x_axis: readInt16(10) / 100.0,
            y_axis: readInt16(12) / 100.0,
            z_axis: readInt16(14) / 100.0,
            x_kalman: readInt16(16) / 100.0,
            y_kalman: readInt16(18) / 100.0,
            z_kalman: readInt16(20) / 100.0,
            gx: readInt16(22) / 100.0,
            gy: readInt16(24) / 100.0,
            gz: readInt16(26) / 100.0,
            sensor_id: 1002
          },
          soundData1: { value: readInt16(28), sensor_id: 601 },
          soundData2: { value: readInt16(30), sensor_id: 602 }
        };
        console.log('\x1b[35m[RAK Decoder]\x1b[0m COSMIC decoded OK');

        } else if (micro == '2') {
        req.body = {
          micro: 2,
          mid: parseInt(req.query.mid) || 1,
          adxlData: {
            x_axis: bytes[0] / 10.0,
            y_axis: bytes[1] / 10.0,
            z_axis: bytes[2] / 10.0,
            sensor_id: 201
          },
          lidarData: {
            value: (bytes[3] << 8) | bytes[4],
            sensor_id: 301
          },
          mpu6050Data: {
            x_axis: bytes[5] / 10.0,
            y_axis: bytes[6] / 10.0,
            z_axis: bytes[7] / 10.0,
            sensor_id: 1002
          },
          mqData: {
            smoke: (bytes[8] << 8) | bytes[9],
            nh3: bytes[10],
            co: bytes[11],
            co2: bytes[12] * 10,
            sensor_id: 401
          }
        };
        console.log('\x1b[35m[RAK Decoder]\x1b[0m TTGO decoded OK');
      }
    }
  } catch (err) {
    console.error('\x1b[31m[RAK Decoder Error]\x1b[0m', err.message);
  }
  next();
};

module.exports = { verifyToken, cLogger, decodeRAKPayload };
