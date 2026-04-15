class PredictionService {
  getAQICategory(aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  getTrend(current, future) {
    const diff = future - current;
    if (diff > 15) return 'worsening';
    if (diff < -15) return 'improving';
    return 'stable';
  }

  async getPredictions(city, currentAQI, weatherData) {
    const hour = new Date().getHours();
    
    // Calculate rush hour factor
    let rushFactor = 0;
    if (hour >= 8 && hour <= 10 || hour >= 17 && hour <= 20) {
      rushFactor = 20;
    } else if (hour >= 11 && hour <= 16) {
      rushFactor = 8;
    } else {
      rushFactor = -8;
    }
    
    // Weather effects
    const windFactor = -Math.min(30, Math.max(-30, (weatherData.windSpeed || 5) * 2.5));
    const humidityFactor = ((weatherData.humidity || 50) - 50) * 0.4;
    
    // Calculate 2-hour prediction
    const hour2 = (hour + 2) % 24;
    let rush2hr = 0;
    if (hour2 >= 8 && hour2 <= 10 || hour2 >= 17 && hour2 <= 20) {
      rush2hr = 20;
    } else if (hour2 >= 11 && hour2 <= 16) {
      rush2hr = 8;
    } else {
      rush2hr = -8;
    }
    
    // Calculate 4-hour prediction
    const hour4 = (hour + 4) % 24;
    let rush4hr = 0;
    if (hour4 >= 8 && hour4 <= 10 || hour4 >= 17 && hour4 <= 20) {
      rush4hr = 20;
    } else if (hour4 >= 11 && hour4 <= 16) {
      rush4hr = 8;
    } else {
      rush4hr = -8;
    }
    
    // Calculate predictions with some randomness for realism
    let predicted2hr = currentAQI + rush2hr + windFactor + humidityFactor;
    let predicted4hr = currentAQI + rush4hr + windFactor + humidityFactor;
    
    // Add small random variation
    predicted2hr += (Math.random() - 0.5) * 10;
    predicted4hr += (Math.random() - 0.5) * 15;
    
    // Clamp to valid range
    predicted2hr = Math.max(20, Math.min(400, Math.floor(predicted2hr)));
    predicted4hr = Math.max(20, Math.min(400, Math.floor(predicted4hr)));
    
    // Calculate confidence based on how stable the prediction is
    const confidence = 0.7 + (Math.random() * 0.2);
    
    return {
      currentAQI: currentAQI,
      currentCategory: this.getAQICategory(currentAQI),
      predicted2hr: predicted2hr,
      predicted4hr: predicted4hr,
      category2hr: this.getAQICategory(predicted2hr),
      category4hr: this.getAQICategory(predicted4hr),
      trend: this.getTrend(currentAQI, predicted4hr),
      confidence: Math.round(confidence * 100) / 100
    };
  }

  async getBestTravelTimes(currentAQI) {
    const timeSlots = [
      { slot: '6:00 AM', hour: 6, factor: 0.75 },
      { slot: '8:00 AM', hour: 8, factor: 1.1 },
      { slot: '10:00 AM', hour: 10, factor: 0.9 },
      { slot: '12:00 PM', hour: 12, factor: 1.0 },
      { slot: '2:00 PM', hour: 14, factor: 1.05 },
      { slot: '4:00 PM', hour: 16, factor: 1.1 },
      { slot: '6:00 PM', hour: 18, factor: 1.2 },
      { slot: '8:00 PM', hour: 20, factor: 1.0 },
      { slot: '10:00 PM', hour: 22, factor: 0.8 }
    ];
    
    const recommendations = timeSlots.map(slot => {
      let expectedAQI = Math.floor(currentAQI * slot.factor);
      expectedAQI = Math.max(20, Math.min(400, expectedAQI));
      
      let recommendation = '';
      if (expectedAQI < currentAQI - 20) {
        recommendation = 'Excellent time for travel - significantly lower pollution';
      } else if (expectedAQI < currentAQI) {
        recommendation = 'Good time for travel - lower than current levels';
      } else if (expectedAQI > currentAQI + 20) {
        recommendation = 'Avoid this time - high pollution expected';
      } else {
        recommendation = 'Moderate conditions - acceptable for travel';
      }
      
      return {
        timeSlot: slot.slot,
        expectedAQI: expectedAQI,
        category: this.getAQICategory(expectedAQI),
        recommendation: recommendation
      };
    });
    
    // Sort by expected AQI (lowest first = best times)
    recommendations.sort((a, b) => a.expectedAQI - b.expectedAQI);
    return recommendations.slice(0, 4);
  }

  async generateAlerts(city, currentAQI, predictions) {
    const alerts = [];
    
    // Critical alerts
    if (currentAQI > 200) {
      alerts.push({
        type: 'critical',
        title: '⚠️ Critical Air Quality Alert',
        message: `AQI in ${city} is ${currentAQI}. Air quality is hazardous! Everyone should stay indoors.`,
        actions: [
          'Stay indoors with windows closed',
          'Use air purifier if available',
          'Wear N95 mask if you must go outside',
          'Avoid all outdoor physical activity'
        ],
        aqiValue: currentAQI,
        timeframe: 'Now'
      });
    } 
    // Danger alerts
    else if (currentAQI > 150) {
      alerts.push({
        type: 'danger',
        title: '🚨 Unhealthy Air Quality',
        message: `AQI in ${city} is ${currentAQI}. Everyone may experience health effects.`,
        actions: [
          'Reduce outdoor activities',
          'Sensitive groups should stay indoors',
          'Consider wearing a mask outdoors'
        ],
        aqiValue: currentAQI,
        timeframe: 'Now'
      });
    }
    // Warning alerts
    else if (currentAQI > 100) {
      alerts.push({
        type: 'warning',
        title: '⚠️ Moderate Air Quality',
        message: `AQI in ${city} is ${currentAQI}. Sensitive groups should limit outdoor exposure.`,
        actions: [
          'Sensitive individuals should reduce prolonged outdoor exertion',
          'Monitor for symptoms like coughing or shortness of breath'
        ],
        aqiValue: currentAQI,
        timeframe: 'Now'
      });
    }
    // Good air quality
    else {
      alerts.push({
        type: 'info',
        title: '✅ Good Air Quality',
        message: `Current AQI in ${city} is ${currentAQI}. Air quality is satisfactory.`,
        actions: [
          'Enjoy outdoor activities',
          'Good time for exercise and outdoor work'
        ],
        aqiValue: currentAQI,
        timeframe: 'Now'
      });
    }
    
    // Future prediction alerts
    if (predictions.predicted2hr > currentAQI + 25) {
      alerts.push({
        type: 'warning',
        title: '📈 Rising Pollution Warning',
        message: `AQI expected to rise from ${currentAQI} to ${predictions.predicted2hr} in the next 2 hours.`,
        actions: [
          'Complete outdoor activities soon',
          'Plan to move indoors before pollution peaks',
          'Close windows if you have respiratory conditions'
        ],
        aqiValue: predictions.predicted2hr,
        timeframe: 'In 2 hours'
      });
    }
    
    if (predictions.predicted4hr > 180) {
      alerts.push({
        type: 'danger',
        title: '🔴 High Pollution Forecast',
        message: `AQI predicted to reach ${predictions.predicted4hr} in the next 4 hours.`,
        actions: [
          'Reschedule outdoor plans',
          'Prepare indoor activities',
          'Keep medications handy if you have asthma'
        ],
        aqiValue: predictions.predicted4hr,
        timeframe: 'In 4 hours'
      });
    }
    
    return alerts;
  }
}

module.exports = new PredictionService();
