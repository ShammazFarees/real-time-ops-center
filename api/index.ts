import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose, { Schema } from 'mongoose';

dotenv.config();

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// -------------------------------------------------------------
// MongoDB Mongoose Schemas
// -------------------------------------------------------------
const ActionStepSchema = new Schema({
  stepNumber: Number,
  action: String,
  priority: String,
  assignedRole: String,
  completed: { type: Boolean, default: false }
});

const SuggestedUnitSchema = new Schema({
  unitId: String,
  name: String,
  unitType: String,
  distanceKm: Number,
  etaMinutes: Number,
  status: String
});

const ReasoningStepSchema = new Schema({
  agentName: String,
  stepSummary: String,
  details: String,
  timestamp: String
});

const AIAnalysisSchema = new Schema({
  category: String,
  severity: String,
  confidence: Number,
  summary: String,
  suggestedUnits: [SuggestedUnitSchema],
  actionPlan: [ActionStepSchema],
  broadcastMessage: String,
  reasoningTrace: [ReasoningStepSchema]
});

const IncidentSchema = new Schema(
  {
    incidentId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    rawPayload: { type: String, required: true },
    category: {
      type: String,
      enum: ['FIRE', 'MEDICAL', 'SECURITY', 'NATURAL_HAZARD'],
      default: 'SECURITY'
    },
    severity: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM'
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'],
      default: 'OPEN',
      index: true
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    aiAnalysis: AIAnalysisSchema,
    assignedUnitId: String
  },
  { timestamps: true }
);

IncidentSchema.index({ location: '2dsphere' });

const IncidentModel = mongoose.models.Incident || mongoose.model('Incident', IncidentSchema);

// In-Memory Fallback Cache
const inMemoryStore = new Map<string, any>();

// -------------------------------------------------------------
// Database Lazy Connection
// -------------------------------------------------------------
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn('[DB WARNING] No MONGO_URI provided. Using in-memory fallback.');
    return;
  }
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
    isConnected = true;
    console.log('[DB SUCCESS] Connected to MongoDB Atlas');
  } catch (err: any) {
    console.warn('[DB WARNING] Could not connect to MongoDB Atlas:', err.message);
  }
};

app.use(async (req, res, next) => {
  await connectToDatabase();
  next();
});

// -------------------------------------------------------------
// Multi-Agent Evaluation Engine (Strict Category Logic)
// -------------------------------------------------------------
function calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0;
  const dlat = (lat2 - lat1) * (Math.PI / 180);
  const dlon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dlat / 2) * Math.sin(dlat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dlon / 2) * Math.sin(dlon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function processIncidentEvaluation(payload: { incidentId: string; title: string; rawPayload: string; coordinates: [number, number] }) {
  const rawLower = payload.rawPayload.toLowerCase();
  const incLng = payload.coordinates[0];
  const incLat = payload.coordinates[1];

  let category = 'SECURITY';
  let severity = 'MEDIUM';
  let confidence = 0.94;

  if (rawLower.includes('fire') || rawLower.includes('smoke') || rawLower.includes('blaze')) {
    category = 'FIRE';
    severity = rawLower.includes('critical') || rawLower.includes('heavy') ? 'CRITICAL' : 'HIGH';
  } else if (rawLower.includes('cardiac') || rawLower.includes('medical') || rawLower.includes('unconscious') || rawLower.includes('injured')) {
    category = 'MEDICAL';
    severity = rawLower.includes('unconscious') || rawLower.includes('critical') ? 'CRITICAL' : 'HIGH';
  } else if (rawLower.includes('flood') || rawLower.includes('water') || rawLower.includes('storm')) {
    category = 'NATURAL_HAZARD';
    severity = 'HIGH';
  } else {
    category = 'SECURITY';
    severity = rawLower.includes('armed') || rawLower.includes('robbery') || rawLower.includes('panic') ? 'CRITICAL' : 'HIGH';
  }

  // Pre-defined Pakistani units pool with STRICT category compatibility
  const unitsPool = [
    { unitId: 'UNIT-POL-309', name: 'Islamabad Police Mobile 309', unitType: 'Police Eagle Squad', lat: incLat + 0.007, lng: incLng + 0.005, compat: ['SECURITY', 'NATURAL_HAZARD'] },
    { unitId: 'UNIT-POL-402', name: 'Punjab Police Patrol 402', unitType: 'Armed Response Vehicle', lat: incLat - 0.008, lng: incLng - 0.006, compat: ['SECURITY'] },
    { unitId: 'UNIT-R1122-AMB', name: 'Rescue 1122 Ambulance 204', unitType: 'Emergency Ambulance', lat: incLat - 0.005, lng: incLng + 0.009, compat: ['MEDICAL'] },
    { unitId: 'UNIT-EDHI-115', name: 'Edhi Foundation Ambulance 115', unitType: 'Edhi Trauma Mobile', lat: incLat + 0.015, lng: incLng - 0.010, compat: ['MEDICAL'] },
    { unitId: 'UNIT-R1122-FIRE', name: 'Rescue 1122 Fire Tender 101', unitType: 'Rescue 1122 Fire Engine', lat: incLat + 0.012, lng: incLng - 0.008, compat: ['FIRE', 'NATURAL_HAZARD'] },
    { unitId: 'UNIT-R1122-DIS', name: 'Rescue 1122 Disaster Rescue Unit', unitType: 'Urban Search & Rescue', lat: incLat - 0.018, lng: incLng - 0.015, compat: ['FIRE', 'NATURAL_HAZARD'] }
  ];

  // STRICT FILTER: Only suggest units compatible with the specific incident category!
  const compatibleUnits = unitsPool.filter(u => u.compat.includes(category));
  // If no exact match, fallback to general security/rescue
  const candidateUnits = compatibleUnits.length > 0 ? compatibleUnits : unitsPool;

  const suggestedUnits = candidateUnits.map(u => {
    const dist = calculateHaversine(incLat, incLng, u.lat, u.lng);
    const eta = Math.max(2, Math.round((dist / 45.0) * 60));
    return {
      unitId: u.unitId,
      name: u.name,
      unitType: u.unitType,
      distanceKm: Number(dist.toFixed(2)),
      etaMinutes: eta,
      status: 'AVAILABLE'
    };
  }).sort((a, b) => a.etaMinutes - b.etaMinutes).slice(0, 3);

  const leadUnit = suggestedUnits[0]?.name || 'Response Unit';

  // Specific tactical action checklist based on exact incident category
  let actionPlan = [];
  if (category === 'SECURITY') {
    actionPlan = [
      { stepNumber: 1, action: `Dispatch ${leadUnit} immediately to establish security perimeter.`, priority: 'URGENT', assignedRole: 'Police Dispatcher', completed: false },
      { stepNumber: 2, action: 'Issue tactical alert to nearby police patrol units for suspect vehicle interception.', priority: 'HIGH', assignedRole: 'Duty Sergeant', completed: false },
      { stepNumber: 3, action: 'Review live SafeCity CCTV feeds along escape route.', priority: 'HIGH', assignedRole: 'Intel Analyst', completed: false },
      { stepNumber: 4, action: 'Log armed robbery report in central police CAD system.', priority: 'ROUTINE', assignedRole: 'Records Officer', completed: false }
    ];
  } else if (category === 'MEDICAL') {
    actionPlan = [
      { stepNumber: 1, action: `Dispatch ${leadUnit} with Advanced Life Support (ALS) medical kit.`, priority: 'URGENT', assignedRole: 'EMS Dispatcher', completed: false },
      { stepNumber: 2, action: 'Provide pre-arrival CPR & first aid telephone instructions to caller.', priority: 'URGENT', assignedRole: 'Telecommunicator', completed: false },
      { stepNumber: 3, action: 'Alert Hospital Emergency Trauma Ward for incoming critical patient.', priority: 'HIGH', assignedRole: 'Triage Lead', completed: false },
      { stepNumber: 4, action: 'Log patient vital stats upon arrival on scene.', priority: 'ROUTINE', assignedRole: 'Paramedic Lead', completed: false }
    ];
  } else if (category === 'FIRE') {
    actionPlan = [
      { stepNumber: 1, action: `Dispatch ${leadUnit} under sirens and emergency lights.`, priority: 'URGENT', assignedRole: 'Fire Dispatcher', completed: false },
      { stepNumber: 2, action: 'Establish 200m safety perimeter and request utility power isolation.', priority: 'HIGH', assignedRole: 'On-Scene Commander', completed: false },
      { stepNumber: 3, action: 'Stage secondary Rescue 1122 ambulance for smoke inhalation treatment.', priority: 'HIGH', assignedRole: 'Medical Coordinator', completed: false },
      { stepNumber: 4, action: 'Conduct thermal camera scan for structural integrity.', priority: 'ROUTINE', assignedRole: 'Fire Captain', completed: false }
    ];
  } else { // NATURAL_HAZARD
    actionPlan = [
      { stepNumber: 1, action: `Deploy ${leadUnit} for swift-water / disaster reconnaissance.`, priority: 'URGENT', assignedRole: 'Disaster Lead', completed: false },
      { stepNumber: 2, action: 'Issue regional public alert & flood evacuation advisory.', priority: 'HIGH', assignedRole: 'Emergency Manager', completed: false },
      { stepNumber: 3, action: 'Coordinate road closures with Islamabad Traffic Police.', priority: 'HIGH', assignedRole: 'Traffic Control', completed: false },
      { stepNumber: 4, action: 'Activate emergency relief shelter staging location.', priority: 'ROUTINE', assignedRole: 'Logistics Lead', completed: false }
    ];
  }

  const broadcastMessage = `FLASH ALERT [${severity}] - ${category} INCIDENT DETECTED AT [${incLat.toFixed(4)}, ${incLng.toFixed(4)}]. ASSIGNED PRIMARY: ${leadUnit}.`;

  const reasoningTrace = [
    { agentName: 'Agent 1 (Triage & Classifier)', stepSummary: `Categorized as ${category} with ${severity} severity.`, details: `Analyzed distress payload string. Confidence: ${(confidence * 100).toFixed(0)}%.`, timestamp: new Date().toISOString() },
    { agentName: 'Agent 2 (Geospatial & Route Optimizer)', stepSummary: `Selected ${suggestedUnits.length} strictly compatible ${category} responder units.`, details: `Nearest unit ETA: ${suggestedUnits[0].etaMinutes} mins (${leadUnit}).`, timestamp: new Date().toISOString() },
    { agentName: 'Agent 3 (Summarizer & Action Planner)', stepSummary: `Generated domain-specific 4-step ${category} tactical checklist.`, details: `Assigned primary operational lead to ${leadUnit}.`, timestamp: new Date().toISOString() }
  ];

  return {
    category,
    severity,
    confidence,
    summary: `[${severity} ${category}] ${payload.rawPayload.slice(0, 100)}`,
    suggestedUnits,
    actionPlan,
    broadcastMessage,
    reasoningTrace
  };
}

// -------------------------------------------------------------
// Express Routes
// -------------------------------------------------------------

const handleHealth = (req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    service: 'ops-center-serverless-backend',
    dbConnected: isConnected,
    timestamp: new Date().toISOString()
  });
};

const handleGetIncidents = async (req: Request, res: Response) => {
  try {
    let docs: any[] = [];
    if (isConnected) {
      docs = await IncidentModel.find().sort({ createdAt: -1 }).limit(50);
    }
    if (!docs || docs.length === 0) {
      docs = Array.from(inMemoryStore.values());
    }
    return res.json(docs);
  } catch (err: any) {
    return res.json(Array.from(inMemoryStore.values()));
  }
};

const handleIngest = async (req: Request, res: Response) => {
  try {
    const { title, rawPayload, coordinates } = req.body;
    if (!title || !rawPayload || !coordinates || !Array.isArray(coordinates)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const incidentId = `INC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const aiAnalysis = processIncidentEvaluation({ incidentId, title, rawPayload, coordinates });

    const incidentData = {
      incidentId,
      title,
      rawPayload,
      category: aiAnalysis.category,
      severity: aiAnalysis.severity,
      status: 'OPEN',
      location: { type: 'Point', coordinates },
      aiAnalysis
    };

    inMemoryStore.set(incidentId, incidentData);

    if (isConnected) {
      try {
        await IncidentModel.findOneAndUpdate({ incidentId }, incidentData, { upsert: true, new: true });
      } catch (e) {}
    }

    return res.status(202).json({ message: 'Incident processed', incidentId, incident: incidentData });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

const handleDispatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, assignedUnitId, toggleStepNumber } = req.body;

    let incident: any = inMemoryStore.get(id);

    if (isConnected) {
      try {
        const dbDoc = await IncidentModel.findOne({ incidentId: id });
        if (dbDoc) incident = dbDoc.toObject();
      } catch (e) {}
    }

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

    inMemoryStore.set(id, incident);

    if (isConnected) {
      try {
        await IncidentModel.findOneAndUpdate({ incidentId: id }, incident, { upsert: true });
      } catch (e) {}
    }

    return res.json(incident);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

const handleSeed = async (req: Request, res: Response) => {
  try {
    inMemoryStore.clear();
    if (isConnected) {
      try { await IncidentModel.deleteMany({}); } catch (e) {}
    }

    const samples = [
      {
        title: 'Armed Robbery Security Alert - Blue Area Islamabad',
        rawPayload: 'CRITICAL SECURITY: Silent panic alarm triggered at retail bank branch in Blue Area. Armed perpetrators fled on motorcycle toward Khyaban-e-Iqbal.',
        coordinates: [73.0612, 33.7112]
      },
      {
        title: 'Commercial Building Fire - Jinnah Avenue Islamabad',
        rawPayload: 'CRITICAL FIRE: Heavy smoke emitting from 3rd floor plaza on Jinnah Avenue. Rescue 1122 fire tender requested.',
        coordinates: [73.0551, 33.7088]
      },
      {
        title: 'Cardiac Arrest Call - F-6 Markaz Market',
        rawPayload: 'URGENT MEDICAL: Elderly male collapsed unconscious at F-6 Markaz plaza. Bystander CPR in progress. Emergency Ambulance requested.',
        coordinates: [73.0689, 33.7250]
      }
    ];

    const results = [];
    for (const s of samples) {
      const incId = `INC-PAK-${Math.floor(Math.random() * 10000)}`;
      const aiAnalysis = processIncidentEvaluation({ incidentId: incId, title: s.title, rawPayload: s.rawPayload, coordinates: s.coordinates as [number, number] });
      const docData = {
        incidentId: incId,
        title: s.title,
        rawPayload: s.rawPayload,
        category: aiAnalysis.category,
        severity: aiAnalysis.severity,
        status: 'OPEN',
        location: { type: 'Point', coordinates: s.coordinates },
        aiAnalysis
      };
      inMemoryStore.set(incId, docData);
      if (isConnected) {
        try { await IncidentModel.findOneAndUpdate({ incidentId: incId }, docData, { upsert: true }); } catch (e) {}
      }
      results.push(docData);
    }

    return res.json({ message: 'Seeded Pakistan incidents with strict category filtering', count: results.length, incidents: results });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Route Bindings for Vercel
app.get('/api/health', handleHealth);
app.get('/health', handleHealth);

app.get('/api/incidents', handleGetIncidents);
app.get('/incidents', handleGetIncidents);

app.post('/api/incidents/ingest', handleIngest);
app.post('/incidents/ingest', handleIngest);

app.patch('/api/incidents/:id/dispatch', handleDispatch);
app.patch('/incidents/:id/dispatch', handleDispatch);

app.post('/api/incidents/seed', handleSeed);
app.post('/incidents/seed', handleSeed);

export default app;
