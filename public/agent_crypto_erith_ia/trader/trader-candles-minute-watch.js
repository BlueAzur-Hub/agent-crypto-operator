/* ERITH.IA Trader — lecture seule des bougies CT 1m.
   Se monte dans l'iframe Trader, sans modifier le moteur Administrator.
   Rafraîchissement à la minute, pause hors premier plan, aucune route d'ordre. */
(()=>{
  'use strict';
  if(globalThis.AgentCryptoTraderMinuteWatch)return;
  const MIN_REFRESH_MS=60000;
  const POLL_MS=10000;
  const MAX_FRESH_AGE_MS=125000;
  const ID='traderMinuteCandlesStatus';
  let lastAttempt=0, busy=false, timer=null, lastResult='';
  const owner=()=>globalThis.AgentCryptoMarketMicroscope;
  const snap=()=>{try{return owner()?.snapshot?.()||null;}catch(_){return null;}};
  const current=state=>state?.mode==='candles'&&state.bar==='1m'&&
    /^CT-(USDT|USDC)$/.test(String(state.loadedInstrument||state.instrument||''));
  const newest=state=>{const rows=state?.rows||[];const t=Number(rows[rows.length-1]?.t);return Number.isFinite(t)&&t>0?t:null;};
  const ageMs=state=>{const t=newest(state);return t===null?null:Math.max(0,Date.now()-t);};
  function badge(){
    const root=document.getElementById('atlasMarketMicroscope');
    const title=root?.querySelector('.amm-title');
    if(!title)return null;
    let node=document.getElementById(ID);
    if(!node){
      node=document.createElement('span');node.id=ID;
      node.setAttribute('role','status');node.setAttribute('aria-live','polite');
      node.style.cssText='display:inline-block;margin-left:9px;padding:3px 7px;border:1px solid #386a79;border-radius:7px;background:#082532;color:#c8ebf3;font:600 11px system-ui,sans-serif';
      title.appendChild(node);
    }
    return node;
  }
  function paint(state){
    const element=badge();if(!element)return;
    if(!current(state)){element.hidden=true;return;}
    element.hidden=false;
    const age=ageMs(state),seconds=age===null?null:Math.floor(age/1000),old=age===null||age>MAX_FRESH_AGE_MS;
    element.dataset.marketFreshness=old?'stale':'fresh';
    element.style.borderColor=old?'#db8153':'#386a79';
    element.style.color=old?'#ffcf91':'#a2eee0';
    if(busy||state.loading){element.textContent='CT 1m · actualisation…';return;}
    const label=seconds===null?'date inconnue':seconds<120?`${seconds} s`:`${Math.floor(seconds/60)} min`;
    element.textContent=old?`CT 1m · DONNÉES ANCIENNES (${label})`:`CT 1m · bougie ${label}`;
    if(lastResult==='error')element.textContent+=' · réseau à vérifier';
    element.title='Âge réel de la dernière bougie OKX CT/USDT. Le dernier clic sur une bougie ne prouve pas sa fraîcheur.';
  }
  async function tick(){
    const state=snap();
    paint(state);
    if(document.visibilityState==='hidden'||!current(state)||busy||state.loading)return false;
    if(!owner()?.load)return false;
    const view=owner()?.viewport?.();
    if(view&&Number.isFinite(view.start)&&Number.isFinite(view.count)&&Array.isArray(state.rows)&&
       view.start+view.count<state.rows.length-2)return false; // Respecte l'exploration historique manuelle.
    const now=Date.now();
    if(now-lastAttempt<MIN_REFRESH_MS)return false;
    const fresh=ageMs(state);
    if(fresh!==null&&fresh<MIN_REFRESH_MS&&state.lastLoadedAt)return false;
    lastAttempt=now;busy=true;paint(state);
    try{const result=await owner().load({bar:'1m',reason:'trader-minute-watch'});lastResult=result===true?'ok':'error';}
    catch(_){lastResult='error';}
    finally{busy=false;paint(snap());}
    return lastResult==='ok';
  }
  function boot(){if(timer!==null)return;tick();timer=setInterval(tick,POLL_MS);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')void tick();});
  window.addEventListener('pageshow',()=>{void tick();},{passive:true});
  globalThis.AgentCryptoTraderMinuteWatch=Object.freeze({tick,snapshot:()=>({lastAttempt,busy,lastResult,refreshMs:MIN_REFRESH_MS,readOnly:true}),read_only:true,orders:false});
})();
