import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="logo">SEMS</div>
        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <Link to="/login" className="nav-btn">Login</Link>
          <Link to="/register" className="nav-btn primary">Get Started</Link>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <span className="hero-badge">Enterprise Management Platform</span>
            <h1 className="hero-title">Transform Your Business Operations with SEMS</h1>
            <p className="hero-subtitle">
              Streamline branches, workforce, inventory, and billing from one powerful platform. Smart Enterprise Management System for growing businesses.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">Get Started Free</Link>
              <Link to="/login" className="btn btn-secondary">Login to Dashboard</Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="preview-title">SEMS Dashboard</div>
              </div>
              <div className="preview-content">
                <div className="preview-sidebar"></div>
                <div className="preview-main">
                  <div className="preview-cards">
                    <div className="preview-card"></div>
                    <div className="preview-card"></div>
                    <div className="preview-card"></div>
                  </div>
                  <div className="preview-table"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features for Every Business Need</h2>
            <p className="section-subtitle">Everything you need to manage operations efficiently</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏢</div>
              <h3>Multi-Branch Management</h3>
              <p>Coordinate multiple locations with consistent controls, visibility and accountability across all branches.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Workforce Management</h3>
              <p>Manage attendance, shift planning and task ownership with automated tracking and reduced manual effort.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Inventory Control</h3>
              <p>Monitor stock movement, maintain supply continuity and respond to shortages with real-time alerts.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Billing & Sales</h3>
              <p>Create bills, review sales performance and maintain clean operational records with detailed reporting.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Insights</h3>
              <p>Review forecasts and pattern-based signals that support faster planning and data-driven decisions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Smart Notifications</h3>
              <p>Stay informed about exceptions, deadlines and branch-level operational changes in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Businesses Managed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50K+</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Uptime Guaranteed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Support Available</div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Transform Your Business?</h2>
          <p className="cta-subtitle">Join thousands of businesses already using SEMS to streamline their operations</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">Start Free Trial</Link>
            <Link to="/login" className="btn btn-secondary btn-lg">Schedule Demo</Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">SEMS</div>
            <p>Smart Enterprise Management System</p>
          </div>
          <div className="footer-links">
            <div className="footer-section">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#about">About</a>
              <Link to="/login">Login</Link>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 SEMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
