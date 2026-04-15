import React, { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import AQICard from '../components/Dashboard/AQICard'
import PredictionCard from '../components/Dashboard/PredictionCard'
import AlertCard from '../components/Dashboard/AlertCard'
import TrafficMap from '../components/Dashboard/TrafficMap'
import RouteOptimizer from '../components/Dashboard/RouteOptimizer'
import AQITrendChart from '../components/Charts/AQITrendChart'
import { useCity } from '../context/CityContext'
import { useAQI, usePredictions, useAlerts, useAQIHistory, useRefreshData } from '../hooks/useAQI'
import { useWebSocket } from '../hooks/useWebSocket'

const Dashboard = () => {
  const { currentCity } = useCity()
  const queryClient = useQueryClient()
  const { refreshAll } = useRefreshData()
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [routeData, setRouteData] = useState(null) // State for route data
  
  // Real-time data fetching with auto-refresh
  const { data: aqiData, isLoading: aqiLoading, error: aqiError, isFetching: aqiFetching } = useAQI(currentCity)
  const { data: predictionsData, isLoading: predictionsLoading, error: predictionsError, isFetching: predictionsFetching } = usePredictions(currentCity)
  const { data: alertsData, isLoading: alertsLoading } = useAlerts(currentCity)
  const { data: historyData } = useAQIHistory(currentCity, 24)
  
  // Log data for debugging
  useEffect(() => {
    console.log('Predictions Data:', predictionsData)
    console.log('AQI Data:', aqiData)
    console.log('Route Data:', routeData)
  }, [predictionsData, aqiData, routeData])
  
  // WebSocket for real-time updates
  const { lastMessage } = useWebSocket(`city-${currentCity.value}`)

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage?.type === 'prediction') {
      queryClient.setQueryData(['predictions', currentCity.value], lastMessage.data)
      toast.success('New prediction data available', { icon: '🔄' })
    }
    
    if (lastMessage?.type === 'alert') {
      toast.error(lastMessage.message, { duration: 10000 })
    }
  }, [lastMessage, queryClient, currentCity])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    toast.loading('Refreshing data...', { id: 'refresh' })
    try {
      await refreshAll()
      toast.success('Dashboard refreshed successfully', { id: 'refresh' })
    } catch (error) {
      toast.error('Failed to refresh data', { id: 'refresh' })
    } finally {
      setIsRefreshing(false)
    }
  }, [refreshAll])

  // Handle route calculation from RouteOptimizer
  const handleRouteCalculated = useCallback((route) => {
    console.log('Route calculated:', route)
    setRouteData(route)
    toast.success('Route displayed on map!', { icon: '🗺️' })
  }, [])

  // Clear route when city changes
  useEffect(() => {
    setRouteData(null)
  }, [currentCity])

  // Show fetching indicator
  const isFetching = aqiFetching || predictionsFetching

  if (aqiError) {
    return (
      <div className="error-state">
        <h3>Failed to load AQI data</h3>
        <p>{aqiError.message}</p>
        <button onClick={handleRefresh}>Retry</button>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Air Quality Dashboard</h1>
        <div className="dashboard-actions">
          {isFetching && (
            <span className="fetching-indicator">
              <span className="spinner-small"></span> Updating...
            </span>
          )}
          <button 
            onClick={handleRefresh} 
            className="refresh-btn"
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-col col-3">
          <AQICard data={aqiData} isLoading={aqiLoading} />
          <PredictionCard data={predictionsData} isLoading={predictionsLoading} />
        </div>

        {/* Center Column - Map */}
        <div className="dashboard-col col-6">
          <div className="map-container">
            <TrafficMap 
              city={currentCity}
              aqiData={aqiData}
              onLocationSelect={setSelectedLocation}
              routeData={routeData}
            />
          </div>
          <div className="map-controls">
            <button className="map-control-btn" onClick={() => setRouteData(null)}>
              🗑️ Clear Route
            </button>
            <button className="map-control-btn">🗺️ Satellite</button>
            <button className="map-control-btn">🌡️ Heatmap</button>
          </div>
          {routeData && (
            <div className="route-info-banner">
              <span>✅ Route active: {routeData.name || 'Optimized Route'}</span>
              <button onClick={() => setRouteData(null)}>×</button>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="dashboard-col col-3">
          <AlertCard data={alertsData} isLoading={alertsLoading} />
          <RouteOptimizer 
            city={currentCity} 
            onRouteCalculated={handleRouteCalculated}
          />
        </div>
      </div>

      {/* Bottom Section - Charts */}
      <div className="dashboard-bottom">
        <div className="chart-container">
          <h3>24-Hour AQI Trend</h3>
          <AQITrendChart data={historyData} />
        </div>
      </div>

      {/* Auto-refresh status */}
      <div className="auto-refresh-status">
        <span className="status-dot"></span>
        Auto-refreshing every 60 seconds
      </div>

      {/* Location Modal */}
      {selectedLocation && (
        <motion.div 
          className="location-modal"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="modal-content">
            <h3>Location Details</h3>
            <p>Lat: {selectedLocation.lat.toFixed(4)}</p>
            <p>Lng: {selectedLocation.lng.toFixed(4)}</p>
            <button onClick={() => setSelectedLocation(null)}>Close</button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Dashboard
