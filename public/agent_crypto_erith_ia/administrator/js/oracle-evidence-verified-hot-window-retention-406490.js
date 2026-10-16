/* Agent-Crypto @erith.IA — 40.6.490 ORACLE EVIDENCE VERIFIED HOT WINDOW RETENTION
   Explicit operator retention only. The automatic path is PREVIEW READ ONLY.
   A local chunk can be removed only after its public cold JSONL and its local
   canonical JSONL independently match the same VERIFIED manifest entry. */
(() => {
  "use strict";

  const BUILD = "40.6.490";
  const HOT_MIN_ROWS = 10000;
  const CANARY_MAX_ROWS = 500;
  const MEASURED_MEAN_BYTES_FALLBACK = 6.41 * 1024;
  const MANIFEST_RELATIVE = "../data/oracle_evidence/manifest.json";
  const COLD_ROOT_RELATIVE = "../data/oracle_evidence/";
  const ARCHIVE_LOCK_KEY = "__ATLAS_ORACLE_EVIDENCE_ARCHIVE_LOCK__";
  const RETENTION_LOCK_OWNER = "retention-40.6.490";

  const state = {
    mounted: false,
    preview_started: false,
    preview_running: false,
    running: false,
    action: "IDLE",
    error: null,
    preview: null,
    canary_pass: false,
    canary_receipt: null,
    removed_rows: 0,
    removed_chunks: 0,
    last_chunk_receipt: null,
    final_receipt: null,
    post_cleanup_probe: null
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
    const path = String(relativePath || "");
    if (!path || path.startsWith("/") || path.includes("..") || !path.endsWith(".jsonl")) {
      throw new Error("Chemin de chunk froid refusé");
    }
    return new URL(COLD_ROOT_RELATIVE + path, document.baseURI).href;
  }

  function evidenceMark(value) {
    if (!value || !Number.isFinite(Number(value.t0))) return null;
    return { t0: Number(value.t0), id: String(value.id || "") };
  }

  function compareMark(left, right) {
    const a = evidenceMark(left);
    const b = evidenceMark(right);
    if (!a && !b) return 0;
    if (!a) return -1;
    if (!b) return 1;
    if (a.t0 !== b.t0) return a.t0 < b.t0 ? -1 : 1;
    if (a.id === b.id) return 0;
    return a.id < b.id ? -1 : 1;
  }

  function firstMark(chunk) {
    return evidenceMark({ t0: chunk?.first_t0, id: chunk?.first_id });
  }

  function lastMark(chunk) {
    return evidenceMark({ t0: chunk?.last_t0, id: chunk?.last_id });
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function isSha256(value) {
    return /^[a-f0-9]{64}$/i.test(String(value || ""));
  }

  function assertVerifiedChunk(chunk, watermark) {
    assert(chunk && typeof chunk === "object", "Entrée chunk absente");
    assert(String(chunk.status || "").toUpperCase() === "VERIFIED", "Chunk non VERIFIED");
    assert(Number.isInteger(Number(chunk.row_count)) && Number(chunk.row_count) > 0, "row_count chunk invalide");
    assert(isSha256(chunk.sha256), "SHA-256 manifest invalide");
    assert(firstMark(chunk) && lastMark(chunk), "Bornes chunk invalides");
    assert(compareMark(firstMark(chunk), lastMark(chunk)) <= 0, "Bornes chunk inversées");
    assert(compareMark(lastMark(chunk), watermark) <= 0, "Chunk postérieur au watermark froid");
    assert(chunk.verification?.read_back === true, "Preuve read_back absente");
    assert(chunk.verification?.sha256 === true, "Preuve SHA-256 absente");
    assert(chunk.verification?.row_count === true, "Preuve row_count absente");
    assert(chunk.verification?.json_parse === true, "Preuve JSON parse absente");
    assert(chunk.verification?.manifest_commit === true, "Preuve manifest commit absente");
    assert(chunk.local_rows_deleted === false, "État froid local_rows_deleted divergent");
    assert(chunk.local_retention_allowed === false, "Verrou froid local_retention_allowed divergent");
    coldUrl(chunk.relative_path);
    return chunk;
  }

  function validateManifest(manifest) {
    assert(manifest?.schema === "agent_crypto_oracle_evidence_cold_archive_manifest_v1", "Manifest froid invalide");
    assert(manifest.local_delete_requires_verified_cold_copy === true, "Preuve froide obligatoire absente");
    assert(manifest.local_retention_allowed === false, "Verrou global de rétention froide divergent");
    assert(manifest.github_token_in_browser === false, "Verrou token navigateur divergent");
    assert(manifest.browser_github_write === false, "Verrou écriture GitHub navigateur divergent");
    const watermark = evidenceMark(manifest.watermark);
    assert(watermark, "Watermark froid absent");
    const chunks = Array.isArray(manifest.chunks) ? manifest.chunks : [];
    chunks.forEach(chunk => assertVerifiedChunk(chunk, watermark));
    return manifest;
  }

  async function fetchManifest() {
    const response = await fetch(manifestUrl(), { cache: "no-store", credentials: "same-origin" });
    if (!response.ok) throw new Error("Manifest froid HTTP " + response.status);
    return validateManifest(await response.json());
  }

  function sameChunk(left, right) {
    return String(left?.relative_path || "") === String(right?.relative_path || "") &&
      Number(left?.row_count) === Number(right?.row_count) &&
      String(left?.sha256 || "") === String(right?.sha256 || "") &&
      Number(left?.first_t0) === Number(right?.first_t0) &&
      Number(left?.last_t0) === Number(right?.last_t0) &&
      String(left?.first_id || "") === String(right?.first_id || "") &&
      String(left?.last_id || "") === String(right?.last_id || "");
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
          reject(new Error("Oracle Evidence IndexedDB absent — aucune création autorisée"));
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
        if (!settled) {
          settled = true;
          reject(request.error || new Error("Ouverture Oracle Evidence refusée"));
        }
      };
      request.onblocked = () => {
        if (!settled) {
          settled = true;
          reject(new Error("Ouverture Oracle Evidence bloquée"));
        }
      };
    });
  }

  async function countLocalRows() {
    const api = evidenceApi();
    const db = await openExistingEvidenceDb();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(api.store, "readonly");
        const request = tx.objectStore(api.store).count();
        request.onsuccess = () => resolve(Number(request.result) || 0);
        request.onerror = () => reject(request.error || new Error("Count Oracle Evidence refusé"));
        tx.onabort = () => reject(tx.error || new Error("Count Oracle Evidence annulé"));
      });
    } finally {
      try { db.close(); } catch (_) {}
    }
  }

  async function readLocalChunkRows(chunk) {
    const api = evidenceApi();
    const db = await openExistingEvidenceDb();
    const first = firstMark(chunk);
    const last = lastMark(chunk);
    try {
      return await new Promise((resolve, reject) => {
        const rows = [];
        const tx = db.transaction(api.store, "readonly");
        let index;
        try { index = tx.objectStore(api.store).index("t0"); }
        catch (error) { reject(error); return; }
        const range = IDBKeyRange.bound(first.t0, last.t0);
        const request = index.openCursor(range, "next");
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) {
            resolve(rows);
            return;
          }
          const current = evidenceMark({ t0: cursor.key, id: cursor.primaryKey });
          if (compareMark(current, first) >= 0 && compareMark(current, last) <= 0) rows.push(cursor.value);
          cursor.continue();
        };
        request.onerror = () => reject(request.error || new Error("Lecture locale du chunk refusée"));
        tx.onabort = () => reject(tx.error || new Error("Lecture locale du chunk annulée"));
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
    return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, "0")).join("");
  }

  function assertRowsMatchChunk(rows, chunk, label) {
    assert(Array.isArray(rows), label + " absent");
    assert(rows.length === Number(chunk.row_count), label + " row_count divergent");
    assert(rows.length > 0, label + " vide");
    const first = rows[0] || {};
    const last = rows[rows.length - 1] || {};
    assert(Number(first.t0) === Number(chunk.first_t0), label + " first_t0 divergent");
    assert(String(first.id || "") === String(chunk.first_id || ""), label + " first_id divergent");
    assert(Number(last.t0) === Number(chunk.last_t0), label + " last_t0 divergent");
    assert(String(last.id || "") === String(chunk.last_id || ""), label + " last_id divergent");
    for (let index = 1; index < rows.length; index += 1) {
      assert(compareMark(rows[index - 1], rows[index]) <= 0, label + " ordre canonique divergent");
    }
  }

  async function readColdProof(chunk) {
    const response = await fetch(coldUrl(chunk.relative_path), { cache: "no-store", credentials: "same-origin" });
    if (!response.ok) throw new Error("Chunk froid HTTP " + response.status);
    const text = await response.text();
    const sha256 = await sha256Hex(text);
    assert(sha256 === String(chunk.sha256), "SHA-256 public divergent");
    const lines = text.split("\n");
    if (lines.length && lines[lines.length - 1] === "") lines.pop();
    assert(lines.length === Number(chunk.row_count), "row_count public divergent");
    assert(lines.every(line => line.length > 0 && !line.endsWith("\r")), "JSONL public non canonique");
    let rows;
    try { rows = lines.map(line => JSON.parse(line)); }
    catch (_) { throw new Error("JSONL public illisible"); }
    assertRowsMatchChunk(rows, chunk, "Chunk public");
    return Object.freeze({ sha256, row_count: rows.length, first: evidenceMark(rows[0]), last: evidenceMark(rows[rows.length - 1]) });
  }

  async function readLocalProof(chunk) {
    const rows = await readLocalChunkRows(chunk);
    assertRowsMatchChunk(rows, chunk, "Chunk local");
    const sha256 = await sha256Hex(canonicalJsonl(rows));
    assert(sha256 === String(chunk.sha256), "SHA-256 local divergent");
    const ids = rows.map(row => String(row?.id || ""));
    assert(ids.every(Boolean) && new Set(ids).size === ids.length, "IDs locaux invalides ou dupliqués");
    return Object.freeze({ rows, ids, sha256, row_count: rows.length, first: evidenceMark(rows[0]), last: evidenceMark(rows[rows.length - 1]) });
  }

  async function verifyChunkBeforeDelete(candidate) {
    const manifest = await fetchManifest();
    const current = manifest.chunks.find(chunk => String(chunk?.relative_path || "") === String(candidate?.relative_path || ""));
    assert(current, "Chunk absent du manifest courant");
    assertVerifiedChunk(current, manifest.watermark);
    assert(sameChunk(current, candidate), "Métadonnées manifest modifiées depuis le preview");
    const cold = await readColdProof(current);
    const local = await readLocalProof(current);
    assert(cold.sha256 === local.sha256, "SHA public/local divergent");
    assert(compareMark(cold.first, local.first) === 0, "Première borne public/local divergente");
    assert(compareMark(cold.last, local.last) === 0, "Dernière borne public/local divergente");
    return Object.freeze({ chunk: current, cold, local });
  }

  async function deleteExactIds(ids) {
    const api = evidenceApi();
    const exactIds = Array.isArray(ids) ? ids.map(String) : [];
    assert(exactIds.length > 0 && new Set(exactIds).size === exactIds.length, "Liste de suppression exacte invalide");
    const db = await openExistingEvidenceDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(api.store, "readwrite");
        const store = tx.objectStore(api.store);
        exactIds.forEach(id => {
          const request = store.delete(id);
          request.onerror = () => {
            try { tx.abort(); } catch (_) {}
          };
        });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error || new Error("Suppression exacte refusée"));
        tx.onabort = () => reject(tx.error || new Error("Suppression exacte annulée"));
      });
    } finally {
      try { db.close(); } catch (_) {}
    }
    return exactIds.length;
  }

  async function assertIdsAbsent(ids) {
    const api = evidenceApi();
    const exactIds = Array.isArray(ids) ? ids.map(String) : [];
    const db = await openExistingEvidenceDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(api.store, "readonly");
        const store = tx.objectStore(api.store);
        let found = 0;
        exactIds.forEach(id => {
          const request = store.get(id);
          request.onsuccess = () => { if (request.result !== undefined) found += 1; };
        });
        tx.oncomplete = () => found ? reject(new Error(found + " ID(s) encore présents après suppression")) : resolve(true);
        tx.onerror = () => reject(tx.error || new Error("Contrôle post-suppression refusé"));
        tx.onabort = () => reject(tx.error || new Error("Contrôle post-suppression annulé"));
      });
    } finally {
      try { db.close(); } catch (_) {}
    }
  }

  function archiveLockOwner() {
    const lock = globalThis[ARCHIVE_LOCK_KEY];
    return lock && typeof lock === "object" ? String(lock.owner || "") : "";
  }

  function acquireRetentionLock() {
    const owner = archiveLockOwner();
    if (owner && owner !== RETENTION_LOCK_OWNER) throw new Error("Oracle Evidence déjà verrouillé · " + owner);
    globalThis[ARCHIVE_LOCK_KEY] = Object.freeze({ owner: RETENTION_LOCK_OWNER, since: Date.now() });
  }

  function releaseRetentionLock() {
    if (archiveLockOwner() === RETENTION_LOCK_OWNER) {
      try { delete globalThis[ARCHIVE_LOCK_KEY]; }
      catch (_) { globalThis[ARCHIVE_LOCK_KEY] = null; }
    }
  }

  function measuredMeanBytes() {
    try {
      const mean = Number(globalThis.AtlasOracleEvidenceHotWindowSizing406489?.state?.()?.result?.evidence?.mean_bytes);
      if (Number.isFinite(mean) && mean > 0) return { bytes: mean, source: "40.6.489" };
    } catch (_) {}
    return { bytes: MEASURED_MEAN_BYTES_FALLBACK, source: "mesure terrain 6.41 KiB" };
  }

  function fmtNumber(value) {
    return Math.max(0, Number(value) || 0).toLocaleString("fr-FR");
  }

  function fmtMiB(bytes) {
    return ((Number(bytes) || 0) / (1024 * 1024)).toFixed(2) + " MiB";
  }

  async function computePreview() {
    const manifest = await fetchManifest();
    const localRows = await countLocalRows();
    const maxRemovable = Math.max(0, localRows - HOT_MIN_ROWS);
    const candidates = [];
    let candidateRows = 0;
    const chunks = manifest.chunks.slice().sort((left, right) => compareMark(firstMark(left), firstMark(right)));
    for (const chunk of chunks) {
      if (candidateRows + Number(chunk.row_count) > maxRemovable) break;
      const local = await readLocalChunkRows(chunk);
      if (!local.length) continue;
      assertRowsMatchChunk(local, chunk, "Preview local");
      candidates.push({
        relative_path: String(chunk.relative_path),
        row_count: Number(chunk.row_count),
        sha256: String(chunk.sha256),
        first_t0: Number(chunk.first_t0),
        last_t0: Number(chunk.last_t0),
        first_id: String(chunk.first_id),
        last_id: String(chunk.last_id),
        status: "VERIFIED"
      });
      candidateRows += Number(chunk.row_count);
    }
    const mean = measuredMeanBytes();
    return Object.freeze({
      schema: "agent_crypto_oracle_verified_hot_window_preview_v1",
      build: BUILD,
      read_only: true,
      measured_at: new Date().toISOString(),
      local_rows: localRows,
      hot_min_rows: HOT_MIN_ROWS,
      max_removable_rows: maxRemovable,
      candidate_chunks: candidates.length,
      candidate_rows: candidateRows,
      planned_remaining_rows: localRows - candidateRows,
      estimated_reclaimable_bytes: candidateRows * mean.bytes,
      mean_bytes: mean.bytes,
      mean_source: mean.source,
      archived_rows: Number(manifest.archived_rows) || 0,
      verified_chunks: manifest.chunks.length,
      watermark: evidenceMark(manifest.watermark),
      candidates: Object.freeze(candidates)
    });
  }

  async function preview() {
    if (state.preview_running || state.running) return state.preview;
    state.preview_running = true;
    state.action = "PREVIEW_READ_ONLY";
    state.error = null;
    render();
    try {
      state.preview = await computePreview();
      state.action = "PREVIEW_READY";
      return state.preview;
    } catch (error) {
      state.preview = null;
      state.error = String(error?.message || error);
      state.action = "PREVIEW_STOPPED";
      throw error;
    } finally {
      state.preview_running = false;
      render();
    }
  }

  async function deleteVerifiedChunk(candidate) {
    const proof = await verifyChunkBeforeDelete(candidate);
    const before = await countLocalRows();
    assert(before - Number(proof.chunk.row_count) >= HOT_MIN_ROWS, "HOT 10 000 serait franchi");

    // Re-read and re-hash the local rows immediately before the exact-key transaction.
    const finalLocal = await readLocalProof(proof.chunk);
    assert(finalLocal.sha256 === proof.local.sha256, "Chunk local modifié entre preuve et suppression");
    assert(finalLocal.ids.length === Number(proof.chunk.row_count), "Liste locale finale incomplète");

    await deleteExactIds(finalLocal.ids);
    await assertIdsAbsent(finalLocal.ids);
    const remaining = await countLocalRows();
    assert(remaining >= HOT_MIN_ROWS, "Invariant HOT 10 000 violé après transaction");

    return Object.freeze({
      schema: "agent_crypto_oracle_verified_retention_chunk_receipt_v1",
      build: BUILD,
      status: "CHUNK_RETENTION_PASS",
      relative_path: String(proof.chunk.relative_path),
      row_count: Number(proof.chunk.row_count),
      sha256_manifest: String(proof.chunk.sha256),
      sha256_public: String(proof.cold.sha256),
      sha256_local: String(finalLocal.sha256),
      first_t0: Number(proof.chunk.first_t0),
      last_t0: Number(proof.chunk.last_t0),
      first_id: String(proof.chunk.first_id),
      last_id: String(proof.chunk.last_id),
      rows_before: before,
      rows_remaining: remaining,
      deleted_ids_absent: true,
      completed_at: new Date().toISOString()
    });
  }

  function operatorConfirm(message) {
    if (typeof globalThis.confirm !== "function") throw new Error("Confirmation opérateur indisponible");
    return globalThis.confirm(message) === true;
  }

  async function refreshOwnerCache() {
    try {
      const api = evidenceApi();
      if (typeof api.list === "function") await api.list({ fresh: true });
      if (typeof api.refresh === "function") await api.refresh();
    } catch (_) {}
  }

  async function refreshPreviewPreservingAction(action) {
    try { state.preview = await computePreview(); }
    catch (error) { state.error = "Preview après suppression · " + String(error?.message || error); }
    state.action = action;
    render();
  }

  async function runCanary() {
    if (state.canary_pass) return snapshot();
    if (state.running) return snapshot();
    state.error = null;
    state.final_receipt = null;
    state.action = "CANARY_PREVIEW_REFRESH";
    render();
    try {
      state.preview = await computePreview();
      const candidate = state.preview.candidates.find(chunk => Number(chunk.row_count) <= CANARY_MAX_ROWS);
      assert(candidate, "Aucun chunk VERIFIED complet ≤ 500 compatible avec HOT 10 000");
      const confirmed = operatorConfirm(
        "CANARI ORACLE EVIDENCE 40.6.490\n\n" +
        "Relire et prouver le chunk froid + local, puis retirer uniquement ce chunk de Firefox ?\n" +
        candidate.relative_path + "\n" + candidate.row_count + " Evidence · HOT minimum 10 000"
      );
      if (!confirmed) {
        state.action = "CANARY_CANCELLED";
        render();
        return snapshot();
      }
      acquireRetentionLock();
      state.running = true;
      state.action = "CANARY_VERIFYING_GITHUB_AND_LOCAL";
      render();
      const receipt = await deleteVerifiedChunk(candidate);
      state.canary_pass = true;
      state.canary_receipt = Object.freeze({ ...receipt, status: "RETENTION_CANARY_PASS" });
      state.last_chunk_receipt = state.canary_receipt;
      state.removed_rows += receipt.row_count;
      state.removed_chunks += 1;
      await refreshPreviewPreservingAction("RETENTION_CANARY_PASS");
      return snapshot();
    } catch (error) {
      state.canary_pass = false;
      state.canary_receipt = null;
      state.error = String(error?.message || error);
      state.action = "CANARY_STOPPED";
      render();
      throw error;
    } finally {
      state.running = false;
      releaseRetentionLock();
      render();
    }
  }

  async function rerunSizingProbe() {
    const probe = globalThis.AtlasOracleEvidenceHotWindowSizing406489;
    if (!probe?.measure) throw new Error("Sonde READ ONLY 40.6.489 indisponible");
    const result = await probe.measure();
    state.post_cleanup_probe = Object.freeze({
      build: "40.6.489",
      read_only: true,
      measured_at: result?.measured_at || null,
      local_rows: Number(result?.evidence?.local_rows) || 0,
      mean_bytes: Number(result?.evidence?.mean_bytes) || 0,
      estimated_payload_bytes: Number(result?.evidence?.estimated_payload_bytes) || 0
    });
    return state.post_cleanup_probe;
  }

  async function continueToHotWindow() {
    assert(state.canary_pass === true && state.canary_receipt?.status === "RETENTION_CANARY_PASS", "Canari PASS obligatoire");
    if (state.running) return snapshot();
    const confirmed = operatorConfirm(
      "CONTINUER ORACLE EVIDENCE 40.6.490\n\n" +
      "Traiter les chunks VERIFIED un par un sans jamais descendre sous 10 000 Evidence locales ?\n" +
      "Arrêt immédiat au premier écart."
    );
    if (!confirmed) {
      state.action = "CONTINUATION_CANCELLED";
      render();
      return snapshot();
    }

    acquireRetentionLock();
    state.running = true;
    state.error = null;
    state.final_receipt = null;
    state.action = "HOT_RETENTION_RUNNING";
    render();
    try {
      const plan = await computePreview();
      state.preview = plan;
      for (const candidate of plan.candidates) {
        const current = await countLocalRows();
        if (current <= HOT_MIN_ROWS || current - Number(candidate.row_count) < HOT_MIN_ROWS) break;
        state.action = "VERIFYING_NEXT_CHUNK";
        render();
        const receipt = await deleteVerifiedChunk(candidate);
        state.last_chunk_receipt = receipt;
        state.removed_rows += receipt.row_count;
        state.removed_chunks += 1;
        state.action = "RETENTION_CHUNK_PASS";
        render();
      }

      const remaining = await countLocalRows();
      assert(remaining >= HOT_MIN_ROWS, "Invariant final HOT 10 000 violé");
      const mean = measuredMeanBytes();
      state.final_receipt = Object.freeze({
        schema: "agent_crypto_oracle_verified_hot_window_receipt_v1",
        build: BUILD,
        status: "HOT_RETENTION_COMPLETE",
        rows_deleted: state.removed_rows,
        rows_remaining: remaining,
        chunks_removed_locally: state.removed_chunks,
        estimated_reclaimed_bytes: state.removed_rows * mean.bytes,
        hot_min_rows: HOT_MIN_ROWS,
        completed_at: new Date().toISOString()
      });
      await refreshOwnerCache();
      await refreshPreviewPreservingAction("HOT_RETENTION_COMPLETE");
      try { await rerunSizingProbe(); }
      catch (error) { state.error = "HOT_RETENTION_COMPLETE · sonde 40.6.489: " + String(error?.message || error); }
      state.action = "HOT_RETENTION_COMPLETE";
      render();
      return snapshot();
    } catch (error) {
      state.error = String(error?.message || error);
      state.action = "HOT_RETENTION_STOPPED";
      render();
      throw error;
    } finally {
      state.running = false;
      releaseRetentionLock();
      render();
    }
  }

  function snapshot() {
    return JSON.parse(JSON.stringify({
      build: BUILD,
      mounted: state.mounted,
      preview_started: state.preview_started,
      preview_running: state.preview_running,
      running: state.running,
      action: state.action,
      error: state.error,
      preview: state.preview,
      canary_pass: state.canary_pass,
      canary_receipt: state.canary_receipt,
      removed_rows: state.removed_rows,
      removed_chunks: state.removed_chunks,
      last_chunk_receipt: state.last_chunk_receipt,
      final_receipt: state.final_receipt,
      post_cleanup_probe: state.post_cleanup_probe,
      archive_lock_owner: archiveLockOwner(),
      hot_min_rows: HOT_MIN_ROWS,
      canary_max_rows: CANARY_MAX_ROWS,
      automatic_delete: false
    }));
  }

  function ensurePanel() {
    if (document.getElementById("oracleEvidenceVerifiedHotWindow406490")) return true;
    const sizing = document.getElementById("oracleEvidenceHotWindowSizing406489");
    const root = document.getElementById("oracle-evidence-explorer");
    if (!sizing && !root) return false;

    const panel = document.createElement("section");
    panel.id = "oracleEvidenceVerifiedHotWindow406490";
    panel.setAttribute("aria-label", "Oracle Evidence Verified Hot Window 10000 40.6.490");
    panel.style.cssText = "margin:8px 0 12px;padding:10px 12px;border:1px solid rgba(120,255,196,.34);border-radius:10px;background:rgba(5,25,23,.78);display:grid;gap:9px";
    panel.innerHTML =
      '<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">' +
        '<div><strong style="color:#9dffd1">ORACLE EVIDENCE · VERIFIED HOT WINDOW 10 000 · 40.6.490</strong><br>' +
        '<small>Preview automatique READ ONLY · suppression uniquement après action opérateur</small></div>' +
        '<span id="oracleHot490State" style="font-weight:800;color:#9dffd1">IDLE</span>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:7px;font-size:12px">' +
        '<span>Lignes locales <b id="oracleHot490Local">—</b></span>' +
        '<span>Budget maximal <b id="oracleHot490Budget">—</b></span>' +
        '<span>Chunks candidats <b id="oracleHot490Chunks">—</b></span>' +
        '<span>Lignes candidates <b id="oracleHot490Rows">—</b></span>' +
        '<span>Prévu après rétention <b id="oracleHot490Remaining">—</b></span>' +
        '<span>Estimation libérable <b id="oracleHot490MiB">—</b></span>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button type="button" id="btnOracleHot490Canary">Tester 1 chunk · max 500</button>' +
        '<button type="button" id="btnOracleHot490Continue" disabled>Continuer jusqu’à HOT 10 000</button>' +
      '</div>' +
      '<pre id="oracleHot490Receipt" style="margin:0;white-space:pre-wrap;font:11px/1.45 ui-monospace,monospace;color:#c9ffe5">PREVIEW en attente · aucune suppression automatique.</pre>';

    if (sizing?.parentNode) sizing.parentNode.insertBefore(panel, sizing.nextSibling);
    else root.prepend(panel);

    document.getElementById("btnOracleHot490Canary")?.addEventListener("click", () => void runCanary().catch(() => {}));
    document.getElementById("btnOracleHot490Continue")?.addEventListener("click", () => void continueToHotWindow().catch(() => {}));
    state.mounted = true;
    render();

    if (!state.preview_started) {
      state.preview_started = true;
      const startPreview = () => void preview().catch(() => {});
      if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => requestAnimationFrame(startPreview));
      else Promise.resolve().then(startPreview);
    }
    return true;
  }

  function render() {
    const set = (id, value) => {
      const node = document.getElementById(id);
      if (node) node.textContent = String(value);
    };
    set("oracleHot490State", state.error && state.action !== "HOT_RETENTION_COMPLETE" ? "STOP" : state.action);
    const previewState = state.preview;
    if (previewState) {
      set("oracleHot490Local", fmtNumber(previewState.local_rows));
      set("oracleHot490Budget", fmtNumber(previewState.max_removable_rows));
      set("oracleHot490Chunks", fmtNumber(previewState.candidate_chunks));
      set("oracleHot490Rows", fmtNumber(previewState.candidate_rows));
      set("oracleHot490Remaining", fmtNumber(previewState.planned_remaining_rows));
      set("oracleHot490MiB", fmtMiB(previewState.estimated_reclaimable_bytes));
    }

    const canary = document.getElementById("btnOracleHot490Canary");
    const continuation = document.getElementById("btnOracleHot490Continue");
    if (canary) canary.disabled = state.running || state.preview_running || state.canary_pass;
    if (continuation) continuation.disabled = state.running || state.preview_running || !state.canary_pass;

    const receipt = document.getElementById("oracleHot490Receipt");
    if (!receipt) return;
    if (state.action === "HOT_RETENTION_COMPLETE" && state.final_receipt) {
      const row = state.final_receipt;
      receipt.textContent =
        "HOT_RETENTION_COMPLETE\n" +
        "Lignes supprimées : " + fmtNumber(row.rows_deleted) + "\n" +
        "Lignes restantes : " + fmtNumber(row.rows_remaining) + "\n" +
        "Chunks retirés localement : " + fmtNumber(row.chunks_removed_locally) + "\n" +
        "Estimation récupérée : " + fmtMiB(row.estimated_reclaimed_bytes) + "\n" +
        (state.post_cleanup_probe ? "Sonde 40.6.489 relancée : " + fmtNumber(state.post_cleanup_probe.local_rows) + " lignes" : "Sonde 40.6.489 : en attente") +
        (state.error ? "\nNote : " + state.error : "");
      return;
    }
    if (state.canary_pass && state.canary_receipt) {
      receipt.textContent =
        "RETENTION_CANARY_PASS\n" +
        state.canary_receipt.relative_path + "\n" +
        fmtNumber(state.canary_receipt.row_count) + " lignes supprimées · " + fmtNumber(state.canary_receipt.rows_remaining) + " restantes\n" +
        "SHA local = SHA public = SHA manifest\n" +
        (state.error ? "Note : " + state.error : "Continuation déverrouillée.");
      return;
    }
    if (state.error) {
      receipt.textContent = "STOP · " + state.error + "\nAucun chunk suivant ne sera traité.";
      return;
    }
    receipt.textContent = previewState
      ? "PREVIEW READ ONLY · " + fmtNumber(previewState.candidate_rows) + " lignes dans " + fmtNumber(previewState.candidate_chunks) + " chunks VERIFIED complets · estimation " + fmtMiB(previewState.estimated_reclaimable_bytes) + "."
      : "PREVIEW en attente · aucune suppression automatique.";
  }

  function mount() {
    return ensurePanel();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
  window.addEventListener("agent-crypto:postboot-runtime-ready", mount, { once: true });

  globalThis.AtlasOracleEvidenceVerifiedHotWindow406490 = Object.freeze({
    build: BUILD,
    role: "OPERATOR_CONFIRMED_VERIFIED_HOT_WINDOW_RETENTION",
    preview,
    run_canary: runCanary,
    continue_to_hot_window: continueToHotWindow,
    state: snapshot,
    mount,
    hot_min_rows: HOT_MIN_ROWS,
    canary_max_rows: CANARY_MAX_ROWS,
    manifest_verified_required: true,
    public_sha256_required: true,
    local_sha256_required: true,
    exact_boundaries_required: true,
    complete_chunks_only: true,
    canary_required: true,
    operator_confirmation_required: true,
    automatic_preview: true,
    automatic_delete: false,
    delete_all_api_exposed: false,
    storage_schema_changed: false,
    cold_archive_modified: false,
    browser_github_write: false,
    oracle_math_changed: false,
    strategy_a_changed: false,
    market_core_changed: false,
    real_order: false,
    wallet_access: false
  });
})();
