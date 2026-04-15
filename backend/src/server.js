const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const aqiRoutes = require('./routes/aqiRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const trafficRoutes = require('./routes/trafficRoutes');
const routeRoutes = require('./routes/routeRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// MongoDB Atlas Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://<db_username>:<db_password>@aqidata.rwybn2q.mongodb.net/?appName=aqiData';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Atlas connected successfully');
  console.log('📊 Database: aqiData');
})
.catch(err => {
  console.error('❌ MongoDB Atlas connection error:', err.message);
  console.log('⚠️  Please check your username and password in MONGODB_URI');
});

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === 'development' && req.path === '/health';
  }
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests to this endpoint.' }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter);
app.use('/api/predictions/', strictLimiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/aqi', aqiRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    mongodbState: mongoose.STATES[mongoose.connection.readyState],
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AQI Pollution & Traffic Optimization API',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'MongoDB Atlas Connected' : 'Database Disconnected',
    endpoints: {
      auth: '/api/auth (register, login, profile)',
      aqi: '/api/aqi/:city',
      predictions: '/api/predictions/:city',
      traffic: '/api/traffic/:city',
      routes: '/api/routes/optimize'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`📊 Database Status: ${mongoose.connection.readyState === 1 ? 'Connected to MongoDB Atlas' : 'Disconnected'}`);
});
