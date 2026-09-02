// src/hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback } from 'react'

export const useWebSocket = (room, options = {}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const socketRef = useRef(null)

  const connect = useCallback(() => {
    // Mock WebSocket - but don't send prediction data that overrides real API
    setIsConnected(true)
    
    // Only send heartbeats, not mock prediction data
    const interval = setInterval(() => {
      setLastMessage({
        type: 'heartbeat',
        message: 'Connection alive',
        timestamp: new Date()
      })
    }, 30000)
    
    socketRef.current = { interval, close: () => clearInterval(interval) }
    
    return () => {
      if (socketRef.current) {
        clearInterval(socketRef.current.interval)
      }
    }
  }, [room])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      if (socketRef.current.interval) {
        clearInterval(socketRef.current.interval)
      }
      socketRef.current = null
      setIsConnected(false)
    }
  }, [])

  const sendMessage = useCallback((event, data) => {
    if (isConnected) {
      console.log(`Sending ${event}:`, data)
    }
  }, [isConnected])

  useEffect(() => {
    const cleanup = connect()
    return () => {
      if (cleanup) cleanup()
      disconnect()
    }
  }, [connect, disconnect])

  return { isConnected, lastMessage, sendMessage, disconnect }
}
