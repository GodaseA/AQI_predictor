// src/hooks/index.js
export { 
  useAQI, 
  useAQIHistory, 
  usePredictions, 
  useAlerts, 
  useBestTravelTime,
  useRealtimeAQI 
} from './useAQI'

export { 
  useOptimizeRoute, 
  useCompareRoutes, 
  useRouteSuggestions 
} from './useRoutes'

export { 
  useTrafficData, 
  useTrafficHeatmap, 
  useTrafficHotspots 
} from './useTraffic'

export { useWebSocket } from './useWebSocket'
export { useLocalStorage } from './useLocalStorage'