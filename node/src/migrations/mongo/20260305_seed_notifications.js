'use strict';

// No imports needed - db and client are passed as parameters

module.exports = {
  async up(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const now = new Date();
        
        // Seed sample notifications
        await db.collection('notifications').insertMany([
          {
            user_id: 6, // Patient Arjun
            type: 'appointment_confirmed',
            title: 'Appointment Confirmed',
            body: 'Your appointment with Dr. Rajesh Kumar has been confirmed for tomorrow at 10:00 AM',
            related_id: 1,
            is_read: true,
            read_at: new Date(now.getTime() - 3600000),
            metadata: { doctor_name: 'Dr. Rajesh Kumar' },
            created_at: new Date(now.getTime() - 7200000)
          },
          {
            user_id: 6,
            type: 'prescription_uploaded',
            title: 'Prescription Available',
            body: 'Your prescription from Dr. Rajesh Kumar has been uploaded',
            related_id: 1,
            is_read: false,
            metadata: { doctor_name: 'Dr. Rajesh Kumar' },
            created_at: new Date(now.getTime() - 86400000)
          },
          {
            user_id: 7, // Patient Neha
            type: 'new_message',
            title: 'New Message',
            body: 'You have a new message from Dr. Priya Singh',
            related_id: 2,
            is_read: true,
            read_at: now,
            metadata: { sender_name: 'Dr. Priya Singh' },
            created_at: new Date(now.getTime() - 3600000)
          },
          {
            user_id: 2, // Dr. Rajesh
            type: 'new_message',
            title: 'New Message',
            body: 'Patient Arjun Verma has sent you a message',
            related_id: 1,
            is_read: false,
            metadata: { patient_name: 'Arjun Verma' },
            created_at: now
          }
        ]);

        console.log('Notifications seeded successfully');
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await db.collection('notifications').deleteMany({});
        console.log('Notifications seeded data removed');
      });
    } finally {
      await session.endSession();
    }
  }
};
