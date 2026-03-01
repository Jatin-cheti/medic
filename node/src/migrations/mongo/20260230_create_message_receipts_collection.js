'use strict';

// No imports needed - db and client are passed as parameters

module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        // Check if collection exists
        const collections = await db.listCollections({ name: 'message_receipts' }).toArray();

        if (collections.length === 0) {
          // Create message_receipts collection for tracking message delivery and read status
          await db.createCollection('message_receipts', {
            validator: {
              $jsonSchema: {
                bsonType: 'object',
                required: ['message_id', 'recipient_id', 'status'],
                properties: {
                  _id: { bsonType: 'objectId' },
                  message_id: { bsonType: 'objectId', description: 'Reference to message' },
                  recipient_id: { bsonType: ['int', 'long', 'double'], description: 'User ID of recipient' },
                  status: { bsonType: 'string', enum: ['sent', 'delivered', 'read', 'failed'], description: 'Delivery/read status' },
                  delivered_at: { bsonType: 'date', description: 'When message was delivered' },
                  read_at: { bsonType: 'date', description: 'When message was read' },
                  created_at: { bsonType: 'date', description: 'Record creation timestamp' }
                }
              }
            }
          });
        }

        // Create indexes
        await db.collection('message_receipts').createIndex({ message_id: 1, recipient_id: 1 });
        await db.collection('message_receipts').createIndex({ recipient_id: 1, created_at: -1 });
        await db.collection('message_receipts').createIndex({ status: 1 });
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.collection('message_receipts').drop();
      });
    } finally {
      await session.endSession();
    }
  }
};
