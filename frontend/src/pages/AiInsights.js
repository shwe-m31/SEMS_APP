import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiAPI } from '../services/api';
import AppShell from '../components/AppShell';
import './AiInsights.css';
import './Dashboard.css';

function AiInsights() {
  const { user } = useAuth();
  const [branchId, setBranchId] = useState(user?.branchId);
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

  if (loading) {
    return (
      <AppShell pageTitle="AI Predictive Intelligence">
        <div className="loading">Running predictive neural models and telemetry analysis...</div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="AI Predictive Intelligence">
      <div className="dashboard-header">
        <div>
          <h2>AI Predictive Intelligence</h2>
          <p className="page-lead" style={{ margin: '4px 0 0 0' }}>Real-time machine learning heuristics and automated anomaly telemetry.</p>
        </div>
        <div>
          <button onClick={fetchAllInsights} className="btn btn-secondary">Refresh Telemetry</button>
        </div>
      </div>

      <div className="ai-grid">
        {/* Inventory Demand Forecasting */}
        <div className="ai-card inventory-forecast">
          <div className="ai-card-header">
            <h3>Inventory Demand Forecasting</h3>
            <span className="ai-card-tag">Model: Demand v2.1</span>
          </div>
          <div className="ai-card-body">
            {inventoryForecast && (
              <>
                <div className="forecast-item">
                  <span className="label">Monitored SKU</span>
                  <span className="value">{inventoryForecast.itemName}</span>
                </div>
                <div className="forecast-item">
                  <span className="label">Current Stock</span>
                  <span className="value">{inventoryForecast.currentStock} units</span>
                </div>
                <div className="forecast-item">
                  <span className="label">Predicted Demand</span>
                  <span className="value highlight">{inventoryForecast.predictedDemand} units</span>
                </div>
                <div className="forecast-item">
                  <span className="label">Prediction Horizon</span>
                  <span className="value">{inventoryForecast.predictionDate}</span>
                </div>
                <div className="forecast-item">
                  <span className="label">Confidence Score</span>
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
            <span className="ai-card-tag">Model: Forecast Regressor</span>
          </div>
          <div className="ai-card-body">
            {salesPrediction && (
              <>
                <div className="forecast-item">
                  <span className="label">Historical Benchmark</span>
                  <span className="value">₹{salesPrediction.historicalSales}</span>
                </div>
                <div className="forecast-item">
                  <span className="label">Projected Sales</span>
                  <span className="value highlight">₹{salesPrediction.predictedSales}</span>
                </div>
                <div className="forecast-item">
                  <span className="label">Directional Trend</span>
                  <span className={`value trend-${salesPrediction.trend?.toLowerCase()}`}>
                    {salesPrediction.trend}
                  </span>
                </div>
                <div className="forecast-item">
                  <span className="label">Target Date</span>
                  <span className="value">{salesPrediction.predictionDate}</span>
                </div>
                <div className="forecast-item">
                  <span className="label">Confidence Score</span>
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
            <h3>Worker Productivity Index</h3>
            <span className="ai-card-tag">Model: Capacity Heuristics</span>
          </div>
          <div className="ai-card-body">
            {productivityAnalysis && (
              <>
                <div className="forecast-item">
                  <span className="label">Total Tasks Assigned</span>
                  <span className="value">{productivityAnalysis.totalTasksAssigned}</span>
                </div>
                <div className="forecast-item">
                  <span className="label">Total Tasks Completed</span>
                  <span className="value">{productivityAnalysis.totalTasksCompleted}</span>
                </div>
                <div className="forecast-item">
                  <span className="label">Throughput Rate</span>
                  <span className="value highlight">{productivityAnalysis.completionRate.toFixed(1)}%</span>
                </div>
                <div className="forecast-item">
                  <span className="label">Model Confidence</span>
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
            <h3>Anomaly & Risk Detection</h3>
            <span className="ai-card-tag">Model: Isolation Forest</span>
          </div>
          <div className="ai-card-body">
            {anomalies && (
              <>
                <div className="forecast-item">
                  <span className="label">Total Anomalies Flagged</span>
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
                          <strong>Identified Factors:</strong>
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
                    <p>No operational anomalies detected across monitored pipelines.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="demo-notice" style={{ marginTop: 24, padding: '16px 20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Telemetry Notice:</strong> AI predictions and statistical confidence values are calculated using neural inference models across inventory, demand patterns, shift throughput, and audit anomalies.
        </p>
      </div>
    </AppShell>
  );
}

export default AiInsights;
