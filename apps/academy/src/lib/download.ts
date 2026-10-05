/** Rutas públicas (relativas al index para funcionar en subcarpetas). */
export const asset = (p: string) => `./${p.replace(/^\.?\//, '')}`;
export const fileName = (p: string) => p.split('/').pop() ?? p;
