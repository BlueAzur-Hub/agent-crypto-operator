/* Agent-Crypto @erith.IA — DEX exclusion diagnostics · 40.6.98+
   Read-only observability over the existing private backend Source Intelligence owner.
   Build identity follows the immutable loaded entry / Version Truth owner.
   No network owner, timer, MutationObserver, storage write, canonical price, wallet or trade. */
(()=>{
  "use strict";
  const metaBuild=()=>String(document.querySelector('meta[name="administrator-build"]')?.content||"").trim();
  const pathBuild=()=>String(location.pathname||"").match(/(?:^|\/)index-(\d+\.\d+\.\d+)\.html$/i)?.[1]||"";
  const BUILD=String(globalThis.ErithVersionTruth?.build||pathBuild()||metaBuild()||"runtime").trim();
  const ASSETS=Object.freeze(["BTC","ETH","BNB","XRP","SOL"]);
  const ROOT_ID="privateDexExclusionDiagnostics406098";
  let lastReport=null;

  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const num=value=>(value===null||value===undefined||value==="")?null:(Number.isFinite(Number(value))?Number(value):null);

  function classify(row){
    const ds=row?.dexscreener||{},gt=row?.geckoterminal||{},identity=row?.identity||{};
    const reasons=[];
    const dsOk=ds.status==="ok",gtOk=gt.status==="ok";
    const status=String(identity.status||"unknown").toLowerCase();
    if(!dsOk)reasons.push("DEXSCREENER_MISSING");
    if(!gtOk)reasons.push("GECKOTERMINAL_MISSING");
    if(identity.address_mismatch===true)reasons.push("ADDRESS_MISMATCH");
    if(identity.liquidity_review===true)reasons.push("LIQUIDITY_REVIEW");
    if(!["proved","bounded"].includes(status))reasons.push(`IDENTITY_${status.toUpperCase()}`);
    if(identity.atlas_eligible!==true&&!reasons.length)reasons.push("ATLAS_NOT_ELIGIBLE");
    const eligible=identity.atlas_eligible===true&&identity.address_mismatch!==true&&identity.liquidity_review!==true;
    return Object.freeze({
      asset:String(row?.asset||""),
      eligible,
      identity_status:status,
      dexscreener_ok:dsOk,
      geckoterminal_ok:gtOk,
      address_mismatch:identity.address_mismatch===true,
      liquidity_review:identity.liquidity_review===true,
      liquidity_ratio:num(identity.liquidity_ratio),
      atlas_eligible:identity.atlas_eligible===true,
      reasons:Object.freeze(reasons)
    });
  }

  function buildReport(){
    const api=globalThis.ErithPrivateBackendSources;
    const context=api?.contextSnapshot?.();
    if(!context||!Array.isArray(context.assets))return null;
    const rows=ASSETS.map(asset=>{
      const row=context.assets.find(item=>String(item?.asset||"")===asset)||{asset};
      return classify(row);
    });
    const reasons={};
    rows.forEach(row=>row.reasons.forEach(reason=>{reasons[reason]=(reasons[reason]||0)+1;}));
    const eligible=rows.filter(row=>row.eligible).length;
    const report=Object.freeze({
      schema:"agent_crypto_dex_exclusion_diagnostics_v1",
      build:BUILD,
      generated_at_utc:new Date().toISOString(),
      backend_version:String(api?.backend_version||"unknown"),
      total_assets:rows.length,
      eligible_assets:eligible,
      excluded_assets:rows.length-eligible,
      reasons:Object.freeze({...reasons}),
      assets:Object.freeze(rows),
      contract:Object.freeze({
        read_only:true,
        canonical_price_created:false,
        dex_price_promoted:false,
        financial_signal:false,
        storage_write:false,
        network_owner:false,
        recurring_timer:false,
        observer:false
      })
    });
    lastReport=report;
    return report;
  }

  function statusText(row){
    if(row.eligible)return "ÉLIGIBLE";
    if(!row.reasons.length)return "EXCLU · cause inconnue";
    return `EXCLU · ${row.reasons.join(" + ")}`;
  }

  function ensureHost(){
    const section=document.getElementById("privateSourceIntelligence");
    if(!section)return null;
    let root=document.getElementById(ROOT_ID);
    if(root)return root;
    root=document.createElement("details");
    root.id=ROOT_ID;
    root.className="private-backend-note";
    root.dataset.dexDiagnostics406098="true";
    root.innerHTML=`
      <summary><strong>Diagnostic DEX · éligibilité Atlas</strong> · lecture seule</summary>
      <div id="privateDexExclusionDiagnosticsSummary">En attente du contexte DEX.</div>
      <div id="privateDexExclusionDiagnosticsRows"></div>`;
    section.appendChild(root);
    return root;
  }

  function render(){
    const report=buildReport();
    if(!report)return null;
    ensureHost();
    const summary=document.getElementById("privateDexExclusionDiagnosticsSummary");
    const rows=document.getElementById("privateDexExclusionDiagnosticsRows");
    if(summary){
      summary.textContent=`${report.eligible_assets}/${report.total_assets} éligibles Atlas · ${report.excluded_assets} exclu(s) · aucune promotion de prix DEX`;
    }
    if(rows){
      rows.innerHTML=report.assets.map(row=>{
        const ratio=row.liquidity_ratio!==null?` · ratio ${row.liquidity_ratio.toFixed(1)}×`:"";
        const tone=row.eligible?"is-ok":"is-watch";
        return `<div><strong>${esc(row.asset)}</strong> · <span class="${tone}">${esc(statusText(row))}</span>${esc(ratio)}</div>`;
      }).join("");
    }
    document.documentElement.dataset.dexDiagnostics406098=report.excluded_assets===0?"all-eligible":"partial";
    try{document.dispatchEvent(new CustomEvent("agentcrypto:dex-exclusion-diagnostics",{detail:report}));}catch(_){}
    return report;
  }

  function schedule(){
    try{requestAnimationFrame(()=>requestAnimationFrame(render));}
    catch(_){queueMicrotask(render);}
  }

  document.addEventListener("erith:source-intelligence",schedule,{passive:true});
  window.addEventListener("erith:private-source-runtime-loaded",schedule,{passive:true});
  document.addEventListener("agentcrypto:current-finalized",schedule,{passive:true});
  if(document.readyState==="loading")window.addEventListener("load",schedule,{once:true});
  else schedule();

  globalThis.AgentCryptoDexExclusionDiagnostics406098=Object.freeze({
    build:BUILD,
    render,
    report:()=>lastReport,
    read_only:true,
    source_build_dynamic:true,
    new_network_owner:false,
    recurring_timer:false,
    observer:false,
    storage_write:false,
    trading:false
  });
})();
