import { MessageModel } from './messages.model';
import { AttachmentModel } from './attachments.model';
import { MessageReceiptModel } from './messageReceipts.model';
/**
 * Ensure models are registered and indexes are built.
 * Call this after mongoose.connect()
 */
export declare function initMongooseModels(): Promise<void>;
/**
 * Export models for convenient imports
 */
export { MessageModel, AttachmentModel, MessageReceiptModel };
