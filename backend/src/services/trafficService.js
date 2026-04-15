class TrafficService {
  getCongestionLevel(score) {
    if (score < 0.25) return 'low';
    if (score < 0.5) return 'moderate';
    if (score < 0.75) return 'high';
    return 'severe';
  }

  async getTrafficData(city) {
    const hour = new Date().getHours();
    const isWeekend = [0, 6].includes(new Date().getDay());
    
    let baseCongestion = 0.3;
    
    if (!isWeekend) {
      if (hour >= 8 && hour <= 10 || hour >= 17 && hour <= 20) {
        baseCongestion = 0.7;
      } else if (hour >= 11 && hour <= 16) {
        baseCongestion = 0.5;
      } else {
        baseCongestion = 0.2;
      }
    } else {
      if (hour >= 10 && hour <= 14 || hour >= 17 && hour <= 21) {
        baseCongestion = 0.5;
      } else {
        baseCongestion = 0.25;
      }
    }
    
    const overall = Math.min(1, Math.max(0, baseCongestion + (Math.random() - 0.5) * 0.2));
    
    const hotspots = [];
    const hotspotCount = 5 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < hotspotCount; i++) {
      hotspots.push({
        latitude: 18.5 + (Math.random() - 0.5) * 0.2,
        longitude: 73.85 + (Math.random() - 0.5) * 0.2,
        congestionLevel: this.getCongestionLevel(overall + (Math.random() - 0.5) * 0.3),
        delayMinutes: Math.floor(Math.random() * 30),
        description: this.getTrafficDescription(overall)
      });
    }
    
    return {
      city,
      overallCongestion: this.getCongestionLevel(overall),
      averageSpeedKmh: +(30 + Math.random() * 40).toFixed(1),
      hotspots,
      timestamp: new Date().toISOString()
    };
  }

  async getTrafficHeatmap(city) {
    const center = { lat: 18.5204, lng: 73.8567 };
    const points = [];
    
    for (let i = 0; i < 100; i++) {
      points.push({
        lat: center.lat + (Math.random() - 0.5) * 0.2,
        lng: center.lng + (Math.random() - 0.5) * 0.2,
        intensity: Math.random()
      });
    }
    
    return {
      city,
      center,
      points
    };
  }

  getTrafficDescription(congestion) {
    if (congestion < 0.25) return 'Light traffic';
    if (congestion < 0.5) return 'Moderate traffic';
    if (congestion < 0.75) return 'Heavy traffic';
    return 'Severe congestion';
  }
}

module.exports = new TrafficService();
