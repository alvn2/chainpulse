const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Driver app emits GPS updates
  socket.on('gps_update', (data) => {
    // data: { shipmentId, lat, lng, timestamp }
    console.log(`GPS Update from ${data.shipmentId}: ${data.lat}, ${data.lng}`);
    
    // Broadcast to the specific shipment room
    io.to(data.shipmentId).emit('gps_update', data);
  });

  // Dashboard clients join specific shipment rooms to listen for updates
  socket.on('join_shipment', (shipmentId) => {
    socket.join(shipmentId);
    console.log(`Socket ${socket.id} joined room ${shipmentId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Socket.IO Server running on http://localhost:${PORT}`);
});
