/* Agent-Crypto @erith.IA — Build 40.6.82
   AETHER WATCH V2 — FINAL CONSOLIDATED RUNTIME
   No recurring timer, no MutationObserver, no network owner, no Market Core edit. */
(() => {
  "use strict";
  const BUILD="40.6.82";
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

  const STORAGE_KEY="erith_admin_portal_39_2_9:window:aether-watch";
  const MARGIN=12, CENTER_EPSILON=14;
  let migrationResolved=false;
  function viewportWidth(){return Math.max(document.documentElement.clientWidth,window.innerWidth||0);}
  function legacyCentered(g){if(!g)return false;const cx=Math.max(MARGIN,Math.round((viewportWidth()-g.width)/2));return g.x>MARGIN+CENTER_EPSILON&&Math.abs(g.x-cx)<=CENTER_EPSILON;}
  function storageGeometry(raw){const src=raw?.geometry&&typeof raw.geometry==='object'?raw.geometry:raw;if(!src||typeof src!=='object')return null;const g={x:Number(src.x),y:Number(src.y),width:Number(src.width),height:Number(src.height)};return Object.values(g).every(Number.isFinite)?g:null;}
  function migrateStored(reason='storage-preflight'){
    try{const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');const g=storageGeometry(raw);if(!g)return false;if(!legacyCentered(g)){document.documentElement.dataset.aetherPositionMigration=`preserved:${reason}`;return false;}const next={...raw};if(raw?.geometry&&typeof raw.geometry==='object')next.geometry={...raw.geometry,x:MARGIN};else next.x=MARGIN;localStorage.setItem(STORAGE_KEY,JSON.stringify(next));document.documentElement.dataset.aetherPositionMigration=`stored-left:${reason}`;return true;}catch(_){return false;}
  }
  function migrateManager(reason='manager-preflight'){
    const manager=globalThis.ErithAdministratorWindows;const win=manager?.getWindow?.('aether-watch');const snap=manager?.snapshot?.();const saved=snap?.windows?.['aether-watch'];if(!manager||!win||!snap)return false;const raw=saved?.geometry||win?.geometry;const g=storageGeometry(raw);if(!g)return false;if(!legacyCentered(g)){migrationResolved=true;return false;}const floating=saved?.floating===true||win?.floating===true;const hidden=saved?.hidden===true||win?.hidden===true;const minimized=saved?.minimized===true||win?.minimized===true;const maximized=saved?.maximized===true||win?.maximized===true;if(minimized||maximized)return false;manager.applySnapshot({schema:snap.schema||'erith.admin.workspace.window-state.v1',windows:{'aether-watch':{floating,minimized:false,hidden,maximized:false,geometry:{x:MARGIN,y:g.y,width:g.width,height:g.height}}}},{persist:true,captureResult:false});migrationResolved=true;document.documentElement.dataset.aetherPositionMigration=`manager-left:${reason}`;return true;
  }
  function migrate(reason='pre-reveal'){if(migrationResolved)return false;const a=migrateStored(reason);const b=migrateManager(reason);if(a||b)migrationResolved=true;return a||b;}

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
  function captureIntent(event){if(!(event.target instanceof Element))return;if(!event.target.closest('#atlasAetherStatusToggle'))return;migrate('operator-pre-open');afterPaint('operator-open');}
  const backplate=warmBackplate();

  migrate('runtime-load');
  window.addEventListener('erith:administrator-mirror-ready',()=>migrate('manager-ready'),{once:true});
  document.addEventListener('click',captureIntent,true);
  window.addEventListener('erith:administrator-mirror-ready',()=>afterPaint('manager-ready'),{once:true});
  document.addEventListener('pointerover',event=>{if(event.target instanceof Element&&event.target.closest('#atlasAetherStatusPanel'))enhance('panel-interaction');},{passive:true});
  afterPaint('load');
  globalThis.ErithAetherV2Canonical=Object.freeze({build:BUILD,backplate,geometry_owner:'ErithAdministratorWindows',legacy_migration:true,atlas_explainability:true,weather_glyph:true,recurring_timer:false,observer:false,network_owner:false,market_core_changed:false,enhance,migrate});
})();
