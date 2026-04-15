import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useCity, cities } from '../context/CityContext'
import toast from 'react-hot-toast'

const Settings = () => {
  const { theme, toggleTheme } = useTheme()
  const { currentCity, changeCity } = useCity()
  const [notifications, setNotifications] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(60)

  const handleSaveSettings = () => {
    localStorage.setItem('notifications', notifications)
    localStorage.setItem('autoRefresh', autoRefresh)
    localStorage.setItem('refreshInterval', refreshInterval)
    toast.success('Settings saved successfully')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="settings-page"
    >
      <h1>Settings</h1>
      
      <div className="settings-container">
        <div className="settings-section">
          <h3>Appearance</h3>
          <div className="setting-item">
            <label>Theme</label>
            <button onClick={toggleTheme} className="theme-toggle-btn">
              {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3>Location</h3>
          <div className="setting-item">
            <label>Default City</label>
            <select 
              value={currentCity.value} 
              onChange={(e) => {
                const city = cities.find(c => c.value === e.target.value)
                if (city) changeCity(city)
              }}
            >
              {cities.map(city => (
                <option key={city.id} value={city.value}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3>Notifications</h3>
          <div className="setting-item">
            <label>Enable Notifications</label>
            <input 
              type="checkbox" 
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
          </div>
          <div className="setting-item">
            <label>Auto Refresh Data</label>
            <input 
              type="checkbox" 
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
          </div>
          {autoRefresh && (
            <div className="setting-item">
              <label>Refresh Interval (seconds)</label>
              <input 
                type="number" 
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                min="30"
                max="300"
              />
            </div>
          )}
        </div>

        <button onClick={handleSaveSettings} className="save-btn">
          Save Settings
        </button>
      </div>
    </motion.div>
  )
}

export default Settings