// src/services/routeService.js
import apiClient from './api'

export const routeService = {
  // Optimize route based on pollution
  optimizeRoute: async (waypoints, preference = 'balanced') => {
    // Format waypoints correctly for backend
    const formattedWaypoints = waypoints.map(wp => ({
      latitude: wp.lat,
      longitude: wp.lon
    }))
    
    const response = await apiClient.post('/routes/optimize', {
      waypoints: formattedWaypoints,
      preference: preference
    })
    
    // Log the response for debugging
    console.log('Route API Response:', response)
    
    return response
  },
  
  // Compare multiple routes
  compareRoutes: async (origin, destination) => {
    const response = await apiClient.post('/routes/compare', {
      origin,
      destination
    })
    return response
  },
  
  // Get route suggestions for city
  getRouteSuggestions: async (city) => {
    const response = await apiClient.get(`/routes/suggestions/${city}`)
    return response
  },
  
  // Get real-time route conditions
  getRealTimeRoute: async (origin, destination) => {
    const response = await apiClient.get('/routes/realtime', {
      params: {
        origin_lat: origin.latitude,
        origin_lng: origin.longitude,
        dest_lat: destination.latitude,
        dest_lng: destination.longitude
      }
    })
    return response
  }
}
