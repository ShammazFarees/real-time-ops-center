export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentCategory = 'FIRE' | 'MEDICAL' | 'SECURITY' | 'NATURAL_HAZARD';
export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface ActionStep {
  stepNumber: number;
  action: string;
  priority: 'URGENT' | 'HIGH' | 'ROUTINE';
  assignedRole: string;
  completed?: boolean;
}

export interface SuggestedUnit {
  unitId: string;
  name: string;
  unitType: string;
  distanceKm: number;
  etaMinutes: number;
  status: string;
}

export interface ReasoningStep {
  agentName: string;
  stepSummary: string;
  details: string;
  timestamp: string;
}

export interface AIAnalysis {
  category: IncidentCategory;
  severity: SeverityLevel;
  confidence: number;
  summary: string;
  suggestedUnits: SuggestedUnit[];
  actionPlan: ActionStep[];
  broadcastMessage: string;
  reasoningTrace: ReasoningStep[];
}

export interface Incident {
  _id?: string;
  incidentId: string;
  title: string;
  rawPayload: string;
  category: IncidentCategory;
  severity: SeverityLevel;
  status: IncidentStatus;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  aiAnalysis?: AIAnalysis;
  assignedUnitId?: string;
  createdAt: string;
  updatedAt: string;
}
