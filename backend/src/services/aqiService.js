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
  }

  getAQICategory(aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  async getCurrentAQI(city) {
    const cityLower = city.toLowerCase();
    const base = this.cityBaseAQI[cityLower] || 90;
    
    const hour = new Date().getHours();
    let timeFactor = 1;
    
    if (hour >= 8 && hour <= 10 || hour >= 17 && hour <= 20) {
      timeFactor = 1.3;
    } else if (hour >= 11 && hour <= 16) {
      timeFactor = 1.1;
    } else {
      timeFactor = 0.9;
    }
    
    const variation = 0.8 + Math.random() * 0.8;
    let aqi = Math.floor(base * timeFactor * variation);
    aqi = Math.max(20, Math.min(500, aqi));
    
    return {
      aqi,
      category: this.getAQICategory(aqi),
      pm25: +(aqi * 0.8 + (Math.random() - 0.5) * 20).toFixed(1),
      pm10: +(aqi * 1.2 + (Math.random() - 0.5) * 30).toFixed(1),
      o3: +(20 + Math.random() * 60).toFixed(1),
      no2: +(10 + Math.random() * 50).toFixed(1),
      temperature: +(22 + Math.random() * 15).toFixed(1),
      humidity: +(40 + Math.random() * 50).toFixed(0),
      windSpeed: +(2 + Math.random() * 13).toFixed(1),
      timestamp: new Date().toISOString()
    };
  }

  async getAQIByCoordinates(lat, lon) {
    const baseAQI = 50 + Math.random() * 150;
    return {
      aqi: Math.floor(baseAQI),
      category: this.getAQICategory(baseAQI),
      latitude: lat,
      longitude: lon
    };
  }

  async getHistoricalData(city, hours = 24) {
    const history = [];
    const baseAQI = this.cityBaseAQI[city.toLowerCase()] || 90;
    const now = new Date();
    
    for (let i = hours; i > 0; i--) {
      const timestamp = new Date(now - i * 60 * 60 * 1000);
      const hourFactor = Math.abs(12 - timestamp.getHours()) / 12;
      const variation = (Math.random() - 0.5) * 40;
      let aqi = Math.floor(baseAQI + 30 * hourFactor + variation);
      aqi = Math.max(20, Math.min(500, aqi));
      
      history.push({
        timestamp: timestamp.toISOString(),
        aqi,
        category: this.getAQICategory(aqi)
      });
    }
    
    return history;
  }
}

module.exports = new AQIService();
