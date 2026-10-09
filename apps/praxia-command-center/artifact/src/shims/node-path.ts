export const sep = "/";
function norm(parts: string[]) {
  const out: string[] = [];
  for (const p of parts.join("/").split("/")) { if (!p || p === ".") continue; if (p === "..") out.pop(); else out.push(p); }
  return "/" + out.join("/");
}
export const resolve = (...p: string[]) => norm(p);
export const join = (...p: string[]) => norm(p);
export default { sep, resolve, join };
