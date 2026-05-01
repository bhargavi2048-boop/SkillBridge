/**
 * SkillBridge — Backend Server (server.js)
 * Node.js + Express + Socket.io + MongoDB
 * Full-featured API with real-time messaging
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const cron = require('node-cron');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] }
});

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('combined'));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many auth attempts' });
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// ─── DATABASE ─────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skillbridge';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/swaps',         require('./routes/swaps'));
app.use('/api/sessions',      require('./routes/sessions'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/reviews',       require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/skills',        require('./routes/skills'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── SOCKET.IO — REAL-TIME MESSAGING ─────────────────────────────────────────
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Authenticate socket
  socket.on('authenticate', (token) => {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'skillbridge_secret');
      socket.userId = decoded.userId;
      onlineUsers.set(decoded.userId, socket.id);
      io.emit('userOnline', decoded.userId);
      console.log(`👤 User ${decoded.userId} authenticated`);
    } catch (e) {
      socket.emit('authError', 'Invalid token');
    }
  });

  // Join chat room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`📝 Socket ${socket.id} joined room ${roomId}`);
  });

  // Send message
  socket.on('sendMessage', async (data) => {
    const { roomId, message, recipientId } = data;
    const Message = require('./models/Message');
    try {
      const msg = await Message.create({
        room: roomId, sender: socket.userId,
        content: message.content, type: message.type || 'text'
      });
      await msg.populate('sender', 'name avatar');
      io.to(roomId).emit('newMessage', msg);
      // Notify recipient if offline
      if (!onlineUsers.has(recipientId)) {
        const Notification = require('./models/Notification');
        await Notification.create({
          user: recipientId, type: 'message',
          title: 'New Message', message: `You have a new message`,
          data: { roomId, senderId: socket.userId }
        });
      }
    } catch (e) {
      socket.emit('error', 'Failed to send message');
    }
  });

  // Typing indicator
  socket.on('typing', (roomId) => socket.to(roomId).emit('userTyping', socket.userId));
  socket.on('stopTyping', (roomId) => socket.to(roomId).emit('userStopTyping', socket.userId));

  // Swap request notification
  socket.on('swapRequest', (targetUserId) => {
    const targetSocket = onlineUsers.get(targetUserId);
    if (targetSocket) io.to(targetSocket).emit('newSwapRequest', { from: socket.userId });
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('userOffline', socket.userId);
    }
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// Attach io to app for route access
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// ─── CRON JOBS ────────────────────────────────────────────────────────────────
// Session reminders — run every hour
cron.schedule('0 * * * *', async () => {
  const { sendSessionReminders } = require('./utils/emailService');
  await sendSessionReminders();
  console.log('⏰ Session reminders checked');
});

// Weekly digest — every Monday 9am
cron.schedule('0 9 * * 1', async () => {
  console.log('📧 Sending weekly digest emails...');
});

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 SkillBridge Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for real-time messaging`);
  console.log(`🗄️  MongoDB: ${MONGO_URI}\n`);
});

module.exports = { app, io };
