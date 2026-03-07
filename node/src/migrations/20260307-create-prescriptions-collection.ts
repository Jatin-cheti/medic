import { Db } from 'mongodb';

module.exports = {
  async up(db: Db) {
    await db.createCollection('prescriptions', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'type', 'filePath', 'uploadedAt'],
          properties: {
            userId: {
              bsonType: 'int',
              description: 'must be an integer and is required',
            },
            type: {
              enum: ['Image', 'Text'],
              description: 'must be either Image or Text and is required',
            },
            filePath: {
              bsonType: 'string',
              description: 'must be a string and is required',
            },
            uploadedAt: {
              bsonType: 'date',
              description: 'must be a date and is required',
            },
          },
        },
      },
    });
  },
  async down(db: Db) {
    await db.collection('prescriptions').drop();
  },
};
