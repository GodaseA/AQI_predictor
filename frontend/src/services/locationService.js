// src/services/locationService.js
// This service converts place names to coordinates using OpenStreetMap Nominatim API

export const locationService = {
  // Search for a location by name
  searchLocation: async (query) => {
    if (!query || query.trim().length < 3) {
      return []
    }
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'AQI-Optimizer-App/1.0'
          }
        }
      )
      
      const data = await response.json()
      
      return data.map(item => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type,
        importance: item.importance
      }))
    } catch (error) {
      console.error('Location search failed:', error)
      return []
    }
  },
  
  // Get current location using browser geolocation
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            name: 'Current Location'
          })
        },
        (error) => {
          reject(error)
        }
      )
    })
  },
  
  // Reverse geocode (coordinates to address)
  reverseGeocode: async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        {
          headers: {
            'User-Agent': 'AQI-Optimizer-App/1.0'
          }
        }
      )
      
      const data = await response.json()
      return data.display_name || `${lat}, ${lon}`
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      return `${lat}, ${lon}`
    }
  }
}
