import mongoose, { Schema, Document } from 'mongoose';

export interface IPrescription extends Document {
  userId: number;
  type: 'Image' | 'Text';
  filePath: string;
  uploadedAt: Date;
}

const PrescriptionSchema: Schema = new Schema({
  userId: { type: Number, required: true },
  type: { type: String, enum: ['Image', 'Text'], required: true },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
