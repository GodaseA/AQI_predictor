import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Track pending requests to avoid duplicates
const pendingRequests = new Map()

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Create a request key
    const requestKey = `${config.method}:${config.url}`
    
    // Check if same request is already pending
    if (pendingRequests.has(requestKey)) {
      console.log(`Cancelling duplicate request: ${requestKey}`)
      return Promise.reject({ __isCancel: true, message: 'Duplicate request cancelled' })
    }
    
    // Store the request
    pendingRequests.set(requestKey, true)
    
    config.metadata = { startTime: new Date() }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Remove from pending requests
    const requestKey = `${response.config.method}:${response.config.url}`
    pendingRequests.delete(requestKey)
    
    // Log request duration in development
    if (import.meta.env.DEV) {
      const duration = new Date() - response.config.metadata.startTime
      console.log(`${response.config.url} - ${duration}ms`)
    }
    return response.data
  },
  (error) => {
    // Remove from pending requests
    if (error.config) {
      const requestKey = `${error.config.method}:${error.config.url}`
      pendingRequests.delete(requestKey)
    }
    
    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      console.warn('Rate limit hit, waiting before retry...')
      // Return cached data if available or wait
      return Promise.reject(new Error('Too many requests. Please wait a moment.'))
    }
    
    // Handle cancellation
    if (error.__isCancel) {
      return Promise.reject(error)
    }
    
    const message = error.response?.data?.detail || error.response?.data?.error || error.message || 'An error occurred'
    console.error('API Error:', message)
    return Promise.reject(new Error(message))
  }
)

// Helper to clear pending requests (useful for logout/navigation)
export const clearPendingRequests = () => {
  pendingRequests.clear()
}

export default apiClient
