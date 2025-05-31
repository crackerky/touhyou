// Import polyfills first
import './polyfills';

import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { MeshProvider } from '@meshsdk/react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './components/ErrorFallback';
import App from './App.tsx';
import './index.css';
import { initCardanoLib } from './lib/wallet';
import { analytics } from './utils/analytics';

// Create a function to initialize the app
const initApp = () => {
  // 初期ページロードの分析
  analytics.track('app_init', {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    timestamp: new Date().toISOString()
  });

  // Init WebAssembly libraries asynchronously (non-blocking)
  setTimeout(() => {
    initCardanoLib().then(success => {
      console.log('Cardano library initialization:', success ? 'successful' : 'failed');
      analytics.track('cardano_lib_init', { success });
    }).catch(err => {
      console.warn('Cardano library initialization error (non-critical):', err);
      analytics.track('cardano_lib_init_error', { error: err.message });
    });
  }, 100); // Slight delay to ensure other critical resources load first

  // Debug information for troubleshooting
  console.log('Application starting...');
  console.log('Window.Buffer available:', typeof window.Buffer !== 'undefined');
  console.log('Window.global available:', typeof window.global !== 'undefined');

  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('Root element not found');
    analytics.track('root_element_not_found', {});
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
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(error, errorInfo) => {
            console.error('Application error:', error, errorInfo);
            analytics.track('application_error', {
              error: error.message,
              stack: error.stack,
              componentStack: errorInfo.componentStack,
              timestamp: new Date().toISOString()
            });
          }}
        >
          <MeshProvider>
            <App />
          </MeshProvider>
        </ErrorBoundary>
      </StrictMode>
    );
  }
};

// グローバルエラーハンドリング
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  analytics.track('global_error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.message,
    stack: event.error?.stack
  });
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  analytics.track('unhandled_promise_rejection', {
    reason: event.reason?.message || String(event.reason),
    stack: event.reason?.stack
  });
});

// Execute the initialization function
initApp();
