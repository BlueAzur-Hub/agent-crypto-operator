(() => {
  "use strict";
  const BUILD = "40.6.598";
  const $=id=>document.getElementById(id);
  const finite=value=>{
    if(value===null||value===undefined||value==="")return null;
    const n=Number(value);return Number.isFinite(n)?n:null;
  };
  const displayCurrency=()=>String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||"USD").toUpperCase()==="EUR"?"EUR":"USD";
  const coin=()=>globalThis.AgentCryptoTraderMarket?.selected?.()||globalThis.getSelectedCoin?.()||null;
  const selectedPrice=c=>finite(displayCurrency()==="USD"?c?.priceUsd:(c?.priceEur??c?.price));
  const selectedCap=c=>finite(displayCurrency()==="USD"?c?.marketCapUsd:c?.marketCap);
  const selectedVol=c=>finite(displayCurrency()==="USD"?c?.volume24hUsd:c?.volume24h);
  const money=(value,currency=displayCurrency())=>{
    const n=finite(value);if(n===null)return "—";
    const digits=Math.abs(n)>=1000?2:Math.abs(n)>=1?4:8;
    try{return new Intl.NumberFormat("fr-FR",{style:"currency",currency,maximumFractionDigits:digits}).format(n);}
    catch(_){return n.toLocaleString("fr-FR",{maximumFractionDigits:digits})+" "+currency;}
  };
  const compact=(value,currency=displayCurrency())=>{
    const n=finite(value);if(n===null)return "—";
    try{return new Intl.NumberFormat("fr-FR",{style:"currency",currency,notation:"compact",maximumFractionDigits:2}).format(n);}
    catch(_){return n.toLocaleString("fr-FR",{maximumFractionDigits:2});}
  };
  const pct=value=>{const n=finite(value);return n===null?"—":(n>0?"+":"")+n.toFixed(2)+" %";};
  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));
  const freshness=c=>{
    const raw=c?.usdUpdatedAt||c?.snapshotGeneratedAt||c?.lastUpdated||c?.timestamp||c?.spotUpdatedAt;
    const ms=Date.parse(String(raw||""));if(!Number.isFinite(ms))return "heure source —";
    const age=Math.max(0,Date.now()-ms);
    if(age<120000)return "moins de 2 min";
    if(age<3600000)return Math.max(2,Math.round(age/60000))+" min";
    if(age<86400000)return (age/3600000).toFixed(1)+" h";
    return (age/86400000).toFixed(1)+" j";
  };
  const source=c=>{
    const raw=String(c?.usdSource||c?.priceUsdSource||c?.source||"CoinGecko").trim();
    return raw||"CoinGecko";
  };
  function mathScore(){
    try{
      const result=globalThis.AgentCryptoTraderMathCore?.score?.();
      return finite(result?.score??result);
    }catch(_){return null;}
  }
  function setText(id,value,cls=""){
    const n=$(id);if(!n)return;
    n.textContent=value;
    if(cls)n.className=cls;else n.removeAttribute("class");
  }
  function renderFiche(){
    const c=coin(),panel=$("traderMarketFiche");if(!panel||!c)return false;
    const cur=displayCurrency(),price=selectedPrice(c),cap=selectedCap(c),vol=selectedVol(c);
    const ratio=cap!==null&&cap>0&&vol!==null?vol/cap*100:null;
    const score=mathScore();
    const image=$("traderFicheImage");if(image){image.src=c.image||"";image.hidden=!c.image;}
    setText("traderFicheName",String(c.name||c.symbol||"Actif"));
    setText("traderFicheSymbol",String(c.symbol||"").toUpperCase());
    setText("traderFicheRank","Rang "+(c.rank??"—")+" · Repère marché");
    setText("traderFichePrice",money(price,cur));
    setText("traderFicheSource",source(c)+" · "+freshness(c));
    const c24=finite(c.change24h),c7=finite(c.change7d),c30=finite(c.change30d??c.change30D??c.change30);
    setText("traderFiche24",pct(c24),c24===null?"":c24>0?"pos":c24<0?"neg":"");
    setText("traderFiche7",pct(c7),c7===null?"":c7>0?"pos":c7<0?"neg":"");
    setText("traderFiche30",pct(c30),c30===null?"":c30>0?"pos":c30<0?"neg":"");
    setText("traderFicheRatio",ratio===null?"—":ratio.toFixed(2)+" %");
    setText("traderFicheCap",compact(cap,cur));
    setText("traderFicheVolume",compact(vol,cur));
    setText("traderFicheScore",score===null?"—":String(Math.round(score)));
    setText("traderFicheDecision","Observer / comparer");
    setText("traderFicheObserved","Prix "+cur+" · "+source(c)+" · "+freshness(c)+" · variation 24 h inchangée");
    setText("traderFicheReference","Référence marché 24 h · "+pct(c24));
    panel.dataset.coinId=String(c.id||"");
    return true;
  }
  let ficheEnabled=true;
  function setFicheOpen(open){
    const panel=$("traderMarketFiche"),button=$("traderFicheToggle");
    ficheEnabled=!!open;
    if(panel)panel.hidden=!ficheEnabled;
    if(button){button.classList.toggle("is-active",ficheEnabled);button.setAttribute("aria-pressed",String(ficheEnabled));}
    if(ficheEnabled)renderFiche();
  }
  function bindFiche(){
    $("traderFicheToggle")?.addEventListener("click",()=>setFicheOpen(!ficheEnabled));
    document.querySelectorAll("[data-trader-fiche-mode]").forEach(button=>button.addEventListener("click",()=>{
      const mode=button.dataset.traderFicheMode==="side"?"side":"float";
      const panel=$("traderMarketFiche");if(panel)panel.dataset.mode=mode;
      document.querySelectorAll("[data-trader-fiche-mode]").forEach(x=>x.classList.toggle("is-active",x.dataset.traderFicheMode===mode));
    }));
    window.addEventListener("agent-crypto:trader-selection-changed",()=>{syncMarketRows();if(ficheEnabled){setFicheOpen(true);renderFiche();}}, {passive:true});
    window.addEventListener("agent-crypto:quote-architecture-changed",()=>{syncCurrencyButtons();renderFiche();},{passive:true});
  }
  function syncMarketRows(){
    document.querySelectorAll("#marketRows tr[data-market-id]").forEach(row=>{
      row.tabIndex=0;
      row.setAttribute("aria-label","Sélectionner "+(row.querySelector(".trader-market-identity b")?.textContent||"cet actif")+" et ouvrir sa fiche");
    });
  }
  function bindMarketKeyboard(){
    $("marketRows")?.addEventListener("keydown",event=>{
      if(event.key!=="Enter"&&event.key!==" ")return;
      const row=event.target.closest("tr[data-market-id]");if(!row)return;
      event.preventDefault();
      const id=row.dataset.marketId;if(id)void globalThis.AgentCryptoTraderMarket?.select?.(id,"market-keyboard").then(()=>setFicheOpen(true));
    });
  }
  function bindHeaderNavigation(){
    $("traderAdminReturn")?.addEventListener("click",()=>{
      location.href="../administrator/index.html?view=advanced";
    });
    document.querySelectorAll("[data-trader-target]").forEach(button=>button.addEventListener("click",()=>{
      const id=button.dataset.traderTarget;
      document.querySelectorAll("[data-trader-target]").forEach(x=>x.classList.toggle("is-active",x===button));
      if(id==="depth"){
        try{globalThis.AgentCryptoOkxMicrostructure?.setOpen?.(true);}catch(_){}
        $("detailPanel")?.scrollIntoView?.({behavior:"smooth",block:"start"});
        return;
      }
      $(id)?.scrollIntoView?.({behavior:"smooth",block:"start"});
    }));
  }
  function syncCurrencyButtons(){
    const cur=displayCurrency();
    document.querySelectorAll("[data-trader-currency]").forEach(button=>button.classList.toggle("is-active",button.dataset.traderCurrency===cur));
  }
  function bindCurrency(){
    document.querySelectorAll("[data-trader-currency]").forEach(button=>button.addEventListener("click",()=>{
      const value=button.dataset.traderCurrency==="EUR"?"EUR":"USD";
      try{globalThis.AgentCryptoQuoteCurrencyArchitecture?.setDisplayCurrency?.(value,{reason:"trader-fidelity-toolbar"});}catch(_){}
      syncCurrencyButtons();
    }));
    syncCurrencyButtons();
  }
  function bindGraphControls(){
    const legend=$("traderLegendToggle"),analysis=$("traderAnalysisToggle");
    legend?.addEventListener("click",()=>{
      const root=$("atlasMarketMicroscope");if(!root)return;
      const hidden=root.classList.toggle("trader-hide-legend");
      legend.classList.toggle("is-active",!hidden);legend.setAttribute("aria-pressed",String(!hidden));
    });
    analysis?.addEventListener("click",()=>{
      const root=$("atlasMarketMicroscope");if(!root)return;
      const hidden=root.classList.toggle("trader-hide-analysis");
      analysis.classList.toggle("is-active",!hidden);analysis.setAttribute("aria-pressed",String(!hidden));
    });
  }
  function start(){
    bindHeaderNavigation();bindGraphControls();bindMarketKeyboard();
    syncMarketRows();setFicheOpen(true);
    document.documentElement.dataset.traderFidelity=BUILD;
  }
  globalThis.AgentCryptoTraderFidelity=Object.freeze({
    build:BUILD,renderFiche,setFicheOpen,snapshot:()=>Object.freeze({build:BUILD,fiche_enabled:ficheEnabled,currency:displayCurrency(),selected:coin()?.id||null}),
    read_only:true,real_order:false,administrator_owners_changed:false
  });
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();