// src/hooks/useTraffic.js
import { useQuery } from 'react-query'
import { trafficService } from '../services/trafficService'

export const useTrafficData = (city) => {
  return useQuery(
    ['traffic', city?.value],
    () => trafficService.getTrafficData(city.value),
    {
      staleTime: 120000,
      refetchInterval: 120000,
      enabled: !!city?.value,
    }
  )
}

export const useTrafficHeatmap = (city) => {
  return useQuery(
    ['traffic-heatmap', city?.value],
    () => trafficService.getTrafficHeatmap(city.value),
    {
      staleTime: 120000,
      refetchInterval: 120000,
      enabled: !!city?.value,
      // Select to ensure we always have points array
      select: (data) => {
        if (!data || !data.points) {
          return { points: [], center: { lat: 18.5204, lng: 73.8567 } }
        }
        return data
      }
    }
  )
}

export const useTrafficHotspots = (city, limit = 10) => {
  return useQuery(
    ['traffic-hotspots', city?.value, limit],
    () => trafficService.getTrafficHotspots(city.value, limit),
    {
      staleTime: 120000,
      enabled: !!city?.value,
    }
  )
}
