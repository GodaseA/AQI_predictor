// src/services/notificationService.js
import apiClient from './api'

export const notificationService = {
  // Get all notifications
  getNotifications: async () => {
    try {
      // For now, return mock data
      // In production, this would fetch from backend
      return {
        success: true,
        data: {
          notifications: getMockNotifications(),
          unreadCount: 3
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      return {
        success: false,
        data: { notifications: [], unreadCount: 0 }
      }
    }
  },
  
  // Mark notification as read
  markAsRead: async (notificationId) => {
    // Mock API call
    return { success: true }
  },
  
  // Mark all as read
  markAllAsRead: async () => {
    // Mock API call
    return { success: true }
  },
  
  // Delete notification
  deleteNotification: async (notificationId) => {
    // Mock API call
    return { success: true }
  }
}

// Mock notifications data
function getMockNotifications() {
  return [
    {
      id: '1',
      type: 'alert',
      title: 'High Pollution Alert',
      message: 'AQI in your area has reached 168. Consider staying indoors.',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      read: false,
      priority: 'high',
      icon: '⚠️',
      actionUrl: '/'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Rising Pollution Warning',
      message: 'AQI expected to rise to 145 in next 2 hours.',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      read: false,
      priority: 'medium',
      icon: '📈',
      actionUrl: '/analytics'
    },
    {
      id: '3',
      type: 'info',
      title: 'Best Time to Travel',
      message: 'Optimal travel time today is between 6:00 AM - 8:00 AM.',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      read: true,
      priority: 'low',
      icon: '🚗',
      actionUrl: '/routes'
    },
    {
      id: '4',
      type: 'success',
      title: 'Air Quality Improving',
      message: 'AQI has dropped from 145 to 95. Good time for outdoor activities.',
      timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
      read: true,
      priority: 'low',
      icon: '🌿',
      actionUrl: '/'
    },
    {
      id: '5',
      type: 'route',
      title: 'Route Optimization Available',
      message: 'A cleaner route to your destination is available with 25% less pollution.',
      timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
      read: false,
      priority: 'medium',
      icon: '🗺️',
      actionUrl: '/routes'
    }
  ]
}
