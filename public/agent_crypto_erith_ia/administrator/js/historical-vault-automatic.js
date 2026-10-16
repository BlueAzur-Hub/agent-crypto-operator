/* Seven Heaven R10 — passive verification on page open, targeted lazy reads.
 * No timers, polling, storage writes or modification of chart/market interfaces.
 */
(()=>{"use strict";
const $=id=>document.getElementById(id);
const configs=[
 {details:"r6-archive-adapter",button:"r6-read",selects:["r6-asset","r6-period"]},
 {details:"r7-btc-comparator",button:"r7-check",selects:[]},
 {details:"r9-compact",button:"r9-read",selects:["r9-asset","r9-period"],compact:true}
];
// Firefox may re-anchor page scroll while the seven-row R9 table is
// briefly replaced by the single-line SHA-256 loading text.
// Reserve only the last rendered R9 table height; never scroll the window.
function keepCompactTableHeight(){
 const panel=$("r9-table");
 if(!panel)return;
 panel.style.overflowAnchor="none";
 if(!panel.querySelector("table"))return;
 const height=panel.getBoundingClientRect().height;
 if(Number.isFinite(height)&&height>0)panel.style.minHeight=Math.ceil(height)+"px";
}
function ready(){
 const state=$("r10-automatic-status");
 const message=s=>{if(state)state.textContent=s};
 // The existing R5 read-only audit remains authoritative; just invoke its
 // existing click handler once, without reimplementing the large verifier.
 const analyze=$("analyze");
 if(analyze&&!analyze.disabled)analyze.click();
 message("R10 · vérification automatique du catalogue…");
 const reader=window.SevenCompactArchiveReader;
 if(reader&&typeof reader.listCoverage==="function"){
  reader.listCoverage().then(c=>{
   if(!c||c.quote!=="USDT"||!c.snapshot||c.coverage?.length!==21)throw Error("Catalogue non qualifié");
   message("R10 auto · "+c.total+" chandelles compactes · capture "+c.updatedAt+" · 21 séries · sélection à la demande");
  }).catch(e=>message("R10 · catalogue indisponible : "+String(e.message||e).slice(0,100)+" · contrôle manuel possible"));
 }else{message("R10 · lecteur compact indisponible · contrôle manuel possible")}
 for(const config of configs){
  const details=$(config.details),button=$(config.button);
  if(!details||!button)continue;
  // Capture before the existing R9 click handler replaces the table.
  // Also protects manual reads, not only automatic period changes.
  if(config.compact)button.addEventListener("click",keepCompactTableHeight,{capture:true});
  let lastKey=null,loading=false;
  const trigger=async()=>{
   if(!details.open||button.disabled||loading)return;
   const key=config.selects.map(id=>$(id)?.value||"").join("|")||"BTC";
   if(lastKey===key)return;
   if(config.compact)keepCompactTableHeight();
   loading=true;
   try{
    if(config.compact){
      // Always re-read one small index on opening/selection. Never load blocks
      // for collapsed sections and do not use a stale in-page catalog.
      if(typeof reader?.refreshIndex!=="function")throw Error("R9 actualisation indisponible");
      await reader.refreshIndex();
    }
    if(!details.open)return;
    button.click();
    lastKey=key;
   }catch(e){
    const span=$(config.compact?"r9-status":"r10-automatic-status");
    if(span)span.textContent="Lecture auto impossible : "+String(e.message||e).slice(0,140);
   }finally{loading=false}
  };
  details.addEventListener("toggle",()=>{if(details.open)void trigger();else lastKey=null});
  for(const id of config.selects){
   const control=$(id);
   if(control)control.addEventListener("change",()=>{if(details.open)void trigger()});
  }
  if(details.open)void trigger();
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready,{once:true});
else ready();
})();