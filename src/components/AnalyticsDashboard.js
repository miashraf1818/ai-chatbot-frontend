import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './AnalyticsDashboard.css';

const API_URL = 'http://localhost:8000/api/analytics';
const COLORS = ['#8a49ff', '#ff4db8', '#4dffb8', '#ffb84d', '#ff4d77'];

function AnalyticsDashboard() {
  const [weeklyData, setWeeklyData] = useState([]);
  const [intentsData, setIntentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      // Fetch weekly chart data
      const weeklyResponse = await axios.get(`${API_URL}/weekly-chart/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Fetch intents data
      const intentsResponse = await axios.get(`${API_URL}/intents/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (weeklyResponse.data.success) {
        setWeeklyData(weeklyResponse.data.chart_data);
      }

      if (intentsResponse.data.success) {
        const formattedIntents = intentsResponse.data.intents.map(item => ({
          name: item.intent || 'unknown',
          value: item.count,
          confidence: item.avg_confidence ? (item.avg_confidence * 100).toFixed(0) : 0
        }));
        setIntentsData(formattedIntents);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner">📊 Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <button 
        className="toggle-charts-btn"
        onClick={() => setShowCharts(!showCharts)}
      >
        {showCharts ? '📊 Hide Charts' : '📈 Show Analytics Charts'}
      </button>

      {showCharts && (
        <div className="charts-container">
          {/* Weekly Messages Chart */}
          <div className="chart-card">
            <h3 className="chart-title">📈 Messages Over Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="day" 
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(20, 20, 40, 0.95)',
                    border: '1px solid rgba(138, 73, 255, 0.3)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    color: 'white',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="messages" 
                  stroke="#8a49ff" 
                  strokeWidth={3}
                  dot={{ fill: '#8a49ff', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="conversations" 
                  stroke="#ff4db8" 
                  strokeWidth={2}
                  dot={{ fill: '#ff4db8', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Activity Bar Chart */}
          <div className="chart-card">
            <h3 className="chart-title">📊 Daily Activity Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="day" 
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(20, 20, 40, 0.95)',
                    border: '1px solid rgba(138, 73, 255, 0.3)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    color: 'white',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="messages" fill="#4dffb8" radius={[8, 8, 0, 0]} />
                <Bar dataKey="conversations" fill="#ffb84d" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Intent Distribution Pie Chart */}
          {intentsData.length > 0 && (
            <div className="chart-card">
              <h3 className="chart-title">🎯 Intent Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={intentsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {intentsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(20, 20, 40, 0.95)',
                      border: '1px solid rgba(138, 73, 255, 0.3)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="intent-legend">
                {intentsData.map((item, index) => (
                  <div key={index} className="intent-item">
                    <span 
                      className="intent-color" 
                      style={{ background: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="intent-name">{item.name}</span>
                    <span className="intent-count">{item.value} uses</span>
                    <span className="intent-confidence">{item.confidence}% confidence</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AnalyticsDashboard;
