// src/pages/Dashboard.jsx
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
import "./Dashboard.css"

const Dashboard = () => {
  const { currentCity } = useCity()
  const queryClient = useQueryClient()
  const { refreshAll } = useRefreshData()
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [routeData, setRouteData] = useState(null)

  // Data fetching
  const { data: aqiData, isLoading: aqiLoading, error: aqiError, isFetching: aqiFetching } = useAQI(currentCity)
  const { data: predictionsData, isLoading: predictionsLoading, error: predictionsError, isFetching: predictionsFetching } = usePredictions(currentCity)
  const { data: alertsData, isLoading: alertsLoading } = useAlerts(currentCity)
  const { data: historyData } = useAQIHistory(currentCity, 24)

  // Debug logging
  useEffect(() => {
    console.log('🔵 Predictions Data:', predictionsData)
    console.log('🔵 Predictions Loading:', predictionsLoading)
    console.log('🔵 Predictions Error:', predictionsError)
    console.log('🟢 AQI Data:', aqiData)
  }, [predictionsData, predictionsLoading, predictionsError, aqiData])

  // WebSocket for real-time updates (only heartbeat, no data override)
  const { lastMessage } = useWebSocket(`city-${currentCity.value}`)

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage?.type === 'heartbeat') {
      console.log('WebSocket heartbeat received')
    }
  }, [lastMessage])

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

  const handleRouteCalculated = useCallback((route) => {
    console.log('Route calculated:', route)
    setRouteData(route)
    toast.success('Route displayed on map!', { icon: '🗺️' })
  }, [])

  // Clear route when city changes
  useEffect(() => {
    setRouteData(null)
  }, [currentCity])

  const isFetching = aqiFetching || predictionsFetching

  if (aqiError) {
    return (
      <div className="dashboard-error">
        <h3>Failed to load AQI data</h3>
        <p>{aqiError.message}</p>
        <button onClick={handleRefresh}>Retry</button>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <h1>Air Quality Dashboard</h1>

        {/* Refresh button styled to match navbar (small, subtle) */}
        <div className="dashboard-actions">
          {isFetching && (
            <span className="fetching-indicator">
              <span className="spinner-small"></span> Updating...
            </span>
          )}
          <button
            onClick={handleRefresh}
            className="btn-refresh btn-refresh-small"
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refresh...' : '🔄 Refresh'}
          </button>
        </div>
      </header>

      {/* <main className="dashboard-main">
        <div className="dashboard-grid">
           <section className="dashboard-col dashboard-col-left">
            <div className="aqi-predictions-grid">
              <AQICard data={aqiData} isLoading={aqiLoading} />
              <PredictionCard data={predictionsData} isLoading={predictionsLoading} />
            </div>

            <div className="alerts-chart-grid">
              <AlertCard data={alertsData} isLoading={alertsLoading} />

              <div className="chart-container">
                <h3>24‑Hour AQI Trend</h3>
                <AQITrendChart data={historyData} />
              </div>
            </div>
          </section>

           <section className="dashboard-col dashboard-col-right">
                <TrafficMap
                city={currentCity}
                aqiData={aqiData}
                onLocationSelect={setSelectedLocation}
                routeData={routeData}
              />

             <div className="route-optimizer-container">
              <RouteOptimizer
                city={currentCity}
                onRouteCalculated={handleRouteCalculated}
              />
            </div>

            {routeData && (
              <div className="route-info-banner">
                <span>✅ Route active: {routeData.name || 'Optimized Route'}</span>
                <button onClick={() => setRouteData(null)}>×</button>
              </div>
            )}

          </section>
        </div>
      </main> */}

      <main className="dashboard-main">
        <div className="dashboard-grid">
          <section className="dashboard-row dashboard-row-top">
            <div className="aqi-predictions-grid">
              <AQICard data={aqiData} isLoading={aqiLoading} />
              <PredictionCard data={predictionsData} isLoading={predictionsLoading} />
            </div>
          </section>

          <section className="dashboard-row dashboard-row-mid">
            <TrafficMap
              city={currentCity}
              aqiData={aqiData}
              onLocationSelect={setSelectedLocation}
              routeData={routeData}
            />

            <div className="route-optimizer-container">
              <RouteOptimizer
                city={currentCity}
                onRouteCalculated={handleRouteCalculated}
              />
            </div>

            {routeData && (
              <div className="route-info-banner">
                <span>✅ Route active: {routeData.name || 'Optimized Route'}</span>
                <button onClick={() => setRouteData(null)}>×</button>
              </div>
            )}

          </section>
          <section className="dashboard-col dashboard-row-below">
            <div className="alerts-chart-grid">
              <AlertCard data={alertsData} isLoading={alertsLoading} />

              <div className="chart-container">
                <h3>24‑Hour AQI Trend</h3>
                <AQITrendChart data={historyData} />
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Auto-refresh status (bottom bar) */}
      <footer className="dashboard-status">
        <span className="status-dot"></span>
        Auto‑refreshing every 60 seconds
      </footer>

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