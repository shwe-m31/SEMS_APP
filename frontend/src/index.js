import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Wake up backend on app startup
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
fetch(`${API_BASE_URL}/health`)
  .then(() => {
    console.log('SEMS backend is ready');
  })
  .catch(() => {
    console.log('SEMS backend is waking up');
  });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
