'use strict';

// No imports needed - db and client are passed as parameters

module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        // Check if collection exists
        const collections = await db.listCollections({ name: 'notifications' }).toArray();

        if (collections.length === 0) {
          // Create notifications collection
          await db.createCollection('notifications', {
            validator: {
              $jsonSchema: {
                bsonType: 'object',
                required: ['user_id', 'type', 'title', 'created_at'],
                properties: {
                  _id: { bsonType: 'objectId' },
                  user_id: { bsonType: ['int', 'long', 'double'], description: 'User ID of notification recipient' },
                  type: { bsonType: 'string', enum: ['appointment_confirmed', 'appointment_cancelled', 'new_message', 'doctor_verified', 'payment_received', 'prescription_uploaded', 'review_submitted'], description: 'Type of notification' },
                  title: { bsonType: 'string', description: 'Notification title' },
                  body: { bsonType: 'string', description: 'Notification message body' },
                  related_id: { bsonType: ['int', 'long', 'double'], description: 'ID of related entity (appointment, message, etc.)' },
                  is_read: { bsonType: 'bool', description: 'Whether notification has been read' },
                  read_at: { bsonType: 'date', description: 'When notification was read' },
                  metadata: { bsonType: 'object', description: 'Additional metadata' },
                  created_at: { bsonType: 'date', description: 'Notification creation timestamp' }
                }
              }
            }
          });
        }

        // Create indexes
        await db.collection('notifications').createIndex({ user_id: 1, created_at: -1 });
        await db.collection('notifications').createIndex({ user_id: 1, is_read: 1 });
        await db.collection('notifications').createIndex({ type: 1 });
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.collection('notifications').drop();
      });
    } finally {
      await session.endSession();
    }
  }
};
