import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PortalConfig } from '../types';
import '../styles/Portal.css';

const Portal: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [config, setConfig] = useState<PortalConfig>({
    theme: 'dark',
    vectorVisualization: true,
    realTimeUpdates: true,
    neuromorphicMode: true,
  });

  const handleConfigChange = (key: keyof PortalConfig, value: boolean | string) => {
    setConfig(prev => {
      // Only update the specific property, avoid recreating the entire object unnecessarily
      if (prev[key] === value) return prev;
      const updated = { ...prev };
      updated[key] = value;
      return updated;
    });
  };

  return (
    <div className="portal-container">
      <header className="portal-header">
        <div className="portal-logo">
          <svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 10,25 Q 25,5 40,25 T 70,25 Q 85,45 100,25"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="3"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1>Infinity Portal</h1>
        <div className="portal-user">
          <span className="user-info">
            Welcome, <strong>{user?.username}</strong>
          </span>
          <button onClick={logout} className="button-secondary">
            Logout
          </button>
        </div>
      </header>

      <main className="portal-main">
        <div className="portal-sidebar">
          <nav className="portal-nav">
            <a href="#dashboard" className="nav-item active">
              <span className="nav-icon">📊</span>
              Dashboard
            </a>
            <button 
              className="nav-item" 
              onClick={() => navigate('/vectoring')}
              style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
            >
              <span className="nav-icon">🔢</span>
              Vector Operations
            </button>
            <a href="#neuromorphic" className="nav-item">
              <span className="nav-icon">🧠</span>
              Neuromorphic
            </a>
            <a href="#analytics" className="nav-item">
              <span className="nav-icon">📈</span>
              Analytics
            </a>
            <a href="#settings" className="nav-item">
              <span className="nav-icon">⚙️</span>
              Settings
            </a>
          </nav>
        </div>

        <div className="portal-content">
          <section className="portal-section">
            <h2>System Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">⚡</div>
                <div className="stat-value">2,547</div>
                <div className="stat-label">Active Vectors</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔄</div>
                <div className="stat-value">12,389</div>
                <div className="stat-label">Operations/sec</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💾</div>
                <div className="stat-value">847 GB</div>
                <div className="stat-label">Vector Storage</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-value">99.7%</div>
                <div className="stat-label">Accuracy</div>
              </div>
            </div>
          </section>

          <section className="portal-section">
            <h2>Portal Configuration</h2>
            <div className="config-panel card">
              <div className="config-item">
                <label className="config-label">
                  <input
                    type="checkbox"
                    checked={config.vectorVisualization}
                    onChange={(e) => handleConfigChange('vectorVisualization', e.target.checked)}
                  />
                  <span>Vector Visualization</span>
                </label>
                <p className="config-description">
                  Enable real-time 3D visualization of vector operations
                </p>
              </div>

              <div className="config-item">
                <label className="config-label">
                  <input
                    type="checkbox"
                    checked={config.realTimeUpdates}
                    onChange={(e) => handleConfigChange('realTimeUpdates', e.target.checked)}
                  />
                  <span>Real-time Updates</span>
                </label>
                <p className="config-description">
                  Stream live updates from the vector processing pipeline
                </p>
              </div>

              <div className="config-item">
                <label className="config-label">
                  <input
                    type="checkbox"
                    checked={config.neuromorphicMode}
                    onChange={(e) => handleConfigChange('neuromorphicMode', e.target.checked)}
                  />
                  <span>Neuromorphic Mode</span>
                </label>
                <p className="config-description">
                  Activate neuromorphic computing acceleration
                </p>
              </div>

              <div className="config-item">
                <label className="config-label">
                  Theme
                </label>
                <select
                  className="form-input"
                  value={config.theme}
                  onChange={(e) => handleConfigChange('theme', e.target.value)}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Portal;
