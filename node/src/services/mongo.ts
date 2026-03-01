import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { initMongooseModels } from '../model/mongo';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || process.env.MONGODB_URL;

export async function initMongo() {
  // Skip MongoDB if not configured
  if (!MONGO_URL || MONGO_URL.trim() === '') {
    console.log('⚠️  MongoDB URL not set - skipping MongoDB initialization');
    return null;
  }

  try {
    // connect
    await mongoose.connect(MONGO_URL, {
      // use new parser / topology are defaults on modern drivers
      // keep retryWrites/defaults as desired
    });
    console.log('✅ MongoDB connected to', MONGO_URL.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials in logs

    // initialize models & ensure indexes
    await initMongooseModels();

    // optionally expose connection
    return mongoose.connection;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('❌ MongoDB connection error:', errorMsg);
    console.log('⚠️  Continuing without MongoDB - some features may be unavailable');
    return null;
  }
}