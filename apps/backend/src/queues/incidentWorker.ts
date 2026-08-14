import { Worker, Job } from 'bullmq';
import { getRedisConnectionOptions } from '../config/redis';
import { INCIDENT_QUEUE_NAME } from './incidentQueue';
import { callAIService } from '../services/aiServiceCaller';
import { Incident } from '../models/Incident';
import { broadcastIncidentNew, broadcastIncidentUpdated } from '../socket/socketServer';

export const processIncidentTask = async (data: {
  incidentId: string;
  title: string;
  rawPayload: string;
  coordinates: [number, number];
}) => {
  console.log(`[WORKER] Processing incident task ${data.incidentId}...`);
  
  // 1. Call AI microservice
  const aiResult = await callAIService({
    incidentId: data.incidentId,
    rawPayload: data.rawPayload,
    coordinates: data.coordinates
  });

  // 2. Save or update MongoDB document / in-memory store
  let incidentDoc = null;
  try {
    incidentDoc = await Incident.findOneAndUpdate(
      { incidentId: data.incidentId },
      {
        incidentId: data.incidentId,
        title: data.title,
        rawPayload: data.rawPayload,
        category: aiResult.category,
        severity: aiResult.severity,
        status: 'OPEN',
        location: {
          type: 'Point',
          coordinates: data.coordinates
        },
        aiAnalysis: aiResult
      },
      { upsert: true, new: true }
    );
  } catch (err: any) {
    // If Mongo offline, format fallback object
    incidentDoc = {
      incidentId: data.incidentId,
      title: data.title,
      rawPayload: data.rawPayload,
      category: aiResult.category,
      severity: aiResult.severity,
      status: 'OPEN',
      location: {
        type: 'Point',
        coordinates: data.coordinates
      },
      aiAnalysis: aiResult,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // 3. Broadcast real-time Socket.io update to dashboard clients
  broadcastIncidentNew(incidentDoc);

  console.log(`[WORKER SUCCESS] Incident ${data.incidentId} processed. Category: ${aiResult.category}, Severity: ${aiResult.severity}`);
  return incidentDoc;
};

export const startIncidentWorker = () => {
  try {
    const worker = new Worker(
      INCIDENT_QUEUE_NAME,
      async (job: Job) => {
        await processIncidentTask(job.data);
      },
      { connection: getRedisConnectionOptions() }
    );

    worker.on('completed', (job) => {
      console.log(`[BULLMQ WORKER] Job ${job.id} completed successfully.`);
    });

    worker.on('failed', (job, err) => {
      console.error(`[BULLMQ WORKER ERROR] Job ${job?.id} failed:`, err);
    });

    console.log('[BULLMQ WORKER] Worker listening for incident-ingestion events.');
  } catch (e: any) {
    console.warn('[BULLMQ WORKER WARNING] BullMQ worker standing by (Redis fallback mode).');
  }
};
