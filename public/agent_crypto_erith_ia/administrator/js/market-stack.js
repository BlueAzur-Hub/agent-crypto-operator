/* 40.6.413 · diagnostic-only eval boundary */
(()=>{try{const b=String(globalThis.AGENT_CRYPTO_EFFECTIVE_BUILD||document.documentElement?.dataset?.agentCryptoLoadedBuild||"");if(b==="40.6.413")globalThis.AgentCryptoBootProbe?.mark?.("probe-script-eval-enter",{src:"market-stack.js",build:"40.6.413"});}catch(_){}})();
(() => {
  "use strict";
  const BUILD = "40.4.211";
  const REVISION = "V6";
  const CONTRACT = "ALL_MARKETS_STATIC_CRYPTO_SLOT_PARITY_DOMAIN_CONTENT_404189";
  const ORDER = Object.freeze([
    Object.freeze({ id:"crypto", label:"CRYPTO", title:"Crypto", mode:"native", native:"crypto" }),
    Object.freeze({ id:"metals", label:"MÉTAUX", title:"Métaux précieux et industriels", mode:"native", native:"metals" }),
    Object.freeze({ id:"indices", label:"INDICES", title:"Indices / Bourse", mode:"parallel" }),
    Object.freeze({ id:"energy", label:"ÉNERGIE", title:"Énergie & matières premières", mode:"parallel" }),
    Object.freeze({ id:"cross-market", label:"CROSS", title:"Cross-Market Observatory", mode:"parallel" })
  ]);

  let current = "crypto", nativeBypass = false;
  const byId = id => document.getElementById(id);
  const specFor = id => ORDER.find(x => x.id === id) || ORDER[0];
  const indexOf = id => Math.max(0, ORDER.findIndex(x => x.id === id));
  const nextOf = id => ORDER[(indexOf(id) + 1) % ORDER.length];
  const isParallel = id => specFor(id).mode === "parallel";

  function nativeDomain(){
    const b = byId("atlasMarketDomainSwitch");
    return String(b?.dataset?.domain || "crypto") === "metals" ? "metals" : "crypto";
  }

  function forceHidden(node, hidden){
    if(!node) return;
    node.classList.toggle("atlas-market-force-hidden", hidden);
    if(hidden){
      node.hidden = true;
      node.setAttribute("aria-hidden", "true");
      node.style.setProperty("display", "none", "important");
    }else{
      node.hidden = false;
      node.removeAttribute("aria-hidden");
      node.style.removeProperty("display");
    }
  }

  function emitDomain(domain){
    try{
      document.dispatchEvent(new CustomEvent("erith:market-domain-change", { detail:{ domain, build:BUILD, contract:CONTRACT } }));
    }catch(_){}
  }

  function clearRetired185Geometry(){
    const deck = byId("analyste");
    deck?.classList.remove("atlas-market-soft-transition-404185");
    document.querySelectorAll(".atlas-unified-domain-shell,.atlas-unified-domain-rail").forEach(node => {
      node.classList.remove("atlas-unified-domain-shell","atlas-unified-domain-rail");
      ["--atlas-unified-dx","--atlas-unified-dy","--atlas-unified-w","--atlas-unified-h"].forEach(k => node.style.removeProperty(k));
      node.style.removeProperty("transform");
      node.style.removeProperty("transition");
      node.style.removeProperty("will-change");
      node.style.removeProperty("opacity");
    });
    delete document.documentElement.dataset.unifiedGraphShell;
    document.documentElement.dataset.staticGraphShell = "ready";
  }

  function captureCryptoGeometry(){
    if(current !== "crypto") return;
    const shell = document.querySelector("#analyste .chart-shell");
    const rail = byId("detailPanel");
    const toolbar = document.querySelector("#analyste .chart-v2-recovery-line");
    const deck = byId("analyste");
    if(!shell || !deck) return;
    const sr = shell.getBoundingClientRect();
    const rr = rail?.getBoundingClientRect();
    const tr = toolbar?.getBoundingClientRect();
    if(sr.height > 240) deck.style.setProperty("--atlas-market-master-shell-h", `${Math.round(sr.height)}px`);
    if(rr?.height > 240) deck.style.setProperty("--atlas-market-master-rail-h", `${Math.round(rr.height)}px`);
    if(rr?.width > 220) deck.style.setProperty("--atlas-market-master-rail-w", `${Math.round(rr.width)}px`);
    if(tr?.height > 28) deck.style.setProperty("--atlas-market-master-toolbar-h", `${Math.round(tr.height)}px`);
    document.documentElement.dataset.cryptoSkeletonGeometry = "captured";
    document.documentElement.dataset.cryptoStaticGeometry = "captured";
  }

  function installFixedAnchor(){
    const deck = byId("analyste"), button = byId("atlasMarketDomainSwitch");
    if(!deck || !button) return false;
    let slot = byId("atlasFixedMarketAnchorSlot");
    if(!slot){
      slot = document.createElement("div");
      slot.id = "atlasFixedMarketAnchorSlot";
      slot.className = "atlas-fixed-market-anchor-slot-404168";
      slot.setAttribute("aria-label", "Sélecteur cyclique de marché");
      deck.prepend(slot);
    }
    if(button.parentElement !== slot) slot.appendChild(button);
    button.classList.add("atlas-fixed-market-anchor-button-404168");
    button.dataset.fixedMarketAnchor = "locked";
    button.dataset.marketGeometryOwner = "crypto-master";
    button.dataset.marketCycle = ORDER.map(item => item.id).join(">");
    button.dataset.marketGeometryLock = BUILD;
    slot.dataset.marketGeometryOwner = "crypto-master";
    slot.dataset.marketGeometryLock = BUILD;
    return true;
  }

  function ensureHosts(){
    const chartShell = document.querySelector("#analyste .chart-shell");
    const recovery = document.querySelector("#analyste .chart-v2-recovery-line");
    const metalsDetail = byId("atlasMetalsDetailPanel");
    if(!chartShell || !recovery || !metalsDetail || !installFixedAnchor()) return false;

    if(!byId("atlasCyclicMarketInertStage")){
      const stage = document.createElement("section");
      stage.id = "atlasCyclicMarketInertStage";
      stage.className = "atlas-cyclic-market-inert-stage";
      stage.hidden = true;
      stage.innerHTML = `<div class="atlas-cyclic-market-inert-grid" aria-live="polite"><div class="atlas-cyclic-market-inert-hero"><small>ERITH.IA · MARKETS OBSERVATORY</small><h3 data-cyclic-market-title>Marché parallèle</h3><p data-cyclic-market-description>Chargement de la Source Truth publique.</p><div class="atlas-cyclic-market-inert-line"></div></div><div class="atlas-cyclic-market-inert-gates"><span><small>SOURCE TRUTH</small><b>CHARGEMENT</b></span><span><small>HISTORIQUE</small><b>VÉRIFICATION</b></span><span><small>UNITÉS</small><b>EXPLICITES</b></span><span><small>MOTEUR</small><b>OBSERVATION</b></span></div><footer><b>AUCUN PRIX INVENTÉ</b><span>Squelette Crypto statique · contenu métier séparé.</span></footer></div>`;
      chartShell.appendChild(stage);
    }

    if(!byId("atlasCyclicMarketMirrorToolbar")){
      const t = document.createElement("div");
      t.id = "atlasCyclicMarketMirrorToolbar";
      t.className = "atlas-cyclic-market-mirror-toolbar";
      t.hidden = true;
      t.innerHTML = `<span class="mirror-group atlas-toolbar-view-404195"><small>VUE</small><button type="button" disabled aria-disabled="true" title="Vue Prix non disponible pour ce domaine">Prix</button><b class="active">Base 100</b></span><span class="mirror-group atlas-toolbar-scale atlas-toolbar-disabled-slot"><small>ÉCHELLE</small><button type="button" disabled aria-disabled="true" title="Échelle native non disponible pour ce domaine">Normale</button><button type="button" disabled aria-disabled="true" title="Échelle logarithmique non disponible pour ce domaine">Log</button></span><span class="mirror-group atlas-toolbar-section"><small>AFFICHER</small><b class="atlas-toolbar-info" data-cyclic-market-toolbar-state>Source Truth publique</b></span><span class="mirror-group atlas-toolbar-period-404195 atlas-parallel-periods"><small>PÉRIODE</small><button type="button" data-parallel-period="24h">24h</button><button type="button" data-parallel-period="7j">7j</button><button type="button" data-parallel-period="30j">30j</button><button type="button" data-parallel-period="60j">60j</button><button type="button" data-parallel-period="90j">90j</button><button type="button" data-parallel-period="1a">1a</button></span>`;
      recovery.appendChild(t);
    }

    if(!byId("atlasCyclicMarketInertDetail")){
      const d = document.createElement("article");
      d.id = "atlasCyclicMarketInertDetail";
      d.className = "panel glass atlas-cyclic-market-inert-detail";
      d.hidden = true;
      d.innerHTML = `<header><span class="eyebrow">DÉTAIL ACTIF</span><strong data-cyclic-market-detail-title>Marché parallèle</strong><small>Observation seulement · Source Truth publique</small></header><div class="atlas-cyclic-market-inert-detail-state"><span><small>État</small><b>CHARGEMENT</b></span><span><small>Collecte</small><b>LECTURE PUBLIQUE</b></span></div><section><b>Intégrité</b><p>Aucune valeur inventée. Les unités, sources et historiques restent séparés.</p></section>`;
      metalsDetail.insertAdjacentElement("afterend", d);
    }
    /* 40.4.189 — one physical right rail. Metals keeps ownership of the
       proven geometry; parallel domains receive an overlay host inside it.
       No original Metals child is removed or rebuilt. */
    if(!byId("atlasParallelDomainRailHost")){
      const h = document.createElement("div");
      h.id = "atlasParallelDomainRailHost";
      h.className = "atlas-parallel-domain-rail-host-404189";
      h.hidden = true;
      h.setAttribute("aria-live", "polite");
      metalsDetail.appendChild(h);
    }
    ensureGraphToolbarParity();
    return true;
  }

  function ensureGraphToolbarParity(){
    const metals=byId("atlasMetalsUnifiedToolbar");
    if(metals){
      const groups=Array.from(metals.children).filter(n=>n instanceof Element&&n.matches('div[role="group"]'));
      const view=groups[0]||null;const period=groups.find(n=>n.querySelector('[data-metals-period]'))||groups[1]||null;const section=groups.find(n=>n.querySelector('[data-metals-section]'))||groups[2]||null;
      view?.classList.add("atlas-toolbar-view-404195");period?.classList.add("atlas-toolbar-period-404195");section?.classList.add("atlas-toolbar-section");
      if(!metals.querySelector(".atlas-toolbar-scale")){const scale=document.createElement("div");scale.className="atlas-toolbar-scale atlas-toolbar-disabled-slot";scale.setAttribute("role","group");scale.setAttribute("aria-label","Échelle Métaux · non applicable");scale.innerHTML='<span>ÉCHELLE</span><button type="button" disabled aria-disabled="true">Normale</button><button type="button" disabled aria-disabled="true">Log</button>';metals.insertBefore(scale,period||section||null);}
      metals.dataset.graphToolbarParity="crypto-slot-lock";
    }
    const mirror=byId("atlasCyclicMarketMirrorToolbar");if(mirror)mirror.dataset.graphToolbarParity="crypto-slot-lock";
    document.documentElement.dataset.graphToolbarParity="ready";
  }
  function setParallelPlaceholder(domain){
    const s = specFor(domain);
    const stage = byId("atlasCyclicMarketInertStage");
    const toolbar = byId("atlasCyclicMarketMirrorToolbar");
    const detail = byId("atlasCyclicMarketInertDetail");
    const title = stage?.querySelector("[data-cyclic-market-title]");
    const desc = stage?.querySelector("[data-cyclic-market-description]");
    const state = toolbar?.querySelector("[data-cyclic-market-toolbar-state]");
    const detailTitle = detail?.querySelector("[data-cyclic-market-detail-title]");
    if(title) title.textContent = s.title;
    if(desc) desc.textContent = "Chargement du domaine public dans le squelette Crypto statique.";
    if(state) state.textContent = `${s.label} · PUBLIC`;
    if(detailTitle) detailTitle.textContent = `Lecture ${s.title}`;
  }

  function syncMetalsSemanticTruth(parallel, metalsDetail, parallelRailHost){
    /* 40.4.204 — semantic truth without geometry mutation.
       Metals remains the physical rail/shell owner, but its native content must
       leave the accessibility/export tree while a parallel domain owns the view.
       visibility:hidden preserves the exact measured footprint. */
    const metalsFoundation = byId("atlasParallelMarketFoundation");
    if(metalsFoundation){
      metalsFoundation.inert = !!parallel;
      if(parallel) metalsFoundation.setAttribute("aria-hidden","true");
      else metalsFoundation.removeAttribute("aria-hidden");
    }
    if(metalsDetail){
      Array.from(metalsDetail.children).forEach(node => {
        if(node === parallelRailHost) return;
        node.inert = !!parallel;
        if(parallel) node.setAttribute("aria-hidden","true");
        else node.removeAttribute("aria-hidden");
      });
    }
    if(parallelRailHost){
      parallelRailHost.inert = !parallel;
      parallelRailHost.setAttribute("aria-hidden", parallel ? "false" : "true");
    }
    document.documentElement.dataset.domainSemanticTruth = parallel ? "parallel-owned" : "native-owned";
  }

  function syncPanels(domain){
    const parallel = isParallel(domain);
    const cryptoDetail = byId("detailPanel");
    const metalsDetail = byId("atlasMetalsDetailPanel");
    const parallelDetail = byId("atlasCyclicMarketInertDetail");
    const parallelRailHost = byId("atlasParallelDomainRailHost");
    const cryptoToolbar = document.querySelector("#analyste .chart-v2-toolbar");
    const metalsToolbar = byId("atlasMetalsUnifiedToolbar");
    const mirrorToolbar = byId("atlasCyclicMarketMirrorToolbar");
    const stage = byId("atlasCyclicMarketInertStage");
    const liveStatus = byId("liveStatus");
    const metalsStatus = byId("atlasMetalsLiveStatus");

    forceHidden(cryptoDetail, domain !== "crypto");
    /* 40.4.189: Metals is the proven physical rail owner for every non-Crypto
       domain. Parallel content is layered inside; original Metals DOM survives. */
    forceHidden(metalsDetail, !(domain === "metals" || parallel));
    forceHidden(parallelDetail, true);
    if(parallelRailHost){
      parallelRailHost.hidden = !parallel;
      parallelRailHost.setAttribute("aria-hidden", parallel ? "false" : "true");
    }
    metalsDetail?.classList.toggle("atlas-parallel-domain-rail-owner-404189", parallel);
    if(metalsDetail){
      metalsDetail.setAttribute("aria-label", parallel ? `Lecture ${specFor(domain).title}` : "Lecture Métaux");
    }
    syncMetalsSemanticTruth(parallel, metalsDetail, parallelRailHost);

    forceHidden(cryptoToolbar, domain !== "crypto");
    forceHidden(metalsToolbar, domain !== "metals");
    forceHidden(mirrorToolbar, !parallel);
    forceHidden(stage, !parallel);

    /* Parallel domains previously borrowed the Metals status strip. That extra
       row changed the Y origin of the graph. In Graphique the domain badge and
       the fixed market selector already identify the active market, so both
       auxiliary status strips stay out of the parallel cockpit. */
    if(parallel){
      forceHidden(liveStatus, true);
      forceHidden(metalsStatus, true);
      document.documentElement.dataset.parallelStatusRow = "removed-from-graph-slot";
      setParallelPlaceholder(domain);
    }else{
      forceHidden(liveStatus, false);
      forceHidden(metalsStatus, true);
      delete document.documentElement.dataset.parallelStatusRow;
    }

    clearRetired185Geometry();
    document.documentElement.dataset.parallelSlotParity = parallel ? "crypto-master" : "native";
  }

  function updateButton(domain){
    installFixedAnchor();
    const b = byId("atlasMarketDomainSwitch"), v = byId("atlasMarketDomainSwitchValue");
    if(!b || !v) return;
    const s = specFor(domain), n = nextOf(domain);
    v.textContent = s.label;
    b.dataset.cyclicMarketDomain = s.id;
    b.dataset.marketAnchorDomain = s.id;
    b.dataset.cyclicMarketNext = n.id;
    b.dataset.singlePhysicalSelector = "true";
    b.setAttribute("aria-current", "true");
    b.setAttribute("aria-label", `Marché ${s.title}. Cliquer au même endroit pour afficher ${n.title}.`);
    b.title = `Suivant : ${n.title}`;
  }

  function ensureNativeDomain(target){
    const b = byId("atlasMarketDomainSwitch");
    if(!b || !["crypto","metals"].includes(target) || nativeDomain() === target) return;
    nativeBypass = true;
    try{ b.click(); }catch(_){}
    nativeBypass = false;
  }

  function publishBuildTruth(){
    /* 40.4.211 — market-stack is a module owner, never the global release badge owner. */
    const releaseBuild = document.querySelector('meta[name="administrator-build"]')?.content
      || document.querySelector('meta[name="atlas-build"]')?.content
      || "";
    if(releaseBuild) document.documentElement.dataset.agentCryptoBuild = releaseBuild;
    document.documentElement.dataset.marketStackBuild = BUILD;
    document.documentElement.dataset.marketShellContract = CONTRACT;
  }

  function applyDomain(domain, options={}){
    const s = specFor(domain);
    current = s.id;
    const html = document.documentElement;
    html.dataset.cyclicMarketDomain = s.id;
    html.dataset.cyclicMarketMode = s.mode;
    html.dataset.cyclicMarketRevision = REVISION;
    html.dataset.marketSkeleton = "crypto-master-static";
    if(s.mode === "native" && !options.nativeAlreadyHandled) ensureNativeDomain(s.native);
    installFixedAnchor();
    requestAnimationFrame(() => {
      installFixedAnchor();
      syncPanels(s.id);
      updateButton(s.id);
      if(s.id === "crypto") captureCryptoGeometry();
      publishBuildTruth();
      emitDomain(s.id);
    });
  }

  function onMarketSwitchClick(event){
    if(nativeBypass) return;
    const next = nextOf(current);
    if(current === "crypto") captureCryptoGeometry();
    if(current === "crypto" && next.id === "metals"){
      current = "metals";
      const html = document.documentElement;
      html.dataset.cyclicMarketDomain = "metals";
      html.dataset.cyclicMarketMode = "native";
      html.dataset.cyclicMarketRevision = REVISION;
      html.dataset.marketSkeleton = "crypto-master-static";
      requestAnimationFrame(() => {
        installFixedAnchor();
        syncPanels("metals");
        updateButton("metals");
        publishBuildTruth();
        emitDomain("metals");
      });
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    applyDomain(next.id);
  }

  function init(){
    document.getElementById("atlasTrueMarketStackMetals404167R1")?.remove();
    document.getElementById("atlasMarketCascade")?.remove();
    clearRetired185Geometry();
    if(!ensureHosts()){
      document.documentElement.dataset.domainSkeletonMirror = "missing-owner";
      return;
    }
    current = nativeDomain();
    const b = byId("atlasMarketDomainSwitch");
    b.dataset.domainSkeletonMirror = "bound";
    b.addEventListener("click", onMarketSwitchClick, true);
    applyDomain(current, { nativeAlreadyHandled:true });
    requestAnimationFrame(captureCryptoGeometry);
    publishBuildTruth();
    document.documentElement.dataset.domainSkeletonMirror = "ready";
    document.documentElement.dataset.staticGraphShell = "ready";
    globalThis.ErithDomainSkeletonMirror = Object.freeze({
      build:BUILD, revision:REVISION, contract:CONTRACT,
      order:ORDER.map(x => x.id), current:() => current,
      next:() => applyDomain(nextOf(current).id), go:d => applyDomain(specFor(d).id),
      master:"crypto", native_domains:["crypto","metals"], parallel_domains:["indices","energy","cross-market"],
      fixed_anchor:true, single_physical_selector:true,
      cycle_contract:"crypto>metals>indices>energy>cross-market>crypto",
      fixed_chart_slot:true, fixed_right_rail_slot:true,
      geometry_from_crypto:true, single_cockpit_surface:true,
      static_geometry:true, unified_geometry_runtime:false, soft_transition:false,
      parallel_status_row_removed:true, parallel_toolbar_single_slot:true, parallel_rail_single_owner:true,
      domain_semantic_truth_404204:true, native_metals_semantic_cold_when_parallel:true, geometry_mutation_404204:false,
      retired_404185_transform_compensation:true,
      new_chart_engine:false, new_timer:false, new_observer:false, new_storage_owner:false
    });
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
})();
/* 40.6.413 · diagnostic-only eval boundary */
(()=>{try{const b=String(globalThis.AGENT_CRYPTO_EFFECTIVE_BUILD||document.documentElement?.dataset?.agentCryptoLoadedBuild||"");if(b==="40.6.413")globalThis.AgentCryptoBootProbe?.mark?.("probe-script-eval-exit",{src:"market-stack.js",build:"40.6.413"});}catch(_){}})();
