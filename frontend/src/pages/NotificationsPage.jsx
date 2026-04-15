// src/pages/NotificationsPage.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  FiBell, FiCheck, FiCheckCircle, FiTrash2, 
  FiFilter, FiArchive, FiSettings, FiX 
} from 'react-icons/fi'
import { useNotifications } from '../context/NotificationContext'

const NotificationsPage = () => {
  const { 
    notifications, 
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications()
  
  const [filter, setFilter] = useState('all')
  const [selectedNotifications, setSelectedNotifications] = useState([])

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read
    if (filter === 'read') return notif.read
    return true
  })

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

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id))
    }
  }

  const handleDeleteSelected = () => {
    selectedNotifications.forEach(id => deleteNotification(id))
    setSelectedNotifications([])
  }

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium'
      default: return 'priority-low'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="notifications-page"
    >
      <div className="notifications-header">
        <div className="header-title">
          <FiBell size={28} />
          <h1>Notifications</h1>
          {unreadCount > 0 && <span className="unread-badge">{unreadCount} unread</span>}
        </div>
        
        <div className="header-actions">
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''} 
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={filter === 'unread' ? 'active' : ''} 
              onClick={() => setFilter('unread')}
            >
              Unread
            </button>
            <button 
              className={filter === 'read' ? 'active' : ''} 
              onClick={() => setFilter('read')}
            >
              Read
            </button>
          </div>
          
          {selectedNotifications.length > 0 && (
            <button onClick={handleDeleteSelected} className="delete-selected-btn">
              <FiTrash2 /> Delete Selected ({selectedNotifications.length})
            </button>
          )}
          
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="mark-all-btn">
              <FiCheckCircle /> Mark All as Read
            </button>
          )}
        </div>
      </div>

      <div className="notifications-stats">
        <div className="stat-card">
          <div className="stat-value">{notifications.length}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{unreadCount}</div>
          <div className="stat-label">Unread</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{notifications.filter(n => n.read).length}</div>
          <div className="stat-label">Read</div>
        </div>
      </div>

      <div className="notifications-list-container">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <FiBell size={60} />
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <>
            <div className="list-header">
              <label className="select-all">
                <input 
                  type="checkbox" 
                  checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={handleSelectAll}
                />
                Select All
              </label>
            </div>
            
            <div className="notifications-list">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item-page ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-select">
                    <input 
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => {
                        if (selectedNotifications.includes(notification.id)) {
                          setSelectedNotifications(prev => prev.filter(id => id !== notification.id))
                        } else {
                          setSelectedNotifications(prev => [...prev, notification.id])
                        }
                      }}
                    />
                  </div>
                  
                  <div className="notification-icon">
                    <span>{notification.icon}</span>
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-title">
                      <span>{notification.title}</span>
                      {!notification.read && <span className="unread-dot"></span>}
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    <div className="notification-meta">
                      <span className="notification-time">
                        {formatTime(notification.timestamp)}
                      </span>
                      <span className={`priority-badge ${getPriorityClass(notification.priority)}`}>
                        {notification.priority} priority
                      </span>
                    </div>
                  </div>
                  
                  <div className="notification-actions">
                    {!notification.read && (
                      <button onClick={() => markAsRead(notification.id)} className="action-btn" title="Mark as read">
                        <FiCheck />
                      </button>
                    )}
                    <button onClick={() => deleteNotification(notification.id)} className="action-btn delete" title="Delete">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

export default NotificationsPage
