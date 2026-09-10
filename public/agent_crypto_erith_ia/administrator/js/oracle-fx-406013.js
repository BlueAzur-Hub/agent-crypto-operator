(() => {
  "use strict";
  const BUILD="40.6.13", STORAGE_KEY="agent_crypto_oracle_fx_enabled_v1";
  let bullObserver=null, priceObserver=null, lastPrice=null;
  const root=()=>document.getElementById("atlasOracleV0");
  const bull=()=>document.getElementById("atlasOracleBull");
  const price=()=>document.getElementById("atlasOraclePrice");
  const hero=()=>root()?.querySelector(".atlas-oracle-hero")||null;
  const readEnabled=()=>{try{const v=localStorage.getItem(STORAGE_KEY);return v===null?true:v==="1"}catch(_){return true}};
  const writeEnabled=v=>{try{localStorage.setItem(STORAGE_KEY,v?"1":"0")}catch(_){}};
  function strength(){const m=String(bull()?.textContent||"").replace(",",".").match(/Force\s+(-?\d+(?:\.\d+)?)\s*\/\s*100/i);return m&&Number.isFinite(Number(m[1]))?Number(m[1]):null}
  function bias(){const n=strength();return n===null||n===50?"neutral":n>50?"bull":"bear"}
  function parsePrice(){let s=String(price()?.textContent||"").replace(/[\s\u00a0\u202f]/g,"").replace(/[^0-9,.-]/g,"");if(!s)return null;if(s.includes(","))s=s.replace(/\./g,"").replace(",",".");const n=Number(s);return Number.isFinite(n)?n:null}
  function applyBias(){const r=root();if(!r)return false;r.dataset.oracleBiasState=bias();return true}
  function applyFx(v=readEnabled()){const r=root(),b=document.getElementById("atlasOracleFxToggle406013");if(r)r.dataset.oracleFx=v?"on":"off";if(b){b.setAttribute("aria-pressed",v?"true":"false");b.title=v?"Effets Oracle : ON":"Effets Oracle : OFF"}return v}
  function injectToggle(){const h=hero();if(!h)return null;let b=document.getElementById("atlasOracleFxToggle406013");if(b)return b;b=document.createElement("button");b.id="atlasOracleFxToggle406013";b.className="atlas-oracle-fx-toggle-406013";b.type="button";b.innerHTML='<span>FX</span><span class="dot" aria-hidden="true">●</span>';b.addEventListener("click",()=>{const v=!readEnabled();writeEnabled(v);applyFx(v)});h.appendChild(b);return b}
  function priceTick(){const el=price(),n=parsePrice();if(!el||n===null)return;const prev=lastPrice;lastPrice=n;if(prev===null||n===prev||!readEnabled())return;const up=n>prev;if(typeof el.animate==="function"){el.getAnimations?.().forEach(a=>a.cancel());el.animate([{color:up?"#79ffad":"#ff8296",textShadow:up?"0 0 10px rgba(88,255,157,.52)":"0 0 10px rgba(255,93,122,.52)"},{color:"",textShadow:""}],{duration:320,easing:"ease-out"})}}
  function bind(){const r=root(),b=bull(),p=price();if(!r||!b||!p||!injectToggle())return false;applyBias();applyFx();lastPrice=parsePrice();bullObserver=new MutationObserver(applyBias);bullObserver.observe(b,{childList:true,subtree:true,characterData:true});priceObserver=new MutationObserver(priceTick);priceObserver.observe(p,{childList:true,subtree:true,characterData:true});document.documentElement.dataset.oracleFx406013="ready";return true}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
  globalThis.ErithOracleFx406013=Object.freeze({build:BUILD,bind,presentation_only:true,source_structure_modified:false,window_manager_modified:false,oracle_model_modified:false,oracle_canvas_modified:false,network_request_added:false,recurring_timer_added:false});
})();
