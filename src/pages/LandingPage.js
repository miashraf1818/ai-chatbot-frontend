import React from 'react';
import './LandingPage.css'; // Re-added the CSS import
import ScrollToTop from '../components/ScrollToTop';


function LandingPage(props) {
  // Define icons or use SVGs/components if preferred
  const features = [
    { icon: '🤖', title: 'AI-Powered Responses', description: 'Intelligent, context-aware answers from Google Gemini.' },
    { icon: '💾', title: 'Save Conversations', description: 'Access your chat history anytime, anywhere.' },
    { icon: '📊', title: 'Analytics Dashboard', description: 'Track usage and gain insights (Admin feature).' },
    { icon: '🔒', title: 'Secure & Private', description: 'Encrypted data with JWT authentication.' },
    { icon: '⚡', title: 'Lightning Fast', description: 'Instant responses with optimized performance.' },
    { icon: '📱', title: 'Fully Responsive', description: 'Seamless experience on all devices.' },
  ];

  return (
    <div className="landing-page">
      {/* Subtle Animated Background Elements */}
      <div className="landing-bg-shape shape1"></div>
      <div className="landing-bg-shape shape2"></div>
      <div className="landing-bg-shape shape3"></div>

      {/* Hero Section */}
      <section className="landing-hero landing-section">
        <div className="container hero-content">
          <div className="hero-badge">✨ Powered by Google Gemini AI</div>

          <h1 className="hero-title">
            Welcome to Your <br /> <span className="gradient-text">Intelligent Chat Assistant</span>
          </h1>

          <p className="hero-subtitle">
            Engage in smart conversations, get instant answers, creative solutions,
            and personalized assistance with our advanced AI chatbot.
          </p>

          <div className="hero-buttons">
            <button
              className="btn btn-primary btn-hero"
              onClick={props.onGetStarted}
              aria-label="Get started for free"
            >
              Get Started Free
              <span className="btn-icon">→</span>
            </button>
            <button
              className="btn btn-secondary btn-hero"
              onClick={props.onSignIn}
              aria-label="Sign in to your account"
            >
              Sign In
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">1k+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-separator"></div>
            <div className="stat-item">
              <div className="stat-value">50k+</div>
              <div className="stat-label">Conversations</div>
            </div>
            <div className="stat-separator"></div>
            <div className="stat-item">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features landing-section">
        <div className="container">
          <h2 className="section-title">Why Choose Our AI Chatbot?</h2>
          <p className="section-subtitle">Discover the powerful features designed for you.</p>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div className="feature-card" key={index}>
                <div className="feature-icon-wrapper">
                   <span className="feature-icon" role="img" aria-label={`${feature.title} icon`}>{feature.icon}</span>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta landing-section">
        <div className="container cta-content">
           <span className="cta-icon" role="img" aria-label="Rocket icon">🚀</span>
          <h2 className="cta-title">Ready to Elevate Your Conversations?</h2>
          <p className="cta-subtitle">Join thousands of users experiencing the future of AI chat today.</p>
          <button
            className="btn btn-primary btn-cta"
            onClick={props.onGetStarted}
            aria-label="Create your free account now"
          >
            Create Your Free Account
             <span className="btn-icon">→</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container footer-content">
          <p className="footer-credit">
            Developed with ❤️ by <strong>Mohammed Ikram Ashrafi</strong>
          </p>
          <p className="footer-copyright">
            © {new Date().getFullYear()} AI Chatbot. All rights reserved.
          </p>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  );
}

export default LandingPage;