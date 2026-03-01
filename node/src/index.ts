import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import { initSocket } from './websocket';
import authRouter from './routes/auth';
import dashboardRouter from './routes/dashboard';
import { initSequelize } from './services/sequelize';
import { initMongo } from './services/mongo';

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200',
  credentials: true,
}));
app.use(express.json());
app.get('/', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', authRouter);
app.use('/auth', authRouter);
app.use('/api/patient', dashboardRouter);

const server = http.createServer(app);

async function start() {
  try {
    await initSequelize();
    await initMongo(); // MongoDB is now optional - won't crash if unavailable
  } catch (err) {
    console.error('DB init failed', err);
    // Only exit if MySQL (Sequelize) failed - app cannot work without it
    if (err instanceof Error && err.name && err.name.includes('Sequelize')) {
      process.exit(1);
    }
    console.log('⚠️  Continuing despite DB errors...');
  }

  // initialize WebSocket
  await initSocket(server).catch(err => {
    console.error('Socket init error', err);
    process.exit(1);
  });

  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`WebSocket path: /ws`);
  });
}

start();