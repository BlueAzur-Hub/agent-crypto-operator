(() => {
  "use strict";
  const BASE = "http://127.0.0.1:8787";
  let token = "";
  const request = async (path, options = {}) => {
    const headers = new Headers(options.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    const response = await fetch(`${BASE}${path}`, { ...options, headers, cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error || `Bridge HTTP ${response.status}`);
    return payload;
  };
  const status = () => request("/auth/status");
  const health = () => request("/health");
  const register = async secret => {
    const payload = await request("/auth/register", { method: "POST", body: JSON.stringify({ secret: String(secret || "") }) });
    if (payload?.role !== "operator") throw new Error("Le Bridge n'a pas créé une session Operator.");
    token = String(payload.token || "");
    document.dispatchEvent(new CustomEvent("erith:yohan-bridge-auth", { detail: { authenticated: true, role: "operator" } }));
    return { ...payload, token: undefined };
  };
  const login = async secret => {
    const payload = await request("/auth/login", { method: "POST", body: JSON.stringify({ secret: String(secret || "") }) });
    if (payload?.role !== "operator") throw new Error("Rôle Bridge inattendu.");
    token = String(payload.token || "");
    document.dispatchEvent(new CustomEvent("erith:yohan-bridge-auth", { detail: { authenticated: true, role: "operator" } }));
    return { ...payload, token: undefined };
  };
  const logout = async () => {
    try { if (token) await request("/auth/logout", { method: "POST", body: "{}" }); } finally { token = ""; }
    document.dispatchEvent(new CustomEvent("erith:yohan-bridge-auth", { detail: { authenticated: false, role: null } }));
    return true;
  };
  const capabilities = () => request("/capabilities");
  const call = (path, body) => request(path, body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
  globalThis.ErithYohanOperatorBridge = Object.freeze({
    base: BASE,
    status,
    health,
    register,
    login,
    logout,
    capabilities,
    call,
    hasSession: () => Boolean(token),
    contract: Object.freeze({ token_storage: "memory_only", role: "operator", remote_auth: false, administrator_grant: false })
  });
})();
