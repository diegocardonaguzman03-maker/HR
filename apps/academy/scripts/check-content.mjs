// Valida src/content/*.json contra el esquema zod y las referencias cruzadas.
// Uso: npm run check:content   (también corre antes de cada build)
import { spawnSync } from 'node:child_process';
const r = spawnSync('npx', ['tsx', 'scripts/check-content.ts'], { stdio: 'inherit' });
process.exit(r.status ?? 1);
