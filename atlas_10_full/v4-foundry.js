(() => {
  "use strict";

  const DATA = window.AERITH_UNIFIED_DATA;
  const FLOWER = window.AERITH_FLOWER_GIRLS;
  const $ = (q, r=document) => r.querySelector(q);
  const $$ = (q, r=document) => Array.from(r.querySelectorAll(q));
  const STORE = "aerith-forge-v4-duplicate-check";
  let bypass = false;
  let pendingExample = "";

  const stop = new Set("a au aux avec ce ces cette dans de des du elle elles en est et faire fait fonction il la le les leur leurs lui mais ne nos notre nous ou par pas pour que qui sa sans se ses son sur une un vos votre vous vers doit cette comme plus moins afin tout toute tous toutes être avoir besoin nouvelle aerith transformer produire profil mission sortie problème réel réelle".split(/\s+/));
  const aliases = {
    router:"routeuse", routage:"routeuse", route:"routeuse", choisir:"routeuse", selectionner:"routeuse", sélectionner:"routeuse",
    archive:"archiviste", classer:"archiviste", indexer:"archiviste", mémoire:"archiviste",
    proteger:"gardienne", protéger:"gardienne", coffre:"gardienne", accès:"gardienne", integrite:"gardienne",
    executer:"operatrice", exécuter:"operatrice", procedure:"operatrice", procédure:"operatrice",
    raconter:"conteuse", récit:"conteuse", histoire:"conteuse",
    recherche:"chercheuse", verifier:"chercheuse", vérifier:"chercheuse", sources:"chercheuse",
    cout:"econome", coût:"econome", budget:"econome", crédits:"econome",
    structure:"architecte", architecture:"architecte", harmonie:"architecte",
    mathematique:"math", mathématique:"math", calcul:"math", oracle:"oracle"
  };

  function normalize(value) {
    return String(value || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  function tokens(value) {
    const out=[];
    for (let token of normalize(value).split(/\s+/)) {
      if (!token || token.length < 3 || stop.has(token)) continue;
      token = aliases[token] || token;
      out.push(token);
    }
    return [...new Set(out)];
  }

  function searchableProfiles() {
    const flower = (FLOWER?.profiles || []).map(item => ({
      id:item.id, name:item.name, family:item.family, role:item.role || "", unique:item.uniqueValue || "", difference:item.difference || "",
      text:[item.name,item.role,item.uniqueValue,item.difference,item.problem,...(item.outputs||[]),...(item.agents||[])].join(" ")
    }));
    const base = (DATA?.profiles || []).filter(item => item.kind === "existing").map(item => ({
      id:`base:${item.id}`, name:item.name, family:item.family, role:item.role || "", unique:item.description || "", difference:"", text:[item.name,item.role,item.description,item.problem,...(item.outputs||[]),...(item.agents||[])].join(" ")
    }));
    const seen=new Set();
    return [...flower,...base].filter(item => { const key=normalize(item.name); if(seen.has(key)) return false; seen.add(key); return true; });
  }

  function scoreMission(mission) {
    const q=tokens(mission);
    const qset=new Set(q);
    return searchableProfiles().map(item => {
      const p=tokens(item.text);
      const pset=new Set(p);
      let overlap=0;
      for(const t of qset) if(pset.has(t)) overlap += 1;
      let score = overlap / Math.max(1, Math.sqrt(qset.size * pset.size));
      const nmission=normalize(mission), nname=normalize(item.name);
      const shortName=nname.replace(/^aerith 10 /, "");
      if(shortName && nmission.includes(shortName)) score += .55;
      if(qset.has(item.id)) score += .25;
      return {...item, score, overlap};
    }).sort((a,b)=>b.score-a.score).slice(0,3);
  }

  function save(result) {
    window.AERITH_V4_DUPLICATE = result;
    try { localStorage.setItem(STORE, JSON.stringify(result)); } catch {}
  }

  function load() {
    try { const v=JSON.parse(localStorage.getItem(STORE)||"null"); if(v) window.AERITH_V4_DUPLICATE=v; } catch {}
  }

  function setLocked(value) {
    const required = Boolean(value);
    document.body.classList.toggle("v4-precheck-required", required);
    const panel = $("#forgeAccessPanel");
    if (panel) panel.hidden = !required;
    const message = $("#forgeAccessMessage");
    if (message && required) {
      const result = window.AERITH_V4_DUPLICATE;
      message.textContent = result?.status === "existing"
        ? "Cette fonction ressemble fortement à un profil existant. Reformule la différence avant de poursuivre."
        : result?.status === "close"
          ? "Une fonction voisine a été détectée. Précise la sortie réellement nouvelle avant de poursuivre."
          : "Décris la fonction nouvelle, compare-la au registre, puis poursuis directement dans l’Atelier.";
    }
  }

  function creationReady() {
    const result = window.AERITH_V4_DUPLICATE;
    return Boolean(result?.checked && result.status === "clear");
  }

  function requestPrecheck() {
    openGate("create");
    setTimeout(() => $("#missionIntent")?.focus(), 120);
  }

  function openGate(kind) {
    $("#creationGate").hidden = kind !== "create";
    $("#completionGate").hidden = kind !== "complete";
    document.body.dataset.v4Workflow = kind;
    if (kind === "complete") setLocked(false);
    if(kind === "create") setTimeout(()=>$("#missionIntent")?.focus(),80);
    $("#entryGate")?.scrollIntoView({behavior:"smooth",block:"center"});
  }

  function renderResult(result) {
    const box=$("#duplicateResult"), go=$("#continueCreation");
    if(!box||!go) return;
    box.className=`duplicate-result ${result.status}`;
    const candidates=result.candidates||[];
    const cards=candidates.map((item,index)=>`<article><span>${index+1}</span><div><b>${item.name}</b><small>${item.family||""}</small><p>${item.role||item.unique||""}</p><em>proximité ${Math.round(item.score*100)} %</em></div></article>`).join("");
    if(result.status === "existing") {
      box.innerHTML=`<b>Fonction probablement déjà présente</b><p>La mission correspond fortement à <strong>${candidates[0]?.name||"un profil existant"}</strong>. La Forge bloque la création tant que la différence fonctionnelle n’est pas reformulée.</p><div class="duplicate-candidates">${cards}</div>`;
      go.disabled=true;
    } else if(result.status === "close") {
      box.innerHTML=`<b>Fonction proche : distinction nécessaire</b><p>La création reste bloquée jusqu’à ce que la mission explique clairement ce qu’elle produit de différent.</p><div class="duplicate-candidates">${cards}</div>`;
      go.disabled=true;
    } else {
      box.innerHTML=`<b>Aucune fonction équivalente détectée</b><p>Le contrôle local autorise l’ouverture de l’Atelier. Ce résultat reste une aide : Christophe conserve la validation finale.</p>${cards?`<div class="duplicate-candidates muted">${cards}</div>`:""}`;
      go.disabled=false;
    }
  }

  function runCheck() {
    const mission=$("#missionIntent")?.value.trim()||"";
    if(mission.length < 24) {
      const result={checked:false,status:"idle",mission,candidates:[]};
      save(result);
      const box=$("#duplicateResult"); box.className="duplicate-result warn"; box.innerHTML="<b>Description trop courte</b><p>Indique le problème, la fonction et la sortie attendue en une ou deux phrases.</p>";
      $("#continueCreation").disabled=true;
      return;
    }
    const candidates=scoreMission(mission);
    const top=candidates[0]?.score||0;
    const status=top >= .43 ? "existing" : top >= .24 ? "close" : "clear";
    const result={checked:true,status,mission,candidates,date:new Date().toISOString()};
    save(result); renderResult(result);
  }

  function fillMission() {
    const mission=$("#missionIntent")?.value.trim()||"";
    const result=window.AERITH_V4_DUPLICATE;
    if(!result?.checked || result.status!=="clear") return;
    bypass=true;
    if(pendingExample) {
      const button=document.querySelector(`[data-example="${CSS.escape(pendingExample)}"]`);
      button?.click();
    } else {
      $("#blankProfile")?.click();
    }
    bypass=false;
    pendingExample="";
    setTimeout(()=>{
      const problem=$("#fieldProblem"), role=$("#fieldRole"), status=$("#profileStatus");
      if(problem){ problem.value=mission; problem.dispatchEvent(new Event("input",{bubbles:true})); }
      if(role && (!role.value || /Transformer une intention/i.test(role.value))){ role.value=`Spécialiste Aerith-10 dédiée à la fonction suivante : ${mission}`; role.dispatchEvent(new Event("input",{bubbles:true})); }
      if(status) status.textContent="NOUVELLE CRÉATION · ANTI-DOUBLON VALIDÉ";
      document.body.dataset.v4Workflow="create";
      setLocked(false);
      $("#unifiedForge")?.scrollIntoView({behavior:"smooth",block:"start"});
    },40);
  }

  function showConsultProfile(id) {
    const baseId=id.startsWith("base:")?id.slice(5):id;
    const item=(FLOWER?.profiles||[]).find(x=>x.id===baseId) || (DATA?.profiles||[]).find(x=>x.id===baseId);
    if(!item) return;
    const target=$("#consultResult");
    target.hidden=false;
    target.innerHTML=`<span>CONSULTATION · REGISTRE LOCAL</span><h3>${item.name}</h3><p>${item.role||item.description||""}</p><dl><div><dt>Valeur propre</dt><dd>${item.uniqueValue||item.formula||"—"}</dd></div><div><dt>Frontière</dt><dd>${item.difference||"À lire dans le Core réel."}</dd></div><div><dt>Core déclaré</dt><dd><code>${item.corePath||"—"}</code></dd></div></dl><p class="registry-warning">Aucun statut du dépôt privé n’est déduit depuis cette fiche.</p>`;
    target.scrollIntoView({behavior:"smooth",block:"center"});
  }

  function enforceV4Labels() {
    $$(".profile-card .card-action").forEach(x=>{ if(x.textContent!=="Consulter la fonction →") x.textContent="Consulter la fonction →"; });
    $$("[data-flower-load]").forEach(x=>{ if(x.textContent!=="Examiner pour complétion →") x.textContent="Examiner pour complétion →"; });
    const status=$("#profileStatus");
    if(status && document.body.dataset.v4Workflow==="complete" && status.textContent!=="PROFIL EXISTANT · DIAGNOSTIC BORNÉ") status.textContent="PROFIL EXISTANT · DIAGNOSTIC BORNÉ";
  }

  document.addEventListener("click", event => {
    if(bypass) return;
    const t=event.target.closest("button,a");
    if(!t) return;
    if(t.id==="startTop" || t.id==="startNew" || t.id==="doorCreate" || t.id==="openForgeCheck") {
      event.preventDefault(); event.stopImmediatePropagation(); requestPrecheck(); return;
    }
    if(t.id==="confirmReset") {
      try { localStorage.removeItem(STORE); } catch {}
      window.AERITH_V4_DUPLICATE = null;
      setLocked(true);
      return;
    }
    if(t.id==="startExisting" || t.id==="doorConsult") {
      event.preventDefault(); event.stopImmediatePropagation(); document.body.dataset.v4Workflow="consult"; $("#flowerGirls")?.scrollIntoView({behavior:"smooth",block:"start"}); return;
    }
    if(t.id==="doorComplete") {
      event.preventDefault(); event.stopImmediatePropagation(); openGate("complete"); return;
    }
    if(t.id==="openCompletionLibrary") {
      event.preventDefault(); $("#flowerGirls")?.scrollIntoView({behavior:"smooth",block:"start"}); return;
    }
    if(t.id==="checkDuplicate") { event.preventDefault(); runCheck(); return; }
    if(t.id==="continueCreation") { event.preventDefault(); fillMission(); return; }
    if(!creationReady() && (t.id==="nextTop" || t.id==="nextBottom" || t.id==="blankProfile" || t.closest(".step-button"))) {
      event.preventDefault(); event.stopImmediatePropagation(); requestPrecheck(); return;
    }
    const ex=t.closest("[data-example]");
    if(ex) {
      event.preventDefault(); event.stopImmediatePropagation();
      pendingExample=ex.dataset.example;
      const item=(DATA?.examples||[]).find(x=>x.id===pendingExample);
      $("#missionIntent").value=[item?.problem,item?.role].filter(Boolean).join(" ");
      openGate("create"); runCheck(); return;
    }
    const prof=t.closest("[data-profile]");
    if(prof) {
      event.preventDefault(); event.stopImmediatePropagation();
      if (prof.dataset.profile === "new") { pendingExample=""; openGate("create"); return; }
      showConsultProfile(`base:${prof.dataset.profile}`); return;
    }
    const flower=t.closest("[data-flower-load]");
    if(flower) {
      document.body.dataset.v4Workflow="complete";
      setLocked(false);
      setTimeout(enforceV4Labels,20);
    }
  }, true);

  $("#missionIntent")?.addEventListener("input",()=>{
    $("#continueCreation").disabled=true;
    const box=$("#duplicateResult"); box.className="duplicate-result idle"; box.innerHTML="<b>Mission modifiée</b><p>Relance le contrôle anti-doublon.</p>";
  });

  const observer=new MutationObserver(enforceV4Labels);
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  load();
  if(window.AERITH_V4_DUPLICATE?.checked) {
    $("#missionIntent").value=window.AERITH_V4_DUPLICATE.mission||"";
    renderResult(window.AERITH_V4_DUPLICATE);
  }
  setLocked(!creationReady());
  enforceV4Labels();
})();
