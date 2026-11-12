import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-update
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('RozgarHub PWA: Naya update uplabdh hai.');
  },
  onOfflineReady() {
    console.log('RozgarHub PWA: App offline mode mein chalne ke liye ready hai.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
