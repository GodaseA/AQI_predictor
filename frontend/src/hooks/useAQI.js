import { useQuery, useQueryClient } from 'react-query'
import { aqiService } from '../services/aqiService'
import { predictionService } from '../services/predictionService'
import { useEffect, useRef } from 'react'

// Debounce function to prevent rapid successive calls
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// AQI Hooks with debounced refetching
export const useAQI = (city, options = {}) => {
  const refetchCount = useRef(0)
  
  return useQuery(
    ['aqi', city?.value],
    () => aqiService.getCurrentAQI(city.value),
    {
      staleTime: 45000, // Consider data stale after 45 seconds (increased from 30)
      cacheTime: 300000,
      refetchInterval: 60000, // Refetch every 60 seconds
      refetchIntervalInBackground: false, // Don't refetch in background to save requests
      refetchOnWindowFocus: false, // Disable refetch on window focus to reduce requests
      refetchOnMount: true,
      refetchOnReconnect: false,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      enabled: !!city?.value,
      keepPreviousData: true,
      onError: (error) => {
        console.warn(`AQI fetch error for ${city?.value}:`, error.message)
        refetchCount.current++
      },
      ...options
    }
  )
}

export const useAQIHistory = (city, hours = 24) => {
  return useQuery(
    ['aqi-history', city?.value, hours],
    () => aqiService.getAQIHistory(city.value, hours),
    {
      staleTime: 300000,
      cacheTime: 600000,
      refetchInterval: 300000,
      refetchOnWindowFocus: false,
      enabled: !!city?.value,
      keepPreviousData: true,
      select: (response) => {
        let historyData = [];
        if (response && response.data && Array.isArray(response.data)) {
          historyData = response.data;
        } else if (response && response.history && Array.isArray(response.history)) {
          historyData = response.history;
        } else if (Array.isArray(response)) {
          historyData = response;
        }
        
        if (!historyData.length) return null;
        
        return {
          labels: historyData.map(record => {
            const date = new Date(record.timestamp);
            return date.toLocaleTimeString();
          }),
          datasets: [
            {
              label: 'AQI',
              data: historyData.map(record => record.aqi),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              tension: 0.4
            }
          ]
        }
      }
    }
  )
}

// Prediction Hooks with reduced frequency
export const usePredictions = (city) => {
  return useQuery(
    ['predictions', city?.value],
    () => predictionService.getPredictions(city.value),
    {
      staleTime: 60000, // Consider stale after 60 seconds
      cacheTime: 300000,
      refetchInterval: 90000, // Refetch every 90 seconds (reduced frequency)
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      enabled: !!city?.value,
      keepPreviousData: true,
      retry: 1,
      onError: (error) => {
        console.warn(`Prediction fetch error for ${city?.value}:`, error.message)
      },
      select: (response) => {
        if (response && response.current_aqi !== undefined) {
          return response;
        }
        if (response && response.data && response.data.current_aqi !== undefined) {
          return response.data;
        }
        return response;
      }
    }
  )
}

export const useAlerts = (city) => {
  return useQuery(
    ['alerts', city?.value],
    () => predictionService.getAlerts(city.value),
    {
      staleTime: 60000,
      cacheTime: 300000,
      refetchInterval: 120000, // Refetch every 2 minutes
      refetchOnWindowFocus: false,
      enabled: !!city?.value,
      keepPreviousData: true,
      select: (response) => {
        if (Array.isArray(response)) {
          return response;
        }
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (response && response.alerts && Array.isArray(response.alerts)) {
          return response.alerts;
        }
        return [];
      }
    }
  )
}

export const useBestTravelTime = (city) => {
  return useQuery(
    ['best-time', city?.value],
    () => predictionService.getBestTravelTime(city.value),
    {
      staleTime: 300000,
      cacheTime: 600000,
      refetchInterval: 300000,
      refetchOnWindowFocus: false,
      enabled: !!city?.value,
      keepPreviousData: true,
      select: (response) => {
        if (response && response.recommendations) {
          return response;
        }
        if (response && response.data) {
          return response.data;
        }
        return response;
      }
    }
  )
}

// Manual refresh with debouncing
export const useRefreshData = () => {
  const queryClient = useQueryClient()
  const isRefreshing = useRef(false)
  
  const refreshAll = debounce(async () => {
    if (isRefreshing.current) return
    isRefreshing.current = true
    try {
      await queryClient.invalidateQueries()
      await queryClient.refetchQueries()
    } finally {
      setTimeout(() => {
        isRefreshing.current = false
      }, 2000)
    }
  }, 1000)
  
  const refreshPredictions = debounce(async () => {
    await queryClient.invalidateQueries(['predictions'])
    await queryClient.refetchQueries(['predictions'])
  }, 500)
  
  const refreshAQI = debounce(async () => {
    await queryClient.invalidateQueries(['aqi'])
    await queryClient.refetchQueries(['aqi'])
  }, 500)
  
  return { refreshAll, refreshPredictions, refreshAQI }
}

export const useRealtimeAQI = (city) => {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    if (!city?.value) return
    
    // Longer interval for background updates
    const interval = setInterval(async () => {
      // Only refresh if the tab is visible
      if (!document.hidden) {
        await queryClient.invalidateQueries(['aqi', city.value])
        await queryClient.invalidateQueries(['predictions', city.value])
      }
    }, 90000) // 90 seconds
    
    return () => clearInterval(interval)
  }, [city, queryClient])
  
  return {
    aqi: useAQI(city),
    predictions: usePredictions(city)
  }
}
