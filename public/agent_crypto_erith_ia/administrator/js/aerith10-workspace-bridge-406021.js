(() => {
  "use strict";
  const BUILD="40.6.21";
  const CREATOR_ID="aerith10-creator";
  function text(sel){const n=document.querySelector(sel);return String(n?.textContent||"").replace(/\s+/g," ").trim();}
  function currentContext(){
    const build=document.querySelector('meta[name="administrator-build"]')?.content||"—";
    const time=text('#sourceTimeCard')||text('#atlasCelestialClockHeader')||new Date().toLocaleString('fr-FR');
    const market=text('#atlasOracleV0 .atlas-oracle-title-line strong')||text('#atlasOracleV0 .atlas-oracle-title')||"Marché courant";
    const oracle=text('#atlasOracleV0 .atlas-oracle-hero-row')||text('#atlasOracleV0 .atlas-oracle-status')||"Oracle non affiché";
    const synthesis=text('#atlasSharedSynthesisContent');
    const lines=[
      `AGENT-CRYPTO · BUILD ${build}`,
      `HORODATAGE · ${time}`,
      `CONTEXTE MARCHÉ · ${market}`,
      `LECTURE ORACLE · ${oracle}`,
    ];
    if(synthesis && !/Aucune synthèse inscrite/i.test(synthesis)) lines.push(`SYNTHÈSE ATLAS/AERITH · ${synthesis.slice(0,1200)}`);
    lines.push('DESTINATION · Aerith-10 Créatrice · travailler à partir de ces faits sans les confondre avec une mémoire canonique.');
    return lines.join('\n');
  }
  function refresh(){const out=document.getElementById('aerith10WorkspaceContext');if(!out)return false;out.value=currentContext();const s=document.getElementById('aerith10WorkspaceState');if(s)s.textContent='CONTEXTE ACTUALISÉ';return true;}
  async function copy(){const out=document.getElementById('aerith10WorkspaceContext');if(!out)return;refresh();try{await navigator.clipboard.writeText(out.value);const s=document.getElementById('aerith10WorkspaceState');if(s)s.textContent='COPIÉ';}catch(_){out.focus();out.select();const s=document.getElementById('aerith10WorkspaceState');if(s)s.textContent='SÉLECTIONNÉ';}}
  function openCreator(event){if(event)event.preventDefault();const d=document.getElementById(CREATOR_ID);if(!d)return false;d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(refresh,0);return true;}
  function openForge(){const d=document.getElementById('forge-aerith');if(!d)return false;d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'});return true;}
  function bind(){
    document.querySelectorAll('a[href="#aerith10-creator"]').forEach(a=>{if(a.dataset.aerith10BridgeBound==='1')return;a.dataset.aerith10BridgeBound='1';a.addEventListener('click',openCreator);});
    document.getElementById('btnAerith10ContextRefresh')?.addEventListener('click',refresh);
    document.getElementById('btnAerith10ContextCopy')?.addEventListener('click',copy);
    document.getElementById('btnAerith10OpenForge')?.addEventListener('click',openForge);
    document.getElementById(CREATOR_ID)?.addEventListener('toggle',e=>{if(e.currentTarget.open)refresh();});
    refresh();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  globalThis.ErithAerith10WorkspaceBridge406021=Object.freeze({build:BUILD,refresh,current_context:currentContext,open_creator:openCreator,open_forge:openForge,network:false,storage_write:false,financial_action:false,iframe_dom_access:false});
})();
