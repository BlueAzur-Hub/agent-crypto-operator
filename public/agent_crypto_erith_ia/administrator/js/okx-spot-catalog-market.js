/* ERITH.IA — native Spot catalog in the EXISTING Market Snapshot.
   Shared unchanged by Administrator and Operator. Uses the canonical
   Aether Trust session via ErithAetherTrustDualRoleR28.readSpotCatalog().
   No new login, portal, order endpoint, token store, scheduler or parallel system. */
(() => {
  "use strict";
  const ID = "erithOkxSpotMarket";
  const PAGE = 100; // Display pagination only; the fetched catalog is never capped.
  let instruments = [];
  let evidence = null;
  let shown = 0;
  let busy = false;
  let receivedToken = "";
  const $ = id => document.getElementById(id);
  const str = v => String(v == null ? "" : v).trim();
  const set = (id,v) => { const node=$(id); if(node)node.textContent=str(v); };
  const currentToken = () => {
    try { return str(globalThis.atlasBridgeAuthToken?.()); }
    catch (_) { return ""; }
  };
  const cell = (tr,v) => {
    const td=document.createElement("td");td.textContent=str(v);tr.appendChild(td);
  };
  function clear(message) {
    instruments=[];
    evidence=null;
    receivedToken="";
    shown=0;
    set(ID+"Summary","Aucune qualification privée");
    set(ID+"Status",message||"En attente d'Aether Trust.");
    draw();
  }
  function filtered() {
    const query=str($(ID+"Search")?.value).toUpperCase();
    return instruments.filter(row=>!query||
      [row.instId,row.base,row.quote,...(Array.isArray(row.tradeQuoteCcyList)?row.tradeQuoteCcyList:[])]
        .join(" ").toUpperCase().includes(query));
  }
  function draw() {
    const tbody=$(ID+"Rows");
    if(!tbody)return;
    if(receivedToken && currentToken()!==receivedToken){
      instruments=[];evidence=null;receivedToken="";shown=0;
      set(ID+"Summary","Session Aether Trust modifiée : relire le catalogue.");
    }
    const rows=filtered();
    const pages=Math.max(1,Math.ceil(rows.length/PAGE));
    shown=Math.min(Math.max(0,shown),pages-1);
    const offset=shown*PAGE;
    const fragment=document.createDocumentFragment();
    rows.slice(offset,offset+PAGE).forEach(row=>{
      const tr=document.createElement("tr");
      cell(tr,row.instId);
      cell(tr,row.quote);
      cell(tr,Array.isArray(row.tradeQuoteCcyList)?row.tradeQuoteCcyList.join(", "):"Non vérifiées");
      cell(tr,row.account_live===true?"LIVE":"Non confirmé");
      cell(tr,row.public_live===true?"LIVE":"Non confirmé");
      cell(tr,row.status||"UNVERIFIED");
      cell(tr,Array.isArray(row.reasons)?row.reasons.join("; "):"—");
      tr.dataset.catalogVerified=String(row.qualified_for_read_only_research===true);
      fragment.appendChild(tr);
    });
    tbody.replaceChildren(fragment);
    set(ID+"Pager",rows.length?(offset+1)+"–"+Math.min(offset+PAGE,rows.length)+" / "+rows.length:"0 résultat");
    $(ID+"Prev").disabled=shown===0;
    $(ID+"Next").disabled=shown+1>=pages;
  }
  async function read() {
    if(busy)return false;
    const trust=globalThis.ErithAetherTrustDualRoleR28;
    if(!trust||typeof trust.readSpotCatalog!=="function"){
      clear("Le raccordement Aether Trust canonique est absent.");
      return false;
    }
    const token=currentToken();
    if(!token){
      clear("Déverrouille Aether Trust dans cette interface, sans seconde connexion.");
      return false;
    }
    busy=true;
    $(ID+"Refresh").disabled=true;
    set(ID+"Status","Lecture du catalogue Spot du compte local…");
    try {
      const payload=await trust.readSpotCatalog();
      if(currentToken()!==token)throw Error("Session Aether Trust modifiée pendant la lecture.");
      const rows=payload.instruments;
      if(new Set(rows.map(row=>str(row?.instId))).size!==rows.length||
         rows.some(row=>!/^[A-Z0-9]{1,32}-[A-Z0-9]{1,32}$/.test(str(row?.instId)))){
        throw Error("Instruments ou identifiants OKX ambigus.");
      }
      instruments=rows;
      evidence={count:payload.count,qualified:payload.qualified_count,
        publicVerified:payload.public_catalog_verified===true,at:str(payload.fetched_at)};
      receivedToken=token;
      shown=0;
      set(ID+"Summary",evidence.count+" instruments du compte · "+evidence.qualified+" qualifiés");
      set(ID+"Status","Relevé "+(evidence.at||"sans date")+" · Source publique "+
        (evidence.publicVerified?"vérifiée":"indisponible")+" · lecture seule, sans ordre.");
      draw();
      return true;
    }catch(error){
      clear("Qualification impossible : "+str(error?.message||error));
      return false;
    }finally{
      busy=false;
      const btn=$(ID+"Refresh");
      if(btn)btn.disabled=false;
    }
  }
  function mount() {
    if($(ID))return;
    const panel=$("marketSnapshotPanel");
    const tools=$("marketTools");
    if(!panel||!tools||tools.parentNode!==panel)return;
    const node=document.createElement("details");
    node.id=ID;
    node.className="erith-spot-native";
    node.innerHTML=
      '<summary>Catalogue Spot OKX du compte local <small>Lecture seule · Aether Trust</small></summary>'+
      '<div class="erith-spot-tools"><button type="button" id="'+ID+'Refresh">Lire le catalogue OKX</button>'+
      '<input type="search" id="'+ID+'Search" aria-label="Filtrer le catalogue OKX" placeholder="Filtrer BTC, ETH, paire…" />'+
      '<span id="'+ID+'Summary">Aucune qualification privée</span></div>'+
      '<p id="'+ID+'Status" role="status" aria-live="polite">Ouvre Aether Trust dans cette interface avant la lecture privée.</p>'+
      '<div class="table-wrap"><table><thead><tr>'+
      '<th>Instrument</th><th>Devise native</th><th>Devises de règlement</th><th>Compte</th>'+
      '<th>Marché</th><th>Preuve</th><th>À vérifier</th>'+
      '</tr></thead><tbody id="'+ID+'Rows"></tbody></table></div>'+
      '<nav aria-label="Pages du catalogue OKX">'+
      '<button type="button" id="'+ID+'Prev">Précédent</button>'+
      '<span id="'+ID+'Pager">0 résultat</span>'+
      '<button type="button" id="'+ID+'Next">Suivant</button></nav>'+
      '<small>Pagination de présentation uniquement. Aucune limite sur les instruments interrogés, aucun ordre réel.</small>';
    tools.insertAdjacentElement("afterend",node);
    const style=document.createElement("style");
    style.textContent=
      "#"+ID+"{margin:12px 0;padding:10px;border:1px solid rgba(115,197,220,.4);border-radius:10px;background:rgba(4,27,38,.4)}"+
      "#"+ID+">summary{cursor:pointer;font-weight:650}"+
      "#"+ID+">summary small{font-weight:400;margin-left:10px;opacity:.75}"+
      "#"+ID+" .erith-spot-tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:12px 0}"+
      "#"+ID+" button,#"+ID+" input{border:1px solid rgba(115,197,220,.4);border-radius:8px;padding:7px;background:#112d3c;color:inherit;font:inherit}"+
      "#"+ID+" button:not(:disabled){cursor:pointer}"+
      "#"+ID+" input{flex:1 1 210px;min-width:170px}"+
      "#"+ID+" td,#"+ID+" th{padding:7px;text-align:left}"+
      "#"+ID+" tr[data-catalog-verified=true] td:nth-child(6){color:#95ddba}"+
      "#"+ID+" nav{display:flex;justify-content:flex-end;align-items:center;gap:10px;padding:10px 0}";
    document.head.appendChild(style);
    $(ID+"Refresh").addEventListener("click",()=>{void read();});
    $(ID+"Search").addEventListener("input",()=>{shown=0;draw();});
    $(ID+"Prev").addEventListener("click",()=>{shown=Math.max(0,shown-1);draw();});
    $(ID+"Next").addEventListener("click",()=>{shown++;draw();});
    node.addEventListener("toggle",()=>{if(node.open)draw();});
    window.addEventListener("aether-trust:logout-requested",()=>clear("Session Aether Trust terminée."),{passive:true});
    draw();
  }
  globalThis.AgentCryptoOkxSpotCatalogMarket=Object.freeze({
    mount,read,snapshot:()=>Object.freeze({mounted:!!$(ID),count:instruments.length,
      evidence:evidence?Object.freeze({...evidence}):null}),
    read_only:true,second_login:false,storage_added:false,orders_enabled:false
  });
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
})();