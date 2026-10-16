/* Agent-Crypto @erith.IA — 40.6.482 ORACLE EVIDENCE TIERED STORAGE FOUNDATION
   Browser / IndexedDB stays the hot working tier.
   GitHub data/oracle_evidence is the cold durable tier contract.
   This build NEVER deletes local Evidence and NEVER embeds a GitHub credential.
   Operator actions may read the same-origin manifest, prepare one bounded chunk,
   hash it, verify a published cold chunk, or download one transport bundle.
   Safe authenticated ingestion is intentionally deferred to a local Bridge/backend. */
(() => {
  "use strict";

  const BUILD = "40.6.482";
  const DEFAULT_CHUNK_ROWS = 500;
  const MAX_CHUNK_ROWS = 1000;
  const MANIFEST_RELATIVE = "../data/oracle_evidence/manifest.json";
  const COLD_ROOT_RELATIVE = "../data/oracle_evidence/";

  const state = {
    mounted: false,
    local_rows: null,
    manifest: null,
    manifest_loaded_at: 0,
    prepared: null,
    last_error: null,
    last_action: "IDLE",
    last_verify: null
  };

  function evidenceApi() {
    const api = globalThis.AtlasOracleEvidence;
    if (!api?.database || !api?.store) throw new Error("AtlasOracleEvidence indisponible");
    return api;
  }

  function manifestUrl() {
    return new URL(MANIFEST_RELATIVE, document.baseURI).href;
  }

  function coldUrl(relativePath) {
    const clean = String(relativePath || "").replace(/^\/+/, "");
    return new URL(COLD_ROOT_RELATIVE + clean, document.baseURI).href;
  }

  function setState(action, error = null) {
    state.last_action = String(action || "IDLE");
    state.last_error = error ? String(error?.message || error) : null;
    render();
  }

  function openExistingEvidenceDb() {
    return new Promise((resolve, reject) => {
      const api = evidenceApi();
      const request = indexedDB.open(api.database);
      let settled = false;
      request.onupgradeneeded = () => {
        try { request.transaction?.abort(); } catch (_) {}
        if (!settled) {
          settled = true;
          reject(new Error("Oracle Evidence IndexedDB absent — aucune création autorisée par 40.6.482"));
        }
      };
      request.onsuccess = () => {
        if (settled) {
          try { request.result?.close?.(); } catch (_) {}
          return;
        }
        settled = true;
        resolve(request.result);
      };
      request.onerror = () => {
        if (settled) return;
        settled = true;
        reject(request.error || new Error("Ouverture Oracle Evidence refusée"));
      };
      request.onblocked = () => {
        if (settled) return;
        settled = true;
        reject(new Error("Ouverture Oracle Evidence bloquée"));
      };
    });
  }

  async function countLocalRows() {
    const api = evidenceApi();
    const db = await openExistingEvidenceDb();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(api.store, "readonly");
        const req = tx.objectStore(api.store).count();
        req.onsuccess = () => resolve(Number(req.result) || 0);
        req.onerror = () => reject(req.error || new Error("Count Oracle Evidence refusé"));
      });
    } finally {
      try { db.close(); } catch (_) {}
    }
  }

  function validateManifest(manifest) {
    if (!manifest || manifest.schema !== "agent_crypto_oracle_evidence_cold_archive_manifest_v1") {
      throw new Error("Manifest Oracle Evidence froid invalide");
    }
    if (manifest.local_retention_allowed !== false) {
      throw new Error("Manifest froid refuse le verrou local_retention_allowed=false");
    }
    if (manifest.github_token_in_browser !== false) {
      throw new Error("Manifest froid refuse le verrou github_token_in_browser=false");
    }
    return manifest;
  }

  async function loadManifest() {
    setState("MANIFEST_LOADING");
    try {
      const response = await fetch(manifestUrl(), { cache: "no-store", credentials: "same-origin" });
      if (!response.ok) throw new Error(`Manifest froid HTTP ${response.status}`);
      const manifest = validateManifest(await response.json());
      state.manifest = manifest;
      state.manifest_loaded_at = Date.now();
      setState("MANIFEST_READY");
      return manifest;
    } catch (error) {
      setState("MANIFEST_ERROR", error);
      throw error;
    }
  }

  function watermarkOf(manifest) {
    const wm = manifest?.watermark;
    if (!wm || !Number.isFinite(Number(wm.t0))) return null;
    return { t0: Number(wm.t0), id: String(wm.id || "") };
  }

  function afterWatermark(cursor, watermark) {
    if (!watermark) return true;
    const t0 = Number(cursor?.key);
    const id = String(cursor?.primaryKey || "");
    if (!Number.isFinite(t0)) return false;
    if (t0 > watermark.t0) return true;
    if (t0 < watermark.t0) return false;
    return id > watermark.id;
  }

  async function readNextRows(limit = DEFAULT_CHUNK_ROWS, manifest = null) {
    const bounded = Math.max(1, Math.min(MAX_CHUNK_ROWS, Number(limit) || DEFAULT_CHUNK_ROWS));
    const api = evidenceApi();
    const db = await openExistingEvidenceDb();
    const watermark = watermarkOf(manifest);
    try {
      return await new Promise((resolve, reject) => {
        const rows = [];
        const tx = db.transaction(api.store, "readonly");
        const store = tx.objectStore(api.store);
        let index;
        try { index = store.index("t0"); }
        catch (error) { reject(error); return; }

        const range = watermark ? IDBKeyRange.lowerBound(watermark.t0) : null;
        const req = index.openCursor(range, "next");
        req.onsuccess = () => {
          const cursor = req.result;
          if (!cursor || rows.length >= bounded) {
            resolve(rows);
            return;
          }
          if (afterWatermark(cursor, watermark)) rows.push(cursor.value);
          if (rows.length >= bounded) {
            resolve(rows);
            return;
          }
          cursor.continue();
        };
        req.onerror = () => reject(req.error || new Error("Cursor archive froide refusé"));
        tx.onabort = () => reject(tx.error || new Error("Lecture archive froide annulée"));
      });
    } finally {
      try { db.close(); } catch (_) {}
    }
  }

  function canonicalJsonl(rows) {
    const source = Array.isArray(rows) ? rows : [];
    return source.map(row => JSON.stringify(row)).join("\n") + (source.length ? "\n" : "");
  }

  async function sha256Hex(text) {
    if (!globalThis.crypto?.subtle) throw new Error("SHA-256 WebCrypto indisponible");
    const bytes = new TextEncoder().encode(String(text || ""));
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map(v => v.toString(16).padStart(2, "0")).join("");
  }

  function utcParts(ms) {
    const d = new Date(Number(ms) || Date.now());
    return {
      year: String(d.getUTCFullYear()).padStart(4, "0"),
      month: String(d.getUTCMonth() + 1).padStart(2, "0"),
      day: String(d.getUTCDate()).padStart(2, "0")
    };
  }

  function chunkMetadata(rows, sha256) {
    const source = Array.isArray(rows) ? rows : [];
    if (!source.length) return null;
    const first = source[0] || {};
    const last = source[source.length - 1] || {};
    const firstT0 = Number(first.t0 || 0);
    const lastT0 = Number(last.t0 || 0);
    const date = utcParts(firstT0);
    const filename = `evidence-${firstT0}-${lastT0}-${source.length}.jsonl`;
    return Object.freeze({
      schema: "agent_crypto_oracle_evidence_cold_chunk_v1",
      build: BUILD,
      payload_format: "jsonl",
      relative_path: `${date.year}/${date.month}/${date.day}/${filename}`,
      row_count: source.length,
      first_t0: firstT0,
      last_t0: lastT0,
      first_id: String(first.id || ""),
      last_id: String(last.id || ""),
      sha256,
      source_database: evidenceApi().database,
      source_store: evidenceApi().store,
      watermark_after: Object.freeze({ t0: lastT0, id: String(last.id || "") }),
      local_rows_deleted: false,
      local_retention_allowed: false
    });
  }

  async function prepareNextChunk(options = {}) {
    const limit = Math.max(1, Math.min(MAX_CHUNK_ROWS, Number(options.limit) || DEFAULT_CHUNK_ROWS));
    setState("CHUNK_PREPARING");
    try {
      const manifest = state.manifest || await loadManifest();
      const rows = await readNextRows(limit, manifest);
      if (!rows.length) {
        state.prepared = null;
        setState("NO_UNARCHIVED_ROWS");
        return null;
      }
      const jsonl = canonicalJsonl(rows);
      const sha256 = await sha256Hex(jsonl);
      const chunk = chunkMetadata(rows, sha256);
      const bundle = Object.freeze({
        schema: "agent_crypto_oracle_evidence_transport_bundle_v1",
        build: BUILD,
        created_at: new Date().toISOString(),
        chunk,
        jsonl,
        intended_cold_root: "public/agent_crypto_erith_ia/data/oracle_evidence/",
        manifest_path: "public/agent_crypto_erith_ia/data/oracle_evidence/manifest.json",
        bridge_ingest_required: true,
        browser_github_write: false,
        github_token_embedded: false,
        local_delete_authorized: false
      });
      state.prepared = bundle;
      setState("CHUNK_READY");
      return bundle;
    } catch (error) {
      state.prepared = null;
      setState("CHUNK_ERROR", error);
      throw error;
    }
  }

  function bundleFilename(bundle = state.prepared) {
    const c = bundle?.chunk;
    if (!c) return "oracle-evidence-cold-bundle.json";
    return `oracle-evidence-cold-bundle-${c.first_t0}-${c.last_t0}-${c.row_count}.json`;
  }

  function downloadPreparedBundle() {
    const bundle = state.prepared;
    if (!bundle?.chunk || !bundle?.jsonl) throw new Error("Aucun lot froid préparé");
    const blob = new Blob([JSON.stringify(bundle, null, 2) + "\n"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = bundleFilename(bundle);
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setState("BUNDLE_DOWNLOADED");
    return bundleFilename(bundle);
  }

  async function verifyColdChunk(relativePath, expected = {}) {
    setState("VERIFYING_COLD_CHUNK");
    try {
      const response = await fetch(coldUrl(relativePath), { cache: "no-store", credentials: "same-origin" });
      if (!response.ok) throw new Error(`Chunk froid HTTP ${response.status}`);
      const text = await response.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      const sha256 = await sha256Hex(text);
      let parseOk = true;
      try { lines.forEach(line => JSON.parse(line)); }
      catch (_) { parseOk = false; }
      const result = Object.freeze({
        relative_path: String(relativePath || ""),
        sha256,
        row_count: lines.length,
        parse_ok: parseOk,
        sha256_match: expected.sha256 ? sha256 === String(expected.sha256) : null,
        row_count_match: Number.isFinite(Number(expected.row_count)) ? lines.length === Number(expected.row_count) : null,
        verified: parseOk &&
          (!expected.sha256 || sha256 === String(expected.sha256)) &&
          (!Number.isFinite(Number(expected.row_count)) || lines.length === Number(expected.row_count))
      });
      state.last_verify = result;
      setState(result.verified ? "VERIFY_PASS" : "VERIFY_FAIL");
      return result;
    } catch (error) {
      state.last_verify = null;
      setState("VERIFY_ERROR", error);
      throw error;
    }
  }

  async function refreshLocalState() {
    try {
      state.local_rows = await countLocalRows();
      render();
      return state.local_rows;
    } catch (error) {
      setState("LOCAL_COUNT_ERROR", error);
      throw error;
    }
  }

  function snapshot() {
    return Object.freeze({
      build: BUILD,
      local_rows: state.local_rows,
      archived_rows: Number(state.manifest?.archived_rows || 0),
      cold_chunks: Array.isArray(state.manifest?.chunks) ? state.manifest.chunks.length : 0,
      transport_status: String(state.manifest?.transport?.status || "PENDING_SAFE_BRIDGE"),
      manifest_loaded_at: state.manifest_loaded_at || 0,
      prepared: state.prepared ? {
        relative_path: state.prepared.chunk.relative_path,
        row_count: state.prepared.chunk.row_count,
        sha256: state.prepared.chunk.sha256
      } : null,
      last_action: state.last_action,
      last_error: state.last_error,
      last_verify: state.last_verify,
      local_retention_allowed: false,
      browser_github_write: false,
      github_token_in_browser: false
    });
  }

  function ensurePanel() {
    if (document.getElementById("oracleEvidenceColdArchive406482")) return true;
    const root = document.getElementById("oracle-evidence-explorer");
    if (!root) return false;
    const panel = document.createElement("section");
    panel.id = "oracleEvidenceColdArchive406482";
    panel.setAttribute("aria-label", "Mémoire froide Oracle Evidence GitHub");
    panel.style.cssText = "margin:10px 0 12px;padding:10px 12px;border:1px solid rgba(102,211,255,.24);border-radius:10px;background:rgba(7,19,31,.78);display:grid;gap:8px";
    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
        <div><strong style="color:#8ee7ff">MÉMOIRE FROIDE · GITHUB · 40.6.482</strong><br><small id="oracleColdArchiveNote406482">Fondation sûre · aucune purge locale</small></div>
        <span id="oracleColdArchiveState406482" style="font-weight:800">INITIALISATION</span>
      </div>
      <div style="display:flex;gap:14px;flex-wrap:wrap;font-size:12px">
        <span>Local <b id="oracleColdLocalRows406482">—</b></span>
        <span>Archivé <b id="oracleColdArchivedRows406482">0</b></span>
        <span>Chunks <b id="oracleColdChunks406482">0</b></span>
        <span>Transport <b id="oracleColdTransport406482">PENDING_SAFE_BRIDGE</b></span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" id="btnOracleColdManifest406482">Lire manifest GitHub</button>
        <button type="button" id="btnOracleColdPrepare406482">Préparer 500 Evidence</button>
        <button type="button" id="btnOracleColdDownload406482" disabled>Télécharger le lot</button>
      </div>
      <small id="oracleColdPrepared406482">Aucune donnée locale ne sera supprimée par cette version.</small>
    `;
    const anchor = root.querySelector(".oracle-evidence-explorer-controls") || root.firstElementChild;
    if (anchor?.parentNode) anchor.parentNode.insertBefore(panel, anchor.nextSibling);
    else root.prepend(panel);

    document.getElementById("btnOracleColdManifest406482")?.addEventListener("click", () => void loadManifest().catch(() => {}));
    document.getElementById("btnOracleColdPrepare406482")?.addEventListener("click", () => void prepareNextChunk({ limit: DEFAULT_CHUNK_ROWS }).catch(() => {}));
    document.getElementById("btnOracleColdDownload406482")?.addEventListener("click", () => {
      try { downloadPreparedBundle(); } catch (error) { setState("DOWNLOAD_ERROR", error); }
    });
    state.mounted = true;
    render();
    void refreshLocalState().catch(() => {});
    return true;
  }

  function render() {
    const snap = snapshot();
    const set = (id, value) => {
      const node = document.getElementById(id);
      if (node) node.textContent = String(value);
    };
    set("oracleColdArchiveState406482", snap.last_error ? "ERREUR" : snap.last_action);
    set("oracleColdLocalRows406482", snap.local_rows == null ? "—" : snap.local_rows);
    set("oracleColdArchivedRows406482", snap.archived_rows);
    set("oracleColdChunks406482", snap.cold_chunks);
    set("oracleColdTransport406482", snap.transport_status);
    const prepared = document.getElementById("oracleColdPrepared406482");
    if (prepared) {
      prepared.textContent = snap.last_error
        ? `Erreur · ${snap.last_error}`
        : snap.prepared
          ? `${snap.prepared.row_count} Evidence prêtes · SHA-256 ${snap.prepared.sha256.slice(0, 16)}… · aucune purge locale`
          : "Aucune donnée locale ne sera supprimée par cette version.";
    }
    const download = document.getElementById("btnOracleColdDownload406482");
    if (download) download.disabled = !state.prepared;
  }

  function mount() {
    if (ensurePanel()) return true;
    return false;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
  window.addEventListener("agent-crypto:postboot-runtime-ready", mount, { once: true });

  globalThis.AtlasOracleEvidenceTieredStorageFoundation406482 = Object.freeze({
    build: BUILD,
    role: "HOT_BROWSER_COLD_GITHUB_FOUNDATION",
    manifest_url: manifestUrl(),
    default_chunk_rows: DEFAULT_CHUNK_ROWS,
    max_chunk_rows: MAX_CHUNK_ROWS,
    load_manifest: loadManifest,
    prepare_next_chunk: prepareNextChunk,
    download_prepared_bundle: downloadPreparedBundle,
    verify_cold_chunk: verifyColdChunk,
    count_local_rows: countLocalRows,
    refresh_local_state: refreshLocalState,
    mount,
    state: snapshot,
    local_retention_allowed: false,
    local_delete_api_exposed: false,
    browser_github_write: false,
    automatic_upload: false,
    github_token_in_browser: false,
    safe_bridge_required: true,
    storage_schema_changed: false,
    oracle_math_changed: false,
    strategy_a_changed: false,
    market_core_changed: false,
    real_order: false,
    recurring_timer: false,
    observer: false
  });
})();
