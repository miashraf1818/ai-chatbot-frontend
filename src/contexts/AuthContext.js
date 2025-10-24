import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

//   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  const API_URL = process.env.REACT_APP_API_URL || 
(process.env.NODE_ENV === 'production' 
  ? 'https://ai-chatbot-api-9kb0.onrender.com/api' 
  : 'http://localhost:8000/api');
 

  // Configure axios defaults
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/profile/`);
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/users/register/`, userData);
      
      if (response.data.success) {
        const { user, tokens } = response.data;
        
        // Store tokens
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
        
        // Set user
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true };
      }
      
      return { 
        success: false, 
        error: 'Registration failed' 
      };
      
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      
      // Return properly formatted error
      if (error.response && error.response.data) {
        return {
          success: false,
          error: error.response.data.errors || error.response.data.error || 'Registration failed'
        };
      }
      
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  };

  const login = async (username, password) => {  // ✅ Changed parameters
    try {
      const response = await axios.post(`${API_URL}/users/login/`, {
        username,  // ✅ Send as object
        password
      });
      
      if (response.data.success) {
        const { user, tokens } = response.data;
        
        // Store tokens
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
        
        // Set user
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true };
      }
      
      return { 
        success: false, 
        error: response.data.message || 'Login failed' 
      };
      
    } catch (error) {
      console.error('Login error:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid credentials' 
      };
    }
  };
  

  const googleLogin = async (credential) => {
    try {
      const response = await axios.post(`${API_URL}/users/google-login/`, {
        credential: credential
      });
      
      if (response.data.success) {
        const { user, tokens } = response.data;
        
        // Store tokens
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
        
        // Set user
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true };
      }
      
      return { 
        success: false, 
        error: 'Google login failed' 
      };
      
    } catch (error) {
      console.error('Google login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Google login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    register,
    login,
    googleLogin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
