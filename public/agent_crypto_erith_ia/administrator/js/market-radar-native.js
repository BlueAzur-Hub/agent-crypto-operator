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
function foldSection(className,title,noteId,initialNote){
 const box=node("details","radar-native-block radar-native-fold "+className);
 const header=node("summary","radar-native-fold-summary");
 header.append(node("strong","",title));
 const note=node("small","radar-native-fold-indicator",initialNote||"Ouvrir pour lire");
 note.dataset.radarNative=noteId;
 header.append(note);box.append(header);
 return box;
}
// Data collection is independent of the displayed HTML details open state.
function setFoldNote(root,id,message){const element=lookup(root,id);if(element)element.textContent=message;}
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
 large.href="https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/laboratoire/radar.html";
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
 for(const [value,label] of [["rank","Rang"],["change24h","Hausses 24h"],["change7d","Hausses 7j"],["drop24h","Baisses 24h"],["volume24hUsd","Volume 24h"]]){
  const option=node("option","",label);option.value=value;sort.append(option);
 }
 // The canonical Administrator Market table stays visible as the primary
 // ranking. Preserve this separate dated Radar research ranking on demand,
 // without showing two competing Market tables at the same time.
 const detailRanking=foldSection("radar-native-ranking",
   "Classement Radar détaillé · Top 10 / 20 / 50 / 250",
   "foldRanking","Source Radar datée · ouvrir pour comparer");
 dock.append(group,filter,sort);detailRanking.append(dock);
 const subtitle=node("p","table-note","Top 10 · CoinGecko · pas de recommandation d'achat");subtitle.dataset.radarNative="marketNote";detailRanking.append(subtitle);
 const wrap=node("div","table-wrap radar-native-table");const table=node("table");
 const thead=node("thead"),tr=node("tr");
 for(const t of ["Rang","Crypto","Prix USD","24h","7j","Volume 24h","Lecture"]){tr.append(node("th","",t));}
 thead.append(tr);table.append(thead);
 const tbody=node("tbody");tbody.dataset.radarNative="rows";table.append(tbody);wrap.append(table);detailRanking.append(wrap);root.append(detailRanking);
 const bottom=node("div","radar-native-bottom");
 const listings=foldSection("","Nouveaux listings · Spot","foldListings","Spot Bitget · statut en lecture");
 const proof=node("p","table-note","En attente des sources Bitget");proof.dataset.radarNative="listingProof";listings.append(proof);
 const ltableWrap=node("div","table-wrap");const ltable=node("table");const lhead=node("thead"),ltr=node("tr");
 for(const t of ["Actif","Paire","Âge","Cours coté","24h","Identité"]){ltr.append(node("th","",t));}
 lhead.append(ltr);ltable.append(lhead);
 const lb=node("tbody");lb.dataset.radarNative="listings";ltable.append(lb);ltableWrap.append(ltable);listings.append(ltableWrap);
 const watching=foldSection("","Veille PAPER · BTC / CT / MHA","foldWatch","Journal indépendant · lecture seule");
 const cards=node("div","radar-native-cards");cards.dataset.radarNative="watch";watching.append(cards);
 const journal=node("p","table-note","Observateur GitHub indépendant · données non encore chargées");journal.dataset.radarNative="journal";watching.append(journal);
 bottom.append(listings,watching);supplementary.append(bottom);
 const opportunities=foldSection("radar-native-opportunities","Veille élargie · Top 1 000 (étude)","foldOpportunities","Contrôle des 1 000 rangs");
 const oNote=node("p","table-note","Chargement de l'archive étendue · aucune paire Spot validée ici");
 oNote.dataset.radarNative="opportunityNote";opportunities.append(oNote);
 const oRows=node("div","radar-native-opportunity-grid");oRows.dataset.radarNative="opportunities";
 opportunities.append(oRows);supplementary.append(opportunities);
 const research=foldSection("radar-native-opportunities","Top 1 000 · hausses 24 h / 7 j, volumes et replis","foldResearch","Quatre classements · 24 h / 7 j");
 const researchNote=node("p","table-note","Classements de recherche · aucun carnet validé par cette liste");
 researchNote.dataset.radarNative="researchNote";research.append(researchNote);
 const researchLists=node("div","radar-native-opportunity-grid");
 researchLists.dataset.radarNative="researchLists";research.append(researchLists);supplementary.append(research);
 const qualifying=foldSection("radar-native-qualification","Radar 20 · qualification Spot et coûts PAPER","foldQualification","20 candidats · lecture datée");
 const dossier=node("a","","Dossiers IA · projets, usages et historiques ↗");
 dossier.href="https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/laboratoire/crypto-knowledge.html";
 dossier.target="_blank";dossier.rel="noopener noreferrer";
 dossier.setAttribute("aria-label","Consulter le référentiel scientifique Crypto sans changer le graphique");
 qualifying.append(dossier);
 // Historical PAPER is a distinct fixed 20-market experiment, not the 20 dynamic Radar candidates.
 const historicalLink=node("a",""," · Historiques et simulations PAPER (Radar 20 fixe) ↗");
 historicalLink.href="https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/laboratoire/radar-historique.html";
 historicalLink.target="_blank";historicalLink.rel="noopener noreferrer";
 historicalLink.setAttribute("aria-label","Ouvrir le laboratoire historique Radar 20 fixe en lecture seule, sans modifier le Trader");
 qualifying.append(historicalLink);
 const qualNote=node("p","table-note","Dernier rapport de qualification non encore chargé");
 qualNote.dataset.radarNative="qualificationNote";qualifying.append(qualNote);
 const followNote=node("p","table-note","Suivi historique J+1/J+7 · archives en lecture…");
 followNote.dataset.radarNative="followupNote";qualifying.append(followNote);
 const followLink=node("a","","Journal dynamique daté ↗");
 followLink.href="https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/laboratoire/crypto-knowledge.html";
 followLink.target="_blank";followLink.rel="noopener noreferrer";
 qualifying.append(followLink);
 // Compact evidence comparison lives inside the existing foldable Radar.
 const focusTitle=node("p","table-note","Trajectoires · Q / ICNT / FLUID · mémoire datée, pas de signal PAPER");
 focusTitle.dataset.radarNative="trajectoryNote";qualifying.append(focusTitle);
 const focusRows=node("div","radar-native-opportunity-list");
 focusRows.dataset.radarNative="trajectoryRows";qualifying.append(focusRows);
 const qualRows=node("div","radar-native-opportunity-list");
 qualRows.dataset.radarNative="qualificationRows";qualifying.append(qualRows);
 supplementary.append(qualifying);
 // Same canonical Trader Radar, following PAPER; no separate page or new owner.
 const okxHourly=foldSection("radar-native-okx-hourly",
   "OKX Spot · relevés horaires (USDC / USDT / EUR)",
   "foldOkxHourly","Premières observations · lecture seule");
 const okxNote=node("p","table-note","Chargement du Coffre OKX EEE daté…");
 okxNote.dataset.radarNative="okxHourlyNote";okxHourly.append(okxNote);
 const okxWrap=node("div","table-wrap"),okxTable=node("table");
 const okxHead=node("thead"),okxHeadRow=node("tr");
 for(const title of ["Paire","Relevés","Milieu du carnet","Spread","Valeur bid niveau 1","Valeur ask niveau 1","Évolution observée"])
   okxHeadRow.append(node("th","",title));
 okxHead.append(okxHeadRow);okxTable.append(okxHead);
 const okxRows=node("tbody");okxRows.dataset.radarNative="okxHourlyRows";
 okxTable.append(okxRows);okxWrap.append(okxTable);okxHourly.append(okxWrap);
 okxHourly.append(node("p","table-note","Carnets publics datés, pas une cotation live ou un fill. "+
   "Les devises EUR, USDT et USDC restent séparées ; une heure ne prouve pas une tendance."));
 supplementary.append(okxHourly);
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
 setFoldNote(root,"foldListings",model.listingError?"Source indisponible · réessayer":model.listings.length+" paires Spot · "+model.listings.filter(v=>v.identityProved).length+" identités prouvées");
 
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
 setFoldNote(root,"foldWatch",paper?"BTC / CT · état PAPER consultable":"Journal indisponible · aucun signal");
 
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
 if(!area||!note)return;
 const openGroups=new Set([...area.querySelectorAll("details[data-radar-lane][open]")].map(x=>x.dataset.radarLane));
 area.replaceChildren();
 const result=model.opportunities;
 if(!result){note.textContent=model.opportunityError||"Archives Top 1 000 à qualifier · aucune opportunité supposée";setFoldNote(root,"foldOpportunities","Source indisponible · aucun signal");return;}
 const mixed=result.status==="MIXED_SNAPSHOT_BOUNDARY";
 const boundary=mixed?" · MIXED_SNAPSHOT_BOUNDARY · "+result.universe+
  " IDs distincts / "+result.observedRows+" lignes · "+
  result.boundaryOverlaps.map(x=>x.symbol+" ("+x.core.rank+"/"+x.extended.rank+")").join(", ")+
  " exclu(s) des classements":"";
 note.textContent=(mixed?result.universe+" IDs distincts":result.universe+" rangs contrôlés")+
  " · "+result.eligible+" actifs après filtres capitalisation / volume / rotation"+
  boundary+" · sources "+safeDate(result.sourceTimes.core)+" / "+
  safeDate(result.sourceTimes.extended)+" · pas de validation carnet, spread ou exécution";
 setFoldNote(root,"foldOpportunities",result.eligible+" actifs après filtres · aucun ordre");
 for(const [key,title] of [["trend","Hausses 24 h et 7 j"],["rebound","Rebonds 24 h / 7 j négatif"]]){
  const group=node("details","radar-native-opportunity-group");
  group.dataset.radarLane=key;group.open=openGroups.has(key);
  group.append(node("summary","",title));
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
function printResearchLists(root,model){
 const area=lookup(root,"researchLists"),note=lookup(root,"researchNote");if(!area||!note)return;
 const expanded=new Set([...area.querySelectorAll("details[data-radar-lane][open]")].map(x=>x.dataset.radarLane));
 area.replaceChildren();const q=model.opportunities;
 if(!q?.rankings){note.textContent="Top 1 000 indisponible · aucun classement inventé";setFoldNote(root,"foldResearch","Classements indisponibles");return;}
 note.textContent=q.eligible+" actifs filtrés sur "+q.universe+
  " IDs distincts · USD CoinGecko · "+safeDate(q.sourceTimes.core)+
  " / "+safeDate(q.sourceTimes.extended)+
  (q.status==="MIXED_SNAPSHOT_BOUNDARY"?" · MIXED_SNAPSHOT_BOUNDARY · "+
   q.boundaryOverlaps.map(x=>x.symbol+" rangs "+x.core.rank+"/"+x.extended.rank).join(", ")+
   " hors classements":"")+" · carnets non vérifiés dans ces classements";
 setFoldNote(root,"foldResearch",q.eligible+" actifs filtrés · 4 classements datés");
 for(const [key,title,metric] of [["rise24","Hausses 24 h","change24h"],["rise7","Hausses 7 jours","change7d"],["volume","Volumes 24 h","volume24hUsd"],["fall24","Baisses 24 h","change24h"]]){
  const group=document.createElement("details");group.className="radar-native-opportunity-group";group.dataset.radarLane=key;group.open=expanded.has(key);
  group.append(node("summary","",title+" · Top 10"));const list=node("div","radar-native-opportunity-list");
  for(const item of q.rankings[key]||[]){
   const row=node("div","radar-native-opportunity");
   row.append(node("strong","",item.symbol+" · "+item.name),node("span","",metric==="volume24hUsd"?compactMoney(item.volume24hUsd)+" USD":pct(item[metric])),
    node("small","",pct(item.change24h)+" / 24 h · "+pct(item.change7d)+" / 7 j · volume "+compactMoney(item.volume24hUsd)+" USD · rang "+item.rank+" · "+item.riskNote));
   const button=node("button","btn small","Fiche");button.type="button";
   button.addEventListener("click",()=>void openOpportunityFiche(root,button,item));
   row.append(button);list.append(row);
  }
  group.append(list);area.append(group);
 }
}
// Never join fundamental project descriptions to trading symbols alone:
// CoinGecko ID, ticker and qualification snapshot must all agree.
function matchedCandidateKnowledge(knowledge,qualification){
 if(!knowledge||knowledge.schema!=="erith.crypto.asset-research-knowledge.v1"||
  knowledge.candidate_count!==20||!Array.isArray(knowledge.candidates)||
  knowledge.candidates.length!==20||
  knowledge.qualification_snapshot_at!==qualification.qualified_at_utc)return null;
 const known=new Map(),market=new Map(qualification.candidates.map(x=>[x.id,x]));
 for(const asset of knowledge.candidates){
  if(!asset.coin_id||known.has(asset.coin_id)||!market.has(asset.coin_id)||
     market.get(asset.coin_id).symbol!==asset.symbol)return null;
  known.set(asset.coin_id,asset);
 }
 return known.size===qualification.candidates.length?known:null;
}

const historyStatuses=new Set(["OBSERVED_DAILY_SNAPSHOT","AWAITING_FUTURE_DAY","MISSING_DATED_SNAPSHOT","NO_MATCHING_VERIFIED_PRICE"]);
function verifiedDynamicFollowups(data){
 if(!data||data.schema!=="erith.radar.dynamic-forward-observations.v1"||data.quote!=="USD"||
    data.orders_enabled!==false||data.trade_executions_recorded!==false||
    !Array.isArray(data.source_archive_dates)||!Array.isArray(data.observations)||
    data.source_archive_dates.length>90||data.observations.length>10000)
    throw Error("contrat du journal dynamique invalide");
 const dates=new Set(data.source_archive_dates);
 if(dates.size!==data.source_archive_dates.length||
    [...dates].some(d=>!/^20\d{2}-\d{2}-\d{2}$/.test(d)||!Number.isFinite(Date.parse(d+"T00:00:00Z"))))
   throw Error("dates de source invalides");
 const byId=new Map(),uniques=new Set();
 for(const record of data.observations){
  if(typeof record?.id!=="string"||!record.id||typeof record.symbol!=="string"||
     !dates.has(record.first_seen_date_utc)||!Number.isFinite(Date.parse(record.observed_at_utc))||
     !Number.isFinite(record.initial_price_usd)||record.initial_price_usd<=0)
     throw Error("identité ou prix initial non vérifiable");
  const key=record.id+"@"+record.first_seen_date_utc;
  if(uniques.has(key))throw Error("observation Radar dupliquée");uniques.add(key);
  for(const [horizon,field] of [[1,"followup_1d"],[7,"followup_7d"]]){
   const point=record[field],target=new Date(Date.parse(record.first_seen_date_utc+"T00:00:00Z")+horizon*DAY).toISOString().slice(0,10);
   if(!point||!historyStatuses.has(point.status)||point.target_date_utc!==target)throw Error("horizon Radar incohérent");
   if(point.status==="OBSERVED_DAILY_SNAPSHOT"){
    if(!Number.isFinite(point.price_usd)||point.price_usd<=0||!Number.isFinite(point.change_pct)||
       !Number.isFinite(point.elapsed_hours)||point.elapsed_hours<=0||
       !Number.isFinite(Date.parse(point.at_utc))||Date.parse(point.at_utc)<=Date.parse(record.observed_at_utc))
      throw Error("résultat futur Radar non vérifiable");
    // A dated observation must agree with its two actual archived prices.
    // Percent changes are rounded to 0.01 points; allow rounding only.
    const derivedChange=(point.price_usd/record.initial_price_usd-1)*100;
    if(!Number.isFinite(derivedChange)||Math.abs(point.change_pct-derivedChange)>0.011)
      throw Error("variation future Radar fictive : prix et rendement incohérents");
   }else if(point.change_pct!==null||point.price_usd!==null)
     throw Error("valeur fictive dans un horizon sans observation");
  }
  if(!byId.has(record.id))byId.set(record.id,[]);
  byId.get(record.id).push(record);
 }
 for(const records of byId.values())records.sort((a,b)=>b.first_seen_date_utc.localeCompare(a.first_seen_date_utc));
 return {dates:data.source_archive_dates,byId,count:data.observations.length,
  measured_1d:data.observations.filter(x=>x.followup_1d.status==="OBSERVED_DAILY_SNAPSHOT").length,
  measured_7d:data.observations.filter(x=>x.followup_7d.status==="OBSERVED_DAILY_SNAPSHOT").length};
}
function dynamicCandidateHistory(history,id){return history?.byId?.get(id)||[];}
function describeDynamicPoint(point){
 if(point.status==="OBSERVED_DAILY_SNAPSHOT")
   return pct(point.change_pct)+" après "+number(point.elapsed_hours,2)+" h (relevé "+safeDate(point.at_utc)+")";
 if(point.status==="AWAITING_FUTURE_DAY")return "en attente du "+point.target_date_utc;
 if(point.status==="MISSING_DATED_SNAPSHOT")return "relevé du "+point.target_date_utc+" absent";
 return "prix à date cible non confirmé";
}


// Named study cases use the exact CoinGecko ID, never an exchange ticker alone.
// Read-only triage does not decide whether an asset can be traded.
const trajectoryFocus=Object.freeze([
 Object.freeze({id:"quack-ai",symbol:"Q"}),
 Object.freeze({id:"impossible-cloud-network-token",symbol:"ICNT"}),
 Object.freeze({id:"instadapp",symbol:"FLUID"})
]);
function trajectoryEvidence(history,id){
 const observations=dynamicCandidateHistory(history,id);
 const measured1=observations.filter(x=>x.followup_1d.status==="OBSERVED_DAILY_SNAPSHOT");
 const measured7=observations.filter(x=>x.followup_7d.status==="OBSERVED_DAILY_SNAPSHOT");
 const measured=[...observations].flatMap(x=>[["J+1",x.followup_1d],["J+7",x.followup_7d]]
   .filter(([,p])=>p.status==="OBSERVED_DAILY_SNAPSHOT")
   .map(([label,p])=>({label,initial:x,point:p})));
 measured.sort((a,b)=>Date.parse(b.point.at_utc)-Date.parse(a.point.at_utc)||
   b.initial.first_seen_date_utc.localeCompare(a.initial.first_seen_date_utc));
 const latest=observations[0]||null;
 return {id,selectionCount:observations.length,latestDate:latest?.first_seen_date_utc||null,
  count1:measured1.length,count7:measured7.length,lastMeasured:measured[0]||null,
  status:measured7.length?"SUIVI J+7 MESURÉ":measured1.length?"J+1 MESURÉ":"SUIVI EN ATTENTE",
  paperCertified:false}; // A dated aggregate price is not validated Spot candles, spread or token identity.
}
function trajectoryVolumeReadout(observation,point){
 const first=observation.initial_volume_24h_usd,last=point.volume_24h_usd;
 if(!Number.isFinite(first)||first<=0||!Number.isFinite(last)||last<0)return "volume 24 h non comparable";
 const move=(last/first-1)*100;
 const from=Number.isInteger(observation.initial_rank)?observation.initial_rank:null;
 const to=Number.isInteger(point.rank)?point.rank:null;
 return "volume 24 h "+pct(move)+" (deux relevés)"+(from!==null&&to!==null?
  " · rang "+from+" → "+to:" · rang non comparable");
}

function verifyProspectiveSpotComparison(data){
 if(!data||data.schema!=="erith.radar.priority-spot-comparison.v1"||
   data.quote!=="USDT"||data.orders_enabled!==false||
   data.paper_trades_executed!==false||data.strategy_validated!==false||
   data.identity_market_pair_certified!==false||
   !Array.isArray(data.markets)||data.markets.length!==3)
   throw Error("bilan prospectif Spot incompatible");
 const pairs=new Map([["quack-ai","QUSDT"],["impossible-cloud-network-token","ICNTUSDT"],["instadapp","FLUID-USDT"]]);
 const seen=new Set(),byId=new Map();
 for(const item of data.markets){
  if(!item||!pairs.has(item.coin_id)||seen.has(item.coin_id)||
     item.pair!==pairs.get(item.coin_id)||item.quote!=="USDT"||
     item.orders_enabled!==false||item.paper_strategy_validated!==false||
     item.identity_market_pair_certified!==false||
     !Number.isInteger(item.observation_count)||item.observation_count<0||
     !["NO_PROSPECTIVE_OBSERVATIONS","OBSERVATIONS_INSUFFICIENT","WINDOW_RESEARCH_POSSIBLE"].includes(item.status))
   throw Error("marché ou identité Spot non certifiable");
  const has=item.observation_count>0;
  if(has&&(!Number.isFinite(item.market_price_usdt)||item.market_price_usdt<=0||
     !Number.isFinite(item.last_spread_bps)||item.last_spread_bps<0||
     !Number.isFinite(Date.parse(item.last_observed_at_utc))||
     !/^[a-f0-9]{64}$/.test(item.source_sha256||"")||
     !Number.isInteger(item.distinct_closed_hours)||item.distinct_closed_hours<1||
     item.distinct_closed_hours>item.observation_count))
   throw Error("données Spot non mesurées");
  if(item.distinct_closed_hours<=1&&item.change_between_observed_closes_pct!==null)
   throw Error("rendement inventé avec un seul point");
  if(item.change_between_observed_closes_pct!==null&&!Number.isFinite(item.change_between_observed_closes_pct))
   throw Error("rendement Spot invalide");
  if(item.ready_for_window_research===true&&
    !(item.distinct_closed_hours>=4&&item.span_between_closed_hours>=24))
   throw Error("fenêtre insuffisante");
  seen.add(item.coin_id);byId.set(item.coin_id,item);
 }
 return {byId,asOf:data.source_as_of_utc||null};
}
function spotComparisonLine(row){
 if(!row||!row.observation_count)return "Spot USDT : collecte future en attente";
 const view="Spot "+row.venue+" "+row.pair+" · "+number(row.market_price_usdt,6)+" USDT"+
  " · "+row.observation_count+" relevé(s), "+row.distinct_closed_hours+" clôture(s) distincte(s)"+
  " · 20 bougies horaires : "+(Number.isFinite(row.last_20h_closed_candle_change_pct)?pct(row.last_20h_closed_candle_change_pct):"inconnu")+
  " · spread "+number(row.last_spread_bps,2)+" pb";
 const actual=row.change_between_observed_closes_pct;
 const change=Number.isFinite(actual)?
   " · entre clôtures archivées : "+pct(actual)+" / "+number(row.span_between_closed_hours,2)+" h":
   " · variation entre relevés encore inconnue";
 return view+change+" · identité du contrat non certifiée · aucune exécution";
}

function printTrajectories(root,model){
 const list=lookup(root,"trajectoryRows"),note=lookup(root,"trajectoryNote");
 if(!list||!note)return;
 list.replaceChildren();
 const h=model.dynamicFollowups;
 if(!h){
  note.textContent=model.dynamicFollowupsError||"Trajectoires · chargement des preuves…";
  return;
 }
 const collected=h.dates.at(-1)||"—";
 note.textContent="Trajectoires Q / ICNT / FLUID · dernier jour archivé "+collected+
  " UTC · USD agrégé CoinGecko ≠ USDT Spot · aucun ordre";
 for(const focus of trajectoryFocus){
  const e=trajectoryEvidence(h,focus.id),row=node("div","radar-native-opportunity");
  row.dataset.radarTrajectoryId=focus.id;
  const measured=e.lastMeasured;
  const measure=measured?
    measured.label+" "+pct(measured.point.change_pct)+" / "+number(measured.point.elapsed_hours,2)+" h":
    "Pas de J+1/J+7 mesuré";
  const context=measured?
    "Détection "+measured.initial.first_seen_date_utc+" · "+trajectoryVolumeReadout(measured.initial,measured.point):
    (e.latestDate?"Dernière détection "+e.latestDate+" · relevés futurs attendus":"Identité non détectée dans ces archives");
  row.append(node("strong","",focus.symbol+" · "+e.status),
   node("span","",measure),
   node("small","",context),
   node("small","",e.selectionCount+" détection(s) · PAPER non certifié"));
  const spot=model.spotComparison?.byId?.get(focus.id);
  row.append(node("small","",spot?spotComparisonLine(spot):
    (model.spotComparisonError||"Spot USDT : aucun relevé certifié")));
  list.append(row);
 }
}

function printQualification(root,model){
 printTrajectories(root,model);
 const note=lookup(root,"qualificationNote"),list=lookup(root,"qualificationRows");
 const followNote=lookup(root,"followupNote");
 if(followNote){
  const h=model.dynamicFollowups;
  followNote.textContent=h?
   "Mémoire des candidats · "+h.count+" détections · "+h.measured_1d+" J+1 · "+h.measured_7d+
   " J+7 observés · dernières archives "+(h.dates.at(-1)||"—")+" UTC · prix agrégés USD, sans ordre":
   (model.dynamicFollowupsError||"Journal historique non encore chargé");
 }
 if(!note||!list)return;
 const expanded=new Set([...list.querySelectorAll("details[data-radar-candidate][open]")].map(x=>x.dataset.radarCandidate));
 list.replaceChildren();
 const q=model.qualification;
 if(!q){note.textContent=model.qualificationError||"Aucun rapport de qualification publié · aucune cible supposée";setFoldNote(root,"foldQualification","Source indisponible · aucune priorité");return;}
 if(q.schema!=="erith.radar.spot-qualification.v1"||q.quote!=="USDT"||
     !Array.isArray(q.candidates)||q.candidates.length!==20||
     !Array.isArray(q.priority_research_ids)||q.real_orders_enabled!==false||
     q.coin_id_matches_exchange_symbol_verified!==false){
  note.textContent="Contrat qualification invalide : aucune priorité affichée";setFoldNote(root,"foldQualification","Contrat invalide · aucune priorité");return;
 }
 const ms=Date.parse(q.qualified_at_utc);
 const stale=!Number.isFinite(ms)||Date.now()-ms>36*3600000||Date.now()<ms-5*60000;
 const chosen=new Set(q.priority_research_ids);
 const knowledge=matchedCandidateKnowledge(model.knowledge,q);
 note.textContent=(stale?"ARCHIVE PÉRIMÉE · aucune priorité actuelle":"Observation PAPER · aucune paire certifiée par identité de token")+
   " · relevé "+safeDate(q.qualified_at_utc)+" · "+q.markets_with_public_evidence+
   "/20 marchés documentés · frais hypothétiques 0,10 % par côté · panier fictif 100 USDT"+
   (knowledge?" · catégories documentaires consultables": " · fiches projet détaillées non chargées");
 setFoldNote(root,"foldQualification",(stale?"Archive périmée · ":"")+q.markets_with_public_evidence+
  "/20 Spot documentés · "+q.priority_research_ids.length+" études proposées · identité non certifiée");
 const ranked=[...q.candidates].sort((a,b)=>{
  const ap=chosen.has(a.id)?0:1,bp=chosen.has(b.id)?0:1;
  return ap-bp||(a.symbol||"").localeCompare(b.symbol||"");
 });
 for(const item of ranked){
  const qualified=item.status==="RESEARCH_DATA_QUALIFIED_IDENTITY_REVIEW"&&item.market;
  const priority=!stale&&qualified&&chosen.has(item.id);
  const m=qualified?item.market:null,doc=knowledge?.get(item.id);
  const row=node("details","radar-native-candidate");
  row.dataset.radarCandidate=item.id;
  row.open=expanded.has(item.id);
  const head=node("summary","radar-native-opportunity radar-native-candidate-summary");
  const identity=node("span","radar-native-candidate-identity");
  identity.append(node("strong","",item.symbol+" · "+item.name));
  if(doc)identity.append(node("small","",doc.category_research));
  head.append(identity,
    node("span","",priority?"RECHERCHE PRIORITAIRE · datée":qualified?"Marché documenté · identité à vérifier":"Paire Spot non qualifiée"),
    node("small","",m?m.provider+" · "+m.pair+" · "+number(m.book?.spread_bps,2)+" pb":"Aucun carnet Spot identifié"),
    node("small","",pct(item.change24h_pct)+" / 24 h · "+pct(item.change7d_pct)+" / 7 j"));
  row.append(head);
  const more=node("div","radar-native-candidate-more");
  const source=node("p","radar-native-candidate-source","Relevé "+safeDate(q.qualified_at_utc)+" · classement transversal et marché Spot non synchronisés · lecture seule");
  more.append(source);
  const add=(label,value)=>{
   const p=node("p","");
   p.append(node("strong","",label+" : "),node("span","",value));
   more.append(p);
  };
  add("Rang / volume au relevé",(Number.isFinite(item.rank)?String(item.rank):"—")+" · volume "+compactMoney(item.aggregated_volume24h_usd));
  // Only the exact CoinGecko identifier joins the independent historical archive.
  const history=dynamicCandidateHistory(model.dynamicFollowups,item.id);
  if(history.length){
   for(const observation of history.slice(0,3)){
    add("Mémoire "+observation.first_seen_date_utc,
      "Détection "+displayPrice(observation.initial_price_usd)+" USD · J+1 : "+
       describeDynamicPoint(observation.followup_1d)+" · J+7 : "+
       describeDynamicPoint(observation.followup_7d));
   }
  }else add("Mémoire historique","Aucune détection datée conservée pour cette identité CoinGecko ; résultat inconnu");
  // Do not confuse a source's description of a service with independent adoption.
  add("Projet déclaré",doc?.claimed_function||"Description documentée non chargée ; voir les dossiers IA");
  add("Preuve d'usage réel",doc?.independent_usage_metrics===null?"Aucune métrique d'adoption indépendante établie dans ce dossier":"À vérifier dans les dossiers IA");
  add("Marché observé",m?m.provider+" Spot "+m.pair+" · "+(m.candles?.closed_bars??"—")+" bougies horaires closes · spread "+number(m.book?.spread_bps,2)+" pb":
      (item.errors||[]).slice(0,2).join(" · ")||"Aucune paire et aucun carnet vérifiés");
  add("Coût PAPER",m?number(m.estimated_roundtrip_cost_pct,3)+" % aller-retour théorique pour 100 USDT ; frais hypothétiques":"Impossible sans paire Spot documentée");
  add("Vérification suivante",doc?.required_next_verification||"Identité du token, carnet et preuve d'usage indépendants à recueillir");
  const links=node("p","radar-native-candidate-links");
  const dossier=node("a","","Fiche projet détaillée ↗");dossier.href="https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/laboratoire/crypto-knowledge.html";
  dossier.target="_blank";dossier.rel="noopener noreferrer";links.append(dossier);
  if(doc?.primary_project_source&&/^https:\/\//i.test(doc.primary_project_source)){
   const official=node("a",""," · Source primaire ↗");official.href=doc.primary_project_source;
   official.target="_blank";official.rel="noopener noreferrer";links.append(official);
  }
  if(item.id==="quack-ai"){
   const link=node("a",""," · Étude PAPER Q ↗");
   link.href=new URL("../trader/quack-ai-case-study.html",document.baseURI).href;
   link.target="_blank";link.rel="noopener noreferrer";links.append(link);
  }
  more.append(links,node("p","radar-native-candidate-warning",
   "Identité token ↔ paire CEX NON CERTIFIÉE · USDT ≠ USDC ≠ USD · aucun ordre ni rendement garanti"));
  row.append(more);list.append(row);
 }
}
// Use the exact same public archive validator as standalone Radar.
// Never create a second market owner, chart, order or live data transport.
function describeOkxHourly(report){
 if(!report)return "Bilan OKX horaire indisponible · rien à reconstituer.";
 return report.pairs.length+" paires Spot · "+report.observedHours+" heure(s) vérifiée(s) · "+
   report.withTrend+" évolution(s) décrite(s) · "+
   (report.stale?"ARCHIVE DIFFÉRÉE":"Archive publique datée")+
   " · "+safeDate(report.asOf)+" · pas de signal d'achat.";
}
function printOkxHourly(root,model){
 const note=lookup(root,"okxHourlyNote");
 const rows=lookup(root,"okxHourlyRows");
 if(!note||!rows)return;
 const report=model.okxHourly;
 note.textContent=report?describeOkxHourly(report):
   model.okxHourlyError||"Bilan OKX non encore publié.";
 setFoldNote(root,"foldOkxHourly",report?
   report.pairs.length+" paires · "+report.observedHours+" heure(s) · "+
   (report.stale?"archive différée":"aucun ordre"):
   "Source indisponible · aucune preuve inventée");
 rows.replaceChildren();
 if(!report)return;
 for(const p of report.pairs){
   const tr=node("tr");
   for(const v of [
     p.pair,String(p.observations),
     number(p.mid,8)+" "+p.quote,number(p.spreadBps)+" pb",
     number(p.bidDepth)+" "+p.quote,number(p.askDepth)+" "+p.quote,
     p.change===null?"— (1 heure)":pct(p.change)
   ])cell(tr,v);
   rows.appendChild(tr);
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
 const qualificationPromise=get("https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/data/crypto/radar-opportunities/qualification-latest.json");
 const knowledgePromise=get("https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/data/crypto/research/asset-knowledge.json");
 const dynamicPromise=get("https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/data/crypto/radar-opportunities/dynamic-followups.json");
 const spotComparisonPromise=get("https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/data/trader_flux/radar_priority_spot/comparison.json");
 // Read GitHub public archive once per normal Radar refresh, without OKX API.
 const okxHourlyPromise=get("../data/crypto/okx-hourly/research-latest.json");
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
  model.qualification=null;model.knowledge=null;model.qualificationError="Qualification Spot · chargement…";
  model.dynamicFollowups=null;model.dynamicFollowupsError="Suivi historique · chargement…";
  model.spotComparison=null;model.spotComparisonError="Spot USDT · rapport en attente";
  model.okxHourly=null;model.okxHourlyError="Coffre OKX · relevé daté en cours de lecture…";
  printOkxHourly(root,model);
  void okxHourlyPromise.then(data=>{
    const reader=global.AgentCryptoRadarOkxHourly;
    if(typeof reader?.valid!=="function")throw Error("Validateur public OKX indisponible");
    model.okxHourly=reader.valid(data,Date.now());
    model.okxHourlyError="";
    printOkxHourly(root,model);
  }).catch(error=>{
    model.okxHourly=null;
    model.okxHourlyError="Archives OKX non vérifiées : "+String(error?.message||error);
    printOkxHourly(root,model);
  });
  printQualification(root,model);
  printMarket(root,model);
  printWatch(root,model);
  printListings(root,model);printOpportunities(root,model);printResearchLists(root,model);
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
   if(model.opportunities.status==="MIXED_SNAPSHOT_BOUNDARY")
    issues.push("Top 1 000 : MIXED_SNAPSHOT_BOUNDARY · "+
     model.opportunities.universe+" IDs distincts sur "+
     model.opportunities.observedRows+" lignes · "+
     model.opportunities.boundaryOverlaps.map(x=>x.symbol+
      " aux rangs "+x.core.rank+"/"+x.extended.rank).join(", ")+
     " · sources horodatées séparément");
  }catch(e){model.opportunities=null;model.opportunityError="Top 1 000 : "+e.message;issues.push(model.opportunityError);}
  printOpportunities(root,model);printResearchLists(root,model);
  // Both public reads run in parallel; failing research enrichment cannot hide Spot results.
  const enrichment=await Promise.allSettled([qualificationPromise,knowledgePromise,dynamicPromise,spotComparisonPromise]);
  if(enrichment[0].status==="fulfilled"){
   model.qualification=enrichment[0].value;model.qualificationError="";
  }else{
   model.qualification=null;model.qualificationError="Qualification Spot non publiée : "+String(enrichment[0].reason);
  }
  model.knowledge=enrichment[1].status==="fulfilled"?enrichment[1].value:null;
  try{
   if(enrichment[2].status!=="fulfilled")throw Error("source GitHub RAW indisponible");
   model.dynamicFollowups=verifiedDynamicFollowups(enrichment[2].value);
   model.dynamicFollowupsError="";
  }catch(e){
   model.dynamicFollowups=null;
   model.dynamicFollowupsError="Historique non certifié : "+String(e?.message||e);
  }
  try{
   if(enrichment[3].status!=="fulfilled")throw Error("rapport Spot absent");
   model.spotComparison=verifyProspectiveSpotComparison(enrichment[3].value);
   model.spotComparisonError="";
  }catch(e){
   model.spotComparison=null;
   model.spotComparisonError="Spot USDT : "+String(e?.message||e);
  }
  printQualification(root,model);
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
 module.exports=Object.freeze({selectGraph,compactMoney,printMarket,openOpportunityFiche,matchedCandidateKnowledge,verifiedDynamicFollowups,dynamicCandidateHistory,describeDynamicPoint,trajectoryEvidence,trajectoryVolumeReadout,verifyProspectiveSpotComparison,spotComparisonLine,printTrajectories,printQualification,describeOkxHourly,printOkxHourly});
global.AgentCryptoRadarNative=Object.freeze({mount});
})(typeof globalThis!=="undefined"?globalThis:this);
