import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const rootEl = document.getElementById('root')!;
rootEl.dataset.started = '1'; // tells the share page's error fallback that the app is running
createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
