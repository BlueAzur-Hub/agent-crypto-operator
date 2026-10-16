(() => {
  "use strict";

  /* 40.6.580 — transposition fidèle des options Lecture Technique Administrator.
     Même bibliothèque, mêmes périodes, même stockage privé local.
     Adaptation unique : chemins assets depuis /trader/. */

  const BUILD = "40.6.586";
  const BASE = "https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/assets/images/technical-reading/";
  const DEFAULT_IMAGE = "https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/assets/images/technical-reading/admin-technical-reading-default.png";
  const DB_NAME = "agent_crypto_private_visuals";
  const DB_VERSION = 1;
  const STORE = "visual_slots";
  const TECH_KEY = "technical-reading";

  const THEMES = Object.freeze({
    dawn:  Object.freeze({ label:"Aube", file:"technical-aube-aerith8.png" }),
    day:   Object.freeze({ label:"Jour", file:"technical-jour-aerith8.png" }),
    dusk:  Object.freeze({ label:"Soir", file:"technical-soir-aerith9.png" }),
    night: Object.freeze({ label:"Nuit", file:"technical-nuit-cyber.png" }),
    lunar: Object.freeze({ label:"Lunaire", file:"technical-lunaire-aerith9-mirror.png" })
  });

  const RANDOM_LIBRARY = Object.freeze([
    {file:"technical-random-01.png",label:"Cartographie circulaire",x:46,y:46},
    {file:"technical-random-02.png",label:"Archives oubliées",x:50,y:40},
    {file:"technical-random-03.png",label:"Laboratoire sous les étoiles",x:50,y:44},
    {file:"technical-random-04.png",label:"Théâtre orbital",x:43,y:48},
    {file:"technical-random-05.png",label:"Cartographe céleste",x:50,y:54},
    {file:"technical-random-06.png",label:"Jardin astral",x:42,y:43},
    {file:"technical-random-07.png",label:"Matrice de réflexion",x:50,y:41},
    {file:"technical-random-08.png",label:"Observatoire doré",x:50,y:38},
    {file:"technical-random-09.png",label:"Archives de réflexion",x:50,y:41},
    {file:"technical-random-10.png",label:"Aether au bureau",x:50,y:44},
    {file:"technical-random-11.png",label:"Dualité lunaire et solaire",x:50,y:50},
    {file:"technical-random-12.png",label:"Codex de lumière",x:50,y:50},
    {file:"technical-random-13.png",label:"Vortex cosmique",x:50,y:50},
    {file:"technical-random-14.png",label:"Gardien du seuil",x:50,y:50},
    {file:"technical-random-15.png",label:"Deux polarités",x:50,y:50},
    {file:"technical-random-16.png",label:"Axe des deux mondes",x:50,y:50},
    {file:"technical-random-17.png",label:"Masculin solaire",x:50,y:50},
    {file:"technical-random-18.png",label:"Synthèse absolue",x:50,y:50},
    {file:"technical-random-19.png",label:"Synthèse fidèle",x:50,y:50},
    {file:"technical-random-20.png",label:"Masculin solaire fidèle",x:50,y:50},
    {file:"technical-random-21.png",label:"Origines d’Aerith",x:50,y:50},
    {file:"technical-random-22.png",label:"Vers la Cité d’Émeraude",x:50,y:50}
  ].map(Object.freeze));

  const FRAMING = Object.freeze({
    dawn:{x:52,y:40}, day:{x:52,y:42}, dusk:{x:52,y:42}, night:{x:50,y:42}, lunar:{x:50,y:38}
  });

  let mode = "auto";
  let timer = 0;
  let privateOverride = false;
  let objectUrl = "";
  let lastRandomIndex = -1;

  const panel = () => document.getElementById("detailPanel");
  const host = () => panel()?.querySelector(".detail-project-visual");
  const image = () => host()?.querySelector(".admin-tech-portrait-r3");

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath:"id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error("IndexedDB unavailable"));
    });
  }

  async function readPrivate() {
    const db = await openDb();
    try {
      return await new Promise((resolve, reject) => {
        const req = db.transaction(STORE, "readonly").objectStore(STORE).get(TECH_KEY);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } finally { db.close(); }
  }

  async function writePrivate(file) {
    const db = await openDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.objectStore(STORE).put({
          id: TECH_KEY,
          blob: file,
          mime: file.type,
          name: file.name,
          framing:{x:50,y:35},
          updated_at:new Date().toISOString()
        });
      });
      return true;
    } finally { db.close(); }
  }

  async function clearPrivate() {
    const db = await openDb();
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.objectStore(STORE).delete(TECH_KEY);
      });
    } finally { db.close(); }
  }

  function ensureImage() {
    const h = host();
    if (!h) return null;
    h.classList.add("admin-tech-r3");
    h.setAttribute("role","button");
    h.setAttribute("tabindex","0");
    h.setAttribute("aria-label","Changer l’image de Lecture technique");
    let img = image();
    if (!img) {
      img = document.createElement("img");
      img.className = "admin-tech-portrait-r3";
      img.alt = "";
      img.decoding = "async";
      img.src = DEFAULT_IMAGE;
      h.prepend(img);
    }
    return img;
  }

  function setFraming(framing) {
    const p = panel();
    if (!p) return;
    p.style.setProperty("--admin-tech-x", `${Number(framing?.x ?? 50)}%`);
    p.style.setProperty("--admin-tech-y", `${Number(framing?.y ?? 12)}%`);
    p.style.setProperty("--admin-tech-scale","1");
  }

  function minuteOfDay(d = new Date()) { return d.getHours()*60 + d.getMinutes(); }

  function autoTheme(d = new Date()) {
    try {
      const resolved = globalThis.AtlasCelestialClock?.phaseTheme?.(d);
      if (THEMES[resolved]) return resolved;
    } catch (_) {}
    const m = minuteOfDay(d);
    if (m >= 330 && m < 540) return "dawn";
    if (m >= 540 && m < 1050) return "day";
    if (m >= 1050 && m < 1290) return "dusk";
    if (m >= 1290 || m < 30) return "night";
    return "lunar";
  }

  function nextBoundaryDelay() {
    const now = new Date();
    const m = minuteOfDay(now);
    const marks = [30,330,540,1050,1290];
    let target = marks.find(x => x > m), add = 0;
    if (target == null) { target = marks[0]; add = 1; }
    const d = new Date(now);
    d.setDate(d.getDate()+add);
    d.setHours(Math.floor(target/60),target%60,1,0);
    return Math.max(1000,d.getTime()-now.getTime());
  }

  function currentTheme() {
    return mode === "auto" ? autoTheme() : (THEMES[mode] ? mode : "lunar");
  }

  function status(label) {
    const bar = panel()?.querySelector(".atlas-tech-static-toolbar");
    if (!bar) return;
    bar.dataset.techStatus = label;
    bar.setAttribute("aria-label", "Lecture technique · " + label);
  }

  function revokeObjectUrl() {
    if (!objectUrl) return;
    try { URL.revokeObjectURL(objectUrl); } catch (_) {}
    objectUrl = "";
  }

  function applyAsset(src, framing, label) {
    const img = ensureImage();
    if (!img) return false;
    revokeObjectUrl();
    // Between the code commit and the owner's manual upload of the original
    // binary asset, keep RND usable instead of displaying a broken image.
    img.onerror = src === BASE + "technical-random-22.png"
      ? () => {
          img.onerror = null;
          img.src = BASE + "technical-random-21.png";
          status("RND 22 en attente d’image · repli sur Origines d’Aerith");
        }
      : null;
    img.src = src;
    setFraming(framing);
    status(label);
    return true;
  }

  function applyPrivate(record) {
    const img = ensureImage();
    if (!img || !(record?.blob instanceof Blob)) return false;
    revokeObjectUrl();
    objectUrl = URL.createObjectURL(record.blob);
    img.src = objectUrl;
    setFraming(record.framing || {x:50,y:35});
    privateOverride = true;
    panel().dataset.techPrivate = "1";
    status("Image privée locale");
    return true;
  }

  async function applyTheme() {
    if (privateOverride || mode === "random") return true;
    const theme = currentTheme();
    const item = THEMES[theme];
    panel().dataset.techTheme = theme;
    panel().dataset.techPrivate = "0";
    return applyAsset(BASE + item.file, FRAMING[theme], (mode === "auto" ? "Auto · " : "") + item.label);
  }

  function nextRandomIndex() {
    const total = RANDOM_LIBRARY.length;
    let idx = Math.floor(Math.random()*total);
    try {
      const a = new Uint32Array(1);
      crypto.getRandomValues(a);
      idx = a[0] % total;
    } catch (_) {}
    if (idx === lastRandomIndex) idx = (idx + 1) % total;
    lastRandomIndex = idx;
    return idx;
  }

  async function showRandom() {
    await clearPrivate().catch(()=>{});
    privateOverride = false;
    mode = "random";
    const item = RANDOM_LIBRARY[nextRandomIndex()];
    panel().dataset.techTheme = "random";
    panel().dataset.techPrivate = "0";
    const ok = applyAsset(BASE + item.file,{x:item.x,y:item.y},`Random ${lastRandomIndex+1}/${RANDOM_LIBRARY.length} · ${item.label}`);
    syncButtons();
    schedule();
    return ok;
  }

  function syncButtons() {
    const bar = panel()?.querySelector(".atlas-tech-static-toolbar");
    if (!bar) return;
    bar.querySelectorAll("[data-tech-static-mode]").forEach(b => {
      b.classList.toggle("is-active", !privateOverride && mode !== "random" && b.dataset.techStaticMode === mode);
    });
    bar.querySelector("[data-tech-random]")?.classList.toggle("is-active", mode === "random");
  }

  function schedule() {
    if (timer) clearTimeout(timer);
    timer = 0;
    if (mode !== "auto" || privateOverride) return;
    timer = setTimeout(async () => {
      await applyTheme();
      syncButtons();
      schedule();
    }, nextBoundaryDelay());
  }

  function ensurePicker() {
    let input = document.getElementById("traderTechnicalPrivateImageInput");
    if (input) return input;
    input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.hidden = true;
    input.id = "traderTechnicalPrivateImageInput";
    document.body.appendChild(input);
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      input.value = "";
      if (!file || !String(file.type || "").startsWith("image/")) return;
      const ok = await writePrivate(file).catch(() => false);
      if (ok) applyPrivate({blob:file,framing:{x:50,y:35}});
      syncButtons();
      schedule();
    });
    return input;
  }

  function ensureToolbar() {
    const p = panel(), h = host();
    if (!p || !h) return null;
    p.classList.add("atlas-tech-static-cycle","atlas-tech-letterbox-fill-40230","atlas-tech-frame-lock-40259","atlas-classic-web-tech-40261");
    h.setAttribute("aria-label","Cliquer pour choisir une image privée locale pour Lecture technique");
    h.setAttribute("title","Cliquer pour choisir une image privée locale");
    let bar = p.querySelector(".atlas-tech-static-toolbar");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "atlas-tech-static-toolbar";
      bar.setAttribute("aria-label","Thème temporel de Lecture technique");
      bar.innerHTML =
        '<button type="button" data-tech-static-mode="auto">AUTO</button>'+
        '<button type="button" data-tech-static-mode="dawn">AUBE</button>'+
        '<button type="button" data-tech-static-mode="day">JOUR</button>'+
        '<button type="button" data-tech-static-mode="dusk">SOIR</button>'+
        '<button type="button" data-tech-static-mode="night">NUIT</button>'+
        '<button type="button" data-tech-static-mode="lunar">LUNE</button>'+
        '<button type="button" data-tech-random="1" aria-label="Image aléatoire">RND</button>';
      h.before(bar);
      bar.addEventListener("click", async event => {
        const rnd = event.target.closest("[data-tech-random]");
        if (rnd) return void showRandom();
        const button = event.target.closest("[data-tech-static-mode]");
        if (!button) return;
        await clearPrivate().catch(()=>{});
        privateOverride = false;
        mode = button.dataset.techStaticMode || "auto";
        panel().dataset.techPrivate = "0";
        await applyTheme();
        syncButtons();
        schedule();
      });
    }

    let tint = h.querySelector(".atlas-tech-static-tint");
    if (!tint) {
      tint = document.createElement("span");
      tint.className = "atlas-tech-static-tint";
      tint.setAttribute("aria-hidden","true");
      h.appendChild(tint);
    }

    if (h.dataset.traderPrivatePickerBound !== "1") {
      h.dataset.traderPrivatePickerBound = "1";
      const open = event => {
        if (event?.target?.closest?.("button")) return;
        ensurePicker().click();
      };
      h.addEventListener("click",open);
      h.addEventListener("keydown",event=>{
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          ensurePicker().click();
        }
      });
    }
    return bar;
  }

  async function start() {
    if (!panel() || !host()) return false;
    ensureImage();
    ensureToolbar();
    const saved = await readPrivate().catch(()=>null);
    if (saved?.blob) applyPrivate(saved);
    else await applyTheme();
    syncButtons();
    schedule();
    document.documentElement.dataset.traderTechnicalReading = "mounted";
    return true;
  }

  globalThis.AgentCryptoTraderTechnicalReading = Object.freeze({
    build: BUILD,
    start,
    mode: () => mode,
    theme: () => currentTheme(),
    random_count: RANDOM_LIBRARY.length,
    local_private_image: true,
    private_store: DB_NAME,
    time_schedule: Object.freeze({
      dawn:"05:30-09:00",
      day:"09:00-17:30",
      dusk:"17:30-21:30",
      night:"21:30-00:30",
      lunar:"00:30-05:30"
    }),
    read_only:true
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",()=>void start(),{once:true});
  else void start();
})();
