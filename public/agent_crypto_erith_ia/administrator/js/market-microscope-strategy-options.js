/* ERITH.IA · Market Microscope Strategy Options · first safe increment.
   Shared by Administrator and Trader's mirrored Administrator runtime.
   Adds validated EMA and Bollinger controls via the canonical chart API.
   Profiles contain indicator visibility + numerical display settings,
   NEVER trading strategies, simulated orders, or real execution. */
(()=>{"use strict";
  if(typeof document==="undefined"||globalThis.ErithMarketStrategyOptions)return;
  const ROOT="atlasMarketMicroscope",PANEL="erithStrategyOptionsPanel",BUTTON="erithStrategyOptionsButton";
  const LEGACY_KEY_V1="agentCrypto.marketMicroscope.paperIndicatorProfiles.v1";
  const LEGACY_KEY_V2="agentCrypto.marketMicroscope.paperIndicatorProfiles.v2";
  const KEY="agentCrypto.marketMicroscope.paperIndicatorProfiles.v3";
  const DEFAULT_EMA=Object.freeze([5,10,20]);
  const DEFAULT_BOLL=Object.freeze({period:20,multiplier:2});
  const CODES=Object.freeze(["ma","ema","sr","supertrend","boll","sar","vwap","vp"]);
  const LABEL=Object.freeze({ma:"MA · 5 / 10 / 20",ema:"EMA · 5 / 10 / 20",sr:"Supports / résistances",supertrend:"SuperTrend · 10 × 3",boll:"Bollinger · 20 × 2",sar:"Parabolic SAR · 0,02 / 0,20",vwap:"VWAP fenêtre",vp:"Volume Profile · 24 zones"});
  const PRESETS=Object.freeze({
    tendance:["ma","ema","sr","supertrend"],
    volatilite:["ema","boll","sar"],
    niveaux:["ma","sr","vwap","vp"],
    complets:CODES.slice(),
    aucun:[]
  });
  const $=id=>document.getElementById(id);
  const root=() =>$(ROOT);
  const api=()=>globalThis.AgentCryptoMarketMicroscope;
  const safeName=name=>String(name||"").trim().replace(/[<>\\/"'\x00-\x1f]/g,"").slice(0,48);
  const normalize=value=>{
    const x=value&&typeof value==="object"?value:{};
    return Object.fromEntries(CODES.map(k=>[k,x[k]===true]));
  };
  const validPeriods=p=>Array.isArray(p)&&p.length===3
    &&p.every(n=>Number.isInteger(n)&&n>=2&&n<=200)
    &&p[0]<p[1]&&p[1]<p[2];
  const validBoll=p=>!!p&&typeof p==="object"&&!Array.isArray(p)
    &&Number.isInteger(p.period)&&p.period>=2&&p.period<=200
    &&typeof p.multiplier==="number"&&Number.isFinite(p.multiplier)
    &&p.multiplier>=0.1&&p.multiplier<=5
    &&Math.abs(p.multiplier*100-Math.round(p.multiplier*100))<1e-8;
  const currentBoll=()=>{
    const p=api()?.bollingerSettings?.();
    return validBoll(p)?{period:p.period,multiplier:p.multiplier}:{...DEFAULT_BOLL};
  };
  const currentEmaPeriods=()=>{
    const p=api()?.emaPeriods?.();
    return validPeriods(p)?p.slice():DEFAULT_EMA.slice();
  };
  const normalizeProfile=value=>{
    const rich=value&&typeof value==="object"&&value.indicators&&typeof value.indicators==="object";
    const periods=rich&&validPeriods(value.emaPeriods)?value.emaPeriods.slice():DEFAULT_EMA.slice();
    const b=rich&&validBoll(value.bollSettings)?value.bollSettings:DEFAULT_BOLL;
    return {indicators:normalize(rich?value.indicators:value),emaPeriods:periods,bollSettings:{period:b.period,multiplier:b.multiplier}};
  };
  const readProfiles=()=>{
    try{
      // V3 is additive: v2 and v1 data are read but never overwritten.
      const raw=localStorage.getItem(KEY)??localStorage.getItem(LEGACY_KEY_V2)??localStorage.getItem(LEGACY_KEY_V1)??"{}";
      const value=JSON.parse(raw);
      if(!value||typeof value!=="object"||Array.isArray(value))return {};
      const out=Object.create(null);
      Object.keys(value).slice(0,20).forEach(name=>{
        const k=safeName(name);
        if(k&&k!=="__proto__"&&k!=="constructor")out[k]=normalizeProfile(value[name]);
      });
      return out;
    }catch(_){return {};}
  };
  const writeProfiles=profiles=>{
    try{localStorage.setItem(KEY,JSON.stringify(profiles));return true;}catch(_){return false;}
  };
  const current=()=>normalize(api()?.indicatorState?.());
  const buttonFor=k=>root()?.querySelector('.amm-indicators [data-amm-indicator="'+k+'"]');
  function apply(state){
    const desired=normalize(state),old=current();
    const absent=[];
    CODES.forEach(k=>{
      if(old[k]!==desired[k]){
        const b=buttonFor(k);
        if(!b){absent.push(k);return;}
        b.click(); // official Market Microscope toggle: persists, redraws, clears stale S/R.
      }
    });
    sync();
    return absent.length===0;
  }
  function status(message,warning=false){
    const el=$("erithStrategyStatus");
    if(el){el.textContent=message;el.dataset.warning=String(warning);}
  }
  function renderPaperSignals(){
    const summary=$("erithPaperEmaSummary");
    if(!summary)return;
    const engine=api(),report=engine?.paperEmaCrossSnapshot?.();
    if(!report){summary.textContent="Moteur PAPER V4 non chargé.";return;}
    const checkbox=$(PANEL)?.querySelector("[data-erith-paper-signal]");
    if(checkbox)checkbox.checked=!!report.visible;
    const events=report.events||[],last=events[events.length-1];
    if(!report.archiveSupported){summary.textContent="Archives annuelles : signaux désactivés tant que la clôture des bougies n’est pas certifiée.";return;}
    if(!report.rows){summary.textContent="Aucune bougie historique chargée. Aucun signal à afficher.";return;}
    let when="—";
    if(last)try{when=new Date(last.t).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});}catch(_){}
    summary.textContent=events.length+" croisement(s) EMA "+report.fastPeriod+"/"+report.slowPeriod
      +" sur "+report.rows+" bougies chargées · "+report.instrument+" · "+report.bar
      +(last?" · dernier : "+(last.direction==="UP"?"haussier":"baissier")+" ("+when+")":". Aucun croisement confirmé dans la série.");
  }
  function sync(){
    const panel=$(PANEL);
    if(!panel)return false;
    const enabled=current();
    panel.querySelectorAll("[data-erith-indicator]").forEach(c=>{c.checked=!!enabled[c.dataset.erithIndicator];});
    const periods=currentEmaPeriods();
    panel.querySelectorAll("[data-erith-ema-period]").forEach(c=>{
      c.value=String(periods[Number(c.dataset.erithEmaPeriod)]);
    });
    const emaLabel=panel.querySelector('[data-erith-indicator="ema"]')?.nextElementSibling;
    if(emaLabel)emaLabel.textContent="EMA · "+periods.join(" / ");
    const boll=currentBoll();
    panel.querySelectorAll("[data-erith-boll-setting]").forEach(c=>{
      c.value=String(boll[c.dataset.erithBollSetting]);
    });
    const bollLabel=panel.querySelector('[data-erith-indicator="boll"]')?.nextElementSibling;
    if(bollLabel)bollLabel.textContent="Bollinger · "+boll.period+" × "+boll.multiplier;
    const selected=CODES.filter(k=>enabled[k]);
    const meta=$("erithStrategySummary");
    if(meta)meta.textContent=selected.length+" / "+CODES.length+" indicateurs actifs · "+(api()?.snapshot?.()?.loadedBar||"historique en attente");
    renderPaperSignals();
    const names=readProfiles(),picker=$("erithStrategyProfiles"),old=picker?.value;
    if(picker){
      picker.replaceChildren();
      const empty=document.createElement("option");empty.value="";empty.textContent="— Choisir un profil enregistré —";picker.appendChild(empty);
      Object.keys(names).sort((a,b)=>a.localeCompare(b,"fr")).forEach(name=>{
        const o=document.createElement("option");o.value=name;o.textContent=name;picker.appendChild(o);
      });
      if(old&&Object.hasOwn(names,old))picker.value=old;
    }
    return true;
  }
  function createStyle(){
    if($("erithStrategyOptionsStyle"))return;
    const style=document.createElement("style");style.id="erithStrategyOptionsStyle";
    style.textContent=
      "#"+ROOT+" #"+BUTTON+"{min-height:25px;padding:5px 9px;border:1px solid #5a9eaf;border-radius:999px;background:#0b3041;color:#c8f5ff;font:900 9px/1 system-ui;cursor:pointer;white-space:nowrap}"+
      "#"+ROOT+" #"+BUTTON+"[aria-expanded=true]{background:#8fefff;color:#091923}"+
      "#"+ROOT+" #"+PANEL+"{position:absolute;z-index:60;top:37px;right:12px;width:min(375px,calc(100% - 24px));max-height:min(65vh,600px);overflow:auto;padding:13px;border:1px solid #65c8d5;border-radius:11px;background:#031722;color:#dff6fa;box-shadow:0 18px 48px #000a;font:12px/1.35 system-ui,sans-serif;box-sizing:border-box}"+
      "#"+ROOT+" #"+PANEL+"[hidden]{display:none!important}"+
      "#"+ROOT+" #"+PANEL+" h3{font:900 15px/1.3 system-ui;color:#ffdfa0;margin:0}"+
      "#"+ROOT+" #"+PANEL+" p{font:11px/1.4 system-ui;color:#a4becb;margin:7px 0}"+
      "#"+ROOT+" #"+PANEL+" .erith-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:8px 0}"+
      "#"+ROOT+" #"+PANEL+" button{border:1px solid #49697c;border-radius:7px;background:#092a3a;color:#e1f8fa;padding:7px 9px;cursor:pointer;font:800 11px system-ui}"+
      "#"+ROOT+" #"+PANEL+" button:hover{border-color:#7ce0e9}"+
      "#"+ROOT+" #"+PANEL+" button:focus-visible,#"+ROOT+" #"+PANEL+" input:focus-visible,#"+ROOT+" #"+PANEL+" select:focus-visible{outline:2px solid #8fefff;outline-offset:2px}"+
      "#"+ROOT+" #"+PANEL+" .erith-indicators{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;margin:10px 0}"+
      "#"+ROOT+" #"+PANEL+" .erith-indicators label{display:flex;align-items:center;gap:6px;border:1px solid #264353;border-radius:7px;padding:6px;min-height:30px;font:11px/1.2 system-ui;color:#d3e9ed;cursor:pointer}"+
      "#"+ROOT+" #"+PANEL+" .erith-indicators input{accent-color:#64d9e5}"+
      "#"+ROOT+" #"+PANEL+" input[type=text],#"+ROOT+" #"+PANEL+" input[type=number],#"+ROOT+" #"+PANEL+" select{box-sizing:border-box;min-width:0;flex:1 1 145px;padding:8px;background:#061e2d;border:1px solid #476879;border-radius:6px;color:#fff;font:11px system-ui}"+
      "#"+ROOT+" #"+PANEL+" .erith-ema-inputs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:8px 0}"+
      "#"+ROOT+" #"+PANEL+" .erith-ema-inputs label{display:flex;flex-direction:column;gap:4px;color:#b9dde4;font:11px system-ui}"+
      "#"+ROOT+" #"+PANEL+" .erith-ema-inputs input{width:100%;flex:none}"+
      "#"+ROOT+" #"+PANEL+" .erith-boll-inputs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin:8px 0}"+
      "#"+ROOT+" #"+PANEL+" .erith-boll-inputs label{display:flex;flex-direction:column;gap:4px;color:#b9dde4;font:11px system-ui}"+
      "#"+ROOT+" #"+PANEL+" .erith-boll-inputs input{width:100%;flex:none}"+
      "#"+ROOT+" #"+PANEL+" .erith-warning{border-top:1px solid #365463;padding-top:8px;color:#e7be73}"+
      "#"+ROOT+" #erithStrategyStatus{color:#9fe8c7}"+
      "#"+ROOT+" #erithStrategyStatus[data-warning=true]{color:#ffd08b}"+
      "@media(max-width:760px){#"+ROOT+" #"+PANEL+"{top:75px;max-height:60vh}#"+ROOT+" #"+PANEL+" .erith-indicators{grid-template-columns:1fr}}";
    document.head.appendChild(style);
  }
  function makePanel(){
    const panel=document.createElement("section");panel.id=PANEL;panel.hidden=true;
    panel.setAttribute("aria-label","Options et profils d'indicateurs PAPER");
    panel.innerHTML='<div class="erith-row" style="justify-content:space-between;margin-top:0"><h3>Options / Stratégies</h3><button type="button" data-erith-close aria-label="Fermer les options">Fermer ×</button></div>'+
      '<p>Préparer le graphique pour étudier une stratégie sur des bougies réelles. Aucun ordre, aucune simulation automatique à ce stade.</p>'+
      '<strong>Profils de lecture</strong>'+
      '<div class="erith-row" data-erith-presets><button data-erith-preset="tendance">Tendance</button><button data-erith-preset="volatilite">Volatilité</button><button data-erith-preset="niveaux">Niveaux</button><button data-erith-preset="complets">Tous</button><button data-erith-preset="aucun">Aucun</button></div>'+
      '<strong>Indicateurs disponibles</strong><div class="erith-indicators" data-erith-fields></div>'+
      '<p id="erithStrategySummary" aria-live="polite"></p>'+
      '<strong>V2 · Périodes EMA personnalisables</strong>'+
      '<p>Les trois courbes EMA sont recalculées sur toutes les bougies chargées, puis affichées sur la période choisie. Valeurs entières croissantes : 2 à 200.</p>'+
      '<div class="erith-ema-inputs"><label>EMA courte<input type="number" data-erith-ema-period="0" min="2" max="200" step="1" value="5"></label><label>EMA moyenne<input type="number" data-erith-ema-period="1" min="2" max="200" step="1" value="10"></label><label>EMA longue<input type="number" data-erith-ema-period="2" min="2" max="200" step="1" value="20"></label></div>'+
      '<div class="erith-row"><button type="button" data-erith-ema-save>Appliquer les périodes</button><button type="button" data-erith-ema-default>Rétablir 5 / 10 / 20</button></div>'+
      '<strong>V3 · Bandes de Bollinger personnalisables</strong>'+
      '<p>Calcul SMA + écart-type de la population sur toutes les bougies chargées. Plus le multiplicateur est élevé, plus les bandes sont larges.</p>'+
      '<div class="erith-boll-inputs"><label>Période (2–200)<input type="number" data-erith-boll-setting="period" min="2" max="200" step="1" value="20"></label><label>Multiplicateur (0,10–5)<input type="number" data-erith-boll-setting="multiplier" min="0.1" max="5" step="0.01" value="2"></label></div>'+
      '<div class="erith-row"><button type="button" data-erith-boll-save>Appliquer Bollinger</button><button type="button" data-erith-boll-default>Rétablir 20 / 2</button></div>'+
      '<strong>V4 · Observations PAPER — croisement EMA</strong>'+
      '<p>Quand la première EMA croise la deuxième sur deux bougies consécutives et clôturées, le graphique marque P↑ (hausse) ou P↓ (baisse). Un croisement n’est pas un ordre ni une recommandation.</p>'+
      '<div class="erith-row"><label><input type="checkbox" data-erith-paper-signal> Afficher les croisements confirmés</label><button type="button" data-erith-paper-refresh>Recompter</button></div>'+
      '<p id="erithPaperEmaSummary" role="status" aria-live="polite">Lecture des bougies en attente.</p>'+
      '<strong>Mes profils personnalisés</strong>'+
      '<div class="erith-row"><input id="erithStrategyName" type="text" maxlength="48" placeholder="Nom (ex. EMA de Yoann)" aria-label="Nom du profil"><button type="button" data-erith-save>Enregistrer</button></div>'+
      '<div class="erith-row"><select id="erithStrategyProfiles" aria-label="Profils enregistrés"></select><button type="button" data-erith-load>Charger</button><button type="button" data-erith-delete>Supprimer</button></div>'+
      '<div class="erith-row"><button type="button" data-erith-export>Exporter les profils JSON</button></div>'+
      '<p class="erith-warning">Lecture seule · V4 annote les croisements EMA sur les bougies clôturées. V5 calcule une simulation historique PAPER à la demande, avec frais et glissement fictifs ; ses résultats ne prédisent aucune performance future. Aucune alerte en direct, aucun ordre ni accès aux clés OKX. Les profils personnels sauvegardent les indicateurs, les périodes EMA et Bollinger, pas les signaux ou les transactions fictives.</p>'+
      '<p id="erithStrategyStatus" role="status" aria-live="polite">Aucun ordre réel.</p>';
    const fields=panel.querySelector("[data-erith-fields]");
    CODES.forEach(k=>{
      const label=document.createElement("label"),checkbox=document.createElement("input"),text=document.createElement("span");
      checkbox.type="checkbox";checkbox.dataset.erithIndicator=k;text.textContent=LABEL[k];
      label.append(checkbox,text);fields.appendChild(label);
    });
    return panel;
  }
  function close(){
    const p=$(PANEL),b=$(BUTTON);if(!p||!b)return;
    p.hidden=true;b.setAttribute("aria-expanded","false");
  }
  function toggle(){
    const p=$(PANEL),b=$(BUTTON);if(!p||!b)return;
    p.hidden=!p.hidden;b.setAttribute("aria-expanded",String(!p.hidden));
    if(!p.hidden)sync();
  }
  function exportProfiles(){
    const profiles=readProfiles();
    const content=JSON.stringify({schema:"erith.market-microscope.indicator-profiles.v3",source:"local browser presentation",contains_trading_orders:false,contains_api_credentials:false,indicator_profiles:profiles},null,2);
    const blob=new Blob([content],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="ERITH_IA_MARKET_MICROSCOPE_INDICATOR_PROFILES.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    status("Profils exportés (indicateurs, EMA, Bollinger ; aucune clé API).");
  }
  function handle(event){
    const t=event.target;
    if(t.matches?.("[data-erith-paper-signal]")){
      const enabled=t.checked;
      const result=api()?.setPaperEmaSignalDisplay?.(enabled);
      if(!result?.ok){status("Moteur PAPER indisponible.",true);return;}
      renderPaperSignals();
      status(enabled?"Marqueurs PAPER EMA affichés sur les bougies confirmées.":"Marqueurs PAPER EMA masqués.");
      return;
    }
    if(t.matches?.("[data-erith-indicator]")){
      const key=t.dataset.erithIndicator,b=buttonFor(key),active=!!current()[key];
      if(b&&active!==t.checked){b.click();sync();}
      return;
    }
    const b=t.closest?.("button");
    if(!b)return;
    if(b.matches("[data-erith-close]")){close();$(BUTTON)?.focus();return;}
    if(b.matches("[data-erith-paper-refresh]")){renderPaperSignals();status("Croisements historiques recalculés — aucune transaction.");return;}
    if(b.matches("[data-erith-preset]")){
      const codes=PRESETS[b.dataset.erithPreset];if(!codes)return;
      status(apply(Object.fromEntries(CODES.map(k=>[k,codes.includes(k)])))?"Profil appliqué au graphique.":"Un indicateur n'est pas disponible.",false);return;
    }
    if(b.matches("[data-erith-ema-save]")||b.matches("[data-erith-ema-default]")){
      const periods=b.matches("[data-erith-ema-default]")?DEFAULT_EMA.slice():
        [...$(PANEL).querySelectorAll("[data-erith-ema-period]")].map(x=>
          /^\d{1,3}$/.test(x.value.trim())?Number(x.value):NaN);
      if(!validPeriods(periods)){status("EMA : saisir trois nombres entiers croissants entre 2 et 200.",true);return;}
      const result=api()?.setEmaPeriods?.(periods);
      if(!result?.ok){status(result?.error||"Moteur EMA V2 indisponible.",true);return;}
      sync();
      status("EMA "+periods.join(" / ")+" recalculées sur l'historique chargé."
        +(result.persisted?" Réglages conservés.":" Stockage local indisponible."),!result.persisted);
      return;
    }
    if(b.matches("[data-erith-boll-save]")||b.matches("[data-erith-boll-default]")){
      const reset=b.matches("[data-erith-boll-default]");
      const periodRaw=$(PANEL).querySelector('[data-erith-boll-setting="period"]')?.value?.trim()||"";
      const multiplierRaw=$(PANEL).querySelector('[data-erith-boll-setting="multiplier"]')?.value?.trim()||"";
      const settings=reset?{...DEFAULT_BOLL}:{
        period:/^[0-9]{1,3}$/.test(periodRaw)?Number(periodRaw):NaN,
        multiplier:/^[0-9]{1,3}(?:[.][0-9]{1,2})?$/.test(multiplierRaw)?Number(multiplierRaw):NaN
      };
      if(!validBoll(settings)){status("Bollinger : période entière 2–200, multiplicateur 0,10–5 (maximum 2 décimales).",true);return;}
      const result=api()?.setBollingerSettings?.(settings);
      if(!result?.ok){status(result?.error||"Moteur Bollinger V3 indisponible.",true);return;}
      sync();
      status("Bandes Bollinger "+settings.period+" × "+settings.multiplier+" recalculées."
        +(result.persisted?" Réglages conservés.":" Stockage local indisponible."),!result.persisted);
      return;
    }
    if(b.matches("[data-erith-save]")){
      const name=safeName($("erithStrategyName")?.value);
      if(!name){status("Indique un nom de profil.",true);return;}
      const profiles=readProfiles();
      if(!Object.hasOwn(profiles,name)&&Object.keys(profiles).length>=20){status("Limite de 20 profils atteinte.",true);return;}
      profiles[name]={indicators:current(),emaPeriods:currentEmaPeriods(),bollSettings:currentBoll()};
      if(!writeProfiles(profiles)){status("Enregistrement local indisponible.",true);return;}
      sync();$("erithStrategyProfiles").value=name;status("Profil « "+name+" » enregistré dans ce navigateur.");return;
    }
    if(b.matches("[data-erith-load]")){
      const name=$("erithStrategyProfiles")?.value,profile=readProfiles()[name];
      if(!name||!profile){status("Sélectionne un profil enregistré.",true);return;}
      if(!validPeriods(profile.emaPeriods)||!validBoll(profile.bollSettings)){
        status("Profil incompatible avec les réglages EMA / Bollinger.",true);return;
      }
      if(!api()?.setEmaPeriods||!api()?.setBollingerSettings){
        status("Moteur d'indicateurs V3 indisponible.",true);return;
      }
      const periodsResult=api().setEmaPeriods(profile.emaPeriods);
      const bollResult=api().setBollingerSettings(profile.bollSettings);
      if(!periodsResult.ok||!bollResult.ok){
        status("Impossible d'appliquer tous les réglages de ce profil.",true);return;
      }
      const applied=apply(profile.indicators);
      status(applied?"Profil « "+name+" » appliqué (indicateurs + EMA + Bollinger).":"Un indicateur du profil est indisponible.",!applied);return;
    }
    if(b.matches("[data-erith-delete]")){
      const name=$("erithStrategyProfiles")?.value,profiles=readProfiles();
      if(!name||!Object.hasOwn(profiles,name)){status("Sélectionne un profil.",true);return;}
      delete profiles[name];if(!writeProfiles(profiles)){status("Stockage indisponible.",true);return;}
      sync();status("Profil supprimé localement.");return;
    }
    if(b.matches("[data-erith-export]"))exportProfiles();
  }
  function mount(){
    const r=root(),host=r?.querySelector(".amm-indicators");
    if(!r||!host||!api()?.indicatorState)return false;
    createStyle();
    if(!$(BUTTON)){
      const b=document.createElement("button");b.id=BUTTON;b.type="button";b.textContent="⚙ Options";b.setAttribute("aria-controls",PANEL);b.setAttribute("aria-expanded","false");b.title="Options et profils d'indicateurs (PAPER, lecture seule)";
      b.addEventListener("click",e=>{e.stopPropagation();toggle();});host.appendChild(b);
    }
    if(!$(PANEL)){
      const panel=makePanel();r.appendChild(panel);panel.addEventListener("click",handle);panel.addEventListener("change",handle);
    }
    sync();
    return true;
  }
  const boot=()=>mount();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  window.addEventListener("pageshow",boot,{passive:true});
  window.addEventListener("atlas:v2mode",()=>queueMicrotask(boot),{passive:true});
  document.addEventListener("click",e=>{
    if(e.target?.closest?.("#"+ROOT+"Controls [data-amm-mode]"))queueMicrotask(boot);
    else if(e.target?.closest?.("#"+ROOT+" [data-amm-indicator]"))queueMicrotask(sync);
  },{passive:true});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$(PANEL)?.hidden)close();});
  globalThis.ErithMarketStrategyOptions=Object.freeze({
    version:"2026-11-06-paper-indicator-profiles-v4-ema-paper-cross",mount,apply,current,readProfiles,close,emaPeriods:currentEmaPeriods,validEmaPeriods:validPeriods,bollingerSettings:currentBoll,validBollingerSettings:validBoll,
    read_only:true,real_order:false,paper_execution:false,api_credentials:false
  });
})();