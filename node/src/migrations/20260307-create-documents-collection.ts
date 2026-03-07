import mongoose from 'mongoose';

export const up = async () => {
  const documentSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    type: { type: String, enum: ['Certificate', 'Degree'], required: true },
    filePath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  });

  mongoose.model('Document', documentSchema);
};

export const down = async () => {
  await mongoose.connection.dropCollection('documents');
};
