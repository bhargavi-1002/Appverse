import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { applyTheme, readThemePreference } from './lib/storage';
import './index.css';

// Apply the saved theme before the first paint to avoid a flash.
applyTheme(readThemePreference());

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root was not found.');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registerSW({
  immediate: true,
  onNeedRefresh() {
    // The new worker is already installed and waiting. Tell it to take over
    // and let the visitor decide when to reload.
    void navigator.serviceWorker?.getRegistration().then((registration) => {
      registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
    });
  },
  onOfflineReady() {
    window.dispatchEvent(new CustomEvent('appverse:offline-ready'));
  },
});
