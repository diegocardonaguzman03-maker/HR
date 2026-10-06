// Entry for the claude.ai artifact build (scripts/build-artifact.mjs).
// Same app as the Next.js build, mounted directly, behind an error boundary so
// a failure shows its reason instead of a blank page.
import { Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { CommandCenter } from '@/components/CommandCenter';

declare global {
  interface Window {
    __fccBootError?: (msg: string) => void;
    __fccMounted?: boolean;
  }
}

class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    window.__fccBootError?.(`${error.name}: ${error.message}`);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, color: '#ece8df', font: '14px/1.5 ui-sans-serif, system-ui, sans-serif' }}>
        <div style={{ maxWidth: 560 }}>
          <b>The interface hit an error.</b>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#e2a54a', fontSize: 12 }}>{`${this.state.error.name}: ${this.state.error.message}`}</pre>
          <button type="button" onClick={() => location.reload()} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #444', background: 'transparent', color: '#ece8df' }}>
            Reload
          </button>
        </div>
      </div>
    );
  }
}

try {
  createRoot(document.getElementById('root')!).render(
    <Boundary>
      <CommandCenter />
    </Boundary>,
  );
  window.__fccMounted = true;
} catch (err) {
  window.__fccBootError?.(String(err));
}
