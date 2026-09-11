/*
  Agent-Crypto Administrator — TRADUS Shadow Adapter
  Build: 40.6.66
  Parent: 40.6.65
  Responsibility: make the existing TRADUS shadow lane reliably visible after late Simulation hydration,
  and make Strategy A ↔ TRADUS comparison state-safe.
  Data: public Binance BTCEUR order book, read-only. No API key, wallet or order endpoint.
  No recurring polling timer. One initial read after successful mount + explicit/host-refresh reads only.
*/
(() => {
  "use strict";

  const BUILD = "40.6.66";
  const OBS_EVENT = "agentcrypto:tradus-shadow-observation";
  const SYMBOL = "BTCEUR";
  const THRESHOLD = 0.25;
  const MAX_SPREAD_RATIO = 0.002;
  const MAX_AGE_SECONDS = 10;
  const PANEL_ID = "tradusShadow406066";
  const STYLE_ID = "tradusShadowStyle406066";
  const ENDPOINTS = [
    `https://api.binance.com/api/v3/depth?symbol=${SYMBOL}&limit=5`,
    `https://data-api.binance.vision/api/v3/depth?symbol=${SYMBOL}&limit=5`
  ];

  let last = null;
  let busy = false;
  let mounted = false;
  let hostRefreshBound = false;

  const num = v => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const clone = v => { try { return JSON.parse(JSON.stringify(v)); } catch (_) { return null; } };
  const pct = v => Number.isFinite(v) ? `${(v * 100).toFixed(1)} %` : "N/D";

  function validateTick(tick, now = Date.now() / 1000) {
    if (!tick || !String(tick.symbol || "").trim()) return [false, "EMPTY_SYMBOL"];
    if (!(tick.bid > 0) || !(tick.ask > 0) || !(tick.last_price > 0)) return [false, "NON_POSITIVE_PRICE"];
    if (tick.bid > tick.ask) return [false, "CROSSED_BOOK"];
    if (tick.bid_volume < 0 || tick.ask_volume < 0 || tick.last_volume < 0) return [false, "NEGATIVE_VOLUME"];
    if (now < tick.timestamp) return [false, "FUTURE_DATA"];
    if (now - tick.timestamp > MAX_AGE_SECONDS) return [false, "STALE_DATA"];
    return [true, "OK"];
  }

  function evaluateTick(tick, now = Date.now() / 1000) {
    const [valid, reason] = validateTick(tick, now);
    if (!valid) return { action:"NO_TRADE", score:0, reason, risk_approved:false };

    const mid = (tick.bid + tick.ask) / 2;
    const spreadRatio = (tick.ask - tick.bid) / mid;
    const total = tick.bid_volume + tick.ask_volume;
    const imbalance = total > 0 ? (tick.bid_volume - tick.ask_volume) / total : 0;

    if (spreadRatio > MAX_SPREAD_RATIO) {
      return { action:"NO_TRADE", score:0, reason:"SPREAD_TOO_WIDE", risk_approved:false, mid, spread_ratio:spreadRatio, imbalance };
    }
    if (imbalance >= THRESHOLD) {
      return { action:"BUY", score:imbalance, reason:"POSITIVE_IMBALANCE", risk_approved:true, mid, spread_ratio:spreadRatio, imbalance };
    }
    if (imbalance <= -THRESHOLD) {
      return { action:"SELL", score:imbalance, reason:"NEGATIVE_IMBALANCE", risk_approved:true, mid, spread_ratio:spreadRatio, imbalance };
    }
    return { action:"NO_TRADE", score:imbalance, reason:"INSUFFICIENT_EDGE", risk_approved:false, mid, spread_ratio:spreadRatio, imbalance };
  }

  function tickFromDepth(payload) {
    const bid = num(payload?.bids?.[0]?.[0]);
    const bidVolume = num(payload?.bids?.[0]?.[1]);
    const ask = num(payload?.asks?.[0]?.[0]);
    const askVolume = num(payload?.asks?.[0]?.[1]);
    if (![bid,bidVolume,ask,askVolume].every(Number.isFinite)) throw new Error("BOOK_INVALID");
    const ts = Date.now() / 1000;
    return {
      symbol: SYMBOL,
      timestamp: ts,
      bid,
      ask,
      bid_volume: bidVolume,
      ask_volume: askVolume,
      last_price: (bid + ask) / 2,
      last_volume: 0
    };
  }

  async function fetchDepth() {
    let lastError = null;
    for (const endpoint of ENDPOINTS) {
      const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
      const to = setTimeout(() => ctl?.abort(), 4500);
      try {
        const response = await fetch(endpoint, { cache:"no-store", signal:ctl?.signal });
        if (!response.ok) throw new Error(`HTTP_${response.status}`);
        const payload = await response.json();
        clearTimeout(to);
        return { tick:tickFromDepth(payload), endpoint };
      } catch (error) {
        clearTimeout(to);
        lastError = error;
      }
    }
    throw lastError || new Error("BOOK_UNAVAILABLE");
  }

  function findStrategyAScope() {
    const replay = document.getElementById("strategyAReplaySandbox404290");
    let node = replay;
    for (let i=0; node && i<7; i++, node=node.parentElement) {
      const text = String(node.innerText || "");
      if (text.includes("STRATÉGIE A") && text.includes("TRACE DÉCISION V2") && text.includes("EXPERIMENT LEDGER")) return node;
    }
    return replay?.parentElement || null;
  }

  function readStrategyA() {
    const text = String(findStrategyAScope()?.innerText || "").replace(/\u00a0/g," ");
    const phase = text.match(/PHASE\s+(NO TRADE|OFF|PAPER|STOP|WAIT)/i)?.[1]?.toUpperCase() || null;
    const decision = phase || text.match(/D[ÉE]CISION\s*(NO TRADE|OFF|PAPER[^\n]*|STOP|WAIT)/i)?.[1]?.trim()?.toUpperCase() || "INCONNU";
    const direction = text.match(/DIRECTION\s*(?:WAIT|PASS)?\s*(-?\d+)\/100/i)?.[1] || null;
    return { decision, phase, direction_score: direction === null ? null : Number(direction) };
  }

  function classifyStrategyA(a) {
    const state = String(a?.decision || a?.phase || "INCONNU").toUpperCase();
    if (/STOP|REJECT|REFUS|BLOCK/.test(state)) return "STOP";
    if (/PAPER|SIMUL/.test(state)) return "PAPER";
    if (/^OFF$|ARR[ÊE]T[ÉE]?|INACTIF/.test(state)) return "OFF";
    if (/NO TRADE|WAIT|INCONNU/.test(state)) return "WAIT";
    return "ACTIVE";
  }

  function compare(a, b) {
    const aState = classifyStrategyA(a);
    const bAction = String(b?.action || "NO_TRADE").toUpperCase();
    const bDirectional = bAction === "BUY" || bAction === "SELL";

    if (aState === "OFF") {
      return { state:"NON COMPARABLE", text:`A OFF · TRADUS ${bAction === "NO_TRADE" ? "attend" : bAction}` };
    }
    if (aState === "STOP" && bDirectional) {
      return { state:"OPPOSITION SÉCURITÉ", text:`A STOP · TRADUS ${bAction}` };
    }
    if (aState === "STOP" && !bDirectional) {
      return { state:"ACCORD PRUDENT", text:"A STOP · TRADUS attend" };
    }
    if (aState === "WAIT" && !bDirectional) {
      return { state:"CONVERGENCE", text:"A attend · TRADUS attend" };
    }
    if (aState === "WAIT" && bDirectional) {
      return { state:"DIVERGENCE", text:`A attend · TRADUS ${bAction}` };
    }
    if ((aState === "PAPER" || aState === "ACTIVE") && bAction === "BUY") {
      return { state:"CONVERGENCE POTENTIELLE", text:`A ${aState === "PAPER" ? "PAPER" : "actif"} · TRADUS BUY` };
    }
    if ((aState === "PAPER" || aState === "ACTIVE") && bAction === "SELL") {
      return { state:"OPPOSITION", text:`A ${aState === "PAPER" ? "PAPER" : "actif"} · TRADUS SELL` };
    }
    return { state:"COMPARAISON", text:`A ${a?.decision || "?"} · TRADUS ${bAction || "?"}` };
  }

  function reasonFr(reason) {
    return ({
      POSITIVE_IMBALANCE:"déséquilibre acheteur",
      NEGATIVE_IMBALANCE:"déséquilibre vendeur",
      INSUFFICIENT_EDGE:"déséquilibre insuffisant",
      SPREAD_TOO_WIDE:"spread trop large",
      STALE_DATA:"données périmées",
      FUTURE_DATA:"horodatage futur",
      BOOK_UNAVAILABLE:"carnet indisponible"
    })[reason] || String(reason || "—");
  }

  function emitObservation(row) {
    if (!row) return;
    try { globalThis.AgentCryptoTradusShadowLedger406066?.capture?.(clone(row), "adapter_direct"); } catch (_) {}
    try {
      document.dispatchEvent(new CustomEvent(OBS_EVENT, { detail: clone(row) }));
    } catch (_) {}
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style=document.createElement("style");
    style.id=STYLE_ID;
    style.textContent=`
      #${PANEL_ID}{margin-top:10px;padding:12px;border:1px solid rgba(93,226,190,.32);border-radius:12px;background:rgba(4,25,29,.62);box-shadow:inset 0 0 0 1px rgba(255,255,255,.025)}
      #${PANEL_ID} .ts-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}
      #${PANEL_ID} .ts-kicker{font-size:8px;font-weight:950;letter-spacing:.12em;color:#72f2cf;text-transform:uppercase}
      #${PANEL_ID} .ts-title{margin-top:2px;font-size:13px;font-weight:950;letter-spacing:.04em}
      #${PANEL_ID} .ts-sub{margin-top:3px;font-size:8px;line-height:1.45;opacity:.76}
      #${PANEL_ID} .ts-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px;margin-top:10px}
      #${PANEL_ID} .ts-card{padding:8px;border:1px solid rgba(255,255,255,.08);border-radius:9px;background:rgba(2,13,20,.5);min-width:0}
      #${PANEL_ID} .ts-card span{display:block;font-size:7px;letter-spacing:.07em;text-transform:uppercase;opacity:.62;font-weight:900}
      #${PANEL_ID} .ts-card b{display:block;margin-top:4px;font-size:10px;overflow-wrap:anywhere}
      #${PANEL_ID} .ts-status{margin-top:8px;padding:8px 9px;border:1px solid rgba(255,255,255,.07);border-radius:9px;font-size:9px;line-height:1.45}
      #${PANEL_ID} .ts-foot{margin-top:7px;font-size:7.5px;opacity:.66;line-height:1.4}
      #${PANEL_ID}[data-signal="BUY"] [data-ts="signal"]{color:#71efbd}
      #${PANEL_ID}[data-signal="SELL"] [data-ts="signal"]{color:#ff8d9a}
      #${PANEL_ID}[data-signal="NO_TRADE"] [data-ts="signal"]{color:#ffd97d}
      @media(max-width:1100px){#${PANEL_ID} .ts-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
    `;
    document.head.appendChild(style);
  }

  function render() {
    const p=document.getElementById(PANEL_ID); if(!p) return;
    const set=(k,v)=>{const n=p.querySelector(`[data-ts="${k}"]`); if(n)n.textContent=v;};
    const row=last;
    if(!row){
      p.dataset.signal="WAIT";
      set("book","LECTURE…"); set("signal","EN ATTENTE"); set("imbalance","—"); set("spread","—");
      const a=readStrategyA(); set("strategyA",a.decision); set("compare","EN ATTENTE"); set("status","Lecture du carnet Binance BTCEUR…"); return;
    }
    p.dataset.signal=row.signal.action;
    set("book",row.ok ? "LIVE" : "INDISPONIBLE");
    set("signal",row.signal.action);
    set("imbalance",pct(row.signal.imbalance));
    set("spread",Number.isFinite(row.signal.spread_ratio)?`${(row.signal.spread_ratio*100).toFixed(3)} %`:"N/D");
    set("strategyA",row.strategy_a.decision);
    set("compare",row.comparison.state);
    set("status",row.ok
      ? `${row.comparison.text} · ${reasonFr(row.signal.reason)} · bid ${row.tick.bid.toFixed(2)} / ask ${row.tick.ask.toFixed(2)} €`
      : `TRADUS en attente : ${reasonFr(row.signal.reason)}.`);
  }

  async function refresh(trigger="manual") {
    if (busy) return clone(last);
    busy=true;
    try {
      const {tick,endpoint}=await fetchDepth();
      const signal=evaluateTick(tick);
      const strategyA=readStrategyA();
      last={schema:"agent_crypto_tradus_shadow_v1",build:BUILD,at:new Date().toISOString(),trigger,ok:true,source:"BINANCE_PUBLIC_DEPTH",endpoint,tick,signal,strategy_a:strategyA,comparison:compare(strategyA,signal),paper_only:true,shadow_only:true,order_submitted:false,real_orders:false,credentials:false,wallet:false};
    } catch(error) {
      const strategyA=readStrategyA();
      const signal={action:"NO_TRADE",score:0,reason:"BOOK_UNAVAILABLE",risk_approved:false};
      last={schema:"agent_crypto_tradus_shadow_v1",build:BUILD,at:new Date().toISOString(),trigger,ok:false,error:String(error?.message||error),signal,strategy_a:strategyA,comparison:compare(strategyA,signal),paper_only:true,shadow_only:true,order_submitted:false,real_orders:false,credentials:false,wallet:false};
    } finally {
      busy=false;
      emitObservation(last);
      render();
    }
    return clone(last);
  }

  function bindHostRefresh() {
    if (hostRefreshBound) return;
    hostRefreshBound = true;
    document.addEventListener("click",event=>{
      const label=String(event.target?.closest?.("button")?.innerText||"").trim().toUpperCase();
      if(label==="RAFRAÎCHIR MARCHÉ" || label==="RELANCER MAINTENANT") queueMicrotask(()=>refresh("host_market_refresh"));
    },true);
  }

  function mount() {
    if (typeof document==="undefined") return false;
    const existing=document.getElementById(PANEL_ID);
    if(existing){ mounted=true; bindHostRefresh(); render(); return true; }

    const anchor=document.getElementById("strategyAPaperAfterCostProof406063") || document.getElementById("strategyAReplaySandbox404290");
    if(!anchor) return false;

    ensureStyle();
    const p=document.createElement("section");
    p.id=PANEL_ID;
    p.dataset.tradusBuild=BUILD;
    p.innerHTML=`
      <div class="ts-head">
        <div><div class="ts-kicker">TRADUS / YOHAN · SHADOW INDÉPENDANT</div><div class="ts-title">Microstructure Binance · comparaison Strategy A</div><div class="ts-sub">Carnet BTCEUR top-of-book · seuil imbalance ±25 % · spread max 0.20 % · séparé du workspace historique « STRATÉGIE B ».</div></div>
        <button type="button" class="btn small" id="tradusShadowRefresh406066">RAFRAÎCHIR TRADUS</button>
      </div>
      <div class="ts-grid">
        <div class="ts-card"><span>Book</span><b data-ts="book">LECTURE…</b></div>
        <div class="ts-card"><span>TRADUS</span><b data-ts="signal">EN ATTENTE</b></div>
        <div class="ts-card"><span>Imbalance</span><b data-ts="imbalance">—</b></div>
        <div class="ts-card"><span>Spread</span><b data-ts="spread">—</b></div>
        <div class="ts-card"><span>Strategy A</span><b data-ts="strategyA">—</b></div>
        <div class="ts-card"><span>Comparaison</span><b data-ts="compare">EN ATTENTE</b></div>
      </div>
      <div class="ts-status" data-ts="status">Lecture du carnet Binance BTCEUR…</div>
      <div class="ts-foot">SHADOW ONLY · aucun ordre · aucune clé · aucun wallet · aucune mutation Strategy A · aucun timer récurrent. Signal comparatif uniquement.</div>`;
    anchor.insertAdjacentElement("afterend",p);
    p.querySelector("#tradusShadowRefresh406066")?.addEventListener("click",()=>refresh("tradus_button"));
    mounted=true;
    bindHostRefresh();
    render();
    queueMicrotask(()=>refresh("mount"));
    return true;
  }

  function selfTest() {
    const now=1000;
    const make=(bid,ask,bv,av,ts=now)=>({symbol:"X",timestamp:ts,bid,ask,bid_volume:bv,ask_volume:av,last_price:(bid+ask)/2,last_volume:0});
    const buy=evaluateTick(make(99.95,100.05,100,10),now);
    const sell=evaluateTick(make(99.95,100.05,10,100),now);
    const balanced=evaluateTick(make(99.95,100.05,50,50),now);
    const wide=evaluateTick(make(99,100,100,10),now);
    const stale=evaluateTick(make(99.95,100.05,100,10,now-20),now);
    const offBuy=compare({decision:"OFF"},buy);
    const stopBuy=compare({decision:"STOP"},buy);
    const waitBuy=compare({decision:"NO TRADE"},buy);
    const paperBuy=compare({decision:"PAPER"},buy);
    const pass=buy.action==="BUY"&&sell.action==="SELL"&&balanced.action==="NO_TRADE"&&balanced.reason==="INSUFFICIENT_EDGE"&&wide.reason==="SPREAD_TOO_WIDE"&&stale.reason==="STALE_DATA"&&offBuy.state==="NON COMPARABLE"&&stopBuy.state==="OPPOSITION SÉCURITÉ"&&waitBuy.state==="DIVERGENCE"&&paperBuy.state==="CONVERGENCE POTENTIELLE";
    return {build:BUILD,pass,checks:{buy:buy.action,sell:sell.action,balanced:balanced.reason,wide:wide.reason,stale:stale.reason,off_buy:offBuy.state,stop_buy:stopBuy.state,wait_buy:waitBuy.state,paper_buy:paperBuy.state},threshold:THRESHOLD,max_spread_ratio:MAX_SPREAD_RATIO};
  }

  const api=Object.freeze({build:BUILD,symbol:SYMBOL,threshold:THRESHOLD,max_spread_ratio:MAX_SPREAD_RATIO,observation_event:OBS_EVENT,validate_tick:validateTick,evaluate_tick:evaluateTick,read:()=>clone(last),refresh,mount,self_test:selfTest,paper_only:true,shadow_only:true,real_orders:false,credentials:false,wallet:false,recurring_timer:false});
  globalThis.AgentCryptoTradusShadow406066=api;

  if(typeof document!=="undefined"){
    let bootMounted=false;
    const cleanupBoot=()=>{
      document.removeEventListener("click",scheduleMount,true);
      document.removeEventListener("focusin",scheduleMount,true);
      document.removeEventListener("visibilitychange",scheduleMount,true);
      window.removeEventListener("pageshow",scheduleMount);
    };
    const attemptMount=()=>{
      if(bootMounted) return true;
      bootMounted=mount()===true;
      if(bootMounted) cleanupBoot();
      return bootMounted;
    };
    function scheduleMount(){
      if(bootMounted) return;
      try { requestAnimationFrame(()=>requestAnimationFrame(attemptMount)); }
      catch (_) { queueMicrotask(attemptMount); }
    }

    document.addEventListener("click",scheduleMount,true);
    document.addEventListener("focusin",scheduleMount,true);
    document.addEventListener("visibilitychange",scheduleMount,true);
    window.addEventListener("pageshow",scheduleMount);

    const boot=()=>{ attemptMount(); scheduleMount(); };
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot,{once:true}); else boot();
    window.addEventListener("load",boot,{once:true});
  }
})();
