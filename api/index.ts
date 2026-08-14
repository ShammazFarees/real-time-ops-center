import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from '../apps/backend/src/config/database';
import incidentRoutes from '../apps/backend/src/routes/incidentRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect DB lazily for serverless environment
let isDbConnected = false;
app.use(async (req, res, next) => {
  if (!isDbConnected) {
    await connectDB();
    isDbConnected = true;
  }
  next();
});

// Routes
app.use('/api/incidents', incidentRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'vercel-serverless-backend',
    timestamp: new Date().toISOString()
  });
});

export default app;
