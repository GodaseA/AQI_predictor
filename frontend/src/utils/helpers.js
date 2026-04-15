// src/utils/helpers.js
import { AQI_THRESHOLDS, AQI_CATEGORIES } from './constants'

export const getAQICategory = (aqi) => {
  if (aqi <= 50) return AQI_CATEGORIES.GOOD
  if (aqi <= 100) return AQI_CATEGORIES.MODERATE
  if (aqi <= 150) return AQI_CATEGORIES.UNHEALTHY_SENSITIVE
  if (aqi <= 200) return AQI_CATEGORIES.UNHEALTHY
  if (aqi <= 300) return AQI_CATEGORIES.VERY_UNHEALTHY
  return AQI_CATEGORIES.HAZARDOUS
}

export const getAQIColor = (aqi) => {
  if (aqi <= 50) return '#00E400'
  if (aqi <= 100) return '#FFFF00'
  if (aqi <= 150) return '#FF7E00'
  if (aqi <= 200) return '#FF0000'
  if (aqi <= 300) return '#8F3F97'
  return '#7E0023'
}

export const getAQIRecommendation = (aqi) => {
  if (aqi <= 50) {
    return "Air quality is good. Enjoy outdoor activities!"
  } else if (aqi <= 100) {
    return "Air quality is acceptable. Sensitive individuals should limit prolonged outdoor exertion."
  } else if (aqi <= 150) {
    return "Unhealthy for sensitive groups. Reduce outdoor activities if you have respiratory issues."
  } else if (aqi <= 200) {
    return "Unhealthy air quality. Everyone should reduce prolonged outdoor exertion."
  } else if (aqi <= 300) {
    return "Very unhealthy. Avoid outdoor activities. Wear mask if you must go outside."
  } else {
    return "Hazardous! Stay indoors. Use air purifiers. Emergency conditions."
  }
}

export const formatDuration = (minutes) => {
  if (minutes < 60) return `${Math.round(minutes)} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins === 0 ? `${hours} hr` : `${hours} hr ${Math.round(mins)} min`
}

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString()
}