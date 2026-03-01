'use strict';

// No imports needed - db and client are passed as parameters

module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const now = new Date();
        
        // Seed sample messages
        await db.collection('messages').insertMany([
          {
            conversation_id: 1,
            sender_id: 6, // Patient Arjun
            content: 'Hi Dr. Rajesh, thank you for your consultation yesterday.',
            message_type: 'text',
            is_edited: false,
            is_deleted: false,
            created_at: now,
            updated_at: now
          },
          {
            conversation_id: 1,
            sender_id: 2, // Dr. Rajesh
            content: 'Hello Arjun! Happy to help. Please remember to take the prescribed medications.',
            message_type: 'text',
            is_edited: false,
            is_deleted: false,
            created_at: new Date(now.getTime() + 60000),
            updated_at: new Date(now.getTime() + 60000)
          },
          {
            conversation_id: 2,
            sender_id: 7, // Patient Neha
            content: 'Doctor, I have some skin irritation issues. Can you advise?',
            message_type: 'text',
            is_edited: false,
            is_deleted: false,
            created_at: now,
            updated_at: now
          },
          {
            conversation_id: 2,
            sender_id: 3, // Dr. Priya
            content: 'Sure Neha. I would recommend a gentle moisturizer and sunscreen. Please avoid harsh soaps.',
            message_type: 'text',
            is_edited: false,
            is_deleted: false,
            created_at: new Date(now.getTime() + 120000),
            updated_at: new Date(now.getTime() + 120000)
          }
        ]);

        console.log('Messages seeded successfully');
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.collection('messages').deleteMany({});
        console.log('Messages seeded data removed');
      });
    } finally {
      await session.endSession();
    }
  }
};
