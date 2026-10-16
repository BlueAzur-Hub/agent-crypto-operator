/* Agent-Crypto @erith.IA — 40.6.150 COMPACT RHYTHM
   Presentation only. Keeps the validated 40.6.149 hierarchy and typography while
   reducing vertical whitespace between standard subsection summaries.
   Primary/custom summary contracts remain excluded. No data, engine, fetch,
   timer, observer, storage or business logic. */
(() => {
  "use strict";

  const BUILD = "40.6.150";
  const STYLE_ID = "agentCryptoCanonicalSubsectionSummary150";
  const STANDARD = [
    "details.atlas-family-member",
    ":not(.atlas-local-ai-collapse)",
    ":not(.atlas-oracle-suite)",
    ":not(.forge-aerith-collapse)",
    ":not(.forge-aerith-embedded-collapse)",
    ":not(.atlas-chatgpt-workspace-collapse)"
  ].join("");

  function install() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      ${STANDARD}{
        margin:6px 0!important;
      }

      ${STANDARD} > summary.atlas-collapse-summary{
        min-height:80px!important;
        padding:12px 18px!important;
        display:grid!important;
        grid-template-columns:42px minmax(0,1fr) auto!important;
        grid-template-rows:auto auto!important;
        column-gap:16px!important;
        row-gap:4px!important;
        align-items:center!important;
        box-sizing:border-box!important;
        border-left-width:4px!important;
        background:linear-gradient(90deg,rgba(98,236,255,.055),rgba(255,255,255,.018) 34%,rgba(255,255,255,.008))!important;
      }

      ${STANDARD} > summary.atlas-collapse-summary > .atlas-collapse-icon,
      ${STANDARD} > summary.atlas-collapse-summary > .atlas-news-report-summary-icon{
        grid-column:1!important;
        grid-row:1 / span 2!important;
        align-self:center!important;
        justify-self:center!important;
        width:38px!important;
        height:38px!important;
        min-width:38px!important;
        flex:0 0 38px!important;
        font-size:12px!important;
      }

      ${STANDARD} > summary.atlas-collapse-summary > .atlas-collapse-copy{
        grid-column:2!important;
        grid-row:1 / span 2!important;
        display:flex!important;
        flex-direction:column!important;
        justify-content:center!important;
        align-items:flex-start!important;
        gap:4px!important;
        min-width:0!important;
        width:100%!important;
        text-align:left!important;
      }

      ${STANDARD} > summary.atlas-collapse-summary > .atlas-collapse-title{
        grid-column:2!important;
        grid-row:1!important;
        align-self:end!important;
      }

      ${STANDARD} > summary.atlas-collapse-summary > .atlas-collapse-subtitle{
        grid-column:2!important;
        grid-row:2!important;
        align-self:start!important;
      }

      ${STANDARD} > summary.atlas-collapse-summary .atlas-collapse-title{
        display:block!important;
        min-width:0!important;
        margin:0!important;
        color:#fff4c2!important;
        font-size:clamp(20px,1.36vw,23px)!important;
        line-height:1.14!important;
        font-weight:950!important;
        letter-spacing:.005em!important;
        white-space:normal!important;
        overflow:visible!important;
        text-overflow:clip!important;
      }

      ${STANDARD} > summary.atlas-collapse-summary .atlas-collapse-subtitle{
        display:block!important;
        min-width:0!important;
        margin:0!important;
        color:#b9cad8!important;
        font-size:clamp(13.5px,.94vw,15px)!important;
        line-height:1.42!important;
        font-weight:520!important;
        letter-spacing:.002em!important;
        white-space:normal!important;
        overflow:visible!important;
        text-overflow:clip!important;
      }

      ${STANDARD} > summary.atlas-collapse-summary > .atlas-collapse-state{
        grid-column:3!important;
        grid-row:1 / span 2!important;
        align-self:center!important;
        justify-self:end!important;
        min-width:72px!important;
        margin:0!important;
        font-size:12px!important;
        line-height:1.15!important;
      }

      .news-sentinel-collapse.atlas-family-member > summary.atlas-collapse-summary{
        grid-template-columns:minmax(0,1fr) auto auto!important;
        grid-template-rows:auto!important;
        min-height:86px!important;
      }
      .news-sentinel-collapse.atlas-family-member > summary.atlas-collapse-summary > .atlas-collapse-copy{
        grid-column:1!important;
        grid-row:1!important;
      }
      .news-sentinel-collapse.atlas-family-member > summary.atlas-collapse-summary > .news-collapse-live{
        grid-column:2!important;
        grid-row:1!important;
        align-self:center!important;
        min-width:190px!important;
      }
      .news-sentinel-collapse.atlas-family-member > summary.atlas-collapse-summary > .atlas-collapse-state{
        grid-column:3!important;
        grid-row:1!important;
      }
      .news-sentinel-collapse.atlas-family-member > summary .news-collapse-live b{
        font-size:13px!important;
        line-height:1.22!important;
      }
      .news-sentinel-collapse.atlas-family-member > summary .news-collapse-live small{
        font-size:11px!important;
        line-height:1.32!important;
      }

      ${STANDARD} > summary.atlas-collapse-summary > .atlas-auto-reader-summary-truth,
      ${STANDARD} > summary.atlas-collapse-summary > .atlas-auto-reader-summary-meta{
        align-self:center!important;
      }

      @media(max-width:1180px){
        ${STANDARD} > summary.atlas-collapse-summary{
          min-height:78px!important;
          padding:11px 14px!important;
          grid-template-columns:38px minmax(0,1fr) auto!important;
          column-gap:13px!important;
        }
        ${STANDARD} > summary.atlas-collapse-summary .atlas-collapse-title{font-size:18px!important}
        ${STANDARD} > summary.atlas-collapse-summary .atlas-collapse-subtitle{display:block!important;font-size:12.5px!important}
        .news-sentinel-collapse.atlas-family-member > summary.atlas-collapse-summary{
          grid-template-columns:minmax(0,1fr) auto!important;
          grid-template-rows:auto auto!important;
        }
        .news-sentinel-collapse.atlas-family-member > summary.atlas-collapse-summary > .news-collapse-live{
          grid-column:1!important;
          grid-row:2!important;
          justify-self:start!important;
          min-width:0!important;
          margin-top:4px!important;
        }
        .news-sentinel-collapse.atlas-family-member > summary.atlas-collapse-summary > .atlas-collapse-state{
          grid-column:2!important;
          grid-row:1 / span 2!important;
        }
      }

      @media(max-width:760px){
        ${STANDARD} > summary.atlas-collapse-summary{
          min-height:76px!important;
          grid-template-columns:34px minmax(0,1fr)!important;
          grid-template-rows:auto auto auto!important;
          padding:10px 12px!important;
        }
        ${STANDARD} > summary.atlas-collapse-summary > .atlas-collapse-state{
          grid-column:2!important;
          grid-row:3!important;
          justify-self:start!important;
          margin-top:4px!important;
        }
        ${STANDARD} > summary.atlas-collapse-summary .atlas-collapse-title{font-size:17px!important}
        ${STANDARD} > summary.atlas-collapse-summary .atlas-collapse-subtitle{font-size:12px!important}
        .news-sentinel-collapse.atlas-family-member > summary.atlas-collapse-summary{
          grid-template-columns:minmax(0,1fr)!important;
          grid-template-rows:auto auto auto!important;
        }
        .news-sentinel-collapse.atlas-family-member > summary.atlas-collapse-summary > .atlas-collapse-copy,
        .news-sentinel-collapse.atlas-family-member > summary.atlas-collapse-summary > .news-collapse-live,
        .news-sentinel-collapse.atlas-family-member > summary.atlas-collapse-summary > .atlas-collapse-state{grid-column:1!important}
        .news-sentinel-collapse.atlas-family-member > summary.atlas-collapse-summary > .atlas-collapse-copy{grid-row:1!important}
        .news-sentinel-collapse.atlas-family-member > summary.atlas-collapse-summary > .news-collapse-live{grid-row:2!important}
        .news-sentinel-collapse.atlas-family-member > summary.atlas-collapse-summary > .atlas-collapse-state{grid-row:3!important}
      }
    `;

    document.head.appendChild(style);
    document.documentElement.dataset.subsectionPresentation = BUILD;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();

  globalThis.AgentCryptoAnalysisSubsectionPresentation = Object.freeze({
    build: BUILD,
    owner: "analysis-subsection-presentation",
    contract: "structural-atlas-family-summary-compact-rhythm",
    presentation_only: true,
    key_list_removed: true,
    primary_contracts_excluded: true,
    desktop_summary_min_height_px: 80,
    desktop_vertical_margin_px: 6,
    business_logic_changed: false,
    engine_changed: false,
    fetch_added: false,
    timer_added: false,
    observer_added: false,
    storage_added: false,
    install
  });
})();