'use strict';

const { Server } = require('socket.io');

let ioInstance = null;
let sensorNamespace = null;

function initSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  sensorNamespace = ioInstance.of('/sensor');

  sensorNamespace.on('connection', (socket) => {
    console.log(`\x1b[35m[WebSocket]\x1b[0m Client connected to /sensor: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`\x1b[35m[WebSocket]\x1b[0m Client disconnected from /sensor: ${socket.id}`);
    });
  });

  console.log('\x1b[32m[WebSocket]\x1b[0m Socket.io initialized on namespace /sensor');
  return ioInstance;
}

function emitSensorBatch(readings) {
  if (sensorNamespace && Array.isArray(readings) && readings.length > 0) {
    sensorNamespace.emit('sensor-batch-update', readings);
  }
}

module.exports = {
  initSocket,
  emitSensorBatch,
  getIo: () => ioInstance,
  getSensorNamespace: () => sensorNamespace,
};
