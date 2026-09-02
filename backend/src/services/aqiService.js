// backend/src/services/aqiService.js - Enhanced Version

const axios = require('axios');

class AQIService {
  constructor() {
    this.cityBaseAQI = {
      delhi: 150,
      mumbai: 100,
      pune: 80,
      bangalore: 70,
      chennai: 75,
      kolkata: 120,
      hyderabad: 85
    };
    
    // Cache for simulated data to reduce randomness
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute cache
  }

  getAQICategory(aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  getHealthRecommendation(aqi) {
    if (aqi <= 50) return 'Air quality is good. Enjoy outdoor activities!';
    if (aqi <= 100) return 'Air quality is acceptable. Sensitive individuals should limit prolonged outdoor exertion.';
    if (aqi <= 150) return 'Unhealthy for sensitive groups. Reduce outdoor activities if you have respiratory issues.';
    if (aqi <= 200) return 'Unhealthy air quality. Everyone should reduce prolonged outdoor exertion.';
    if (aqi <= 300) return 'Very unhealthy. Avoid outdoor activities. Wear mask if you must go outside.';
    return 'Hazardous! Stay indoors. Use air purifiers. Emergency conditions.';
  }

  async getCurrentAQI(city, useCache = true) {
    try {
      const cityLower = city.toLowerCase();
      
      // Check cache first
      const cacheKey = `aqi_${cityLower}`;
      if (useCache && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        const cacheAge = Date.now() - cached.timestamp;
        if (cacheAge < this.cacheTimeout) {
          console.log(`Returning cached AQI for ${city}`);
          return cached.data;
        }
      }
      
      // Try real API first if keys are configured
      if (process.env.AQICN_API_KEY) {
        try {
          const realData = await this.fetchRealAQI(cityLower);
          if (realData) {
            this.cache.set(cacheKey, { data: realData, timestamp: Date.now() });
            return realData;
          }
        } catch (error) {
          console.log(`Real API failed for ${city}, using simulation`);
        }
      }
      
      // Fallback to simulation
      const simulatedData = this.simulateAQI(cityLower);
      
      // Cache the result
      this.cache.set(cacheKey, { data: simulatedData, timestamp: Date.now() });
      
      return simulatedData;
    } catch (error) {
      console.error('Error in getCurrentAQI:', error);
      // Return safe fallback data
      return this.getFallbackData(city);
    }
  }

  async fetchRealAQI(city) {
    // This would connect to a real AQI API like AQICN
    // Example implementation:
    console.log("hii brooo")
     const response = await axios.get(
      `https://api.waqi.info/feed/${city}/?token=${process.env.AQICN_API_KEY}`
    );
    if (response.data.status === 'ok') {
      const data = response.data.data;
      return {
        aqi: data.aqi,
        category: this.getAQICategory(data.aqi),
        pm25: data.iaqi?.pm25?.v,
        pm10: data.iaqi?.pm10?.v,
        o3: data.iaqi?.o3?.v,
        no2: data.iaqi?.no2?.v,
        temperature: data.iaqi?.t?.v,
        humidity: data.iaqi?.h?.v,
        windSpeed: data.iaqi?.w?.v,
        timestamp: new Date().toISOString()
      };
    }
     return null;
  }

  simulateAQI(city) {
    const base = this.cityBaseAQI[city] || 90;
    const hour = new Date().getHours();
    
    // Time-based factor (rush hours have higher pollution)
    let timeFactor = 1;
    if (hour >= 8 && hour <= 10 || hour >= 17 && hour <= 20) {
      timeFactor = 1.3;
    } else if (hour >= 11 && hour <= 16) {
      timeFactor = 1.1;
    } else {
      timeFactor = 0.9;
    }
    
    // Day of week factor (weekends have lower pollution)
    const dayOfWeek = new Date().getDay();
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.85 : 1;
    
    // Seasonal factor (winter has higher pollution)
    const month = new Date().getMonth();
    const seasonalFactor = (month >= 10 || month <= 1) ? 1.2 : 1; // Nov-Feb
    
    // Calculate AQI with all factors
    const variation = 0.8 + Math.random() * 0.8;
    let aqi = Math.floor(base * timeFactor * weekendFactor * seasonalFactor * variation);
    aqi = Math.max(20, Math.min(500, aqi));
    
    // Calculate pollutants based on AQI
    const pm25 = +(aqi * 0.8 + (Math.random() - 0.5) * 20).toFixed(1);
    const pm10 = +(aqi * 1.2 + (Math.random() - 0.5) * 30).toFixed(1);
    
    return {
      aqi,
      category: this.getAQICategory(aqi),
      pm25: Math.max(0, pm25),
      pm10: Math.max(0, pm10),
      o3: +(20 + Math.random() * 60).toFixed(1),
      no2: +(10 + Math.random() * 50).toFixed(1),
      co: +(0.1 + Math.random() * 0.9).toFixed(2),
      so2: +(5 + Math.random() * 25).toFixed(1),
      temperature: +(22 + Math.random() * 15).toFixed(1),
      humidity: +(40 + Math.random() * 50).toFixed(0),
      windSpeed: +(2 + Math.random() * 13).toFixed(1),
      pressure: +(1005 + Math.random() * 20).toFixed(0),
      healthRecommendation: this.getHealthRecommendation(aqi),
      timestamp: new Date().toISOString(),
      isSimulated: true
    };
  }

  getFallbackData(city) {
    return {
      aqi: 100,
      category: 'Moderate',
      pm25: 45,
      pm10: 78,
      o3: 35,
      no2: 28,
      co: 0.5,
      so2: 15,
      temperature: 25,
      humidity: 65,
      windSpeed: 5,
      pressure: 1013,
      healthRecommendation: 'Data temporarily unavailable. Using estimated values.',
      timestamp: new Date().toISOString(),
      isSimulated: true,
      isFallback: true
    };
  }

  async getAQIByCoordinates(lat, lon) {
    // Find nearest city based on coordinates
    const nearestCity = this.findNearestCity(lat, lon);
    return await this.getCurrentAQI(nearestCity);
  }

  findNearestCity(lat, lon) {
    // Simple distance calculation to find nearest city
    let nearest = 'pune';
    let minDistance = Infinity;
    
    const cityCoords = {
      delhi: { lat: 28.6139, lon: 77.2090 },
      mumbai: { lat: 19.0760, lon: 72.8777 },
      pune: { lat: 18.5204, lon: 73.8567 },
      bangalore: { lat: 12.9716, lon: 77.5946 },
      chennai: { lat: 13.0827, lon: 80.2707 },
      kolkata: { lat: 22.5726, lon: 88.3639 },
      hyderabad: { lat: 17.3850, lon: 78.4867 }
    };
    
    for (const [city, coords] of Object.entries(cityCoords)) {
      const distance = Math.sqrt(
        Math.pow(lat - coords.lat, 2) + 
        Math.pow(lon - coords.lon, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = city;
      }
    }
    
    return nearest;
  }

  async getHistoricalData(city, hours = 24) {
    const history = [];
    const baseAQI = this.cityBaseAQI[city.toLowerCase()] || 90;
    const now = new Date();
    
    for (let i = hours; i > 0; i--) {
      const timestamp = new Date(now - i * 60 * 60 * 1000);
      const hourFactor = Math.abs(12 - timestamp.getHours()) / 12;
      
      // Add daily pattern
      const rushHourBonus = (timestamp.getHours() >= 8 && timestamp.getHours() <= 10 || 
                             timestamp.getHours() >= 17 && timestamp.getHours() <= 20) ? 20 : 0;
      
      const variation = (Math.random() - 0.5) * 40;
      let aqi = Math.floor(baseAQI + 30 * hourFactor + rushHourBonus + variation);
      aqi = Math.max(20, Math.min(500, aqi));
      
      history.push({
        timestamp: timestamp.toISOString(),
        aqi,
        category: this.getAQICategory(aqi),
        hour: timestamp.getHours()
      });
    }
    
    return history;
  }

  async getCityZonesAQI(city) {
    const zones = ['North', 'South', 'East', 'West', 'Central', 'Industrial', 'Residential'];
    const zoneData = {};
    const baseAQI = this.cityBaseAQI[city.toLowerCase()] || 90;
    
    for (const zone of zones) {
      // Industrial zones have higher pollution
      const zoneMultiplier = zone === 'Industrial' ? 1.5 : 
                            zone === 'Central' ? 1.2 : 
                            zone === 'Residential' ? 0.8 : 1;
      
      let aqi = Math.floor(baseAQI * zoneMultiplier * (0.8 + Math.random() * 0.4));
      aqi = Math.max(20, Math.min(500, aqi));
      
      zoneData[zone] = {
        aqi,
        category: this.getAQICategory(aqi),
        recommendation: this.getZoneRecommendation(zone, aqi)
      };
    }
    
    return zoneData;
  }

  getZoneRecommendation(zone, aqi) {
    if (aqi > 150) {
      return `Avoid ${zone} area - very high pollution`;
    }
    if (aqi > 100) {
      return `Consider limiting time in ${zone} area`;
    }
    if (zone === 'Residential') {
      return `Good air quality in ${zone} area - recommended`;
    }
    return `Acceptable air quality in ${zone} area`;
  }

  // Clear cache periodically
  clearCache() {
    this.cache.clear();
    console.log('AQI service cache cleared');
  }
}

module.exports = new AQIService();