(() => {
  "use strict";
  const BUILD="40.6.596";
  const $=id=>document.getElementById(id);
  const finite=v=>{if(v===null||v===undefined||v==="")return null;const n=Number(v);return Number.isFinite(n)?n:null;};
  const currency=()=>String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||"USD").toUpperCase()==="EUR"?"EUR":"USD";
  const selected=()=>globalThis.AgentCryptoTraderMarket?.selected?.()||globalThis.getSelectedCoin?.()||null;
  const line=()=>globalThis.AgentCryptoTraderLineChart?.snapshot?.()||null;
  const priceOf=c=>finite(currency()==="USD"?c?.priceUsd:(c?.priceEur??c?.price));
  const capOf=c=>finite(currency()==="USD"?c?.marketCapUsd:c?.marketCap);
  const volOf=c=>finite(currency()==="USD"?c?.volume24hUsd:c?.volume24h);
  const money=(v,cur=currency())=>{const n=finite(v);if(n===null)return"—";const digits=Math.abs(n)>=1000?2:Math.abs(n)>=1?4:Math.abs(n)>=.01?6:8;try{return new Intl.NumberFormat("fr-FR",{style:"currency",currency:cur,maximumFractionDigits:digits}).format(n);}catch(_){return n.toLocaleString("fr-FR",{maximumFractionDigits:digits})+" "+cur;}};
  const pct=v=>{const n=finite(v);return n===null?"—":(n>0?"+":"")+n.toFixed(2)+" %";};
  const ageLabel=c=>{const raw=c?.usdUpdatedAt||c?.snapshotGeneratedAt||c?.lastUpdated||c?.timestamp||c?.spotUpdatedAt;const ms=Date.parse(String(raw||""));if(!Number.isFinite(ms))return"heure source —";const age=Math.max(0,Date.now()-ms);if(age<120000)return"moins de 2 min";if(age<3600000)return Math.max(2,Math.round(age/60000))+" min";if(age<86400000)return(age/3600000).toFixed(1)+" h";return(age/86400000).toFixed(1)+" j";};
  const sourceLabel=c=>String(c?.usdSource||c?.priceUsdSource||c?.source||"CoinGecko public").trim()||"CoinGecko public";
  const typeLabel=c=>{if(c?.externalNewListing)return"Nouveau listing";const s=String(c?.symbol||"").toUpperCase(),rank=Number(c?.rank||99999);if(["USDT","USDC","DAI","FDUSD","USDE","USDS","PYUSD","TUSD","EURC"].includes(s))return"Stablecoin";if(["BTC","ETH"].includes(s))return"Repère marché";if(rank<=50)return"Grande capitalisation";if(rank<=100)return"Capitalisation intermédiaire";return"Actif marché";};
  const decisionLabel=(c,s)=>c?.externalNewListing?"Nouveau · consultation":s?.truth==="cache"?"Archive · consultation":"Observation · consultation";
  const set=(id,value)=>{const n=$(id);if(n)n.textContent=value;};
  const setTone=(id,value)=>{const n=$(id);if(!n)return;const x=finite(value);n.classList.remove("pos","neg","flat");if(x!==null)n.classList.add(x>0?"pos":x<0?"neg":"flat");};
  function ratio(c){const cap=capOf(c),vol=volOf(c);return cap!==null&&cap>0&&vol!==null?vol/cap*100:null;}
  function renderCompact(c,s){
    const cur=currency(),price=priceOf(c),ch=finite(c?.change24h);
    set("detailCompactAsset",String(c?.symbol||"—").toUpperCase());
    const priceNode=$("detailCompactPrice"),priceLabel=priceNode?.closest("span")?.querySelector("small");
    if(priceLabel)priceLabel.textContent="Prix "+cur;
    set("detailCompactPrice",money(price,cur));
    set("detailCompactDecision",decisionLabel(c,s));
    set("detailCompactChange",pct(ch));setTone("detailCompactChange",ch);
  }
  function renderAsset(c,s){
    const cells=[...document.querySelectorAll("#assetDetailGrid > div")];
    const values=[
      [String(c?.name||c?.symbol||"—")+" · "+String(c?.symbol||"").toUpperCase(),typeLabel(c)],
      [decisionLabel(c,s),ratio(c)===null?"—":ratio(c).toFixed(2)+" %"]
    ].flat();
    cells.forEach((cell,i)=>{const span=cell.querySelector("span");if(span)span.textContent=values[i]??"—";});
    const why=$("assetDetailWhy");
    if(why){
      const p=s?.period_label||"—",pts=Number(s?.points||0),truth=s?.truth==="cache"?"cache / repli":"direct";
      why.textContent="Actif synchronisé · "+sourceLabel(c)+" · "+ageLabel(c)+" · historique "+p+" · "+(pts||"—")+" points · "+truth+".";
    }
  }
  function renderSource(c,s){
    const owner=globalThis.AgentCryptoTraderSourceDock;
    if(owner?.select){owner.select(c);return;}
    set("sourceDockAsset",String(c?.name||c?.symbol||"—")+" · "+String(c?.symbol||"").toUpperCase());
    set("sourceDockCompactState","En attente");
    set("sourceDockStatus","Source Dock natif en attente");
  }
  function renderBroker(c,s){
    set("brokerMarket","Market public");
    set("brokerMarketTime",ageLabel(c));
    set("brokerSpot",money(priceOf(c),currency()));
    set("brokerSpotTime",sourceLabel(c));
    set("brokerChart",s?.points?String(s.points)+" pts":"En attente");
    set("brokerChartTime",s?.period_label?(s.period_label+" · "+(s.truth==="cache"?"cache":"direct")):"—");
  }
  function renderDiagnostics(c,s){
    set("diagSourceMode",c?.externalNewListing?"Exchange externe":"CoinGecko");
    set("diagSourceDetail",sourceLabel(c));
    set("diagMarketLatency",ageLabel(c));
    set("diagUsdLatency",currency()+" · "+ageLabel(c));
    set("diagChartMode",s?.truth==="cache"?"Cache / repli":s?.points?"Direct":"En attente");
    set("diagChartLatency",s?.last_loaded_at?new Date(s.last_loaded_at).toLocaleTimeString("fr-FR"):"—");
    set("diagRetryCount",s?.error?"1 erreur":"0 retry");
    set("diagLastError",s?.error||"Aucune erreur");
  }
  function renderIntegrity(c,s){
    const p=document.querySelector("#detailIntegrityWindow p");if(!p)return;
    if(!s?.points){p.textContent="Historique en attente. Aucune série n’est inventée.";return;}
    p.textContent="Actif "+String(c?.symbol||"").toUpperCase()+" · devise "+s.currency+" · "+s.period_label+" · "+s.points+" points · "+(s.truth==="cache"?"cache / repli":"source directe")+" · dernier point "+money(s.last,s.currency)+". Aucune série n’est inventée.";
  }
  function render(reason="sync"){
    const c=selected();if(!c)return false;const s=line()||{};
    renderCompact(c,s);renderAsset(c,s);renderSource(c,s);renderBroker(c,s);renderDiagnostics(c,s);renderIntegrity(c,s);
    const panel=$("detailPanel");if(panel){panel.dataset.activeAsset=String(c.id||c.symbol||"");panel.dataset.technicalSync=BUILD;panel.dataset.technicalReason=reason;}
    return true;
  }
  function bind(){
    window.addEventListener("agent-crypto:trader-selection-changed",()=>queueMicrotask(()=>render("selection")),{passive:true});
    window.addEventListener("agent-crypto:trader-line-loaded",()=>render("line"),{passive:true});
    window.addEventListener("agent-crypto:quote-architecture-changed",()=>queueMicrotask(()=>render("currency")),{passive:true});
    window.addEventListener("agent-crypto:external-asset-changed",()=>queueMicrotask(()=>render("external")),{passive:true});
    window.addEventListener("agent-crypto:trader-technical-levels",()=>render("levels"),{passive:true});
    setTimeout(()=>render("boot"),0);
  }
  globalThis.AgentCryptoTraderTechnicalData=Object.freeze({build:BUILD,render,snapshot:()=>Object.freeze({build:BUILD,asset:selected()?.id||null,currency:currency(),line:line()}),single_context_owner:true,real_order:false});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
})();