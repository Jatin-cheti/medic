import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttachment extends Document {
  uuid?: string;
  filename: string;
  contentType: string;
  size: number;
  storageKey: string; // S3 key or local path
  uploadedBy: number; // user id
  messageUuid?: string | null;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>({
  uuid: { type: String, required: false, unique: true, sparse: true },
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  size: { type: Number, required: true },
  storageKey: { type: String, required: true },
  uploadedBy: { type: Number, required: true, index: true },
  messageUuid: { type: String, required: false, index: true },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, {
  collection: 'attachments',
  timestamps: true
});

AttachmentSchema.index({ uploadedBy: 1 });
AttachmentSchema.index({ messageUuid: 1 });

export const AttachmentModel: Model<IAttachment> = mongoose.models.Attachment || mongoose.model<IAttachment>('Attachment', AttachmentSchema);