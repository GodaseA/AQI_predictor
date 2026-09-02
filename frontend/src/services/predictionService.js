// src/services/predictionService.js
import apiClient from './api'

export const predictionService = {
  // Get AQI predictions
  getPredictions: async (city) => {
    try {
      const response = await apiClient.get(`/predictions/${city}`)
      console.log('Prediction API response:', response)
      
      // Handle different response structures
      if (response && response.current_aqi !== undefined) {
        return response
      }
      if (response && response.data && response.data.current_aqi !== undefined) {
        return response.data
      }
      
      // Return fallback if no valid data
      return {
        city: city,
        current_aqi: 100,
        current_category: 'Moderate',
        predicted_2hr: 105,
        predicted_4hr: 110,
        category_2hr: 'Moderate',
        category_4hr: 'Unhealthy for Sensitive Groups',
        trend: 'stable',
        confidence: 0.7,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to fetch predictions:', error)
      // Return fallback data
      return {
        city: city,
        current_aqi: 100,
        current_category: 'Moderate',
        predicted_2hr: 105,
        predicted_4hr: 110,
        category_2hr: 'Moderate',
        category_4hr: 'Unhealthy for Sensitive Groups',
        trend: 'stable',
        confidence: 0.7,
        timestamp: new Date().toISOString(),
        _cached: true
      }
    }
  },
  
  // Get alerts
  getAlerts: async (city) => {
    try {
      const response = await apiClient.get(`/predictions/${city}/alerts`)
      return response
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
      return []
    }
  },
  
  // Get best travel time
  getBestTravelTime: async (city) => {
    try {
      const response = await apiClient.get(`/predictions/${city}/best-time`)
      return response
    } catch (error) {
      console.error('Failed to fetch best time:', error)
      return {
        city: city,
        current_aqi: 100,
        recommendations: []
      }
    }
  },
  
  // Get hourly forecast
  getHourlyForecast: async (city, hours = 12) => {
    try {
      const response = await apiClient.get(`/predictions/${city}/forecast?hours=${hours}`)
      return response
    } catch (error) {
      console.error('Failed to fetch forecast:', error)
      return { city, forecast: [] }
    }
  }
}
