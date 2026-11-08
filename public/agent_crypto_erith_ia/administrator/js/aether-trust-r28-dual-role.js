/* ERITH.IA — Aether Trust R28 dual-role adapter.
   Reuses existing Administrator cockpit. The local Bridge, not the URL/DOM,
   grants the effective role and endpoint capabilities. No trading actions.
   No background network polling. No secrets embedded in public files. */
(() => {
  "use strict";
  const ROOT = "http://127.0.0.1:8787";
  const ROLE_OWNER = "owner";
  const ROLE_OPERATOR = "operator";
  const OWNER_ONLY = new Set([
    "security.read", "book_mirror.publish", "oracle_evidence.publish"
  ]);
  const OPERATOR_CAPABILITIES = new Set(["history.read","scanner.read","atlas.run","aerith.run","chat.run","okx.status.read","okx.account.read","okx.orders.read","okx.fills.read","okx.fees.read","okx.ledger.read","okx.fee_type.read","okx.order_gates.read","okx.instruments.read"]);
  const selectedDefault = new URL(location.href).searchParams.get("profile") === "yohan"
    ? ROLE_OPERATOR : ROLE_OWNER;
  let selected = selectedDefault;
  let busy = false;
  const $ = id => document.getElementById(id);
  const label = (id, value) => { const el=$(id); if (el) el.textContent=value; };
  const statusLine = (value, error=false) => {
    if (typeof atlasAccessSetStatus === "function") atlasAccessSetStatus(value, error ? "error" : "ok");
    else label("atlasAccessStatus", value);
  };

  async function request(path, { method="GET", body, token="", timeout=8000 }={}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(ROOT + path, {
        method, cache:"no-store", signal:controller.signal,
        headers: {
          "Accept": "application/json",
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
          ...(token ? { "Authorization": "Bearer " + token } : {})
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok === false) {
        throw new Error(String(result.error || ("Bridge HTTP " + response.status)));
      }
      return result;
    } finally {
      clearTimeout(timer);
    }
  }

  function syncCards() {
    const owner = $("atlasAccessOwnerProfile") || document.querySelector(".atlas-access-profiles article:first-child");
    const operator = $("atlasAccessOperatorProfile");
    owner?.classList.toggle("is-active", selected === ROLE_OWNER);
    operator?.classList.toggle("is-active", selected === ROLE_OPERATOR);
    owner?.setAttribute("aria-pressed", String(selected === ROLE_OWNER));
    operator?.setAttribute("aria-pressed", String(selected === ROLE_OPERATOR));
    if (new URL(location.href).searchParams.get("profile") === "yohan" && owner) {
      const name = owner.querySelector("b");
      if (name) name.textContent = "Administrator local";
      const info = owner.querySelector("small");
      if (info) info.textContent = "Accès possible uniquement si ce Bridge autorise Owner";
    }
    const confirmField = $("atlasAccessConfirmField");
    // New Owner credentials are provisioned locally, never through a public page.
    if (confirmField) confirmField.hidden = true;
    if ($("atlasAccessConfirm")) $("atlasAccessConfirm").required = false;
    const secret = $("atlasAccessSecret");
    if (secret) secret.autocomplete = "current-password";
    label("atlasAccessIntro", selected === ROLE_OPERATOR
      ? "Saisis ton mot de passe Operator du Bridge local. Aucune permission Administrator n'est accordée."
      : "Saisis ton mot de passe Administrator. Le Bridge local doit confirmer les droits Owner.");
    label("atlasAccessSubmit", selected === ROLE_OWNER
      ? "Déverrouiller Administrator" : "Déverrouiller Operator");
    const dialog = $("atlasAccessDialog");
    if (dialog) dialog.dataset.aetherR28SelectedRole = selected;
    return selected;
  }

  function choose(role) {
    if (![ROLE_OWNER, ROLE_OPERATOR].includes(role) || busy) return false;
    selected=role;
    if ($("atlasAccessSecret")) $("atlasAccessSecret").value="";
    if ($("atlasAccessConfirm")) $("atlasAccessConfirm").value="";
    syncCards();
    statusLine(role === ROLE_OPERATOR
      ? "Profil Operator sélectionné. Connexion Bridge obligatoire."
      : "Profil Administrator sélectionné. Connexion Bridge obligatoire.");
    $("atlasAccessSecret")?.focus();
    return true;
  }

  function bridgeApiAvailable() {
    return typeof atlasAccessSetSession === "function"
      && typeof atlasBridgeAuthRemember === "function"
      && typeof atlasV2ApplyMode === "function";
  }

  async function validateRole(role, secret, confirm) {
    if (!bridgeApiAvailable()) throw new Error("Contrôleur Aether Trust non chargé.");
    if (secret.length < 6) throw new Error("Mot de passe trop court.");
    let bridge;
    try { bridge=await request("/auth/status", { timeout:3000 }); }
    catch { throw new Error("Bridge local inaccessible. Aucun accès privilégié n'a été accordé."); }

    // R26 and earlier keep the existing Owner route; never grant Operator
    // by selecting the Intermediate view without Bridge R28 role verification.
    const r28 = Object.prototype.hasOwnProperty.call(bridge,"operator_configured");
    if (!r28) {
      if (role === ROLE_OWNER && typeof atlasAccessSubmit === "function")
        return { legacyOwner:true };
      throw new Error("Le Bridge local n'offre pas l'authentification Operator R28.");
    }
    // Preserve the existing browser Owner password gate in addition to the Bridge.
    // An Operator never receives or derives these browser Owner credentials.
    if (role === ROLE_OWNER && typeof atlasAccessReadConfig === "function") {
      const localOwner = atlasAccessReadConfig()?.profiles?.owner;
      if (localOwner?.hash && localOwner?.salt && typeof atlasAccessDigest === "function") {
        const hash = await atlasAccessDigest(localOwner.salt, secret);
        if (hash !== localOwner.hash) throw new Error("Mot de passe Administrator local incorrect.");
      }
    }
    if (role === ROLE_OPERATOR && bridge.operator_configured !== true)
      throw new Error("Profil Operator non configuré sur ce PC. Création locale nécessaire.");
    if (role === ROLE_OWNER && bridge.configured !== true)
      throw new Error("Owner non configuré sur ce poste. Configuration locale explicite requise.");

    const payload = await request("/auth/login", {
      method:"POST", body:{role,secret,client:"aether-trust-r28"}
    });
    const token=String(payload.token || "");
    if (payload.role !== role || token.length < 20)
      throw new Error("Le Bridge n'a pas confirmé le rôle demandé.");
    let verified;
    try {
      verified=await request("/capabilities", {token,timeout:3500});
      if (verified.role !== role || !Array.isArray(verified.capabilities))
        throw new Error("Capacités Bridge incohérentes.");
      if (role === ROLE_OPERATOR && verified.capabilities.some(x => OWNER_ONLY.has(x) || !OPERATOR_CAPABILITIES.has(x)))
        throw new Error("Permissions Operator incohérentes : session refusée.");
      if (role === ROLE_OWNER && !verified.capabilities.includes("security.read"))
        throw new Error("Permissions Administrator manquantes : session refusée.");
    } catch (error) {
      await request("/auth/logout", {method:"POST",body:{},token}).catch(()=>{});
      throw error;
    }
    return {payload:{...payload,capabilities:verified.capabilities}};
  }

  async function login(event) {
    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    if (busy) return false;
    busy=true;
    const submit=$("atlasAccessSubmit");
    if (submit) { submit.disabled=true; submit.textContent="Validation Bridge…"; }
    const secret=String($("atlasAccessSecret")?.value || "");
    const confirm=String($("atlasAccessConfirm")?.value || "");
    const role=selected;
    try {
      statusLine("Vérification du Bridge et des autorisations…");
      const check=await validateRole(role,secret,confirm);
      if (check.legacyOwner) {
        // Preserve the pre-R28 Owner implementation on existing installations.
        return await atlasAccessSubmit({preventDefault(){}});
      }
      const priorToken=typeof atlasBridgeAuthToken === "function" ? atlasBridgeAuthToken() : "";
      if (priorToken && priorToken !== check.payload.token) {
        await request("/auth/logout", {method:"POST",body:{},token:priorToken,timeout:2200}).catch(()=>{});
      }
      if (typeof atlasBridgeAuthClear === "function") atlasBridgeAuthClear();
      if (!atlasBridgeAuthRemember(check.payload)) {
        await request("/auth/logout", {method:"POST",body:{},token:check.payload.token,timeout:2200}).catch(()=>{});
        throw new Error("Impossible de conserver la session Bridge.");
      }
      if (role === ROLE_OWNER && typeof atlasBridgeAuthEphemeralRemember406255 === "function")
        atlasBridgeAuthEphemeralRemember406255(secret);
      else if (typeof atlasBridgeAuthEphemeralClear406255 === "function")
        atlasBridgeAuthEphemeralClear406255();
      atlasAccessSetSession(role);
      const mode=role === ROLE_OWNER ? "advanced" : "intermediate";
      if (typeof atlasV2WriteSetting === "function" && typeof ATLAS_V2_MODE_KEY !== "undefined")
        atlasV2WriteSetting(ATLAS_V2_MODE_KEY,mode);
      if (role === ROLE_OWNER && typeof atlasAdminForceWorkspaceOpen === "function")
        atlasAdminForceWorkspaceOpen();
      if (typeof atlasAccessClose === "function") atlasAccessClose();
      if (typeof atlasV2SyncShareableUrl === "function") atlasV2SyncShareableUrl(mode);
      atlasV2ApplyMode(mode,{persist:false,syncUrl:true});
      statusLine((role === ROLE_OWNER ? "Administrator" : "Operator") + " authentifié par le Bridge.",false);
      if (typeof atlasBridgeCapabilityRefresh === "function")
        void atlasBridgeCapabilityRefresh().catch(()=>{});
      if (role === ROLE_OWNER && typeof atlasBookMirrorBridgeReconcile === "function")
        void atlasBookMirrorBridgeReconcile("dual-role-r28").catch(()=>{});
      return true;
    } catch (error) {
      statusLine(String(error?.message || error || "Authentification refusée."),true);
      return false;
    } finally {
      busy=false;
      if (submit) submit.disabled=false;
      syncCards();
      if ($("atlasAccessSecret")) $("atlasAccessSecret").value="";
      if ($("atlasAccessConfirm")) $("atlasAccessConfirm").value="";
    }
  }

  // Canonical Aether Trust session: no second form, password, token store or account owner.
  // The Bridge grants this per-account READ capability only when credentials are isolated.
  async function readSpotCatalog() {
    const token=typeof atlasBridgeAuthToken === "function" ? atlasBridgeAuthToken() : "";
    if (!token) throw new Error("Aether Trust doit d'abord être déverrouillé dans cette interface.");
    const caps=await request("/capabilities", {token,timeout:5000});
    if (![ROLE_OWNER, ROLE_OPERATOR].includes(caps.role) ||
        !Array.isArray(caps.capabilities) ||
        !caps.capabilities.includes("okx.instruments.read")) {
      throw new Error("Le Bridge de ce profil n'autorise pas encore le catalogue privé OKX.");
    }
    // A full account Spot catalog: no symbol or Top N allowlist and no trade endpoint.
    const payload=await request("/okx/instruments", {token,timeout:30000});
    if (typeof atlasBridgeAuthToken !== "function" || atlasBridgeAuthToken() !== token) {
      throw new Error("La session Aether Trust a changé pendant la lecture.");
    }
    if (payload.schema !== "erith_okx_account_spot_catalog_v1" ||
        payload.read_only !== true || payload.orders_enabled !== false ||
        !Array.isArray(payload.instruments) ||
        !Number.isInteger(payload.count) || payload.count !== payload.instruments.length ||
        !Number.isInteger(payload.qualified_count) ||
        payload.qualified_count < 0 || payload.qualified_count > payload.count) {
      throw new Error("Contrat de catalogue Spot OKX non vérifiable.");
    }
    return payload;
  }

  function bind() {
    const dialog=$("atlasAccessDialog");
    const form=$("atlasAccessForm");
    const owner=$("atlasAccessOwnerProfile") || document.querySelector(".atlas-access-profiles article:first-child");
    const operator=$("atlasAccessOperatorProfile");
    if (!dialog || !form || !owner || !operator) return false;
    owner.id="atlasAccessOwnerProfile";
    owner.setAttribute("role","button");
    owner.setAttribute("tabindex","0");
    owner.setAttribute("aria-label","Choisir le profil Administrator");
    operator.setAttribute("aria-label","Choisir le profil Operator");
    function interceptRole(event,role) {
      event.preventDefault();
      event.stopImmediatePropagation();
      choose(role);
    }
    // Capture phase deliberately precedes the legacy click-to-open-Operator listener.
    document.addEventListener("click", e => {
      if (e.target?.closest?.("#atlasAccessOperatorProfile")) interceptRole(e,ROLE_OPERATOR);
      else if(e.target?.closest?.("#atlasAccessOwnerProfile")) interceptRole(e,ROLE_OWNER);
      else if (e.target?.closest?.("#btnAdminAccountToggle")) queueMicrotask(syncCards);
    },true);
    document.addEventListener("keydown",e=>{
      const isSelect=e.key === "Enter" || e.key === " ";
      if (!isSelect)return;
      if(e.target?.closest?.("#atlasAccessOperatorProfile"))interceptRole(e,ROLE_OPERATOR);
      else if(e.target?.closest?.("#atlasAccessOwnerProfile"))interceptRole(e,ROLE_OWNER);
    },true);
    document.addEventListener("submit", e => {
      if (e.target === form) void login(e);
    },true);
    dialog.addEventListener("toggle", () => { if(dialog.open)syncCards(); });
    syncCards();
    return true;
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded",bind,{once:true});
  else bind();
  globalThis.ErithAetherTrustDualRoleR28 = Object.freeze({
    version:"R28 DUAL ROLE", choose, login, validateRole, readSpotCatalog,
    selected:()=>selected, bridge_base:ROOT, no_real_orders:true
  });
})();
