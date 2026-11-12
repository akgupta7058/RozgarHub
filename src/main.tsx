import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for Chrome PWA installability & offline capabilities
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('RozgarHub PWA: Service Worker active with scope:', registration.scope);
      })
      .catch((err) => {
        console.warn('RozgarHub PWA: Service Worker registration error:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
