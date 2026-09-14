(() => {
  "use strict";

  const PROFILE = Object.freeze({
    id: "yohan-operator",
    deliveryBuild: "40.6.121",
    runtime: "canonical-master-shared",
    sameAdministratorInterface: true,
    hideProjects: false,
    forceReducedView: false,
    grantsAdministratorSession: false,
    bridgeAuthenticationOwner: "future-local-bridge",
    publicSecretEmbedded: false
  });

  function apply() {
    document.documentElement.dataset.yohanProfile = "operator";
    document.documentElement.dataset.yohanOperatorDelivery = "40.6.121";
    document.documentElement.dataset.yohanSharedAdministratorRuntime = "true";
    if (document.body) {
      document.body.dataset.yohanProfile = "operator";
      document.body.dataset.yohanOperatorDelivery = "40.6.121";
    }
    try {
      document.dispatchEvent(new CustomEvent("erith:yohan-operator-profile-ready", {
        detail: { build: "40.6.121", shared_runtime: true, ui_reduction: false, authorization_granted: false }
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
      storage_write: false,
      recurring_timer: false,
      observer: false,
      administrator_grant: false,
      real_trading_grant: false,
      wallet_grant: false
    })
  });
})();
