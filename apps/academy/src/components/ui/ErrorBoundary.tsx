import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Contiene un fallo de render (p. ej. WebGL no disponible o un chunk que no carga) para que no
 * desmonte toda la aplicación. RT-SW-02: el aviso de seguridad y el resto de la UI siguen visibles.
 */
export class ErrorBoundary extends Component<{ fallback: ReactNode; onError?: (e: Error) => void; children: ReactNode }, { err: Error | null }> {
  override state: { err: Error | null } = { err: null };
  static getDerivedStateFromError(err: Error) { return { err }; }
  override componentDidCatch(err: Error, info: ErrorInfo) {
    console.error('Error contenido por ErrorBoundary:', err.message, info.componentStack?.split('\n')[1]?.trim() ?? '');
    this.props.onError?.(err);
  }
  override render() { return this.state.err ? this.props.fallback : this.props.children; }
}
