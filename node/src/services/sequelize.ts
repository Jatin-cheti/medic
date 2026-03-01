import Sequelize, { Sequelize as SequelizeType, DataTypes } from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Prefer a supplied DATABASE_URL, otherwise build one from individual env vars
const envDatabaseUrl = process.env.DATABASE_URL;
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || '3306';
const dbUser = process.env.DB_USER || process.env.DB_USERNAME || 'root';
const dbPass = process.env.DB_PASS || process.env.DB_PASSWORD || 'password';
const dbName = process.env.DB_NAME || process.env.DB_DATABASE || 'chatdb';

let sequelize: SequelizeType;

if (envDatabaseUrl && envDatabaseUrl.trim() !== '') {
  console.log('Using DATABASE_URL:', envDatabaseUrl);
  sequelize = new SequelizeType(envDatabaseUrl, {
    dialect: 'mysql',
    logging: process.env.SEQUELIZE_LOG === 'true' ? console.log : false,
    dialectOptions: {}
  });
} else {
  const builtUrl = `mysql://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPass)}@${dbHost}:${dbPort}/${dbName}`;
  console.log('DATABASE_URL not set — built URL from env:', builtUrl);
  sequelize = new SequelizeType(dbName, dbUser, dbPass, {
    host: dbHost,
    port: Number(dbPort),
    dialect: 'mysql',
    logging: process.env.SEQUELIZE_LOG === 'true' ? console.log : false,
    dialectOptions: {}
  });
}

console.log('Sequelize resolved host:', (sequelize as any).options.host, 'port:', (sequelize as any).options.port);

export { sequelize };

// Load models
const db: any = {};
const modelPath = path.join(__dirname, '..', 'model');
if (fs.existsSync(modelPath)) {
  fs.readdirSync(modelPath)
    .filter(file => file.endsWith('.js') && !file.endsWith('.d.ts'))
    .forEach(file => {
      const model = require(path.join(modelPath, file))(sequelize, DataTypes);
      db[model.name] = model;
    });
}

// Setup associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export async function initSequelize() {
  try {
    await sequelize.authenticate();
    console.log('Sequelize: Connection established.');
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('Sequelize: Models synced with database.');
    }
  } catch (err) {
    console.error('Sequelize initialization error:', err);
    throw err;
  }
}