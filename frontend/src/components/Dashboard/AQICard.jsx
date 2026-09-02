// src/components/Dashboard/AQICard.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { FiThermometer, FiDroplet, FiWind } from 'react-icons/fi'
import { getAQICategory, getAQIRecommendation } from '../../utils/helpers'
import "./AQICard.css"

const AQICard = ({ data, isLoading }) => {
  if (isLoading) {
    return <div className="skeleton-card">Loading AQI data...</div>
  }

  if (!data) return null

  const category = getAQICategory(data.aqi)
  const recommendation = getAQIRecommendation(data.aqi)

  return (
    <motion.div
      className="aqi-card"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* AQI header + timestamp */}
      <div className="aqi-header">
        <h3>AQI Overview</h3>
        <span className="timestamp">
          Updated: {new Date(data.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Main AQI value + category */}
      <div className="aqi-main">
        <div className="aqi-value-section">
          <div className="aqi-value" style={{ color: category.color }}>
            {data.aqi}
          </div>
          <div className="aqi-category" style={{ color: category.labelColor, backgroundColor: category.bgColor }}>
            {category.label}
          </div>
        </div>
      </div>

      {/* Weather info */}
      <div className="weather-info">
        <div className="weather-item">
          <FiThermometer />
          <span>{data.temperature?.toFixed(1)}°C</span>
        </div>
        <div className="weather-item">
          <FiDroplet />
          <span>{data.humidity?.toFixed(0)}%</span>
        </div>
        <div className="weather-item">
          <FiWind />
          <span>{data.wind_speed?.toFixed(1)} m/s</span>
        </div>
      </div>

      {/* Key pollutants grid */}
      <div className="pollutants">
        <h4>Key Pollutants</h4>
        <div className="pollutant-grid">
          <div className="pollutant">
            <span className="label">PM2.5</span>
            <span className="value">{data.pm25?.toFixed(1)} µg/m³</span>
          </div>
          <div className="pollutant">
            <span className="label">PM10</span>
            <span className="value">{data.pm10?.toFixed(1)} µg/m³</span>
          </div>
          <div className="pollutant">
            <span className="label">O₃</span>
            <span className="value">{data.o3?.toFixed(1)} ppb</span>
          </div>
          <div className="pollutant">
            <span className="label">NO₂</span>
            <span className="value">{data.no2?.toFixed(1)} ppb</span>
          </div>
        </div>
      </div>

      {/* Health recommendation */}
      <div className="recommendation">
        <h4>Health Recommendation</h4>
        <p className="recommendation-text">{recommendation}</p>
      </div>
    </motion.div>
  )
}

export default AQICard