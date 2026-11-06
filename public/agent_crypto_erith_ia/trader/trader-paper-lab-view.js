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
  const coinId=String(coin?.id||"");
  const symbol=String(coin?.symbol||"").toUpperCase();
  if(!/^[a-z0-9][a-z0-9-]{1,99}$/.test(coinId)||!/^[A-Z0-9]{1,20}$/.test(symbol)||
     symbol==="CT"||(symbol==="BTC"&&coinId!=="bitcoin"))
    return {reason:"Sélectionne un actif Market Core en Solo 24h USD, ou CT dans Nouveaux listings."};
  const ch=safe(()=>typeof state!=="undefined"?state?.dataBroker?.chart:null);
  if(ch?.status!=="ready"||ch.coinId!==coinId||ch.period!==1||
     ch.contextKey!=="single:"+coinId+":1:USD"||ch.result?.blocked)
    return {reason:symbol+" : graphique Solo 24h USD non prêt ou sélection différente."};
  const r=ch.result;
  if(r.currency!=="USD"||!/coingecko/i.test(String(r.source||"")+" "+String(r.sourceFamily||""))||
     (r.coinId!==undefined&&r.coinId!==coinId))
    return {reason:symbol+" : série USD CoinGecko directe sans provenance suffisante."};
  return {input:{asset:symbol,coinId,instrument:symbol+"-USD",provider:"coingecko",
    currency:"USD",source:r.source,series:r.series}};
}
function assumptions(){
  const out={};
  for(const key of ["capital","entryFeePct","exitFeePct","spreadPct","slippagePct"])
    out[key]=parse(qs(key)?.value);
  return out;
}
function refresh(){
  show("observations",[...captures.values()].map(c=>
    c.asset+(c.coinId?" ("+c.coinId+")":"")+": "+fmt(c.price,c.asset==="BTC"?2:8)+
    " USD · "+c.points+" points · "+c.source+" · "+new Date(c.lastAt).toLocaleString("fr-FR")
  ).join("\n")||"Aucune observation qualifiée");
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
  captures.set(c.sourceIdentity,c);
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
function studyNow(){
  const v=source();
  if(!v.input){show("status",v.reason);return;}
  const result=core.historicalStudy(v.input,assumptions());
  if(!result.ok){show("status",result.reason);return;}
  const p=result;
  show("result","ÉTUDE RÉTROSPECTIVE · "+p.asset+" · 24 h observées\n"+
    p.windows+" fenêtres de 60 min (chevauchantes) · "+
    fmt(p.profitablePct,1)+" % positives après coûts fictifs.\n"+
    "Résultat médian : "+(p.medianProfit>=0?"+":"")+fmt(p.medianProfit,5)+
    " USD fictifs par fenêtre de "+fmt(p.capital,2)+" USD.\n"+
    "Meilleure : "+(p.bestProfit>=0?"+":"")+fmt(p.bestProfit,5)+
    " USD ; pire : "+fmt(p.worstProfit,5)+" USD.\n"+
    "Données du "+new Date(p.firstAt).toLocaleString("fr-FR")+" au "+
      new Date(p.lastAt).toLocaleString("fr-FR")+
    ". Chaque fenêtre est indépendante et chevauche les autres ; "+
    "ce N'EST ni un bénéfice total, ni une stratégie validée, ni une prévision.");
  show("status","Étude historique immédiate terminée sur "+p.asset+
    ". Aucun ordre, aucun suivi réel ; le cours futur reste inconnu.");
  add("ETUDE_RETROSPECTIVE",p.asset,{windows:p.windows,medianProfit:p.medianProfit,
     profitablePct:p.profitablePct,retrospective:true});
  refresh();
  return result;
}
function add(kind,asset,more={}){
  journal.push({at:new Date().toISOString(),kind,asset,...more});
  if(journal.length>30)journal.shift();
}
function begin(){
  const c=take();if(!c)return;
  const p=core.assess({...assumptions(),price:c.price});
  if(!p.ok){show("status",p.reason);return;}
  if(positions.has(c.sourceIdentity)){show("status","Expérience PAPER "+c.asset+" déjà ouverte.");return;}
  if(positions.size>=12){show("status","12 expériences manuelles simultanées maximum ; termine une position avant d’en ouvrir une autre.");return;}
  positions.set(c.sourceIdentity,{entry:c,config:assumptions(),follow:true});
  add("OUVERTURE_PAPER",c.asset,{entryAt:c.lastAt,source:c.source});
  show("status","Suivi PAPER "+c.asset+" ouvert. Aucun clic de clôture nécessaire : "+
    "évaluation automatique si le graphique fournit une nouvelle observation datée après au moins 5 min.");
  show("follow","SUIVI ACTIF · "+c.asset+" · entrée "+new Date(c.lastAt).toLocaleString("fr-FR")+
    " · attente d’un nouvel historique vérifié (≥ 5 min après l’entrée). "+
    "Si le graphique ne s’actualise pas, le suivi reste en attente. Aucun ordre réel.");
  refresh();
}
function finish(){
  const c=take();if(!c)return;
  const p=positions.get(c.sourceIdentity);
  if(!p){show("status","Aucune entrée PAPER ouverte pour "+c.asset);return;}
  const r=core.prospective(p.entry,c,p.config);
  if(!r.ok){show("status",r.reason);return;}
  positions.delete(c.sourceIdentity);
  add("EVALUATION_PAPER",c.asset,{result:r});
  show("result","Évaluation PAPER "+c.asset+" · cours "+fmt(r.movePct,3)+" %"+
    " · résultat "+(r.paperProfit>0?"+":"")+fmt(r.paperProfit,6)+
    " USD fictifs ; ni ordre, ni gain réel.");
  show("status","Comparaison prospective réalisée sur deux relevés publics datés.");
  show("follow","TERMINÉ · "+c.asset+" · variation "+fmt(r.movePct,2)+" %"+
    " · P&L PAPER "+(r.paperProfit>=0?"+":"")+fmt(r.paperProfit,5)+" USD fictifs.");
  refresh();
}
// A manual one-click PAPER watch is evaluated only when its owning chart
// delivers a newer qualified observation. Never fetch data or place an order.
function watchTick(){
  if(!positions.size)return null;
  const v=source();
  if(!v.input)return null;
  const c=core.qualify(v.input);
  if(!c.ok)return null;
  const item=positions.get(c.sourceIdentity);
  if(!item?.follow)return null;
  const start=Date.parse(item.entry.lastAt),end=Date.parse(c.lastAt);
  if(!Number.isFinite(end)||end<=start||end-start<AUTO_GAP_MS)return null;
  const result=core.prospective(item.entry,c,item.config);
  if(!result.ok){
    show("follow","SUIVI PAPER · "+c.asset+" : "+result.reason+
      " · aucune évaluation effectuée.");
    return null;
  }
  positions.delete(c.sourceIdentity);
  captures.set(c.sourceIdentity,c);
  add("SUIVI_EVALUE_PAPER",c.asset,{result});
  show("result","SUIVI PROSPECTIF · "+c.asset+"\n"+
    "Entrée : "+new Date(result.entryAt).toLocaleString("fr-FR")+
    " à "+fmt(result.entryPrice,8)+" USD ; sortie théorique : "+
    new Date(result.exitAt).toLocaleString("fr-FR")+" à "+
    fmt(result.exitPrice,8)+" USD.\n"+
    "Évolution du cours : "+(result.movePct>=0?"+":"")+fmt(result.movePct,3)+
    " % ; résultat après coûts fictifs : "+
    (result.paperProfit>=0?"+":"")+fmt(result.paperProfit,5)+" USD.\n"+
    "Aucun achat ou vente réel ; relevés historiques publics, carnet et minimum non évalués.");
  show("follow","TERMINÉ · "+c.asset+" · "+(result.paperProfit>=0?"+":"")+
    fmt(result.paperProfit,5)+" USD PAPER après hypothèses de coûts.");
  show("status","Le nouveau relevé "+c.asset+" a été évalué automatiquement. "+
    "Tu peux consulter une autre crypto ou démarrer un nouveau suivi.");
  refresh();
  return result;
}
function stopWatch(){
  const v=source(),id=v.input?.asset,found=[...positions].find(([,p])=>
    p.follow&&p.entry.asset===id);
  if(!found){show("status","Aucun suivi PAPER actif pour l’actif sélectionné.");return;}
  positions.delete(found[0]);
  add("SUIVI_ANNULE_PAPER",found[1].entry.asset,{reason:"human_cancel"});
  show("follow","ANNULÉ · "+id+" · aucune opération exécutée.");
  show("status","Suivi "+id+" annulé, journal conservé dans cet onglet.");
  refresh();
}
function onChartUpdate(){
  watchTick();
  automaticTick();
}
// Opt-in automatic observation: triggered only by canonical already-loaded
// chart events; no timer, HTTP, strategy gate, balance or exchange action.
function automaticTick(){
  if(!automatic||automaticCount>=AUTO_LIMIT)return null;
  const v=source();
  if(!v.input)return null;
  const c=core.qualify(v.input);
  if(!c.ok)return null;
  const at=Date.parse(c.lastAt),old=automaticLastAt.get(c.sourceIdentity)||0;
  if(at<=old||!Number.isFinite(at))return null;
  const plan=core.assess({...assumptions(),price:c.price});
  if(!plan.ok){show("status",plan.reason);return null;}
  const running=automaticPositions.get(c.sourceIdentity);
  if(running){
    if(at-Date.parse(running.entry.lastAt)<AUTO_GAP_MS)return null;
    const value=core.prospective(running.entry,c,running.config);
    if(!value.ok){show("status","Auto PAPER : "+value.reason);return null;}
    automaticPositions.delete(c.sourceIdentity);
    automaticLastAt.set(c.sourceIdentity,at);
    automaticCount++;
    add("AUTO_EVALUATION_PAPER",c.asset,{result:value});
    show("result","AUTO PAPER "+c.asset+" · variation "+fmt(value.movePct,3)+
      " % · "+(value.paperProfit>0?"+":"")+fmt(value.paperProfit,6)+
      " USD fictifs sur "+fmt(value.capital,2)+" USD. Pas d'ordre réel.");
  }else{
    automaticLastAt.set(c.sourceIdentity,at);
    automaticCount++;
    automaticPositions.set(c.sourceIdentity,{entry:c,config:assumptions()});
    add("AUTO_DEPART_PAPER",c.asset,{entryAt:c.lastAt,source:c.source});
    show("result","AUTO PAPER "+c.asset+" · source qualifiée "+c.source+
      "\nCours "+fmt(c.price,8)+" USD · coût simulé ; point mort +"+
      fmt(plan.breakEvenMovePct,3)+" % · scénarios −5/0/+5 % : "+
      plan.scenarios.map(r=>fmt(r.profit,5)+" USD").join(" / ")+
      "\nNouvelle observation nécessaire pour mesurer le résultat.");
  }
  captures.set(c.sourceIdentity,c);
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
    "Auto PAPER actif dans cet onglet : attend les nouvelles bougies qualifiées de l’actif sélectionné.":
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
    "#traderPaperLab [data-lab-status]{color:#e3cf91}"+
    "#traderPaperLab .pl-primary{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}"+
    "#traderPaperLab .pl-primary button{font-size:14px;font-weight:750;padding:11px 14px}"+
    "#traderPaperLab .pl-primary [data-lab-begin]{background:#116655;border-color:#39c7aa}"+
    "#traderPaperLab .pl-primary [data-lab-study]{background:#254e73;border-color:#82bad7}"+
    "#traderPaperLab .pl-primary [data-lab-stop]{background:#34363f;border-color:#6b7487}"+
    "#traderPaperLab [data-lab-follow]{padding:12px;border:1px solid #397987;border-radius:8px;background:#102e39;color:#b4ede2}"+
    "#traderPaperLab .pl-more{border:1px solid #285667;border-radius:8px;margin:10px 0}"+
    "#traderPaperLab .pl-more>summary{padding:10px;background:#102b38;color:#afcfde;font-size:12px}"+
    "#traderPaperLab .pl-more[open]>div{padding:8px}"+
    "#traderPaperLab [data-lab-result]{font:14px/1.8 system-ui,sans-serif;background:#071f2b;border-color:#3e8696}";
  document.head.appendChild(style);
  const node=document.createElement("details");node.id=ID;
  node.innerHTML=[
    '<summary>LABORATOIRE PAPER · Tester maintenant ou suivre une crypto · aucun ordre</summary>',
    '<div class="pl-body"><p>Choisis une crypto sur le graphique Solo 24 h USD. Deux possibilités : une étude rétrospective immédiate sur ses données existantes, ou le suivi d’une opération fictive à partir de maintenant. Aucune transaction réelle.</p>',
    '<div class="pl-fields">',
    '<label>Capital USD fictif<input data-lab-capital value="5" inputmode="decimal"></label>',
    '<label>Frais achat (%)<input data-lab-entryFeePct value="0,2" inputmode="decimal"></label>',
    '<label>Frais vente (%)<input data-lab-exitFeePct value="0,2" inputmode="decimal"></label>',
    '<label>Spread total (%)<input data-lab-spreadPct value="0,1" inputmode="decimal"></label>',
    '<label>Glissement par côté (%)<input data-lab-slippagePct value="0,1" inputmode="decimal"></label>',
    '</div><p>Hypothèses ajustables, PAS les coûts OKX certifiés. USD notionnels : ni USD ni USDT ne sont traités automatiquement comme des USDC. Minimums et profondeur non évalués.</p>',
    '<div class="pl-primary"><button type="button" data-lab-study>1 · Tester maintenant (historique 1 h)</button>',
    '<button type="button" data-lab-begin>2 · Suivre une opération PAPER</button>',
    '<button type="button" data-lab-stop>Annuler le suivi</button></div>',
    '<p role="status" aria-live="polite" data-lab-follow>Pas de suivi actif. Une étude historique donne des résultats immédiatement, mais ne prédit pas les cours futurs.</p>',
    '<p role="status" data-lab-status>Sélectionne une crypto puis teste son historique ou démarre un suivi.</p>',
    '<details class="pl-more"><summary>Contrôles avancés · simulations et journal</summary><div>',
    '<button type="button" data-lab-capture>Capturer la source</button>',
    '<button type="button" data-lab-simulate>Simuler −5 / 0 / +5 %</button>',
    '<button type="button" data-lab-finish>Évaluer manuellement un nouveau relevé</button>',
    '<button type="button" data-lab-auto aria-pressed="false">Démarrer Auto PAPER</button>',
    '<button type="button" data-lab-copy>Copier le journal</button></div></details>',
    '<h4>Observations qualifiées</h4><pre data-lab-observations></pre>',
    '<h4>Résultat</h4><pre data-lab-result>Pas de valeur inventée.</pre>',
    '<h4>Observations PAPER ouvertes</h4><pre data-lab-open></pre>',
    '<h4>Journal prospectif · session seulement</h4><pre data-lab-journal></pre>',
    '<p>Étude historique : fenêtres de 60 minutes qui se chevauchent, seulement pour illustrer l’effet des coûts ; aucune prédiction ni capital cumulé. Suivi PAPER : il se termine automatiquement après réception d’une nouvelle observation admissible datée au moins 5 minutes après l’entrée. La page n’interroge pas les marchés elle-même : si le propriétaire du graphique ne publie pas de nouveau point, elle reste en attente. Le suivi et son journal disparaissent au rechargement ou à la fermeture. Aucun ordre OKX, aucun envoi, aucune sauvegarde automatique.</p></div>'
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
  for(const [key,fn] of [["capture",take],["simulate",simulate],
    ["study",studyNow],["begin",begin],["stop",stopWatch],["finish",finish]])
    qs(key)?.addEventListener("click",fn);
  qs("auto")?.addEventListener("click",()=>setAutomatic(!automatic));
  for(const event of ["agent-crypto:new-listing-line-ready",
    "agent-crypto:graph-context-ready","agent-crypto:workspace-restored",
    "agent-crypto:selected-market-changed"]){
    globalThis.addEventListener(event,onChartUpdate,{passive:true});
  }
  qs("copy")?.addEventListener("click",async()=>{
    try{await navigator.clipboard.writeText(JSON.stringify({paper:true,realOrders:false,events:journal},null,2));
      show("status","Journal PAPER copié localement. Aucun envoi.");}
    catch(_){show("status","Copie refusée par Firefox ; aucune donnée transmise.");}
  });
  node.addEventListener("toggle",()=>{if(node.open){refresh();onChartUpdate();}});
  refresh();return true;
}
globalThis.AgentCryptoTraderPaperLab=Object.freeze({mount,take,simulate,studyNow,begin,finish,stopWatch,watchTick,source,
  snapshot:()=>({captured:[...captures.values()].map(x=>x.asset),open:[...positions.values()].map(x=>x.entry.asset),
    autoOpen:[...automaticPositions.values()].map(x=>x.entry.asset),
    followed:[...positions.values()].filter(x=>x.follow).map(x=>x.entry.asset),
    autoActive:automatic,
    autoCount:automaticCount,autoLimit:AUTO_LIMIT,
    journalCount:journal.length,realOrders:false,network:false,storage:false}),
  realOrders:false,network:false,storage:false,bridge:false,readOnly:true});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
else mount();
})();
