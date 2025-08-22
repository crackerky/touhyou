import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🚀 Main.tsx loaded!');

const rootElement = document.getElementById('root');
console.log('🔍 Root element:', rootElement);

if (!rootElement) {
  console.error('❌ Root element not found');
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; color: red;">
      <h1>❌ Root element not found</h1>
      <p>HTMLに#rootエレメントが見つかりません。</p>
    </div>
  `;
} else {
  console.log('✅ Root element found, rendering App...');
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log('✅ React render completed');
  } catch (error) {
    console.error('❌ React render error:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red;">
        <h1>❌ React Render Error</h1>
        <p>Error: ${error.toString()}</p>
        <pre>${error.stack}</pre>
      </div>
    `;
  }
}

