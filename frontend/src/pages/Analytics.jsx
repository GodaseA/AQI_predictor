import React from 'react'
import { motion } from 'framer-motion'
import { useCity } from '../context/CityContext'
import { useAQIHistory } from '../hooks/useAQI'
import AQITrendChart from '../components/Charts/AQITrendChart'

const Analytics = () => {
  const { currentCity } = useCity()
  const { data: historyData, isLoading } = useAQIHistory(currentCity, 168) // 7 days

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="analytics-page"
    >
      <h1>Analytics Dashboard</h1>
      
      <div className="analytics-grid">
        <div className="chart-card">
          <h3>7-Day AQI Trend</h3>
          <AQITrendChart data={historyData} />
        </div>
        
        <div className="stats-card">
          <h3>Statistics</h3>
          {!isLoading && historyData && (
            <div className="stats-grid">
              <div className="stat">
                <span className="stat-label">Average AQI</span>
                <span className="stat-value">
                  {Math.round(historyData.datasets[0].data.reduce((a, b) => a + b, 0) / historyData.datasets[0].data.length)}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Peak AQI</span>
                <span className="stat-value">
                  {Math.max(...historyData.datasets[0].data)}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Lowest AQI</span>
                <span className="stat-value">
                  {Math.min(...historyData.datasets[0].data)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default Analytics