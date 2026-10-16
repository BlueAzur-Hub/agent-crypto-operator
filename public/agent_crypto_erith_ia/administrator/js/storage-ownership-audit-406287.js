/* Agent-Crypto Administrator — 40.6.287
   STORAGE OWNERSHIP AUDIT · READ ONLY

   Operator-triggered diagnostic only.
   - Enumerates localStorage keys and approximate payload weight.
   - Groups keys by probable owner/family from names only.
   - Flags strong historical/backup candidates without authorizing deletion.
   - Detects byte-identical localStorage payloads by lightweight fingerprint.
   - Reads navigator.storage.estimate() and IndexedDB database metadata when available.
   - Never DELETE / CLEAR / PUT / setItem / removeItem / open an IndexedDB database.
   - No timer, observer, network request, migration or automatic cleanup.
*/
(()=>{
  "use strict";
  if(globalThis.AgentCryptoStorageOwnershipAudit406287)return;

  const BUILD="40.6.287";
  const state={last:null,runs:0,lastError:null,mounted:false};
  const enc=typeof TextEncoder==="function"?new TextEncoder():null;

  const bytes=value=>{
    const text=String(value??"");
    if(enc)return enc.encode(text).byteLength;
    try{return new Blob([text]).size;}catch(_){return text.length*2;}
  };
  const fmt=n=>{
    const value=Number(n)||0;
    if(value<1024)return value+" B";
    if(value<1024*1024)return (value/1024).toFixed(1)+" KiB";
    return (value/(1024*1024)).toFixed(2)+" MiB";
  };
  const safe=value=>String(value??"").replace(/[\r\n\t]+/g," ").trim();

  function ownerFor(key){
    const k=String(key||"").toLowerCase();
    const rules=[
      ["Graph / Workspace",/(graph|chart|workspace|technical|layout|window)/],
      ["News / Aether",/(news|aether|sentinel|event[_-]?reaction)/],
      ["Learning",/(learning|school|exercise|journey|module[_-]?progress)/],
      ["Simulation / Strategy",/(simulation|strategy|tradus|paper|position|trade)/],
      ["CURRENT / Decision / Oracle",/(current|decision|oracle|risk|nox)/],
      ["Market / Sources",/(market|source|binance|coingecko|price|quote|ticker|dex|cex)/],
      ["Memory / Collectors",/(memory|collector|shared|synthesis|ledger)/],
      ["UI / Profiles",/(profile|theme|view|admin|interface|menu|collapse|dock)/],
      ["Celestial",/(celestial|astro|solar|lunar|noaa|nasa)/]
    ];
    for(const [name,re] of rules)if(re.test(k))return name;
    return "Other / Unknown";
  }

  function strongHistoricalHint(key){
    const k=String(key||"").toLowerCase();
    if(/(?:^|[_-])(legacy|old|deprecated|obsolete|backup|bak|archive)(?:$|[_-])/.test(k))return true;
    if(/(?:^|[_-])40[._-]?\d+[._-]?\d+(?:$|[_-])/.test(k))return true;
    if(/(?:^|[_-])build[_-]?\d+(?:$|[_-])/.test(k))return true;
    return false;
  }

  function topLevelTimestamp(value){
    const text=String(value||"");
    if(!text||text.length>2_000_000)return null;
    try{
      const parsed=JSON.parse(text);
      if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))return null;
      const keys=["updated_at","updatedAt","saved_at","savedAt","last_used_at","lastUsedAt","last_updated","lastUpdated","timestamp","exported_at","fetched_at","created_at","at"];
      for(const key of keys){
        const raw=parsed[key];
        if(raw==null)continue;
        const n=typeof raw==="number"?raw:Date.parse(String(raw));
        const ms=typeof raw==="number"?(raw<1e12?raw*1000:raw):n;
        if(Number.isFinite(ms)&&ms>946684800000&&ms<4102444800000)return new Date(ms).toISOString();
      }
    }catch(_){}
    return null;
  }

  function hash(value){
    const text=String(value??"");
    let h=2166136261>>>0;
    for(let i=0;i<text.length;i++){
      h^=text.charCodeAt(i);
      h=Math.imul(h,16777619)>>>0;
    }
    return h.toString(16).padStart(8,"0")+":"+text.length;
  }

  function localRows(){
    const rows=[];
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(key==null)continue;
      let value="";
      let readable=true;
      try{value=localStorage.getItem(key)??"";}catch(error){readable=false;value="";}
      const keyBytes=bytes(key),valueBytes=bytes(value);
      rows.push({
        key,
        owner:ownerFor(key),
        bytes:keyBytes+valueBytes,
        value_bytes:valueBytes,
        chars:value.length,
        readable,
        historical_candidate:strongHistoricalHint(key),
        last_use_evidence:readable?topLevelTimestamp(value):null,
        fingerprint:readable?hash(value):null
      });
    }
    rows.sort((a,b)=>b.bytes-a.bytes||a.key.localeCompare(b.key));
    return rows;
  }

  async function idbMetadata(){
    if(!globalThis.indexedDB)return {available:false,reason:"indexedDB unavailable",databases:[]};
    if(typeof indexedDB.databases!=="function")return {available:true,metadata_api:false,databases:[]};
    try{
      const rows=await indexedDB.databases();
      return {
        available:true,
        metadata_api:true,
        databases:(Array.isArray(rows)?rows:[]).map(row=>({name:String(row?.name||""),version:Number(row?.version)||null})).filter(row=>row.name)
      };
    }catch(error){
      return {available:true,metadata_api:true,error:String(error?.message||error||"metadata error"),databases:[]};
    }
  }

  async function originEstimate(){
    if(!navigator.storage?.estimate)return {available:false};
    try{
      const e=await navigator.storage.estimate();
      return {available:true,usage:Number(e?.usage)||0,quota:Number(e?.quota)||0};
    }catch(error){
      return {available:true,error:String(error?.message||error||"estimate error"),usage:0,quota:0};
    }
  }

  function summarizeOwners(rows){
    const map=new Map();
    for(const row of rows){
      const current=map.get(row.owner)||{owner:row.owner,keys:0,bytes:0,historical_candidates:0};
      current.keys+=1;current.bytes+=row.bytes;if(row.historical_candidate)current.historical_candidates+=1;
      map.set(row.owner,current);
    }
    return [...map.values()].sort((a,b)=>b.bytes-a.bytes);
  }

  function duplicates(rows){
    const groups=new Map();
    for(const row of rows){
      if(!row.readable||!row.fingerprint||row.value_bytes<64)continue;
      const list=groups.get(row.fingerprint)||[];
      list.push(row);
      groups.set(row.fingerprint,list);
    }
    return [...groups.values()]
      .filter(list=>list.length>1)
      .map(list=>({fingerprint:list[0].fingerprint,bytes_each:list[0].value_bytes,keys:list.map(row=>row.key)}))
      .sort((a,b)=>(b.bytes_each*b.keys.length)-(a.bytes_each*a.keys.length));
  }

  async function audit(){
    state.runs+=1;state.lastError=null;
    try{
      const rows=localRows();
      const totalBytes=rows.reduce((sum,row)=>sum+row.bytes,0);
      const [origin,indexeddb]=await Promise.all([originEstimate(),idbMetadata()]);
      const report=Object.freeze({
        schema:"agent_crypto_storage_ownership_audit_v1",
        build:BUILD,
        generated_at:new Date().toISOString(),
        read_only:true,
        localStorage:Object.freeze({
          keys:rows.length,
          approximate_utf8_bytes:totalBytes,
          rows:Object.freeze(rows.map(row=>Object.freeze({...row}))),
          owners:Object.freeze(summarizeOwners(rows).map(row=>Object.freeze({...row}))),
          historical_candidates:Object.freeze(rows.filter(row=>row.historical_candidate).map(row=>row.key)),
          duplicate_groups:Object.freeze(duplicates(rows).map(group=>Object.freeze({fingerprint:group.fingerprint,bytes_each:group.bytes_each,keys:Object.freeze(group.keys.slice())})))
        }),
        origin:Object.freeze(origin),
        indexeddb:Object.freeze(indexeddb),
        policy:Object.freeze({
          delete:false,clear:false,put:false,setItem:false,removeItem:false,
          indexeddb_open:false,migration:false,automatic_cleanup:false,
          classification_is_hint_not_deletion_authority:true
        })
      });
      state.last=report;
      render(report);
      try{window.dispatchEvent(new CustomEvent("agent-crypto:storage-ownership-audit-ready",{detail:{build:BUILD,keys:rows.length,bytes:totalBytes}}));}catch(_){}
      return report;
    }catch(error){
      state.lastError=String(error?.message||error||"audit error");
      renderError(state.lastError);
      throw error;
    }
  }

  function outputNode(){return document.getElementById("atlasStorageOwnership287");}

  function render(report){
    const node=outputNode();if(!node)return;
    const owners=report.localStorage.owners.slice(0,12);
    const top=report.localStorage.rows.slice(0,20);
    const historical=report.localStorage.historical_candidates;
    const dup=report.localStorage.duplicate_groups;
    const dbs=report.indexeddb.databases||[];
    const lines=[
      "STORAGE OWNERSHIP AUDIT · 40.6.287 · LECTURE SEULE",
      `localStorage : ${report.localStorage.keys} clé(s) · ~${fmt(report.localStorage.approximate_utf8_bytes)} payload UTF-8 estimé`,
      report.origin.available?`Origine : ${fmt(report.origin.usage)} utilisés / ${fmt(report.origin.quota)} quota estimé`:"Origine : Storage Estimate API indisponible",
      `IndexedDB metadata : ${dbs.length} base(s)${report.indexeddb.metadata_api===false?" · liste non exposée par ce navigateur":""}`,
      "",
      "OWNERS PROBABLES :",
      ...owners.map(row=>`- ${row.owner} · ${row.keys} clé(s) · ~${fmt(row.bytes)} · historiques forts ${row.historical_candidates}`),
      "",
      "TOP PAYLOADS :",
      ...top.map((row,index)=>`${String(index+1).padStart(2,"0")}. ${row.key} · ~${fmt(row.bytes)} · ${row.owner} · ${row.historical_candidate?"HISTORICAL_CANDIDATE":"CURRENT_OR_UNKNOWN"}${row.last_use_evidence?` · date ${row.last_use_evidence}`:""}`),
      "",
      `HISTORICAL_CANDIDATES forts : ${historical.length}`,
      ...historical.slice(0,20).map(key=>"- "+key),
      historical.length>20?`… +${historical.length-20} autre(s)`:"",
      "",
      `DUPLICATE GROUPS byte-identiques : ${dup.length}`,
      ...dup.slice(0,10).map(group=>`- ~${fmt(group.bytes_each)} × ${group.keys.length} · ${group.keys.join(" | ")}`),
      "",
      "INDEXEDDB DATABASES (metadata seulement) :",
      ...(dbs.length?dbs.map(db=>`- ${db.name} · v${db.version??"?"}`):["- aucune liste disponible / aucune base déclarée"]),
      "",
      "DÉCISION : AUCUNE SUPPRESSION. Ce rapport classe et mesure ; .288 seulement après preuve terrain et validation opérateur."
    ].filter(line=>line!=="");
    node.textContent=lines.join("\n");
    const stateNode=document.getElementById("atlasStorageOwnershipState287");
    if(stateNode)stateNode.textContent=`MESURÉ · ${report.localStorage.keys} clés · ${fmt(report.localStorage.approximate_utf8_bytes)}`;
  }

  function renderError(message){
    const node=outputNode();if(node)node.textContent="STORAGE OWNERSHIP AUDIT · ERREUR LECTURE SEULE · "+safe(message);
    const stateNode=document.getElementById("atlasStorageOwnershipState287");
    if(stateNode)stateNode.textContent="ERREUR";
  }

  function exportLast(){
    if(!state.last)return false;
    const json=JSON.stringify(state.last,null,2);
    const blob=new Blob([json],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=`agent-crypto-storage-ownership-audit-${BUILD.replaceAll(".","_")}.json`;
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),0);
    return true;
  }

  function mount(){
    const host=document.getElementById("atlasStorageHealth");
    if(!host)return false;
    if(document.getElementById("btnAtlasStorageOwnership287")){state.mounted=true;return true;}
    const title=document.getElementById("atlasStorageHealthTitle");
    if(title)title.textContent="Quota, ownership localStorage et persistance IndexedDB";

    const controls=document.createElement("div");
    controls.className="atlas-storage-health-actions";
    controls.dataset.storageOwnership287="1";
    controls.innerHTML='<button type="button" id="btnAtlasStorageOwnership287">Audit ownership · 40.6.287</button><button type="button" id="btnAtlasStorageOwnershipExport287" disabled>Exporter ownership · JSON</button><span class="atlas-storage-health-state" id="atlasStorageOwnershipState287">DORMANT · lecture seule</span>';

    const out=document.createElement("pre");
    out.id="atlasStorageOwnership287";
    out.className="atlas-storage-health-list";
    out.textContent="STORAGE OWNERSHIP AUDIT 40.6.287 · EN ATTENTE · aucune lecture détaillée avant action opérateur · aucune suppression.";

    const note=document.createElement("p");
    note.className="muted-line";
    note.textContent="40.6.287 : taille par clé + owner probable + doublons byte-identiques + candidats historiques forts + metadata IndexedDB. Aucun DELETE, CLEAR, PUT, setItem, removeItem, ouverture de DB ou migration.";

    const anchor=document.getElementById("atlasStorageLargest")||host.querySelector(".atlas-storage-health-grid");
    anchor?.insertAdjacentElement("afterend",controls);
    controls.insertAdjacentElement("afterend",out);
    out.insertAdjacentElement("afterend",note);

    document.getElementById("btnAtlasStorageOwnership287")?.addEventListener("click",async event=>{
      const button=event.currentTarget;
      button.disabled=true;
      const stateNode=document.getElementById("atlasStorageOwnershipState287");
      if(stateNode)stateNode.textContent="MESURE…";
      try{
        await audit();
        const exportButton=document.getElementById("btnAtlasStorageOwnershipExport287");
        if(exportButton)exportButton.disabled=false;
      }catch(_){}
      finally{button.disabled=false;}
    });
    document.getElementById("btnAtlasStorageOwnershipExport287")?.addEventListener("click",()=>exportLast());
    state.mounted=true;
    return true;
  }

  function remount(){try{mount();}catch(_){}}
  remount();
  window.addEventListener("erith:system-hydrated",remount,{passive:true});
  window.addEventListener("pageshow",remount,{passive:true});

  globalThis.AgentCryptoStorageOwnershipAudit406287=Object.freeze({
    build:BUILD,
    mount,
    audit,
    exportLast,
    snapshot:()=>Object.freeze({
      build:BUILD,
      runs:state.runs,
      mounted:state.mounted,
      last_error:state.lastError,
      has_report:!!state.last,
      local_keys:state.last?.localStorage?.keys??null,
      approximate_utf8_bytes:state.last?.localStorage?.approximate_utf8_bytes??null,
      historical_candidates:state.last?.localStorage?.historical_candidates?.length??null,
      duplicate_groups:state.last?.localStorage?.duplicate_groups?.length??null
    }),
    read_only:true,
    automatic_run:false,
    automatic_cleanup:false,
    localstorage_write:false,
    localstorage_delete:false,
    indexeddb_open:false,
    indexeddb_write:false,
    migration:false,
    network:false,
    recurring_timer:false,
    mutation_observer:false
  });
})();