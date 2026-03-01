"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
const socket_io_1 = require("socket.io");
const jwt = __importStar(require("jsonwebtoken"));
const redis_1 = require("redis");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const JWT_SECRET = process.env.JWT_SECRET || 'please_change_me';
async function initSocket(server) {
    // configure Redis adapter if REDIS_URL provided
    let io;
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    if (redisUrl) {
        const pubClient = (0, redis_1.createClient)({ url: redisUrl });
        const subClient = pubClient.duplicate();
        await pubClient.connect().catch((err) => {
            console.warn('Redis connect warning:', err.message || err);
        });
        await subClient.connect().catch(() => { });
        io = new socket_io_1.Server(server, {
            path: '/ws',
            cors: { origin: process.env.FRONTEND_ORIGIN || '*' }
        });
        io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
        console.log('Socket.IO using Redis adapter (if connected)');
    }
    else {
        io = new socket_io_1.Server(server, {
            path: '/ws',
            cors: { origin: process.env.FRONTEND_ORIGIN || '*' }
        });
    }
    // middleware: authenticate on handshake via token query param or header
    io.use((socket, next) => {
        try {
            const token = (socket.handshake.auth && socket.handshake.auth.token) ||
                socket.handshake.headers['authorization']?.replace(/^Bearer\s/, '');
            if (!token)
                return next(new Error('Authentication error: token missing'));
            const payload = jwt.verify(token, JWT_SECRET);
            socket.user = { id: payload.userId, email: payload.email };
            return next();
        }
        catch (err) {
            console.warn('Socket auth failed', err);
            return next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        const user = socket.user;
        console.log(`User connected: ${user?.id} socketId=${socket.id}`);
        // join a room for this user (useful for pushing to specific user across devices)
        socket.join(`user:${user.id}`);
        socket.on('message:send', (payload) => {
            // basic validation & echo to a conversation room
            const { conversationId, content } = payload || {};
            const msg = {
                conversationId,
                content,
                from: user.id,
                ts: new Date().toISOString()
            };
            if (conversationId) {
                io.to(`conversation:${conversationId}`).emit('message:receive', msg);
            }
            else {
                // broadcast to all connected (for testing)
                io.emit('message:receive', msg);
            }
        });
        socket.on('join:conversation', (conversationId) => {
            if (!conversationId)
                return;
            socket.join(`conversation:${conversationId}`);
            socket.emit('joined', { conversationId });
        });
        socket.on('disconnect', (reason) => {
            console.log(`Socket disconnected: ${socket.id} reason=${reason}`);
            // cleanup if needed
        });
    });
    return io;
}
