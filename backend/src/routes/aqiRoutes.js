const express = require('express');
const router = express.Router();
const aqiService = require('../services/aqiService');

// Get current AQI for a city
router.get('/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const data = await aqiService.getCurrentAQI(city);
    
    // Return in the format frontend expects
    res.json({
      city: city,
      aqi: data.aqi,
      category: data.category,
      pm25: data.pm25,
      pm10: data.pm10,
      o3: data.o3,
      no2: data.no2,
      temperature: data.temperature,
      humidity: data.humidity,
      wind_speed: data.windSpeed,
      timestamp: data.timestamp
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AQI by coordinates
router.get('/location/coordinates', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const data = await aqiService.getAQIByCoordinates(parseFloat(lat), parseFloat(lon));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get historical AQI data
router.get('/:city/history', async (req, res) => {
  try {
    const { city } = req.params;
    const { hours = 24 } = req.query;
    const history = await aqiService.getHistoricalData(city, parseInt(hours));
    
    res.json({
      city: city,
      hours: parseInt(hours),
      data: history
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
