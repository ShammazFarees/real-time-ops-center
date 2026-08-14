import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;
export const inMemoryIncidentsStore: Map<string, any> = new Map();

export const clearInMemoryIncidentsStore = () => {
  inMemoryIncidentsStore.clear();
  if (io) {
    io.to('dispatchers').emit('incidents:snapshot', []);
  }
};

export const initSocketServer = (server: HttpServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[SOCKET.IO] Client connected: ${socket.id}`);

    // Join dispatcher room by default
    socket.join('dispatchers');

    // Send initial snapshot of all active incidents
    const currentSnapshot = Array.from(inMemoryIncidentsStore.values());
    socket.emit('incidents:snapshot', currentSnapshot);

    socket.on('join:room', (room: string) => {
      socket.join(room);
      console.log(`[SOCKET.IO] Socket ${socket.id} joined room ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`[SOCKET.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const broadcastIncidentNew = (incident: any) => {
  // Save in memory cache
  const incId = incident.incidentId || incident._id;
  inMemoryIncidentsStore.set(incId, incident);

  if (io) {
    io.to('dispatchers').emit('incident:new', incident);
  }
};

export const broadcastIncidentUpdated = (incident: any) => {
  const incId = incident.incidentId || incident._id;
  inMemoryIncidentsStore.set(incId, incident);

  if (io) {
    io.to('dispatchers').emit('incident:updated', incident);
  }
};

export const broadcastSystemStats = (stats: any) => {
  if (io) {
    io.emit('stats:updated', stats);
  }
};
