import mongoose, { Document, Schema } from 'mongoose';

export interface IPrescription extends Document {
  patientId: string;
  doctorId: string;
  prescriptionText?: string;
  prescriptionImage?: string;
  createdAt: Date;
}

const prescriptionSchema: Schema = new Schema({
  patientId: { type: String, required: true },
  doctorId: { type: String, required: true },
  prescriptionText: { type: String, required: false },
  prescriptionImage: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

const Prescription = mongoose.model<IPrescription>('Prescription', prescriptionSchema);
export default Prescription;
