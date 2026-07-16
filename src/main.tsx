// Patch window.fetch to be writable and configurable in case the sandboxing/testing environment attempts to intercept it.
try {
  const originalFetch = window.fetch;
  if (originalFetch) {
    Object.defineProperty(window, "fetch", {
      value: originalFetch,
      writable: true,
      configurable: true
    });
  }
} catch (e) {
  console.warn("Failed to patch window.fetch property writable status:", e);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
