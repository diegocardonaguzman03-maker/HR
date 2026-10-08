import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { useStore } from './store/useStore';

// Handle for automated checks (read-only use in tests).
(window as unknown as { __ammx: typeof useStore }).__ammx = useStore;

const rootEl = document.getElementById('root')!;
rootEl.dataset.started = '1';
createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
