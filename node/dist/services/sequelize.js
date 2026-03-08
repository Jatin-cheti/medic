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
const firstNonEmpty = (...values) => {
    for (const value of values) {
        if (value && value.trim() !== '') {
            return value;
        }
    }
    return undefined;
};
// Prefer a supplied DATABASE_URL, otherwise build one from individual env vars
const envDatabaseUrl = firstNonEmpty(process.env.DATABASE_URL, process.env.MYSQL_URL, process.env.MYSQLDATABASE_URL);
const dbHost = firstNonEmpty(process.env.DB_HOST, process.env.MYSQLHOST) || '127.0.0.1';
const dbPort = firstNonEmpty(process.env.DB_PORT, process.env.MYSQLPORT) || '3306';
const dbUser = firstNonEmpty(process.env.DB_USER, process.env.DB_USERNAME, process.env.MYSQLUSER) || 'root';
const dbPass = firstNonEmpty(process.env.DB_PASS, process.env.DB_PASSWORD, process.env.MYSQLPASSWORD) || 'password';
const dbName = firstNonEmpty(process.env.DB_NAME, process.env.DB_DATABASE, process.env.MYSQLDATABASE) || 'chatdb';
let sequelize;
if (envDatabaseUrl) {
    console.log('Using database URL from environment.');
    exports.sequelize = sequelize = new sequelize_1.Sequelize(envDatabaseUrl, {
        dialect: 'mysql',
        logging: process.env.SEQUELIZE_LOG === 'true' ? console.log : false,
        dialectOptions: {}
    });
}
else {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Database configuration missing in production. Set one of DATABASE_URL / MYSQL_URL / MYSQLDATABASE_URL, or MYSQLHOST+MYSQLPORT+MYSQLUSER+MYSQLPASSWORD+MYSQLDATABASE.');
    }
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
        if (process.env.NODE_ENV !== 'production') {
            await sequelize.sync({ alter: false });
        }
    }
    catch (err) {
        console.error('Sequelize initialization error:', err);
        throw err;
    }
}
