/* Agent-Crypto @erith.IA — 40.6.152 RETROSPECTIVE HISTORY
   Presentation companion only. Data authority remains retrospective-validation.js.
   Reads atlasRetrospectiveValidation.derive(), renders the last evaluable CURRENT
   observations inside the existing Decision Board POST-CURRENT block.
   No fetch, timer, observer, storage write, score, prediction or engine mutation. */
(() => {
  "use strict";

  const RELEASE = "40.6.152";
  const OWNER = "retrospective-history-presentation";
  const ROOT_ID = "retroHistory152";
  const ROWS_ID = "retroHistoryRows152";
  const COUNT_ID = "retroHistoryCount152";
  const STYLE_ID = "retroHistoryStyle152";
  const HISTORY_LIMIT = 8;

  function source() {
    const api = globalThis.atlasRetrospectiveValidation;
    if (!api || typeof api.derive !== "function") return null;
    try { return api.derive(); } catch (_) { return null; }
  }

  function parseTime(value) {
    const ms = Date.parse(value || 0);
    return Number.isFinite(ms) ? ms : 0;
  }

  function marketTime(record) {
    return parseTime(
      record?.market_generated_at ||
      record?.source_time ||
      record?.snapshot?.market_snapshot?.source_time ||
      record?.saved_at ||
      record?.last_seen_at
    );
  }

  function fingerprint(record) {
    const raw = String(record?.analysis_fingerprint || record?.current_fingerprint || "").trim();
    if (raw) return raw.startsWith("sha256:") ? raw : `sha256:${raw}`;
    try {
      if (typeof globalThis.atlasCurrentMemoryFingerprint34 === "function") {
        const value = String(globalThis.atlasCurrentMemoryFingerprint34(record) || "").trim();
        return value ? (value.startsWith("sha256:") ? value : `sha256:${value}`) : "";
      }
    } catch (_) {}
    return "";
  }

  function compactFingerprint(record) {
    const value = fingerprint(record);
    return value ? (value.length > 20 ? `${value.slice(0, 18)}…` : value) : "—";
  }

  function localTime(value) {
    const ms = typeof value === "number" ? value : parseTime(value);
    return ms ? new Date(ms).toLocaleString("fr-FR") : "—";
  }

  function duration(fromMs, toMs) {
    if (!(fromMs > 0) || !(toMs > fromMs)) return "—";
    const minutes = Math.round((toMs - fromMs) / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours} h ${rest} min` : `${hours} h`;
  }

  function pct(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return `${n >= 0 ? "+" : ""}${n.toFixed(2)} %`;
  }

  function returnsLine(data) {
    const rows = Array.isArray(data?.rows) ? data.rows : [];
    return rows.length
      ? rows.map(row => `${String(row.symbol || "?").toUpperCase()} ${pct(row.pct)}`).join(" · ")
      : "TOP5 non comparable";
  }

  function breadthLine(data) {
    if (!Number(data?.comparable || 0)) return "Indéterminée";
    return `${Number(data.up || 0)} hausse(s) · ${Number(data.down || 0)} baisse(s) · ${Number(data.flat || 0)} stable(s)`;
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #decisionRetrospective > #${ROOT_ID}{
        grid-column:1 / -1!important;
        width:100%!important;
        box-sizing:border-box!important;
        margin:10px 0 2px!important;
        padding:14px!important;
        border:1px solid rgba(98,236,255,.25)!important;
        border-radius:16px!important;
        background:linear-gradient(135deg,rgba(8,26,38,.94),rgba(9,20,32,.90))!important;
      }
      #${ROOT_ID} .retro-history-head152{
        display:flex!important;
        align-items:flex-start!important;
        justify-content:space-between!important;
        gap:16px!important;
        margin:0 0 10px!important;
      }
      #${ROOT_ID} .retro-history-head152 span{
        display:block!important;
        color:#62ecff!important;
        font:900 10px/1.2 system-ui,sans-serif!important;
        letter-spacing:.16em!important;
      }
      #${ROOT_ID} .retro-history-head152 b{
        display:block!important;
        margin-top:4px!important;
        color:#fff0bd!important;
        font:950 17px/1.2 system-ui,sans-serif!important;
      }
      #${ROOT_ID} .retro-history-head152 small{
        display:block!important;
        margin-top:4px!important;
        color:#9db2c2!important;
        font:600 11px/1.4 system-ui,sans-serif!important;
      }
      #${COUNT_ID}{
        flex:0 0 auto!important;
        min-width:max-content!important;
        padding:6px 10px!important;
        border:1px solid rgba(126,255,178,.28)!important;
        border-radius:999px!important;
        color:#a9ffd0!important;
        background:rgba(31,116,76,.16)!important;
        font:900 11px/1 system-ui,sans-serif!important;
      }
      #${ROWS_ID}{
        display:grid!important;
        gap:7px!important;
      }
      #${ROWS_ID} .retro-history-row152{
        display:grid!important;
        grid-template-columns:minmax(160px,.85fr) minmax(130px,.72fr) minmax(360px,2.25fr) minmax(210px,1fr)!important;
        gap:10px!important;
        align-items:center!important;
        padding:10px 12px!important;
        border:1px solid rgba(118,167,194,.18)!important;
        border-radius:12px!important;
        background:rgba(2,14,24,.48)!important;
      }
      #${ROWS_ID} .retro-history-cell152{
        min-width:0!important;
      }
      #${ROWS_ID} .retro-history-cell152 span{
        display:block!important;
        margin-bottom:3px!important;
        color:#7f9aad!important;
        font:850 9px/1.2 system-ui,sans-serif!important;
        letter-spacing:.08em!important;
        text-transform:uppercase!important;
      }
      #${ROWS_ID} .retro-history-cell152 b{
        display:block!important;
        color:#eaf6fb!important;
        font:850 12px/1.35 system-ui,sans-serif!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
      }
      #${ROWS_ID} .retro-history-cell152 small{
        display:block!important;
        margin-top:2px!important;
        color:#8ea7b8!important;
        font:600 10px/1.35 system-ui,sans-serif!important;
      }
      #${ROWS_ID} .retro-history-empty152{
        margin:0!important;
        padding:12px!important;
        border:1px dashed rgba(118,167,194,.22)!important;
        border-radius:12px!important;
        color:#95aabc!important;
        font:650 11px/1.4 system-ui,sans-serif!important;
      }
      @media(max-width:1180px){
        #${ROWS_ID} .retro-history-row152{
          grid-template-columns:minmax(150px,.8fr) minmax(120px,.7fr) minmax(0,2fr)!important;
        }
        #${ROWS_ID} .retro-history-row152 > :last-child{
          grid-column:1 / -1!important;
        }
      }
      @media(max-width:760px){
        #${ROOT_ID} .retro-history-head152{display:block!important}
        #${COUNT_ID}{display:inline-block!important;margin-top:8px!important}
        #${ROWS_ID} .retro-history-row152{
          grid-template-columns:1fr!important;
          gap:7px!important;
        }
        #${ROWS_ID} .retro-history-row152 > :last-child{grid-column:auto!important}
      }
    `;
    document.head.appendChild(style);
  }

  function cell(label, value, detail = "") {
    const node = document.createElement("div");
    node.className = "retro-history-cell152";
    const span = document.createElement("span");
    span.textContent = label;
    const strong = document.createElement("b");
    strong.textContent = value || "—";
    node.append(span, strong);
    if (detail) {
      const small = document.createElement("small");
      small.textContent = detail;
      node.appendChild(small);
    }
    return node;
  }

  function ensureRoot() {
    const parent = document.getElementById("decisionRetrospective");
    if (!parent) return null;

    let root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement("section");
      root.id = ROOT_ID;
      root.className = "decision-retrospective-history152";
      root.setAttribute("aria-label", "Historique rétrospectif des CURRENT évaluables");
      root.innerHTML = `
        <div class="retro-history-head152">
          <div>
            <span>HISTORIQUE RÉTROSPECTIF · ${RELEASE}</span>
            <b>CURRENT évaluables · observation postérieure réelle</b>
            <small>Dernières unités mesurables. Aucun score de réussite, aucune prédiction reconstruite.</small>
          </div>
          <em id="${COUNT_ID}">0 évaluable</em>
        </div>
        <div id="${ROWS_ID}" aria-live="polite"></div>`;

      const contractCard = Array.from(parent.children).find(node =>
        node.matches?.("article") &&
        String(node.querySelector?.("span")?.textContent || "").trim().toUpperCase() === "CONTRAT"
      );
      parent.insertBefore(root, contractCard || null);
    }
    return root;
  }

  function render() {
    installStyle();
    const root = ensureRoot();
    if (!root) return null;

    const data = source();
    const rows = Array.isArray(data?.evaluable)
      ? data.evaluable.slice().sort((a, b) => Number(b?.closedAt || 0) - Number(a?.closedAt || 0)).slice(0, HISTORY_LIMIT)
      : [];

    const count = document.getElementById(COUNT_ID);
    if (count) count.textContent = `${rows.length} affiché(s) · ${Number(data?.evaluable?.length || 0)} évaluable(s)`;

    const host = document.getElementById(ROWS_ID);
    if (!host) return data;
    host.replaceChildren();

    if (!rows.length) {
      const empty = document.createElement("p");
      empty.className = "retro-history-empty152";
      empty.textContent = "Aucun CURRENT évaluable pour l’instant : il faut un snapshot marché canonique strictement postérieur et au moins 3 prix TOP5 comparables.";
      host.appendChild(empty);
    } else {
      rows.forEach(pair => {
        const firstAt = pair?.first ? marketTime(pair.first) : 0;
        const row = document.createElement("article");
        row.className = "retro-history-row152";
        row.append(
          cell("CURRENT fermé", localTime(pair.closedAt), compactFingerprint(pair.current)),
          cell("Marché postérieur", duration(pair.closedAt, firstAt), firstAt ? localTime(firstAt) : "—"),
          cell("TOP5 observé", returnsLine(pair.firstReturns)),
          cell("Largeur marché", breadthLine(pair.firstReturns), `${Number(pair.firstReturns?.comparable || 0)}/5 comparable(s)`)
        );
        host.appendChild(row);
      });
    }

    root.dataset.release = RELEASE;
    root.dataset.readOnly = "true";
    root.dataset.evaluable = String(Number(data?.evaluable?.length || 0));
    root.dataset.displayed = String(rows.length);
    return data;
  }

  const baseRenderDecisionBoard = typeof globalThis.renderDecisionBoard === "function"
    ? globalThis.renderDecisionBoard
    : null;

  if (baseRenderDecisionBoard && !globalThis.__AGENT_CRYPTO_RETRO_HISTORY_WRAPPED_152__) {
    globalThis.renderDecisionBoard = function renderDecisionBoardWithHistory152(...args) {
      const result = baseRenderDecisionBoard.apply(this, args);
      queueMicrotask(() => { try { render(); } catch (_) {} });
      return result;
    };
    globalThis.__AGENT_CRYPTO_RETRO_HISTORY_WRAPPED_152__ = true;
  }

  document.addEventListener("click", event => {
    const id = event?.target?.closest?.("button")?.id || "";
    if (id === "btnAtlasAnalyticalMemoryRefresh394" || id === "btnDecisionBoardRetrospectiveExport3961") {
      queueMicrotask(() => { try { render(); } catch (_) {} });
    }
  });

  globalThis.AgentCryptoRetrospectiveHistory = Object.freeze({
    release: RELEASE,
    owner: OWNER,
    history_limit: HISTORY_LIMIT,
    data_owner: "retrospective-validation.js",
    observation_not_prediction: true,
    forecast_accuracy_score: false,
    writes_memory: false,
    new_fetch: false,
    new_timer: false,
    new_observer: false,
    new_storage_owner: false,
    render
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => queueMicrotask(render), { once: true });
  } else {
    queueMicrotask(render);
  }
})();