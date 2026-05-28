import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export function initializeSocket(server: NetServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join a specific shipment room for fine-grained updates
    socket.on('join_shipment', (shipmentId) => {
      socket.join(shipmentId);
      console.log(`Socket ${socket.id} joined room ${shipmentId}`);
    });

    // Driver emits gps updates
    socket.on('gps_update', (data: { shipmentId: string, lat: number, lng: number, timestamp: string }) => {
      console.log(`GPS Update -> Shipment: ${data.shipmentId} Lat: ${data.lat} Lng: ${data.lng}`);
      
      // Broadcast to all clients tracking this shipment
      io.to(data.shipmentId).emit('location_changed', data);
      
      // Also broadcast to a general ops room if needed
      io.emit('global_gps_update', data);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
