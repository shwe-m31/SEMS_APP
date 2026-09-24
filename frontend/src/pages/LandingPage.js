import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './LandingPage.css';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <Link to="/" className="landing-logo">
          SEMS<span className="accent-dot">•</span>
        </Link>

        <nav className="landing-nav">
          <a href="#features" className="nav-link">Features</a>
          <a href="#team" className="nav-link">Who We Are</a>
          <a href="#operations" className="nav-link">What We Do</a>
          <a href="#analytics" className="nav-link">Intelligence</a>
        </nav>

        <div className="landing-header-actions">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle display theme"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <Link to="/login" className="btn btn-secondary btn-sm">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            Get Started
          </Link>
        </div>
      </header>

      {/* Section 1: Editorial Asymmetric Hero */}
      <section className="hero-section">
        <div className="hero-layout">
          <div className="hero-editorial-copy">
            <span className="hero-eyebrow-tag">
              Smart Enterprise Management System
            </span>
            <h1 className="hero-main-headline">
              One System.<br />
              Every Operation<span className="hero-accent-text">.</span>
            </h1>
            <p className="hero-body-paragraph">
              A unified operating architecture engineered for modern multi-branch enterprises.
              Coordinate distributed workforces, inventory logistics, point-of-sale audits,
              and shift rosters with mathematical precision.
            </p>

            <div className="hero-action-row">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started →
              </Link>
              <a href="#features" className="btn btn-secondary btn-lg">
                Explore SEMS
              </a>
            </div>

            <div className="hero-micro-metrics">
              <div className="hero-metric-item">
                <span className="hero-metric-num">3-Tier</span>
                <span className="hero-metric-desc">Role Isolation</span>
              </div>
              <div className="hero-metric-item">
                <span className="hero-metric-num">100%</span>
                <span className="hero-metric-desc">Branch Autonomy</span>
              </div>
              <div className="hero-metric-item">
                <span className="hero-metric-num">Real-Time</span>
                <span className="hero-metric-desc">Operational Stream</span>
              </div>
            </div>
          </div>

          {/* Real SEMS Layered Product Visual (Zero Emojis/Icons) */}
          <div className="hero-visual-container">
            <div className="product-preview-frame">
              <div className="preview-top-bar">
                <span>Enterprise Telemetry Console</span>
                <span className="preview-status-indicator">Systems Active</span>
              </div>
              <div className="preview-canvas-body">
                <div className="preview-kpi-row">
                  <div className="preview-kpi-box highlight">
                    <span className="preview-kpi-lbl">Today's Sales</span>
                    <span className="preview-kpi-val">₹48,250</span>
                  </div>
                  <div className="preview-kpi-box">
                    <span className="preview-kpi-lbl">Active Units</span>
                    <span className="preview-kpi-val">12</span>
                  </div>
                  <div className="preview-kpi-box">
                    <span className="preview-kpi-lbl">Attendance</span>
                    <span className="preview-kpi-val">98.4%</span>
                  </div>
                </div>

                <div className="preview-table-card">
                  <div className="preview-table-hdr">
                    <span>Branch Unit</span>
                    <span>Admin Lead</span>
                    <span style={{ textAlign: 'right' }}>Status</span>
                  </div>
                  <div className="preview-table-row">
                    <span className="branch-title">Chennai Central (CHN-001)</span>
                    <span className="branch-workers">R. Sharma</span>
                    <span className="branch-status" style={{ color: 'var(--success)' }}>Active</span>
                  </div>
                  <div className="preview-table-row">
                    <span className="branch-title">Bangalore East (BLR-002)</span>
                    <span className="branch-workers">V. Patel</span>
                    <span className="branch-status" style={{ color: 'var(--success)' }}>Active</span>
                  </div>
                  <div className="preview-table-row">
                    <span className="branch-title">Mumbai Hub (MUM-003)</span>
                    <span className="branch-workers">A. Rao</span>
                    <span className="branch-status" style={{ color: 'var(--warning)' }}>Shift Swap</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Everything Your Enterprise Needs */}
      <section className="landing-section" id="features">
        <div className="section-editorial-wrap">
          <div className="section-head-editorial">
            <span className="section-tag">Capabilities</span>
            <h2 className="section-big-title">Everything Your Enterprise Needs</h2>
            <p className="section-subtext">
              Eliminate software fragmentation. Connect branch administrators, frontline workers,
              and executive owners onto one dependable operational backbone.
            </p>
          </div>

          <div className="asymmetric-features-grid">
            <div className="editorial-feature-card hero-card">
              <div>
                <span className="card-number-index">01 / Governance</span>
                <h3 className="card-title-text">Multi-Branch Headquarters Oversight</h3>
                <p className="card-desc-text">
                  Deploy branch units across cities, assign administrators, and define organization categories.
                  HQ maintains central financial, workforce, and compliance visibility while branches operate autonomously.
                </p>
              </div>
              <span className="card-meta-pill">Configurable per business classification</span>
            </div>

            <div className="grid-stack-col">
              <div className="editorial-feature-card">
                <div>
                  <span className="card-number-index">02 / Workforce</span>
                  <h3 className="card-title-text">Attendance & Shift Dispatch</h3>
                  <p className="card-desc-text">
                    Automate worker check-ins, resolve unassigned shifts, and allocate tasks with clear priority deadlines.
                  </p>
                </div>
              </div>

              <div className="editorial-feature-card">
                <div>
                  <span className="card-number-index">03 / Supply Continuity</span>
                  <h3 className="card-title-text">Inventory & Dispatch Flow</h3>
                  <p className="card-desc-text">
                    Track stock thresholds, reconcile shipments, and prevent branch inventory stockouts in real time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Built Around Your Team */}
      <section className="landing-section" id="team" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="section-editorial-wrap">
          <div className="section-head-editorial">
            <span className="section-tag">Role Hierarchy</span>
            <h2 className="section-big-title">Built Around Your Team</h2>
            <p className="section-subtext">
              Every persona in SEMS receives an interface curated precisely for their operational scope.
              No noise, no misplaced administrative clutter.
            </p>
          </div>

          <div className="roles-grid">
            <div className="role-card-item owner-tier">
              <div>
                <span className="card-number-index">Tier 01</span>
                <h3 className="role-card-tier-title">Enterprise Owner</h3>
                <p className="role-card-tier-desc">
                  Executive oversight over all organizational branches, financial aggregation, and administrator provisioning.
                </p>
              </div>
              <ul className="role-feature-bullet-list">
                <li className="role-feature-bullet">Consolidated sales & expense ledger</li>
                <li className="role-feature-bullet">Branch creation & admin credential generation</li>
                <li className="role-feature-bullet">Company-wide workforce directories</li>
                <li className="role-feature-bullet">Macro AI forecasting & anomaly detection</li>
              </ul>
            </div>

            <div className="role-card-item admin-tier">
              <div>
                <span className="card-number-index">Tier 02</span>
                <h3 className="role-card-tier-title">Branch Administrator</h3>
                <p className="role-card-tier-desc">
                  Unit-level command over daily store or facility floor operations, staff attendance, and local billing.
                </p>
              </div>
              <ul className="role-feature-bullet-list">
                <li className="role-feature-bullet">Worker enrollment & employee ID assignment</li>
                <li className="role-feature-bullet">Daily shift scheduling & attendance verification</li>
                <li className="role-feature-bullet">Point-of-sale billing & invoice logging</li>
                <li className="role-feature-bullet">Local inventory restocking requests</li>
              </ul>
            </div>

            <div className="role-card-item worker-tier">
              <div>
                <span className="card-number-index">Tier 03</span>
                <h3 className="role-card-tier-title">Frontline Specialist</h3>
                <p className="role-card-tier-desc">
                  Focused execution interface designed for maximum speed and simplicity during active shifts.
                </p>
              </div>
              <ul className="role-feature-bullet-list">
                <li className="role-feature-bullet">Single-tap shift attendance check-in</li>
                <li className="role-feature-bullet">Assigned task status updates (Pending to Done)</li>
                <li className="role-feature-bullet">Upcoming shift roster inspection</li>
                <li className="role-feature-bullet">Operational alerts & branch notifications</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: From Daily Operations to Decisions */}
      <section className="landing-section" id="operations">
        <div className="section-editorial-wrap">
          <div className="section-head-editorial">
            <span className="section-tag">Platform Modules</span>
            <h2 className="section-big-title">From Daily Operations to Decisions</h2>
            <p className="section-subtext">
              Eight coordinated modules designed to support every step of your business pipeline.
            </p>
          </div>

          <div className="operations-matrix">
            <div className="matrix-module-tile">
              <span className="matrix-module-name">Task Management</span>
              <p className="matrix-module-detail">Priority scheduling, worker delegation, and deadline tracking.</p>
            </div>
            <div className="matrix-module-tile">
              <span className="matrix-module-name">Attendance Tracking</span>
              <p className="matrix-module-detail">Automated timestamps, present/absent accounting, and shift records.</p>
            </div>
            <div className="matrix-module-tile">
              <span className="matrix-module-name">Inventory Control</span>
              <p className="matrix-module-detail">Unit stock balancing, low-supply thresholds, and intake logs.</p>
            </div>
            <div className="matrix-module-tile">
              <span className="matrix-module-name">Billing & POS</span>
              <p className="matrix-module-detail">Point-of-sale customer invoicing, item breakdown, and receipts.</p>
            </div>
            <div className="matrix-module-tile">
              <span className="matrix-module-name">Expense Ledger</span>
              <p className="matrix-module-detail">Branch expenditure categorization and reimbursement tracking.</p>
            </div>
            <div className="matrix-module-tile">
              <span className="matrix-module-name">Sales Performance</span>
              <p className="matrix-module-detail">Volume monitoring, daily revenue totals, and trend metrics.</p>
            </div>
            <div className="matrix-module-tile">
              <span className="matrix-module-name">Logistics & Supply</span>
              <p className="matrix-module-detail">Shipment dispatches, driver tracking, and transit statuses.</p>
            </div>
            <div className="matrix-module-tile">
              <span className="matrix-module-name">Reporting & Audits</span>
              <p className="matrix-module-detail">Structured multi-branch operational analytics and ledger exports.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: AI Insights Analytics Showcase */}
      <section className="landing-section" id="analytics" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="section-editorial-wrap">
          <div className="ai-panel-wrapper">
            <div className="ai-panel-copy">
              <span className="section-tag">Machine Intelligence</span>
              <h2 className="section-big-title">Analytical Precision, Zero Guesswork</h2>
              <p className="section-subtext">
                SEMS continuously evaluates historical branch patterns to forecast inventory demand,
                spot operational anomalies, and predict revenue trajectories.
              </p>
              <ul className="ai-spec-list">
                <li className="ai-spec-item">Demand forecasting per SKU to avoid overstocking</li>
                <li className="ai-spec-item">Immediate detection of sudden absenteeism spikes</li>
                <li className="ai-spec-item">Branch productivity benchmarking and recommendations</li>
              </ul>
            </div>

            <div className="ai-telemetry-surface">
              <div className="ai-telemetry-header">
                <span>Model Output: Inventory & Anomaly Analysis</span>
                <span>Confidence 94%</span>
              </div>
              <div className="ai-telemetry-stat-row">
                <div className="ai-stat-pod">
                  <div className="ai-stat-pod-label">Predicted Demand (7 Days)</div>
                  <div className="ai-stat-pod-value">+18.5%</div>
                </div>
                <div className="ai-stat-pod">
                  <div className="ai-stat-pod-label">Inventory Risk Index</div>
                  <div className="ai-stat-pod-value" style={{ color: 'var(--success)' }}>Optimal</div>
                </div>
              </div>
              <div className="ai-insight-callout-box">
                <strong>Algorithmic Recommendation:</strong> Maintain stockbuffer for high-velocity items prior to weekend traffic. Logistics delivery scheduled on time.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Final CTA */}
      <section className="landing-cta-section">
        <div className="cta-editorial-box">
          <span className="section-tag">Enterprise Ready</span>
          <h2 className="cta-editorial-title">Ready to Transform Your Operations?</h2>
          <p className="cta-editorial-subtext">
            Join growing commercial enterprises running high-efficiency multi-branch operations with SEMS.
          </p>
          <div className="hero-action-row" style={{ justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started →
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In to Console
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-top-grid">
          <div className="footer-brand-summary">
            <span className="footer-brand-title">SEMS<span className="accent-dot">•</span></span>
            <p className="footer-brand-tagline">
              Smart Enterprise Management System. Built for distributed business networks and operational clarity.
            </p>
          </div>

          <div>
            <div className="footer-col-title">Product</div>
            <ul className="footer-links-list">
              <li><a href="#features">Features</a></li>
              <li><a href="#operations">Operations</a></li>
              <li><a href="#analytics">AI Analytics</a></li>
              <li><Link to="/login">Console Login</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Roles</div>
            <ul className="footer-links-list">
              <li><Link to="/login?role=OWNER">Owner Portal</Link></li>
              <li><Link to="/login?role=ADMIN">Branch Admin</Link></li>
              <li><Link to="/login?role=WORKER">Specialist Desk</Link></li>
              <li><Link to="/register">Register Business</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Security & System</div>
            <ul className="footer-links-list">
              <li><span>Role-Based Auth</span></li>
              <li><span>Branch Encrypted</span></li>
              <li><span>Audit Logging</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <span>&copy; {new Date().getFullYear()} SEMS Enterprise Systems. All rights reserved.</span>
          <span>Zero-overhead enterprise management architecture</span>
        </div>
      </footer>
    </div>
  );
}
