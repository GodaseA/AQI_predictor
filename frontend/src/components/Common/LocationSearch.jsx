// src/components/Common/LocationSearch.jsx
import React, { useState, useEffect, useRef } from 'react'
import { FiMapPin, FiLoader, FiX, FiNavigation } from 'react-icons/fi'
import { locationService } from '../../services/locationService'
import toast from 'react-hot-toast'
import "./LocationSearch.css"

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
  const [activeIndex, setActiveIndex] = useState(-1)
  const searchRef = useRef(null)
  const debounceTimer = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus()
  }, [autoFocus])

  useEffect(() => {
    if (value !== undefined && value !== query) setQuery(value)
  }, [value])

  useEffect(() => {
    clearTimeout(debounceTimer.current)
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
      setActiveIndex(-1)
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(debounceTimer.current)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowSuggestions(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (location) => {
    setQuery(location.name)
    setShowSuggestions(false)
    setSuggestions([])
    setActiveIndex(-1)
    if (onSelect) onSelect({ name: location.name, lat: location.lat, lon: location.lon })
    if (onChange) onChange(location.name)
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const handleCurrentLocation = async () => {
    setIsUsingCurrent(true)
    try {
      const location = await locationService.getCurrentLocation()
      const address = await locationService.reverseGeocode(location.lat, location.lon)
      setQuery(address)
      if (onSelect) onSelect({ name: address, lat: location.lat, lon: location.lon })
      if (onChange) onChange(address)
      toast.success('Current location detected!')
    } catch (error) {
      console.error('Failed to get current location:', error)
      toast.error('Unable to get your location. Please check permissions.')
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
    inputRef.current?.focus()
  }

  return (
    <div className="location-search" ref={searchRef}>
      {label && <label className="location-label">{label}</label>}
      <div className="search-input-wrapper">
        <FiMapPin className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          className="location-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (onChange) onChange(e.target.value)
          }}
          onFocus={() => query.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        {query && (
          <button className="clear-btn" onClick={handleClear} type="button" title="Clear">
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
          {isUsingCurrent
            ? <FiLoader className="spinning" />
            : <FiNavigation />
          }
        </button>
      </div>

      {(showSuggestions || isLoading) && (
        <ul className="suggestions-dropdown" role="listbox">
          {isLoading && (
            <li className="suggestion-loading">
              <FiLoader className="spinning" />
              <span>Searching...</span>
            </li>
          )}
          {!isLoading && suggestions.map((suggestion, index) => (
            <li
              key={index}
              className={`suggestion-item${index === activeIndex ? ' suggestion-item--active' : ''}`}
              onMouseDown={() => handleSelect(suggestion)}
              role="option"
              aria-selected={index === activeIndex}
            >
              <FiMapPin className="suggestion-pin" />
              <div className="suggestion-details">
                <span className="suggestion-name">{suggestion.name.split(',')[0]}</span>
                <span className="suggestion-address">
                  {suggestion.name.split(',').slice(1).join(',').trim()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default LocationSearch