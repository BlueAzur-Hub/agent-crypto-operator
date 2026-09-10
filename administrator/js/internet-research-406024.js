(() => {
  "use strict";
  const BUILD="40.6.24";
  const engines=Object.freeze({
    google:q=>`https://www.google.com/search?q=${encodeURIComponent(q)}`,
    bing:q=>`https://www.bing.com/search?q=${encodeURIComponent(q)}`,
    duckduckgo:q=>`https://duckduckgo.com/?q=${encodeURIComponent(q)}`
  });
  function query(){return String(document.getElementById('internetResearchQuery')?.value||'').trim().slice(0,300);}
  function status(text){const n=document.getElementById('internetResearchStatus');if(n)n.textContent=text;}
  function openExternal(engine){const q=query();if(!q){status('REQUÊTE VIDE · rien n’a été ouvert.');document.getElementById('internetResearchQuery')?.focus();return false;}const make=engines[engine]||engines.google;const a=document.createElement('a');a.href=make(q);a.target='_blank';a.rel='noopener noreferrer';a.style.display='none';document.body.append(a);a.click();a.remove();status(`${String(engine||'google').toUpperCase()} · ouverture externe demandée · aucune ingestion automatique.`);return true;}
  function openPanel(e){if(e)e.preventDefault();const d=document.getElementById('internet-research');if(!d)return false;d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>document.getElementById('internetResearchQuery')?.focus(),250);return true;}
  function bind(){document.getElementById('internetResearchForm')?.addEventListener('submit',e=>{e.preventDefault();openExternal('google');});document.querySelectorAll('[data-internet-engine]').forEach(b=>b.addEventListener('click',()=>openExternal(b.dataset.internetEngine)));document.querySelectorAll('a[href="#internet-research"]').forEach(a=>a.addEventListener('click',openPanel));if(location.hash==='#internet-research')setTimeout(()=>openPanel(),0);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  globalThis.ErithInternetResearch406024=Object.freeze({build:BUILD,open:openExternal,engines:Object.keys(engines),page_fetch:false,result_ingestion:false,storage_write:false,timer:false,observer:false,financial_action:false});
})();
