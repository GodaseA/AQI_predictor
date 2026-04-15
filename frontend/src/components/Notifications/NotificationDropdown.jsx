// src/components/Notifications/NotificationDropdown.jsx
import React, { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBell, FiCheck, FiCheckCircle, FiTrash2 } from 'react-icons/fi'
import { useNotifications } from '../../context/NotificationContext'

const NotificationDropdown = () => {
  const { 
    notifications, 
    unreadCount, 
    showDropdown, 
    setShowDropdown,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications()
  
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setShowDropdown])

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      default: return '🟢'
    }
  }

  const recentNotifications = notifications.slice(0, 10)

  return (
    <>
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            className="notification-dropdown"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="notification-header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="mark-all-btn">
                  <FiCheckCircle /> Mark all as read
                </button>
              )}
            </div>

            <div className="notification-list">
              {recentNotifications.length === 0 ? (
                <div className="no-notifications">
                  <FiBell size={40} />
                  <p>No notifications yet</p>
                </div>
              ) : (
                recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  >
                    <div className="notification-icon">
                      <span>{notification.icon}</span>
                    </div>
                    <div className="notification-content">
                      <Link 
                        to={notification.actionUrl} 
                        onClick={() => {
                          if (!notification.read) markAsRead(notification.id)
                          setShowDropdown(false)
                        }}
                      >
                        <div className="notification-title">
                          {getPriorityIcon(notification.priority)}
                          <span>{notification.title}</span>
                        </div>
                        <p className="notification-message">{notification.message}</p>
                        <span className="notification-time">
                          {formatTime(notification.timestamp)}
                        </span>
                      </Link>
                    </div>
                    <div className="notification-actions">
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="mark-read-btn"
                          title="Mark as read"
                        >
                          <FiCheck />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id)}
                        className="delete-btn"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="notification-footer">
              <Link to="/notifications" onClick={() => setShowDropdown(false)}>
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default NotificationDropdown
