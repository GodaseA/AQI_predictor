// src/pages/Profile.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUser, FiMail, FiLock, FiSave, FiLogOut, 
  FiBell, FiRefreshCw, FiSun, FiMoon, FiMapPin,
  FiEdit2, FiCheck, FiX
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cities } from '../context/CityContext';

const Profile = () => {
  const { user, updateProfile, changePassword, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleUpdateProfile = async () => {
    if (!editedName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    
    const result = await updateProfile({ name: editedName });
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    const result = await changePassword(currentPassword, newPassword);
    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordFields(false);
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="profile-page">
      <motion.div
        className="profile-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
          <div className="profile-info">
            {isEditing ? (
              <div className="edit-name-container">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="edit-name-input"
                  autoFocus
                />
                <button onClick={handleUpdateProfile} className="save-btn">
                  <FiCheck />
                </button>
                <button onClick={() => {
                  setIsEditing(false);
                  setEditedName(user?.name || '');
                }} className="cancel-btn">
                  <FiX />
                </button>
              </div>
            ) : (
              <div className="name-container">
                <h1>{user?.name}</h1>
                <button onClick={() => setIsEditing(true)} className="edit-btn">
                  <FiEdit2 />
                </button>
              </div>
            )}
            <div className="user-details">
              <p><FiMail /> {user?.email}</p>
              <p><FiUser /> Member since {formatDate(user?.createdAt)}</p>
              {user?.lastLogin && (
                <p><FiRefreshCw /> Last login: {formatDate(user?.lastLogin)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-value">{user?.preferences?.defaultCity || 'Pune'}</div>
            <div className="stat-label">Default City</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{user?.preferences?.notificationsEnabled ? 'On' : 'Off'}</div>
            <div className="stat-label">Notifications</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{user?.preferences?.autoRefresh ? 'Auto' : 'Manual'}</div>
            <div className="stat-label">Refresh Mode</div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="profile-sections">
          {/* Preferences Section */}
          <div className="settings-section">
            <h3>Preferences</h3>
            <div className="settings-grid">
              <div className="setting-item">
                <label>Default City</label>
                <select 
                  value={user?.preferences?.defaultCity || 'pune'}
                  onChange={async (e) => {
                    await updateProfile({
                      preferences: { ...user?.preferences, defaultCity: e.target.value }
                    });
                  }}
                >
                  {cities.map(city => (
                    <option key={city.value} value={city.value}>{city.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="setting-item">
                <label>
                  <FiBell /> Notifications
                </label>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={user?.preferences?.notificationsEnabled}
                    onChange={async (e) => {
                      await updateProfile({
                        preferences: { ...user?.preferences, notificationsEnabled: e.target.checked }
                      });
                    }}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <label>
                  <FiRefreshCw /> Auto Refresh
                </label>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={user?.preferences?.autoRefresh}
                    onChange={async (e) => {
                      await updateProfile({
                        preferences: { ...user?.preferences, autoRefresh: e.target.checked }
                      });
                    }}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="settings-section">
            <h3>Security</h3>
            {!showPasswordFields ? (
              <button 
                className="change-password-btn"
                onClick={() => setShowPasswordFields(true)}
              >
                <FiLock /> Change Password
              </button>
            ) : (
              <div className="password-change-form">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div className="password-actions">
                  <button onClick={handleChangePassword} className="save-password-btn">
                    Update Password
                  </button>
                  <button 
                    onClick={() => {
                      setShowPasswordFields(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }} 
                    className="cancel-password-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="settings-section danger-zone">
            <h3>Account</h3>
            <button onClick={handleLogout} className="logout-btn">
              <FiLogOut /> Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
