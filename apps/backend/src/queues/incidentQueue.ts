import { Queue } from 'bullmq';
import { getRedisConnectionOptions } from '../config/redis';

export const INCIDENT_QUEUE_NAME = 'incident-ingestion';

let incidentQueue: Queue | null = null;
let isRedisAvailable = false;

try {
  incidentQueue = new Queue(INCIDENT_QUEUE_NAME, {
    connection: getRedisConnectionOptions(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      removeOnComplete: true
    }
  });
  isRedisAvailable = true;
  console.log('[BULLMQ] Incident ingestion queue initialized on Redis.');
} catch (err: any) {
  console.warn('[BULLMQ WARNING] Redis unavailable for BullMQ queue. Using in-memory job processing queue fallback.');
}

export { incidentQueue, isRedisAvailable };

export const addIncidentToQueue = async (data: {
  incidentId: string;
  title: string;
  rawPayload: string;
  coordinates: [number, number];
  source?: string;
}) => {
  if (incidentQueue && isRedisAvailable) {
    try {
      await incidentQueue.add('process-incident', data, { jobId: data.incidentId });
      return { status: 'QUEUED_REDIS', jobId: data.incidentId };
    } catch (e: any) {
      console.warn('[BULLMQ] Redis enqueue error, falling back to direct async worker execution:', e.message);
    }
  }
  return { status: 'DIRECT_EXECUTION', jobId: data.incidentId };
};
