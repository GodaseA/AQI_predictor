cat > src/models/PredictionRecord.js << 'EOF'
const mongoose = require('mongoose');

const predictionRecordSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  currentAQI: {
    type: Number,
    required: true
  },
  predicted2hr: {
    type: Number,
    required: true
  },
  predicted4hr: {
    type: Number,
    required: true
  },
  category2hr: String,
  category4hr: String,
  trend: {
    type: String,
    enum: ['improving', 'stable', 'worsening']
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  features: {
    temperature: Number,
    humidity: Number,
    windSpeed: Number,
    hour: Number,
    dayOfWeek: Number
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

predictionRecordSchema.index({ city: 1, timestamp: -1 });

module.exports = mongoose.model('PredictionRecord', predictionRecordSchema);
EOF