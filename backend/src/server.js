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

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ MongoDB Atlas connected successfully');
})
.catch(err => {
  console.error('❌ MongoDB Atlas connection error:', err.message);
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
});

// Security middleware
app.use(helmet());
app.use(compression());

// ✅ Proper CORS for Local + Amplify
const allowedOrigins = [
  'http://localhost:3000',
  'https://main.d3f1ppquakakyb.amplifyapp.com',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter);
app.use('/api/predictions/', strictLimiter);

// Request logging
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

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Root
app.get('/', (req, res) => {
  res.json({ message: 'AQI API running' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
