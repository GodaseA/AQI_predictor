cat > src/models/AQIRecord.js << 'EOF'
const mongoose = require('mongoose');

const aqiRecordSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  aqi: {
    type: Number,
    required: true,
    min: 0,
    max: 500
  },
  category: {
    type: String,
    enum: ['Good', 'Moderate', 'Unhealthy for Sensitive Groups', 'Unhealthy', 'Very Unhealthy', 'Hazardous'],
    required: true
  },
  pollutants: {
    pm25: { type: Number, default: null },
    pm10: { type: Number, default: null },
    o3: { type: Number, default: null },
    no2: { type: Number, default: null },
    co: { type: Number, default: null },
    so2: { type: Number, default: null }
  },
  weather: {
    temperature: { type: Number, default: null },
    humidity: { type: Number, default: null },
    windSpeed: { type: Number, default: null },
    pressure: { type: Number, default: null }
  },
  location: {
    lat: { type: Number, default: null },
    lon: { type: Number, default: null }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
aqiRecordSchema.index({ city: 1, timestamp: -1 });

// Static method to get latest AQI for a city
aqiRecordSchema.statics.getLatestByCity = async function(city) {
  return this.findOne({ city: city.toLowerCase() })
    .sort({ timestamp: -1 });
};

// Static method to get historical data
aqiRecordSchema.statics.getHistory = async function(city, hours = 24) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({
    city: city.toLowerCase(),
    timestamp: { $gte: cutoff }
  }).sort({ timestamp: 1 });
};

module.exports = mongoose.model('AQIRecord', aqiRecordSchema);
EOF