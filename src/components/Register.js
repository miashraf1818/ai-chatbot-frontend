import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import './Auth.css';

function Register({ onSwitchToLogin, onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Frontend validation for password match
    if (formData.password !== formData.password2) {
      setErrors({ password2: ["Passwords don't match!"] });
      return;
    }

    setLoading(true);
    const result = await register(formData);

    if (result.success) {
      onSuccess();
    } else {
      // Handle different error formats
      if (typeof result.error === 'object' && result.error !== null) {
        // Backend validation errors (field-specific)
        setErrors(result.error);
      } else if (typeof result.error === 'string') {
        // General error message
        setErrors({ general: [result.error] });
      } else {
        setErrors({ general: ['Registration failed. Please try again.'] });
      }
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrors({});
    setLoading(true);
    
    const result = await googleLogin(credentialResponse.credential);
    
    if (result.success) {
      onSuccess();
    } else {
      setErrors({ general: [result.error || 'Google signup failed'] });
    }
    setLoading(false);
  };

  // Helper function to get error message
  const getErrorMessage = (fieldError) => {
    if (Array.isArray(fieldError)) {
      return fieldError[0];
    }
    return fieldError;
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>🚀 Create Account</h2>
        <p className="auth-subtitle">Join our AI community!</p>

        {/* General error message */}
        {errors.general && (
          <div className="error-message">
            {getErrorMessage(errors.general)}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className={errors.first_name ? 'input-error' : ''}
              />
              {errors.first_name && (
                <span className="field-error">{getErrorMessage(errors.first_name)}</span>
              )}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className={errors.last_name ? 'input-error' : ''}
              />
              {errors.last_name && (
                <span className="field-error">{getErrorMessage(errors.last_name)}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className={errors.username ? 'input-error' : ''}
            />
            {errors.username && (
              <span className="field-error">{getErrorMessage(errors.username)}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && (
              <span className="field-error">{getErrorMessage(errors.email)}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && (
              <span className="field-error">{getErrorMessage(errors.password)}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password2"
              placeholder="Confirm Password"
              value={formData.password2}
              onChange={handleChange}
              required
              className={errors.password2 ? 'input-error' : ''}
            />
            {errors.password2 && (
              <span className="field-error">{getErrorMessage(errors.password2)}</span>
            )}
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{margin: '20px 0', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '14px'}}>
          OR
        </div>

        <div style={{display: 'flex', justifyContent: 'center'}}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErrors({ general: ['Google signup failed'] })}
            theme="filled_black"
            size="large"
            width="300%"
          />
        </div>

        <p className="auth-switch">
          Already have an account?{' '}
          <span onClick={onSwitchToLogin}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
