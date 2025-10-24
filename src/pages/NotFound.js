import React from 'react';
import './NotFound.css';

function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1 className="error-title">Page Not Found</h1>
        <p className="error-description">
          Oops! The page you're looking for doesn't exist.
        </p>
        <button 
          onClick={() => window.location.href = '/'} 
          className="btn btn-primary"
        >
          Go Home 🏠
        </button>
      </div>
    </div>
  );
}

export default NotFound;
