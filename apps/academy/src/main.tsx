import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import { App, AppCrashed } from './app/App';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Raíz protegida: si algo falla al iniciar, se ve un mensaje y el aviso de seguridad (RT-SW-02).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={<AppCrashed />}><App /></ErrorBoundary>
  </StrictMode>,
);
