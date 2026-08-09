import React from 'react';
import { Link } from 'react-router-dom';
import '. /LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="logo">SEMS</div>
        <nav className="landing-nav">
          <Link to="/">Home</Link>
          <Link to="#features">Features</Link>
          <Link to="#about">About</Link>
          <Link to="#contact">Contact</Link>
          <Link to="/login" className="login-btn">Login</Link>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Smart Enterprise Management System</h1>
          <p className="hero-subtitle">
            Manage branches, workers, inventory, billing and business operations from one centralized platform.
          </p>
          
          <div className="industry-tags">
            <span className="tag">🏪 Retail</span>
            <span className="tag">🍽️ Food Service</span>
            <span className="tag">🧵 Textile</span>
            <span className="tag">🏭 Manufacturing</span>
            <span className="tag">📦 Logistics</span>
            <span className="tag">🏢 MSMEs</span>
          </div>

          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">Create New Account</Link>
            <Link to="/login" className="btn btn-secondary">Login</Link>
          </div>
        </div>

        <div className="hero-illustration">
          <div className="hierarchy-diagram">
            <div className="hierarchy-level">
              <div className="hierarchy-node owner">OWNER</div>
            </div>
            <div className="hierarchy-arrow">↓</div>
            <div className="hierarchy-level">
              <div className="hierarchy-node branches">MULTIPLE BRANCHES / BUSINESS UNITS</div>
            </div>
            <div className="hierarchy-arrow">↓</div>
            <div className="hierarchy-level">
              <div className="hierarchy-node admins">ADMINS</div>
            </div>
            <div className="hierarchy-arrow">↓</div>
            <div className="hierarchy-level">
              <div className="hierarchy-node workers">WORKERS</div>
            </div>
            <div className="hierarchy-arrow">↓</div>
            <div className="hierarchy-level">
              <div className="hierarchy-node centralized">CENTRALIZED MANAGEMENT</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Multi-Branch Management</h3>
            <p>Manage multiple branches and business units from a single centralized platform</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👷</div>
            <h3>Workforce Management</h3>
            <p>Track workers, attendance, shifts, and task allocation efficiently</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Inventory Control</h3>
            <p>Monitor stock levels, get low-stock alerts, and manage supplies</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Billing & Sales</h3>
            <p>Generate bills, track sales, and manage revenue streams</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered Insights</h3>
            <p>Get predictions for sales trends, inventory demand, and productivity insights</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Smart Notifications</h3>
            <p>Receive alerts for low stock, task deadlines, and anomalies</p>
          </div>
        </div>
      </section>

      <section id="about" className="about-section">
        <h2 className="section-title">About SEMS</h2>
        <p className="about-text">
          SEMS is designed for MSMEs and multi-unit businesses that need to manage operations across multiple locations. 
          Whether you run a retail chain, manufacturing units, textile production, or distribution centers, 
          SEMS provides the tools you need to centralize your operations and make data-driven decisions.
        </p>
      </section>

      <footer className="landing-footer">
        <p>&copy; 2024 Smart Enterprise Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
