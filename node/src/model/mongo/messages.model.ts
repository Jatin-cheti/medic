import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  uuid: string;
  conversationUuid: string;
  senderId: number; // or string if you use uuids
  type: string;
  content?: string;
  attachments?: Array<string>; // array of attachment uuids/storage keys
  editedAt?: Date | null;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  uuid: { type: String, required: true, unique: true, sparse: true },
  conversationUuid: { type: String, required: true, index: true },
  senderId: { type: Number, required: true, index: true },
  type: { type: String, required: true }, // TEXT, IMAGE, VIDEO, etc.
  content: { type: Schema.Types.Mixed },
  attachments: [{ type: String }],
  editedAt: { type: Date, default: null },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, {
  collection: 'messages',
  timestamps: true // adds createdAt and updatedAt fields
});

// indexes
MessageSchema.index({ conversationUuid: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });
// uuid unique index is declared in field definition (unique + sparse)

export const MessageModel: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);