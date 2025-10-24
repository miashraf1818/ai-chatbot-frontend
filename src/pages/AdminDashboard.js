import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const API_URL = 'http://localhost:8000/api/chatbot';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard'); // dashboard, users, user-detail

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('access_token');  // ✅ FIXED
      const response = await axios.get(`${API_URL}/api/admin/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');  // ✅ FIXED
      const response = await axios.get(`${API_URL}/api/admin/users/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch user details
  const fetchUserDetail = async (userId) => {
    try {
      const token = localStorage.getItem('access_token');  // ✅ FIXED
      const response = await axios.get(`${API_URL}/api/admin/users/${userId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedUser(response.data);
      setView('user-detail');
    } catch (error) {
      console.error('Error fetching user detail:', error);
    }
  };

  // Ban/Unban user
  const toggleUserStatus = async (userId) => {
    try {
      const token = localStorage.getItem('access_token');  // ✅ FIXED
      await axios.post(`${API_URL}/api/admin/users/${userId}/toggle/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      alert('User status updated!');
    } catch (error) {
      console.error('Error toggling user:', error);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('access_token');  // ✅ FIXED
      await axios.delete(`${API_URL}/api/admin/users/${userId}/delete/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      setView('users');
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchUsers();
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="admin-loading">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <h1>🔧 Admin Dashboard</h1>
        <div className="admin-nav">
          <button 
            className={view === 'dashboard' ? 'active' : ''}
            onClick={() => setView('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={view === 'users' ? 'active' : ''}
            onClick={() => setView('users')}
          >
            👥 Users
          </button>
        </div>
      </div>

      {/* Dashboard View */}
      {view === 'dashboard' && stats && (
        <div className="dashboard-view">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-value">{stats.users.total}</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-content">
                <div className="stat-value">{stats.messages.total}</div>
                <div className="stat-label">Total Messages</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💭</div>
              <div className="stat-content">
                <div className="stat-value">{stats.conversations.total}</div>
                <div className="stat-label">Conversations</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users List View */}
      {view === 'users' && (
        <div className="users-view">
          <div className="users-header">
            <h2>All Users ({users.length})</h2>
          </div>
          
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <button 
                        className="username-link"
                        onClick={() => fetchUserDetail(user.id)}
                      >
                        {user.username}
                      </button>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                        {user.is_active ? '✓ Active' : '✗ Banned'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="action-btn ban-btn"
                        onClick={() => toggleUserStatus(user.id)}
                      >
                        {user.is_active ? '🚫 Ban' : '✓ Unban'}
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => deleteUser(user.id)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Detail View */}
      {view === 'user-detail' && selectedUser && (
        <div className="user-detail-view">
          <button className="back-btn" onClick={() => setView('users')}>
            ← Back to Users
          </button>
          
          <div className="user-detail-header">
            <h2>User Details: {selectedUser.user.username}</h2>
          </div>
          
          <div className="user-info-grid">
            <div className="info-card">
              <h3>👤 Profile</h3>
              <p><strong>ID:</strong> {selectedUser.user.id}</p>
              <p><strong>Username:</strong> {selectedUser.user.username}</p>
              <p><strong>Email:</strong> {selectedUser.user.email}</p>
              <p><strong>Status:</strong> {selectedUser.user.is_active ? '✓ Active' : '✗ Banned'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
