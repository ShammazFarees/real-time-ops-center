import mongoose, { Schema, Document } from 'mongoose';

export interface IActionStep {
  stepNumber: number;
  action: string;
  priority: 'URGENT' | 'HIGH' | 'ROUTINE';
  assignedRole: string;
  completed?: boolean;
}

export interface ISuggestedUnit {
  unitId: str;
  name: string;
  unitType: string;
  distanceKm: number;
  etaMinutes: number;
  status: string;
}

export interface IReasoningStep {
  agentName: string;
  stepSummary: string;
  details: string;
  timestamp: string;
}

export interface IAIAnalysis {
  category: 'FIRE' | 'MEDICAL' | 'SECURITY' | 'NATURAL_HAZARD';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  summary: string;
  suggestedUnits: ISuggestedUnit[];
  actionPlan: IActionStep[];
  broadcastMessage: string;
  reasoningTrace: IReasoningStep[];
}

export interface IIncident extends Document {
  incidentId: string;
  title: string;
  rawPayload: string;
  category: 'FIRE' | 'MEDICAL' | 'SECURITY' | 'NATURAL_HAZARD';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  aiAnalysis?: IAIAnalysis;
  assignedUnitId?: string;
  createdAt: Date;
  updatedAt: Date;
}

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

const IncidentSchema = new Schema<IIncident>(
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
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    aiAnalysis: AIAnalysisSchema,
    assignedUnitId: String
  },
  { timestamps: true }
);

IncidentSchema.index({ location: '2dsphere' });

export const Incident = mongoose.model<IIncident>('Incident', IncidentSchema);
