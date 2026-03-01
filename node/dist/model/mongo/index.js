"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageReceiptModel = exports.AttachmentModel = exports.MessageModel = void 0;
exports.initMongooseModels = initMongooseModels;
const messages_model_1 = require("./messages.model");
Object.defineProperty(exports, "MessageModel", { enumerable: true, get: function () { return messages_model_1.MessageModel; } });
const attachments_model_1 = require("./attachments.model");
Object.defineProperty(exports, "AttachmentModel", { enumerable: true, get: function () { return attachments_model_1.AttachmentModel; } });
const messageReceipts_model_1 = require("./messageReceipts.model");
Object.defineProperty(exports, "MessageReceiptModel", { enumerable: true, get: function () { return messageReceipts_model_1.MessageReceiptModel; } });
/**
 * Ensure models are registered and indexes are built.
 * Call this after mongoose.connect()
 */
async function initMongooseModels() {
    // Models are defined on import; ensure indexes are created
    await Promise.all([
        // init() ensures indexes for that model are created (returns a promise)
        // .init() uses the schema.index entries and creates them in MongoDB
        messages_model_1.MessageModel.init(),
        attachments_model_1.AttachmentModel.init(),
        messageReceipts_model_1.MessageReceiptModel.init()
    ]);
    console.log('Mongoose models initialized: messages, attachments, message_receipts');
}
