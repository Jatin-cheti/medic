import mongoose, { Schema, Document as MongoDocument } from 'mongoose';

export interface IDocument extends MongoDocument {
  userId: number;
  type: 'Certificate' | 'Degree' | 'Prescription';
  filePath: string;
  uploadedAt: Date;
}

const DocumentSchema: Schema = new Schema({
  userId: { type: Number, required: true },
  type: { type: String, enum: ['Certificate', 'Degree', 'Prescription'], required: true },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export const Document = mongoose.model<IDocument>('Document', DocumentSchema);
export default Document;
