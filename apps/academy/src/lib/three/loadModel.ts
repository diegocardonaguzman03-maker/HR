/**
 * Carga el GLB con progreso REAL: bytes descargados (fetch en streaming) → decodificación meshopt
 * → compilación de shaders (la hace Scene). La pantalla de carga muestra cada fase.
 */
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export type LoadPhase = 'download' | 'decode' | 'compile' | 'ready' | 'error';
export interface LoadProgress { phase: LoadPhase; loaded: number; total: number; message?: string }

export async function loadModel(url: string, onProgress: (p: LoadProgress) => void): Promise<GLTF> {
  onProgress({ phase: 'download', loaded: 0, total: 0 });
  const res = await fetch(url);
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
      onProgress({ phase: 'download', loaded, total: total || loaded });
    }
    const out = new Uint8Array(loaded);
    let o = 0;
    for (const c of chunks) { out.set(c, o); o += c.byteLength; }
    buf = out.buffer;
  } else {
    buf = await res.arrayBuffer();
  }
  onProgress({ phase: 'decode', loaded: buf.byteLength, total: buf.byteLength });
  await MeshoptDecoder.ready;
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  return await new Promise<GLTF>((resolve, reject) => loader.parse(buf, './', resolve, reject));
}
