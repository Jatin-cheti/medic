import mongoose from 'mongoose';
import { MessageModel } from './messages.model';
import { AttachmentModel } from './attachments.model';
import { MessageReceiptModel } from './messageReceipts.model';

/**
 * Ensure models are registered and indexes are built.
 * Call this after mongoose.connect()
 */
export async function initMongooseModels() {
  // Models are defined on import; ensure indexes are created
  await Promise.all([
    // init() ensures indexes for that model are created (returns a promise)
    // .init() uses the schema.index entries and creates them in MongoDB
    (MessageModel as any).init(),
    (AttachmentModel as any).init(),
    (MessageReceiptModel as any).init()
  ]);
  console.log('Mongoose models initialized: messages, attachments, message_receipts');
}

/**
 * Export models for convenient imports
 */
export {
  MessageModel,
  AttachmentModel,
  MessageReceiptModel
};