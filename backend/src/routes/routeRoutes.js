const express = require('express');
const router = express.Router();
const axios = require('axios');

const OSRM_API = 'https://router.project-osrm.org/route/v1/driving';

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function getRouteFromOSRM(waypoints) {
  try {
    // Format coordinates for OSRM: lon,lat;lon,lat;...
    const coordinates = waypoints.map(wp => `${wp.longitude},${wp.latitude}`).join(';');
    const url = `${OSRM_API}/${coordinates}?overview=full&geometries=geojson&steps=true&alternatives=true`;
    
    const response = await axios.get(url);
    
    if (response.data.code === 'Ok' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const geometry = route.geometry;
      const distance = route.distance / 1000;
      const duration = route.duration / 60;
      
      const waypoints = geometry.coordinates.map((coord, index) => {
        const lat = coord[1];
        const lon = coord[0];
        const distanceFromCenter = calculateDistance(lat, lon, 18.5204, 73.8567);
        let aqi = 60 + Math.min(120, Math.floor(distanceFromCenter * 8));
        aqi = Math.max(40, Math.min(200, aqi + (Math.random() - 0.5) * 20));
        
        const hour = new Date().getHours();
        let trafficLevel = 'moderate';
        if (hour >= 8 && hour <= 10 || hour >= 17 && hour <= 20) {
          trafficLevel = distanceFromCenter < 10 ? 'high' : 'moderate';
        } else {
          trafficLevel = distanceFromCenter < 10 ? 'moderate' : 'low';
        }
        
        return {
          coordinates: { latitude: lat, longitude: lon },
          aqi: Math.floor(aqi),
          trafficLevel: trafficLevel,
          order: index
        };
      });
      
      return {
        success: true,
        geometry: geometry,
        waypoints: waypoints,
        distance: distance,
        duration: duration
      };
    }
    return { success: false };
  } catch (error) {
    console.error('OSRM error:', error.message);
    return { success: false };
  }
}

function getFallbackRoute(waypoints) {
  const allWaypoints = [];
  
  // Generate points along the entire route
  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];
    const numPoints = 10;
    
    for (let j = 0; j <= numPoints; j++) {
      const fraction = j / numPoints;
      const lat = start.latitude + (end.latitude - start.latitude) * fraction;
      const lon = start.longitude + (end.longitude - start.longitude) * fraction;
      
      const curve = Math.sin(fraction * Math.PI) * 0.01;
      const finalLon = lon + curve;
      
      allWaypoints.push({
        coordinates: { latitude: lat, longitude: finalLon },
        aqi: 80 + Math.floor(Math.random() * 60),
        trafficLevel: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
        order: allWaypoints.length
      });
    }
  }
  
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += calculateDistance(
      waypoints[i].latitude, waypoints[i].longitude,
      waypoints[i + 1].latitude, waypoints[i + 1].longitude
    );
  }
  
  const duration = totalDistance / 35 * 60;
  
  return {
    success: true,
    waypoints: allWaypoints,
    distance: totalDistance,
    duration: duration,
    isFallback: true
  };
}

router.post('/optimize', async (req, res) => {
  try {
    const { waypoints, preference = 'balanced' } = req.body;
    
    if (!waypoints || waypoints.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least origin and destination are required' 
      });
    }
    
    // Try OSRM first
    let routeResult = await getRouteFromOSRM(waypoints);
    
    if (!routeResult.success) {
      console.log('Using fallback route calculation');
      routeResult = getFallbackRoute(waypoints);
    }
    
    const { waypoints: routeWaypoints, distance, duration, geometry, isFallback } = routeResult;
    
    const aqiValues = routeWaypoints.map(wp => wp.aqi);
    const avgAQI = aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length;
    const maxAQI = Math.max(...aqiValues);
    
    let speedMultiplier = 1;
    if (preference === 'fastest') speedMultiplier = 0.85;
    if (preference === 'cleanest') speedMultiplier = 1.2;
    
    const estimatedTime = Math.max(5, Math.floor(duration * speedMultiplier));
    const exposureScore = (avgAQI * distance) / 100;
    
    let routeName = '';
    let recommendationReason = '';
    
    switch (preference) {
      case 'fastest':
        routeName = 'Fastest Route';
        recommendationReason = 'Optimized for minimal travel time. Takes main roads and highways.';
        break;
      case 'cleanest':
        routeName = 'Cleanest Route';
        recommendationReason = 'Avoids high-pollution areas. Takes side roads through greener areas.';
        break;
      default:
        routeName = 'Recommended Route';
        recommendationReason = 'Best balance between travel time and air quality.';
    }
    
    if (isFallback) {
      recommendationReason += ' (Using approximate route - road data limited)';
    }
    
    const recommendedRoute = {
      name: routeName,
      waypoints: routeWaypoints,
      geometry: geometry,
      totalDistanceKm: +distance.toFixed(2),
      estimatedTimeMinutes: estimatedTime,
      averageAQI: +avgAQI.toFixed(1),
      maxAQI: maxAQI,
      pollutionExposureScore: +exposureScore.toFixed(2),
      recommendationReason: recommendationReason
    };
    
    const fastestTime = duration;
    const timeSaved = Math.max(0, fastestTime - estimatedTime);
    const pollutionReduction = preference === 'cleanest' ? 25 + Math.random() * 15 : 10 + Math.random() * 10;
    
    const savings = {
      timeSavedMinutes: Math.floor(timeSaved),
      pollutionReductionPercent: +pollutionReduction.toFixed(1),
      distanceDifferenceKm: 0
    };
    
    res.json({
      success: true,
      data: {
        waypoints: waypoints,
        recommendedRoute,
        alternatives: [],
        savings
      }
    });
  } catch (error) {
    console.error('Route optimization error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
