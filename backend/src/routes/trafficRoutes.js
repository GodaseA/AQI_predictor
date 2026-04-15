const express = require('express');
const router = express.Router();
const trafficService = require('../services/trafficService');

// Get traffic data for a city
router.get('/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const data = await trafficService.getTrafficData(city);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get traffic heatmap data
router.get('/:city/heatmap', async (req, res) => {
  try {
    const { city } = req.params;
    const data = await trafficService.getTrafficHeatmap(city);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
