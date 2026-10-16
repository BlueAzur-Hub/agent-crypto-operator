(() => {
  "use strict";
  const BUILD="40.6.138", KEY="agent_crypto_erith_ia_salon_local_v1", MAX=80;
  function safeParse(){try{const v=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(v)?v.filter(x=>x&&typeof x==='object').slice(-MAX):[];}catch(_){return[];}}
  function save(rows){try{localStorage.setItem(KEY,JSON.stringify(rows.slice(-MAX)));return true;}catch(_){return false;}}
  function authorValue(){const a=document.getElementById('salonPartageAuthor');return String(a?.value||'Opérateur').trim().slice(0,48)||'Opérateur';}
  function contract(rows=safeParse()){
    const root=document.getElementById('salon-partage');
    if(!root)return;
    const host=root.querySelector('.salon-partage-panel')||root;
    const truth=root.querySelector('.salon-partage-truth');
    if(truth)truth.textContent='LOCAL ONLY · backend non connecté';
    let grid=document.getElementById('salonPartageContract');
    if(!grid){
      grid=document.createElement('div');
      grid.id='salonPartageContract';
      grid.className='salon-partage-contract';
      grid.setAttribute('aria-label','Contrat Local First');
      const head=host.querySelector('.salon-partage-head');
      if(head?.nextSibling)host.insertBefore(grid,head.nextSibling);else host.prepend(grid);
    }
    const specs=[
      ['MODE','LOCAL ONLY','Les messages restent sur ce Firefox.'],
      ['IDENTITÉ',authorValue(),'Identité déclarée localement.'],
      ['HISTORIQUE',`${rows.length}/${MAX} messages`,'Stockage local uniquement.'],
      ['BACKEND','NON CONNECTÉ','Aucun salon partagé distant actif.'],
      ['RÉSEAU','0 ENVOI','Aucun message transmis automatiquement.'],
      ['SYNC','VOLONTAIRE','Indisponible tant qu’aucun backend n’est branché.']
    ];
    grid.replaceChildren();
    for(const [label,value,note] of specs){
      const card=document.createElement('section');card.className='salon-partage-contract-card';
      const l=document.createElement('span');l.textContent=label;
      const v=document.createElement('strong');v.textContent=value;
      const n=document.createElement('small');n.textContent=note;
      card.append(l,v,n);grid.append(card);
    }
    root.dataset.localFirst='true';
    root.dataset.backend='disconnected';
    root.dataset.network='none';
  }
  function render(){const list=document.getElementById('salonPartageList'),count=document.getElementById('salonPartageCount');if(!list)return;const rows=safeParse();list.replaceChildren();for(const row of [...rows].reverse()){const li=document.createElement('li');li.className='salon-partage-item';const head=document.createElement('div');head.className='salon-partage-item-head';const b=document.createElement('b');b.textContent=String(row.author||'Opérateur');const t=document.createElement('time');const d=new Date(row.at||Date.now());t.dateTime=d.toISOString();t.textContent=d.toLocaleString('fr-FR');head.append(b,t);const p=document.createElement('p');p.textContent=String(row.message||'');li.append(head,p);list.append(li);}if(count)count.textContent=`${rows.length} message${rows.length>1?'s':''}`;contract(rows);}
  function send(){const a=document.getElementById('salonPartageAuthor'),m=document.getElementById('salonPartageMessage');const author=String(a?.value||'Opérateur').trim().slice(0,48)||'Opérateur';const message=String(m?.value||'').trim().slice(0,1000);if(!message){m?.focus();return;}const rows=safeParse();rows.push({id:`LOCAL-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,author,message,at:new Date().toISOString(),scope:'THIS_FIREFOX_ONLY'});if(save(rows)){if(m)m.value='';render();}}
  function clearAll(){if(!confirm('Effacer uniquement les messages locaux de ce Salon sur ce Firefox ?'))return;try{localStorage.removeItem(KEY);}catch(_){}render();}
  function exportRows(){const rows=safeParse(),blob=new Blob([JSON.stringify({schema:'erith_local_salon_v1',build:BUILD,scope:'THIS_FIREFOX_ONLY',backend:'DISCONNECTED',network_send:false,exported_at:new Date().toISOString(),messages:rows},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`erith-salon-local-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
  function openSalon(e){if(e)e.preventDefault();const d=document.getElementById('salon-partage');if(!d)return false;d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'});return true;}
  function snapshot(){const rows=safeParse();return Object.freeze({build:BUILD,scope:'THIS_FIREFOX_ONLY',identity:authorValue(),messages:rows.length,max_messages:MAX,backend:'DISCONNECTED',network_send:false,sync:'VOLUNTARY_UNAVAILABLE'});}
  function bind(){document.getElementById('btnSalonPartageSend')?.addEventListener('click',send);document.getElementById('btnSalonPartageClear')?.addEventListener('click',clearAll);document.getElementById('btnSalonPartageExport')?.addEventListener('click',exportRows);document.getElementById('salonPartageMessage')?.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();send();}});document.getElementById('salonPartageAuthor')?.addEventListener('input',()=>contract());document.querySelectorAll('a[href="#salon-partage"]').forEach(a=>a.addEventListener('click',openSalon));if(location.hash==='#salon-partage')setTimeout(()=>openSalon(),0);render();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  globalThis.ErithLocalSalon=Object.freeze({build:BUILD,scope:'THIS_FIREFOX_ONLY',multi_user:false,backend:false,network:false,storage:'localStorage',render,snapshot});
})();
