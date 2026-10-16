(() => {
  "use strict";
  const BUILD="40.6.139";
  const engines=Object.freeze({
    google:q=>`https://www.google.com/search?q=${encodeURIComponent(q)}`,
    bing:q=>`https://www.bing.com/search?q=${encodeURIComponent(q)}`,
    duckduckgo:q=>`https://duckduckgo.com/?q=${encodeURIComponent(q)}`
  });
  function query(){return String(document.getElementById('internetResearchQuery')?.value||'').trim().slice(0,300);}
  function status(text){const n=document.getElementById('internetResearchStatus');if(n)n.textContent=text;}
  function contract(){
    const root=document.getElementById('internet-research');
    if(!root)return;
    const host=root.querySelector('.internet-research-panel')||root;
    const truth=root.querySelector('.internet-research-truth');
    if(truth)truth.textContent='WEB EXTERNE · aucune ingestion';
    let grid=document.getElementById('internetResearchContract');
    if(!grid){
      grid=document.createElement('div');
      grid.id='internetResearchContract';
      grid.className='internet-research-contract';
      grid.setAttribute('aria-label','Frontière Recherche Internet');
      const head=host.querySelector('.internet-research-head');
      if(head?.nextSibling)host.insertBefore(grid,head.nextSibling);else host.prepend(grid);
    }
    const specs=[
      ['PORTÉE','WEB EXTERNE','Google · Bing · DuckDuckGo'],
      ['ACTION','VOLONTAIRE','Ouverture dans un nouvel onglet.'],
      ['INGESTION','AUCUNE','Aucun résultat n’entre automatiquement dans Agent-Crypto.'],
      ['ATLAS','NON ALIMENTÉ','Une page Web ouverte n’est pas une Source Atlas.'],
      ['MÉMOIRE','NON ÉCRITE','Aucune écriture automatique en mémoire.'],
      ['PREUVE','À QUALIFIER','Une source externe doit être vérifiée avant usage analytique.']
    ];
    grid.replaceChildren();
    for(const [label,value,note] of specs){
      const card=document.createElement('section');card.className='internet-research-contract-card';
      const l=document.createElement('span');l.textContent=label;
      const v=document.createElement('strong');v.textContent=value;
      const n=document.createElement('small');n.textContent=note;
      card.append(l,v,n);grid.append(card);
    }
    root.dataset.externalWeb='true';
    root.dataset.ingestion='none';
    root.dataset.atlasSource='false';
    root.dataset.memoryWrite='false';
  }
  function openExternal(engine){const q=query();if(!q){status('REQUÊTE VIDE · rien n’a été ouvert.');document.getElementById('internetResearchQuery')?.focus();return false;}const name=engines[engine]?engine:'google';const make=engines[name];const a=document.createElement('a');a.href=make(q);a.target='_blank';a.rel='noopener noreferrer';a.style.display='none';document.body.append(a);a.click();a.remove();status(`${name.toUpperCase()} · onglet externe ouvert · 0 ingestion · 0 mémoire · 0 Source Atlas.`);return true;}
  function openPanel(e){if(e)e.preventDefault();const d=document.getElementById('internet-research');if(!d)return false;d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>document.getElementById('internetResearchQuery')?.focus(),250);return true;}
  function snapshot(){return Object.freeze({build:BUILD,scope:'EXTERNAL_WEB_ONLY',engines:Object.keys(engines),page_fetch:false,result_ingestion:false,atlas_source:false,memory_write:false,storage_write:false,timer:false,observer:false,financial_action:false,evidence:'MUST_BE_QUALIFIED'});}
  function bind(){document.getElementById('internetResearchForm')?.addEventListener('submit',e=>{e.preventDefault();openExternal('google');});document.querySelectorAll('[data-internet-engine]').forEach(b=>b.addEventListener('click',()=>openExternal(b.dataset.internetEngine)));document.querySelectorAll('a[href="#internet-research"]').forEach(a=>a.addEventListener('click',openPanel));if(location.hash==='#internet-research')setTimeout(()=>openPanel(),0);contract();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  globalThis.ErithInternetResearch=Object.freeze({build:BUILD,open:openExternal,engines:Object.keys(engines),page_fetch:false,result_ingestion:false,atlas_source:false,memory_write:false,storage_write:false,timer:false,observer:false,financial_action:false,snapshot});
})();
