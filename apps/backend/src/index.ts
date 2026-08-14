import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { startIncidentWorker } from './queues/incidentWorker';
import { initSocketServer } from './socket/socketServer';
import incidentRoutes from './routes/incidentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/incidents', incidentRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'backend-api',
    timestamp: new Date().toISOString()
  });
});

const server = http.createServer(app);

// Initialize Socket.io
initSocketServer(server);

// Connect DB & Start BullMQ Worker
connectDB().then(() => {
  startIncidentWorker();
});

server.listen(PORT, () => {
  console.log(`[BACKEND SERVER] Express API & Socket.io server running on http://localhost:${PORT}`);
});
