'use strict';

// No imports needed - db and client are passed as parameters

module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        // Check if collection exists
        const collections = await db.listCollections({ name: 'ai_symptom_history' }).toArray();

        if (collections.length === 0) {
          // Create ai_symptom_history collection for AI symptom checker usage tracking
          await db.createCollection('ai_symptom_history', {
            validator: {
              $jsonSchema: {
                bsonType: 'object',
                required: ['user_id', 'symptoms', 'language', 'created_at'],
                properties: {
                  _id: { bsonType: 'objectId' },
                  user_id: { bsonType: ['int', 'long', 'double'], description: 'Patient user ID' },
                  symptoms: { bsonType: 'array', description: 'List of reported symptoms', items: { bsonType: 'string' } },
                  ai_response: { bsonType: 'string', description: 'AI generated response/suggestions' },
                  severity_level: { bsonType: 'string', enum: ['mild', 'moderate', 'severe'], description: 'Symptom severity level' },
                  language: { bsonType: 'string', description: 'Language code used for the check' },
                  doctor_consultation_done: { bsonType: 'bool', description: 'Whether patient consulted doctor after this check' },
                  doctor_id: { bsonType: ['int', 'long', 'double'], description: 'Doctor ID if consulted' },
                  appointment_id: { bsonType: ['int', 'long', 'double'], description: 'Appointment ID if booked' },
                  created_at: { bsonType: 'date', description: 'Check timestamp' },
                  updated_at: { bsonType: 'date', description: 'Last update timestamp' }
                }
              }
            }
          });
        }

        // Create indexes
        await db.collection('ai_symptom_history').createIndex({ user_id: 1, created_at: -1 });
        await db.collection('ai_symptom_history').createIndex({ created_at: -1 });
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.collection('ai_symptom_history').drop();
      });
    } finally {
      await session.endSession();
    }
  }
};
