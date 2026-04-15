import React from 'react'
import { motion } from 'framer-motion'
import { FaExclamationCircle, FaExclamationTriangle, FaExclamation, FaInfoCircle } from 'react-icons/fa'

const getAlertIcon = (type) => {
  switch (type) {
    case 'critical': return <FaExclamationCircle />
    case 'danger': return <FaExclamationTriangle />
    case 'warning': return <FaExclamation />
    default: return <FaInfoCircle />
  }
}

const AlertCard = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card">
        <div className="skeleton-loader">
          <div className="skeleton-title"></div>
          <div className="skeleton-alert"></div>
        </div>
      </div>
    )
  }

  // Handle different data structures
  let alerts = [];
  if (data && Array.isArray(data)) {
    alerts = data;
  } else if (data && data.data && Array.isArray(data.data)) {
    alerts = data.data;
  } else if (data && data.alerts && Array.isArray(data.alerts)) {
    alerts = data.alerts;
  }

  if (alerts.length === 0) {
    return (
      <div className="card">
        <h3>Alerts</h3>
        <p className="no-alerts">No active alerts</p>
      </div>
    )
  }

  return (
    <motion.div 
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <h3>Alerts & Recommendations</h3>
      <div className="alerts-container">
        {alerts.map((alert, index) => (
          <div key={index} className={`alert alert-${alert.type || alert.alert_type}`}>
            <div className="alert-header">
              {getAlertIcon(alert.type || alert.alert_type)}
              <span className="alert-title">{alert.title}</span>
            </div>
            <p className="alert-message">{alert.message}</p>
            {alert.actions && alert.actions.length > 0 && (
              <ul className="alert-actions">
                {alert.actions.map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default AlertCard
