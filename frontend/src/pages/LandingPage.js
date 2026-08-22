import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="logo">SEMS</div>
        <nav className="landing-nav">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <Link to="/login" className="login-btn">Login</Link>
        </nav>
      </header>

      <section id="home" className="hero-section">
        <div className="hero-layout">
          <div className="hero-content">
            <span className="hero-eyebrow">Enterprise operations platform</span>
            <h1 className="hero-title">Run branches, workforce, inventory and billing from one professional workspace.</h1>
            <p className="hero-subtitle">
              SEMS helps owners, administrators and workers stay aligned with structured workflows, clean reporting and better day-to-day visibility across every business unit.
            </p>

            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">Create New Account</Link>
              <Link to="/login" className="btn btn-secondary">Login</Link>
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-summary-card">
              <h3>Centralized oversight</h3>
              <p>Track branch activity, people, stock levels and financial operations from a single decision-making view.</p>
            </div>
            <div className="hero-summary-card">
              <h3>Operational clarity</h3>
              <p>Give each role a clear workspace with focused actions, measurable data and a simpler workflow.</p>
            </div>
            <div className="hero-summary-card">
              <h3>Scalable workflow</h3>
              <p>Move from single-unit management to multi-branch coordination without changing how teams work.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="section-heading">
          <h2 className="section-title">Key Features</h2>
          <p className="section-subtitle">Built for structured growth, daily execution and cleaner oversight.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Multi-Branch Management</h3>
            <p>Coordinate multiple locations with consistent controls, visibility and accountability.</p>
          </div>
          <div className="feature-card">
            <h3>Workforce Management</h3>
            <p>Manage attendance, shift planning and task ownership with less manual follow-up.</p>
          </div>
          <div className="feature-card">
            <h3>Inventory Control</h3>
            <p>Monitor stock movement, maintain supply continuity and respond to shortages earlier.</p>
          </div>
          <div className="feature-card">
            <h3>Billing & Sales</h3>
            <p>Create bills, review sales performance and maintain a cleaner operational record.</p>
          </div>
          <div className="feature-card">
            <h3>AI-Powered Insights</h3>
            <p>Review forecasts and pattern-based signals that support faster planning and response.</p>
          </div>
          <div className="feature-card">
            <h3>Smart Notifications</h3>
            <p>Stay informed about exceptions, deadlines and branch-level operational changes.</p>
          </div>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="about-card">
          <h2 className="section-title">About SEMS</h2>
          <p className="about-text">
            SEMS is designed for growing businesses that need a more disciplined way to manage operations across branches, teams and business functions.
            Whether the environment is retail, manufacturing, textile production or distribution, the platform is structured to reduce fragmentation and support more informed decisions.
          </p>
        </div>
      </section>

      <footer className="landing-footer">
        <p>Smart Enterprise Management System</p>
      </footer>
    </div>
  );
}

export default LandingPage;
