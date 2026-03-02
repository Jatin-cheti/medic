import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors, { CorsOptions } from 'cors';
import { initSocket } from './websocket';
import authRouter from './routes/auth';
import dashboardRouter from './routes/dashboard';
import { initSequelize } from './services/sequelize';
import { initMongo } from './services/mongo';
import { errorHandler, notFoundHandler } from './middleware/error-handler';

dotenv.config();

const app = express();
const envOrigins = [
  process.env.FRONTEND_ORIGIN,
  ...(process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()),
].filter(Boolean) as string[];

const defaultOrigins = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'https://medic-2istznwx5-jatin-chetis-projects.vercel.app',
];

const allowedOrigins = new Set<string>([...defaultOrigins, ...envOrigins]);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const isExplicitlyAllowed = allowedOrigins.has(origin);
    const isVercelPreview = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

    if (isExplicitlyAllowed || isVercelPreview) {
      callback(null, true);
      return;
    }

    const corsError = new Error(`CORS blocked for origin: ${origin}`) as Error & { statusCode?: number };
    corsError.statusCode = 403;
    callback(corsError);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.get('/', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', authRouter);
app.use('/auth', authRouter);
app.use('/api/patient', dashboardRouter);
app.use(notFoundHandler);
app.use(errorHandler);

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