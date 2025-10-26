import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StatsHeader.css';

const API_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/analytics`
  : 'https://ai-chatbot-api-9kb0.onrender.com/api/analytics';

function StatsHeader() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true); // Toggle state

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/dashboard/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.stats);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  if (loading || !stats) return null;

  const getChangeColor = (change) => {
    if (change > 0) return '#4ade80';
    if (change < 0) return '#f87171';
    return '#94a3b8';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  };

  return (
    <div className="stats-wrapper">
      {/* Toggle Button - Shows only on mobile */}
      <button 
        className="stats-toggle-btn"
        onClick={() => setIsVisible(!isVisible)}
        aria-label={isVisible ? 'Hide Stats' : 'Show Stats'}
      >
        📊 {isVisible ? 'Hide' : 'Show'} Stats
      </button>

      {/* Stats Header - Conditional visibility */}
      <div className={`stats-header ${!isVisible ? 'hidden' : ''}`}>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <div className="stat-value">{stats.today.messages}</div>
            <div className="stat-label">Messages Today</div>
            <div 
              className="stat-change" 
              style={{ color: getChangeColor(stats.today.message_change) }}
            >
              {getChangeIcon(stats.today.message_change)} {Math.abs(stats.today.message_change)}%
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.today.active_users}</div>
            <div className="stat-label">Active Users</div>
            <div className="stat-subtext">{stats.overall.total_users} total</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.overall.total_messages}</div>
            <div className="stat-label">Total Messages</div>
            <div className="stat-subtext">
              Avg {stats.overall.avg_conversation_length} per chat
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💭</div>
          <div className="stat-content">
            <div className="stat-value">{stats.overall.total_conversations}</div>
            <div className="stat-label">Conversations</div>
            <div 
              className="stat-change" 
              style={{ color: getChangeColor(stats.today.conversation_change) }}
            >
              {getChangeIcon(stats.today.conversation_change)} {Math.abs(stats.today.conversation_change)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsHeader;
