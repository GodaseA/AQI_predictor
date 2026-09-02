import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// ✅ Request interceptor (only timing / metadata)
apiClient.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() }
    return config
  },
  (error) => Promise.reject(error)
)

// ✅ Response interceptor (returns ONLY data)
apiClient.interceptors.response.use(
  (response) => {
    // Log request duration in development
    if (import.meta.env.DEV && response.config.metadata?.startTime) {
      const duration =
        new Date() - response.config.metadata.startTime
      console.log(`${response.config.url} - ${duration}ms`)
    }

    // IMPORTANT: return data directly
    return response.data
  },
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      error.message ||
      'An error occurred'

    console.error('API Error:', message)
    return Promise.reject(new Error(message))
  }
)

export default apiClient