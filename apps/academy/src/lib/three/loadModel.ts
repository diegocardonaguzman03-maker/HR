/**
 * Carga el GLB con progreso REAL: bytes descargados (fetch en streaming) → decodificación meshopt
 * → compilación de shaders (la hace Scene). La pantalla de carga muestra cada fase.
 */
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export type LoadPhase = 'download' | 'decode' | 'compile' | 'ready' | 'error';
export interface LoadProgress { phase: LoadPhase; loaded: number; total: number; message?: string }

/**
 * RT-SW-12: `signal` permite cancelar la descarga (desmontaje, StrictMode). Un AbortError no es un fallo
 * de carga: quien llama debe ignorarlo (`isAbort(e)`). El avance nunca pasa de 100 %: con
 * Content-Encoding gzip, content-length es el tamaño comprimido y los bytes leídos lo rebasan.
 */
export const isAbort = (e: unknown) => (e as { name?: string } | null)?.name === 'AbortError';

export async function loadModel(url: string, onProgress: (p: LoadProgress) => void, signal?: AbortSignal): Promise<GLTF> {
  const abortIfNeeded = () => { if (signal?.aborted) throw new DOMException('Carga cancelada', 'AbortError'); };
  onProgress({ phase: 'download', loaded: 0, total: 0 });
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`No se pudo descargar el modelo (${res.status})`);
  const total = Number(res.headers.get('content-length')) || 0;
  let buf: ArrayBuffer;
  if (res.body && 'getReader' in res.body) {
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      abortIfNeeded();
      onProgress({ phase: 'download', loaded, total: Math.max(total, loaded) });
    }
    const out = new Uint8Array(loaded);
    let o = 0;
    for (const c of chunks) { out.set(c, o); o += c.byteLength; }
    buf = out.buffer;
  } else {
    buf = await res.arrayBuffer();
  }
  abortIfNeeded();
  onProgress({ phase: 'decode', loaded: buf.byteLength, total: buf.byteLength });
  await MeshoptDecoder.ready;
  abortIfNeeded();
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  return await new Promise<GLTF>((resolve, reject) => loader.parse(buf, './', resolve, reject));
}
