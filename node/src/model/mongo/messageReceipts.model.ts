import mongoose, { Schema, Document, Model } from 'mongoose';

export type ReceiptStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface IMessageReceipt extends Document {
  messageUuid: string;
  userId: number; // user SQL id
  status: ReceiptStatus;
  deliveredAt?: Date | null;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const MessageReceiptSchema = new Schema<IMessageReceipt>({
  messageUuid: { type: String, required: true },
  userId: { type: Number, required: true },
  status: { type: String, required: true, enum: ['sent', 'delivered', 'read', 'failed'], default: 'sent' },
  deliveredAt: { type: Date, default: null },
  readAt: { type: Date, default: null }
}, {
  collection: 'message_receipts',
  timestamps: true
});

// compound unique (messageUuid + userId)
MessageReceiptSchema.index({ messageUuid: 1, userId: 1 }, { unique: true });
MessageReceiptSchema.index({ userId: 1, status: 1 });

export const MessageReceiptModel: Model<IMessageReceipt> = mongoose.models.MessageReceipt || mongoose.model<IMessageReceipt>('MessageReceipt', MessageReceiptSchema);