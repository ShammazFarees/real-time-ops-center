import mongoose, { Schema, Document } from 'mongoose';

export interface IUnit extends Document {
  unitId: string;
  name: string;
  unitType: string;
  status: 'AVAILABLE' | 'DISPATCHED' | 'ON_SCENE' | 'OFFLINE';
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  assignedIncidentId?: string;
  updatedAt: Date;
}

const UnitSchema = new Schema<IUnit>(
  {
    unitId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    unitType: { type: String, required: true },
    status: {
      type: String,
      enum: ['AVAILABLE', 'DISPATCHED', 'ON_SCENE', 'OFFLINE'],
      default: 'AVAILABLE'
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
    assignedIncidentId: String
  },
  { timestamps: true }
);

UnitSchema.index({ location: '2dsphere' });

export const Unit = mongoose.model<IUnit>('Unit', UnitSchema);
