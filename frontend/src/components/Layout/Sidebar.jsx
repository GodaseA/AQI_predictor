import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  FiHome, 
  FiBarChart2, 
  FiMap, 
  FiSettings,
  FiActivity,
  FiBell,
  FiHelpCircle
} from 'react-icons/fi'

const Sidebar = ({ isOpen, onToggle }) => {
  const menuItems = [
    { path: '/', icon: <FiHome />, label: 'Dashboard' },
    { path: '/analytics', icon: <FiBarChart2 />, label: 'Analytics' },
    { path: '/routes', icon: <FiMap />, label: 'Routes' },
    { path: '/settings', icon: <FiSettings />, label: 'Settings' },
  ]

  return (
    <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <FiActivity className="logo-icon" />
          {isOpen && <span className='logo-icon-text'>AQI Optimizer</span>}
        </div>
        <button className="toggle-btn" onClick={onToggle}>
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            {item.icon}
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/help" className="nav-link">
          <FiHelpCircle />
          {isOpen && <span>Help</span>}
        </NavLink>
      </div>
    </aside>
  )
}

export default Sidebar