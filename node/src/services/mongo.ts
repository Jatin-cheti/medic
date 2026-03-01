import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { initMongooseModels } from '../model/mongo';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/chatdb';

export async function initMongo() {
  try {
    // connect
    await mongoose.connect(MONGO_URL, {
      // use new parser / topology are defaults on modern drivers
      // keep retryWrites/defaults as desired
    });
    console.log('MongoDB connected to', MONGO_URL);

    // initialize models & ensure indexes
    await initMongooseModels();

    // optionally expose connection
    return mongoose.connection;
  } catch (err) {
    console.error('MongoDB connection error', err);
    throw err;
  }
}