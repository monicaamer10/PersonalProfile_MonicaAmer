require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const apiRoutes = require('./backend/routes/api');

const app = express();
const PORT = process.env.PORT || 5000;
const frontendPath = path.join(__dirname, 'frontend');

app.use(express.static(frontendPath));

// ============================================
// ENVIRONMENT CHECK
// ============================================
const isProduction = process.env.NODE_ENV === 'production';
console.log(`📡 Server running in ${process.env.NODE_ENV || 'development'} mode`);

// ============================================
// MIDDLEWARE
// ============================================

// CORS configuration (more secure)
app.use(cors({
  origin: [
    'https://monicaamer10.github.io',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://monica-profile-backend.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url} - ${req.ip || 'unknown'}`);
  next();
});

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES
// ============================================

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Monica R. Amer API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      profile: '/api/profile',
      messages: '/api/messages',
      contact: '/api/contact (POST)'
    },
    status: 'running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes
app.use('/api', apiRoutes);

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.url 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// DATABASE CONNECTION
// ============================================

const mongoUri = process.env.MONGODB_URI;
const hasValidMongoUri = mongoUri && !/YOUR_|xxxxx|<|>/.test(mongoUri);

if (hasValidMongoUri) {
  console.log('🔄 Connecting to MongoDB...');
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.warn('⚠️ Running without MongoDB persistence (file storage fallback)');
  });
} else {
  console.warn('⚠️ MONGODB_URI is not configured or contains placeholder values.');
  console.warn('⚠️ Running with file storage fallback only.');
}

// ============================================
// START SERVER
// ============================================

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
  console.log(`💾 Database: ${mongoose.connection.readyState === 1 ? 'MongoDB' : 'File Storage'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🔄 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🔄 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

console.log('✅ Server initialization complete');