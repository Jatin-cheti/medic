'use strict';

// No imports needed - db and client are passed as parameters

module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        // Check if collection exists
        const collections = await db.listCollections({ name: 'message_attachments' }).toArray();

        if (collections.length === 0) {
          // Create message_attachments collection
          await db.createCollection('message_attachments', {
            validator: {
              $jsonSchema: {
                bsonType: 'object',
                required: ['message_id', 'file_url', 'file_name', 'created_at'],
                properties: {
                  _id: { bsonType: 'objectId' },
                  message_id: { bsonType: 'objectId', description: 'Reference to message' },
                  file_url: { bsonType: 'string', description: 'URL to the attached file' },
                  file_name: { bsonType: 'string', description: 'Name of the file' },
                  file_type: { bsonType: 'string', description: 'MIME type of the file' },
                  file_size: { bsonType: 'long', description: 'Size of file in bytes' },
                  metadata: { bsonType: 'object', description: 'Additional metadata' },
                  created_at: { bsonType: 'date', description: 'Upload timestamp' }
                }
              }
            }
          });
        }

        // Create indexes
        await db.collection('message_attachments').createIndex({ message_id: 1 });
        await db.collection('message_attachments').createIndex({ created_at: -1 });
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.collection('message_attachments').drop();
      });
    } finally {
      await session.endSession();
    }
  }
};
