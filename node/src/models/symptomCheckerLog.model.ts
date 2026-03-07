import mongoose, { Schema, Document } from 'mongoose';

export interface ISymptomCheckerLog extends Document {
  userId: number;
  symptoms: string[];
  diagnosis: string;
  recommendations: string[];
  createdAt: Date;
}

const SymptomCheckerLogSchema: Schema = new Schema({
  userId: { type: Number, required: true },
  symptoms: { type: [String], required: true },
  diagnosis: { type: String, required: true },
  recommendations: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now },
});

export const SymptomCheckerLogModel = mongoose.model<ISymptomCheckerLog>(
  'SymptomCheckerLog',
  SymptomCheckerLogSchema
);
