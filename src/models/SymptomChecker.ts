import { Schema, model } from 'mongoose';

const symptomCheckerSchema = new Schema({
  symptoms: { type: [String], required: true },
  recommendations: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const SymptomChecker = model('SymptomChecker', symptomCheckerSchema);
