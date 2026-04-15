import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaArrowDown, FaArrowUp, FaMinus } from 'react-icons/fa'
import { getAQICategory } from '../../utils/helpers'

const PredictionCard = ({ data, isLoading }) => {
  // Show loading skeleton only on initial load
  if (isLoading && !data) {
    return (
      <div className="card">
        <div className="skeleton-loader">
          <div className="skeleton-title"></div>
          <div className="skeleton-prediction"></div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="card">
        <h3>Predictions (Next 4 Hours)</h3>
        <p className="no-data">No prediction data available. Please refresh.</p>
      </div>
    )
  }

  // Get data with fallbacks
  const currentAqi = data.current_aqi ?? data.currentAQI ?? 0
  const predicted2hr = data.predicted_2hr ?? data.predicted2hr ?? 0
  const predicted4hr = data.predicted_4hr ?? data.predicted4hr ?? 0
  const currentCategoryText = data.current_category ?? data.currentCategory ?? 'Moderate'
  const category2hrText = data.category_2hr ?? data.category2hr ?? 'Moderate'
  const category4hrText = data.category_4hr ?? data.category4hr ?? 'Moderate'
  const trend = data.trend ?? 'stable'
  const confidence = data.confidence ?? 0.7

  const currentCategory = getAQICategory(currentAqi)
  const category2hr = getAQICategory(predicted2hr)
  const category4hr = getAQICategory(predicted4hr)

  const getTrendComponent = (trendValue) => {
    switch (trendValue?.toLowerCase()) {
      case 'improving':
        return <FaArrowDown className="trend-improving" />
      case 'worsening':
        return <FaArrowUp className="trend-worsening" />
      default:
        return <FaMinus className="trend-stable" />
    }
  }

  const getTrendText = (trendValue) => {
    switch (trendValue?.toLowerCase()) {
      case 'improving':
        return 'Air quality is improving'
      case 'worsening':
        return 'Air quality is worsening'
      default:
        return 'Air quality is stable'
    }
  }

  const confidencePercent = Math.round(confidence * 100)

  return (
    <motion.div 
      className="card predictions-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3>Predictions (Next 4 Hours)</h3>
      
      <div className="predictions-container">
        {/* Current AQI */}
        <div className="prediction-item">
          <span className="prediction-label">Current</span>
          <AnimatePresence mode="wait">
            <motion.span 
              key={currentAqi}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="prediction-value" 
              style={{ color: currentCategory.color }}
            >
              {currentAqi}
            </motion.span>
          </AnimatePresence>
          <span className="prediction-category">{currentCategoryText}</span>
        </div>

        <div className="prediction-arrow">
          {getTrendComponent(trend)}
        </div>

        {/* 2 Hours Prediction */}
        <div className="prediction-item">
          <span className="prediction-label">In 2 Hours</span>
          <AnimatePresence mode="wait">
            <motion.span 
              key={predicted2hr}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="prediction-value" 
              style={{ color: category2hr.color }}
            >
              {predicted2hr}
            </motion.span>
          </AnimatePresence>
          <span className="prediction-category">{category2hrText}</span>
        </div>

        <div className="prediction-arrow">
          {getTrendComponent(trend)}
        </div>

        {/* 4 Hours Prediction */}
        <div className="prediction-item">
          <span className="prediction-label">In 4 Hours</span>
          <AnimatePresence mode="wait">
            <motion.span 
              key={predicted4hr}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="prediction-value" 
              style={{ color: category4hr.color }}
            >
              {predicted4hr}
            </motion.span>
          </AnimatePresence>
          <span className="prediction-category">{category4hrText}</span>
        </div>
      </div>

      {/* Trend Indicator */}
      <div className="trend-indicator">
        <div className={`trend-badge trend-${trend?.toLowerCase() || 'stable'}`}>
          {getTrendComponent(trend)}
          <span>{getTrendText(trend)}</span>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="prediction-confidence">
        <div className="confidence-label">
          <span>Prediction Confidence</span>
          <span>{confidencePercent}%</span>
        </div>
        <div className="confidence-bar">
          <motion.div 
            className="confidence-fill" 
            initial={{ width: 0 }}
            animate={{ width: `${confidencePercent}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>
      </div>

      {/* Next update indicator */}
      <div className="next-update">
        <small>⏳ Auto-updates every 60 seconds</small>
      </div>
    </motion.div>
  )
}

export default PredictionCard
