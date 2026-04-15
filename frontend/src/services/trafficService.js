// src/services/trafficService.js
import apiClient from './api'

export const trafficService = {
  getTrafficData: async (city) => {
    try {
      const response = await apiClient.get(`/traffic/${city}`)
      return response
    } catch (error) {
      console.error('Traffic data fetch failed:', error)
      return {
        city: city,
        overall_congestion: 'moderate',
        hotspots: [],
        average_speed_kmh: 35,
        timestamp: new Date().toISOString()
      }
    }
  },
  
  getRouteTraffic: async (originLat, originLon, destLat, destLon) => {
    const response = await apiClient.get(`/traffic/route/conditions`, {
      params: {
        origin_lat: originLat,
        origin_lon: originLon,
        dest_lat: destLat,
        dest_lon: destLon
      }
    })
    return response
  },
  
  getTrafficHotspots: async (city, limit = 10) => {
    try {
      const response = await apiClient.get(`/traffic/${city}/hotspots?limit=${limit}`)
      return response
    } catch (error) {
      return []
    }
  },
  
  getTrafficHeatmap: async (city) => {
    try {
      const response = await apiClient.get(`/traffic/${city}/heatmap`)
      return response
    } catch (error) {
      console.error('Heatmap fetch failed, generating mock data:', error)
      // Generate realistic mock heatmap data
      return generateMockHeatmapData(city)
    }
  }
}

// Generate realistic mock heatmap data
function generateMockHeatmapData(city) {
  const center = { lat: 18.5204, lng: 73.8567 }
  const points = []
  
  // Generate points in a grid pattern with varying intensities
  for (let i = -10; i <= 10; i++) {
    for (let j = -10; j <= 10; j++) {
      const lat = center.lat + (i * 0.01)
      const lng = center.lng + (j * 0.01)
      
      // Calculate distance from center
      const distFromCenter = Math.sqrt(i*i + j*j)
      
      // Higher intensity near center (city center has more traffic/pollution)
      let intensity = Math.max(0.1, 1 - (distFromCenter / 15))
      
      // Add some random variation
      intensity = intensity * (0.5 + Math.random() * 0.8)
      
      // Add some hotspots
      if (Math.abs(i) < 3 && Math.abs(j) < 3) {
        intensity = Math.min(1, intensity * 1.5)
      }
      
      points.push({
        lat: lat,
        lng: lng,
        intensity: parseFloat(intensity.toFixed(2))
      })
    }
  }
  
  // Add some random hotspots
  for (let k = 0; k < 20; k++) {
    points.push({
      lat: center.lat + (Math.random() - 0.5) * 0.2,
      lng: center.lng + (Math.random() - 0.5) * 0.2,
      intensity: 0.7 + Math.random() * 0.3
    })
  }
  
  return {
    city: city,
    center: center,
    points: points
  }
}
