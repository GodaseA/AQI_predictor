// src/hooks/useRoutes.js
import { useMutation, useQuery } from 'react-query'
import { routeService } from '../services/routeService'

export const useOptimizeRoute = () => {
  return useMutation(
    ({ waypoints, preference }) => 
      routeService.optimizeRoute(waypoints, preference),
    {
      onSuccess: (data) => {
        console.log('Route optimized successfully', data)
      },
      onError: (error) => {
        console.error('Route optimization failed:', error)
      }
    }
  )
}

export const useCompareRoutes = () => {
  return useMutation(
    ({ origin, destination }) => 
      routeService.compareRoutes(origin, destination)
  )
}

export const useRouteSuggestions = (city) => {
  return useQuery(
    ['route-suggestions', city?.value],
    () => routeService.getRouteSuggestions(city.value),
    {
      enabled: !!city?.value,
      staleTime: 300000,
    }
  )
}
