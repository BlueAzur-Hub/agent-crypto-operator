(() => {
  "use strict";

  /* 39.4.5R3 — VISUAL COMPOSITION LOCK
     Visual composition only. No fetch, timer, WebSocket, Market write,
     Atlas launch, NØX launch, Aerith launch or Memory write. */

  const BUILD = "39.4.5R3";
  const DB_NAME = "agent_crypto_private_visuals";
  const DB_VERSION = 1;
  const STORE = "visual_slots";
  const TECH_KEY = "technical-reading";
  const DEFAULT_TECH = "./assets/visual/admin-technical-reading-default.png";
  const CLASSIC_MISSIONS = "./assets/images/missions_de_vie_constellation_bg.png";
  let techObjectUrl = null;

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, {keyPath:"id"});
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error("IndexedDB unavailable"));
    });
  }

  async function readSlot(id) {
    const db = await openDb();
    try {
      return await new Promise((resolve, reject) => {
        const req = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error || new Error("Private visual read failed"));
      });
    } finally { db.close(); }
  }

  async function writeSlot(record) {
    const db = await openDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error("Private visual write failed"));
        tx.objectStore(STORE).put(record);
      });
      return true;
    } finally { db.close(); }
  }

  async function deleteSlot(id) {
    const db = await openDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error("Private visual delete failed"));
        tx.objectStore(STORE).delete(id);
      });
    } finally { db.close(); }
  }

  function techHost() {
    return document.querySelector("#detailPanel .detail-project-visual");
  }

  function ensureTechImg() {
    const host = techHost();
    if (!host) return null;
    host.classList.add("admin-tech-r3");
    host.removeAttribute("aria-hidden");
    host.setAttribute("role", "button");
    host.setAttribute("tabindex", "0");
    host.setAttribute("aria-label", "Changer l’image de Lecture technique");

    let img = host.querySelector(".admin-tech-portrait-r3");
    if (!img) {
      img = document.createElement("img");
      img.className = "admin-tech-portrait-r3";
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      img.decoding = "async";
      img.src = DEFAULT_TECH;
      host.prepend(img);
    }

    let reset = host.querySelector(".admin-tech-reset-r3");
    if (!reset) {
      reset = document.createElement("button");
      reset.type = "button";
      reset.className = "admin-tech-reset-r3";
      reset.textContent = "↺ défaut";
      reset.title = "Revenir à l’image par défaut";
      reset.addEventListener("click", async event => {
        event.preventDefault();
        event.stopPropagation();
        await deleteSlot(TECH_KEY).catch(() => null);
        setTechImage(null, {x:50,y:12});
      });
      host.appendChild(reset);
    }
    return img;
  }

  function setTechImage(blob = null, framing = null) {
    const host = techHost();
    const img = ensureTechImg();
    if (!host || !img) return;
    if (techObjectUrl) {
      URL.revokeObjectURL(techObjectUrl);
      techObjectUrl = null;
    }
    if (blob instanceof Blob) {
      techObjectUrl = URL.createObjectURL(blob);
      img.src = techObjectUrl;
    } else {
      img.src = DEFAULT_TECH;
    }
    host.style.setProperty("--admin-tech-x", `${Number(framing?.x ?? 50)}%`);
    host.style.setProperty("--admin-tech-y", `${Number(framing?.y ?? 12)}%`);
  }

  function ensurePicker() {
    let input = document.getElementById("adminTechnicalPrivateImageInput");
    if (input) return input;
    input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.hidden = true;
    input.id = "adminTechnicalPrivateImageInput";
    document.body.appendChild(input);
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      input.value = "";
      if (!file || !String(file.type || "").startsWith("image/")) return;
      const record = {
        id: TECH_KEY,
        blob: file,
        mime: file.type,
        name: file.name,
        framing: {x:50,y:12},
        updated_at: new Date().toISOString()
      };
      const ok = await writeSlot(record).catch(() => false);
      if (ok) setTechImage(file, record.framing);
    });
    return input;
  }

  async function setupTechnicalReading() {
    const host = techHost();
    if (!host) return false;
    ensureTechImg();
    if (host.dataset.adminPrivateVisualBoundR3 !== "1") {
      host.dataset.adminPrivateVisualBoundR3 = "1";
      const open = event => {
        if (event?.target?.closest?.(".admin-tech-reset-r3")) return;
        ensurePicker().click();
      };
      host.addEventListener("click", open);
      host.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          ensurePicker().click();
        }
      });
    }
    const saved = await readSlot(TECH_KEY).catch(() => null);
    if (saved?.blob) setTechImage(saved.blob, saved.framing);
    else setTechImage(null, {x:50,y:12});
    return true;
  }

  function removeR2Artifacts() {
    document.querySelectorAll(".admin-private-visual-tools,.admin-visual-strip,.admin-visual-command-hero,.admin-visual-summary-thumb")
      .forEach(node => node.remove());
  }

  function familyEmblem(selector, src, key) {
    const host = document.querySelector(selector);
    if (!host) return false;
    host.classList.add("admin-family-emblem-host-r3");
    if (host.querySelector(`.admin-family-emblem-r3[data-for="${key}"]`)) return true;
    const img = document.createElement("img");
    img.className = "admin-family-emblem-r3";
    img.dataset.for = key;
    img.src = src;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.loading = "lazy";
    img.decoding = "async";
    host.appendChild(img);
    return true;
  }

  function sourceSummaryEmblem() {
    const summary = document.querySelector("#liveSourcesCollapse > summary.atlas-collapse-summary");
    if (!summary) return false;
    summary.classList.add("admin-summary-emblem-host-r3");
    if (summary.querySelector('.admin-summary-emblem-r3[data-for="sources"]')) return true;
    const img = document.createElement("img");
    img.className = "admin-summary-emblem-r3";
    img.dataset.for = "sources";
    img.src = "./assets/visual/admin-sources-archive.png";
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.loading = "lazy";
    img.decoding = "async";
    summary.appendChild(img);
    return true;
  }

  function analyticalEmblem() {
    const section = document.getElementById("atlasAnalyticalMemory394");
    if (!section) return false;
    section.classList.add("admin-analytical-emblem-host-r3");
    if (section.querySelector(".admin-analytical-emblem-r3")) return true;
    const img = document.createElement("img");
    img.className = "admin-analytical-emblem-r3";
    img.src = "./assets/visual/admin-analytical-memory.png";
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.loading = "lazy";
    img.decoding = "async";
    section.prepend(img);
    return true;
  }

  function restoreClassicMissionsBackground() {
    const img = document.querySelector("#missions-vie .life-missions-atmosphere");
    if (!img) return false;
    if (img.getAttribute("src") !== CLASSIC_MISSIONS) img.setAttribute("src", CLASSIC_MISSIONS);
    return true;
  }

  function commandObservatory() {
    const drawer = document.getElementById("atlasAdminCenterDrawer");
    if (!drawer) return false;
    drawer.classList.add("admin-command-observatory-r3");
    return true;
  }

  function decorate() {
    removeR2Artifacts();
    const system = familyEmblem(".atlas-layout-family-system", "./assets/visual/admin-system-core.png", "system");
    const projects = familyEmblem(".atlas-layout-family-operations", "./assets/visual/admin-projects-orchestration.png", "projects");
    const sources = sourceSummaryEmblem();
    const analytical = analyticalEmblem();
    const missions = restoreClassicMissionsBackground();
    const command = commandObservatory();
    return system && projects && sources && analytical && missions && command;
  }

  function start() {
    void setupTechnicalReading();
    const done = decorate();
    if (!done) {
      const observer = new MutationObserver(() => {
        void setupTechnicalReading();
        if (decorate()) observer.disconnect();
      });
      observer.observe(document.body, {childList:true, subtree:true});
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, {once:true});
  else start();

  try {
    globalThis.__AGENT_CRYPTO_ADMIN_VISUAL_3945R3__ = Object.freeze({
      build: BUILD,
      visual_only: true,
      images_in_patch: false,
      assets_preinstalled: true,
      classic_missions_background: true,
      technical_portrait_explicit_img: true,
      scattered_summary_icons: false,
      core_rewrite: false,
      market_memory_write: false,
      new_fetch: false,
      new_timer: false,
      new_websocket: false,
      starts_atlas: false
    });
  } catch (_) {}
})();
