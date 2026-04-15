// src/components/Common/LocationSearch.jsx
import React, { useState, useEffect, useRef } from 'react'
import { FiMapPin, FiSearch, FiLoader, FiX, FiNavigation } from 'react-icons/fi'
import { locationService } from '../../services/locationService'

const LocationSearch = ({ 
  placeholder = "Search location...", 
  onSelect, 
  value, 
  onChange,
  label,
  autoFocus = false
}) => {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isUsingCurrent, setIsUsingCurrent] = useState(false)
  const searchRef = useRef(null)
  const debounceTimer = useRef(null)
  const inputRef = useRef(null)

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Update query when value prop changes
  useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value)
    }
  }, [value])

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    
    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true)
      const results = await locationService.searchLocation(query)
      setSuggestions(results)
      setShowSuggestions(results.length > 0)
      setIsLoading(false)
    }, 500)
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [query])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (location) => {
    setQuery(location.name)
    setShowSuggestions(false)
    if (onSelect) {
      onSelect({
        name: location.name,
        lat: location.lat,
        lon: location.lon
      })
    }
    if (onChange) {
      onChange(location.name)
    }
  }

  const handleCurrentLocation = async () => {
    setIsUsingCurrent(true)
    try {
      const location = await locationService.getCurrentLocation()
      const address = await locationService.reverseGeocode(location.lat, location.lon)
      setQuery(address)
      if (onSelect) {
        onSelect({
          name: address,
          lat: location.lat,
          lon: location.lon
        })
      }
      if (onChange) {
        onChange(address)
      }
      toast.success('Current location detected!')
    } catch (error) {
      console.error('Failed to get current location:', error)
      alert('Unable to get your location. Please check permissions.')
    } finally {
      setIsUsingCurrent(false)
    }
  }

  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    if (onChange) onChange('')
    if (onSelect) onSelect(null)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="location-search" ref={searchRef}>
      {label && <label>{label}</label>}
      <div className="search-input-wrapper">
        <FiMapPin className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (onChange) onChange(e.target.value)
          }}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
        />
        {query && (
          <button className="clear-btn" onClick={handleClear} type="button">
            <FiX />
          </button>
        )}
        <button 
          className="current-location-btn" 
          onClick={handleCurrentLocation}
          disabled={isUsingCurrent}
          title="Use my current location"
          type="button"
        >
          {isUsingCurrent ? <FiLoader className="spinning" /> : <FiNavigation />}
        </button>
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {isLoading && (
            <div className="suggestion-loading">
              <FiLoader className="spinning" /> Searching...
            </div>
          )}
          {!isLoading && suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSelect(suggestion)}
            >
              <FiMapPin />
              <div className="suggestion-details">
                <div className="suggestion-name">{suggestion.name.split(',')[0]}</div>
                <div className="suggestion-address">{suggestion.name.split(',').slice(1).join(',').trim()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LocationSearch
