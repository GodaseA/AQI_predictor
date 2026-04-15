import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMenu, FiBell, FiUser, FiSun, FiMoon, FiLogOut, FiSettings } from 'react-icons/fi'
import { useTheme } from '../../context/ThemeContext'
import { useCity } from '../../context/CityContext'
import { useNotifications } from '../../context/NotificationContext'
import { useAuth } from '../../context/AuthContext'
import NotificationDropdown from '../Notifications/NotificationDropdown'

const Header = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme()
  const { currentCity } = useCity()
  const { unreadCount, showDropdown, setShowDropdown } = useNotifications()
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={onMenuClick}>
          <FiMenu />
        </button>
        <Link to="/" className="logo">
          <span className="logo-icon">🌬️</span>
          <span className="logo-text">AQI Optimizer</span>
        </Link>
      </div>

      <div className="header-center">
        <div className="city-indicator">
          <span className="city-name">{currentCity.name}</span>
          <span className="city-time">
            {new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>

      <div className="header-right">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </button>
        
        {isAuthenticated && (
          <>
            <div className="notifications-wrapper">
              <button 
                className="notifications-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <FiBell />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>
              <NotificationDropdown />
            </div>
            
            <div className="user-menu-wrapper">
              <button 
                className="user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar-small">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span>{user?.name?.split(' ')[0]}</span>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <Link to="/profile" onClick={() => setShowUserMenu(false)}>
                    <FiUser /> My Profile
                  </Link>
                  <Link to="/settings" onClick={() => setShowUserMenu(false)}>
                    <FiSettings /> Settings
                  </Link>
                  <button onClick={handleLogout}>
                    <FiLogOut /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        
        {!isAuthenticated && (
          <Link to="/login" className="login-btn">
            <FiUser /> Sign In
          </Link>
        )}
      </div>
    </header>
  )
}

export default Header
