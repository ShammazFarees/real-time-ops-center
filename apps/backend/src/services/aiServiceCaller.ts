import axios from 'axios';
import { IAIAnalysis } from '../models/Incident';

export interface IncidentPayloadInput {
  incidentId: string;
  rawPayload: string;
  coordinates: [number, number]; // [lng, lat]
}

export const callAIService = async (payload: IncidentPayloadInput): Promise<IAIAnalysis> => {
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000/api/v1/analyze-incident';

  try {
    const response = await axios.post(aiServiceUrl, {
      incidentId: payload.incidentId,
      rawPayload: payload.rawPayload,
      coordinates: payload.coordinates,
      source: 'NODE_BACKEND_QUEUE'
    }, { timeout: 8000 });

    return response.data as IAIAnalysis;
  } catch (error: any) {
    console.warn(`[AI CALLER WARNING] Failed to reach Python AI service at ${aiServiceUrl}: ${error.message}. Executing localized fallback analysis.`);
    
    // In-memory fallback if AI microservice is temporarily offline
    const rawLower = payload.rawPayload.toLowerCase();
    const category = rawLower.includes('fire') ? 'FIRE' :
                     rawLower.includes('medical') || rawLower.includes('cardiac') ? 'MEDICAL' :
                     rawLower.includes('flood') || rawLower.includes('storm') ? 'NATURAL_HAZARD' : 'SECURITY';
    
    const severity = rawLower.includes('critical') || rawLower.includes('massive') || rawLower.includes('unconscious') ? 'CRITICAL' : 'HIGH';

    return {
      category,
      severity,
      confidence: 0.85,
      summary: `[FALLBACK ${severity} ${category}] ${payload.rawPayload.slice(0, 100)}`,
      suggestedUnits: [
        {
          unitId: 'UNIT-ENG-101',
          name: 'Engine 101 (Ladder)',
          unitType: 'Fire Engine',
          distanceKm: 1.4,
          etaMinutes: 3,
          status: 'AVAILABLE'
        },
        {
          unitId: 'UNIT-MED-204',
          name: 'Medic Ambulance 204',
          unitType: 'Ambulance',
          distanceKm: 2.1,
          etaMinutes: 5,
          status: 'AVAILABLE'
        }
      ],
      actionPlan: [
        { stepNumber: 1, action: 'Dispatch primary available response unit immediately.', priority: 'URGENT', assignedRole: 'Dispatcher', completed: false },
        { stepNumber: 2, action: 'Establish on-scene perimeter and evaluate hazards.', priority: 'HIGH', assignedRole: 'On-Scene Commander', completed: false },
        { stepNumber: 3, action: 'Broadcast alert to regional emergency services network.', priority: 'ROUTINE', assignedRole: 'Comms Tech', completed: false }
      ],
      broadcastMessage: `FLASH ALERT [${severity}] - ${category} Incident active at [${payload.coordinates[1]}, ${payload.coordinates[0]}].`,
      reasoningTrace: [
        {
          agentName: 'Fallback Local Orchestrator',
          stepSummary: 'AI Service unreachable; applied localized rule engine.',
          details: `Processed payload: "${payload.rawPayload.slice(0, 60)}..."`,
          timestamp: new Date().toISOString()
        }
      ]
    };
  }
};
