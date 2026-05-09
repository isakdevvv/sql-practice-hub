// Lazy CDN loader for Pyodide. We pull from jsdelivr so we don't need an npm
// install — the binary is large (~10 MB) and shouldn't bloat our bundle.
//
// Usage: const pyodide = await getPyodide();

const PYODIDE_VERSION = "0.26.4";
const CDN_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full`;

type Pyodide = {
  runPython: (code: string) => unknown;
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (opts: { batched?: (s: string) => void }) => void;
  setStderr: (opts: { batched?: (s: string) => void }) => void;
  globals: { get: (name: string) => unknown; set: (name: string, value: unknown) => void };
  toPy: (obj: unknown) => unknown;
  loadPackage: (names: string | string[]) => Promise<void>;
};

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<Pyodide>;
  }
}

let cached: Pyodide | null = null;
let loading: Promise<Pyodide> | null = null;
const progressListeners = new Set<(stage: string) => void>();

export function onPyodideProgress(cb: (stage: string) => void): () => void {
  progressListeners.add(cb);
  return () => progressListeners.delete(cb);
}

function notify(stage: string) {
  progressListeners.forEach((cb) => cb(stage));
}

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export async function getPyodide(): Promise<Pyodide> {
  if (cached) return cached;
  if (loading) return loading;

  loading = (async () => {
    notify("Laster Pyodide-skript…");
    await injectScript(`${CDN_BASE}/pyodide.js`);
    if (!window.loadPyodide) {
      throw new Error("Pyodide-skript lastet, men loadPyodide ble ikke definert.");
    }
    notify("Initialiserer Python-runtime (~10 MB, skjer bare første gang)…");
    const py = await window.loadPyodide({ indexURL: `${CDN_BASE}/` });
    // sqlite3 is unvendored in Pyodide and must be loaded as a package.
    // Used by our mysql.connector-shim so all DB exercises depend on it.
    notify("Laster sqlite3 og micropip…");
    await py.loadPackage(["sqlite3", "micropip"]);
    notify("Klar.");
    cached = py;
    return py;
  })();

  try {
    return await loading;
  } catch (err) {
    loading = null;
    throw err;
  }
}

export function isPyodideReady(): boolean {
  return cached !== null;
}
