/* Agent-Crypto @erith.IA — Strategy A ↔ TRADUS Comparative Intelligence
   Administrator 40.6.115.
   Visible read-only synthesis mounted directly under the existing TRADUS panel.
   It reads the canonical current Strategy A read truth, TRADUS, comparative ledger
   and TRADUS Paper observability owners.
   No fetch, timer, observer, storage write, strategy mutation, wallet or order path. */
(()=>{
  "use strict";

  const OWNER="strategy-tradus-comparative-intelligence";
  const ROOT_ID="strategyTradusComparativeIntelligence";
  const STYLE_ID="strategyTradusComparativeIntelligenceStyle";
  const MAX_FRESH_SECONDS=15;
  let lastModel=null;

  const upper=v=>String(v??"").trim().toUpperCase();
  const finite=v=>Number.isFinite(Number(v))?Number(v):null;
  const pct=v=>finite(v)===null?"N/D":`${(Number(v)*100).toFixed(1)} %`;
  const money=v=>finite(v)===null?"N/D":new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(v));
  const runtimeBuild=()=>String(globalThis.ErithVersionTruth?.build||new URLSearchParams(location.search).get("ac-build")||document.querySelector('meta[name="administrator-build"]')?.content||"40.6.115").trim();
  const safe=(fn,fallback=null)=>{try{return typeof fn==="function"?fn():fallback;}catch(_){return fallback;}};

  function readStrategy(){
    const canonical=globalThis.AgentCryptoTradusStrategyFailClosed;
    const historical=globalThis.AgentCryptoTradusStrategyReconcile;
    const raw=safe(canonical?.readStrategyA,null)
      ||safe(historical?.readStrategyA,{decision:"INCONNU",phase:null,direction_score:null})
      ||{decision:"INCONNU"};
    const state=canonical?.stateOf?.(raw)||"UNKNOWN";
    return Object.freeze({
      decision:String(raw.decision||"INCONNU"),
      phase:raw.phase||null,
      direction_score:finite(raw.direction_score),
      blocker:raw.blocker||null,
      reason:raw.reason||null,
      source:raw.source||"HISTORICAL_RECONCILE",
      state
    });
  }

  function readTradus(){
    const row=safe(globalThis.AgentCryptoTradusShadow?.read,null);
    if(!row)return Object.freeze({available:false,fresh:false,age_seconds:null,action:"NO_TRADE",reason:"NO_DATA",imbalance:null,spread:null,row:null});
    const at=Date.parse(String(row.at||""));
    const age=Number.isFinite(at)?Math.max(0,(Date.now()-at)/1000):null;
    const fresh=row.ok===true&&age!==null&&age<=MAX_FRESH_SECONDS;
    return Object.freeze({
      available:row.ok===true,
      fresh,
      age_seconds:age,
      action:upper(row.signal?.action||"NO_TRADE")||"NO_TRADE",
      reason:String(row.signal?.reason||"UNKNOWN"),
      imbalance:finite(row.signal?.imbalance),
      spread:finite(row.signal?.spread_ratio),
      row
    });
  }

  function comparison(strategy,tradus){
    if(!tradus.available)return Object.freeze({state:"EN ATTENTE",plain:"TRADUS n’a pas encore de lecture exploitable."});
    if(!tradus.fresh)return Object.freeze({state:"À RAFRAÎCHIR",plain:"La lecture TRADUS est trop ancienne pour être comparée à Strategy A."});
    const raw=globalThis.AgentCryptoTradusStrategyFailClosed?.compare?.(strategy,tradus.row?.signal)
      || globalThis.AgentCryptoTradusStrategyReconcile?.compare?.(strategy,tradus.row?.signal)
      || {state:"NON COMPARABLE",text:"Comparaison indisponible"};
    const state=upper(raw.state||"NON COMPARABLE");
    let plain=String(raw.text||"");
    if(state.includes("CONVERGENCE")||state.includes("ACCORD")){
      plain=tradus.action==="NO_TRADE"
        ? "Les deux lectures recommandent d’attendre. Aucun signal d’action n’est confirmé."
        : `Strategy A et TRADUS vont dans le même sens en simulation (${tradus.action}). Cela reste une observation PAPER, pas un ordre.`;
    }else if(state.includes("DIVERGENCE")||state.includes("OPPOSITION")){
      plain=`TRADUS voit ${tradus.action}, mais Strategy A ne confirme pas cette direction. On garde la divergence visible et on n’agit pas.`;
    }else if(state.includes("NON COMPARABLE")){
      plain="Les deux lectures ne sont pas dans un état comparable pour l’instant. Aucun accord ne doit être inventé.";
    }else if(state.includes("RAFRA")){
      plain="La lecture TRADUS doit être rafraîchie avant toute comparaison.";
    }else if(!plain){
      plain="Comparaison disponible, sans conclusion directionnelle supplémentaire.";
    }
    return Object.freeze({state,plain,raw_text:String(raw.text||"")});
  }

  function firstBlocker(){
    const text=String(document.body?.innerText||"").replace(/\u00a0/g," ");
    return text.match(/1er verrou\s*:\s*([^\n]+)/i)?.[1]?.trim()||text.match(/Dernier verrou\s*([^\n]+)/i)?.[1]?.trim()||null;
  }

  function readMemory(){
    const summary=safe(globalThis.AgentCryptoTradusShadowLedger?.summary,{observations:0,buy:0,sell:0,no_trade:0,convergence:0,divergence:0,opposition:0})||{};
    const paper=safe(globalThis.AgentCryptoTradusPaperObservability?.stats,{trades:0,wins:0,losses:0,flats:0,net:0,fees:0,max_drawdown:0})||{};
    return Object.freeze({
      observations:finite(summary.observations)||0,
      buy:finite(summary.buy)||0,
      sell:finite(summary.sell)||0,
      wait:finite(summary.no_trade)||0,
      convergence:finite(summary.convergence)||0,
      divergence:(finite(summary.divergence)||0)+(finite(summary.opposition)||0),
      paper_trades:finite(paper.trades)||0,
      paper_wins:finite(paper.wins)||0,
      paper_losses:finite(paper.losses)||0,
      paper_net:finite(paper.net)||0,
      paper_fees:finite(paper.fees)||0,
      paper_drawdown:finite(paper.max_drawdown)||0
    });
  }

  function model(){
    const strategy=readStrategy();
    const tradus=readTradus();
    const compare=comparison(strategy,tradus);
    const memory=readMemory();
    const blocker=strategy.blocker||firstBlocker();
    let verdict="OBSERVER";
    if(!tradus.available)verdict="EN ATTENTE";
    else if(!tradus.fresh)verdict="RAFRAÎCHIR TRADUS";
    else if(compare.state.includes("CONVERGENCE")||compare.state.includes("ACCORD"))verdict="ACCORD DESCRIPTIF";
    else if(compare.state.includes("DIVERGENCE")||compare.state.includes("OPPOSITION"))verdict="DÉSACCORD VISIBLE";
    else if(compare.state.includes("NON COMPARABLE"))verdict="NON COMPARABLE";

    return Object.freeze({
      schema:"agent_crypto_strategy_tradus_comparative_intelligence_v1",
      owner:OWNER,
      build:runtimeBuild(),
      generated_at_utc:new Date().toISOString(),
      strategy,
      tradus:Object.freeze({...tradus,row:undefined}),
      comparison:compare,
      blocker,
      memory,
      verdict,
      contract:Object.freeze({read_only:true,paper_shadow_only:true,financial_signal:false,automatic_order:false,real_order:false,strategy_mutation:false,tradus_mutation:false,fetch:false,recurring_timer:false,observer:false,storage_write:false,wallet:false})
    });
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement("style");
    style.id=STYLE_ID;
    style.textContent=`
      #${ROOT_ID}{margin:10px 0;padding:14px;border:1px solid rgba(118,234,218,.34);border-radius:14px;background:linear-gradient(135deg,rgba(4,26,36,.94),rgba(14,17,37,.94));box-shadow:inset 0 0 0 1px rgba(255,255,255,.025),0 12px 28px rgba(0,0,0,.16)}
      #${ROOT_ID} .sti-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
      #${ROOT_ID} .sti-kicker{font-size:8px;font-weight:950;letter-spacing:.15em;color:#78f0da;text-transform:uppercase}
      #${ROOT_ID} .sti-title{margin:3px 0 0;font-size:15px;font-weight:950;color:#fff0b2}
      #${ROOT_ID} .sti-sub{margin-top:4px;font-size:8.5px;line-height:1.45;color:#adc3cf}
      #${ROOT_ID} .sti-verdict{padding:8px 11px;border-radius:999px;border:1px solid rgba(255,220,120,.4);background:rgba(255,220,120,.08);color:#ffe69f;font-size:9px;font-weight:950;white-space:nowrap}
      #${ROOT_ID} .sti-main{display:grid;grid-template-columns:1fr 1fr 1.25fr;gap:8px;margin-top:11px}
      #${ROOT_ID} .sti-card{padding:10px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:rgba(2,13,21,.52);min-width:0}
      #${ROOT_ID} .sti-card span{display:block;font-size:7px;font-weight:950;letter-spacing:.1em;text-transform:uppercase;opacity:.62}
      #${ROOT_ID} .sti-card b{display:block;margin-top:4px;font-size:12px;line-height:1.35;overflow-wrap:anywhere}
      #${ROOT_ID} .sti-card small{display:block;margin-top:5px;font-size:8px;line-height:1.45;color:#9fb7c4}
      #${ROOT_ID} .sti-plain{margin-top:9px;padding:10px 11px;border-left:3px solid #70e9d3;background:rgba(65,215,188,.055);font-size:9.5px;line-height:1.55}
      #${ROOT_ID} .sti-memory{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:9px}
      #${ROOT_ID} .sti-memory>div{padding:8px;border:1px solid rgba(255,255,255,.065);border-radius:9px;background:rgba(1,10,17,.42)}
      #${ROOT_ID} .sti-memory span{display:block;font-size:7px;text-transform:uppercase;letter-spacing:.08em;opacity:.58;font-weight:900}
      #${ROOT_ID} .sti-memory b{display:block;margin-top:3px;font-size:10px}
      #${ROOT_ID} .sti-foot{margin-top:8px;font-size:7.8px;line-height:1.45;color:#8fa9b7}
      #${ROOT_ID}[data-verdict="DÉSACCORD VISIBLE"] .sti-verdict{border-color:rgba(255,121,143,.45);color:#ff9aac;background:rgba(255,80,110,.07)}
      #${ROOT_ID}[data-verdict="ACCORD DESCRIPTIF"] .sti-verdict{border-color:rgba(100,238,188,.45);color:#8df0c8;background:rgba(70,220,170,.07)}
      @media(max-width:1100px){#${ROOT_ID} .sti-main{grid-template-columns:1fr}#${ROOT_ID} .sti-memory{grid-template-columns:repeat(2,minmax(0,1fr))}}
    `;
    document.head.appendChild(style);
  }

  function ensureRoot(){
    let root=document.getElementById(ROOT_ID);
    if(root)return root;
    const anchor=document.getElementById("tradusShadow406066");
    if(!anchor)return null;
    ensureStyle();
    root=document.createElement("section");
    root.id=ROOT_ID;
    root.dataset.owner=OWNER;
    root.setAttribute("aria-label","Comparateur Strategy A et TRADUS");
    root.innerHTML=`
      <div class="sti-head"><div><div class="sti-kicker">COMPARATEUR STRATÉGIE A ↔ TRADUS</div><h3 class="sti-title">Est-ce que les deux lectures sont d’accord ?</h3><div class="sti-sub">Lecture simple de deux moteurs déjà existants. Aucun ordre, aucun recalibrage.</div></div><div class="sti-verdict" data-sti="verdict">EN ATTENTE</div></div>
      <div class="sti-main">
        <div class="sti-card"><span>Strategy A</span><b data-sti="strategy">—</b><small data-sti="strategy-detail">—</small></div>
        <div class="sti-card"><span>TRADUS</span><b data-sti="tradus">—</b><small data-sti="tradus-detail">—</small></div>
        <div class="sti-card"><span>Comparaison maintenant</span><b data-sti="comparison">—</b><small data-sti="comparison-detail">—</small></div>
      </div>
      <div class="sti-plain"><strong>En français : </strong><span data-sti="plain">En attente des deux lectures.</span></div>
      <div class="sti-memory">
        <div><span>Mémoire comparative</span><b data-sti="observations">0 observation</b></div>
        <div><span>Accords / désaccords</span><b data-sti="memory-compare">0 / 0</b></div>
        <div><span>TRADUS Paper</span><b data-sti="paper-trades">0 trade</b></div>
        <div><span>Résultat archive</span><b data-sti="paper-net">0,00 €</b></div>
      </div>
      <div class="sti-foot" data-sti="foot">PAPER / SHADOW ONLY · aucune exécution réelle.</div>`;
    anchor.insertAdjacentElement("afterend",root);
    return root;
  }

  function set(root,key,value){const n=root?.querySelector?.(`[data-sti="${key}"]`);if(n)n.textContent=String(value??"—");}

  function render(){
    const root=ensureRoot();
    if(!root)return null;
    const m=model();lastModel=m;
    root.dataset.verdict=m.verdict;
    root.dataset.strategyATruthSource=m.strategy.source||"unknown";
    set(root,"verdict",m.verdict);
    set(root,"strategy",`${m.strategy.decision}${m.strategy.state?` · ${m.strategy.state}`:""}`);
    set(root,"strategy-detail",`${Number.isFinite(m.strategy.direction_score)?`direction ${m.strategy.direction_score}/100`:"direction non lue"}${m.blocker?` · verrou ${m.blocker}`:""}`);
    set(root,"tradus",m.tradus.action);
    set(root,"tradus-detail",`${m.tradus.fresh?"FRAIS":m.tradus.available?"À RAFRAÎCHIR":"INDISPONIBLE"}${Number.isFinite(m.tradus.imbalance)?` · imbalance ${pct(m.tradus.imbalance)}`:""}${Number.isFinite(m.tradus.spread)?` · spread ${pct(m.tradus.spread)}`:""}`);
    set(root,"comparison",m.comparison.state);
    set(root,"comparison-detail",m.comparison.raw_text||"comparaison fail-closed");
    set(root,"plain",m.comparison.plain);
    set(root,"observations",`${m.memory.observations} observation${m.memory.observations===1?"":"s"}`);
    set(root,"memory-compare",`${m.memory.convergence} accord(s) / ${m.memory.divergence} désaccord(s)`);
    set(root,"paper-trades",`${m.memory.paper_trades} trade${m.memory.paper_trades===1?"":"s"} · ${m.memory.paper_wins}G/${m.memory.paper_losses}P`);
    set(root,"paper-net",money(m.memory.paper_net));
    set(root,"foot",`Archive TRADUS indépendante : net ${money(m.memory.paper_net)} · frais ${money(m.memory.paper_fees)} · drawdown ${money(m.memory.paper_drawdown)}. Ce résultat ne prouve pas la performance de Strategy A. PAPER / SHADOW ONLY · aucun ordre réel.`);
    try{document.dispatchEvent(new CustomEvent("agentcrypto:strategy-tradus-comparative-intelligence",{detail:m}));}catch(_){}
    return m;
  }

  function schedule(){queueMicrotask(()=>{try{requestAnimationFrame(()=>render());}catch(_){render();}});}
  ["agentcrypto:tradus-shadow-observation","agentcrypto:strategy-a-auto-cycle","agentcrypto:tradus-paper-snapshot"].forEach(name=>document.addEventListener(name,schedule,{passive:true}));
  window.addEventListener("erith:system-hydrated",schedule,{passive:true});
  window.addEventListener("pageshow",schedule,{passive:true});
  document.addEventListener("click",event=>{const label=upper(event.target instanceof Element?event.target.closest("button")?.innerText:"");if(/TRADUS|AUTO A|STOP AUTO|RAFRAÎCHIR MARCHÉ|RELANCER/.test(label))schedule();},true);
  if(document.readyState==="loading")window.addEventListener("load",schedule,{once:true,passive:true});else schedule();

  function selfTest(){
    const compareOwner=globalThis.AgentCryptoTradusStrategyFailClosed;
    const fake=(decision,action)=>compareOwner?.compare?.({decision},{action})||{state:"NON COMPARABLE"};
    const currentReader=compareOwner?.readStrategyA;
    const checks=[
      upper(fake("NO TRADE","NO_TRADE").state).includes("CONVERGENCE"),
      upper(fake("NO TRADE","SELL").state).includes("DIVERGENCE"),
      upper(fake("OFF","SELL").state).includes("NON COMPARABLE"),
      typeof currentReader==="function",
      model().contract.financial_signal===false,
      model().contract.real_order===false
    ];
    return Object.freeze({pass:checks.every(Boolean),total:checks.length,passed:checks.filter(Boolean).length,checks:Object.freeze(checks)});
  }

  globalThis.AgentCryptoStrategyTradusComparativeIntelligence=Object.freeze({owner:OWNER,build:runtimeBuild(),render,model,read:()=>lastModel,selfTest,read_only:true,paper_shadow_only:true,financial_signal:false,automatic_order:false,real_order:false,fetch:false,recurring_timer:false,observer:false,storage_write:false,strategy_mutation:false,wallet:false});
})();
