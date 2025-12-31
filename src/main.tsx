import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker for performance - but wait for React to mount
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    // Delay to ensure React has mounted first
    setTimeout(() => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Silent fail - not critical
      });
    }, 1000);
  });
}

const root = document.getElementById('root')!;

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)