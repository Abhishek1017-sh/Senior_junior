require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('./config/passport');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const initializeSocket = require('./sockets/chatSocket');
const initializeSessionSocket = require('./sockets/sessionSocket');
const { clearOldSessionsGlobal } = require('./controllers/sessionController');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    // Allow the common local dev ports (5173 & 5174). If FRONTEND_URL is set, use that.
    origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Middleware
// Configure Helmet and allow cross-origin resource embedding for static assets like /uploads
app.use(helmet({
  // Other config left as default; allow cross-origin resource policy so images can load cross-origin
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(morgan('dev')); // Logging
app.use(cors({
  // Allow the frontend dev server(s). Use FRONTEND_URL env var when provided.
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Session middleware (required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded files statically and ensure the correct CORS header for images
app.use('/uploads', (req, res, next) => {
  // Allow the dev frontend origins to embed images
  // Allow all origins for static assets during development -- set a specific frontend origin in production if desired
  res.header('Access-Control-Allow-Origin', '*');
  // Further allow credentials if necessary (avoid with '*')
  // res.header('Access-Control-Allow-Credentials', 'true');
  // Allow cross-origin resource policy explicitly for images
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('uploads'));

// API Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Senior-Junior Interaction Platform API',
    version: '1.0.0',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);

// Initialize Socket.io for chat
initializeSocket(io);

// FIX: Initialize Socket.io for session notifications
initializeSessionSocket(io);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 Server is running on port ${PORT}                         ║
║   📝 Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   🔗 API: http://localhost:${PORT}                            ║
║   💬 WebSocket: ws://localhost:${PORT}                        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

// Auto cleanup of old sessions (runs once on startup and then daily)
const RETENTION_DAYS = Number(process.env.SESSION_RETENTION_DAYS) || 30;
(async () => {
  try {
    // Run on startup
    await clearOldSessionsGlobal(RETENTION_DAYS);
    // Run daily (24h) thereafter
    setInterval(async () => {
      try {
        await clearOldSessionsGlobal(RETENTION_DAYS);
      } catch (err) {
        console.error('Scheduled cleanup failed:', err);
      }
    }, 24 * 60 * 60 * 1000);
  } catch (err) {
    console.error('Failed to schedule session cleanup:', err);
  }
})();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = { app, server, io };
