(() => {
  "use strict";
  const BUILD="40.6.597";
  const MODE_KEY="agent_crypto_erith_ia_market_card_mode_v1";
  const MIN_MARKET_WIDTH=980;
  const PANEL_MIN_WIDTH=320;
  const $=id=>document.getElementById(id);
  const finite=v=>{if(v===null||v===undefined||v==="")return null;const n=Number(v);return Number.isFinite(n)?n:null;};
  const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const pct=v=>{const n=finite(v);return n===null?"—":(n>0?"+":"")+n.toFixed(2)+" %";};
  const cls=v=>{const n=finite(v);return n===null?"neutral":n>0?"pos":n<0?"neg":"neutral";};
  const displayCurrency=()=>String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||"USD").toUpperCase()==="EUR"?"EUR":"USD";
  const allCoins=()=>{
    const api=globalThis.AgentCryptoTraderMarket;
    const snap=api?.snapshot?.();
    const rows=[];
    document.querySelectorAll("#marketRows tr[data-market-id]").forEach(row=>{
      const id=row.dataset.marketId;
      const current=api?.selected?.();
      if(current?.id===id)rows.push(current);
    });
    return rows;
  };
  const resolveCoin=id=>{
    const selected=globalThis.AgentCryptoTraderMarket?.selected?.()||globalThis.getSelectedCoin?.()||null;
    if(selected?.id===id)return selected;
    // Market-transpose only exposes the selected object publicly; select-on-click remains canonical.
    // For hover of another row use its visible facts from DOM, never fabricate hidden values.
    const row=document.querySelector('#marketRows tr[data-market-help-id="'+CSS.escape(String(id||""))+'"]');
    if(!row)return null;
    const cells=row.children;
    const identity=row.querySelector(".trader-market-identity");
    return {
      id,
      rank:cells?.[0]?.textContent?.trim()||"—",
      name:identity?.querySelector("b")?.textContent?.trim()||id,
      symbol:identity?.querySelector("small")?.textContent?.trim()||"",
      image:identity?.querySelector("img")?.getAttribute("src")||"",
      renderedPrice:cells?.[2]?.querySelector("b")?.textContent?.trim()||"—",
      rendered24:cells?.[3]?.textContent?.trim()||"—",
      rendered7:cells?.[4]?.textContent?.trim()||"—",
      partial:true
    };
  };
  const priceOf=c=>{
    if(c?.partial)return c.renderedPrice||"—";
    const cur=c?.radarSource?"USD":displayCurrency();
    const n=finite(cur==="USD"?c?.priceUsd:(c?.priceEur??c?.price));
    if(n===null)return "—";
    try{return new Intl.NumberFormat("fr-FR",{style:"currency",currency:cur,maximumFractionDigits:Math.abs(n)<1?6:2}).format(n);}
    catch(_){return String(n);}
  };
  const compact=(v,currency=displayCurrency())=>{
    const n=finite(v);if(n===null)return "—";
    try{return new Intl.NumberFormat("fr-FR",{style:"currency",currency,notation:"compact",maximumFractionDigits:2}).format(n);}
    catch(_){return String(n);}
  };
  const preferredMode=()=>{try{return localStorage.getItem(MODE_KEY)==="dock"?"dock":"floating";}catch(_){return"floating";}};
  const dockAvailability=()=>{
    const grid=$("marketWorkspaceGrid");
    if(!grid)return{available:false,reason:"Zone Marché indisponible"};
    if(grid.classList.contains("math-dock-side"))return{available:false,reason:"Passe le Math Core sur Réduit ou Dessus pour libérer la colonne latérale."};
    const rect=grid.getBoundingClientRect(),style=getComputedStyle(grid),gap=Math.max(0,parseFloat(style.columnGap)||0);
    const math=$("math"),rail=grid.classList.contains("math-dock-rail")?Math.max(0,math?.getBoundingClientRect?.().width||0):0;
    const cols=grid.classList.contains("math-dock-rail")?3:2;
    const required=MIN_MARKET_WIDTH+PANEL_MIN_WIDTH+rail+gap*Math.max(1,cols-1);
    return{available:rect.width>=required,gridWidth:rect.width,requiredWidth:required,reason:rect.width>=required?"Ancrer la fiche à droite sans recouvrir le tableau":"La fiche reste flottante tant que la zone Marché n’a pas assez de place pour conserver le tableau lisible."};
  };
  const effectiveMode=()=>preferredMode()==="dock"&&dockAvailability().available?"dock":"floating";
  let enabled=true,activeTarget=null,activeCoin=null,hideTimer=0;

  function toolbar(){
    const mode=effectiveMode(),d=dockAvailability();
    return '<div class="atlas-help-market-toolbar"><div class="atlas-help-kicker">FICHE CRYPTO · MARKET SNAPSHOT</div><div class="atlas-help-market-mode" role="group" aria-label="Position de la fiche Crypto">'+
      '<button type="button" data-market-card-mode="floating" class="'+(mode==="floating"?"is-active":"")+'" aria-pressed="'+(mode==="floating")+'">Flottante</button>'+
      '<button type="button" data-market-card-mode="dock" class="'+(mode==="dock"?"is-active":"")+'" aria-pressed="'+(mode==="dock")+'" '+(d.available?"":"disabled")+' title="'+esc(d.reason)+'">Latérale</button></div></div>';
  }
  function markup(c){
    const selected=globalThis.AgentCryptoTraderMarket?.selected?.()||null;
    const isSelected=selected?.id===c?.id;
    const cur=c?.radarSource?'USD':displayCurrency(),quote=String(c?.radarQuote||'').toUpperCase(),unit=quote&&quote!=='USD'?quote:cur;
    const cap=finite(cur==="USD"?c?.marketCapUsd:c?.marketCap);
    const vol=finite(cur==="USD"?c?.volume24hUsd:c?.volume24h);
    const ratio=cap!==null&&cap>0&&vol!==null?vol/cap*100:null;
    const score=isSelected&&!c?.radarSource?finite(globalThis.AgentCryptoTraderMathCore?.score?.()?.score):null;
    const image=c?.image?'<img class="atlas-help-market-icon" src="'+esc(c.image)+'" alt="" loading="eager">':'<span class="atlas-help-market-fallback" aria-hidden="true">'+esc(String(c?.symbol||"?").slice(0,1))+'</span>';
    const ch24=c?.partial?c.rendered24:pct(c?.change24h),ch7=c?.partial?c.rendered7:pct(c?.change7d),ch30=c?.partial?"—":pct(c?.change30d??c?.change30D??c?.change30);
    return toolbar()+
      '<div class="atlas-help-market-head">'+image+'<span><strong>'+esc(c?.name||"Actif")+'</strong><b>'+esc(String(c?.symbol||"").toUpperCase())+'</b><small>Rang '+esc(c?.rank??"—")+' · Repère marché</small></span></div>'+
      '<div class="atlas-help-market-grid">'+
      '<span><small>Prix '+(quote&&quote!=='USD'?'coté ':'affichage ')+esc(unit)+'</small><strong>'+esc(priceOf(c))+'</strong></span>'+
      '<span><small>Source '+esc(unit)+'</small><strong>'+esc(c?.radarSource||(c?.partial?"Market visible":"CoinGecko public"))+'</strong></span>'+
      '<span><small>'+(c?.radarSource?'24 h source':'24 h direct')+'</small><strong class="'+(c?.partial?"neutral":cls(c?.change24h))+'">'+esc(ch24)+'</strong></span>'+
      '<span><small>7 j marché</small><strong class="'+(c?.partial?"neutral":cls(c?.change7d))+'">'+esc(ch7)+'</strong></span>'+
      '<span><small>30 j marché</small><strong class="'+(c?.partial?"neutral":cls(c?.change30d??c?.change30D??c?.change30))+'">'+esc(ch30)+'</strong></span>'+
      '<span><small>Vol./cap.</small><strong>'+(ratio===null?"—":ratio.toFixed(2)+" %")+'</strong></span>'+
      '<span><small>Capitalisation</small><strong>'+esc(compact(cap,cur))+'</strong></span>'+
      '<span><small>Volume 24 h</small><strong>'+esc(compact(vol,cur))+'</strong></span>'+
      '<span><small>Score Atlas</small><strong>'+(score===null?"—":Math.round(score))+'</strong></span>'+
      '<span><small>Décision</small><strong>'+(c?.radarSource?'Observer · aucun ordre':'Observer / comparer')+'</strong></span></div>'+
      '<div class="atlas-help-market-sources"><span><b>Cotation et 24 h observés</b><em>'+esc(c?.partial?"Lecture de la ligne Market visible":"Snapshot public CoinGecko")+'</em></span><span><b>Référence marché 24 h</b><em>'+esc(ch24)+'</em></span></div>'+
      (c?.radarObservation?'<div class="atlas-help-market-sources">'+
        '<span><b>Lecture Radar · descriptive</b><em>'+esc(c.radarObservation)+'</em></span>'+
        '<span><b>Justification</b><em>'+esc(c.radarReason||"Mesures insuffisantes")+'</em></span>'+
        '<span><b>Preuve et limites</b><em>'+esc(c.radarEvidence||"Aucune bougie vérifiée par la fiche")+'</em></span>'+
        '<span><b>Date source</b><em>'+esc(c.radarObservedAt||"Horodatage non fourni")+'</em></span>'+
        '</div>':'')+
      '<div class="atlas-help-market-action '+(isSelected?"is-remove":"is-add")+'">'+(c?.radarSource?"Clique la ligne pour afficher le graphique Solo existant":isSelected?"Actif central Trader · clique une autre ligne pour changer la PAIR":"Clique la ligne pour sélectionner cet actif comme PAIR centrale")+'</div>';
  }
  function host(){
    const grid=$("marketWorkspaceGrid");if(!grid)return null;
    let h=$("atlasMarketCardDockHost");
    if(!h){h=document.createElement("aside");h.id="atlasMarketCardDockHost";h.className="atlas-market-card-dock-host";h.setAttribute("aria-label","Fiche Crypto latérale");h.setAttribute("aria-live","polite");h.hidden=true;}
    const math=$("math");
    if(math?.parentElement===grid)grid.insertBefore(h,math);else if(h.parentElement!==grid)grid.appendChild(h);
    return h;
  }
  function hideDock(){
    const h=$("atlasMarketCardDockHost"),g=$("marketWorkspaceGrid");
    if(h){h.hidden=true;h.innerHTML="";delete h.dataset.marketHelpCoinId;}
    g?.classList.remove("market-card-dock-active");
  }
  function position(layer,target,pointer=null){
    layer.hidden=false;layer.style.visibility="hidden";
    const measured=layer.getBoundingClientRect(),margin=12,rect=target.getBoundingClientRect();
    let left=pointer&&Number.isFinite(pointer.clientX)?pointer.clientX+18:rect.right+margin;
    let top=pointer&&Number.isFinite(pointer.clientY)?pointer.clientY+18:rect.top;
    if(left+measured.width>innerWidth-margin)left=rect.left-measured.width-margin;
    left=Math.max(margin,Math.min(innerWidth-measured.width-margin,left));
    top=Math.max(margin,Math.min(innerHeight-measured.height-margin,top));
    layer.style.left=Math.round(left)+"px";layer.style.top=Math.round(top)+"px";layer.style.visibility="visible";
  }
  function show(target,pointer=null,providedCoin=null){
    if(!enabled||!target)return false;
    const c=providedCoin||resolveCoin(target.dataset.marketHelpId||target.dataset.marketId);if(!c)return false;
    clearTimeout(hideTimer);activeTarget=target;activeCoin=providedCoin;
    const layer=$("atlasHelpLayer");
    if(effectiveMode()==="dock"){
      if(layer){layer.hidden=true;layer.setAttribute("aria-hidden","true");delete layer.dataset.marketHelpCoinId;}
      const h=host(),g=$("marketWorkspaceGrid");if(!h||!g)return false;
      h.innerHTML=markup(c);h.dataset.marketHelpCoinId=c.id;h.hidden=false;g.classList.add("market-card-dock-active");
      return true;
    }
    hideDock();
    if(!layer)return false;
    layer.innerHTML=markup(c);layer.dataset.marketHelpCoinId=c.id;layer.setAttribute("aria-hidden","false");
    position(layer,target,pointer);return !layer.hidden;
  }
  function hide(immediate=false){
    const run=()=>{
      const layer=$("atlasHelpLayer");if(layer){layer.hidden=true;layer.setAttribute("aria-hidden","true");delete layer.dataset.marketHelpCoinId;}
      if(effectiveMode()!=="dock"){activeTarget=null;activeCoin=null;}
    };
    clearTimeout(hideTimer);if(immediate)run();else hideTimer=setTimeout(run,110);
  }
  function setMode(mode){
    try{localStorage.setItem(MODE_KEY,mode==="dock"?"dock":"floating");}catch(_){}
    const target=activeTarget||document.querySelector("#marketRows tr.is-selected[data-market-help-id]");
    const coin=activeCoin;hideDock();hide(true);if(target)show(target,null,coin);
  }
  function showAsset(target,coin,pointer=null){if(!coin?.id||!coin?.symbol)return false;return show(target,pointer,coin)===true;}
  function setEnabled(value){
    enabled=!!value;
    const btn=$("traderFicheToggle");if(btn){btn.classList.toggle("is-active",enabled);btn.setAttribute("aria-pressed",String(enabled));}
    if(!enabled){hideDock();hide(true);}
  }
  function bind(){
    const layer=$("atlasHelpLayer");
    layer?.addEventListener("pointerenter",()=>clearTimeout(hideTimer));
    layer?.addEventListener("pointerleave",()=>{if(effectiveMode()!=="dock")hide();});
    $("atlasMarketCardDockHost")?.addEventListener?.("pointerenter",()=>clearTimeout(hideTimer));
    document.addEventListener("pointerover",e=>{const row=e.target.closest?.("#marketRows tr[data-market-help-id]");if(row)show(row,e);});
    document.addEventListener("pointerout",e=>{const row=e.target.closest?.("#marketRows tr[data-market-help-id]");if(!row||row!==activeTarget||effectiveMode()==="dock")return;if(e.relatedTarget instanceof Node&&row.contains(e.relatedTarget))return;hide();});
    document.addEventListener("focusin",e=>{const row=e.target.closest?.("#marketRows tr[data-market-help-id]");if(row)show(row);});
    document.addEventListener("focusout",e=>{const row=e.target.closest?.("#marketRows tr[data-market-help-id]");if(row&&effectiveMode()!=="dock")hide();});
    document.addEventListener("click",e=>{
      const mode=e.target.closest?.("[data-market-card-mode]");if(mode&&!mode.disabled){e.preventDefault();e.stopPropagation();setMode(mode.dataset.marketCardMode);return;}
    });
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&effectiveMode()!=="dock")hide(true);});
    $("traderFicheToggle")?.addEventListener("click",()=>setEnabled(!enabled));
    window.addEventListener("agent-crypto:trader-selection-changed",()=>{if(effectiveMode()==="dock"){const row=document.querySelector("#marketRows tr.is-selected[data-market-help-id]");if(row)show(row);}else{hide(true);}},{passive:true});
    window.addEventListener("resize",()=>{if(effectiveMode()!=="dock")hide(true);else if(activeTarget)show(activeTarget,null,activeCoin);},{passive:true});
    setEnabled(true);
  }
  globalThis.AgentCryptoTraderNativeFiche=Object.freeze({build:BUILD,setEnabled,setMode,show,showAsset,hide,preferredMode,effectiveMode,dockAvailability,read_only:true,native_contract:"28.3.46+28.3.47+28.3.48+40.1.2"});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
})();