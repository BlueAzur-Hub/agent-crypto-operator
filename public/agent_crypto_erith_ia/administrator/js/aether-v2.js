/* Agent-Crypto @erith.IA — Build 40.6.83
   AETHER WATCH V2 — FINAL CONSOLIDATED RUNTIME
   No recurring timer, no MutationObserver, no network owner, no Market Core edit. */
(() => {
  "use strict";
  const BUILD="40.6.83";
  const BACKPLATE="./assets/aether/aether-observatory-master-v2.png";
  const root=document.documentElement;
  function warmBackplate(){
    root.setAttribute('data-aether-backplate-v2','loading');
    const image=new Image(); image.decoding='async'; const src=new URL(BACKPLATE,document.baseURI).href;
    const ready=()=>{root.setAttribute('data-aether-backplate-v2','ready');root.dataset.aetherCanonicalVisualBuild=BUILD;};
    const fallback=()=>{root.setAttribute('data-aether-backplate-v2','fallback-40.6.73');root.dataset.aetherCanonicalVisualBuild='fallback';};
    image.addEventListener('load',()=>{const decoded=typeof image.decode==='function'?image.decode():Promise.resolve();Promise.resolve(decoded).then(ready).catch(fallback);},{once:true});
    image.addEventListener('error',fallback,{once:true}); image.src=src; return src;
  }

  function explainAtlas(){
    const card=document.querySelector('.aether46-card[data-aether-card-406046="atlas"]');
    const score=card?.querySelector('[data-aether46="atlas_score"]');
    if(!card||!score) return false;
    const value=String(score.textContent||"N/D").trim();
    const explanation=`${value} · score directionnel Atlas de -100 à +100 : signe = direction, amplitude = intensité relative du momentum mesuré. Ce n’est ni une probabilité ni une confiance.`;
    card.dataset.aetherAtlasScoreKind="direction";
    card.title=explanation; score.title=explanation; score.setAttribute("aria-label",explanation);
    return true;
  }

  function weatherGlyph(){
    const card=document.querySelector('.aether46-card[data-aether-card-406046="weather"]');
    if(!card) return false;
    const status=String(card.querySelector('[data-aether46="weather_status"]')?.textContent||"").toUpperCase();
    const detail=String(card.querySelector('[data-aether46="weather_detail"]')?.textContent||"").toUpperCase();
    const rainText=String(card.querySelector('[data-aether46="weather_rain"]')?.textContent||"");
    const rain=Number((rainText.match(/\d+(?:[.,]\d+)?/)||[])[0]?.replace(',','.'));
    const hour=new Date().getHours();
    const night=hour>=21||hour<6;
    let glyph=night?'☾':'☀'; let label=night?'Nuit':'Éclaircies';
    if(/ORAGE|THUNDER|ÉCLAIR/.test(`${status} ${detail}`)){glyph='⚡';label='Orage';}
    else if(Number.isFinite(rain)&&rain>=60){glyph='☂';label='Pluie';}
    else if((Number.isFinite(rain)&&rain>=25)||/NUAGE|COUVERT|PARTIEL/.test(`${status} ${detail}`)){glyph='☁';label='Nuageux';}
    card.dataset.aetherWeatherGlyph=glyph; card.dataset.aetherWeatherLabel=label;
    card.setAttribute('aria-label',`Météo 5 jours · ${label}`);
    return true;
  }

  function enhance(reason='runtime'){
    explainAtlas();
    weatherGlyph();
    root.dataset.aetherOperatorEnhancement=`${BUILD}:${reason}`;
    return true;
  }
  function afterPaint(reason){queueMicrotask(()=>requestAnimationFrame(()=>enhance(reason)));}
  function captureIntent(event){if(!(event.target instanceof Element))return;if(!event.target.closest('#atlasAetherStatusToggle'))return;afterPaint('operator-open');}
  const backplate=warmBackplate();
  document.addEventListener('click',captureIntent,true);
  window.addEventListener('erith:administrator-mirror-ready',()=>afterPaint('manager-ready'),{once:true});
  document.addEventListener('pointerover',event=>{if(event.target instanceof Element&&event.target.closest('#atlasAetherStatusPanel'))enhance('panel-interaction');},{passive:true});
  afterPaint('load');
  globalThis.ErithAetherV2Canonical=Object.freeze({build:BUILD,backplate,geometry_owner:'ErithAdministratorWindows',legacy_migration:false,atlas_explainability:true,weather_glyph:true,recurring_timer:false,observer:false,network_owner:false,market_core_changed:false,enhance});
})();
