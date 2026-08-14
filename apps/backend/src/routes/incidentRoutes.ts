import { Router, Request, Response } from 'express';
import { Incident } from '../models/Incident';
import { addIncidentToQueue } from '../queues/incidentQueue';
import { processIncidentTask } from '../queues/incidentWorker';
import { inMemoryIncidentsStore, clearInMemoryIncidentsStore, broadcastIncidentUpdated } from '../socket/socketServer';

const router = Router();

// Ingest new incident telemetry event
router.post('/ingest', async (req: Request, res: Response) => {
  try {
    const { title, rawPayload, coordinates } = req.body;
    
    if (!title || !rawPayload || !coordinates || !Array.isArray(coordinates)) {
      return res.status(400).json({ error: 'Missing required fields: title, rawPayload, coordinates [lng, lat]' });
    }

    const incidentId = `INC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const queueResult = await addIncidentToQueue({
      incidentId,
      title,
      rawPayload,
      coordinates
    });

    // Execute async processing directly to guarantee real-time evaluation
    processIncidentTask({
      incidentId,
      title,
      rawPayload,
      coordinates
    }).catch(err => console.error('[INGEST ASYNC ERROR]', err));

    return res.status(202).json({
      message: 'Telemetry event accepted and queued for multi-agent evaluation.',
      incidentId,
      queueResult
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Get all incidents
router.get('/', async (req: Request, res: Response) => {
  try {
    let incidents = [];
    try {
      incidents = await Incident.find().sort({ createdAt: -1 }).limit(50);
    } catch (e) {
      incidents = Array.from(inMemoryIncidentsStore.values());
    }

    if (incidents.length === 0) {
      incidents = Array.from(inMemoryIncidentsStore.values());
    }

    return res.json(incidents);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Clear / Reset all incidents to start fresh in Pakistan
router.delete('/reset', async (req: Request, res: Response) => {
  try {
    try {
      await Incident.deleteMany({});
    } catch (e) {}

    clearInMemoryIncidentsStore();

    return res.json({ message: 'Cleared all previous incidents. Ready for Pakistan telemetry stream.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Update incident status or dispatch unit
router.patch('/:id/dispatch', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, assignedUnitId, toggleStepNumber } = req.body;

    let incident = inMemoryIncidentsStore.get(id);

    try {
      const dbDoc = await Incident.findOne({ incidentId: id });
      if (dbDoc) incident = dbDoc.toObject();
    } catch (e) {}

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    if (status) incident.status = status;
    if (assignedUnitId) incident.assignedUnitId = assignedUnitId;

    if (toggleStepNumber && incident.aiAnalysis && incident.aiAnalysis.actionPlan) {
      incident.aiAnalysis.actionPlan = incident.aiAnalysis.actionPlan.map((step: any) => {
        if (step.stepNumber === toggleStepNumber) {
          return { ...step, completed: !step.completed };
        }
        return step;
      });
    }

    try {
      await Incident.findOneAndUpdate({ incidentId: id }, incident, { upsert: true });
    } catch (e) {}

    broadcastIncidentUpdated(incident);

    return res.json(incident);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Seed sample emergency incidents (Pakistan)
router.post('/seed', async (req: Request, res: Response) => {
  // Clear old store first
  clearInMemoryIncidentsStore();
  try {
    await Incident.deleteMany({});
  } catch (e) {}

  const sampleIncidents = [
    {
      title: 'Commercial Building Fire - Jinnah Avenue Islamabad',
      rawPayload: 'CRITICAL: Heavy smoke emitting from 3rd floor commercial plaza on Jinnah Avenue. Rescue 1122 fire tender dispatched. Sprinkler failure reported.',
      coordinates: [73.0551, 33.7088]
    },
    {
      title: 'Multi-Vehicle Collision on Islamabad Expressway',
      rawPayload: 'URGENT: High-speed 3-car collision on Expressway near Faizabad interchange. 2 passengers trapped. Rescue 1122 medical team required.',
      coordinates: [73.0805, 33.6644]
    },
    {
      title: 'Armed Robbery Security Alert - Blue Area Islamabad',
      rawPayload: 'SECURITY ALERT: Silent panic alarm triggered at bank branch in Blue Area. Armed suspects fled on motorcycle toward Khyaban-e-Iqbal.',
      coordinates: [73.0612, 33.7112]
    }
  ];

  const results = [];
  for (const s of sampleIncidents) {
    const incId = `INC-PAK-${Math.floor(Math.random() * 10000)}`;
    const doc = await processIncidentTask({
      incidentId: incId,
      title: s.title,
      rawPayload: s.rawPayload,
      coordinates: s.coordinates as [number, number]
    });
    results.push(doc);
  }

  return res.json({ message: 'Seeded Pakistan sample emergency incidents successfully', count: results.length, incidents: results });
});

export default router;
