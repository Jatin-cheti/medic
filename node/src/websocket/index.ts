import { createServer } from 'http';
import { Server } from 'socket.io';
import { Application } from 'express';
import * as jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import type { Server as HttpServer } from 'http';

const JWT_SECRET = process.env.JWT_SECRET || 'please_change_me';

export async function initSocket(server: HttpServer) {
  // Create Socket.IO server first
  const io = new Server(server, {
    path: '/ws',
    cors: { origin: process.env.FRONTEND_ORIGIN || '*' }
  });

  // Try to configure Redis adapter if REDIS_URL provided
  const redisUrl = process.env.REDIS_URL;
  
  if (redisUrl && redisUrl.trim() !== '' && !redisUrl.includes('localhost')) {
    try {
      const pubClient = createClient({ url: redisUrl });
      const subClient = pubClient.duplicate();

      await pubClient.connect();
      await subClient.connect();

      io.adapter(createAdapter(pubClient, subClient));
      console.log('✅ Socket.IO using Redis adapter');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn('⚠️  Redis connection failed:', errorMsg);
      console.log('⚠️  Socket.IO running without Redis (single-server mode)');
    }
  } else {
    console.log('✅ Socket.IO initialized (single-server mode, no Redis)');
  }

  // middleware: authenticate on handshake via token query param or header
io.use((socket, next) => {
  try {
    const token =
      (socket.handshake.auth && socket.handshake.auth.token) ||
      (socket.handshake.headers['authorization'] as string | undefined)?.replace(/^Bearer\s/, '');
    if (!token) return next(new Error('Authentication error: token missing'));

    const payload = jwt.verify(token, JWT_SECRET) as any;
    (socket as any).user = { id: payload.userId, email: payload.email };
    return next();
  } catch (err) {
    console.warn('Socket auth failed', err);
    return next(new Error('Authentication error'));
  }
});

  io.on('connection', (socket) => {
    const user = (socket as any).user;
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
      } else {
        // broadcast to all connected (for testing)
        io.emit('message:receive', msg);
      }
    });

    socket.on('join:conversation', (conversationId: string) => {
      if (!conversationId) return;
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