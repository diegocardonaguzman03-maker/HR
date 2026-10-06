// Entry for the claude.ai artifact build (scripts/build-artifact.mjs).
// Same app as the Next.js build, mounted directly.
import { createRoot } from 'react-dom/client';
import { CommandCenter } from '@/components/CommandCenter';

createRoot(document.getElementById('root')!).render(<CommandCenter />);
