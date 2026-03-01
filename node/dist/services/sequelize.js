"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
exports.initSequelize = initSequelize;
const sequelize_1 = require("sequelize");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
// Prefer a supplied DATABASE_URL, otherwise build one from individual env vars
const envDatabaseUrl = process.env.DATABASE_URL;
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || '3306';
const dbUser = process.env.DB_USER || process.env.DB_USERNAME || 'root';
const dbPass = process.env.DB_PASS || process.env.DB_PASSWORD || 'password';
const dbName = process.env.DB_NAME || process.env.DB_DATABASE || 'chatdb';
let sequelize;
if (envDatabaseUrl && envDatabaseUrl.trim() !== '') {
    console.log('Using DATABASE_URL:', envDatabaseUrl);
    exports.sequelize = sequelize = new sequelize_1.Sequelize(envDatabaseUrl, {
        dialect: 'mysql',
        logging: process.env.SEQUELIZE_LOG === 'true' ? console.log : false,
        dialectOptions: {}
    });
}
else {
    const builtUrl = `mysql://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPass)}@${dbHost}:${dbPort}/${dbName}`;
    console.log('DATABASE_URL not set — built URL from env:', builtUrl);
    exports.sequelize = sequelize = new sequelize_1.Sequelize(dbName, dbUser, dbPass, {
        host: dbHost,
        port: Number(dbPort),
        dialect: 'mysql',
        logging: process.env.SEQUELIZE_LOG === 'true' ? console.log : false,
        dialectOptions: {}
    });
}
console.log('Sequelize resolved host:', sequelize.options.host, 'port:', sequelize.options.port);
// Load models
const db = {};
const modelPath = path_1.default.join(__dirname, '..', 'model');
if (fs_1.default.existsSync(modelPath)) {
    fs_1.default.readdirSync(modelPath)
        .filter(file => file.endsWith('.js') && !file.endsWith('.d.ts'))
        .forEach(file => {
        const model = require(path_1.default.join(modelPath, file))(sequelize, sequelize_1.DataTypes);
        db[model.name] = model;
    });
}
// Setup associations
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});
async function initSequelize() {
    try {
        await sequelize.authenticate();
        console.log('Sequelize: Connection established.');
        if (process.env.NODE_ENV !== 'production') {
            await sequelize.sync({ alter: true });
            console.log('Sequelize: Models synced with database.');
        }
    }
    catch (err) {
        console.error('Sequelize initialization error:', err);
        throw err;
    }
}
