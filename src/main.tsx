// Import polyfills first
import './polyfills';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MeshProvider } from '@meshsdk/react';
import ErrorBoundary from './ErrorBoundary';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <MeshProvider>
        <App />
      </MeshProvider>
    </ErrorBoundary>
  </StrictMode>
);