/* Runs the Python scan engine (Pyodide) off the main thread. */
"use strict";

// build.py copies the Pyodide runtime into dist/pyodide, so nothing loads from a CDN.
const PYODIDE_INDEX_URL = new URL("pyodide/", self.location.href).href;
const APP_DIR = "/home/pyodide/app";
const UPLOAD_ROOT = "/uploads";

importScripts(`${PYODIDE_INDEX_URL}pyodide.js`);

let pyodide = null;
let bridge = null;

const ready = (async () => {
  pyodide = await loadPyodide({ indexURL: PYODIDE_INDEX_URL });
  // external_links.py imports ssl at module load; Pyodide ships it as a separate package.
  await pyodide.loadPackage("ssl");
  const response = await fetch("engine.zip", { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Could not download engine.zip (HTTP ${response.status}).`);
  }
  pyodide.unpackArchive(await response.arrayBuffer(), "zip", { extractDir: APP_DIR });
  pyodide.runPython(`import sys\nif "${APP_DIR}" not in sys.path: sys.path.insert(0, "${APP_DIR}")`);
  bridge = pyodide.pyimport("a11y_web");
  return JSON.parse(bridge.app_info());
})();

ready.then(
  (info) => postMessage({ type: "ready", info }),
  (error) => postMessage({ type: "fatal", error: errorMessage(error) })
);

self.onmessage = async (event) => {
  const { id, type, payload } = event.data;
  try {
    await ready;
    const result = await handle(type, payload || {});
    postMessage({ id, ok: true, result });
  } catch (error) {
    postMessage({ id, ok: false, error: errorMessage(error) });
  }
};

async function handle(type, payload) {
  if (type === "scan") {
    return withMountedFiles({ primary: payload.primary, intro: payload.intro }, (paths) =>
      callBridge("run_scan", [
        paths.primary,
        paths.intro || "",
        payload.courseId || "",
        Boolean(payload.skipHidden),
        payload.customTerms || "",
        Boolean(payload.includeFiles),
        Boolean(payload.filesOnly),
      ])
    );
  }
  if (type === "quick") {
    return callBridge("run_quick_check", [payload.markup || ""]);
  }
  if (type === "quiz") {
    return withMountedFiles({ primary: payload.primary }, (paths) =>
      callBridge("load_quiz", [paths.primary, Boolean(payload.skipHidden)])
    );
  }
  throw new Error(`Unknown request: ${type}`);
}

function callBridge(name, args) {
  const result = JSON.parse(bridge[name](...args));
  if (result.error) {
    throw new Error(result.error);
  }
  return result;
}

/*
 * Exposes each File at /uploads/<key>/<filename>. WORKERFS reads the file lazily
 * without copying it into WebAssembly memory, which matters for large exports.
 * If WORKERFS is unavailable, the file is copied into the in-memory filesystem.
 */
async function withMountedFiles(files, callback) {
  const FS = pyodide.FS;
  const mounted = [];
  const copied = [];
  const paths = {};
  try {
    for (const [key, file] of Object.entries(files)) {
      if (!file) {
        continue;
      }
      const dir = `${UPLOAD_ROOT}/${key}`;
      FS.mkdirTree(dir);
      const workerFs = FS.filesystems && FS.filesystems.WORKERFS;
      let isMounted = false;
      if (workerFs && typeof FileReaderSync !== "undefined") {
        try {
          FS.mount(workerFs, { files: [file] }, dir);
          mounted.push(dir);
          isMounted = true;
        } catch (_error) {
          isMounted = false;
        }
      }
      if (!isMounted) {
        const target = `${dir}/${file.name}`;
        FS.writeFile(target, new Uint8Array(await file.arrayBuffer()));
        copied.push(target);
      }
      paths[key] = `${dir}/${file.name}`;
    }
    return callback(paths);
  } finally {
    for (const dir of mounted) {
      try { FS.unmount(dir); } catch (_error) { /* already unmounted */ }
    }
    for (const target of copied) {
      try { FS.unlink(target); } catch (_error) { /* already removed */ }
    }
  }
}

function errorMessage(error) {
  const text = String((error && error.message) || error || "Unknown error");
  // Python tracebacks end with "ExceptionType: message"; show only that line.
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length > 1 && /^Traceback/.test(lines[0])) {
    return `Unexpected error: ${lines[lines.length - 1]}`;
  }
  return text;
}
