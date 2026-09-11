/*
  Agent-Crypto Administrator — Strategy A Paper Lifecycle + After-Cost Proof
  Build: 40.6.63
  Responsibility: operator-triggered acceptance proof over the existing Paper lifecycle
  and after-cost evidence owners. No real order, no Kraken order, no wallet, no credentials.
  Self-tests must preserve the pre-existing in-memory lifecycle/evidence state.
*/
(() => {
  "use strict";

  const BUILD = "40.6.63";
  const SCHEMA = "agent_crypto_strategy_a_paper_after_cost_acceptance_v1";
  let LAST_RECEIPT = null;

  const clone = value => {
    try { return JSON.parse(JSON.stringify(value)); }
    catch (_) { return null; }
  };

  const stable = value => JSON.stringify(value ?? null);

  function owners() {
    return {
      lifecycle:
        globalThis.AgentCryptoStrategyAPaperLifecycle404295 ||
        globalThis.AgentCryptoStrategyAPaperLifecycle404291 ||
        null,
      afterCost:
        globalThis.AgentCryptoStrategyAAfterCostMetrics404298 ||
        globalThis.AgentCryptoStrategyAAfterCostMetrics404292 ||
        null
    };
  }

  function lifecycleSnapshot(owner) {
    if (!owner || typeof owner.diagnostic_snapshot !== "function") return null;
    try { return clone(owner.diagnostic_snapshot()); }
    catch (_) { return null; }
  }

  function afterCostSnapshot(owner) {
    if (!owner || typeof owner.read !== "function") return null;
    try { return clone(owner.read()); }
    catch (_) { return null; }
  }

  function normalizeLifecycleChecks(test) {
    return Array.isArray(test?.checks)
      ? test.checks.map(row => ({
          id: String(row?.scenario || "UNKNOWN"),
          pass: row?.pass === true,
          expected: row?.expected ?? null,
          actual: row?.actual ?? null
        }))
      : [];
  }

  function normalizeAfterCostChecks(test) {
    const src = test?.checks && typeof test.checks === "object" ? test.checks : {};
    return Object.entries(src).map(([id, value]) => ({
      id,
      pass: value === true
    }));
  }

  function runProof() {
    const { lifecycle, afterCost } = owners();
    const startedAt = new Date().toISOString();

    if (!lifecycle || !afterCost) {
      LAST_RECEIPT = {
        schema: SCHEMA,
        build: BUILD,
        at: startedAt,
        pass: false,
        reason: "OWNER_UNAVAILABLE",
        owners: {
          lifecycle: Boolean(lifecycle),
          after_cost: Boolean(afterCost)
        },
        paper_only: true,
        real_orders: false,
        network: false,
        storage_write: false
      };
      renderReceipt();
      return clone(LAST_RECEIPT);
    }

    const lifecycleBefore = lifecycleSnapshot(lifecycle);
    const costBefore = afterCostSnapshot(afterCost);

    let lifecycleTest;
    let costTest;
    let thrown = null;

    try {
      lifecycleTest =
        typeof lifecycle.self_test === "function"
          ? lifecycle.self_test()
          : { pass: false, checks: [], reason: "LIFECYCLE_SELF_TEST_MISSING" };

      costTest =
        typeof afterCost.self_test === "function"
          ? afterCost.self_test()
          : { pass: false, checks: {}, reason: "AFTER_COST_SELF_TEST_MISSING" };
    } catch (error) {
      thrown = String(error?.message || error);
    }

    const lifecycleAfter = lifecycleSnapshot(lifecycle);
    const costAfter = afterCostSnapshot(afterCost);

    const lifecyclePreserved =
      lifecycleBefore !== null &&
      lifecycleAfter !== null &&
      stable(lifecycleBefore) === stable(lifecycleAfter);

    const afterCostPreserved =
      costBefore !== null &&
      costAfter !== null &&
      stable(costBefore) === stable(costAfter);

    const lifecycleChecks = normalizeLifecycleChecks(lifecycleTest);
    const afterCostChecks = normalizeAfterCostChecks(costTest);

    const lifecyclePass =
      thrown === null &&
      lifecycleTest?.pass === true &&
      lifecycleChecks.length > 0 &&
      lifecycleChecks.every(row => row.pass);

    const afterCostPass =
      thrown === null &&
      costTest?.pass === true &&
      afterCostChecks.length > 0 &&
      afterCostChecks.every(row => row.pass);

    const pass =
      lifecyclePass &&
      afterCostPass &&
      lifecyclePreserved &&
      afterCostPreserved;

    LAST_RECEIPT = {
      schema: SCHEMA,
      build: BUILD,
      at: startedAt,
      pass,
      error: thrown,
      owners: {
        lifecycle_build: lifecycle.build || null,
        after_cost_build: afterCost.build || null
      },
      lifecycle: {
        pass: lifecyclePass,
        checks: lifecycleChecks
      },
      after_cost: {
        pass: afterCostPass,
        checks: afterCostChecks
      },
      state_preservation: {
        lifecycle: lifecyclePreserved,
        after_cost: afterCostPreserved
      },
      invariants: {
        paper_only: lifecycle.paper_only === true && afterCost.paper_only === true,
        real_orders: false,
        network: false,
        storage_write: false,
        live_ledger_test_mutation: false,
        profitability_claim: false,
        unknown_cost_is_zero: false
      },
      verdict: pass
        ? "PASS · PAPER LIFECYCLE + AFTER-COST PROOF"
        : "FAIL · REVIEW REQUIRED",
      paper_only: true,
      real_orders: false,
      network: false,
      storage_write: false
    };

    renderReceipt();
    return clone(LAST_RECEIPT);
  }

  function exportReceipt() {
    const payload = LAST_RECEIPT || {
      schema: SCHEMA,
      build: BUILD,
      at: new Date().toISOString(),
      pass: false,
      reason: "PROOF_NOT_EXECUTED",
      paper_only: true,
      real_orders: false
    };

    if (typeof document !== "undefined") {
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "STRATEGY_A_PAPER_AFTER_COST_ACCEPTANCE_40_6_63.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    }
    return clone(payload);
  }

  function ensureStyle() {
    if (typeof document === "undefined") return;
    if (document.getElementById("strategyAPaperAfterCostProofStyle406063")) return;

    const style = document.createElement("style");
    style.id = "strategyAPaperAfterCostProofStyle406063";
    style.textContent = `
      #strategyAPaperAfterCostProof406063{
        margin-top:10px;padding:11px;border:1px solid rgba(118,217,255,.23);
        border-radius:10px;background:rgba(5,18,31,.52)
      }
      #strategyAPaperAfterCostProof406063 .pap-head{
        display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap
      }
      #strategyAPaperAfterCostProof406063 .pap-title{
        font-size:10px;font-weight:950;letter-spacing:.08em;text-transform:uppercase
      }
      #strategyAPaperAfterCostProof406063 .pap-sub{
        margin-top:3px;font-size:8px;line-height:1.4;opacity:.78
      }
      #strategyAPaperAfterCostProof406063 .pap-actions{
        display:flex;gap:6px;flex-wrap:wrap
      }
      #strategyAPaperAfterCostProof406063 .pap-grid{
        display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:9px
      }
      #strategyAPaperAfterCostProof406063 .pap-k{
        padding:7px;border:1px solid rgba(255,255,255,.07);border-radius:8px
      }
      #strategyAPaperAfterCostProof406063 .pap-k span{
        display:block;font-size:7px;letter-spacing:.06em;text-transform:uppercase;opacity:.65;font-weight:900
      }
      #strategyAPaperAfterCostProof406063 .pap-k b{
        display:block;margin-top:3px;font-size:9px;overflow-wrap:anywhere
      }
      #strategyAPaperAfterCostProof406063 .pap-verdict{
        margin-top:8px;padding:8px;border:1px solid rgba(255,255,255,.07);
        border-radius:8px;font-size:9px;font-weight:900
      }
      #strategyAPaperAfterCostProof406063 .pap-foot{
        margin-top:7px;font-size:8px;line-height:1.4;opacity:.72
      }
      @media(max-width:950px){
        #strategyAPaperAfterCostProof406063 .pap-grid{
          grid-template-columns:repeat(2,minmax(0,1fr))
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderReceipt() {
    if (typeof document === "undefined") return false;
    const panel = document.getElementById("strategyAPaperAfterCostProof406063");
    if (!panel) return false;

    const receipt = LAST_RECEIPT;
    const set = (key, value) => {
      const node = panel.querySelector(`[data-pap="${key}"]`);
      if (node) node.textContent = value;
    };

    if (!receipt) {
      set("lifecycle", "EN ATTENTE");
      set("aftercost", "EN ATTENTE");
      set("preservation", "NON TESTÉE");
      set("checks", "0");
      set("verdict", "Aucune preuve exécutée.");
      return true;
    }

    const lifecycleCount = receipt.lifecycle?.checks?.length || 0;
    const afterCount = receipt.after_cost?.checks?.length || 0;
    const passCount =
      (receipt.lifecycle?.checks || []).filter(x => x.pass).length +
      (receipt.after_cost?.checks || []).filter(x => x.pass).length;

    set("lifecycle", receipt.lifecycle?.pass ? "PASS" : "FAIL");
    set("aftercost", receipt.after_cost?.pass ? "PASS" : "FAIL");
    set(
      "preservation",
      receipt.state_preservation?.lifecycle && receipt.state_preservation?.after_cost
        ? "PASS"
        : "FAIL"
    );
    set("checks", `${passCount}/${lifecycleCount + afterCount}`);
    set("verdict", receipt.verdict || "—");
    return true;
  }

  function mount() {
    if (typeof document === "undefined") return false;
    ensureStyle();

    const anchor =
      document.getElementById("strategyAReplaySandbox404290") ||
      document.getElementById("strategyAExperimentLedger404289") ||
      document.getElementById("strategyADecisionTrace404278") ||
      document.getElementById("strategyAAfterCost404292") ||
      document.getElementById("strategyAPaperLifecycle404291");

    if (!anchor) return false;

    let panel = document.getElementById("strategyAPaperAfterCostProof406063");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "strategyAPaperAfterCostProof406063";
      panel.dataset.strategyAPaperAfterCostProofBuild = BUILD;
      panel.innerHTML = `
        <div class="pap-head">
          <div>
            <div class="pap-title">PAPER V2 · LIFECYCLE + AFTER-COST ACCEPTANCE</div>
            <div class="pap-sub">
              Preuve opérateur isolée : lifecycle, partial fills, reconciliation,
              protection et comptabilité après coûts. Les self-tests doivent restaurer
              intégralement leur état initial.
            </div>
          </div>
          <div class="pap-actions">
            <button class="btn small" type="button" id="strategyAPaperAfterCostRun406063">EXÉCUTER PREUVE PAPER</button>
            <button class="btn small" type="button" id="strategyAPaperAfterCostExport406063">EXPORTER RECEIPT</button>
          </div>
        </div>
        <div class="pap-grid">
          <div class="pap-k"><span>Lifecycle</span><b data-pap="lifecycle">EN ATTENTE</b></div>
          <div class="pap-k"><span>After-cost</span><b data-pap="aftercost">EN ATTENTE</b></div>
          <div class="pap-k"><span>État préservé</span><b data-pap="preservation">NON TESTÉE</b></div>
          <div class="pap-k"><span>Checks</span><b data-pap="checks">0</b></div>
        </div>
        <div class="pap-verdict" data-pap="verdict">Aucune preuve exécutée.</div>
        <div class="pap-foot">
          PAPER ONLY · aucun réseau · aucun ordre Kraken · aucun wallet · aucune clé.
          UNKNOWN coût reste UNKNOWN. Aucune conclusion de rentabilité.
        </div>
      `;
      anchor.insertAdjacentElement("afterend", panel);
    }

    panel.querySelector("#strategyAPaperAfterCostRun406063")
      ?.addEventListener("click", runProof, { once: false });
    panel.querySelector("#strategyAPaperAfterCostExport406063")
      ?.addEventListener("click", exportReceipt, { once: false });

    renderReceipt();
    return true;
  }

  const api = Object.freeze({
    build: BUILD,
    schema: SCHEMA,
    run: runProof,
    export_receipt: exportReceipt,
    read: () => clone(LAST_RECEIPT),
    mount,
    paper_only: true,
    real_orders: false,
    network: false,
    storage_write: false,
    recurring_timer: false,
    observer: false,
    profitability_claim: false
  });

  globalThis.AgentCryptoStrategyAPaperAfterCostAcceptance406063 = api;

  if (typeof document !== "undefined") {
    let mounted = false;

    const cleanup = () => {
      document.removeEventListener("click", attemptMount, true);
      document.removeEventListener("focusin", attemptMount, true);
      window.removeEventListener("pageshow", attemptMount);
    };

    const attemptMount = () => {
      if (mounted) return true;
      mounted = mount() === true;
      if (mounted) cleanup();
      return mounted;
    };

    const afterPaint = () => {
      try {
        requestAnimationFrame(() => requestAnimationFrame(attemptMount));
      } catch (_) {
        attemptMount();
      }
    };

    document.addEventListener("click", attemptMount, true);
    document.addEventListener("focusin", attemptMount, true);
    window.addEventListener("pageshow", attemptMount);

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        attemptMount();
        afterPaint();
      }, { once: true });
      window.addEventListener("load", () => {
        attemptMount();
        afterPaint();
      }, { once: true });
    } else {
      attemptMount();
      afterPaint();
    }
  }
})();
