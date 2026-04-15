// src/components/Dashboard/RouteOptimizer.jsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaRoute, FaRoad, FaClock, FaLungs, FaExchangeAlt, FaPlus, FaTrash } from 'react-icons/fa'
import { useOptimizeRoute } from '../../hooks/useRoutes'
import { formatDuration, getAQICategory } from '../../utils/helpers'
import LocationSearch from '../Common/LocationSearch'

const RouteOptimizer = ({ city, onRouteCalculated }) => {
  const [origin, setOrigin] = useState(null)
  const [destination, setDestination] = useState(null)
  const [originText, setOriginText] = useState('')
  const [destinationText, setDestinationText] = useState('')
  const [waypoints, setWaypoints] = useState([])
  const [preference, setPreference] = useState('balanced')
  
  const optimizeRoute = useOptimizeRoute()

  const handleSwapLocations = () => {
    const tempOrigin = origin
    const tempOriginText = originText
    setOrigin(destination)
    setOriginText(destinationText)
    setDestination(tempOrigin)
    setDestinationText(tempOriginText)
  }

  const handleAddWaypoint = () => {
    setWaypoints([...waypoints, { id: Date.now(), location: null, text: '' }])
  }

  const handleRemoveWaypoint = (id) => {
    setWaypoints(waypoints.filter(wp => wp.id !== id))
  }

  const handleWaypointSelect = (id, location, text) => {
    setWaypoints(waypoints.map(wp => 
      wp.id === id ? { ...wp, location, text } : wp
    ))
  }

  const handleOptimize = async () => {
    if (!origin || !destination) {
      toast.error('Please select both origin and destination from suggestions')
      return
    }

    // Build the route points array
    const routePoints = [origin, ...waypoints.filter(wp => wp.location).map(wp => wp.location), destination]
    
    if (routePoints.length < 2) {
      toast.error('Need at least origin and destination')
      return
    }

    console.log('Optimizing route with points:', routePoints)
    
    try {
      const result = await optimizeRoute.mutateAsync({
        waypoints: routePoints,
        preference: preference,
      })
      
      console.log('Route result:', result)
      
      // Extract route data from response - handle different response structures
      let routeData = null
      
      // Check various possible response structures
      if (result?.data?.recommendedRoute) {
        routeData = result.data.recommendedRoute
      } else if (result?.recommendedRoute) {
        routeData = result.recommendedRoute
      } else if (result?.data?.data?.recommendedRoute) {
        routeData = result.data.data.recommendedRoute
      } else if (result?.data?.recommended_route) {
        routeData = result.data.recommended_route
      }
      
      // If still no route data, the response itself might be the route
      if (!routeData && result?.waypoints) {
        routeData = result
      }
      
      console.log('Extracted route data:', routeData)
      
      // Pass route data to parent component for map display
      if (routeData && onRouteCalculated) {
        onRouteCalculated(routeData)
        toast.success(`Route optimized successfully!`, { icon: '🗺️' })
      } else {
        toast.warning('Route calculated but cannot display on map')
      }
    } catch (error) {
      console.error('Optimization error:', error)
      toast.error('Failed to optimize route: ' + (error.response?.data?.message || error.message || 'Unknown error'))
    }
  }

  // Get route data from mutation result
  const mutationData = optimizeRoute.data
  let route = null
  
  if (mutationData?.data?.recommendedRoute) {
    route = mutationData.data.recommendedRoute
  } else if (mutationData?.recommendedRoute) {
    route = mutationData.recommendedRoute
  } else if (mutationData?.data?.recommended_route) {
    route = mutationData.data.recommended_route
  }
  
  const category = route ? getAQICategory(route.averageAQI || route.average_aqi || 0) : null

  return (
    <motion.div 
      className="card route-optimizer-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <h3>Route Optimization</h3>
      <p className="route-description">Add multiple stops to find the cleanest path</p>
      
      <div className="route-form">
        {/* Origin */}
        <LocationSearch
          label="Starting Point"
          placeholder="Enter origin (e.g., Shivaji Nagar, Pune)"
          value={originText}
          onChange={setOriginText}
          onSelect={setOrigin}
        />
        
        {/* Waypoints */}
        <div className="waypoints-section">
          <div className="waypoints-header">
            <label>Stops (Optional)</label>
            <button type="button" className="add-waypoint-btn" onClick={handleAddWaypoint}>
              <FaPlus /> Add Stop
            </button>
          </div>
          
          <AnimatePresence>
            {waypoints.map((waypoint, index) => (
              <motion.div
                key={waypoint.id}
                className="waypoint-item"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="waypoint-number">{index + 1}</div>
                <LocationSearch
                  placeholder={`Stop ${index + 1} (e.g., Hinjewadi)`}
                  value={waypoint.text}
                  onChange={(text) => handleWaypointSelect(waypoint.id, waypoint.location, text)}
                  onSelect={(location) => handleWaypointSelect(waypoint.id, location, waypoint.text)}
                />
                <button 
                  type="button" 
                  className="remove-waypoint-btn"
                  onClick={() => handleRemoveWaypoint(waypoint.id)}
                  title="Remove stop"
                >
                  <FaTrash />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Swap Button */}
        <div className="swap-btn-container">
          <button type="button" className="swap-btn" onClick={handleSwapLocations}>
            <FaExchangeAlt /> Swap Start & Destination
          </button>
        </div>
        
        {/* Destination */}
        <LocationSearch
          label="Destination"
          placeholder="Enter destination (e.g., Pune Station)"
          value={destinationText}
          onChange={setDestinationText}
          onSelect={setDestination}
        />
        
        {/* Preference */}
        <div className="form-group">
          <label>Route Preference</label>
          <select value={preference} onChange={(e) => setPreference(e.target.value)}>
            <option value="balanced">⚖️ Balanced (Time + Pollution)</option>
            <option value="cleanest">🌿 Cleanest (Low Pollution)</option>
            <option value="fastest">⚡ Fastest (Min Time)</option>
          </select>
        </div>
        
        {/* Optimize Button */}
        <button 
          className="optimize-btn" 
          onClick={handleOptimize} 
          disabled={optimizeRoute.isLoading || !origin || !destination}
        >
          <FaRoute /> {optimizeRoute.isLoading ? 'Optimizing...' : 'Optimize Route'}
        </button>
      </div>

      {/* Route Result */}
      {route && (
        <div className="route-result">
          <div className="route-card-result">
            <h4>{route.name || 'Recommended Route'}</h4>
            <div className="route-stats">
              <div className="stat">
                <FaRoad />
                <span>{route.totalDistanceKm || route.total_distance_km || 'N/A'} km</span>
              </div>
              <div className="stat">
                <FaClock />
                <span>{formatDuration(route.estimatedTimeMinutes || route.estimated_time_minutes || 0)}</span>
              </div>
              <div className="stat">
                <FaLungs />
                <span style={{ color: category?.color }}>
                  Avg AQI: {(route.averageAQI || route.average_aqi || 0).toFixed(0)}
                </span>
              </div>
            </div>
            <p className="route-reason">{route.recommendationReason || route.recommendation_reason || 'Optimal route based on your preferences'}</p>
            
            {/* Waypoints Summary */}
            {waypoints.filter(wp => wp.location).length > 0 && (
              <div className="waypoints-summary">
                <h5>📍 Stops ({waypoints.filter(wp => wp.location).length})</h5>
                <ul>
                  {waypoints.filter(wp => wp.location).map((wp, idx) => (
                    <li key={wp.id}>{idx + 1}. {wp.text || wp.location.name}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Savings */}
            {mutationData?.savings && (
              <div className="savings">
                <h5>💚 Environmental Savings</h5>
                <p>Pollution reduction: {mutationData.savings.pollutionReductionPercent || 
                   mutationData.savings.pollution_reduction_percent || 0}%</p>
              </div>
            )}
            
            <div className="route-map-note">
              <small>📍 Route displayed on map above</small>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default RouteOptimizer
