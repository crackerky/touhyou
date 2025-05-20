// Import polyfills first
import './polyfills';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MeshProvider } from '@meshsdk/react';
import ErrorBoundary from './ErrorBoundary';
import App from './App.tsx';
import './index.css';

// Wrap render in a try-catch to catch initialization errors
try {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <MeshProvider>
          <App />
        </MeshProvider>
      </ErrorBoundary>
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render application:', error);
  
  // Fallback rendering in case of fatal errors
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2 style="color: #e53e3e;">アプリケーション起動エラー</h2>
        <p>アプリケーションの起動中にエラーが発生しました。</p>
        <p style="font-size: 14px; color: #718096; margin-top: 10px;">
          ${error instanceof Error ? error.message : '不明なエラー'}
        </p>
        <button 
          style="margin-top: 15px; background: #3b82f6; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;"
          onclick="window.location.reload()">
          ページを再読み込み
        </button>
      </div>
    `;
  }
}