import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import './Auth.css';

function Login({ onSwitchToRegister, onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.username, formData.password);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    
    const result = await googleLogin(credentialResponse.credential);
    
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Google login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2> Welcome Back!</h2>
        <p className="auth-subtitle">Login to continue chatting</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{margin: '20px 0', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '14px'}}>
          OR
        </div>

        <div style={{display: 'flex', justifyContent: 'center'}}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google login failed')}
            theme="filled_black"
            size="large"
            width="300%"
          />
        </div>

        <p className="auth-switch">
          Don't have an account?{' '}
          <span onClick={onSwitchToRegister}>Sign up</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
