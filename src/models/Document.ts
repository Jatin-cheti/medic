import mongoose, { Document, Schema } from 'mongoose';

interface IDocument extends Document {
    doctorId: string;
    filePath: string;
    status: 'pending' | 'approved' | 'rejected';
}

const DocumentSchema: Schema = new Schema({
    doctorId: { type: String, required: true },
    filePath: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model<IDocument>('Document', DocumentSchema);
