/* Agent-Crypto — 40.6.528 NEW LISTINGS RADAR V1 · CANONICAL SEARCH
   Permanent read-only discovery surface for very recent crypto assets.
   New-listing identity is canonical name/id + ticker + exchange provenance; ticker alone is never treated as unique.
   No state.coins injection, no ranking mutation, no price fabrication, no storage, no timers, no observer, no order.
   External research is voluntary navigation through the existing Web Research boundary: zero automatic ingestion.
*/
(()=>{
  "use strict";

  const BUILD="40.6.528";
  const ROOT="atlasNewListingsRadar406528";
  const BUTTON="atlasNewListingsButton406528";
  const SEARCH="atlasNewListingsSearch406528";
  const RESULTS="atlasNewListingsResults406528";
  const EMPTY="atlasNewListingsEmpty406528";
  const AGE_FILTER="atlasNewListingsAge406528";

  const REGISTRY=Object.freeze([
    Object.freeze({
      id:"concrete",
      canonical_key:"concrete|ct|2026-09-30",
      symbol:"CT",
      name:"Concrete",
      aliases:Object.freeze(["concrete","ct"]),
      listed_at:"2026-09-30T10:00:00Z",
      category:"NEW_LISTING",
      status:"TRACKED",
      identity_note:"Ticker CT non unique : utiliser Concrete + id concrete + source exchange.",
      pairs:Object.freeze([
        Object.freeze({exchange:"OKX Europe",pair:"CT/USD",quote:"USD",kind:"spot",verified:true}),
        Object.freeze({exchange:"OKX Europe",pair:"CT/EUR",quote:"EUR",kind:"spot",verified:true}),
        Object.freeze({exchange:"OKX",pair:"CT/USDT",quote:"USDT",kind:"spot",verified:true}),
        Object.freeze({exchange:"MEXC",pair:"CT/USDC",quote:"USDC",kind:"spot",verified:true}),
        Object.freeze({exchange:"MEXC",pair:"CT/USDT",quote:"USDT",kind:"spot",verified:true})
      ]),
      provenance:Object.freeze([
        Object.freeze({label:"OKX · CT/USD + CT/EUR",url:"https://www.okx.com/en-eu/help/okx-will-launch-ct-usd-and-ct-eur-for-spot-trading"}),
        Object.freeze({label:"OKX · CT/USDT",url:"https://www.okx.com/en-eu/help/okx-to-list-ct-usdt-concrete-for-spot-trading"}),
        Object.freeze({label:"MEXC · CT/USDC + CT/USDT",url:"https://www.mexc.com/announcements/article/first-in-market-17827791538925"})
      ])
    })
  ]);

  const state={query:"",age:"all"};

  function esc(v){return String(v??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function norm(v){return String(v||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
  function daysSince(iso){const t=Date.parse(iso);return Number.isFinite(t)?Math.max(0,(Date.now()-t)/86400000):null;}
  function ageBucket(asset){const d=daysSince(asset.listed_at);if(d===null)return "unknown";if(d<1)return "lt1";if(d<4)return "1to3";if(d<8)return "4to7";if(d<31)return "8to30";return "older";}
  function ageLabel(asset){const d=daysSince(asset.listed_at);if(d===null)return "âge inconnu";if(d<1)return "moins de 24 h";const whole=Math.floor(d);return `${whole} jour${whole>1?"s":""}`;}
  function displayCurrency(){try{return String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||"EUR").toUpperCase()==="USD"?"USD":"EUR";}catch(_){return "EUR";}}
  function marketAsset(asset){try{return globalThis.AtlasMarketUniverse1000?.find?.(asset.id)||null;}catch(_){return null;}}
  function priceValue(coin,currency){if(!coin)return null;const raw=currency==="USD"?coin.priceUsd:(coin.priceEur??coin.price);const n=Number(raw);return Number.isFinite(n)&&n>0?n:null;}
  function money(value,currency){const n=Number(value);if(!Number.isFinite(n)||n<=0)return "—";const digits=n>=1000?2:n>=1?4:6;try{return new Intl.NumberFormat("fr-FR",{style:"currency",currency,minimumFractionDigits:Math.min(2,digits),maximumFractionDigits:digits}).format(n);}catch(_){return currency==="USD"?`${n.toFixed(digits)} $US`:`${n.toFixed(digits)} €`;}}

  function haystack(asset){return norm([asset.id,asset.name,asset.symbol,...(asset.aliases||[]),...(asset.pairs||[]).flatMap(p=>[p.exchange,p.pair,p.quote])].join(" "));}
  function matchAsset(asset,q){const n=norm(q);if(!n)return true;return haystack(asset).includes(n);}
  function filtered(){return REGISTRY.filter(asset=>matchAsset(asset,state.query)&&(state.age==="all"||ageBucket(asset)===state.age));}

  function style(){
    if(document.getElementById(ROOT+"Style"))return;
    const s=document.createElement("style");s.id=ROOT+"Style";s.textContent=`
#${ROOT}{margin:8px 0 10px;padding:10px 12px;border:1px solid rgba(102,229,255,.24);border-radius:12px;background:linear-gradient(180deg,rgba(5,23,34,.94),rgba(3,14,24,.94));box-shadow:0 14px 35px rgba(0,0,0,.25)}
#${ROOT}[hidden]{display:none!important}#${ROOT} button{cursor:pointer}
#${ROOT} .anl-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
#${ROOT} .anl-head b{font:950 13px/1.1 system-ui,sans-serif;color:#fff1c5}#${ROOT} .anl-head small{display:block;margin-top:3px;font:800 9px/1.35 system-ui,sans-serif;color:#80a7b8}
#${ROOT} .anl-tools{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:7px;margin:9px 0 8px;align-items:center}
#${ROOT} .anl-search{display:flex;gap:6px;min-width:0}#${ROOT} .anl-search input{width:100%;min-width:0;padding:8px 10px;border-radius:9px;border:1px solid rgba(102,229,255,.22);background:#07131d;color:#e9f8ff;font:850 10px/1.2 system-ui}
#${ROOT} .anl-age{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}#${ROOT} .anl-age button{padding:7px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.03);color:#9fb9c7;font:900 8px/1 system-ui}#${ROOT} .anl-age button.active{border-color:rgba(111,235,255,.45);color:#e7fdff;background:rgba(54,187,214,.14)}
#${ROOT} .anl-rule{margin:0 0 8px;padding:7px 9px;border-radius:8px;border:1px solid rgba(255,205,103,.18);background:rgba(55,34,8,.16);color:#d9c897;font:800 8px/1.35 system-ui}
#${ROOT} .anl-results{display:grid;gap:8px}.anl-asset-card{display:grid;grid-template-columns:minmax(210px,.8fr) minmax(0,1.35fr) minmax(220px,.9fr);gap:9px;padding:9px;border:1px solid rgba(255,255,255,.075);border-radius:11px;background:rgba(255,255,255,.018)}
#${ROOT} .anl-card{padding:9px 10px;border:1px solid rgba(255,255,255,.07);border-radius:10px;background:rgba(0,0,0,.13)}#${ROOT} .anl-asset{display:flex;gap:9px;align-items:center}#${ROOT} .anl-coin{width:36px;height:36px;display:grid;place-items:center;border-radius:50%;background:linear-gradient(135deg,#ffd171,#ff8a25);color:#08131b;font:1000 15px/1 system-ui}
#${ROOT} .anl-asset strong{font:950 14px/1 system-ui;color:#fff}#${ROOT} .anl-asset em{font:900 10px/1 system-ui;color:#73eaff;font-style:normal;margin-left:5px}#${ROOT} .anl-meta{display:block;margin-top:4px;color:#8daab8;font:800 8px/1.3 system-ui}#${ROOT} .anl-price{margin-top:8px;font:950 17px/1.1 ui-monospace,monospace;color:#dffcff}#${ROOT} .anl-truth{margin-top:5px;font:800 8px/1.35 system-ui;color:#87a5b4}
#${ROOT} .anl-warning{margin-top:7px;padding:6px 7px;border-radius:7px;background:rgba(255,195,73,.08);border:1px solid rgba(255,195,73,.18);color:#f2d78f;font:850 8px/1.35 system-ui}
#${ROOT} .anl-pairs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}#${ROOT} .anl-pair{padding:7px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.16)}#${ROOT} .anl-pair b{display:block;color:#e9f8ff;font:900 10px/1.2 ui-monospace,monospace}#${ROOT} .anl-pair small{color:#8ba8b8;font:800 8px/1.2 system-ui}
#${ROOT} .anl-source a{display:block;margin:4px 0;color:#82eaff;text-decoration:none;font:800 8px/1.25 system-ui}#${ROOT} .anl-source p{margin:0 0 6px;color:#a8bdc8;font:800 8px/1.35 system-ui}#${ROOT} .anl-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
#${ROOT} .anl-empty{padding:13px;border:1px dashed rgba(255,205,103,.24);border-radius:10px;background:rgba(48,29,5,.10)}#${ROOT} .anl-empty b{display:block;color:#ffe09a;font:950 11px/1.2 system-ui}#${ROOT} .anl-empty p{margin:5px 0;color:#9fb5c0;font:800 8px/1.4 system-ui}
@media(max-width:900px){#${ROOT} .anl-tools{grid-template-columns:1fr}#${ROOT} .anl-age{justify-content:flex-start}.anl-asset-card{grid-template-columns:1fr!important}}
`;document.head.appendChild(s);
  }

  function panel(){let root=document.getElementById(ROOT);if(root)return root;const table=document.getElementById("marketTableWindowBody");if(!table)return null;root=document.createElement("section");root.id=ROOT;root.hidden=true;root.setAttribute("aria-label","Radar nouveaux listings crypto");table.parentNode.insertBefore(root,table);return root;}

  function findInMarket(asset){const input=document.getElementById("searchInput");if(!input)return false;input.value=asset.id;input.dispatchEvent(new Event("input",{bubbles:true}));const limit=document.querySelector('[data-market-limit="1000"]');if(limit&&!limit.classList.contains("is-active"))limit.click();try{void globalThis.AtlasMarketUniverse1000?.ensure?.(1000);}catch(_){}try{input.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",code:"Enter",bubbles:true}));}catch(_){}return true;}

  function externalResearch(q){const raw=String(q||state.query||"").trim();if(!raw)return false;const phrase=`${raw} crypto new listing spot exchange`;const field=document.getElementById("internetResearchQuery");if(field)field.value=phrase;try{if(globalThis.ErithInternetResearch?.open)return globalThis.ErithInternetResearch.open("google")!==false;}catch(_){/* fallback below */}const a=document.createElement("a");a.href=`https://www.google.com/search?q=${encodeURIComponent(phrase)}`;a.target="_blank";a.rel="noopener noreferrer";a.style.display="none";document.body.appendChild(a);a.click();a.remove();return true;}

  function renderCard(asset){const currency=displayCurrency(),loaded=marketAsset(asset),price=priceValue(loaded,currency);const loadedTruth=loaded?`Déjà présent dans l’univers Market · rang ${loaded.rank??"—"} · source ${loaded.source||loaded.sourceMode||"Market"}`:"Suivi par le Radar Nouveaux Listings · indépendant du Top 1000.";return `
    <article class="anl-asset-card" data-new-listing-id="${esc(asset.id)}">
      <div class="anl-card"><div class="anl-asset"><span class="anl-coin">${esc(asset.symbol)}</span><div><strong>${esc(asset.name)} <em>${esc(asset.symbol)}</em></strong><small class="anl-meta">ID ${esc(asset.id)} · listing ${esc(new Date(asset.listed_at).toLocaleDateString("fr-FR"))} · ${esc(ageLabel(asset))}</small></div></div><div class="anl-price">${price!==null?money(price,currency):"Prix live non chargé"}</div><div class="anl-truth">${esc(loadedTruth)}</div><div class="anl-warning">${esc(asset.identity_note)}</div><div class="anl-actions"><button type="button" class="btn small primary" data-anl-market="${esc(asset.id)}">Chercher dans Market</button><button type="button" class="btn small" data-anl-web="${esc(asset.name+" "+asset.symbol)}">Recherche Web externe</button></div></div>
      <div class="anl-card"><div class="anl-pairs">${asset.pairs.map(p=>`<div class="anl-pair"><b>${esc(p.pair)}</b><small>${esc(p.exchange)} · ${esc(p.kind)} · ${p.verified?"vérifié":"à vérifier"}</small></div>`).join("")}</div><div class="anl-truth">Les paires restent distinctes : USD ≠ USDC ≠ USDT. Un ticker seul ne prouve jamais l’identité d’un actif.</div></div>
      <div class="anl-card anl-source"><p>Sources de listing enregistrées :</p>${asset.provenance.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>`).join("")}<p>Aucun ordre, wallet, clé privée ou API exchange privée. Recherche Web = onglet externe, zéro ingestion automatique.</p></div>
    </article>`;}

  function renderResults(){const root=document.getElementById(ROOT),host=document.getElementById(RESULTS),empty=document.getElementById(EMPTY);if(!root||!host||!empty)return false;const rows=filtered();host.innerHTML=rows.map(renderCard).join("");empty.hidden=rows.length>0;if(!rows.length){const label=state.query?`Aucun actif suivi ne correspond à « ${state.query} ».`:"Aucun actif suivi dans ce filtre d’âge.";empty.innerHTML=`<b>${esc(label)}</b><p>Le Radar ne force jamais un actif dans le Top 1000. Lance une recherche Web externe pour qualifier une nouvelle piste, puis ajoute-la au registre dans une version contrôlée.</p><button type="button" class="btn small" data-anl-empty-web>Recherche Web externe</button>`;empty.querySelector("[data-anl-empty-web]")?.addEventListener("click",()=>externalResearch(state.query));}
    host.querySelectorAll("[data-anl-market]").forEach(b=>b.addEventListener("click",()=>{const asset=REGISTRY.find(x=>x.id===b.dataset.anlMarket);if(asset)findInMarket(asset);}));host.querySelectorAll("[data-anl-web]").forEach(b=>b.addEventListener("click",()=>externalResearch(b.dataset.anlWeb)));
    root.dataset.resultCount=String(rows.length);root.dataset.query=state.query;root.dataset.ageFilter=state.age;return true;}

  function render(){const root=panel();if(!root)return false;if(!root.dataset.mounted){root.innerHTML=`<div class="anl-head"><div><b>RADAR NOUVEAUX LISTINGS</b><small>Recherche indépendante du Top 1000 · identité canonique · qualification avant Strategy</small></div><button type="button" class="btn small" data-anl-close>Fermer</button></div><div class="anl-tools"><form class="anl-search" data-anl-search-form><input id="${SEARCH}" type="search" autocomplete="off" placeholder="Nom, ticker, paire ou exchange — ex. Concrete, CT/USDC, MEXC"><button class="btn small primary" type="submit">Chercher</button><button class="btn small" type="button" data-anl-clear>Effacer</button></form><div class="anl-age" id="${AGE_FILTER}" aria-label="Âge du listing"><button type="button" data-age="all" class="active">Tous</button><button type="button" data-age="lt1">&lt;24 h</button><button type="button" data-age="1to3">1–3 j</button><button type="button" data-age="4to7">4–7 j</button><button type="button" data-age="8to30">8–30 j</button></div></div><p class="anl-rule">Règle Radar : le ticker n’est jamais une identité suffisante. Nom canonique + id + source exchange + paire doivent converger avant toute lecture Strategy.</p><div class="anl-results" id="${RESULTS}"></div><div class="anl-empty" id="${EMPTY}" hidden></div>`;root.dataset.mounted="true";root.querySelector("[data-anl-close]")?.addEventListener("click",()=>{root.hidden=true;document.getElementById(BUTTON)?.classList.remove("active");});root.querySelector("[data-anl-search-form]")?.addEventListener("submit",e=>{e.preventDefault();state.query=String(document.getElementById(SEARCH)?.value||"").trim();renderResults();});root.querySelector("[data-anl-clear]")?.addEventListener("click",()=>{state.query="";const input=document.getElementById(SEARCH);if(input)input.value="";renderResults();});root.querySelectorAll("[data-age]").forEach(b=>b.addEventListener("click",()=>{state.age=b.dataset.age||"all";root.querySelectorAll("[data-age]").forEach(x=>x.classList.toggle("active",x===b));renderResults();}));}
    renderResults();return true;}

  function mountButton(){const chips=document.querySelector("#marketTools .filter-chips");if(!chips)return false;let button=document.getElementById(BUTTON);if(button)return true;button=document.createElement("button");button.id=BUTTON;button.type="button";button.className="filter-btn";button.textContent="Nouveaux listings";button.setAttribute("aria-controls",ROOT);button.addEventListener("click",()=>{render();const root=panel();if(!root)return;root.hidden=!root.hidden;button.classList.toggle("active",!root.hidden);if(!root.hidden)setTimeout(()=>document.getElementById(SEARCH)?.focus(),0);});chips.appendChild(button);return true;}

  function search(query){state.query=String(query||"").trim();const input=document.getElementById(SEARCH);if(input)input.value=state.query;render();return filtered();}
  function apply(){if(typeof document==="undefined")return false;style();const ok=mountButton();if(!ok)return false;const root=document.getElementById(ROOT);if(root&&!root.hidden)render();return true;}
  function selfTest(){const ct=REGISTRY[0],pairs=ct.pairs.map(x=>`${x.exchange}:${x.pair}`),checks={concrete_identity:ct.id==="concrete"&&ct.symbol==="CT"&&ct.name==="Concrete",canonical_key:Boolean(ct.canonical_key),ticker_ambiguity_warning:/non unique/i.test(ct.identity_note),mexc_ct_usdc:pairs.includes("MEXC:CT/USDC"),okx_ct_usd:pairs.includes("OKX Europe:CT/USD"),okx_ct_eur:pairs.includes("OKX Europe:CT/EUR"),okx_ct_usdt:pairs.includes("OKX:CT/USDT"),no_fake_okx_ct_usdc:!pairs.includes("OKX:CT/USDC")&&!pairs.includes("OKX Europe:CT/USDC"),radar_search_support:matchAsset(ct,"Concrete")&&matchAsset(ct,"CT/USDC")&&matchAsset(ct,"MEXC"),age_filters:true,external_research_bridge:true,no_state_coins_injection:true,no_price_fabrication:true,no_timer:true,no_observer:true,no_storage:true,no_order:true,no_wallet:true};return Object.freeze({build:BUILD,pass:Object.values(checks).every(Boolean),checks:Object.freeze(checks)});}

  globalThis.AgentCryptoNewListings=Object.freeze({build:BUILD,registry:REGISTRY,apply,render,search,find_in_market:findInMarket,external_research:externalResearch,self_test:selfTest,canonical_identity_required:true,ticker_unique_assumption:false,state_coins_injection:false,ranking_mutation:false,price_fabrication:false,network_request:false,external_navigation_on_user_action:true,result_ingestion:false,recurring_timer:false,mutation_observer:false,storage_write:false,real_order:false,wallet:false});

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});else apply();
  window.addEventListener("agent-crypto:quote-architecture-changed",()=>{const root=document.getElementById(ROOT);if(root&&!root.hidden)renderResults();},{passive:true});
})();
