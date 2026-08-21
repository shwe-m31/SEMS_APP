import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { aiAPI } from '../services/api';
import './AiInsights.css';

function AiInsights() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [branchId, setBranchId] = useState(user?.branchId || 1);
  const [inventoryForecast, setInventoryForecast] = useState(null);
  const [salesPrediction, setSalesPrediction] = useState(null);
  const [productivityAnalysis, setProductivityAnalysis] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBranchId(user?.branchId || 1);
  }, [user?.branchId]);

  useEffect(() => {
    fetchAllInsights();
  }, [branchId]);

  const fetchAllInsights = async () => {
    setLoading(true);
    try {
      const [inventory, sales, productivity, anomalyData] = await Promise.all([
        aiAPI.forecastInventory(branchId, 'Steel Sheet A'),
        aiAPI.predictSales(branchId),
        aiAPI.analyzeProductivity(branchId),
        aiAPI.detectAnomalies(branchId)
      ]);
      
      setInventoryForecast(inventory.data);
      setSalesPrediction(sales.data);
      setProductivityAnalysis(productivity.data);
      setAnomalies(anomalyData.data);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading AI insights...</div>;
  }

  return (
    <div className="ai-insights">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>SEMS</h1>
          <span className="user-role">AI Insights Dashboard</span>
        </div>
        <div className="header-right">
          <span className="user-name">Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </header>

      <div className="ai-content">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <a href="#" className="nav-item">AI Insights</a>
            <a href={user?.role === 'OWNER' ? '/owner-dashboard' : '/admin-dashboard'} className="nav-item">Back to Dashboard</a>
          </nav>
        </aside>

        <main className="main-content">
          <div className="dashboard-header">
            <h2>AI-Powered Insights</h2>
            <p className="subtitle">Prototype Predictions and Analytics</p>
          </div>

          <div className="ai-grid">
            {/* Inventory Demand Forecasting */}
            <div className="ai-card inventory-forecast">
              <div className="ai-card-header">
                <h3>Inventory Demand Forecasting</h3>
              </div>
              <div className="ai-card-body">
                {inventoryForecast && (
                  <>
                    <div className="forecast-item">
                      <span className="label">Product:</span>
                      <span className="value">{inventoryForecast.itemName}</span>
                    </div>
                    <div className="forecast-item">
                      <span className="label">Current Stock:</span>
                      <span className="value">{inventoryForecast.currentStock}</span>
                    </div>
                    <div className="forecast-item">
                      <span className="label">Predicted Demand:</span>
                      <span className="value highlight">{inventoryForecast.predictedDemand}</span>
                    </div>
                    <div className="forecast-item">
                      <span className="label">Prediction Date:</span>
                      <span className="value">{inventoryForecast.predictionDate}</span>
                    </div>
                    <div className="forecast-item">
                      <span className="label">Confidence Level:</span>
                      <span className="value">{inventoryForecast.confidenceLevel}%</span>
                    </div>
                    <div className="recommendation">
                      <strong>Recommendation:</strong>
                      <p>{inventoryForecast.recommendation}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sales Trend Prediction */}
            <div className="ai-card sales-prediction">
              <div className="ai-card-header">
                <h3>Sales Trend Prediction</h3>
              </div>
              <div className="ai-card-body">
                {salesPrediction && (
                  <>
                    <div className="forecast-item">
                      <span className="label">Historical Sales:</span>
                      <span className="value">₹{salesPrediction.historicalSales}</span>
                    </div>
                    <div className="forecast-item">
                      <span className="label">Predicted Sales:</span>
                      <span className="value highlight">₹{salesPrediction.predictedSales}</span>
                    </div>
                    <div className="forecast-item">
                      <span className="label">Trend:</span>
                      <span className={`value trend-${salesPrediction.trend?.toLowerCase()}`}>
                        {salesPrediction.trend}
                      </span>
                    </div>
                    <div className="forecast-item">
                      <span className="label">Prediction Date:</span>
                      <span className="value">{salesPrediction.predictionDate}</span>
                    </div>
                    <div className="forecast-item">
                      <span className="label">Confidence Level:</span>
                      <span className="value">{salesPrediction.confidenceLevel}%</span>
                    </div>
                    <div className="recommendation">
                      <strong>Recommendation:</strong>
                      <p>{salesPrediction.recommendation}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Worker Productivity Insights */}
            <div className="ai-card productivity-insights">
              <div className="ai-card-header">
                <h3>Worker Productivity Insights</h3>
              </div>
              <div className="ai-card-body">
                {productivityAnalysis && (
                  <>
                    <div className="forecast-item">
                      <span className="label">Total Tasks Assigned:</span>
                      <span className="value">{productivityAnalysis.totalTasksAssigned}</span>
                    </div>
                    <div className="forecast-item">
                      <span className="label">Total Tasks Completed:</span>
                      <span className="value">{productivityAnalysis.totalTasksCompleted}</span>
                    </div>
                    <div className="forecast-item">
                      <span className="label">Completion Rate:</span>
                      <span className="value highlight">{productivityAnalysis.completionRate.toFixed(1)}%</span>
                    </div>
                    <div className="forecast-item">
                      <span className="label">Confidence Level:</span>
                      <span className="value">{productivityAnalysis.confidenceLevel}%</span>
                    </div>
                    <div className="recommendation">
                      <strong>Insight:</strong>
                      <p>{productivityAnalysis.insight}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Anomaly Detection */}
            <div className="ai-card anomaly-detection">
              <div className="ai-card-header">
                <h3>Anomaly Detection</h3>
              </div>
              <div className="ai-card-body">
                {anomalies && (
                  <>
                    <div className="forecast-item">
                      <span className="label">Total Anomalies Detected:</span>
                      <span className={`value ${anomalies.totalAnomalies > 0 ? 'alert' : ''}`}>
                        {anomalies.totalAnomalies}
                      </span>
                    </div>
                    {anomalies.anomalies && anomalies.anomalies.length > 0 ? (
                      <div className="anomalies-list">
                        {anomalies.anomalies.map((anomaly, index) => (
                          <div key={index} className="anomaly-item">
                            <div className="anomaly-type">{anomaly.type}</div>
                            <div className="anomaly-description">{anomaly.description}</div>
                            <div className={`anomaly-severity severity-${anomaly.severity?.toLowerCase()}`}>
                              {anomaly.severity}
                            </div>
                            <div className="possible-causes">
                              <strong>Possible Causes:</strong>
                              <ul>
                                {anomaly.possibleCauses?.map((cause, i) => (
                                  <li key={i}>{cause}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-anomalies">
                        <p>No anomalies detected at this time.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="demo-notice">
            <p><strong>Prototype Mode:</strong> These AI predictions are generated using demo/sample data for demonstration purposes. 
            The confidence levels and predictions are simulated and not based on actual machine learning models.</p>
            <p>The AI features include: Inventory Demand Forecasting, Sales Trend Prediction, Worker Productivity Insights, and Anomaly Detection.</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AiInsights;
