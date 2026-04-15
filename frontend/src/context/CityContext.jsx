import React, { createContext, useState, useContext, useCallback, useEffect } from 'react'

const CityContext = createContext()

export const cities = [
  { 
    id: 1, 
    name: 'Pune', 
    value: 'pune', 
    coordinates: { lat: 18.5204, lng: 73.8567 },
    timezone: 'Asia/Kolkata'
  },
  { 
    id: 2, 
    name: 'Mumbai', 
    value: 'mumbai', 
    coordinates: { lat: 19.0760, lng: 72.8777 },
    timezone: 'Asia/Kolkata'
  },
  { 
    id: 3, 
    name: 'Delhi', 
    value: 'delhi', 
    coordinates: { lat: 28.6139, lng: 77.2090 },
    timezone: 'Asia/Kolkata'
  },
  { 
    id: 4, 
    name: 'Bangalore', 
    value: 'bangalore', 
    coordinates: { lat: 12.9716, lng: 77.5946 },
    timezone: 'Asia/Kolkata'
  },
  { 
    id: 5, 
    name: 'Chennai', 
    value: 'chennai', 
    coordinates: { lat: 13.0827, lng: 80.2707 },
    timezone: 'Asia/Kolkata'
  },
  { 
    id: 6, 
    name: 'Kolkata', 
    value: 'kolkata', 
    coordinates: { lat: 22.5726, lng: 88.3639 },
    timezone: 'Asia/Kolkata'
  }
]

export const CityProvider = ({ children }) => {
  const [currentCity, setCurrentCity] = useState(() => {
    const saved = localStorage.getItem('selectedCity')
    return saved ? JSON.parse(saved) : cities[0]
  })
  
  const [recentCities, setRecentCities] = useState(() => {
    const saved = localStorage.getItem('recentCities')
    return saved ? JSON.parse(saved) : []
  })

  const changeCity = useCallback((city) => {
    setCurrentCity(city)
    localStorage.setItem('selectedCity', JSON.stringify(city))
    
    // Update recent cities
    setRecentCities(prev => {
      const filtered = prev.filter(c => c.id !== city.id)
      return [city, ...filtered].slice(0, 5)
    })
  }, [])

  useEffect(() => {
    localStorage.setItem('recentCities', JSON.stringify(recentCities))
  }, [recentCities])

  return (
    <CityContext.Provider value={{
      currentCity,
      changeCity,
      cities,
      recentCities
    }}>
      {children}
    </CityContext.Provider>
  )
}

export const useCity = () => {
  const context = useContext(CityContext)
  if (!context) {
    throw new Error('useCity must be used within CityProvider')
  }
  return context
}