// src/hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback } from 'react'

export const useWebSocket = (room, options = {}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const socketRef = useRef(null)

  const connect = useCallback(() => {
    // For now, return mock WebSocket functionality
    // You can replace with actual WebSocket when backend is ready
    setIsConnected(true)
    
    // Mock receiving messages
    const interval = setInterval(() => {
      setLastMessage({
        type: 'prediction',
        data: { message: 'Mock update' },
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