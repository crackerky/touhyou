import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MeshProvider } from '@meshsdk/react';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MeshProvider>
      <App />
    </MeshProvider>
  </StrictMode>
);