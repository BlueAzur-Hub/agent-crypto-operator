(() => {
  "use strict";
  const PROFILE = Object.freeze({
    id: "yohan-operator",
    deliveryBuild: "40.6.719",
    runtime: "canonical-master-shared",
    sameAdministratorInterface: true,
    viewAndAuthorizationSeparated: true,
    hideProjects: false,
    forceReducedView: false,
    grantsAdministratorSession: false,
    bridgeAuthenticationOwner: "aether-trust",
    publicSecretEmbedded: false
  });
  function apply() {
    document.documentElement.dataset.yohanProfile = "operator";
    document.documentElement.dataset.yohanOperatorDelivery = "40.6.719";
    document.documentElement.dataset.yohanSharedAdministratorRuntime = "true";
    document.documentElement.dataset.yohanAuthorizationSource = "local-operator-bridge";
    if (document.body) {
      document.body.dataset.yohanProfile = "operator";
      document.body.dataset.yohanOperatorDelivery = "40.6.719";
    }
    // Presentation only. The shared cockpit is not evidence of the authenticated
    // Bridge role: Aether Trust and /capabilities remain the sole authorities.
    const neutralize=(selector,was,now)=>{
      const el=document.querySelector(selector);
      if(el && el.textContent.trim()===was) el.textContent=now;
    };
    neutralize("#atlasVersionTruthText",
      "Build 40.6.719 · Administrator","Build 40.6.719 · Interface partagée");
    neutralize("#atlasV2ReleaseBadge",
      "Agent-Crypto @erith.IA · Build 40.6.719 · Administrator",
      "Agent-Crypto @erith.IA · Build 40.6.719 · Interface partagée");
    neutralize("#atlasAccessDialog .atlas-access-system-identity b",
      "SAS ADMINISTRATEUR","SAS D’ACCÈS LOCAL");
    neutralize("#atlasAccessDialog .atlas-access-head .eyebrow",
      "ACCÈS LOCAL · RYZEN 7","ACCÈS LOCAL · BRIDGE PRIVÉ");
    neutralize("#atlasAccessDialog .atlas-access-portal-subtitle",
      "Porte d’accès Administrateur","Choisis un profil · droits vérifiés par le Bridge");
    const live=document.querySelector("#atlasAccessDialog .atlas-access-live-panel");
    if(live && live.getAttribute("aria-label")==="Authentification Administrateur")
      live.setAttribute("aria-label","Authentification locale par profil");
    try {
      document.dispatchEvent(new CustomEvent("erith:yohan-operator-profile-ready", {
        detail: { build: "40.6.719", shared_runtime: true, ui_reduction: false, authorization_granted: false }
      }));
    } catch (_) {}
    return true;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply, { once: true });
  else apply();
  globalThis.ErithYohanOperatorProfile = Object.freeze({
    profile: PROFILE,
    apply,
    contract: Object.freeze({
      dom_hiding: false,
      view_forcing: false,
      query_parameter_authorization: false,
      storage_write: false,
      recurring_timer: false,
      observer: false,
      administrator_grant: false,
      real_trading_grant: false,
      wallet_grant: false
    })
  });
})();
