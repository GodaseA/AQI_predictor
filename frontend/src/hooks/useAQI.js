import { useQuery, useQueryClient } from 'react-query'
import { aqiService } from '../services/aqiService'
import { predictionService } from '../services/predictionService'
import { useEffect } from 'react'

// AQI Hooks
export const useAQI = (city, options = {}) => {
  return useQuery(
    ['aqi', city?.value],
    () => aqiService.getCurrentAQI(city.value),
    {
      staleTime: 30000,
      cacheTime: 300000,
      refetchInterval: 60000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 2,
      enabled: !!city?.value,
      keepPreviousData: true,
      select: (data) => {
        console.log('AQI select - raw data:', data)
        return data
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
      enabled: !!city?.value,
      keepPreviousData: true,
      select: (response) => {
        let historyData = []
        if (response && response.data && Array.isArray(response.data)) {
          historyData = response.data
        } else if (response && response.history && Array.isArray(response.history)) {
          historyData = response.history
        } else if (Array.isArray(response)) {
          historyData = response
        }
        
        if (!historyData.length) return null
        
        return {
          labels: historyData.map(record => {
            const date = new Date(record.timestamp)
            return date.toLocaleTimeString()
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

// Prediction Hooks
export const usePredictions = (city) => {
  return useQuery(
    ['predictions', city?.value],
    () => predictionService.getPredictions(city.value),
    {
      staleTime: 60000,
      cacheTime: 300000,
      refetchInterval: 90000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      enabled: !!city?.value,
      keepPreviousData: true,
      select: (response) => {
        console.log('Predictions select - raw response:', response)
        // Ensure we return the data in the correct format
        if (response && response.current_aqi !== undefined) {
          return response
        }
        if (response && response.data && response.data.current_aqi !== undefined) {
          return response.data
        }
        // If response is just the message from WebSocket, ignore it
        if (response && response.message) {
          console.log('WebSocket message received, ignoring for predictions')
          return null
        }
        return response
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
      refetchInterval: 120000,
      enabled: !!city?.value,
      keepPreviousData: true,
      select: (response) => {
        if (Array.isArray(response)) {
          return response
        }
        if (response && response.data && Array.isArray(response.data)) {
          return response.data
        }
        if (response && response.alerts && Array.isArray(response.alerts)) {
          return response.alerts
        }
        return []
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
      enabled: !!city?.value,
      keepPreviousData: true,
      select: (response) => {
        if (response && response.recommendations) {
          return response
        }
        if (response && response.data) {
          return response.data
        }
        return response
      }
    }
  )
}

// Manual refresh hook
export const useRefreshData = () => {
  const queryClient = useQueryClient()
  
  const refreshAll = async () => {
    await queryClient.invalidateQueries()
    await queryClient.refetchQueries()
  }
  
  const refreshPredictions = async () => {
    await queryClient.invalidateQueries(['predictions'])
    await queryClient.refetchQueries(['predictions'])
  }
  
  const refreshAQI = async () => {
    await queryClient.invalidateQueries(['aqi'])
    await queryClient.refetchQueries(['aqi'])
  }
  
  return { refreshAll, refreshPredictions, refreshAQI }
}
