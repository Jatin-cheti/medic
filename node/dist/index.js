"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const websocket_1 = require("./websocket");
const auth_1 = __importDefault(require("./routes/auth"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const sequelize_1 = require("./services/sequelize");
const mongo_1 = require("./services/mongo");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200',
    credentials: true,
}));
app.use(express_1.default.json());
app.get('/', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', auth_1.default);
app.use('/auth', auth_1.default);
app.use('/api/patient', dashboard_1.default);
const server = http_1.default.createServer(app);
async function start() {
    try {
        await (0, sequelize_1.initSequelize)();
        await (0, mongo_1.initMongo)(); // MongoDB is now optional - won't crash if unavailable
    }
    catch (err) {
        console.error('DB init failed', err);
        // Only exit if MySQL (Sequelize) failed - app cannot work without it
        if (err instanceof Error && err.name && err.name.includes('Sequelize')) {
            process.exit(1);
        }
        console.log('⚠️  Continuing despite DB errors...');
    }
    // initialize WebSocket
    await (0, websocket_1.initSocket)(server).catch(err => {
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
