/** Read-only view of the agent instruction files embedded at build time (repo-relative under /repo). */
declare const __AGENT_FILES__: Record<string, string>;
const files: Record<string, string> = Object.fromEntries(Object.entries(__AGENT_FILES__).map(([k, v]) => ["/repo/" + k, v]));
export const existsSync = (p: string) => p in files;
export const readFileSync = (p: string) => files[p] ?? "";
export const realpathSync = (p: string) => p;
export default { existsSync, readFileSync, realpathSync };
