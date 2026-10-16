(() => {
  "use strict";
  globalThis.AgentCryptoStrategyAAutoStartSelfTest = () => {
    const api = globalThis.AgentCryptoStrategyAAutoStart;
    return { present: !!api, snapshot: api?.snapshot?.() || null };
  };
})();
