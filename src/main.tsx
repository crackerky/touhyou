// Import polyfills first
import './polyfills';

import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { MeshProvider } from '@meshsdk/react';
import ErrorBoundary from './ErrorBoundary';
import App from './App.tsx';
import './index.css';
import { initCardanoLib } from './lib/wallet';

// Create a function to initialize the app
const initApp = () => {
  // Init WebAssembly libraries asynchronously (non-blocking)
  setTimeout(() => {
    initCardanoLib().then(success => {
      console.log('Cardano library initialization:', success ? 'successful' : 'failed');
    }).catch(err => {
      console.warn('Cardano library initialization error (non-critical):', err);
    });
  }, 100); // Slight delay to ensure other critical resources load first

  // Debug information for troubleshooting
  console.log('Application starting...');
  console.log('Window.Buffer available:', typeof window.Buffer !== 'undefined');
  console.log('Window.global available:', typeof window.global !== 'undefined');

  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('Root element not found');
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2 style="color: #e53e3e;">Root element not found</h2>
        <p>Could not find the root element to render the application.</p>
        <button 
          style="margin-top: 15px; background: #3b82f6; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;"
          onclick="window.location.reload()">
          ページを再読み込み
        </button>
      </div>
    `;
  } else {
    ReactDOM.createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <MeshProvider>
            <App />
          </MeshProvider>
        </ErrorBoundary>
      </StrictMode>
    );
  }
};

// Execute the initialization function
initApp();