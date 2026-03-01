'use strict';

// No imports needed - db and client are passed as parameters

module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        // Check if collection exists
        const collections = await db.listCollections({ name: 'messages' }).toArray();
        
        if (collections.length === 0) {
          // Create messages collection with schema validation
          await db.createCollection('messages', {
            validator: {
              $jsonSchema: {
                bsonType: 'object',
                required: ['conversation_id', 'sender_id', 'content', 'created_at'],
                properties: {
                  _id: { bsonType: 'objectId' },
                  conversation_id: { bsonType: ['int', 'long', 'double'], description: 'Foreign key to conversations' },
                  sender_id: { bsonType: ['int', 'long', 'double'], description: 'User ID of message sender' },
                  content: { bsonType: 'string', description: 'Message content' },
                  message_type: { bsonType: 'string', enum: ['text', 'image', 'file', 'video', 'audio'], description: 'Type of message' },
                  is_edited: { bsonType: 'bool', description: 'Whether message was edited' },
                  edited_at: { bsonType: 'date', description: 'When message was last edited' },
                  is_deleted: { bsonType: 'bool', description: 'Soft delete flag' },
                  deleted_at: { bsonType: 'date', description: 'When message was deleted' },
                  created_at: { bsonType: 'date', description: 'Message creation timestamp' },
                  updated_at: { bsonType: 'date', description: 'Last update timestamp' }
                }
              }
            }
          });
        }

        // Create indexes for messages (idempotent operation)
        await db.collection('messages').createIndex({ conversation_id: 1, created_at: -1 });
        await db.collection('messages').createIndex({ sender_id: 1 });
        await db.collection('messages').createIndex({ created_at: -1 });
        await db.collection('messages').createIndex({ is_deleted: 1 });
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.collection('messages').drop();
      });
    } finally {
      await session.endSession();
    }
  }
};
