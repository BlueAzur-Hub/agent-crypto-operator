/* ERITH.IA · LAB PAPER : l'interface lit les propriétaires graphiques existants. */
(()=>{
"use strict";
const core=globalThis.AgentCryptoPaperLabCore;
if(!core||typeof document==="undefined")return;
const ID="traderPaperLab",captures=new Map(),positions=new Map(),journal=[];
const automaticPositions=new Map(),automaticLastAt=new Map();
const AUTO_GAP_MS=5*60*1000,AUTO_LIMIT=20;
let automatic=false,automaticCount=0;
const qs=key=>document.getElementById(ID)?.querySelector("[data-lab-"+key+"]");
const show=(key,value)=>{const node=qs(key);if(node)node.textContent=String(value??"—")};
const safe=fn=>{try{return fn()}catch(_){return null}};
const parse=value=>{const n=Number(String(value??"").replace(",","."));return Number.isFinite(n)?n:NaN};
const fmt=(value,d=6)=>Number.isFinite(value)?value.toLocaleString("fr-FR",{maximumFractionDigits:d}):"—";
function source(){
  const ext=safe(()=>globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.());
  if(ext?.active){
    const row=safe(()=>globalThis.AgentCryptoNewListingsNativeCategory?.mathSeriesSnapshot?.());
    if(!row)return {reason:"CT : ligne native non chargée ou non qualifiée"};
    return {input:{asset:"CT",instrument:row.instrument,provider:row.provider,
      currency:row.currency,source:row.source,series:row.series}};
  }
  const coin=safe(()=>globalThis.getSelectedCoin?.());
  if(coin?.id!=="bitcoin"||String(coin.symbol||"").toUpperCase()!=="BTC")
    return {reason:"Sélectionne BTC Solo 24h USD, ou CT dans Nouveaux listings."};
  const ch=safe(()=>typeof state!=="undefined"?state?.dataBroker?.chart:null);
  if(ch?.status!=="ready"||ch.coinId!=="bitcoin"||ch.period!==1||
     ch.contextKey!=="single:bitcoin:1:USD"||ch.result?.blocked)
    return {reason:"BTC : série 24h USD du graphique non prête."};
  const r=ch.result;
  if(r.currency!=="USD"||!/coingecko/i.test(String(r.source||"")+" "+String(r.sourceFamily||"")))
    return {reason:"BTC : série USD CoinGecko sans provenance suffisante."};
  return {input:{asset:"BTC",instrument:"BTC-USD",provider:"coingecko",
    currency:"USD",source:r.source,series:r.series}};
}
function assumptions(){
  const out={};
  for(const key of ["capital","entryFeePct","exitFeePct","spreadPct","slippagePct"])
    out[key]=parse(qs(key)?.value);
  return out;
}
function refresh(){
  show("observations",["BTC","CT"].map(a=>{
    const c=captures.get(a);
    return a+": "+(c?fmt(c.price,a==="BTC"?2:8)+" USD · "+
      c.points+" points · "+c.source+" · "+new Date(c.lastAt).toLocaleString("fr-FR")
      :"aucune observation");
  }).join("\n"));
  const manual=positions.size?[...positions.values()].map(p=>p.entry.asset+
    " · "+fmt(p.entry.price,8)+" USD · "+p.entry.lastAt):[];
  const auto=[...automaticPositions.values()].map(p=>p.entry.asset+
    " · AUTO · "+fmt(p.entry.price,8)+" USD · "+p.entry.lastAt);
  show("open",manual.concat(auto).join("\n")||"Aucune");
  show("journal",journal.length?journal.map(j=>j.at+" · "+j.kind+" · "+j.asset+
    (j.result?" · "+fmt(j.result.paperProfit,6)+" USD papier":"")).join("\n"):"Journal vide (session volatile)");
}
function take(){
  const s=source();
  if(!s.input){show("status",s.reason);return null;}
  const c=core.qualify(s.input);
  if(!c.ok){show("status",c.reason);return null;}
  captures.set(c.asset,c);
  show("status","Observation "+c.asset+" qualifiée · "+c.points+
    " points · "+c.source+" · "+Math.round(c.ageMs/1000)+" s de décalage.");
  refresh();return c;
}
function simulate(){
  const c=take();if(!c)return null;
  const p=core.assess({...assumptions(),price:c.price});
  if(!p.ok){show("status",p.reason);return null;}
  show("result","Prix observé "+c.asset+" : "+fmt(c.price,8)+" USD\n"+
    "Capital "+fmt(p.capital,2)+" USD papier ; quantité fictive "+fmt(p.quantity,9)+" "+c.asset+
    "\nFrais entrée/sortie "+fmt(p.entryFeePct,2)+"/"+fmt(p.exitFeePct,2)+" %"+
    " ; spread "+fmt(p.spreadPct,2)+" % ; glissement / côté "+fmt(p.slippagePct,2)+" %"+
    "\nPoint mort après coûts : hausse de "+fmt(p.breakEvenMovePct,3)+" %"+
    "\n"+p.scenarios.map(r=>(r.movePct>0?"+":"")+r.movePct+" % de cours → "+
      (r.profit>0?"+":"")+fmt(r.profit,6)+" USD papier ("+fmt(r.returnPct,2)+" %)").join("\n")+
    "\nPas de contrôle de carnet ou minimum d'ordre ; pas de prédiction.");
  return p;
}
function add(kind,asset,more={}){
  journal.push({at:new Date().toISOString(),kind,asset,...more});
  if(journal.length>30)journal.shift();
}
function begin(){
  const c=take();if(!c)return;
  const p=core.assess({...assumptions(),price:c.price});
  if(!p.ok){show("status",p.reason);return;}
  if(positions.has(c.asset)){show("status","Expérience PAPER "+c.asset+" déjà ouverte.");return;}
  positions.set(c.asset,{entry:c,config:assumptions()});
  add("OUVERTURE_PAPER",c.asset,{entryAt:c.lastAt,source:c.source});
  show("status","Départ PAPER "+c.asset+" enregistré. Comparer après une nouvelle cotation.");
  refresh();
}
function finish(){
  const c=take();if(!c)return;
  const p=positions.get(c.asset);
  if(!p){show("status","Aucune entrée PAPER ouverte pour "+c.asset);return;}
  const r=core.prospective(p.entry,c,p.config);
  if(!r.ok){show("status",r.reason);return;}
  positions.delete(c.asset);
  add("EVALUATION_PAPER",c.asset,{result:r});
  show("result","Évaluation PAPER "+c.asset+" · cours "+fmt(r.movePct,3)+" %"+
    " · résultat "+(r.paperProfit>0?"+":"")+fmt(r.paperProfit,6)+
    " USD fictifs ; ni ordre, ni gain réel.");
  show("status","Comparaison prospective réalisée sur deux relevés publics datés.");
  refresh();
}
// Opt-in automatic observation: triggered only by canonical already-loaded
// chart events; no timer, HTTP, strategy gate, balance or exchange action.
function automaticTick(){
  if(!automatic||automaticCount>=AUTO_LIMIT)return null;
  const v=source();
  if(!v.input)return null;
  const c=core.qualify(v.input);
  if(!c.ok)return null;
  const at=Date.parse(c.lastAt),old=automaticLastAt.get(c.asset)||0;
  if(at<=old||!Number.isFinite(at))return null;
  const plan=core.assess({...assumptions(),price:c.price});
  if(!plan.ok){show("status",plan.reason);return null;}
  const running=automaticPositions.get(c.asset);
  if(running){
    if(at-Date.parse(running.entry.lastAt)<AUTO_GAP_MS)return null;
    const value=core.prospective(running.entry,c,running.config);
    if(!value.ok){show("status","Auto PAPER : "+value.reason);return null;}
    automaticPositions.delete(c.asset);
    automaticLastAt.set(c.asset,at);
    automaticCount++;
    add("AUTO_EVALUATION_PAPER",c.asset,{result:value});
    show("result","AUTO PAPER "+c.asset+" · variation "+fmt(value.movePct,3)+
      " % · "+(value.paperProfit>0?"+":"")+fmt(value.paperProfit,6)+
      " USD fictifs sur "+fmt(value.capital,2)+" USD. Pas d'ordre réel.");
  }else{
    automaticLastAt.set(c.asset,at);
    automaticCount++;
    automaticPositions.set(c.asset,{entry:c,config:assumptions()});
    add("AUTO_DEPART_PAPER",c.asset,{entryAt:c.lastAt,source:c.source});
    show("result","AUTO PAPER "+c.asset+" · source qualifiée "+c.source+
      "\nCours "+fmt(c.price,8)+" USD · coût simulé ; point mort +"+
      fmt(plan.breakEvenMovePct,3)+" % · scénarios −5/0/+5 % : "+
      plan.scenarios.map(r=>fmt(r.profit,5)+" USD").join(" / ")+
      "\nNouvelle observation nécessaire pour mesurer le résultat.");
  }
  captures.set(c.asset,c);
  show("status","Auto PAPER actif · "+automaticCount+"/"+AUTO_LIMIT+
    " observations · "+c.asset+" · "+new Date(at).toLocaleString("fr-FR")+
    " · uniquement lors des mises à jour réelles du graphique.");
  if(automaticCount>=AUTO_LIMIT){automatic=false;show("status","Auto PAPER arrêté : limite de 20 observations atteinte.");}
  refresh();return c;
}
function setAutomatic(enabled){
  automatic=Boolean(enabled)&&automaticCount<AUTO_LIMIT;
  const btn=qs("auto");
  if(btn){btn.textContent=automatic?"Arrêter Auto PAPER":"Démarrer Auto PAPER";
    btn.setAttribute("aria-pressed",String(automatic));}
  show("status",automatic?
    "Auto PAPER actif uniquement dans cet onglet : attend les nouveaux cours BTC/CT déjà chargés.":
    "Auto PAPER arrêté, journal conservé seulement dans cet onglet.");
  if(automatic)automaticTick();
}
function mount(){
  if(document.getElementById(ID))return true;
  const zone=document.getElementById("market-zone");if(!zone)return false;
  const style=document.createElement("style");style.id="traderPaperLabStyle";
  style.textContent="#traderPaperLab{grid-column:1/-1;display:block;margin:12px 0 28px;background:#081d2a;color:#e2f5f0;border:1px solid #427781;border-radius:12px;font:13px/1.5 system-ui,sans-serif;overflow:hidden}"+
    "#traderPaperLab summary{padding:14px;color:#e8d5a4;font-weight:750;cursor:pointer;background:#092b3a}"+
    "#traderPaperLab .pl-body{padding:14px}#traderPaperLab .pl-fields{display:flex;flex-wrap:wrap;gap:12px}"+
    "#traderPaperLab label{display:grid;gap:4px;font-size:12px}#traderPaperLab input{width:135px;background:#031622;color:white;border:1px solid #416d76;padding:7px;border-radius:6px}"+
    "#traderPaperLab button{margin:8px 5px 5px 0;padding:8px 11px;background:#155266;color:#eaffff;border:1px solid #3b9bab;border-radius:8px;cursor:pointer}"+
    "#traderPaperLab pre{white-space:pre-wrap;overflow-wrap:anywhere;padding:10px;background:#041723;border:1px solid #284c59;border-radius:7px;color:#d3f9eb}"+
    "#traderPaperLab [data-lab-status]{color:#e3cf91}";
  document.head.appendChild(style);
  const node=document.createElement("details");node.id=ID;
  node.innerHTML=[
    '<summary>LABORATOIRE PAPER · BTC / CT · calculs après coûts · aucun ordre</summary>',
    '<div class="pl-body"><p>Choisir BTC Solo 24h USD ou CT dans Nouveaux listings. Les deux cas sont capturés séparément depuis les propriétaires graphiques existants.</p>',
    '<div class="pl-fields">',
    '<label>Capital USD fictif<input data-lab-capital value="5" inputmode="decimal"></label>',
    '<label>Frais achat (%)<input data-lab-entryFeePct value="0,2" inputmode="decimal"></label>',
    '<label>Frais vente (%)<input data-lab-exitFeePct value="0,2" inputmode="decimal"></label>',
    '<label>Spread total (%)<input data-lab-spreadPct value="0,1" inputmode="decimal"></label>',
    '<label>Glissement par côté (%)<input data-lab-slippagePct value="0,1" inputmode="decimal"></label>',
    '</div><p>Hypothèses ajustables, PAS les coûts OKX certifiés. USD notionnels : ni USD ni USDT ne sont traités automatiquement comme des USDC. Minimums et profondeur non évalués.</p>',
    '<button type="button" data-lab-capture>Capturer la source</button>',
    '<button type="button" data-lab-simulate>Simuler −5 / 0 / +5 %</button>',
    '<button type="button" data-lab-begin>Ouvrir scénario prospectif</button>',
    '<button type="button" data-lab-finish>Évaluer sur un nouveau relevé</button>',
    '<button type="button" data-lab-auto aria-pressed="false">Démarrer Auto PAPER</button>',
    '<button type="button" data-lab-copy>Copier le journal</button>',
    '<p role="status" data-lab-status>En attente d’une capture volontaire.</p>',
    '<h4>Observations BTC / CT</h4><pre data-lab-observations></pre>',
    '<h4>Résultat</h4><pre data-lab-result>Pas de valeur inventée.</pre>',
    '<h4>Observations PAPER ouvertes</h4><pre data-lab-open></pre>',
    '<h4>Journal prospectif · session seulement</h4><pre data-lab-journal></pre>',
    '<p>Auto PAPER (facultatif) : écoute uniquement les nouveaux événements du graphique BTC ou CT déjà sélectionné, sans relancer les marchés. Mesure prospective après ≥5 min de nouvelle donnée, avec un maximum de 20 observations ; s’arrête lors du rechargement ou de la fermeture. Les deux actifs ne sont pas suivis simultanément sans séries réellement publiées. Aucun fetch nouveau, aucun ordre OKX, aucune sauvegarde automatique, aucune promotion des gates Strategy A.</p></div>'
  ].join("");
  zone.appendChild(node);

  // Operator Yoann: the same *handoff slot* as MASTER, not a Docker site,
  // duplicated Trader, bridge, account connection or an automatic merge.
  if(!document.getElementById("traderYoannOperatorSection")){
    const operator=document.createElement("details");
    operator.id="traderYoannOperatorSection";
    operator.open=true;
    operator.style.cssText="grid-column:1/-1;display:block;margin:16px 0 28px;padding:12px 16px;border:1px solid #336476;border-radius:12px;background:#0b2232;color:#dfedf3;font:13px/1.5 system-ui,sans-serif";
    operator.innerHTML=[
      '<summary style="cursor:pointer;font-weight:750;color:#efcf88">OPERATOR · YOANN — Développements indépendants et passerelle future</summary>',
      '<div style="padding:12px 4px 4px">',
      '<p>Emplacement de liaison dans le Trader Operator existant : <strong>pas un second Trader</strong> et <strong>pas un atelier Docker</strong>. Yoann développe et conserve ses travaux dans son dépôt privé. L’Administrator MASTER ne récupère que des modules compatibles, après revue et tests.</p>',
      '<p><strong>Développement source :</strong> <a href="https://github.com/malabaryo/tradus/tree/main/public/agent_crypto_erith_ia" target="_blank" rel="noopener noreferrer">malabaryo/tradus · privé ↗</a></p>',
      '<p><strong>Code Trader Yoann :</strong> <a href="https://github.com/malabaryo/tradus/blob/main/public/agent_crypto_erith_ia/trader/trading-desk.html" target="_blank" rel="noopener noreferrer">Trader dans le privé ↗</a></p>',
      '<p><strong>Rendu public Operator :</strong> <a href="https://blueazur-hub.github.io/agent-crypto-operator/public/agent_crypto_erith_ia/trader/trading-desk.html" target="_blank" rel="noopener noreferrer">Ouvrir son Trader ↗</a></p>',
      '<p><strong>Passerelle MASTER :</strong> <a href="https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/public/agent_crypto_erith_ia/trader" target="_blank" rel="noopener noreferrer">Trader Administrator ↗</a></p>',
      '<p><strong>Règles :</strong> pas de copie de comptes, clés, Bridge, données privées ou privilèges Administrator. Jamais de fusion automatique. Ne transférer vers le dépôt public que les dépendances Web nécessaires, après inventaire des liens et validation ; ne rien supprimer du privé de Yoann.</p>',
      '<p>Les travaux compatibles seront examinés ici en lecture seule puis proposés au MASTER par PR contrôlée. Aucun ordre et aucun appel au PC d’un autre utilisateur.</p>',
      '</div>'
    ].join("");
    node.insertAdjacentElement("afterend",operator);
  }
  for(const [key,fn] of [["capture",take],["simulate",simulate],["begin",begin],["finish",finish]])
    qs(key)?.addEventListener("click",fn);
  qs("auto")?.addEventListener("click",()=>setAutomatic(!automatic));
  for(const event of ["agent-crypto:new-listing-line-ready",
    "agent-crypto:graph-context-ready","agent-crypto:workspace-restored",
    "agent-crypto:selected-market-changed"]){
    globalThis.addEventListener(event,automaticTick,{passive:true});
  }
  qs("copy")?.addEventListener("click",async()=>{
    try{await navigator.clipboard.writeText(JSON.stringify({paper:true,realOrders:false,events:journal},null,2));
      show("status","Journal PAPER copié localement. Aucun envoi.");}
    catch(_){show("status","Copie refusée par Firefox ; aucune donnée transmise.");}
  });
  node.addEventListener("toggle",()=>{if(node.open)refresh()});
  refresh();return true;
}
globalThis.AgentCryptoTraderPaperLab=Object.freeze({mount,take,simulate,begin,finish,source,
  snapshot:()=>({captured:[...captures.keys()],open:[...positions.keys()],
    autoOpen:[...automaticPositions.keys()],autoActive:automatic,
    autoCount:automaticCount,autoLimit:AUTO_LIMIT,
    journalCount:journal.length,realOrders:false,network:false,storage:false}),
  realOrders:false,network:false,storage:false,bridge:false,readOnly:true});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
else mount();
})();
