/* ERITH.IA — Operator compatibility facade for the canonical Aether Trust session.
   The UI and Trader still load this legacy file. It MUST NOT create a second
   login, register an Owner, copy a token, or add an independent credential store.
   The local Bridge decides the actual role for every private request. */
(() => {
  "use strict";
  const BASE = "http://127.0.0.1:8787";
  const ROLE = "operator";

  const currentToken = () => {
    if (!globalThis.ErithAetherTrustDualRoleR28 ||
        typeof globalThis.atlasBridgeAuthToken !== "function") return "";
    try { return String(globalThis.atlasBridgeAuthToken() || ""); }
    catch (_) { return ""; }
  };

  const request = async (path, options = {}, bearer = "") => {
    const headers = new Headers(options.headers || {});
    if (bearer) headers.set("Authorization", `Bearer ${bearer}`);
    if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    const response = await fetch(`${BASE}${path}`, { ...options, headers, cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.ok === false)
      throw new Error(payload?.error || `Bridge HTTP ${response.status}`);
    return payload;
  };

  const requireOperatorSession = async () => {
    const token = currentToken();
    if (!token) throw new Error("Connecte le profil Operator avec Aether Trust dans cette interface.");
    const capabilities = await request("/capabilities", {}, token);
    if (currentToken() !== token) throw new Error("La session Aether Trust a changé.");
    if (capabilities.role !== ROLE || !Array.isArray(capabilities.capabilities))
      throw new Error("La session Aether Trust active n'est pas Operator : accès refusé.");
    return { token, capabilities };
  };

  const notify = authenticated => {
    document.dispatchEvent(new CustomEvent("erith:yohan-bridge-auth", {
      detail: { authenticated, role: authenticated ? ROLE : null }
    }));
  };

  const status = () => request("/auth/status");
  const health = () => request("/health");

  // Local provisioning belongs to the Control Center, not the public website.
  const register = async () => {
    throw new Error("Configure Operator dans le Control Center local, puis utilise Aether Trust.");
  };

  // Legacy callers can inspect the canonical session, but cannot sign in again.
  const login = async () => {
    const { capabilities } = await requireOperatorSession();
    notify(true);
    return { authenticated: true, role: ROLE, capabilities: capabilities.capabilities };
  };

  const logout = async () => {
    const { token } = await requireOperatorSession();
    try {
      await request("/auth/logout", { method: "POST", body: "{}" }, token);
    } finally {
      // Never clear another session if it was replaced during the request.
      if (currentToken() === token && typeof globalThis.atlasBridgeAuthClear === "function") {
        globalThis.atlasBridgeAuthClear();
        if (typeof globalThis.dispatchEvent === "function" && typeof Event === "function")
          globalThis.dispatchEvent(new Event("aether-trust:logout-requested"));
        notify(false);
      }
    }
    return true;
  };

  const capabilities = async () => (await requireOperatorSession()).capabilities;
  const call = async (path, body) => {
    if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//") ||
        /^\/auth\//i.test(path))
      throw new Error("Route incompatible avec l'authentification Aether Trust.");
    const { token } = await requireOperatorSession();
    const options = body === undefined ? {} : { method: "POST", body: JSON.stringify(body) };
    const payload = await request(path, options, token);
    if (currentToken() !== token) throw new Error("La session Aether Trust a changé pendant la lecture.");
    return payload;
  };

  globalThis.ErithYohanOperatorBridge = Object.freeze({
    base: BASE,
    status,
    health,
    register,
    login,
    logout,
    capabilities,
    call,
    // Presence is informational only; authorization is verified by the Bridge.
    hasSession: () => Boolean(currentToken()),
    contract: Object.freeze({
      token_storage: "memory_only", session_owner: "aether-trust",
      role: ROLE, remote_auth: false, administrator_grant: false,
      second_login: false, local_registration: false
    })
  });
})();
