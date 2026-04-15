const express = require('express');
const router = express.Router();
const aqiService = require('../services/aqiService');
const predictionService = require('../services/predictionService');

// Get AQI predictions
router.get('/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    const currentData = await aqiService.getCurrentAQI(city);
    const weatherData = {
      temperature: currentData.temperature,
      humidity: currentData.humidity,
      windSpeed: currentData.windSpeed
    };
    
    const predictions = await predictionService.getPredictions(
      city,
      currentData.aqi,
      weatherData
    );
    
    // Return in the exact format frontend expects
    res.json({
      city: city,
      current_aqi: predictions.currentAQI,
      current_category: predictions.currentCategory,
      predicted_2hr: predictions.predicted2hr,
      predicted_4hr: predictions.predicted4hr,
      category_2hr: predictions.category2hr,
      category_4hr: predictions.category4hr,
      trend: predictions.trend,
      confidence: predictions.confidence,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get alerts
router.get('/:city/alerts', async (req, res) => {
  try {
    const { city } = req.params;
    
    const currentData = await aqiService.getCurrentAQI(city);
    const weatherData = {
      temperature: currentData.temperature,
      humidity: currentData.humidity,
      windSpeed: currentData.windSpeed
    };
    
    const predictions = await predictionService.getPredictions(
      city,
      currentData.aqi,
      weatherData
    );
    
    const alerts = await predictionService.generateAlerts(
      city,
      currentData.aqi,
      predictions
    );
    
    res.json(alerts);
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get best travel time
router.get('/:city/best-time', async (req, res) => {
  try {
    const { city } = req.params;
    const currentData = await aqiService.getCurrentAQI(city);
    const recommendations = await predictionService.getBestTravelTimes(currentData.aqi);
    
    res.json({
      city: city,
      current_aqi: currentData.aqi,
      recommendations: recommendations.map(r => ({
        time_slot: r.timeSlot,
        expected_aqi: r.expectedAQI,
        category: r.category,
        recommendation: r.recommendation
      }))
    });
  } catch (error) {
    console.error('Best time error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
