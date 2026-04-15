// src/components/Dashboard/TrafficMap.jsx
import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import { useTrafficHeatmap } from '../../hooks/useTraffic'
import { getAQIColor, getAQICategory } from '../../utils/helpers'

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const TrafficMap = ({ city, aqiData, onLocationSelect, routeData }) => {
  const mapRef = useRef(null)
  const heatmapRef = useRef(null)
  const markersRef = useRef([])
  const routeLayerRef = useRef(null)
  const [map, setMap] = useState(null)
  const [heatmapEnabled, setHeatmapEnabled] = useState(true)

  const { data: heatmapData, isLoading: heatmapLoading } = useTrafficHeatmap(city)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      const mapInstance = L.map('traffic-map').setView(
        [city.coordinates.lat, city.coordinates.lng], 
        12
      )
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstance)
      
      mapRef.current = mapInstance
      setMap(mapInstance)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update map view when city changes
  useEffect(() => {
    if (map && city?.coordinates) {
      map.setView([city.coordinates.lat, city.coordinates.lng], 12)
    }
  }, [map, city])

  // Draw heatmap on map
  useEffect(() => {
    if (!map || !heatmapData || !heatmapData.points || !heatmapEnabled) {
      if (heatmapRef.current && !heatmapEnabled) {
        map?.removeLayer(heatmapRef.current)
        heatmapRef.current = null
      }
      return
    }
    
    // Remove existing heatmap layer
    if (heatmapRef.current) {
      map.removeLayer(heatmapRef.current)
      heatmapRef.current = null
    }
    
    try {
      // Format data for heatmap: [lat, lng, intensity]
      const heatPoints = heatmapData.points
        .filter(point => point.lat && point.lng && point.intensity !== undefined)
        .map(point => [point.lat, point.lng, point.intensity])
      
      if (heatPoints.length === 0) {
        console.warn('No heatmap points available')
        return
      }
      
      console.log(`Drawing heatmap with ${heatPoints.length} points`)
      
      // Create heatmap layer with custom options
      const heatLayer = L.heatLayer(heatPoints, {
        radius: 30,
        blur: 20,
        maxZoom: 17,
        minOpacity: 0.3,
        gradient: {
          0.2: '#00E400',  // Good AQI - Green
          0.4: '#FFFF00',  // Moderate - Yellow
          0.6: '#FF7E00',  // Unhealthy for Sensitive - Orange
          0.8: '#FF0000',  // Unhealthy - Red
          1.0: '#8F3F97'   // Very Unhealthy - Purple
        }
      })
      
      heatLayer.addTo(map)
      heatmapRef.current = heatLayer
      
    } catch (error) {
      console.error('Error creating heatmap:', error)
    }
  }, [map, heatmapData, heatmapEnabled])

  // Draw route on map
  useEffect(() => {
    if (!map || !routeData) return
    
    // Clear existing route layer
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current)
    }
    
    // Clear existing waypoint markers
    const waypointMarkers = markersRef.current.filter(m => m.options?.isWaypoint)
    waypointMarkers.forEach(marker => map.removeLayer(marker))
    markersRef.current = markersRef.current.filter(m => !m.options?.isWaypoint)
    
    let latlngs = []
    
    // Check if we have geometry from OSRM
    if (routeData.geometry && routeData.geometry.coordinates) {
      latlngs = routeData.geometry.coordinates.map(coord => [coord[1], coord[0]])
    } 
    // Fallback to waypoints
    else if (routeData.waypoints && routeData.waypoints.length > 0) {
      latlngs = routeData.waypoints.map(wp => {
        if (wp.coordinates) {
          return [wp.coordinates.latitude, wp.coordinates.longitude]
        }
        if (wp.lat && wp.lng) {
          return [wp.lat, wp.lng]
        }
        return [wp.latitude, wp.longitude]
      })
    }
    
    if (latlngs.length === 0) return
    
    // Get AQI color for the route
    const avgAQI = routeData.averageAQI || routeData.average_aqi || 100
    const routeColor = getAQIColor(avgAQI)
    
    // Create the route line
    const routeLine = L.polyline(latlngs, {
      color: routeColor,
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map)
    
    // Add popup to route
    routeLine.bindPopup(`
      <div class="route-popup">
        <strong>${routeData.name || 'Optimized Route'}</strong><br/>
        📍 Distance: ${(routeData.totalDistanceKm || routeData.total_distance_km || 0).toFixed(1)} km<br/>
        ⏱️ Est. Time: ${routeData.estimatedTimeMinutes || routeData.estimated_time_minutes || 0} min<br/>
        🌿 Avg AQI: ${(routeData.averageAQI || routeData.average_aqi || 0).toFixed(0)}<br/>
        <span style="color: ${routeColor}">● Pollution score: ${(routeData.pollutionExposureScore || routeData.pollution_exposure_score || 0).toFixed(1)}</span>
      </div>
    `)
    
    routeLayerRef.current = routeLine
    
    // Add waypoint markers
    const step = Math.max(1, Math.floor(latlngs.length / 8))
    for (let i = 0; i < latlngs.length; i += step) {
      const latlng = latlngs[i]
      const aqi = routeData.waypoints?.[i]?.aqi || 80
      const wpColor = getAQIColor(aqi)
      
      const marker = L.circleMarker(latlng, {
        radius: 5,
        fillColor: wpColor,
        color: '#fff',
        weight: 2,
        fillOpacity: 0.9,
        isWaypoint: true
      }).addTo(map)
      
      marker.bindPopup(`
        <div class="waypoint-popup">
          <strong>Waypoint</strong><br/>
          AQI: ${aqi}<br/>
          ${routeData.waypoints?.[i]?.trafficLevel ? `Traffic: ${routeData.waypoints[i].trafficLevel}` : ''}
        </div>
      `)
      
      markersRef.current.push(marker)
    }
    
    // Add start and end markers
    if (latlngs.length >= 2) {
      // Start marker (green)
      const startIcon = L.divIcon({
        className: 'custom-div-icon',
        html: '<div style="background-color: #27ae60; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [16, 16],
        popupAnchor: [0, -8]
      })
      
      const startMarker = L.marker(latlngs[0], { icon: startIcon }).addTo(map)
      startMarker.bindPopup('<strong>🚀 Start Point</strong><br/>Origin of your journey')
      markersRef.current.push(startMarker)
      
      // End marker (red)
      const endIcon = L.divIcon({
        className: 'custom-div-icon',
        html: '<div style="background-color: #e74c3c; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [16, 16],
        popupAnchor: [0, -8]
      })
      
      const endMarker = L.marker(latlngs[latlngs.length - 1], { icon: endIcon }).addTo(map)
      endMarker.bindPopup('<strong>🏁 Destination</strong><br/>End of your journey')
      markersRef.current.push(endMarker)
    }
    
    // Fit map to route bounds
    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] })
    
  }, [map, routeData])

  // Add AQI marker for city
  useEffect(() => {
    if (map && aqiData && city?.coordinates) {
      // Clear existing city markers
      const cityMarkers = markersRef.current.filter(m => m.options?.isCityMarker)
      cityMarkers.forEach(marker => map.removeLayer(marker))
      markersRef.current = markersRef.current.filter(m => !m.options?.isCityMarker)

      // Add main city marker
      const aqiColor = getAQIColor(aqiData.aqi)
      const category = getAQICategory(aqiData.aqi)
      
      const circleMarker = L.circleMarker(
        [city.coordinates.lat, city.coordinates.lng],
        {
          radius: 20,
          fillColor: aqiColor,
          color: '#fff',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.85,
          isCityMarker: true
        }
      ).addTo(map)

      circleMarker.bindPopup(`
        <div class="popup-content">
          <h4>${city.name}</h4>
          <div class="aqi-value" style="color: ${aqiColor}; font-size: 20px; font-weight: bold;">
            AQI: ${aqiData.aqi}
          </div>
          <div class="aqi-category">${category.label}</div>
          <div class="weather-info">
            🌡️ ${aqiData.temperature || '--'}°C | 💧 ${aqiData.humidity || '--'}%
          </div>
        </div>
      `)

      markersRef.current.push(circleMarker)
    }
  }, [map, aqiData, city])

  // Add click handler for getting AQI at clicked location
  useEffect(() => {
    if (map) {
      const handleMapClick = async (e) => {
        const { lat, lng } = e.latlng
        if (onLocationSelect) {
          onLocationSelect({ lat, lng })
        }
      }
      
      map.on('click', handleMapClick)
      return () => map.off('click', handleMapClick)
    }
  }, [map, onLocationSelect])

  // Toggle heatmap function
  const toggleHeatmap = () => {
    setHeatmapEnabled(!heatmapEnabled)
  }

  return (
    <div className="map-container">
      <div id="traffic-map" className="traffic-map"></div>
      <div className="map-controls">
        <button 
          className={`map-control-btn ${heatmapEnabled ? 'active' : ''}`} 
          onClick={toggleHeatmap}
        >
          {heatmapEnabled ? '🔥 Hide Heatmap' : '🌡️ Show Heatmap'}
        </button>
        <button 
          className="map-control-btn" 
          onClick={() => map?.setView([city.coordinates.lat, city.coordinates.lng], 12)}
        >
          📍 Recenter
        </button>
        {routeData && (
          <button 
            className="map-control-btn" 
            onClick={() => {
              if (routeLayerRef.current) {
                map?.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50] })
              }
            }}
          >
            🗺️ Fit Route
          </button>
        )}
      </div>
      {routeData && (
        <div className="route-info-banner">
          <span>✅ Route active: {routeData.name || 'Optimized Route'}</span>
          <button onClick={() => {
            if (routeLayerRef.current) {
              map?.removeLayer(routeLayerRef.current)
              routeLayerRef.current = null
            }
          }}>×</button>
        </div>
      )}
      {heatmapLoading && (
        <div className="heatmap-loading">
          <span>Loading heatmap data...</span>
        </div>
      )}
    </div>
  )
}

export default TrafficMap
