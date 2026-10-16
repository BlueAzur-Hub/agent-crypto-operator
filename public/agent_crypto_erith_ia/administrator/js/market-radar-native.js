/* ERITH · Radar — native Market presentation; delegates validation to radar.js.
 * No iframe, no shadow DOM, no private API, no new Market/graph owner.
 * Style comes from the parent Administrator/Trader stylesheet.
 */
(function(global){
"use strict";
const existing=global.AgentCryptoRadarNative;
if(existing)return;
const DAY=86400000;
const fmt=new Intl.NumberFormat("fr-FR",{maximumFractionDigits:2});
const number=(v,d=2)=>typeof v==="number"&&Number.isFinite(v)?
  new Intl.NumberFormat("fr-FR",{maximumFractionDigits:d}).format(v):"—";
const displayPrice=v=>typeof v!=="number"||!Number.isFinite(v)||v<=0?"—":number(v,v>=100?2:v>=1?4:v>=.01?6:10);
const pct=v=>typeof v!=="number"||!Number.isFinite(v)?"—":(v>0?"+":"")+v.toFixed(2)+" %";
const safeDate=v=>{if(!v)return"—";const d=new Date(v);return Number.isNaN(d.getTime())?"—":d.toLocaleString("fr-FR");};
const compactMoney=v=>typeof v==="number"&&Number.isFinite(v)&&v>=0?
  new Intl.NumberFormat("fr-FR",{style:"currency",currency:"USD",notation:"compact",maximumFractionDigits:2}).format(v):"—";
// One Radar model: Market ranking stays beside Math; studies live below both.
const lookup=(root,id)=>root.querySelector('[data-radar-native="'+id+'"]')||
 root.radarBelowMarket?.querySelector('[data-radar-native="'+id+'"]')||null;
const node=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
function cell(row,txt,cls){const td=node("td",cls||"",txt);row.appendChild(td);return td;}
// Reuse the canonical Market facts and source; never claim a live trading quote.
function factCell(row,primary,secondary,cls){
 const td=cell(row,"",cls||"");
 td.append(node("b","radar-native-fact",primary),node("small","radar-native-provenance",secondary));
 return td;
}
const categoryName=Object.freeze({pillar:"Repère marché",stablecoin:"Stablecoin",major:"Grande capitalisation",speculative:"Actif à observer"});

const stableSymbols=new Set(['USDT','USDC','DAI','FDUSD','USDE','USDS','PYUSD','TUSD','EURC']);
function radarCategory(asset){
 const symbol=String(asset.symbol||'').toUpperCase();
 return ['BTC','ETH'].includes(symbol)?'pillar':stableSymbols.has(symbol)?'stablecoin':asset.rank<=50?'major':'speculative';
}
function radarLogo(asset){
 const raw=String(asset.image||'');
 if(/^\.\/assets\/crypto\/new-listings\/[a-z0-9-]+\.png$/.test(raw))return new URL(raw,document.baseURI).href;
 return /^https:\/\//i.test(raw)?raw:'';
}
function identityCell(target,asset){
 const cellNode=target.tagName==='TR'?cell(target):target;
 const content=node('span','coin-cell radar-native-identity');
 const rail=node('i','market-identity-rail');rail.setAttribute('aria-hidden','true');content.append(rail);
 const src=radarLogo(asset);
 const fallback=()=>node('span','radar-native-icon-fallback',String(asset.symbol||'?').slice(0,1));
 if(src){const icon=node('img');icon.src=src;icon.alt='';icon.loading='lazy';icon.addEventListener('error',()=>icon.replaceWith(fallback()),{once:true});content.append(icon);}
 else content.append(fallback());
 const title=node('span','radar-native-identity-label');
 title.append(node('strong','market-coin-name',asset.name||asset.symbol),node('small','',String(asset.symbol||'').toUpperCase()));
 if(Number.isFinite(Number(asset.rank))&&Number(asset.rank)>0)
  title.append(node('em','asset-badge radar-native-category',categoryName[radarCategory(asset)]||'Repère marché'));
 content.append(title);cellNode.append(content);return cellNode;
}

async function get(url){
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),11000);
 try{const r=await fetch(new URL(url,document.baseURI),{credentials:"omit",cache:"no-store",signal:ctrl.signal});
  if(!r.ok)throw Error("HTTP "+r.status);return await r.json();
 }finally{clearTimeout(timer);}
}

// Selection is delegated to the existing owners. A click NEVER clears an
// existing chart pre-emptively; a supported destination is checked first.
async function selectGraph(root,model,identity){
 if(!identity?.id||!identity?.symbol)return false;
 const revision=++model.selectionRevision;
 const status=lookup(root,"status");
 const setStatus=msg=>{if(revision===model.selectionRevision&&status)status.textContent=msg;};
 setStatus("Graphique · "+identity.symbol+" · vérification de la source…");
 try{
  if(identity.kind==="market"){
   const commands=global.AgentCryptoCommands;
   if(typeof commands?.asset!=="function"||typeof commands?.chart!=="function")
     throw Error("contrôleur graphique Market indisponible");
   const found=commands.asset(identity.id);
   if(found?.ok!==true||found?.payload?.id!==identity.id)
     throw Error("actif absent du Market Core chargé ; graphique inchangé");
   if(revision!==model.selectionRevision)return false;
   // External CT intent must be released BEFORE the canonical chart renders;
   // otherwise the V7 recovery guard can replace BTC with a waiting CT label.
   global.atlasTraderExternalSelectionClear?.();
   global.AgentCryptoNewListingsNativeCategory?.deactivate?.({clearChart:false});
   const result=commands.chart(identity.id,"24h");
   if(result?.ok!==true||result?.payload?.selected_asset?.id!==identity.id)
     throw Error("affichage Solo refusé par le contrôleur Market");
  }else if(identity.kind==="listing"){
   const category=global.AgentCryptoNewListingsNativeCategory;
   if(typeof category?.selectById!=="function")throw Error("contrôleur des nouveaux listings absent");
   let ok=await category.selectById(identity.id);
   if(!ok&&identity.symbol!=="CT"&&typeof category.discover==="function"){
     await category.discover();
     if(revision!==model.selectionRevision)return false;
     ok=await category.selectById(identity.id);
   }
   if(revision!==model.selectionRevision)return false;
   if(!ok)throw Error("bougies de la paire non validées ; graphique précédent conservé");
   if(identity.symbol==="CT"){
     global.atlasTraderExternalSelectionCommit?.({
       id:"concrete",provider:"okx",providerSymbol:"CT-USDT",presentation:"line"
     });
   }else{
     global.atlasTraderExternalSelectionClear?.();
   }
   // Trust the existing chart owner, not the listing label or the last click.
   const selected=category.snapshot?.();
   const chart=global.AtlasExternalChart?.state?.();
   if(!selected?.selectedId||String(chart?.coin_id||"")!==String(selected.selectedId))
     throw Error("graphique Solo non confirmé pour cette identité ; vérifier les sources");
  }else throw Error("source non reconnue : graphique inchangé");
  if(revision!==model.selectionRevision)return false;
  model.activeIdentity={kind:identity.kind,id:identity.id};
  for(const row of root.querySelectorAll?.(".radar-native-selectable")||[]){
   const active=row.dataset.radarKind===identity.kind&&row.dataset.radarId===identity.id;
   row.classList.toggle("is-selected",active);
   row.setAttribute("aria-selected",String(active));
  }
  setStatus(identity.symbol+" · identité confirmée dans le graphique Solo · aucun ordre");
  
  return true;
 }catch(error){
  setStatus(identity.symbol+" · "+String(error?.message||error));
  return false;
 }
}
function clickable(row,identity,root,model,coin){
 row.classList.add("radar-native-selectable");
 row.tabIndex=0;row.setAttribute("role","button");
 row.setAttribute("aria-label","Afficher le graphique Solo de "+identity.symbol);
 // Market rows share the Administrator's delegated Fiche and Math owner.
 // Outside the canonical Market, no unproven Fiche/score is claimed.
 const marketFiche=identity.kind==="market"&&coin?.id===identity.id;
 if(marketFiche){
  row.dataset.marketHelpId=identity.id;
  row.setAttribute("aria-description","Fiche Market native au survol · Solo au clic");
 }else{
  row.setAttribute("aria-description","Solo au clic · fiche et score uniquement si données vérifiées");
 }
 row.dataset.radarKind=identity.kind;row.dataset.radarId=identity.id;
 const isActive=model.activeIdentity?.kind===identity.kind&&model.activeIdentity?.id===identity.id;
 if(isActive)row.classList.add("is-selected");
 row.setAttribute("aria-selected",String(Boolean(isActive)));
 const activate=event=>{
   if(event.type==="keydown"&&!["Enter"," "].includes(event.key))return;
   if(event.type==="keydown")event.preventDefault();
   void selectGraph(root,model,identity);
 };
 row.addEventListener("click",activate);
 row.addEventListener("keydown",activate);
 // Admin's atlasHelpTargetFromNode delegates all canonical [data-market-help-id]
 // rows to the one existing Fiche (Flottante/Latérale with native scoreCoin).
 if(!marketFiche&&coin){
  const show=e=>global.AgentCryptoTraderNativeFiche?.showAsset?.(row,coin,e?.type==='pointerenter'?e:null);
  row.addEventListener('pointerenter',show);row.addEventListener('focus',show);
  row.addEventListener('pointerleave',()=>global.AgentCryptoTraderNativeFiche?.hide?.());
  row.addEventListener('blur',()=>global.AgentCryptoTraderNativeFiche?.hide?.());
 }
}
function mountBelowMarket(root){
 const workspace=document.getElementById("marketWorkspaceGrid");
 if(!workspace?.contains?.(root)||!workspace.parentElement)return null;
 let shelf=document.getElementById("atlasRadarBelowMarket");
 if(!shelf){
  shelf=node("section","radar-native-below");
  shelf.id="atlasRadarBelowMarket";
  shelf.hidden=true;
  shelf.setAttribute("aria-label","Radar · Nouveaux listings Spot et veille PAPER");
  shelf.append(node("div","radar-native"));
  // Outside the Market/Math grid; never creates a second Math or Radar owner.
  workspace.insertAdjacentElement("afterend",shelf);
 }
 const content=shelf.querySelector(".radar-native");
 if(!content)return null;
 content.replaceChildren();
 shelf.hidden=!document.getElementById("marketSnapshotPanel")?.classList?.contains("atlas-radar-open");
 root.radarBelowMarket=shelf;
 return content;
}
function build(root){
 root.replaceChildren();
 root.classList.add("radar-native");
 const supplementary=mountBelowMarket(root)||root;
 const header=node("div","radar-native-head");
 const intro=node("div","");
 intro.append(node("p","eyebrow","RADAR · SURVEILLANCE PUBLIQUE"),node("h3","","Marchés et opportunités PAPER"));
 const commands=node("div","radar-native-actions");
 const refresh=node("button","btn small","Actualiser");
 refresh.type="button";refresh.dataset.radarNative="refresh";
 const large=node("a","","Agrandir ↗");
 large.href=new URL("../laboratoire/radar.html",document.baseURI).href;
 large.target="_blank";large.rel="noopener noreferrer";
 commands.append(refresh,large);header.append(intro,commands);root.append(header);
 const status=node("p","table-note","Radar non encore chargé");status.dataset.radarNative="status";status.setAttribute("role","status");root.append(status);
 const dock=node("div","radar-native-dock");
 dock.setAttribute("aria-label","Périmètre Radar par capitalisation");
 const group=node("div","market-universe-mode","");
 for(const tier of [10,20,50,250]){
  const b=node("button","","Top "+tier);b.type="button";b.dataset.tier=String(tier);b.setAttribute("aria-pressed",String(tier===10));b.classList.toggle("is-active",tier===10);group.append(b);
 }
 const filter=node("input","","");filter.type="search";filter.placeholder="Chercher une crypto";filter.dataset.radarNative="filter";filter.setAttribute("aria-label","Filtrer les cryptomonnaies du Radar");
 const sort=node("select","","");sort.dataset.radarNative="sort";sort.setAttribute("aria-label","Trier le Radar");
 for(const [value,label] of [["rank","Rang"],["change24h","Hausses 24h"],["drop24h","Baisses 24h"],["volume24hUsd","Volume 24h"]]){
  const option=node("option","",label);option.value=value;sort.append(option);
 }
 dock.append(group,filter,sort);root.append(dock);
 const subtitle=node("p","table-note","Top 10 · CoinGecko · pas de recommandation d'achat");subtitle.dataset.radarNative="marketNote";root.append(subtitle);
 const wrap=node("div","table-wrap radar-native-table");const table=node("table");
 const thead=node("thead"),tr=node("tr");
 for(const t of ["Rang","Crypto","Prix USD","24h","7j","Volume 24h","Lecture"]){tr.append(node("th","",t));}
 thead.append(tr);table.append(thead);
 const tbody=node("tbody");tbody.dataset.radarNative="rows";table.append(tbody);wrap.append(table);root.append(wrap);
 const bottom=node("div","radar-native-bottom");
 const listings=node("section","radar-native-block");
 listings.append(node("h3","","Nouveaux listings · Spot"));
 const proof=node("p","table-note","En attente des sources Bitget");proof.dataset.radarNative="listingProof";listings.append(proof);
 const ltableWrap=node("div","table-wrap");const ltable=node("table");const lhead=node("thead"),ltr=node("tr");
 for(const t of ["Actif","Paire","Âge","Cours coté","24h","Identité"]){ltr.append(node("th","",t));}
 lhead.append(ltr);ltable.append(lhead);
 const lb=node("tbody");lb.dataset.radarNative="listings";ltable.append(lb);ltableWrap.append(ltable);listings.append(ltableWrap);
 const watching=node("section","radar-native-block");watching.append(node("h3","","Veille PAPER · BTC / CT / MHA"));
 const cards=node("div","radar-native-cards");cards.dataset.radarNative="watch";watching.append(cards);
 const journal=node("p","table-note","Observateur GitHub indépendant · données non encore chargées");journal.dataset.radarNative="journal";watching.append(journal);
 bottom.append(listings,watching);supplementary.append(bottom);
 const opportunities=node("section","radar-native-block radar-native-opportunities");
 opportunities.append(node("h3","","Veille élargie · Top 1 000 (étude)"));
 const oNote=node("p","table-note","Chargement de l'archive étendue · aucune paire Spot validée ici");
 oNote.dataset.radarNative="opportunityNote";opportunities.append(oNote);
 const oRows=node("div","radar-native-opportunity-grid");oRows.dataset.radarNative="opportunities";
 opportunities.append(oRows);supplementary.append(opportunities);
 const foot=node("p","table-note","Lecture seule · aucun ordre OKX · USDT n'est pas automatiquement USDC · Radar20 de recherche inchangé");
 supplementary.append(foot);
 return {filter,sort,tbody,lb,refresh,group};
}
function printMarket(root,model){
 const api=global.AgentCryptoRadarReader;
 const body=lookup(root,"rows");body.replaceChildren();
 if(!model.market){const r=node("tr");cell(r,"Top 250 indisponible · aucune cotation inventée");body.append(r);return;}
 const rows=api.selectMarket(model.market.rows,model.tier,lookup(root,"filter").value,lookup(root,"sort").value);
 for(const asset of rows){
  const r=node("tr","asset-row radar-native-market-row");r.dataset.radarSymbol=asset.symbol;r.dataset.radarCategory=radarCategory(asset);
  const rank=cell(r,"","radar-native-rank");rank.append(node('b','',String(asset.rank)));
  identityCell(r,asset);
  factCell(r,displayPrice(asset.priceUsd)+" $US","USD · CoinGecko · "+safeDate(model.market.at),"radar-native-quote");
  const a=cell(r,pct(asset.change24h));a.className=asset.change24h>0?"pos":asset.change24h<0?"neg":"";
  const b=cell(r,pct(asset.change7d));b.className=asset.change7d>0?"pos":asset.change7d<0?"neg":"";
  factCell(r,compactMoney(asset.volume24hUsd),"Cap. "+compactMoney(asset.marketCapUsd),"radar-native-volume");
  const movement=api.observeMarket(asset),reading=cell(r,"","radar-native-reading "+movement.tone);
  reading.append(node('strong','',movement.label),node('small','radar-native-solo-hint',"Fiche au survol · Solo au clic"));
  reading.title=movement.detail;
  clickable(r,{kind:"market",id:asset.id,symbol:asset.symbol},root,model,{
    ...asset,radarSource:"CoinGecko · snapshot public USD",radarObservedAt:model.market.at,
    radarObservation:movement.label,radarReason:movement.detail,
    radarEvidence:"Variations 24 h / 7 j archivées · bougies exactes vérifiées seulement par le Graphique"
  });body.append(r);
 }
 if(!rows.length){const r=node("tr");cell(r,"Aucun résultat pour ce filtre");body.append(r);}
 lookup(root,"marketNote").textContent=rows.length+" actifs · Top "+model.tier+" par capitalisation · CoinGecko "+safeDate(model.market.at)+" · lecture seule";
 for(const b of model.group.querySelectorAll("[data-tier]")){const active=Number(b.dataset.tier)===model.tier;b.classList.toggle("is-active",active);b.setAttribute("aria-pressed",String(active));}
 
}
function printListings(root,model){
 const body=lookup(root,"listings");body.replaceChildren();
 const candidates=model.listings.filter(x=>x.symbol!=="CT");
 const listedCt=model.listings.find(x=>x.symbol==="CT");
 if(model.paper?.CT?.price)candidates.unshift({name:"Concrete",symbol:"CT",pair:"CT/USDT",venue:"OKX Spot",
  ageDays:listedCt?.ageDays??null,price:model.paper.CT.price,quote:"USDT",image:listedCt?.image||model.registry?.get("CT")?.image||"",change24h:listedCt?.change24h??null,status:listedCt?"OKX PAPER + Bitget Spot · date Bitget":"OKX PAPER · date non prouvée"});
 else if(listedCt)candidates.unshift(listedCt);
 if(!candidates.length){const r=node("tr");cell(r,model.listingError||"Aucun listing public vérifié");body.append(r);}
 for(const item of candidates){
  const r=node("tr","asset-row radar-native-listing-row");r.dataset.radarSymbol=item.symbol;r.dataset.radarCategory="listing";identityCell(r,item);
  cell(r,item.pair+" · "+item.venue);cell(r,item.ageDays===null?"—":number(item.ageDays,1)+" j");
  cell(r,displayPrice(item.price)+" "+item.quote);
  const move=cell(r,pct(item.change24h));move.className=item.change24h>0?"pos":item.change24h<0?"neg":"";
  cell(r,item.status);
  clickable(r,{kind:"listing",id:item.symbol==="CT"?"concrete":item.providerSymbol,symbol:item.symbol},root,model,{
   id:item.symbol==="CT"?"concrete":item.symbol,name:item.name,symbol:item.symbol,rank:"—",image:item.image,
   partial:true,renderedPrice:displayPrice(item.price)+" "+item.quote,rendered24:pct(item.change24h),
   rendered7:"—",radarQuote:item.quote,radarSource:item.venue+" · "+item.pair,
    radarObservation:"Variation 24 h uniquement",
    radarReason:"Aucune variation sur 7 j certifiée par cette seule cotation.",
    radarEvidence:"Identité : "+item.status+" · bougies à qualifier au clic"
  });body.append(r);
 }
 lookup(root,"listingProof").textContent=model.listingError||model.listings.length+
  " paires Spot Bitget récentes · "+model.listings.filter(v=>v.identityProved).length+" identités prouvées · CT via journal OKX";
 
}
function printWatch(root,model){
 const dest=lookup(root,"watch");dest.replaceChildren();
 const paper=model.paper,mha=model.listings.find(x=>x.symbol==="MHA");
 for(const v of [
  {name:"BTC · Bitcoin",market:"Binance Spot",data:paper?.BTC,quote:"USDT"},
  {name:"CT · Concrete",market:"OKX Spot",data:paper?.CT,quote:"USDT"},
  {name:"MHA · MAGNE.AI",market:"Bitget Spot",data:{price:mha?.price,decision:mha?"OBSERVATION":"SOURCE ABSENTE"},quote:mha?.quote||"USDT"}
 ]){
  const card=node("div","radar-native-card");
  const symbol=v.name.split(" · ")[0],id=symbol==="BTC"?"bitcoin":symbol==="CT"?"concrete":mha?.providerSymbol||"MHA";
  const known=symbol==="BTC"?model.market?.rows.find(c=>c.id==="bitcoin"):symbol==="CT"?model.registry?.get("CT"):mha;
  card.dataset.radarSymbol=symbol;card.dataset.radarCategory=symbol==="BTC"?"pillar":"listing";
  identityCell(card,{name:v.name.split(" · ")[1],symbol,image:known?.image||""});
  card.append(node("strong","",displayPrice(v.data?.price)+" "+v.quote),
    node("span","",v.market+" · "+(v.data?.decision||"INDISPONIBLE")));
  clickable(card,{kind:symbol==="BTC"?"market":"listing",id,symbol},root,model,{
   id,name:v.name.split(" · ")[1],symbol,rank:known?.rank||"—",image:known?.image||"",
   partial:true,renderedPrice:displayPrice(v.data?.price)+" "+v.quote,rendered24:"—",
   rendered7:"—",radarQuote:v.quote,radarSource:v.market+" · veille PAPER",
    radarObservation:"Journal PAPER · "+(v.data?.decision||"SOURCE ABSENTE"),
    radarReason:"État d'une simulation ; aucune décision financière réelle.",
    radarEvidence:"Cotation "+v.quote+" · aucune exécution supposée"
  });
  dest.append(card);
 }
 lookup(root,"journal").textContent=paper?
   "PAPER · BTC : "+paper.BTC.decision+" · CT : "+paper.CT.decision+
   " · "+(paper.BTC.closed+paper.CT.closed)+" positions PAPER terminées · source BTC "+safeDate(paper.BTC.sourceTime)+" / CT "+safeDate(paper.CT.sourceTime):
   "Journal PAPER inaccessible · aucun signal supposé";
 
}
async function openOpportunityFiche(root,button,item){
 const status=lookup(root,"status");
 const tell=message=>{if(status)status.textContent=message;};
 const label=(text,description)=>{
  button.textContent=text;
  button.title=description;
  button.setAttribute("aria-label",description);
 };
 if(!item?.id||!item?.symbol||!Number.isInteger(Number(item.rank))||
    Number(item.rank)<1||Number(item.rank)>1000){
  label("Fiche !","Fiche indisponible : identité incomplète");
  tell("Fiche Top 1 000 indisponible : identité incomplète");
  return false;
 }
 const native=global.AtlasExtendedNativeFiche;
 const universe=global.AtlasMarketUniverse1000;
 if(typeof native?.resolver!=="function"&&typeof universe?.find!=="function"){
  label("Fiche !","Fiche native momentanément indisponible");
  tell("Fiche Market native indisponible · aucune fiche fictive créée");
  return false;
 }
 // Keep the control focusable. A disabled button cannot reliably receive
 // real focus events, which are the Administrator native Fiche entry point.
 // aria-busy prevents duplicate async clicks without changing graph focus.
 if(button.dataset.radarFicheBusy==="1")return false;
 button.dataset.radarFicheBusy="1";
 button.setAttribute("aria-busy","true");
 const resolve=()=>typeof native?.resolver==="function"?native.resolver(item.id):universe?.find?.(item.id);
 try{
  let coin=resolve();
  if(!coin){
   // The native Market index alone resolves the fiche. Never invent a card.
   if(typeof universe?.ensure!=="function")throw Error("index Market Extended indisponible");
   await universe.ensure(1000);
   coin=resolve();
  }
  if(button.isConnected===false)throw Error("liste actualisée pendant le chargement");
  // Identity is ID + symbol, not an identical rank across two non-atomic
  // CoinGecko snapshots. Rank can legitimately move between observations.
  const rank=Number(coin?.rank);
  if(!coin||String(coin.id)!==String(item.id)||
   String(coin.symbol||"").toUpperCase()!==String(item.symbol).toUpperCase()||
   !Number.isInteger(rank)||rank<1||rank>1000)
   throw Error("identité non confirmée dans le Market étendu");
  button.dataset.marketHelpId=String(item.id);
  const layer=document.getElementById("atlasHelpLayer");
  const dock=document.getElementById("atlasMarketCardDockHost");
  const openedMode=()=>(
   String(layer?.dataset?.marketHelpCoinId||"")===String(item.id)&&!layer.hidden?"floating":
   String(dock?.dataset?.marketHelpCoinId||"")===String(item.id)&&!dock.hidden?"dock":null
  );
  // Firefox: a click may already have focused this button BEFORE the
  // canonical identity was attached. Focusing an already-focused node
  // does not retrigger focusin, so use the existing delegated handler
  // after a real focus attempt, without disabling the button.
  if(typeof button.focus==="function")button.focus({preventScroll:true});
  if(!openedMode())button.dispatchEvent(new Event("focusin",{bubbles:true}));
  const mode=openedMode();
  if(!mode)throw Error("ouverture non confirmée par la fiche Market");
  if(mode==="dock"){
   // The native lateral fiche lives in Market, above the Radar study.
   // Do not silently scroll the page or change the user's Fiche mode.
   label("Market ↑","Fiche de "+coin.symbol+" ouverte dans le Market, plus haut sur la page");
  }else{
   label("Fiche ✓","Fiche Crypto de "+coin.name+" ouverte (flottante)");
  }
  tell(item.symbol+" · fiche Market native ouverte"+
    (rank!==Number(item.rank)?" · rang actualisé "+rank:"")+
    (mode==="dock"?" · fiche latérale dans Market":"")+" · graphique inchangé");
  return true;
 }catch(error){
  delete button.dataset.marketHelpId;
  label("Fiche !","Fiche indisponible : "+String(error?.message||error));
  tell("Fiche Top 1 000 suspendue · "+String(error?.message||error));
  return false;
 }finally{
  delete button.dataset.radarFicheBusy;
  button.removeAttribute?.("aria-busy");
 }
}
function printOpportunities(root,model){
 const area=lookup(root,"opportunities"),note=lookup(root,"opportunityNote");
 if(!area||!note)return;area.replaceChildren();
 const result=model.opportunities;
 if(!result){note.textContent=model.opportunityError||"Archives Top 1 000 à qualifier · aucune opportunité supposée";return;}
 note.textContent=result.universe+" rangs contrôlés · "+result.eligible+
 " actifs après filtres capitalisation / volume / rotation · sources "+
 safeDate(result.sourceTimes.core)+" / "+safeDate(result.sourceTimes.extended)+
 " · pas de validation carnet, spread ou exécution";
 for(const [key,title] of [["trend","Hausses 24 h et 7 j"],["rebound","Rebonds 24 h / 7 j négatif"]]){
  const group=node("div","radar-native-opportunity-group");
  group.append(node("h4","",title));
  const list=node("div","radar-native-opportunity-list");
  for(const item of result[key]){
   const row=node("div","radar-native-opportunity");
   row.append(node("strong","",item.symbol+" · "+item.name),
    node("span","",item.change24h.toFixed(2)+" % / 24 h · "+item.change7d.toFixed(2)+" % / 7 j"),
    node("small","",compactMoney(item.volume24hUsd)+" vol. · rang "+item.rank+
     " · "+item.riskNote));
   const button=node("button","btn small","Fiche");button.type="button";
   button.setAttribute("aria-label","Fiche Crypto de "+item.name+" · aucune sélection de graphique");
   button.addEventListener("click",()=>void openOpportunityFiche(root,button,item));
   row.append(button);list.append(row);
  }
  if(!result[key].length)list.append(node("p","table-note","Aucun actif ne satisfait les critères"));
  group.append(list);area.append(group);
 }
}
async function identityRegistry(){
 const local="./data/new-listings-identities.json";
 try{return await get(local);}
 catch(_){
  // Data folder may be excluded from the lightweight Pages artifact. The
  // canonical PUBLIC file is GitHub RAW; no identity is inferred on failure.
  return get("https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/administrator/data/new-listings-identities.json");
 }
}
async function refresh(root,model){
 if(model.loading)return;
 model.loading=true;
 lookup(root,"refresh").disabled=true;
 lookup(root,"status").textContent="Radar · lecture du classement et du journal…";
 const api=global.AgentCryptoRadarReader;
 // Start Bitget early, but never make the Top 250 wait for its two endpoints.
 const marketPromise=get("../data/crypto/latest.json");
 const paperPromise=get("../data/trader_flux/btc_ct_auto_paper/state.json");
 const registryPromise=identityRegistry();
 const extendedPromise=get("../data/crypto/extended.json");
 const instrumentsPromise=get("https://api.bitget.com/api/v3/market/instruments?category=SPOT");
 const tickersPromise=get("https://api.bitget.com/api/v3/market/tickers?category=SPOT");
 const issues=[];
 try{
  const first=await Promise.allSettled([marketPromise,paperPromise,registryPromise]);
  try{
   if(first[0].status!=="fulfilled")throw Error("archive indisponible");
   model.market=api.validMarket(first[0].value);model.rawMarket=first[0].value;
  }catch(e){model.market=null;model.rawMarket=null;issues.push("Top 250 : "+e.message);}
  try{
   if(first[1].status!=="fulfilled")throw Error("journal indisponible");
   model.paper=api.verifyPaper(first[1].value);
  }catch(e){model.paper=null;issues.push("PAPER : "+e.message);}
  let registry=new Map();
  try{
   if(first[2].status!=="fulfilled")throw Error("publication locale et GitHub RAW indisponibles");
   registry=api.verifyRegistry(first[2].value);
  }catch(e){issues.push("Registre identités : "+e.message);}
  model.registry=registry;model.listings=[];model.listingError="";model.opportunities=null;model.opportunityError="Top 1 000 · collecte publique en cours";
  printMarket(root,model);
  printWatch(root,model);
  printListings(root,model);printOpportunities(root,model);
  lookup(root,"status").textContent="Radar · classement et PAPER chargés · découverte Spot Bitget en cours…"+
   (issues.length?" · "+issues.join(" · "):"");
  const live=await Promise.allSettled([instrumentsPromise,tickersPromise,extendedPromise]);
  try{
   if(live[0].status!=="fulfilled"||live[1].status!=="fulfilled")
     throw Error("API Spot Bitget indisponible");
   model.listings=api.verifyBitget(live[0].value,live[1].value,registry,Date.now());
  }catch(e){model.listingError="Nouveaux listings : "+e.message;issues.push(model.listingError);}
  printListings(root,model);
  printWatch(root,model);
  try{
   if(live[2].status!=="fulfilled")throw Error("archive étendue indisponible");
   model.opportunities=api.selectOpportunities(model.rawMarket,live[2].value);
   model.opportunityError="";
  }catch(e){model.opportunities=null;model.opportunityError="Top 1 000 : "+e.message;issues.push(model.opportunityError);}
  printOpportunities(root,model);
  lookup(root,"status").textContent=issues.length?"Radar partiel · "+issues.join(" · "):
   "Radar · Top 250 / nouveaux listings Spot / PAPER BTC et CT · sélection Solo disponible";
 }catch(e){
  lookup(root,"status").textContent="Radar indisponible : "+String(e?.message||e);
 }finally{
  model.loading=false;
  lookup(root,"refresh").disabled=false;
 }
}
function mount(root){
 if(!root)return false;
 if(root.dataset.radarNativeMounted==="1"){return true;}
 if(!global.AgentCryptoRadarReader)throw Error("Le lecteur public Radar est indisponible");
 root.dataset.radarNativeMounted="1";
 const controls=build(root);
 const model={tier:10,market:null,paper:null,listings:[],registry:new Map(),listingError:null,group:controls.group,loading:false,selectionRevision:0};
 root.radarModel=model;
 controls.group.addEventListener("click",e=>{
  const b=e.target.closest("[data-tier]");if(!b)return;
  model.tier=Number(b.dataset.tier);printMarket(root,model);
 });
 controls.filter.addEventListener("input",()=>printMarket(root,model));
 controls.sort.addEventListener("change",()=>printMarket(root,model));
 controls.refresh.addEventListener("click",()=>void refresh(root,model));
 
 
 
 void refresh(root,model);
 return true;
}
if(typeof module!=="undefined"&&module.exports)
 module.exports=Object.freeze({selectGraph,compactMoney,printMarket,openOpportunityFiche});
global.AgentCryptoRadarNative=Object.freeze({mount});
})(typeof globalThis!=="undefined"?globalThis:this);
