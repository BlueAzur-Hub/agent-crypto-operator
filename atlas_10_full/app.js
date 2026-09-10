(() => {
  "use strict";

  const DATA = window.AERITH_UNIFIED_DATA;
  const FLOWER = window.AERITH_FLOWER_GIRLS;
  if (!DATA) throw new Error("forge-data.js introuvable.");
  const CANONICAL_PROFILE_IDS = new Set(["seven", "creator", "aerithcrypto", "atlas"]);

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const encoder = new TextEncoder();
  const STORAGE_KEY = "aerith-forge-v3-3r7-guided-pack";
  const VIEW_MODE = new URLSearchParams(window.location.search).get("view") || "full";
  document.body.dataset.view = VIEW_MODE === "atelier" ? "atelier" : "full";
  const LEGACY_STORAGE_KEYS = ["aerith-forge-creatrice-v2-alpha6", "aerith-forge-creatrice-v2-alpha5"];

  const STEPS = [
    ["01", "Intention", "Choisir une identité canonique ou ouvrir une nouvelle voie."],
    ["02", "Mission", "Donner un centre, une fonction et une destination utile."],
    ["03", "Multi-agents", "Composer une constellation d’agents spécialisés."],
    ["04", "Héritages", "Relier les couches Seven et les savoirs utiles."],
    ["05", "Persona", "Donner une voix, des modes et un rythme de travail."],
    ["06", "Sources", "Charger un pack complet ou les sources canoniques."],
    ["07", "Core + Persona", "Vérifier les vrais fichiers après leur chargement."],
    ["08", "Forge finale", "Contrôler la liste exacte puis forger le paquet."]
  ];

  const blankIdentity = () => ({
    name: "Aerith-10 Nouvelle Spécialité",
    family: "Filles d’Aerith",
    level: "Aerith-10",
    mode: "",
    role: "",
    problem: "",
    users: "Christophe et les utilisateurs explicitement définis par le projet.",
    outputs: [],
    formula: "Intention → Ressources → Destination utile.",
    agents: [],
    heritage: ["seven"],
    modules: [],
    nonDuplication: "Relier les modules existants à une décision précise de la mission.",
    tone: "Claire, chaleureuse, précise et fidèle à sa fonction.",
    modes: ["standard", "audit", "livraison"],
    guardrails: [
      "Fonder chaque affirmation sur une source réelle ou une hypothèse déclarée.",
      "Préserver la décision finale de Christophe.",
      "Conduire chaque mission vers une destination utile.",
      "Appliquer le Stop Point lorsque la preuve et le livrable sont prêts."
    ],
    confidentiality: "Privée par défaut.",
    stopPoint: "La mission est terminée lorsque la destination utile est livrée et vérifiable.",
    corePath: "",
    personaPath: "",
    memoryPath: "",
    status: "Création guidée par Aerith-10 Créatrice",
    version: "",
    coreStatus: "CORE À CONSTRUIRE",
    coreVersion: "—",
    coreProtection: "STANDARD",
    validationStatus: "À CONCEVOIR",
    personaStatus: "PERSONA À CONSTRUIRE",
    githubChecked: "",
    imagePath: ""
  });

  function identityFromProfile(selected) {
    return {
      ...blankIdentity(),
      name: selected.name,
      family: selected.family,
      level: selected.level,
      mode: selected.kind === "new" ? "Spécialiste / Orchestratrice" : selected.role.split(":")[0],
      role: selected.role || "",
      problem: selected.problem || selected.description || "",
      users: selected.users || "Christophe et les utilisateurs explicitement définis par le projet.",
      outputs: clone(selected.outputs || (selected.kind === "new" ? [] : ["destination utile", "synthèse vérifiable", "fichiers ou décisions nécessaires"])),
      formula: selected.formula || (selected.kind === "new" ? "Intention → Ressources → Destination utile." : "Mission → Sources → Décision → Destination utile."),
      agents: clone(selected.agents || []),
      heritage: clone(selected.heritage || []),
      modules: clone(selected.modules || []),
      nonDuplication: selected.id === "creator"
        ? "Créatrice relie organisation, réalisation et mémoire de production autour du D artistique."
        : "Relier chaque source et chaque module à une décision précise de la mission.",
      tone: selected.id === "atlas" ? "Analytique, explicite, vérifiable et centrée sur les modèles." : "Claire, chaleureuse, précise et fidèle à sa fonction.",
      modes: clone(selected.modes || []),
      guardrails: clone(selected.guardrails || []),
      confidentiality: selected.privacy === "public" ? "Sources publiques intégrées ; toute source privée reste sous contrôle humain." : "Privée par défaut.",
      stopPoint: selected.stopPoint || "La mission est terminée lorsque la destination utile est livrée et vérifiable.",
      corePath: selected.corePath || "",
      personaPath: selected.personaPath || "",
      memoryPath: selected.memoryPath || "",
      status: selected.status,
      version: selected.coreVersion || "",
      coreStatus: selected.coreStatus || (selected.privacy === "public" ? "CORE PUBLIC INCLUS" : "CORE À VÉRIFIER"),
      coreVersion: selected.coreVersion || "—",
      coreProtection: selected.coreProtection || "STANDARD",
      validationStatus: selected.validationStatus || "À VÉRIFIER",
      personaStatus: selected.personaStatus || (selected.privacy === "public" ? "PERSONA PUBLIQUE INCLUSE" : "PERSONA À VÉRIFIER"),
      githubChecked: selected.githubChecked || "",
      imagePath: selected.visual || ""
    };
  }


  function profileModuleRouter(selected = profile()) {
    return selected?.moduleRouter || null;
  }

  function moduleCatalog(selected = profile()) {
    return profileModuleRouter(selected)?.catalog || [];
  }

  function emptyModuleRouting() {
    return {routeId:"", active:[], included:[]};
  }

  function sanitizeModuleRouting(value, selected = profile()) {
    const allowed = new Set(moduleCatalog(selected).map(item => item.path));
    const source = value && typeof value === "object" ? value : emptyModuleRouting();
    return {
      routeId: String(source.routeId || ""),
      active: Array.from(new Set((source.active || []).filter(path => allowed.has(path)))),
      included: Array.from(new Set((source.included || []).filter(path => allowed.has(path))))
    };
  }

  function defaultPackageMode(selected) {
    return selected?.moduleRouter ? "complete" : "minimal";
  }

  function fullPreset(selected) {
    const router = selected?.moduleRouter;
    if (!router) return null;
    return (router.presets || []).find(item => item.id === "full" || item.id === "full-crypto") || (router.presets || []).at(-1) || null;
  }

  function defaultModuleRouting(selected) {
    const router = selected?.moduleRouter;
    const preset = fullPreset(selected);
    if (!router || !preset) return emptyModuleRouting();
    const paths = preset.modules.map(id => router.catalog.find(item => item.id === id)?.path).filter(Boolean);
    return {routeId:preset.id, active:[...paths], included:[...paths]};
  }

  function selectedPackageEntries() {
    const catalog = moduleCatalog();
    if (!catalog.length || state.packageMode === "minimal") return [];
    if (state.packageMode === "complete") return [...catalog];
    const active = new Set(state.moduleRouting.active || []);
    return catalog.filter(item => active.has(item.path));
  }

  function syncPackageInclusion() {
    const catalog = moduleCatalog();
    state.moduleRouting = sanitizeModuleRouting(state.moduleRouting);
    if (!catalog.length || state.packageMode === "minimal") state.moduleRouting.included = [];
    else if (state.packageMode === "complete") state.moduleRouting.included = catalog.map(item => item.path);
    else state.moduleRouting.included = [...state.moduleRouting.active];
  }

  function expectedPackageCount() {
    const included = selectedPackageEntries().length;
    return 8 + (included ? included + 1 : 0);
  }

  const defaultState = () => {
    const selected = DATA.profiles.find(item => item.id === "creator") || DATA.profiles[0];
    return {
      step: 0,
      profileId: selected.id,
      selectedExample: "",
      proposalPreview: "core",
      finalPreview: "boot",
      canonicalConfirmed: selected.privacy === "public",
      identity: identityFromProfile(selected),
      imports: [],
      importedFileMeta: [],
      moduleRouting: defaultModuleRouting(selected),
      packageMode: defaultPackageMode(selected),
      packInfo: {name:"", entries:0, error:""},
      visualUrl: "",
      lastSaved: ""
    };
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadState() {
    const fallback = defaultState();
    try {
      let rawText = localStorage.getItem(STORAGE_KEY);
      if (!rawText) {
        for (const legacyKey of LEGACY_STORAGE_KEYS) {
          rawText = localStorage.getItem(legacyKey);
          if (rawText) break;
        }
      }
      const raw = JSON.parse(rawText || "null");
      if (!raw || typeof raw !== "object") return fallback;
      return {
        ...fallback,
        ...raw,
        identity: {...fallback.identity, ...(raw.identity || {})},
        imports: [],
        visualUrl: "",
        moduleRouting: sanitizeModuleRouting(raw.moduleRouting, DATA.profiles.find(item => item.id === (raw.profileId || fallback.profileId)) || DATA.profiles[0]),
        packageMode: ["complete","minimal","targeted"].includes(raw.packageMode) ? raw.packageMode : fallback.packageMode,
        packInfo: {name:"", entries:0, error:""}
      };
    } catch {
      return fallback;
    }
  }

  let state = loadState();

  const canonicalSourceCache = new Map();
  const moduleSourceCache = new Map();
  const decoder = new TextDecoder("utf-8");

  function pathFileName(value) {
    const parts = cleanPath(value).split("/");
    return parts[parts.length - 1] || "";
  }

  function normalizeDownloadedFileName(value) {
    return String(value || "")
      .replace(/\s*\(\d+\)(?=\.[^.]+$)/, "")
      .toUpperCase();
  }

  function canonicalPath(kind, selected = profile()) {
    return kind === "core" ? selected.corePath : selected.personaPath;
  }

  function expectedCanonicalFileName(kind) {
    return normalizeDownloadedFileName(pathFileName(canonicalPath(kind)));
  }

  function importedCanonical(kind) {
    if (!isCanonicalProfile()) return null;
    const expected = expectedCanonicalFileName(kind);
    if (!expected) return null;
    return state.imports.find(item =>
      item.kind === kind && normalizeDownloadedFileName(pathFileName(item.path)) === expected
    ) || null;
  }

  function canonicalCacheKey(kind, selected = profile()) {
    return `${selected.id}:${kind}`;
  }

  function ensurePublicCanonicalSource(kind) {
    const selected = profile();
    if (!isCanonicalProfile() || selected.privacy !== "public") return;
    const key = canonicalCacheKey(kind, selected);
    if (canonicalSourceCache.has(key)) return;
    canonicalSourceCache.set(key, {status:"loading", bytes:null, text:"", error:""});
    fetch(canonicalPath(kind, selected), {cache:"no-store"})
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.arrayBuffer();
      })
      .then(buffer => {
        const bytes = new Uint8Array(buffer);
        canonicalSourceCache.set(key, {status:"ready", bytes, text:decoder.decode(bytes), error:""});
      })
      .catch(error => canonicalSourceCache.set(key, {status:"error", bytes:null, text:"", error:error.message || String(error)}))
      .finally(() => {
        if (profile().id === selected.id) {
          renderProposal();
          renderFinal();
          renderAdvisor();
        }
      });
  }

  function canonicalSourceState(kind) {
    const selected = profile();
    if (!isCanonicalProfile()) return {status:"not-applicable", bytes:null, text:"", error:""};
    if (selected.privacy === "public") {
      ensurePublicCanonicalSource(kind);
      return canonicalSourceCache.get(canonicalCacheKey(kind, selected)) || {status:"loading", bytes:null, text:"", error:""};
    }
    const imported = importedCanonical(kind);
    if (!imported) return {status:"missing", bytes:null, text:"", error:"", imported:null};
    return {status:"ready", bytes:null, text:imported.text || "", error:"", imported};
  }

  async function canonicalSourceBytes(kind) {
    if (!isCanonicalProfile()) throw new Error("Profil canonique non sélectionné.");
    const selected = profile();
    if (selected.privacy === "public") {
      const response = await fetch(canonicalPath(kind, selected), {cache:"no-store"});
      if (!response.ok) throw new Error(`${canonicalPath(kind, selected)} — HTTP ${response.status}`);
      return new Uint8Array(await response.arrayBuffer());
    }
    const imported = importedCanonical(kind);
    if (!imported) throw new Error(`${kind === "core" ? "Core" : "Persona"} canonique non chargé.`);
    return new Uint8Array(await imported.file.arrayBuffer());
  }

  async function canonicalSourceText(kind) {
    const selected = profile();
    if (selected.privacy === "public") {
      const stateValue = canonicalSourceState(kind);
      if (stateValue.status === "ready") return stateValue.text;
      return decoder.decode(await canonicalSourceBytes(kind));
    }
    const imported = importedCanonical(kind);
    if (!imported) throw new Error(`${kind === "core" ? "Core" : "Persona"} canonique non chargé.`);
    return imported.text || imported.file.text();
  }


  function normalizedMatchPath(value) {
    return cleanPath(value).toLowerCase();
  }

  function importedSourceForPath(canonicalPathValue) {
    const target = normalizedMatchPath(canonicalPathValue);
    const withoutModules = target.replace(/^modules\//, "");
    const publicModuleTail = target.replace(/^public\/agent_crypto_erith_ia\/atlas_10_full_crypto\/modules\//, "");
    const expectedName = pathFileName(target).toLowerCase();
    const exact = state.imports.find(item => {
      const imported = normalizedMatchPath(item.path);
      return imported === target || imported.endsWith(`/${target}`) ||
        (withoutModules !== target && (imported === withoutModules || imported.endsWith(`/${withoutModules}`))) ||
        (publicModuleTail !== target && imported.endsWith(`/atlas_10_full_crypto/modules/${publicModuleTail}`));
    });
    if (exact) return exact;
    const sameName = state.imports.filter(item => normalizeDownloadedFileName(pathFileName(item.path)).toLowerCase() === normalizeDownloadedFileName(expectedName).toLowerCase());
    if (expectedName !== "readme.md") return sameName.length === 1 ? sameName[0] : null;
    const expectedParent = withoutModules.split("/").slice(0, -1).join("/");
    const parentMatch = sameName.find(item => normalizedMatchPath(item.path).includes(expectedParent));
    return parentMatch || (sameName.length === 1 ? sameName[0] : null);
  }

  function moduleCacheKey(entry) {
    return `${entry.privacy || "public"}:${entry.path}`;
  }

  function ensurePublicModuleSource(entry) {
    if (!entry || entry.privacy !== "public") return;
    const key = moduleCacheKey(entry);
    if (moduleSourceCache.has(key)) return;
    moduleSourceCache.set(key, {status:"loading", bytes:null, text:"", error:""});
    fetch(githubRawUrl(DATA.publicRepo, entry.path), {cache:"no-store"})
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.arrayBuffer();
      })
      .then(buffer => {
        const bytes = new Uint8Array(buffer);
        moduleSourceCache.set(key, {status:"ready", bytes, text:decoder.decode(bytes), error:""});
      })
      .catch(error => moduleSourceCache.set(key, {status:"error", bytes:null, text:"", error:error.message || String(error)}))
      .finally(() => {
        renderModuleRouter();
        renderSourceGuide();
        renderFinal();
        renderAdvisor();
      });
  }

  function moduleSourceState(entry) {
    if (!entry) return {status:"missing", bytes:null, text:"", error:""};
    if (entry.privacy === "public") {
      ensurePublicModuleSource(entry);
      return moduleSourceCache.get(moduleCacheKey(entry)) || {status:"loading", bytes:null, text:"", error:""};
    }
    const imported = importedSourceForPath(entry.path);
    return imported ? {status:"ready", bytes:null, text:imported.text || "", error:"", imported} : {status:"missing", bytes:null, text:"", error:""};
  }

  async function moduleSourceBytes(entry) {
    if (entry.privacy === "public") {
      const cached = moduleSourceCache.get(moduleCacheKey(entry));
      if (cached?.status === "ready" && cached.bytes) return cached.bytes;
      const response = await fetch(githubRawUrl(DATA.publicRepo, entry.path), {cache:"no-store"});
      if (!response.ok) throw new Error(`${entry.path} — HTTP ${response.status}`);
      return new Uint8Array(await response.arrayBuffer());
    }
    const imported = importedSourceForPath(entry.path);
    if (!imported) throw new Error(`${entry.path} — source privée non chargée.`);
    return new Uint8Array(await imported.file.arrayBuffer());
  }

  function routerEntry(selected = profile()) {
    const router = profileModuleRouter(selected);
    if (!router?.routerPath) return null;
    return {id:"router", label:"README — routeur canonique", path:router.routerPath, privacy:router.routerPrivacy || "private"};
  }

  function moduleMetrics() {
    const catalog = moduleCatalog();
    const routing = sanitizeModuleRouting(state.moduleRouting);
    const loaded = catalog.filter(item => moduleSourceState(item).status === "ready");
    return {catalog, routing, referenced:catalog.length, loaded, active:routing.active.length, included:routing.included.length};
  }

  function persist() {
    const serializable = {
      ...state,
      imports: [],
      visualUrl: "",
      importedFileMeta: state.imports.map(item => ({path:item.path, kind:item.kind, size:item.file.size}))
    };
    state.lastSaved = new Date().toISOString();
    serializable.lastSaved = state.lastSaved;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    } catch {}
    const target = $("#savedState");
    if (target) target.textContent = "Mémoire active";
  }

  function profile() {
    return DATA.profiles.find(item => item.id === state.profileId) || DATA.profiles[0];
  }

  function isNew() {
    return state.profileId === "new";
  }

  function isCanonicalProfile() {
    return CANONICAL_PROFILE_IDS.has(state.profileId);
  }

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function lines(value) {
    return String(value || "").split(/\r?\n/).map(item => item.trim()).filter(Boolean);
  }

  function cleanName(value) {
    return String(value || "AERITH_10_PROFILE")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toUpperCase() || "AERITH_10_PROFILE";
  }

  function cleanPath(value) {
    return String(value || "").replaceAll("\\", "/").split("/")
      .filter(part => part && part !== "." && part !== "..").join("/");
  }

  function encodeRepoPath(value) {
    return cleanPath(value).split("/").map(part => encodeURIComponent(part)).join("/");
  }

  function stripMarkdown(value) {
    return String(value || "")
      .replace(/[`*_#]/g, "")
      .replace(/^[\s🌸🧭⚠️💠◇✦]+/u, "")
      .trim();
  }

  function formatSize(bytes) {
    if (!bytes) return "0 o";
    const units = ["o", "Ko", "Mo", "Go"];
    let index = 0;
    let value = bytes;
    while (value >= 1024 && index < units.length - 1) { value /= 1024; index += 1; }
    return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`;
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function downloadBlob(name, blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function downloadText(name, text, type = "text/markdown;charset=utf-8") {
    downloadBlob(name, new Blob([text], {type}));
  }

  function githubBlobUrl(repo, path) {
    return `https://github.com/${repo}/blob/${DATA.branch}/${encodeRepoPath(path)}`;
  }

  function githubRawUrl(repo, path) {
    return `https://raw.githubusercontent.com/${repo}/${DATA.branch}/${encodeRepoPath(path)}`;
  }

  function resolveSource(value) {
    let original = String(value || "").trim();
    if (!original) return null;
    if (/^https?:\/\//i.test(original)) {
      return {label:original, repo:"external", path:original, url:original, raw:original, privacy:"external"};
    }

    let repo = DATA.publicRepo;
    let privacy = "public";
    let path = original;
    if (/^private:/i.test(path)) {
      repo = DATA.privateRepo;
      privacy = "private";
      path = path.replace(/^private:/i, "");
    } else if (/^public:/i.test(path)) {
      path = path.replace(/^public:/i, "");
    } else if (/^(core|private|packs|modules)\//i.test(path)) {
      repo = DATA.privateRepo;
      privacy = "private";
    }
    path = cleanPath(path);
    return {label:original, repo, path, url:githubBlobUrl(repo, path), raw:githubRawUrl(repo, path), privacy};
  }

  function currentVisual() {
    if (state.visualUrl) return state.visualUrl;
    if (isCanonicalProfile()) return profile().visual || "";
    return profile().visual || DATA.heritage.find(item => item.id === "seven").visual;
  }

  function canonicalBase() {
    return cleanName(state.identity.name).replace(/^AERITH10_/, "AERITH_10_");
  }

  function defaultCoreTarget() {
    if (!isNew()) return state.identity.corePath || profile().corePath || "";
    return `core/${canonicalBase()}_MULTI_AGENT_CORE.md`;
  }

  function defaultPersonaTarget() {
    if (!isNew()) return state.identity.personaPath || profile().personaPath || "";
    return `core/${canonicalBase()}_PERSONA_OPERATING_LAYER.md`;
  }

  function proposalFileName(type) {
    const base = canonicalBase();
    if (type === "core") return `${base}_MULTI_AGENT_CORE_PROPOSAL.md`;
    if (type === "persona") return `${base}_PERSONA_OPERATING_LAYER_PROPOSAL.md`;
    if (type === "block") return `${base}_BLOCK_LLM_LOCAL.md`;
    if (type === "links") return `${base}_GITHUB_HTTP_RAW_LINKS.md`;
    return `${base}_DESIGN_BRIEF.md`;
  }

  function finalFileName(type) {
    const base = cleanName(state.identity.name);
    if (type === "boot") return `BOOT_${base}.md`;
    if (type === "manifest") return `MANIFESTE_${base}.md`;
    if (type === "block") return `BLOCK_LLM_${base}.md`;
    if (type === "links") return `GITHUB_HTTP_RAW_${base}.md`;
    return `PROFILE_SPEC_${base}.json`;
  }

  function applyProfile(id, move = true) {
    const selected = DATA.profiles.find(item => item.id === id);
    if (!selected) return;
    state.profileId = id;
    state.selectedExample = "";
    state.proposalPreview = "core";
    state.canonicalConfirmed = selected.kind === "existing" && selected.privacy === "public";
    state.identity = identityFromProfile(selected);
    state.imports = [];
    state.moduleRouting = defaultModuleRouting(selected);
    state.packageMode = defaultPackageMode(selected);
    state.packInfo = {name:"", entries:0, error:""};
    if (state.visualUrl) URL.revokeObjectURL(state.visualUrl);
    state.visualUrl = "";
    state.step = move ? 0 : state.step;
    persist();
    renderAll();
    if (move) $("#unifiedForge").scrollIntoView({behavior:"smooth", block:"start"});
    showToast(`${selected.name} rejoint l’atelier de Créatrice.`);
  }

  function applyExample(id) {
    const example = DATA.examples.find(item => item.id === id);
    if (!example) return;
    state.profileId = "new";
    state.selectedExample = id;
    state.canonicalConfirmed = false;
    state.identity = {
      ...blankIdentity(),
      ...clone(example),
      level: "Aerith-10",
      mode: "Spécialiste / Orchestratrice",
      corePath: `core/${cleanName(example.name)}_MULTI_AGENT_CORE.md`,
      personaPath: `core/${cleanName(example.name)}_PERSONA_OPERATING_LAYER.md`,
      memoryPath: "",
      status: "Proposition en création",
      version: "",
      imagePath: ""
    };
    state.imports = [];
    state.moduleRouting = emptyModuleRouting();
    state.packageMode = "minimal";
    state.packInfo = {name:"", entries:0, error:""};
    if (state.visualUrl) URL.revokeObjectURL(state.visualUrl);
    state.visualUrl = "";
    persist();
    renderAll();
    showToast(`${example.name} devient le point de départ de la création.`);
  }

  function applyBlank() {
    const selected = DATA.profiles.find(item => item.id === "new") || DATA.profiles[0];
    state.profileId = "new";
    state.selectedExample = "";
    state.canonicalConfirmed = false;
    state.identity = identityFromProfile(selected);
    state.imports = [];
    state.moduleRouting = emptyModuleRouting();
    state.packageMode = "minimal";
    state.packInfo = {name:"", entries:0, error:""};
    if (state.visualUrl) URL.revokeObjectURL(state.visualUrl);
    state.visualUrl = "";
    persist();
    renderAll();
    showToast("Base libre préremplie par Créatrice.");
  }

  function renderDoctrine() {
    $("#doctrine").innerHTML = DATA.doctrine.map(item => `<span>${esc(item)}</span>`).join("");
  }

  function renderLineage() {
    $("#lineageGrid").innerHTML = DATA.heritage.map(item => `
      <article class="lineage-card">
        <button class="lineage-media" type="button" data-lightbox="${esc(item.visual)}" data-lightbox-title="${esc(item.name)}">
          <img src="${esc(item.visual)}" alt="${esc(item.name)}" loading="lazy">
          <span class="lineage-zoom">Voir l’image entière ↗</span>
        </button>
        <div class="lineage-copy">
          <span>${esc(item.label)}</span>
          <h3>${esc(item.name)}</h3>
          <p>${esc(item.role)}</p>
          <small>${esc(item.formula)}</small>
        </div>
      </article>`).join("");
  }

  function profileCard(item) {
    const cardVisual = item.cardVisual || item.visual || "";
    return `<button type="button" class="profile-card ${item.id === state.profileId ? "active" : ""}" data-profile="${esc(item.id)}">
      <span class="profile-sigil">${esc(item.sigil)}</span>
      <span class="profile-media">
        ${cardVisual ? `<img src="${esc(cardVisual)}" alt="${esc(item.name)}" loading="lazy">` : `<span class="profile-abstract">${esc(item.sigil)}</span>`}
      </span>
      <span class="profile-copy">
        <span class="family">${esc(item.family)}</span>
        <h3>${esc(item.name)}</h3>
        <p>${esc(item.description)}</p>
        <small>${esc(item.status)}</small>
        <b class="card-action">Ouvrir dans l’atelier →</b>
      </span>
    </button>`;
  }

  function exampleCard(item, compact = false) {
    return `<button type="button" class="example-card specialty-card ${state.selectedExample === item.id ? "active" : ""} ${compact ? "compact" : ""}" data-example="${esc(item.id)}">
      <span>${esc(item.badge)}</span>
      <h3>${esc(item.name)}</h3>
      <p>${esc(item.role)}</p>
      <b>Créer avec Créatrice →</b>
    </button>`;
  }

  function renderProfiles() {
    const existing = DATA.profiles.filter(item => item.kind === "existing");
    const fresh = DATA.profiles.find(item => item.kind === "new");
    $("#canonicalProfileGrid").innerHTML = existing.map(profileCard).join("");
    $("#newProfileLaunch").innerHTML = fresh ? `<button type="button" class="new-profile-launch ${state.profileId === fresh.id && !state.selectedExample ? "active" : ""}" data-profile="${esc(fresh.id)}">
      <span class="new-orbit">A10+</span>
      <span><small>INTENTION LIBRE</small><strong>Faire naître une nouvelle Aerith-10</strong><p>${esc(fresh.description)}</p></span>
      <b>Entrer dans l’atelier →</b>
    </button>` : "";
    $("#specialtyGrid").innerHTML = DATA.examples.map(item => exampleCard(item, true)).join("");
  }

  function renderExamples() {
    $("#exampleArea").hidden = !isNew();
    $("#exampleGrid").innerHTML = DATA.examples.map(item => exampleCard(item)).join("");
  }


  const flowerView = {family:"all", facet:"all", search:"", selected:""};

  function flowerIdentity(item) {
    return {
      name:item.name,
      family:item.family,
      level:"Aerith-10",
      mode:item.badge || "Spécialiste",
      role:item.role,
      problem:item.problem,
      users:item.users,
      outputs:[...(item.outputs || [])],
      formula:item.formula,
      agents:[...(item.agents || [])],
      heritage:[...(item.heritage || ["seven"])],
      modules:[...(item.modules || [])],
      nonDuplication:`${item.name} — ${item.difference}`,
      tone:item.tone || "Claire, chaleureuse, précise et fidèle à sa fonction.",
      modes:[...(item.modes || ["standard","audit","livraison"])],
      guardrails:[...(item.guardrails || [])],
      confidentiality:item.confidentiality || "Privée par défaut.",
      stopPoint:item.stopPoint || "La mission est terminée lorsque la sortie attendue est livrée et vérifiable.",
      corePath:item.corePath || `core/${cleanName(item.name)}_MULTI_AGENT_CORE.md`,
      personaPath:item.personaPath || `core/${cleanName(item.name)}_PERSONA_OPERATING_LAYER.md`,
      memoryPath:item.memoryPath || "core/ATLAS_DES_MODULES.md",
      status:item.coreStatus || item.status || "CORE À VÉRIFIER",
      version:item.coreVersion || FLOWER?.version || DATA.version,
      coreStatus:item.coreStatus || "CORE À VÉRIFIER",
      coreVersion:item.coreVersion || "—",
      coreProtection:item.coreProtection || "STANDARD",
      validationStatus:item.validationStatus || "À VÉRIFIER",
      personaStatus:item.personaStatus || "PERSONA À VÉRIFIER",
      githubChecked:item.githubChecked || "",
      imagePath:""
    };
  }

  function applyFlowerGirl(id, scroll = true) {
    if (!FLOWER) return;
    const item = FLOWER.profiles.find(profile => profile.id === id);
    if (!item) return;
    if (id === "creatrice") {
      applyProfile("creator", scroll);
      showToast("Aerith-10 Créatrice chargée.");
      return;
    }
    state.profileId = "new";
    state.selectedExample = `flower:${id}`;
    state.identity = flowerIdentity(item);
    state.canonicalConfirmed = false;
    state.imports = [];
    state.moduleRouting = emptyModuleRouting();
    state.packageMode = "minimal";
    state.packInfo = {name:"", entries:0, error:""};
    state.visualUrl = "";
    state.step = 0;
    state.proposalPreview = "core";
    state.finalPreview = "boot";
    persist();
    renderAll();
    if (scroll) $("#unifiedForge").scrollIntoView({behavior:"smooth", block:"start"});
    showToast(`${item.name} chargée dans l’Atelier.`);
  }

  function renderFlowerDetail(item, scroll = false) {
    const detail = $("#flowerDetail");
    if (!detail) return;
    if (!item) {
      detail.hidden = true;
      detail.innerHTML = "";
      return;
    }

    flowerView.selected = item.id;
    const heritage = (item.heritage || []).map(id => {
      const source = DATA.heritage.find(entry => entry.id === id);
      return `<span>${esc(source?.name || id)}</span>`;
    }).join("") || "<span>Aucun héritage supplémentaire</span>";

    const list = values => (values || []).map(value => `<li>${esc(value)}</li>`).join("") || "<li>À préciser</li>";
    const modules = (item.modules || []).map(value => `<li><code>${esc(value)}</code></li>`).join("") || "<li>Aucun module ciblé</li>";

    detail.innerHTML = `
      <header class="flower-detail-head">
        <div>
          <p class="kicker">FICHE FLOWER GIRL · ${esc(item.family)}</p>
          <h3>${esc(item.name)}</h3>
          <p>${esc(item.role)}</p>
        </div>
        <div class="flower-detail-head-actions">
          <span class="flower-detail-status">${esc(item.coreStatus || item.status)}</span>
          <button type="button" data-flower-close aria-label="Fermer la fiche">Fermer ×</button>
        </div>
      </header>

      <div class="flower-source-status">
        <article><span>CORE PRIVÉ</span><strong>${esc(item.coreVersion || "Version à vérifier")}</strong><small>${esc(item.coreStatus || item.status)}</small></article>
        <article><span>VALIDATION</span><strong>${esc(item.validationStatus || "À vérifier")}</strong><small>${esc(item.coreProtection === "PROTÉGÉ" ? "Lecture autorisée · écriture directe interdite" : "Source individuelle confirmée")}</small></article>
        <article><span>PERSONA</span><strong>${esc(item.personaStatus || "PERSONA À VÉRIFIER")}</strong><small>Ne jamais déclarer une Persona absente sans contrôle de son chemin réel.</small></article>
        <article><span>SCAN GITHUB</span><strong>${esc(item.githubChecked || "Non daté")}</strong><small>${esc(item.githubRepo || "Dépôt privé")}</small></article>
      </div>

      <div class="flower-detail-core">
        <article class="flower-detail-highlight">
          <span>FONCTION PROPRE</span>
          <strong>${esc(item.uniqueValue)}</strong>
        </article>
        <article class="flower-detail-highlight comparison">
          <span>FRONTIÈRE FONCTIONNELLE</span>
          <strong>${esc(item.nearestProfile)}</strong>
          <p>${esc(item.difference)}</p>
        </article>
        <article class="flower-detail-highlight formula">
          <span>FORMULE CENTRALE</span>
          <strong>${esc(item.formula)}</strong>
        </article>
      </div>

      <div class="flower-detail-grid">
        <article><h4>Sorties attendues</h4><ul>${list(item.outputs)}</ul></article>
        <article><h4>Constellation d’agents</h4><ul>${list(item.agents)}</ul></article>
        <article><h4>Persona & modes</h4><p>${esc(item.tone || "À préciser")}</p><div class="flower-detail-tags">${(item.modes || []).map(value => `<span>${esc(value)}</span>`).join("")}</div></article>
        <article><h4>Héritages</h4><div class="flower-detail-tags">${heritage}</div><h4 class="second-title">Garde-fous</h4><ul>${list(item.guardrails)}</ul></article>
        <article class="wide"><h4>Modules et sources ciblés</h4><ul class="module-list">${modules}</ul></article>
        <article class="wide path-card"><h4>Sources canoniques et état de liaison</h4><dl>
          <div><dt>Core</dt><dd><code>${esc(item.corePath)}</code><small>${esc(item.coreVersion || "")}</small></dd></div>
          <div><dt>Persona</dt><dd><code>${esc(item.personaPath)}</code><small>${esc(item.personaStatus || "À vérifier")}</small></dd></div>
          <div><dt>Mémoire</dt><dd><code>${esc(item.memoryPath)}</code></dd></div>
          <div><dt>Stop Point</dt><dd>${esc(item.stopPoint)}</dd></div>
        </dl></article>
      </div>

      <footer class="flower-detail-actions">
        <button type="button" data-flower-close>Retour à la constellation</button>
        <button class="primary" type="button" data-flower-load="${esc(item.id)}">Charger cette Flower Girl dans l’Atelier →</button>
      </footer>`;
    detail.hidden = false;
    if (scroll) detail.scrollIntoView({behavior:"smooth", block:"start"});
    notifyParentHeight();
  }

  function renderFlowerGirls() {
    if (!FLOWER || !$("#flowerGrid")) return;
    $("#flowerFacetGrid").innerHTML = FLOWER.facets.map(item => `
      <button type="button" class="flower-facet ${flowerView.facet === item.id ? "active" : ""}" data-flower-facet="${esc(item.id)}">
        <span>${esc(item.name)}</span><small>${esc(item.description)}</small>
      </button>`).join("");

    const familyButtons = [{id:"all",name:"Toutes"}, ...FLOWER.families.map(item => ({id:item.id,name:item.short}))];
    $("#flowerFamilyFilters").innerHTML = familyButtons.map(item => `
      <button type="button" class="${flowerView.family === item.id ? "active" : ""}" data-flower-family="${esc(item.id)}">${esc(item.name)}</button>`).join("");

    const query = flowerView.search.trim().toLowerCase();
    const filtered = FLOWER.profiles.filter(item => {
      if (flowerView.family !== "all" && item.familyId !== flowerView.family) return false;
      if (flowerView.facet !== "all" && !(item.facet || []).includes(flowerView.facet)) return false;
      if (!query) return true;
      return [item.name,item.family,item.role,item.uniqueValue,item.difference,...(item.agents || [])].join(" ").toLowerCase().includes(query);
    });

    const existingCores = FLOWER.profiles.filter(item => /EXISTANT|CANONIQUE/.test(item.coreStatus || "")).length;
    const protectedCores = FLOWER.profiles.filter(item => item.coreProtection === "PROTÉGÉ").length;
    const linkedPersonas = FLOWER.profiles.filter(item => item.personaStatus === "PERSONA LIÉE").length;
    $("#flowerSummary").innerHTML = `<span><b>${filtered.length}</b> profil(s) affiché(s)</span><span><b>${existingCores}</b> Core individuels confirmés</span><span><b>${protectedCores}</b> Core protégés</span><span><b>${linkedPersonas}</b> Persona liée</span><span><b>${FLOWER.profiles.length - linkedPersonas}</b> Persona à vérifier / relier</span>`;

    $("#flowerGrid").innerHTML = filtered.map(item => `
      <article class="flower-card family-${esc(item.familyId)}">
        <header><span>${esc(item.badge)}</span><b>${esc(item.coreVersion || item.status)}</b></header>
        <div class="flower-sigil">${esc(item.sigil || "A10")}</div>
        <h3>${esc(item.name)}</h3>
        <p>${esc(item.role)}</p>
        <div class="flower-core-meta">
          <span class="core">${esc(item.coreStatus || item.status)}</span>
          <span class="persona">${esc(item.personaStatus || "PERSONA À VÉRIFIER")}</span>
        </div>
        <dl><div><dt>Valeur propre</dt><dd>${esc(item.uniqueValue)}</dd></div><div><dt>Profil voisin</dt><dd>${esc(item.nearestProfile)}</dd></div></dl>
        <div class="flower-tags">${(item.heritage || []).map(x => `<span>${esc(x)}</span>`).join("")}<span>${(item.agents || []).length} agents</span><span>${(item.modules || []).length} modules</span></div>
        <div class="flower-card-actions">
          <button type="button" data-flower-detail="${esc(item.id)}">Voir la fiche complète</button>
          <button class="primary" type="button" data-flower-load="${esc(item.id)}">Charger dans l’Atelier →</button>
        </div>
      </article>`).join("") || `<div class="flower-empty">Aucun profil ne correspond à ce filtre.</div>`;

    if (flowerView.selected) {
      const selected = FLOWER.profiles.find(item => item.id === flowerView.selected);
      renderFlowerDetail(selected || null, false);
    }
  }

  function renderConstellation() {
    const existing = DATA.profiles.filter(item => item.kind === "existing");
    const proposals = DATA.examples.slice(0, 3);
    $("#constellationProfiles").innerHTML = `
      <div class="constellation-line"><span>AERITH-10 SPÉCIALISÉES</span></div>
      <div class="constellation-node-grid">
        ${existing.map(item => `<button type="button" class="constellation-node ${item.id === state.profileId ? "active" : ""}" data-profile="${esc(item.id)}"><b>${esc(item.name)}</b><small>${esc(item.family)}</small></button>`).join("")}
        ${proposals.map(item => `<button type="button" class="constellation-node proposal ${state.selectedExample === item.id ? "active" : ""}" data-example="${esc(item.id)}"><b>${esc(item.name)}</b><small>Spécialité à concevoir</small></button>`).join("")}
      </div>`;
  }

  function renderSelectedProfile() {
    const p = profile();
    $("#selectedProfile").innerHTML = `
      <div class="selected-profile-media">
        ${currentVisual() ? `<img src="${esc(currentVisual())}" alt="${esc(state.identity.name)}">` : `<strong>${esc(p.sigil)}</strong>`}
      </div>
      <div>
        <h3>${esc(state.identity.name)}</h3>
        <p>${esc(state.identity.role || p.description)}</p>
        <div class="meta"><span>${esc(state.identity.family)}</span><span>${esc(state.identity.level)}</span><span>${esc(state.identity.status)}</span></div>
      </div>`;
    $("#profileStatus").textContent = isNew() ? "CRÉATION EN COURS" : (p.privacy === "public" ? "PUBLIC INCLUS" : "PRIVÉ · IMPORT LOCAL");
  }


  function maturityState() {
    const i = state.identity;
    const audit = finalAudit();
    if (audit.ready) return "PRÊTE À ACTIVER";
    if (state.canonicalConfirmed && importedCanonical("core") && importedCanonical("persona")) return "SOURCES VALIDÉES";
    if (state.canonicalConfirmed) return "VALIDATION HUMAINE";
    if (proposalAudit().ready && state.step >= 5) return "PRÊTE POUR VALIDATION";
    if ((i.tone || "").trim() && (i.modes || []).length && (i.guardrails || []).length) return "IDENTITÉ VIVANTE";
    if ((i.agents || []).length && (i.heritage || []).length) return "ARCHITECTURE";
    if ((i.role || "").trim() && (i.problem || "").trim()) return "MISSION";
    return "INTENTION";
  }

  function renderLiveProfile() {
    const i = state.identity;
    $("#liveMaturity").textContent = maturityState();
    $("#liveName").textContent = i.name || "Aerith-10 Nouvelle Spécialité";
    $("#liveRole").textContent = i.role || "Une mission prend forme dans l’atelier de Créatrice.";
    $("#liveFormula").textContent = i.formula || "Intention → Ressources → Destination utile.";
    $("#liveFamily").textContent = i.family || "Filles d’Aerith";
    $("#liveAgents").textContent = String((i.agents || []).length);
    $("#liveModules").textContent = String((i.modules || []).length);
    $("#liveHeritage").innerHTML = (i.heritage || []).length
      ? i.heritage.map(id => {
          const h = DATA.heritage.find(item => item.id === id);
          return `<span>${esc(h?.name || id)}</span>`;
        }).join("")
      : "<span>Héritage à choisir</span>";
  }

  function stepModel(index) {
    const step = [...STEPS[index]];
    if (index === 6 && isCanonicalProfile()) step[2] = "Consulter les vrais fichiers Core et Persona.";
    return step;
  }

  function renderStepNav() {
    $("#stepNav").innerHTML = STEPS.map((_, index) => {
      const step = stepModel(index);
      return `
      <button type="button" class="step-button ${state.step === index ? "active" : ""}" data-step-button="${index}">
        <span class="step-number">${step[0]}</span>
        <span><b>${esc(step[1])}</b><small>${esc(step[2])}</small></span>
      </button>`;
    }).join("");
  }

  function renderMatrix() {
    const p = profile();
    document.body.dataset.theme = p.theme || "seven";
    $("#matrixName").textContent = "The Vault — Forge d’Aerith";
    $("#matrixDescription").textContent = "Le Coffre vivant où la lignée Aerith est préservée, préparée et reliée avant activation.";
    $("#matrixSymbol").textContent = "VAULT";
    $("#matrixKicker").textContent = "SEVEN HEAVEN · VAULT";
    $("#matrixStep").textContent = `${String(state.step + 1).padStart(2, "0")} / 08`;
    $("#matrixState").textContent = finalAudit().ready ? "PRÊT" : (state.step < 6 ? "FORGE" : "SOURCES");
    const image = $("#matrixImage");
    image.src = "assets/themes/aerith_10_home_vault_forge.webp";
    image.hidden = false;
    $("#railProfileName").textContent = state.identity.name;
  }

  function renderFamilies() {
    $("#familyList").innerHTML = DATA.families.map(item => `<option value="${esc(item)}"></option>`).join("");
  }

  function syncFieldsToUI() {
    const i = state.identity;
    $("#fieldName").value = i.name || "";
    $("#fieldFamily").value = i.family || "";
    $("#fieldLevel").value = i.level || "";
    $("#fieldMode").value = i.mode || "";
    $("#fieldRole").value = i.role || "";
    $("#fieldProblem").value = i.problem || "";
    $("#fieldUsers").value = i.users || "";
    $("#fieldOutputs").value = (i.outputs || []).join("\n");
    $("#fieldFormula").value = i.formula || "";
    $("#fieldAgents").value = (i.agents || []).join("\n");
    $("#fieldModules").value = (i.modules || []).join("\n");
    $("#fieldModules").readOnly = Boolean(profileModuleRouter());
    $("#fieldModulesLabel").textContent = profileModuleRouter() ? "Catalogue canonique référencé — piloté par le routeur ci-dessus" : "Modules ou fichiers sources — un chemin par ligne";
    $("#fieldNonDuplication").value = i.nonDuplication || "";
    $("#fieldTone").value = i.tone || "";
    $("#fieldModes").value = (i.modes || []).join("\n");
    $("#fieldGuardrails").value = (i.guardrails || []).join("\n");
    $("#fieldConfidentiality").value = i.confidentiality || "";
    $("#fieldStopPoint").value = i.stopPoint || "";
    $("#fieldCorePath").value = i.corePath || defaultCoreTarget();
    $("#fieldPersonaPath").value = i.personaPath || defaultPersonaTarget();
    $("#fieldMemoryPath").value = i.memoryPath || "";
    $("#canonicalConfirmed").checked = state.canonicalConfirmed;
    $("#canonicalConfirmed").disabled = !isNew() && profile().privacy === "public";
  }

  function syncUIToState() {
    const i = state.identity;
    i.name = $("#fieldName").value.trim() || "Aerith-10 Nouvelle Spécialité";
    i.family = $("#fieldFamily").value.trim();
    i.level = $("#fieldLevel").value.trim();
    i.mode = $("#fieldMode").value.trim();
    i.role = $("#fieldRole").value.trim();
    i.problem = $("#fieldProblem").value.trim();
    i.users = $("#fieldUsers").value.trim();
    i.outputs = lines($("#fieldOutputs").value);
    i.formula = $("#fieldFormula").value.trim();
    i.agents = lines($("#fieldAgents").value);
    if (!profileModuleRouter()) i.modules = lines($("#fieldModules").value);
    i.nonDuplication = $("#fieldNonDuplication").value.trim();
    i.tone = $("#fieldTone").value.trim();
    i.modes = lines($("#fieldModes").value);
    i.guardrails = lines($("#fieldGuardrails").value);
    i.confidentiality = $("#fieldConfidentiality").value.trim();
    i.stopPoint = $("#fieldStopPoint").value.trim();
    i.corePath = $("#fieldCorePath").value.trim();
    i.personaPath = $("#fieldPersonaPath").value.trim();
    i.memoryPath = $("#fieldMemoryPath").value.trim();
    state.canonicalConfirmed = $("#canonicalConfirmed").checked;
    persist();
    renderMatrix();
    renderSelectedProfile();
    renderLiveProfile();
    renderConstellation();
    renderFlowerGirls();
    renderProposal();
    renderSourceGuide();
    renderFinal();
    renderAdvisor();
  }

  function renderAgentSuggestions() {
    $("#agentSuggestions").innerHTML = DATA.suggestedAgents.map(item => `<button type="button" data-agent="${esc(item)}">＋ ${esc(item)}</button>`).join("");
  }

  function renderHeritage() {
    $("#heritageGrid").innerHTML = DATA.heritage.map(item => {
      const active = state.identity.heritage.includes(item.id);
      return `<label class="heritage-choice ${active ? "active" : ""}">
        <input type="checkbox" data-heritage="${esc(item.id)}" ${active ? "checked" : ""}>
        <b>${esc(item.name)}</b><small>${esc(item.role)}</small>
      </label>`;
    }).join("");
  }


  function renderModuleRouter() {
    const panel = $("#moduleRouterPanel");
    if (!panel) return;
    const router = profileModuleRouter();
    if (!router) { panel.hidden = true; panel.innerHTML = ""; return; }
    panel.hidden = false;
    state.moduleRouting = sanitizeModuleRouting(state.moduleRouting);
    syncPackageInclusion();
    const metrics = moduleMetrics();
    const route = (router.presets || []).find(item => item.id === metrics.routing.routeId);
    const source = routerEntry();
    const sourceState = moduleSourceState(source);
    const packageLabel = state.packageMode === "complete" ? "PROFIL COMPLET" : state.packageMode === "minimal" ? "PROFIL MINIMAL" : "PROFIL CIBLÉ";
    const packageCount = expectedPackageCount();
    panel.innerHTML = `
      <div class="module-router-head">
        <div><p class="kicker">COMPÉTENCES DU PROFIL</p><h3>${esc(state.identity.name)} · catalogue canonique</h3><p>Choisir une route règle les compétences actives. Le mode du paquet décide ce qui sera copié dans le ZIP final.</p></div>
        <div class="module-router-counts"><span><b>${metrics.referenced}</b> modules</span><span><b>${metrics.loaded.length}</b> chargés</span><span><b>${metrics.active}</b> actifs</span></div>
      </div>
      <div class="module-package-summary"><div><b>${packageLabel}</b><small> · ${metrics.routing.included.length} module(s) inclus</small></div><span>${packageCount} fichiers attendus</span></div>
      <div class="module-route-presets">${(router.presets || []).map(item => `<button type="button" class="${item.id === metrics.routing.routeId ? "active" : ""}" data-module-preset="${esc(item.id)}">${esc(item.label)}</button>`).join("")}</div>
      ${route ? `<div class="rule-box"><b>Route active · ${esc(route.label)}</b><p>${route.modules.length} compétence(s) active(s). Le profil complet conserve néanmoins tout le catalogue.</p></div>` : `<div class="truth-box"><strong>Aucune route active</strong><p>Choisir une route pour préparer une mission ciblée.</p></div>`}
      <details class="advanced-details module-advanced">
        <summary>Voir les ${metrics.referenced} modules et les états techniques</summary>
        <div class="module-router-source"><div><b>README du routeur · ${sourceState.status === "ready" ? "CHARGÉ" : source.privacy === "public" ? "CHARGEMENT" : "À CHARGER"}</b><code>${esc(source.path)}</code></div><span class="status">${source.privacy === "private" ? "PACK PRIVÉ" : "SOURCE PUBLIQUE"}</span></div>
        <div class="module-catalog">${metrics.catalog.map(entry => {
          const loaded = moduleSourceState(entry).status === "ready";
          const active = metrics.routing.active.includes(entry.path);
          const included = metrics.routing.included.includes(entry.path);
          return `<article class="module-card ${active ? "active" : ""} ${included ? "included" : ""}">
            <div class="module-card-title"><span class="module-number">${esc(entry.id)}</span><div><b>${esc(entry.label)}</b><code>${esc(entry.path)}</code></div></div>
            <div class="module-state-badges"><span>RÉFÉRENCÉ</span><span class="${loaded ? "ready" : ""}">${loaded ? "CHARGÉ" : entry.privacy === "public" ? "CHARGEMENT" : "À CHARGER"}</span>${active ? '<span class="active">ACTIF</span>' : ''}${included ? '<span class="included">INCLUS</span>' : ''}</div>
            <div class="module-card-controls"><label><input type="checkbox" data-module-active="${esc(entry.path)}" ${active ? "checked" : ""}> Actif</label>${state.packageMode === "targeted" ? `<label><input type="checkbox" data-module-include="${esc(entry.path)}" ${included ? "checked" : ""}> Inclure</label>` : ""}</div>
          </article>`;
        }).join("")}</div>
      </details>`;
  }

  function creatorPackMetrics() {
    const core = isCanonicalProfile() ? importedCanonical("core") : importedKind("core");
    const persona = isCanonicalProfile() ? importedCanonical("persona") : importedKind("persona");
    const router = profileModuleRouter() ? moduleSourceState(routerEntry()).status === "ready" : true;
    const catalog = moduleCatalog();
    const loadedModules = catalog.filter(item => moduleSourceState(item).status === "ready");
    return {core:Boolean(core), persona:Boolean(persona), router, loadedModules, expected:2 + (catalog.length ? catalog.length + 1 : 0)};
  }

  function renderSourceGuide() {
    const grid = $("#packageModeGrid");
    if (!grid) return;
    syncPackageInclusion();
    const metrics = creatorPackMetrics();
    const hasRouter = Boolean(profileModuleRouter());
    const recognized = Number(metrics.core) + Number(metrics.persona) + (hasRouter ? Number(metrics.router) + metrics.loadedModules.length : 0);
    const expectedSources = hasRouter ? metrics.expected : 2;
    const completeCount = 8 + (hasRouter ? moduleCatalog().length + 1 : 0);
    const targetedCount = 8 + (state.moduleRouting.active.length ? state.moduleRouting.active.length + 1 : 0);
    $("#completePackageCount").textContent = `${completeCount} fichiers`;
    $("#targetedPackageCount").textContent = `${targetedCount} fichiers`;
    $$("[data-package-mode]", grid).forEach(button => button.classList.toggle("active", button.dataset.packageMode === state.packageMode));
    const score = $("#packScore");
    score.innerHTML = `<b>${recognized} / ${expectedSources}</b><span>sources reconnues</span>`;
    score.classList.toggle("ready", recognized === expectedSources);
    $("#sourceStepStatus").textContent = recognized === expectedSources ? "PACK COMPLET" : recognized ? "PACK INCOMPLET" : "PACK ATTENDU";
    $("#sourceStepStatus").style.color = recognized === expectedSources ? "var(--green)" : "var(--gold)";
    $("#sourceChecklist").innerHTML = [
      [metrics.core, "Core", metrics.core ? "reconnu" : "manquant"],
      [metrics.persona, "Persona", metrics.persona ? "reconnue" : "manquante"],
      [metrics.router, "Routeur", metrics.router ? "README reconnu" : hasRouter ? "manquant" : "non requis"],
      [!hasRouter || metrics.loadedModules.length === moduleCatalog().length, "Modules", hasRouter ? `${metrics.loadedModules.length} / ${moduleCatalog().length}` : "non requis"]
    ].map(item => `<div class="source-check ${item[0] ? "ok" : "warn"}"><i>${item[0] ? "✓" : "!"}</i><div><b>${esc(item[1])}</b><small>${esc(item[2])}</small></div></div>`).join("");
    let next = "charger le pack privé complet.";
    if (recognized === expectedSources && !state.canonicalConfirmed) next = "cocher la confirmation humaine ci-dessus.";
    else if (recognized === expectedSources && state.canonicalConfirmed) next = "ouvrir l’étape 07 pour vérifier le Core et la Persona.";
    $("#sourceNext").innerHTML = `<b>Prochaine action :</b><span>${esc(next)}</span>`;
  }

  function packagePreviewFiles() {
    const root = cleanName(state.identity.name);
    const list = [
      `${root}/README_FIRST.md`, finalFileName("boot"), finalFileName("manifest"), finalFileName("block"), finalFileName("links"), finalFileName("spec"),
      `CORE/${pathFileName(state.identity.corePath || defaultCoreTarget())}`,
      `CORE/${pathFileName(state.identity.personaPath || defaultPersonaTarget())}`
    ];
    const included = selectedPackageEntries();
    if (included.length) {
      list.push(`SOURCES/${routerEntry().path}`);
      for (const entry of included) list.push(`SOURCES/${entry.path}`);
    }
    return list;
  }

  function advisorModel() {
    const guide = DATA.advisor?.steps?.[state.step] || {title:"Créatrice accompagne la Forge",message:"Le profil actif reste disponible.",action:"Continuer"};
    const p = profile();
    const i = state.identity;
    const checks = [];
    let stateLabel = "GUIDE ACTIF", actionType = "next", actionLabel = guide.action || "Continuer", title = guide.title, message = guide.message;
    if (state.step === 0) {
      checks.push(["ok", p.name]); checks.push(["ok", p.kind === "new" ? "Création guidée" : "Profil canonique"]);
    } else if (state.step === 1) {
      checks.push([i.role ? "ok" : "warn", i.role ? "Mission inscrite" : "Mission à préciser"]); checks.push([i.outputs.length ? "ok" : "warn", `${i.outputs.length} sortie(s) préparée(s)`]);
    } else if (state.step === 2) {
      checks.push([i.agents.length ? "ok" : "warn", `${i.agents.length} agent(s) interne(s)`]); checks.push(["ok", "Une voix finale"]);
    } else if (state.step === 3) {
      checks.push([i.heritage.length ? "ok" : "warn", `${i.heritage.length} héritage(s)`]); checks.push([i.modules.length ? "ok" : "warn", `${i.modules.length} module(s) canoniques`]);
    } else if (state.step === 4) {
      checks.push([i.tone ? "ok" : "warn", i.tone ? "Voix définie" : "Voix à préciser"]); checks.push([i.stopPoint ? "ok" : "warn", i.stopPoint ? "Stop Point défini" : "Stop Point à préciser"]);
    } else if (state.step === 5) {
      title = "Une seule action : charger le pack";
      message = p.privacy === "private" && profileModuleRouter() ? "Le ZIP privé complet réunit les 18 sources. La Forge l’ouvre elle-même et prépare le profil complet." : "Réunir les sources réelles du profil.";
      const m = creatorPackMetrics();
      const expected = profileModuleRouter() ? m.expected : 2;
      const recognized = Number(m.core) + Number(m.persona) + (profileModuleRouter() ? Number(m.router) + m.loadedModules.length : 0);
      checks.push([m.core ? "ok" : "warn", m.core ? "Core reconnu" : "Core attendu"]);
      checks.push([m.persona ? "ok" : "warn", m.persona ? "Persona reconnue" : "Persona attendue"]);
      if (profileModuleRouter()) checks.push([recognized === expected ? "ok" : "warn", `${recognized} / ${expected} sources reconnues`]);
      checks.push([state.canonicalConfirmed ? "ok" : "warn", state.canonicalConfirmed ? "Confirmation humaine" : "Confirmation à cocher"]);
      if (recognized < expected && p.privacy === "private") { stateLabel = "PACK À CHARGER"; actionType = "pack"; actionLabel = "Charger le pack privé"; }
      else if (!state.canonicalConfirmed) { stateLabel = "CONFIRMATION ATTENDUE"; actionType = "confirm"; actionLabel = "Voir la confirmation"; }
      else { stateLabel = "SOURCES PRÊTES"; actionType = "goto-verify"; actionLabel = "Vérifier Core + Persona"; }
    } else if (state.step === 6) {
      title = "Vérification des vrais fichiers";
      message = "Le contenu affiché doit correspondre au Core et à la Persona canoniques. Aucun texte de remplacement n’est généré.";
      const core = canonicalSourceState("core"), persona = canonicalSourceState("persona");
      checks.push([core.status === "ready" ? "ok" : "warn", core.status === "ready" ? "Core réel chargé" : "Core réel non chargé"]);
      checks.push([persona.status === "ready" ? "ok" : "warn", persona.status === "ready" ? "Persona réelle chargée" : "Persona réelle non chargée"]);
      if (core.status === "ready" && persona.status === "ready" && state.canonicalConfirmed) { stateLabel = "VÉRIFIÉ"; actionType = "goto-final"; actionLabel = "Contrôler le paquet final"; }
      else { stateLabel = "SOURCES INCOMPLÈTES"; actionType = "sources"; actionLabel = "Revenir au chargement"; }
    } else if (state.step === 7) {
      const audit = finalAudit();
      checks.push([audit.ready ? "ok" : "warn", audit.ready ? `${expectedPackageCount()} fichiers prêts` : "Paquet incomplet"]);
      checks.push(["ok", state.packageMode === "complete" ? "Profil complet" : state.packageMode === "minimal" ? "Profil minimal" : "Profil ciblé"]);
      if (audit.ready) { stateLabel = "PRÊT À FORGER"; actionType = "forge"; actionLabel = `Télécharger ${expectedPackageCount()} fichiers`; }
      else { stateLabel = "À COMPLÉTER"; actionType = "sources"; actionLabel = "Corriger les sources"; }
    }
    return {...guide,title,message,profileNote:DATA.advisor?.profiles?.[state.profileId] || i.role || "",checks,stateLabel,actionType,actionLabel};
  }

  function renderAdvisor() {
    const card = $("#advisorCard");
    if (!card) return;
    const model = advisorModel();
    $("#advisorState").textContent = model.stateLabel;
    $("#advisorTitle").textContent = model.title;
    $("#advisorMessage").textContent = `${model.message} ${model.profileNote}`.trim();
    $("#advisorChecks").innerHTML = model.checks.map(item =>
      `<span class="${item[0]}"><i>${item[0] === "ok" ? "✓" : "◇"}</i>${esc(item[1])}</span>`
    ).join("");
    const action = $("#advisorAction");
    action.textContent = `${model.actionLabel} →`;
    action.dataset.advisorAction = model.actionType;
  }

  function renderCompletion(audit = finalAudit()) {
    const card = $("#completionCard");
    if (!card) return;
    card.hidden = !audit.ready;
    if (!audit.ready) return;
    $("#completionTitle").textContent = `${state.identity.name} est prête`;
    $("#completionMessage").textContent = `${expectedPackageCount()} fichiers ont été contrôlés avant compilation. Le paquet peut être téléchargé.`;
  }

  function activateStep(index, focus = false) {
    state.step = Math.max(0, Math.min(STEPS.length - 1, Number(index) || 0));
    persist();
    $$(".panel").forEach((panel, panelIndex) => panel.classList.toggle("active", panelIndex === state.step));
    const step = stepModel(state.step);
    $("#stepCounter").textContent = `ÉTAPE ${step[0]} SUR 08`;
    $("#stepTitle").textContent = step[1];
    $("#stepDescription").textContent = step[2];
    $("#progressValue").textContent = `${Math.round((state.step + 1) / STEPS.length * 100)}%`;
    $("#previousTop").disabled = $("#previousBottom").disabled = state.step === 0;
    $("#nextTop").disabled = $("#nextBottom").disabled = state.step === STEPS.length - 1;
    renderStepNav();
    renderMatrix();
    renderLiveProfile();
    renderAdvisor();
    if (state.step === 5) { renderImports(); renderSourceGuide(); }
    if (state.step === 6) renderProposal();
    if (state.step === 7) renderFinal();
    if (focus) requestAnimationFrame(() => {
      const activePanel = $$(".panel")[state.step];
      activePanel?.scrollIntoView({behavior:"smooth", block:"start"});
      setTimeout(() => window.scrollBy({top:-105, behavior:"smooth"}), 280);
    });
  }

  function proposalCore() {
    const i = state.identity;
    return `# ${i.name.toUpperCase()} — Multi-Agent Core — PROPOSITION

Statut : proposition locale non canonique  
Famille : ${i.family || "—"}  
Rôle : ${i.role || "—"}  
Niveau : ${i.level || "Aerith-10"}  
Mode principal : ${i.mode || "—"}  
Extension Persona : ${defaultPersonaTarget()}  
Mémoire / base métier : ${i.memoryPath || "À définir"}  
Chemin cible après validation : ${defaultCoreTarget()}  
Version Forge : ${DATA.version}

---

## 1. Identité

${i.name} est une spécialité dédiée à la mission suivante :

${i.role || "Rôle à définir."}

Elle ne remplace pas les autres profils. Elle absorbe uniquement les ressources qui servent sa fonction.

## 2. Problème réel

${i.problem || "Problème à définir."}

## 3. Utilisateurs

${i.users || "Utilisateurs à définir."}

## 4. Sorties attendues

${i.outputs.length ? i.outputs.map(item => `- ${item}`).join("\n") : "- À définir"}

## 5. Formule centrale

**${i.formula || "Intention → Ressources → Destination utile."}**

## 6. Architecture multi-agent

${i.agents.length ? i.agents.map((item, index) => `${index + 1}. ${item}`).join("\n") : "1. À définir"}

Une seule voix finale porte la réponse. Les agents internes ne parlent pas tous simultanément.

## 7. Héritages

${i.heritage.length ? i.heritage.map(id => {
      const item = DATA.heritage.find(entry => entry.id === id);
      return `- ${item?.name || id} — ${item?.role || ""}`;
    }).join("\n") : "- Aucun héritage supplémentaire"}

## 8. Modules et sources

${i.modules.length ? i.modules.map(item => `- ${item}`).join("\n") : "- Aucun module complémentaire"}

Règle de non-duplication :

${i.nonDuplication || "Référencer les sources existantes avant toute création."}

## 9. Garde-fous

${i.guardrails.length ? i.guardrails.map(item => `- ${item}`).join("\n") : "- À définir"}

## 10. Stop Point

${i.stopPoint || "La mission est terminée lorsque la destination utile est livrée."}

---

## Verrou de canonisation

Ce fichier est une PROPOSITION. Il doit être relu, corrigé et validé humainement avant suppression du suffixe PROPOSAL et intégration dans le dépôt privé.
`;
  }

  function proposalPersona() {
    const i = state.identity;
    return `# ${i.name.toUpperCase()} — Persona Operating Layer — PROPOSITION

**Chemin cible après validation :** \`${defaultPersonaTarget()}\`  
**Core requis :** \`${defaultCoreTarget()}\`  
**Statut :** proposition locale non canonique  
**Version Forge :** ${DATA.version}

---

## 1. Fonction

Cette Persona définit comment ${i.name} répond, travaille, choisit son mode et ferme une mission. Elle ne remplace jamais le Core.

## 2. Voix et ton

${i.tone || "À définir."}

## 3. Modes de session

${i.modes.length ? i.modes.map(item => `- ${item}`).join("\n") : "- standard"}

## 4. Relation et rythme

- Comprendre la destination avant d’élargir la réponse.
- Ne pas répéter une information déjà fournie.
- Distinguer les faits des hypothèses et des adaptations.
- Préserver les décisions validées.

## 5. Confidentialité

${i.confidentiality || "Privée par défaut."}

## 6. Garde-fous

${i.guardrails.length ? i.guardrails.map(item => `- ${item}`).join("\n") : "- Ne pas inventer une source absente."}

## 7. Stop Point

${i.stopPoint || "La mission est terminée lorsque la destination utile est livrée."}

---

## Verrou de canonisation

Cette Persona est une PROPOSITION. Christophe la relit et la canonise humainement.
`;
  }

  function sourceReferences() {
    const refs = [];
    const core = resolveSource(state.identity.corePath || defaultCoreTarget());
    const persona = resolveSource(state.identity.personaPath || defaultPersonaTarget());
    const heart = resolveSource("private:core/AERITH_LIVING_REFLECTION_HEART.md");
    const memory = resolveSource(state.identity.memoryPath);
    if (core) refs.push({role:"Core", ...core});
    if (persona) refs.push({role:"Persona", ...persona});
    if (heart) refs.push({role:"Living Reflection Heart", ...heart});
    if (memory) refs.push({role:"Mémoire / base métier", ...memory});
    for (const item of state.identity.modules) {
      const resolved = resolveSource(item);
      if (resolved) refs.push({role:"Module", ...resolved});
    }
    return refs;
  }

  function linksDocument() {
    const refs = sourceReferences();
    const groups = ["Core", "Persona", "Living Reflection Heart", "Mémoire / base métier", "Module"];
    const linesOut = [`# LIENS GITHUB / RAW — ${state.identity.name}`, ""];
    for (const group of groups) {
      const items = refs.filter(item => item.role === group);
      if (!items.length) continue;
      linesOut.push(`## ${group}`, "");
      for (const item of items) {
        linesOut.push(`- ${item.label}`);
        linesOut.push(`  - GitHub : ${item.url}`);
        linesOut.push(`  - Raw : ${item.raw}`);
      }
      linesOut.push("");
    }
    linesOut.push("## Règle d’accès", "", "Les URLs privées sont des références canoniques.", "Si un LLM local ne peut pas les lire, fournir les fichiers localement.", "Ne jamais prétendre avoir chargé une URL inaccessible.");
    return linesOut.join("\n");
  }

  function blockLLM() {
    const refs = sourceReferences();
    const core = refs.find(item => item.role === "Core");
    const persona = refs.find(item => item.role === "Persona");
    const heart = refs.find(item => item.role === "Living Reflection Heart");
    const memory = refs.find(item => item.role === "Mémoire / base métier");
    const modules = refs.filter(item => item.role === "Module");
    return `# BLOCK LLM — ACTIVATION COURTE

Tu es ${state.identity.name}.

Charge dans cet ordre :

1. Core : ${core?.raw || "CORE NON DÉFINI"}
2. Persona : ${persona?.raw || "PERSONA NON DÉFINIE"}
3. Living Reflection Heart : ${heart?.raw || "HEART NON DÉFINI"}
${memory ? `4. Mémoire / base métier : ${memory.raw}` : ""}

Si une URL privée est inaccessible, demande le fichier local correspondant.
Ne prétends jamais avoir chargé une source inaccessible ou absente.

Mission :
${state.identity.role || "Suivre strictement la mission définie dans le Core."}

Héritages disponibles :
${state.identity.heritage.length ? state.identity.heritage.map(id => `- ${DATA.heritage.find(item => item.id === id)?.name || id}`).join("\n") : "- Aucun"}

Modules ciblés :
${modules.length ? modules.map(item => `- ${item.label}\n  Raw : ${item.raw}`).join("\n") : "- Aucun module complémentaire"}

Règles :
${state.identity.guardrails.length ? state.identity.guardrails.map(item => `- ${item}`).join("\n") : "- Ne pas inventer."}
- Module présent ≠ module actif.
- Lire le Core et la Persona sans les réécrire.
- Produire la destination utile puis appliquer le Stop Point.
`;
  }

  function designBrief() {
    const i = state.identity;
    return `# BRIEF DE VALIDATION — ${i.name}

Version Forge : ${DATA.version}
Statut : ${isNew() ? "proposition locale non canonique" : "profil existant chargé dans le parcours unifié"}

## Identité

- Nom : ${i.name}
- Famille : ${i.family || "—"}
- Niveau : ${i.level || "—"}
- Mode : ${i.mode || "—"}
- Rôle : ${i.role || "—"}

## Architecture

- Agents : ${i.agents.length}
- Héritages : ${i.heritage.join(", ") || "aucun"}
- Modules référencés : ${i.modules.length}

## Canonisation attendue

- Core : ${defaultCoreTarget()}
- Persona : ${defaultPersonaTarget()}

## Points à vérifier humainement

- La spécialité ne duplique-t-elle pas un profil existant ?
- Chaque agent change-t-il une décision réelle ?
- Les modules sont-ils référencés sans copie inutile ?
- Les garde-fous protègent-ils la mission ?
- Le Stop Point est-il explicite ?
`;
  }

  function proposalAudit() {
    const i = state.identity;
    if (!isCanonicalProfile()) {
      return [
        [i.name && /^Aerith-10\b/i.test(i.name) ? "ok" : "warn", "Identité", i.name || "Manquante"],
        [i.role ? "ok" : "error", "Mission", i.role ? "Définie" : "Manquante"],
        [i.agents.length ? "ok" : "warn", "Agents", `${i.agents.length} déclaré(s)`],
        [i.stopPoint ? "ok" : "error", "Stop Point", i.stopPoint ? "Défini" : "Manquant"]
      ];
    }
    const core = canonicalSourceState("core");
    const persona = canonicalSourceState("persona");
    const label = value => value.status === "ready" ? "Chargé intégralement" : value.status === "loading" ? "Chargement…" : value.status === "error" ? "Erreur de chargement" : "Non chargé";
    return [
      ["ok", "Profil", i.name],
      [core.status === "ready" ? "ok" : core.status === "error" ? "error" : "warn", "Core réel", label(core)],
      [persona.status === "ready" ? "ok" : persona.status === "error" ? "error" : "warn", "Persona réelle", label(persona)],
      ["ok", "Génération", "Aucun faux Core ni fausse Persona"]
    ];
  }

  function existingProfileBrief() {
    const core = canonicalSourceState("core");
    const persona = canonicalSourceState("persona");
    const stateLabel = value => value.status === "ready" ? "contenu chargé" : value.status === "loading" ? "chargement en cours" : value.status === "error" ? `erreur : ${value.error}` : "contenu non chargé";
    return `# FICHE FACTUELLE DU PROFIL — ${state.identity.name}

Cette fiche n’est ni le Core ni la Persona. Elle décrit uniquement l’état des sources dans la Forge.

- Profil : ${state.identity.name}
- Type : profil existant
- Core : ${state.identity.corePath || defaultCoreTarget() || "chemin non défini"}
- État Core : ${stateLabel(core)}
- Persona : ${state.identity.personaPath || defaultPersonaTarget() || "chemin non défini"}
- État Persona : ${stateLabel(persona)}
- Modules : ${state.identity.modules.length} référence(s)

Règle : aucun contenu de remplacement n’est généré pour ce profil.
`;
  }

  function canonicalPreview(kind) {
    const source = canonicalSourceState(kind);
    if (source.status === "ready") return source.text;
    const label = kind === "core" ? "CORE" : "PERSONA";
    const path = canonicalPath(kind) || (kind === "core" ? defaultCoreTarget() : defaultPersonaTarget());
    if (source.status === "loading") return `${label} CANONIQUE — CHARGEMENT EN COURS\n\nSource incluse : ${path}`;
    if (source.status === "error") return `${label} CANONIQUE — ERREUR DE CHARGEMENT\n\nSource : ${path}\nErreur : ${source.error}\n\nAucun texte de remplacement n’est généré.`;
    return `${label} CANONIQUE — CONTENU NON CHARGÉ\n\nProfil : ${state.identity.name}\nSource attendue : ${path}\n\nImporter le fichier réel à l’étape 06.\nAucun texte de remplacement n’est généré.`;
  }

  function renderProposal() {
    const panel = document.querySelector('.panel[data-step="6"]');
    const heading = panel?.querySelector(".panel-head h2");
    const description = panel?.querySelector(".panel-head p:last-child");
    const tabs = $$("#proposalTabs button");
    const coreButton = $("#downloadProposalCore");
    const personaButton = $("#downloadProposalPersona");
    const briefButton = $("#downloadProposalBrief");
    const zipButton = $("#downloadProposalZip");
    const items = proposalAudit();
    $("#proposalAudit").innerHTML = items.map(item => `<div class="audit-tile ${item[0]}"><span>${esc(item[1])}</span><b>${esc(item[2])}</b></div>`).join("");

    if (!isCanonicalProfile()) {
      if (heading) heading.textContent = "Découvrir la proposition de Créatrice";
      if (description) description.textContent = "Créatrice rassemble les décisions prises dans trois documents de travail : Core proposé, Persona proposée et brief de validation.";
      if (tabs[0]) tabs[0].textContent = "Core";
      if (tabs[1]) tabs[1].textContent = "Persona";
      if (tabs[2]) tabs[2].textContent = "Brief";
      const docs = {core:proposalCore(), persona:proposalPersona(), brief:designBrief()};
      $("#proposalPreview").textContent = docs[state.proposalPreview] || docs.core;
      coreButton.disabled = personaButton.disabled = briefButton.disabled = zipButton.disabled = false;
      coreButton.querySelector("b").textContent = "Télécharger";
      personaButton.querySelector("b").textContent = "Télécharger";
      briefButton.querySelector("b").textContent = "Télécharger";
      zipButton.textContent = "TÉLÉCHARGER LE ZIP DE PROPOSITION · 3 FICHIERS";
      $("#canonRoute").innerHTML = `<b>Étape de canonisation</b><p>Relire la proposition, valider les deux fichiers, puis les intégrer aux chemins canoniques indiqués avant de réunir les sources finales.</p><code>${esc(defaultCoreTarget())}</code><code>${esc(defaultPersonaTarget())}</code>`;
    } else {
      if (heading) heading.textContent = "Consulter le Core et la Persona réels";
      if (description) description.textContent = "La Forge affiche uniquement les fichiers réellement inclus ou importés. Elle ne fabrique aucun Core ni aucune Persona de remplacement.";
      if (tabs[0]) tabs[0].textContent = "Core réel";
      if (tabs[1]) tabs[1].textContent = "Persona réelle";
      if (tabs[2]) tabs[2].textContent = "Fiche";
      const core = canonicalSourceState("core");
      const persona = canonicalSourceState("persona");
      const docs = {core:canonicalPreview("core"), persona:canonicalPreview("persona"), brief:existingProfileBrief()};
      $("#proposalPreview").textContent = docs[state.proposalPreview] || docs.core;
      coreButton.disabled = core.status !== "ready";
      personaButton.disabled = persona.status !== "ready";
      briefButton.disabled = false;
      zipButton.disabled = core.status !== "ready" || persona.status !== "ready";
      coreButton.querySelector("b").textContent = core.status === "ready" ? "Télécharger le fichier réel" : "Fichier non chargé";
      personaButton.querySelector("b").textContent = persona.status === "ready" ? "Télécharger le fichier réel" : "Fichier non chargé";
      briefButton.querySelector("b").textContent = "Télécharger la fiche";
      zipButton.textContent = "TÉLÉCHARGER LES SOURCES RÉELLES · 3 FICHIERS";
      const verificationStatus = $("#verificationStepStatus");
      if (verificationStatus) { verificationStatus.textContent = core.status === "ready" && persona.status === "ready" ? "SOURCES RÉELLES" : "À CHARGER"; verificationStatus.style.color = core.status === "ready" && persona.status === "ready" ? "var(--green)" : "var(--gold)"; }
      const access = profile().privacy === "public"
        ? "Les deux sources publiques sont incluses dans cette Forge."
        : "Importer les deux fichiers privés réels à l’étape 07 pour les consulter et les exporter.";
      $("#canonRoute").innerHTML = `<b>Profil existant — lecture source-fidèle</b><p>${esc(access)} Aucun document PROPOSAL n’est produit.</p><code>${esc(defaultCoreTarget())}</code><code>${esc(defaultPersonaTarget())}</code>`;
    }
    $$("#proposalTabs button").forEach(button => button.classList.toggle("active", button.dataset.preview === state.proposalPreview));
  }

  function fieldFromText(text, labels) {
    for (const label of labels) {
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`^(?:\\*\\*)?${escaped}(?:\\*\\*)?\\s*:\\s*(.+)$`, "im");
      const match = text.match(regex);
      if (match) return stripMarkdown(match[1]);
    }
    return "";
  }

  function parseCore(text, fileName) {
    const heading = text.match(/^#\s+(.+)$/m)?.[1] || "";
    const name = stripMarkdown(heading).replace(/\s+[—-]\s+Multi-Agent Core.*$/i, "").replace(/\s+[—-]\s+PROPOSITION.*$/i, "").trim();
    return {
      name: name || fileName.replace(/\.md$/i, "").replaceAll("_", " "),
      family: fieldFromText(text, ["Famille"]),
      level: fieldFromText(text, ["Niveau"]),
      role: fieldFromText(text, ["Rôle"]),
      mode: fieldFromText(text, ["Mode principal"]),
      status: fieldFromText(text, ["Statut"]),
      personaPath: fieldFromText(text, ["Extension Persona"]),
      memoryPath: fieldFromText(text, ["Mémoire partagée", "Mémoire partagée requise", "Base métier publique"]),
      corePath: fieldFromText(text, ["Fichier canonique", "Fichier", "Chemin cible"]),
      imagePath: fieldFromText(text, ["Image"]),
      version: fieldFromText(text, ["Version"])
    };
  }

  function kindForFile(file, content = "") {
    const name = file.name.toUpperCase();
    const normalizedName = normalizeDownloadedFileName(file.name);
    const proposal = name.includes("PROPOSAL") || /proposition locale non canonique/i.test(content);
    if (file.type.startsWith("image/")) return "visual";
    if (isCanonicalProfile() && normalizedName === expectedCanonicalFileName("persona")) return proposal ? "persona-proposal" : "persona";
    if (isCanonicalProfile() && normalizedName === expectedCanonicalFileName("core")) return proposal ? "core-proposal" : "core";
    if (name.includes("PERSONA_OPERATING_LAYER") || /^#.+Persona Operating Layer/im.test(content)) return proposal ? "persona-proposal" : "persona";
    if (name.includes("MULTI_AGENT_CORE") || /^#.+Multi-Agent Core/im.test(content)) return proposal ? "core-proposal" : "core";
    if (name.endsWith(".ZIP")) return "pack";
    if (name.endsWith(".MD")) return "module";
    if (name.endsWith(".JSON")) return "data";
    return "source";
  }

  function mergeParsed(parsed) {
    const keys = ["name", "family", "level", "role", "mode", "status", "personaPath", "memoryPath", "corePath", "imagePath", "version"];
    for (const key of keys) if (parsed[key]) state.identity[key] = parsed[key].replace(/`/g, "");
  }

  async function addRawFiles(files) {
    let added = 0;
    let duplicates = 0;
    for (const file of files) {
      const path = cleanPath(file.__forgePath || file.webkitRelativePath || file.name);
      const key = `${path.toLowerCase()}|${file.size}|${file.lastModified}`;
      if (state.imports.some(item => item.key === key)) { duplicates += 1; continue; }
      let text = "";
      if (/\.(md|txt|json)$/i.test(file.name) && file.size < 5_000_000) {
        try { text = await file.text(); } catch {}
      }
      const kind = kindForFile(file, text);
      state.imports.push({file, path, key, kind, text});
      added += 1;
      if (!isCanonicalProfile() && kind === "core" && text) mergeParsed(parseCore(text, file.name));
      if (!isCanonicalProfile() && kind === "persona" && text) {
        const coreRequired = fieldFromText(text, ["Core requis"]);
        const personaPath = fieldFromText(text, ["Chemin cible"]);
        const version = fieldFromText(text, ["Version"]);
        if (coreRequired && !state.identity.corePath) state.identity.corePath = coreRequired.replace(/`/g, "");
        if (personaPath) state.identity.personaPath = personaPath.replace(/`/g, "");
        if (version && !state.identity.version) state.identity.version = version;
      }
      if (kind === "visual" && !state.visualUrl) state.visualUrl = URL.createObjectURL(file);
    }
    persist();
    renderAll();
    showToast(added ? `${added} fichier(s) reconnu(s).${duplicates ? ` ${duplicates} doublon(s) ignoré(s).` : ""}` : "Aucun nouveau fichier.");
  }

  async function expandZipFile(file) {
    if (!window.JSZip) throw new Error("Lecteur ZIP local indisponible.");
    const zip = await window.JSZip.loadAsync(file);
    const extracted = [];
    for (const [path, entry] of Object.entries(zip.files)) {
      if (entry.dir || path.startsWith("__MACOSX/") || path.endsWith("/.DS_Store")) continue;
      const bytes = await entry.async("uint8array");
      const name = pathFileName(path);
      const type = /\.md$/i.test(name) ? "text/markdown" : /\.json$/i.test(name) ? "application/json" : /\.txt$/i.test(name) ? "text/plain" : "application/octet-stream";
      const extractedFile = new File([bytes], name, {type, lastModified:file.lastModified || Date.now()});
      Object.defineProperty(extractedFile, "__forgePath", {value:cleanPath(path), configurable:false});
      extracted.push(extractedFile);
    }
    state.packInfo = {name:file.name, entries:extracted.length, error:""};
    return extracted;
  }

  async function addFiles(files) {
    const expanded = [];
    try {
      for (const file of Array.from(files || [])) {
        if (/\.zip$/i.test(file.name)) expanded.push(...await expandZipFile(file));
        else expanded.push(file);
      }
      await addRawFiles(expanded);
    } catch (error) {
      state.packInfo = {name:"", entries:0, error:error.message || String(error)};
      persist(); renderAll(); showToast(`ZIP non lu : ${state.packInfo.error}`);
    }
  }

  function renderImports() {
    const total = state.imports.reduce((sum, item) => sum + item.file.size, 0);
    $("#importCount").textContent = state.imports.length;
    $("#importSize").textContent = formatSize(total);
    const packNotice = state.packInfo?.name ? `<div class="route-box"><b>Pack chargé : ${esc(state.packInfo.name)}</b><p>${state.packInfo.entries} entrée(s) ouvertes localement et contrôlées par la Forge.</p></div>` : "";
    $("#importList").innerHTML = packNotice + (state.imports.length ? state.imports.map((item, index) => `
      <div class="import-item">
        <span class="file-kind">${esc(item.kind.toUpperCase())}</span>
        <span><b>${esc(item.path)}</b><small>${formatSize(item.file.size)}</small></span>
        <button class="remove-file" type="button" data-remove-import="${index}">Retirer</button>
      </div>`).join("") : `<div class="route-box"><b>Aucun import local</b><p>Charger le pack privé complet pour réunir automatiquement les sources.</p></div>`);
  }

  function importedKind(kind) {
    return state.imports.find(item => item.kind === kind) || null;
  }

  function finalAudit() {
    const p = profile();
    const items = [];
    let ready = true;
    let completed = 0;
    let total = 0;
    const coreProposal = importedKind("core-proposal");
    const personaProposal = importedKind("persona-proposal");
    const add = (type, title, detail, counts = true, done = type === "ok") => {
      items.push([type, title, detail]);
      if (counts) { total += 1; if (done) completed += 1; }
    };

    if (state.identity.name) add("ok", "Identité", `${state.identity.name} est définie.`);
    else { add("error", "Identité", "Nom manquant.", true, false); ready = false; }

    if (state.identity.role) add("ok", "Mission", "Rôle défini.");
    else { add("error", "Mission", "Rôle manquant.", true, false); ready = false; }

    if (isCanonicalProfile()) {
      if (p.privacy === "public") {
        const core = canonicalSourceState("core");
        const persona = canonicalSourceState("persona");
        if (core.status === "ready") add("ok", "Core canonique réel", `${pathFileName(p.corePath)} chargé intégralement.`);
        else { add(core.status === "error" ? "error" : "warn", "Core canonique réel", core.status === "error" ? core.error : "Chargement en cours.", true, false); ready = false; }
        if (persona.status === "ready") add("ok", "Persona canonique réelle", `${pathFileName(p.personaPath)} chargée intégralement.`);
        else { add(persona.status === "error" ? "error" : "warn", "Persona canonique réelle", persona.status === "error" ? persona.error : "Chargement en cours.", true, false); ready = false; }
      } else {
        const core = importedCanonical("core");
        const persona = importedCanonical("persona");
        if (state.canonicalConfirmed) add("ok", "Validation humaine", "Confirmation enregistrée.");
        else { add("warn", "À valider", "Confirmation humaine attendue.", true, false); ready = false; }
        if (core) add("ok", "Core canonique exact", `${core.file.name} importé sans réécriture.`);
        else { add("warn", "À importer — Core", `${pathFileName(p.corePath)} est requis. Aucun texte de remplacement n’est généré.`, true, false); ready = false; }
        if (persona) add("ok", "Persona canonique exacte", `${persona.file.name} importée sans réécriture.`);
        else { add("warn", "À importer — Persona", `${pathFileName(p.personaPath)} est requise. Aucun texte de remplacement n’est généré.`, true, false); ready = false; }
      }
    } else {
      const core = importedKind("core");
      const persona = importedKind("persona");
      if (state.canonicalConfirmed) add("ok", "Validation humaine", "Confirmation enregistrée.");
      else { add("warn", "À valider", "Confirmation humaine attendue.", true, false); ready = false; }
      if (core) add("ok", "Core canonique", `${core.file.name} importé.`);
      else { add("warn", "À importer — Core", "Le Core validé est requis avant la forge finale.", true, false); ready = false; }
      if (persona) add("ok", "Persona canonique", `${persona.file.name} importée.`);
      else { add("warn", "À importer — Persona", "La Persona validée est requise avant la forge finale.", true, false); ready = false; }
      if (coreProposal) add("info", "Proposition Core", `${coreProposal.file.name} reste une proposition et n’entre pas dans le ZIP final.`, false);
      if (personaProposal) add("info", "Proposition Persona", `${personaProposal.file.name} reste une proposition et n’entre pas dans le ZIP final.`, false);
    }

    const corePath = state.identity.corePath || defaultCoreTarget();
    const personaPath = state.identity.personaPath || defaultPersonaTarget();
    if (corePath) add("ok", "Chemin Core", corePath);
    else { add("error", "Chemin Core", "Chemin manquant.", true, false); ready = false; }
    if (personaPath) add("ok", "Chemin Persona", personaPath);
    else { add("error", "Chemin Persona", "Chemin manquant.", true, false); ready = false; }

    if (profileModuleRouter()) {
      syncPackageInclusion();
      const metrics = moduleMetrics();
      const includedEntries = selectedPackageEntries();
      const missing = includedEntries.filter(item => moduleSourceState(item).status !== "ready");
      const routerState = includedEntries.length ? moduleSourceState(routerEntry()) : {status:"ready"};
      add("ok", "Catalogue canonique", `${metrics.referenced} module(s) référencé(s).`);
      add(metrics.active ? "ok" : "warn", "Route active", metrics.active ? `${metrics.active} compétence(s) active(s).` : "Aucune compétence active.", state.packageMode === "targeted", Boolean(metrics.active));
      if (state.packageMode === "complete") {
        if (includedEntries.length !== metrics.referenced) { add("error", "Profil complet incomplet", `${includedEntries.length} / ${metrics.referenced} modules inclus.`, true, false); ready = false; }
        else add("ok", "Profil complet", `${includedEntries.length} / ${metrics.referenced} modules inclus.`);
      } else if (state.packageMode === "minimal") add("info", "Profil minimal", "Aucun module n’est copié dans ce mode.", false);
      else if (!includedEntries.length) { add("error", "Profil ciblé vide", "Choisir une route contenant au moins un module.", true, false); ready = false; }
      else add("ok", "Profil ciblé", `${includedEntries.length} module(s) de la route seront inclus.`);
      if (includedEntries.length) {
        if (routerState.status !== "ready") { add("error", "README du routeur manquant", `${routerEntry().path} doit être chargé.`, true, false); ready = false; }
        else add("ok", "README du routeur", pathFileName(routerEntry().path));
        if (missing.length) { add("error", "Modules manquants", `${missing.length} fichier(s) ne sont pas chargés.`, true, false); ready = false; }
        else add("ok", "Modules réels", `${includedEntries.length} fichier(s) prêts, octet pour octet.`);
      }
      add(ready ? "ok" : "warn", "Total attendu", `${expectedPackageCount()} fichiers dans le ZIP final.`, false);
    } else if (state.identity.modules.length) add("ok", "Modules", `${state.identity.modules.length} référence(s).`);
    else add("info", "Modules", "Aucun module complémentaire.", false);
    if (state.identity.stopPoint) add("ok", "Stop Point", "Défini.");
    else { add("error", "Stop Point", "Manquant.", true, false); ready = false; }

    const validationPercent = total ? Math.round(completed / total * 100) : 0;
    return {ready, items, validationPercent, completed, total};
  }

  function profileSpec() {
    const audit = finalAudit();
    return {
      forge_version: DATA.version,
      unified_flow: true,
      profile_id: state.profileId,
      identity: clone(state.identity),
      canonical: {
        human_confirmed: state.canonicalConfirmed,
        core_path: state.identity.corePath || defaultCoreTarget(),
        persona_path: state.identity.personaPath || defaultPersonaTarget(),
        memory_or_business_base: state.identity.memoryPath || ""
      },
      source_references: sourceReferences(),
      imported_files: state.imports.map(item => ({path:item.path, kind:item.kind, size:item.file.size})),
      package_mode: state.packageMode,
      expected_package_files: expectedPackageCount(),
      module_routing: profileModuleRouter() ? {
        route_id: state.moduleRouting.routeId || "",
        router_path: profileModuleRouter().routerPath,
        referenced: moduleCatalog().map(item => ({id:item.id, label:item.label, path:item.path, privacy:item.privacy})),
        active: [...state.moduleRouting.active],
        included: [...state.moduleRouting.included]
      } : null,
      audit
    };
  }

  function bootDocument() {
    const i = state.identity;
    return `# BOOT — ${i.name.toUpperCase()}

Version Forge : ${DATA.version}
Parcours : unifié
Profil : ${state.profileId}

## Activation

Active ${i.name}.

## Sources

1. Core : ${i.corePath || defaultCoreTarget() || "NON DÉFINI"}
2. Persona : ${i.personaPath || defaultPersonaTarget() || "NON DÉFINIE"}
3. Living Reflection Heart : core/AERITH_LIVING_REFLECTION_HEART.md
${i.memoryPath ? `4. Mémoire / base métier : ${i.memoryPath}` : ""}

## Accès GitHub / Raw

${linksDocument()}

## Mission

${i.role || "Suivre strictement la mission définie dans le Core."}

## Héritages

${i.heritage.length ? i.heritage.map(id => `- ${DATA.heritage.find(item => item.id === id)?.name || id}`).join("\n") : "- Aucun"}

## Modules référencés

${i.modules.length ? i.modules.map(item => `- ${item}`).join("\n") : "- Aucun module complémentaire"}

## Route active

${profileModuleRouter() ? (state.moduleRouting.active.length ? state.moduleRouting.active.map(item => `- ${item}`).join("\n") : "- Aucune") : "- Routeur non applicable"}

## Modules inclus dans le ZIP

${profileModuleRouter() ? (state.moduleRouting.included.length ? state.moduleRouting.included.map(item => `- ${item}`).join("\n") : "- Aucun") : "- Non applicable"}

## Verrous

${i.guardrails.length ? i.guardrails.map(item => `- ${item}`).join("\n") : "- Ne pas inventer une source absente."}
- Module présent ≠ module actif.
- Seuls les modules explicitement inclus sont copiés depuis leur source réelle.
- Produire le résultat demandé puis s’arrêter proprement.
`;
  }

  function manifestDocument() {
    const spec = profileSpec();
    return `# MANIFESTE — ${state.identity.name}

Version Forge : ${DATA.version}
Date : ${new Date().toISOString().slice(0, 10)}
Parcours : Atelier Aerith-10 Créatrice — conception, canonisation et forge

## Identité

- Nom : ${state.identity.name}
- Famille : ${state.identity.family || "—"}
- Niveau : ${state.identity.level || "—"}
- Rôle : ${state.identity.role || "—"}
- Mode principal : ${state.identity.mode || "—"}

## Références canoniques

- Core : ${spec.canonical.core_path || "—"}
- Persona : ${spec.canonical.persona_path || "—"}
- Mémoire / base : ${spec.canonical.memory_or_business_base || "—"}
- Canonisation humaine confirmée : ${spec.canonical.human_confirmed ? "oui" : "non"}

## Héritages

${state.identity.heritage.length ? state.identity.heritage.map(item => `- ${item}`).join("\n") : "- Aucun"}

## Modules référencés

${state.identity.modules.length ? state.identity.modules.map(item => `- ${item}`).join("\n") : "- Aucun"}

## Routage réel

- Route : ${profileModuleRouter() ? (state.moduleRouting.routeId || "personnalisée / aucune") : "non applicable"}
- Actifs : ${profileModuleRouter() ? state.moduleRouting.active.length : 0}
- Inclus dans le ZIP : ${profileModuleRouter() ? state.moduleRouting.included.length : 0}

## Fichiers réellement importés

${spec.imported_files.length ? spec.imported_files.map(item => `- ${item.path} — ${item.kind} — ${item.size} octets`).join("\n") : "- Aucun"}

## Audit

${spec.audit.items.map(item => `- [${item[0].toUpperCase()}] ${item[1]} — ${item[2]}`).join("\n")}

## Verrou source-fidèle

La Forge compile les sources disponibles. Elle ne canonise pas à la place de Christophe, ne réécrit pas les fichiers protégés et ne présente pas un fichier absent comme chargé.
`;
  }

  function renderFinal() {
    syncPackageInclusion();
    const audit = finalAudit();
    const expected = expectedPackageCount();
    $("#finalStatus").textContent = audit.ready ? `PRÊT · ${expected} FICHIERS` : "À COMPLÉTER";
    $("#finalStatus").style.color = audit.ready ? "var(--green)" : "var(--gold)";
    $("#finalSummary").innerHTML = [
      ["Profil", state.identity.name], ["Mode du paquet", state.packageMode === "complete" ? "Complet" : state.packageMode === "minimal" ? "Minimal" : "Ciblé"],
      ["Validation", `${audit.validationPercent} %`], ["Sources importées", String(state.imports.length)], ["Modules inclus", String(selectedPackageEntries().length)], ["Total attendu", String(expected)], ["État", audit.ready ? "PRÊT" : "À COMPLÉTER"]
    ].map(item => `<div class="summary-card"><span>${esc(item[0])}</span><b>${esc(item[1])}</b></div>`).join("");
    const labels = {ok:"PRÊT", warn:"À FAIRE", info:"INFO", error:"BLOQUANT"};
    $("#finalAudit").innerHTML = audit.items.map(item => `<div class="audit-row ${item[0]}"><span>${esc(labels[item[0]] || item[0].toUpperCase())}</span><div><b>${esc(item[1])}</b><small>${esc(item[2])}</small></div></div>`).join("");
    const preview = packagePreviewFiles();
    const auditNode = $("#finalAudit");
    auditNode.insertAdjacentHTML("beforebegin", `<div class="package-preview" id="packagePreview"><h3>Contenu exact du ZIP · ${preview.length} fichiers</h3><p>Cette liste est calculée avant le téléchargement. Aucun fichier caché n’est ajouté.</p><div class="package-preview-grid">${preview.map(item => `<span>${esc(item)}</span>`).join("")}</div></div>`);
    const previews = $$("#packagePreview");
    if (previews.length > 1) previews.slice(0,-1).forEach(node => node.remove());
    const docs = {boot:bootDocument(),manifest:manifestDocument(),block:blockLLM(),links:linksDocument(),spec:JSON.stringify(profileSpec(),null,2)};
    $("#finalPreview").textContent = docs[state.finalPreview] || docs.boot;
    $$("#finalTabs button").forEach(button => button.classList.toggle("active", button.dataset.finalPreview === state.finalPreview));
    $("#forgeZip").disabled = !audit.ready;
    $("#forgeZip").textContent = `FORGER LE ZIP FINAL · ${expected} FICHIERS`;
    renderCompletion(audit);
    if (!audit.ready) $("#forgeLog").textContent = "La Forge reste bloquée tant que la liste attendue n’est pas complète.";
  }

  function renderAll() {
    renderProfiles();
    renderExamples();
    renderConstellation();
    renderFlowerGirls();
    renderSelectedProfile();
    renderLiveProfile();
    renderFamilies();
    renderAgentSuggestions();
    renderHeritage();
    syncFieldsToUI();
    renderModuleRouter();
    renderImports();
    renderSourceGuide();
    renderProposal();
    renderFinal();
    renderAdvisor();
    activateStep(state.step);
  }

  async function fetchBytes(path) {
    const response = await fetch(path, {cache:"no-store"});
    if (!response.ok) throw new Error(`${path} — HTTP ${response.status}`);
    return new Uint8Array(await response.arrayBuffer());
  }

  async function buildFinalFiles() {
    const audit = finalAudit();
    if (!audit.ready) throw new Error("Le Core et la Persona canoniques sont requis avant la forge finale.");

    const root = cleanName(state.identity.name);
    const files = new Map();
    files.set(`${root}/README_FIRST.md`, encoder.encode(`# ${state.identity.name}

Paquet canonique produit par ${DATA.version}.

Contenu : Core, Persona, Boot, Block LLM, Manifeste, liens GitHub / Raw, Profile Spec et, lorsqu’ils sont sélectionnés, les modules réels avec leur README routeur.

Aucun Core, Persona ou module protégé n’est réécrit par la Forge.
`));
    files.set(`${root}/${finalFileName("boot")}`, encoder.encode(bootDocument()));
    files.set(`${root}/${finalFileName("manifest")}`, encoder.encode(manifestDocument()));
    files.set(`${root}/${finalFileName("block")}`, encoder.encode(blockLLM()));
    files.set(`${root}/${finalFileName("links")}`, encoder.encode(linksDocument()));
    files.set(`${root}/${finalFileName("spec")}`, encoder.encode(JSON.stringify(profileSpec(), null, 2)));

    const p = profile();
    const coreTargetName = cleanPath(state.identity.corePath || defaultCoreTarget()).split("/").pop();
    const personaTargetName = cleanPath(state.identity.personaPath || defaultPersonaTarget()).split("/").pop();

    if (isCanonicalProfile()) {
      files.set(`${root}/CORE/${coreTargetName}`, await canonicalSourceBytes("core"));
      files.set(`${root}/CORE/${personaTargetName}`, await canonicalSourceBytes("persona"));
    } else if (p.privacy === "public") {
      files.set(`${root}/CORE/${coreTargetName}`, await fetchBytes(p.corePath));
      files.set(`${root}/CORE/${personaTargetName}`, await fetchBytes(p.personaPath));
    } else {
      const core = importedKind("core");
      const persona = importedKind("persona");
      files.set(`${root}/CORE/${coreTargetName}`, new Uint8Array(await core.file.arrayBuffer()));
      files.set(`${root}/CORE/${personaTargetName}`, new Uint8Array(await persona.file.arrayBuffer()));
    }

    const packageEntries = selectedPackageEntries();
    if (profileModuleRouter() && packageEntries.length) {
      const router = routerEntry();
      files.set(`${root}/SOURCES/${router.path}`, await moduleSourceBytes(router));
      for (const entry of packageEntries) {
        files.set(`${root}/SOURCES/${entry.path}`, await moduleSourceBytes(entry));
      }
    }

    if (files.size !== expectedPackageCount()) throw new Error(`Contrôle final refusé : ${files.size} fichiers produits au lieu de ${expectedPackageCount()}.`);
    return {root, files};
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let index = 0; index < 8; index++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function concat(parts) {
    const length = parts.reduce((sum, part) => sum + part.length, 0);
    const output = new Uint8Array(length);
    let offset = 0;
    for (const part of parts) { output.set(part, offset); offset += part.length; }
    return output;
  }

  function zipBlob(files) {
    const local = [];
    const central = [];
    let offset = 0;
    const now = new Date();
    const year = Math.max(1980, now.getFullYear());
    const time = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
    const date = ((year - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

    for (const [name, bytes] of files) {
      const nameBytes = encoder.encode(name);
      const crc = crc32(bytes);
      const lh = new Uint8Array(30 + nameBytes.length);
      const lv = new DataView(lh.buffer);
      lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true);
      lv.setUint16(8, 0, true); lv.setUint16(10, time, true); lv.setUint16(12, date, true);
      lv.setUint32(14, crc, true); lv.setUint32(18, bytes.length, true); lv.setUint32(22, bytes.length, true);
      lv.setUint16(26, nameBytes.length, true); lh.set(nameBytes, 30);
      local.push(lh, bytes);

      const ch = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(ch.buffer);
      cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true); cv.setUint16(10, 0, true); cv.setUint16(12, time, true);
      cv.setUint16(14, date, true); cv.setUint32(16, crc, true); cv.setUint32(20, bytes.length, true);
      cv.setUint32(24, bytes.length, true); cv.setUint16(28, nameBytes.length, true);
      cv.setUint32(42, offset, true); ch.set(nameBytes, 46);
      central.push(ch);
      offset += lh.length + bytes.length;
    }

    const localData = concat(local);
    const centralData = concat(central);
    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, files.size, true); ev.setUint16(10, files.size, true);
    ev.setUint32(12, centralData.length, true); ev.setUint32(16, localData.length, true);
    return new Blob([localData, centralData, end], {type:"application/zip"});
  }

  async function downloadStep6Document(kind) {
    if (!isCanonicalProfile()) {
      if (kind === "core") downloadText(proposalFileName("core"), proposalCore());
      else if (kind === "persona") downloadText(proposalFileName("persona"), proposalPersona());
      else downloadText(proposalFileName("brief"), designBrief());
      return;
    }
    if (kind === "brief") {
      downloadText(`${cleanName(state.identity.name)}_FICHE_SOURCES.md`, existingProfileBrief());
      return;
    }
    try {
      const name = pathFileName(canonicalPath(kind));
      const bytes = await canonicalSourceBytes(kind);
      downloadBlob(name, new Blob([bytes], {type:"text/markdown"}));
    } catch (error) {
      showToast(error.message || "Source non chargée.");
    }
  }

  async function downloadProposalZip() {
    if (!isCanonicalProfile()) {
      const root = `${canonicalBase()}_PROPOSAL`;
      const files = new Map([
        [`${root}/${proposalFileName("core")}`, encoder.encode(proposalCore())],
        [`${root}/${proposalFileName("persona")}`, encoder.encode(proposalPersona())],
        [`${root}/${proposalFileName("brief")}`, encoder.encode(designBrief())]
      ]);
      downloadBlob(`${root}.zip`, zipBlob(files));
      showToast("ZIP de proposition téléchargé — 3 fichiers.");
      return;
    }
    try {
      const root = `${cleanName(state.identity.name)}_SOURCES_CANONIQUES`;
      const coreName = pathFileName(canonicalPath("core"));
      const personaName = pathFileName(canonicalPath("persona"));
      const files = new Map([
        [`${root}/${coreName}`, await canonicalSourceBytes("core")],
        [`${root}/${personaName}`, await canonicalSourceBytes("persona")],
        [`${root}/${cleanName(state.identity.name)}_FICHE_SOURCES.md`, encoder.encode(existingProfileBrief())]
      ]);
      downloadBlob(`${root}.zip`, zipBlob(files));
      showToast("Sources canoniques téléchargées — fichiers réels préservés.");
    } catch (error) {
      showToast(error.message || "Sources non chargées.");
    }
  }

  function openLightbox(src, title) {
    $("#lightboxImage").src = src;
    $("#lightboxImage").alt = title;
    $("#lightboxTitle").textContent = title;
    $("#lightbox").hidden = false;
    $("#lightbox").setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  }

  function closeLightbox() {
    $("#lightbox").hidden = true;
    $("#lightbox").setAttribute("aria-hidden", "true");
    $("#lightboxImage").src = "";
    document.body.classList.remove("lightbox-open");
  }

  document.addEventListener("click", event => {
    const packageMode = event.target.closest("[data-package-mode]");
    if (packageMode) {
      state.packageMode = packageMode.dataset.packageMode;
      syncPackageInclusion();
      persist(); renderModuleRouter(); renderSourceGuide(); renderFinal(); renderAdvisor();
      showToast(state.packageMode === "complete" ? `Profil complet · ${expectedPackageCount()} fichiers.` : state.packageMode === "minimal" ? "Profil minimal · 8 fichiers." : `Profil ciblé · ${expectedPackageCount()} fichiers.`);
      return;
    }
    const preset = event.target.closest("[data-module-preset]");
    if (preset) {
      const router = profileModuleRouter();
      const selected = router?.presets?.find(item => item.id === preset.dataset.modulePreset);
      if (selected) {
        const paths = selected.modules.map(id => router.catalog.find(item => item.id === id)?.path).filter(Boolean);
        state.moduleRouting = {routeId:selected.id, active:[...paths], included:[]};
        syncPackageInclusion();
        persist(); renderModuleRouter(); renderFinal(); renderAdvisor(); renderLiveProfile();
        showToast(`${selected.label} · ${paths.length} compétence(s) active(s).`);
      }
      return;
    }
    const moduleAction = event.target.closest("[data-module-action]");
    if (moduleAction) {
      state.moduleRouting = sanitizeModuleRouting(state.moduleRouting);
      if (moduleAction.dataset.moduleAction === "include-active") state.moduleRouting.included = [...state.moduleRouting.active];
      if (moduleAction.dataset.moduleAction === "clear-included") state.moduleRouting.included = [];
      if (moduleAction.dataset.moduleAction === "clear-route") state.moduleRouting = emptyModuleRouting();
      state.moduleRouting.routeId = moduleAction.dataset.moduleAction === "clear-route" ? "" : "custom";
      persist(); renderModuleRouter(); renderFinal(); renderAdvisor();
      return;
    }
    const flowerDetailButton = event.target.closest("[data-flower-detail]");
    if (flowerDetailButton) {
      const item = FLOWER?.profiles.find(profile => profile.id === flowerDetailButton.dataset.flowerDetail);
      renderFlowerDetail(item || null, true);
      return;
    }
    const flowerClose = event.target.closest("[data-flower-close]");
    if (flowerClose) {
      flowerView.selected = "";
      renderFlowerDetail(null);
      $("#flowerGirls")?.scrollIntoView({behavior:"smooth", block:"start"});
      return;
    }
    const flowerLoad = event.target.closest("[data-flower-load]");
    if (flowerLoad) { applyFlowerGirl(flowerLoad.dataset.flowerLoad, true); return; }
    const flowerFamily = event.target.closest("[data-flower-family]");
    if (flowerFamily) { flowerView.family = flowerFamily.dataset.flowerFamily; renderFlowerGirls(); return; }
    const flowerFacet = event.target.closest("[data-flower-facet]");
    if (flowerFacet) { flowerView.facet = flowerView.facet === flowerFacet.dataset.flowerFacet ? "all" : flowerFacet.dataset.flowerFacet; renderFlowerGirls(); return; }
    const profileButton = event.target.closest("[data-profile]");
    if (profileButton) applyProfile(profileButton.dataset.profile);

    const exampleButton = event.target.closest("[data-example]");
    if (exampleButton) applyExample(exampleButton.dataset.example);

    const stepButton = event.target.closest("[data-step-button]");
    if (stepButton) activateStep(Number(stepButton.dataset.stepButton), true);

    const agentButton = event.target.closest("[data-agent]");
    if (agentButton) {
      const agent = agentButton.dataset.agent;
      if (!state.identity.agents.includes(agent)) state.identity.agents.push(agent);
      $("#fieldAgents").value = state.identity.agents.join("\n");
      persist(); renderLiveProfile(); renderProposal(); renderFinal(); renderAdvisor();
    }

    const previewButton = event.target.closest("[data-preview]");
    if (previewButton) { state.proposalPreview = previewButton.dataset.preview; persist(); renderProposal(); }

    const finalPreviewButton = event.target.closest("[data-final-preview]");
    if (finalPreviewButton) { state.finalPreview = finalPreviewButton.dataset.finalPreview; persist(); renderFinal(); }

    const removeImport = event.target.closest("[data-remove-import]");
    if (removeImport) {
      const index = Number(removeImport.dataset.removeImport);
      const removed = state.imports.splice(index, 1)[0];
      if (removed?.kind === "visual" && state.visualUrl) { URL.revokeObjectURL(state.visualUrl); state.visualUrl = ""; }
      persist(); renderAll();
    }

    const lightboxButton = event.target.closest("[data-lightbox]");
    if (lightboxButton) openLightbox(lightboxButton.dataset.lightbox, lightboxButton.dataset.lightboxTitle || "Visuel");
    if (event.target.id === "lightbox") closeLightbox();
  });

  document.addEventListener("change", event => {
    const activeBox = event.target.closest("[data-module-active]");
    const includeBox = event.target.closest("[data-module-include]");
    if (activeBox || includeBox) {
      state.moduleRouting = sanitizeModuleRouting(state.moduleRouting);
      const target = activeBox || includeBox;
      const listName = activeBox ? "active" : "included";
      const values = new Set(state.moduleRouting[listName]);
      if (target.checked) values.add(target.dataset[activeBox ? "moduleActive" : "moduleInclude"]);
      else values.delete(target.dataset[activeBox ? "moduleActive" : "moduleInclude"]);
      state.moduleRouting[listName] = [...values];
      state.moduleRouting.routeId = "custom";
      if (includeBox) state.packageMode = "targeted";
      syncPackageInclusion();
      persist(); renderModuleRouter(); renderFinal(); renderAdvisor(); renderLiveProfile();
      return;
    }

    const heritageInput = event.target.closest("[data-heritage]");
    if (heritageInput) {
      const id = heritageInput.dataset.heritage;
      state.identity.heritage = heritageInput.checked
        ? [...new Set([...state.identity.heritage, id])]
        : state.identity.heritage.filter(item => item !== id);
      persist(); renderHeritage(); renderLiveProfile(); renderProposal(); renderFinal(); renderAdvisor();
    }
  });

  for (const id of [
    "fieldName", "fieldFamily", "fieldLevel", "fieldMode", "fieldRole", "fieldProblem", "fieldUsers",
    "fieldOutputs", "fieldFormula", "fieldAgents", "fieldModules", "fieldNonDuplication", "fieldTone",
    "fieldModes", "fieldGuardrails", "fieldConfidentiality", "fieldStopPoint", "fieldCorePath",
    "fieldPersonaPath", "fieldMemoryPath", "canonicalConfirmed"
  ]) {
    $(`#${id}`).addEventListener(id === "canonicalConfirmed" ? "change" : "input", syncUIToState);
  }

  $("#flowerSearch")?.addEventListener("input", event => { flowerView.search = event.target.value; renderFlowerGirls(); });

  $("#blankProfile").addEventListener("click", applyBlank);
  $("#startTop").addEventListener("click", () => activateStep(0, true));
  $("#startNew").addEventListener("click", () => { applyProfile("new", false); activateStep(0, true); });
  $("#startExisting").addEventListener("click", () => { $("#profiles").scrollIntoView({behavior:"smooth", block:"start"}); });
  $("#previousTop").addEventListener("click", () => activateStep(state.step - 1));
  $("#previousBottom").addEventListener("click", () => activateStep(state.step - 1));
  $("#nextTop").addEventListener("click", () => activateStep(state.step + 1));
  $("#nextBottom").addEventListener("click", () => activateStep(state.step + 1));
  $("#lightboxClose").addEventListener("click", closeLightbox);

  $("#advisorAction").addEventListener("click", () => {
    const action = $("#advisorAction").dataset.advisorAction || "next";
    if (action === "next") activateStep(Math.min(STEPS.length - 1, state.step + 1), true);
    else if (action === "files") { activateStep(5, true); setTimeout(() => $("#fileInput").click(), 260); }
    else if (action === "pack") { activateStep(5, true); setTimeout(() => $("#packInput").click(), 260); }
    else if (action === "confirm") { activateStep(5, true); setTimeout(() => $("#canonicalConfirmed").focus(), 300); }
    else if (action === "goto-verify") activateStep(6, true);
    else if (action === "goto-final") activateStep(7, true);
    else if (action === "forge") $("#forgeZip").click();
    else if (action === "sources") activateStep(5, true);
  });

  $("#navExport").addEventListener("click", event => {
    event.preventDefault();
    activateStep(7, true);
  });

  $("#completionZip").addEventListener("click", () => $("#forgeZip").click());
  $("#completionBlock").addEventListener("click", () => $("#downloadBlock").click());
  $("#completionManifest").addEventListener("click", () => $("#downloadManifest").click());
  $("#completionRestart").addEventListener("click", () => {
    applyProfile("new", false);
    activateStep(0, true);
  });

  $("#choosePrivatePack").addEventListener("click", () => $("#packInput").click());
  $("#packInput").addEventListener("change", event => addFiles(event.target.files));
  $("#showAdvancedImports").addEventListener("click", () => { const details = $("#advancedImports"); details.open = true; details.scrollIntoView({behavior:"smooth",block:"center"}); });
  $("#chooseFiles").addEventListener("click", () => $("#fileInput").click());
  $("#chooseFolder").addEventListener("click", () => $("#folderInput").click());
  $("#fileInput").addEventListener("change", event => addFiles(event.target.files));
  $("#folderInput").addEventListener("change", event => addFiles(event.target.files));
  $("#clearImports").addEventListener("click", () => {
    if (state.visualUrl) URL.revokeObjectURL(state.visualUrl);
    state.visualUrl = "";
    state.imports = [];
    state.packInfo = {name:"", entries:0, error:""};
    persist(); renderAll(); showToast("Imports vidés.");
  });

  const dropzone = $("#dropzone");
  for (const name of ["dragenter", "dragover"]) dropzone.addEventListener(name, event => { event.preventDefault(); dropzone.classList.add("drag"); });
  for (const name of ["dragleave", "drop"]) dropzone.addEventListener(name, event => { event.preventDefault(); dropzone.classList.remove("drag"); });
  dropzone.addEventListener("drop", event => addFiles(event.dataTransfer.files));

  $("#downloadProposalCore").addEventListener("click", () => downloadStep6Document("core"));
  $("#downloadProposalPersona").addEventListener("click", () => downloadStep6Document("persona"));
  $("#downloadProposalBrief").addEventListener("click", () => downloadStep6Document("brief"));
  $("#downloadProposalZip").addEventListener("click", downloadProposalZip);

  $("#downloadBoot").addEventListener("click", () => downloadText(finalFileName("boot"), bootDocument()));
  $("#downloadManifest").addEventListener("click", () => downloadText(finalFileName("manifest"), manifestDocument()));
  $("#downloadBlock").addEventListener("click", () => downloadText(finalFileName("block"), blockLLM()));
  $("#downloadLinks").addEventListener("click", () => downloadText(finalFileName("links"), linksDocument()));
  $("#downloadSpec").addEventListener("click", () => downloadText(finalFileName("spec"), JSON.stringify(profileSpec(), null, 2), "application/json;charset=utf-8"));
  $("#forgeZip").addEventListener("click", async () => {
    const log = $("#forgeLog");
    log.textContent = "Compilation locale du paquet final…";
    try {
      const pkg = await buildFinalFiles();
      const blob = zipBlob(pkg.files);
      downloadBlob(`${pkg.root}_FORGE_AERITH_PRO.zip`, blob);
      log.textContent = `${pkg.files.size} fichier(s) · ${formatSize(blob.size)} · paquet complet forgé par l’atelier Créatrice`;
      showToast("ZIP final forgé.");
    } catch (error) {
      log.textContent = `Erreur : ${error.message}`;
      showToast("Erreur de compilation.");
    }
  });

  function openResetDialog() {
    $("#resetDialog").hidden = false;
    document.body.classList.add("modal-open");
    $("#cancelReset").focus();
  }

  function closeResetDialog() {
    $("#resetDialog").hidden = true;
    document.body.classList.remove("modal-open");
  }

  $("#resetAll").addEventListener("click", openResetDialog);
  $("#cancelReset").addEventListener("click", closeResetDialog);
  $("#resetDialog").addEventListener("click", event => {
    if (event.target.id === "resetDialog") closeResetDialog();
  });
  $("#confirmReset").addEventListener("click", () => {
    if (state.visualUrl) URL.revokeObjectURL(state.visualUrl);
    try {
      localStorage.removeItem(STORAGE_KEY);
      for (const legacyKey of LEGACY_STORAGE_KEYS) localStorage.removeItem(legacyKey);
    } catch {}
    state = defaultState();
    persist();
    renderAll();
    closeResetDialog();
    showToast("Aerith-10 Créatrice est replacée comme profil par défaut.");
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (!$("#resetDialog").hidden) closeResetDialog();
      if (!$("#lightbox").hidden) closeLightbox();
    }
  });

  function activeForgeHeight() {
    if (document.body.dataset.view !== "atelier") {
      return Math.ceil(document.documentElement.scrollHeight);
    }
    const shell = $("#unifiedForge");
    if (!shell) return Math.ceil(document.documentElement.scrollHeight);
    return Math.ceil(shell.getBoundingClientRect().height);
  }

  let heightFrame = 0;
  function notifyParentHeight() {
    if (window.parent === window) return;
    cancelAnimationFrame(heightFrame);
    heightFrame = requestAnimationFrame(() => {
      window.parent.postMessage({
        type: "aerith-forge-height",
        view: document.body.dataset.view,
        height: activeForgeHeight()
      }, window.location.origin);
    });
  }

  function initEmbeddedView() {
    if (document.body.dataset.view !== "atelier") return;
    const observer = "ResizeObserver" in window
      ? new ResizeObserver(notifyParentHeight)
      : null;
    observer?.observe(document.body);
    const shell = $("#unifiedForge");
    if (shell) observer?.observe(shell);
    window.addEventListener("load", notifyParentHeight);
    window.addEventListener("resize", notifyParentHeight);
    document.addEventListener("input", notifyParentHeight);
    document.addEventListener("change", notifyParentHeight);
    document.addEventListener("click", () => setTimeout(notifyParentHeight, 40));
    notifyParentHeight();
  }

  function initSectionNavigation() {
    const links = $$(".topbar nav a[href^='#']").filter(link => link.id !== "navExport");
    const targets = links.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach(link => {
        const active = link.getAttribute("href") === `#${visible.target.id}`;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    }, {rootMargin:"-28% 0px -58% 0px", threshold:[0.05, 0.2, 0.5]});
    targets.forEach(target => observer.observe(target));
  }

  renderDoctrine();
  renderLineage();
  renderAll();
  initSectionNavigation();
  initEmbeddedView();

  if (document.body.dataset.build !== DATA.version) {
    const diagnostic = $("#diagnostic");
    diagnostic.hidden = false;
    diagnostic.textContent = `Version incohérente : HTML ${document.body.dataset.build} / données ${DATA.version}.`;
  }
})();
