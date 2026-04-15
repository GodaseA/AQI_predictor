// src/utils/constants.js
export const AQI_THRESHOLDS = {
  GOOD: 50,
  MODERATE: 100,
  UNHEALTHY_SENSITIVE: 150,
  UNHEALTHY: 200,
  VERY_UNHEALTHY: 300,
}

export const AQI_CATEGORIES = {
  GOOD: { label: 'Good', color: '#00E400', emoji: '😊' },
  MODERATE: { label: 'Moderate', color: '#FFFF00', emoji: '🙂' },
  UNHEALTHY_SENSITIVE: { label: 'Unhealthy for Sensitive Groups', color: '#FF7E00', emoji: '😐' },
  UNHEALTHY: { label: 'Unhealthy', color: '#FF0000', emoji: '😷' },
  VERY_UNHEALTHY: { label: 'Very Unhealthy', color: '#8F3F97', emoji: '🤢' },
  HAZARDOUS: { label: 'Hazardous', color: '#7E0023', emoji: '☠️' },
}

export const ROUTE_PREFERENCES = [
  { value: 'balanced', label: 'Balanced (Time + Pollution)' },
  { value: 'cleanest', label: 'Cleanest (Low Pollution)' },
  { value: 'fastest', label: 'Fastest (Min Time)' },
]

export const REFRESH_INTERVALS = {
  AQI: 60000,      // 1 minute
  PREDICTIONS: 300000, // 5 minutes
  TRAFFIC: 120000,  // 2 minutes
}