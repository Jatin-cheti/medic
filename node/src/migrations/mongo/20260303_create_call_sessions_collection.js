'use strict';

// No imports needed - db and client are passed as parameters

module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        // Check if collection exists
        const collections = await db.listCollections({ name: 'call_sessions' }).toArray();

        if (collections.length === 0) {
          // Create call_sessions collection for video/audio consultation tracking
          await db.createCollection('call_sessions', {
            validator: {
              $jsonSchema: {
                bsonType: 'object',
                required: ['appointment_id', 'initiated_by', 'created_at'],
                properties: {
                  _id: { bsonType: 'objectId' },
                  appointment_id: { bsonType: ['int', 'long', 'double'], description: 'Related appointment ID' },
                  initiated_by: { bsonType: ['int', 'long', 'double'], description: 'User ID who initiated the call' },
                  session_id: { bsonType: 'string', description: 'Unique session identifier' },
                  call_type: { bsonType: 'string', enum: ['video', 'audio', 'chat'], description: 'Type of consultation' },
                  status: { bsonType: 'string', enum: ['initiated', 'ringing', 'connected', 'ended', 'missed'], description: 'Call status' },
                  started_at: { bsonType: 'date', description: 'When call was connected' },
                  ended_at: { bsonType: 'date', description: 'When call ended' },
                  duration_seconds: { bsonType: 'int', description: 'Call duration in seconds' },
                  recording_url: { bsonType: 'string', description: 'URL to call recording (if available)' },
                  is_recorded: { bsonType: 'bool', description: 'Whether call was recorded' },
                  quality_metrics: { bsonType: 'object', description: 'Call quality metrics' },
                  created_at: { bsonType: 'date', description: 'Session creation timestamp' }
                }
              }
            }
          });
        }

        // Create indexes
        await db.collection('call_sessions').createIndex({ appointment_id: 1 });
        await db.collection('call_sessions').createIndex({ initiated_by: 1 });
        await db.collection('call_sessions').createIndex({ session_id: 1 });
        await db.collection('call_sessions').createIndex({ created_at: -1 });
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.collection('call_sessions').drop();
      });
    } finally {
      await session.endSession();
    }
  }
};
