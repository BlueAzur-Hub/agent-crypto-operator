'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'ai-asset-reading-view.js'),'utf8');
const runtime=fs.readFileSync(path.join(__dirname,'technical-reading-data-sync.js'),'utf8');
const mirror=fs.readFileSync(path.join(__dirname,'trader-runtime-mirror.js'),'utf8');
const entry=fs.readFileSync(path.join(__dirname,'trading-desk.html'),'utf8');
const administrator=fs.readFileSync(path.join(__dirname,'../administrator/index.html'),'utf8');
const account=fs.readFileSync(path.join(__dirname,'trader-okx-account.js'),'utf8');
const ctBefore=fs.readFileSync(path.join(__dirname,'ai-ct-panel.js'),'utf8');
class Fake {
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];
  this.attributes={};this.parent=null;this.listeners={};this.hidden=false;
  this.open=false;this.className='';this.id='';this.dataset={};this.ownText='';}
 set textContent(v){this.ownText=String(v??'');this.children=[];}
 get textContent(){return this.ownText+this.children.map(v=>v?.textContent||'').join('');}
 append(...args){for(let x of args){if(typeof x==='string')x=new FakeText(x);
    this.children.push(x);x.parent=this;} }
 prepend(x){this.children.unshift(x);x.parent=this;}
 replaceChildren(...args){this.children=[];this.ownText='';this.append(...args);}
 setAttribute(k,v){this.attributes[k]=String(v);}
 getAttribute(k){return this.attributes[k]??null;}
 addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
 fire(type){for(const fn of this.listeners[type]||[])fn({type,target:this});}
 insertAdjacentElement(where,x){if(!this.parent)throw Error('No parent for '+this.id);
   const i=this.parent.children.indexOf(this);
   this.parent.children.splice(i+(where==='afterend'?1:0),0,x);x.parent=this;}
 querySelector(sel){
   const match=n=>sel.startsWith('.')?n?.className?.split(/\s+/).includes(sel.slice(1)):
     n?.tagName===sel.toUpperCase();
   const walk=n=>(n.children||[]).flatMap(child=>[child,...walk(child)]);
   return walk(this).find(match)||null;
 }
}
class FakeText{constructor(value){this.textContent=value;this.parent=null;}}
function setup(){
 const root=new Fake('div'),host=new Fake('div'),ct=new Fake('details'),nav=new Fake('nav');
 ct.id='aiCtPanel';ct.open=true;
 const ctSummary=new Fake('summary'),ctSpan=new Fake('span');
 const ctTitle=new Fake('b'),ctCaption=new Fake('small'),ctBody=new Fake('div');
 ctTitle.textContent='IA · Concrete (CT)';
 ctCaption.textContent='Apprendre · Analyser · position privée CT/USDC';
 ctBody.className='ai-ct-panel-body';
 ctBody.textContent='CT private untouched marker';
 ctSpan.append(ctTitle,ctCaption);ctSummary.append(ctSpan);
 ct.append(ctSummary,ctBody);
 const ctQuick=new Fake('button');ctQuick.id='aiCtToggle';
 ctQuick.textContent='IA · Concrete';ctQuick.setAttribute('aria-controls','aiCtPanel');
 nav.append(ctQuick);root.append(host,nav);host.append(ct);
 const document={baseURI:'https://example.invalid/public/agent_crypto_erith_ia/trader/trading-desk.html',
  head:new Fake('head'),createElement:tag=>new Fake(tag),
  querySelector:sel=>sel==='#accueil .atlas-v2-nav-essential'?nav:null,
  createTextNode:value=>new FakeText(String(value)),
  getElementById:id=>id==='detailPanelBody'?host:id==='aiCtPanel'?ct:
     id==='aiCtToggle'?ctQuick:
     id==='sevenAssetReading'?ct.children.find(x=>x.id===id)||null:null};
 const listeners={};
 const window={addEventListener:(name,fn)=>{(listeners[name]??=[]).push(fn);},
  fire:(name)=>{for(const fn of listeners[name]||[])fn({type:name});}};
 const now=new Date().toISOString();
 let coin={id:'bitcoin',symbol:'BTC',name:'Bitcoin',priceUsd:82692,
  change24h:1.25,usdSource:'CoinGecko',usdUpdatedAt:now};
 let chart={mode:'candles',loadedInstrument:'BTC-USDC',loadedBar:'5m',
  rows:[{o:82600,h:82700,l:82500,c:82650,v:12}]};
 let privateWait=null,privateCalls=0,external=null,externalPublic=null;
 const owner={
  calls:()=>privateCalls,
  ticketReadOnly:(pair)=>new Promise(resolve=>{privateCalls++;if(!privateWait)privateWait={};
    privateWait.account={pair,resolve};}),
  basePositionReadOnly:(pair)=>new Promise(resolve=>{if(!privateWait)privateWait={};
    privateWait.position={pair,resolve};})
 };
 const globals={document,window,URL,Date,Number,String,Object,Array,
   console,queueMicrotask:fn=>fn(),
   AgentCryptoAiAssetReading:require('./ai-asset-reading-core.js'),
   AgentCryptoTraderMarket:{selected:()=>coin},
   AgentCryptoNewListingsNativeCategory:{
    snapshot:()=>external,selectedMarketCoin:()=>externalPublic},
   AgentCryptoMarketMicroscope:{snapshot:()=>chart,technicalLevels:()=>null},
   AgentCryptoTraderOkxAccount:owner};
 globals.globalThis=globals;
 vm.runInNewContext(code,globals,{filename:'ai-asset-reading-view.js'});
 const panel=document.getElementById('sevenAssetReading');
 const descendants=(node)=>[node,...(node.children||[]).flatMap(descendants)];
 const byText=(x)=>descendants(panel).find(n=>n.tagName==='BUTTON'&&n.textContent.includes(x));
 const heading=()=>ctTitle.textContent;
 const statuses=()=>descendants(panel).filter(x=>x.className==='seven-asset-card').map(x=>x.textContent);
 return {panel,ct,ctBody,ctTitle,ctCaption,host,nav,window,owner,globals,byText,heading,statuses,
  singleQuick:()=>ctQuick,
  select:(id,symbol,instr)=>{
   external=null;externalPublic=null;
   coin={id,symbol,name:symbol,priceUsd:2443,usdSource:'CoinGecko',usdUpdatedAt:now};
   chart={...chart,external:false,loadedInstrument:instr||symbol+'-USDC'};
   window.fire('agent-crypto:trader-selection-changed');
  },
  external:(id,symbol,pair,provider='bitget',loadedPair=pair)=>{
   external={selectedId:id,selectedSymbol:symbol,
     selectedProvider:provider,selectedPair:pair.replace('-', '/')};
   externalPublic={id,symbol,name:symbol,listingPair:pair.replace('-', '/'),
     listingProvider:provider,priceUsd:0.227363,change24h:7.27,
     usdSource:provider+' '+pair+' public USD',usdUpdatedAt:now};
   chart={...chart,external:true,loadedInstrument:loadedPair,
     source:provider.toUpperCase()+' public candles',lastLoadedAt:now,
     request_key:provider+'|'+loadedPair+'|5m',loading:false,errorCode:null};
   window.fire('agent-crypto:external-asset-changed');
   window.fire('agent-crypto:new-listing-line-ready');
  },
  externalClear:()=>{
   external=null;externalPublic=null;
   chart={...chart,external:false,loadedInstrument:'BTC-USDC'};
   window.fire('agent-crypto:external-asset-changed');
  },settle:(account,position)=>{
   if(!privateWait)throw Error('No private pending request');
   privateWait.account.resolve(account);privateWait.position.resolve(position);privateWait=null;
  }};
}
test('one single native Technical Reading frame hosts BTC and preserves CT private nodes',()=>{
 const v=setup();
 assert.equal(v.host.children.length,1,'no second accordion row');
 assert.equal(v.host.children[0],v.ct);
 assert.equal(v.panel.tagName,'DIV');
 assert.equal(v.panel.parent,v.ct);
 assert.equal(v.panel.hidden,false);
 assert.equal(v.ctBody.hidden,true);
 assert.match(v.heading(),/BTC/);
 assert.equal(v.statuses().length,7);
 assert.equal(v.ctBody.textContent,'CT private untouched marker');
 assert.equal(v.ct.open,true);
 assert.equal(v.nav.children.length,1,'no second IA shortcut');
 assert.equal(v.singleQuick().getAttribute('aria-controls'),'aiCtPanel');
 assert.equal(v.byText('Lire mon compte').type,'button');
});
test('BTC → CT → ETH → CT does not delete, hide or rewrite any CT private node',()=>{
 const v=setup();
 v.select('concrete','CT','CT-USDT');
 assert.equal(v.panel.hidden,true);
 assert.equal(v.ctBody.hidden,false);
 assert.equal(v.heading(),'IA · Concrete (CT)');
 assert.equal(v.singleQuick().textContent,'IA · Concrete');
 assert.equal(v.ctBody.textContent,'CT private untouched marker');
 assert.equal(v.ct.hidden,false);
 assert.equal(v.ct.open,true);
 v.select('ethereum','ETH','ETH-USDC');
 assert.equal(v.panel.hidden,false);
 assert.equal(v.ctBody.hidden,true);
 assert.match(v.heading(),/ETH/);
 assert.doesNotMatch(v.heading(),/BTC|Concrete/);
 assert.equal(v.statuses().length,7);
 assert.equal(v.host.children.length,1);
 v.select('concrete','CT','CT-USDT');
 assert.equal(v.panel.hidden,true);
 assert.equal(v.ctBody.textContent,'CT private untouched marker');
 assert.equal(v.ct.hidden,false);
});
test('Market BTC with CT chart cannot paint private BTC or CT details incorrectly',()=>{
 const v=setup();
 v.select('bitcoin','BTC','CT-USDT');
 assert.equal(v.panel.hidden,true);
 assert.equal(v.ctBody.textContent,'CT private untouched marker');
 v.select('bitcoin','BTC','ETH-USDC');
 assert.equal(v.panel.hidden,false);
 assert.match(v.heading(),/Sources en attente/);
 assert.equal(v.statuses().length,0);
 assert.equal(v.byText('Lire mon compte').disabled,true);
});
test('late private BTC result cannot paint after an ETH selection',async()=>{
 const v=setup(),b=v.byText('Lire mon compte');
 b.fire('click');v.select('ethereum','ETH','ETH-USDC');
 v.settle({instId:'BTC-USDC',read_only:true,orders_enabled:false,
  verified:true,real_orders:0,account_at_utc:new Date().toISOString(),
  trading_available_quote:'10'},
  {pair:'BTC-USDC',read_only:true,verified:true,orders_enabled:false,
   real_orders:0,trading_base:'5',funding_base:'2',
   observed_at_utc:new Date().toISOString()});
 for(let i=0;i<8;i++)await Promise.resolve();
 assert.match(v.heading(),/ETH/);
 assert.doesNotMatch(v.statuses().join('\n'),/Trading ETH5 ETH|Funding ETH2 ETH|Trading USDC10 USDC/);
 assert.equal(v.ctBody.textContent,'CT private untouched marker');
});
test('DNA Bitget New Listing supersedes stale Market BTC with its own Seven dossier',()=>{
 const v=setup();
 v.external('neosoul','DNA','DNA-USDT');
 assert.equal(v.panel.hidden,false);
 assert.match(v.heading(),/Dossier DNA · Seven/);
 assert.equal(v.statuses().length,7);
 assert.doesNotMatch(v.statuses().join(' '),/82692|82 692|BTC-USDC/);
 assert.equal(v.byText('Lire mon compte').disabled,true);
 assert.equal(v.byText('Actualiser les sources publiques').disabled,true);
 v.byText('Lire mon compte').fire('click');
 v.byText('Actualiser les sources publiques').fire('click');
 assert.equal(v.owner.calls(),0,'Bitget listing must not request an OKX account');
 assert.equal(v.ctBody.textContent,'CT private untouched marker');
 assert.equal(v.ct.open,true);
});
test('DNA reuses its native Market price, never the BTC cache or another listing',()=>{
 const v=setup();
 v.external('neosoul','DNA','DNA-USDT');
 assert.match(v.statuses()[1],/0\.227363|0,227363/);
 assert.doesNotMatch(v.statuses().join(' '),/82692|82 692|BTC-USDC/);
 assert.match(v.statuses()[0],/source identifiée et datée/);
 assert.doesNotMatch(v.statuses()[0],/devise du graphique distincte/);
 assert.match(v.statuses()[0],/paire identique au Spot DNA-USDT/);
 v.globals.AgentCryptoNewListingsNativeCategory.selectedMarketCoin=()=>({
  id:'bitcoin',symbol:'BTC',listingPair:'BTC/USDC',priceUsd:82692,
  usdUpdatedAt:new Date().toISOString(),usdSource:'CoinGecko'});
 v.window.fire('agent-crypto:new-listing-line-ready');
 assert.doesNotMatch(v.statuses()[1],/82692|82 692|0\.227363|0,227363/);
});
test('external chart provenance must match the listing venue, not just the symbol',()=>{
 const v=setup();
 v.external('neosoul','DNA','DNA-USDT','bitget');
 assert.match(v.statuses()[0],/source identifiée et datée/);
 const chart=v.globals.AgentCryptoMarketMicroscope.snapshot;
 v.globals.AgentCryptoMarketMicroscope.snapshot=()=>({
  ...chart(),source:'OKX public candles'});
 v.window.fire('agent-crypto:market-candles-loaded');
 assert.match(v.statuses()[0],/Bougies exactes DNA non chargées/);
});
test('New Listing rejects stale chart identity and cannot borrow BTC proof',()=>{
 const v=setup();
 v.external('neosoul','DNA','DNA-USDT','bitget','BTC-USDC');
 assert.equal(v.panel.hidden,false);
 assert.match(v.heading(),/Sources en attente/);
 assert.equal(v.statuses().length,0);
 assert.equal(v.byText('Lire mon compte').disabled,true);
 v.external('neosoul','DNA','DNA-USDT');
 assert.match(v.heading(),/Dossier DNA/);
 v.external('otherdna','DNA','DNA-USDC','bitget','DNA-USDT');
 assert.match(v.heading(),/Sources en attente/);
 assert.equal(v.statuses().length,0);
});
test('external CT still belongs exclusively to Concrete and returning to BTC is isolated',()=>{
 const v=setup();
 v.external('concrete','CT','CT-USDT','okx');
 assert.equal(v.panel.hidden,true);
 assert.equal(v.ct.open,true);
 assert.equal(v.ctBody.textContent,'CT private untouched marker');
 v.external('neosoul','DNA','DNA-USDT');
 assert.match(v.heading(),/Dossier DNA/);
 v.externalClear();
 assert.match(v.heading(),/Dossier BTC/);
 assert.equal(v.statuses().length,7);
 assert.equal(v.ctBody.textContent,'CT private untouched marker');
});
test('unknown New Listing identity never creates a guessed position',()=>{
 const v=setup();
 v.external('other','DNA','DNA-USDT','unknown');
 assert.equal(v.panel.hidden,false);
 assert.equal(v.statuses().length,0);
 assert.equal(v.owner.calls(),0);
 assert.equal(v.ctBody.textContent,'CT private untouched marker');
});
test('Trader iframe actually loads the Technical Reading owner once; Administrator does not',()=>{
 assert.match(entry,/src="\.\/trader-runtime-mirror\.js/);
 assert.match(entry,/src="\.\.\/administrator\/index\.html\?surface=trader"/);
 assert.match(mirror,/if\(!doc\.getElementById\("traderTechnicalReadingSyncScript"\)\)/);
 assert.equal((mirror.match(/script\.id="traderTechnicalReadingSyncScript"/g)||[]).length,1);
 assert.match(mirror,/script\.src=new URL\("\.\.\/trader\/technical-reading-data-sync\.js",doc\.baseURI\)\.href/);
 assert.ok(mirror.indexOf('traderAiCtContractScript')<
           mirror.indexOf('traderTechnicalReadingSyncScript'),
           'Seven loader must not replace the original CT owner');
 assert.match(runtime,/function mountSevenDossier\(\)/);
 assert.match(runtime,/new URL\("\.\.\/trader\/ai-asset-reading-core\.js",document\.baseURI\)/);
 assert.match(runtime,/new URL\("\.\.\/trader\/ai-asset-reading-view\.js",document\.baseURI\)/);
 assert.match(runtime,/function start\(\)\{bind\(\);mountSevenDossier\(\);\}/);
 assert.doesNotMatch(administrator,/technical-reading-data-sync\.js|traderTechnicalReadingSyncScript/);
 assert.doesNotMatch(mirror,/localStorage\.|indexedDB\.|orders_enabled\s*=\s*true/);
});
test('one existing IA shortcut follows DNA and restores Concrete on CT',()=>{
 const v=setup();
 assert.equal(v.nav.children.length,1);
 assert.match(v.singleQuick().textContent,/BTC/);
 v.external('neosoul','DNA','DNA-USDT');
 assert.equal(v.host.children.length,1);
 assert.equal(v.panel.hidden,false);
 assert.equal(v.ctBody.hidden,true);
 assert.equal(v.ct.open,true);
 assert.match(v.singleQuick().textContent,/DNA/);
 assert.equal(v.statuses().length,7);
 v.external('concrete','CT','CT-USDT','okx');
 assert.equal(v.panel.hidden,true);
 assert.equal(v.ctBody.hidden,false);
 assert.equal(v.singleQuick().textContent,'IA · Concrete');
 assert.equal(v.ctTitle.textContent,'IA · Concrete (CT)');
 assert.equal(v.ctCaption.textContent,'Apprendre · Analyser · position privée CT/USDC');
 assert.equal(v.ctBody.textContent,'CT private untouched marker');
 assert.equal(v.nav.children.length,1);
});
test('unknown listing clears old Seven rows without exposing CT private content',()=>{
 const v=setup();
 assert.equal(v.statuses().length,7);
 v.external('unknown','DNA','DNA-USDT','unknown');
 assert.equal(v.panel.hidden,false);
 assert.equal(v.ctBody.hidden,true);
 assert.equal(v.statuses().length,0);
 assert.equal(v.nav.children.length,1);
 assert.equal(v.ctBody.textContent,'CT private untouched marker');
});
test('closing Technical Reading persists across asset changes',()=>{
 const v=setup();
 v.ct.open=false;
 v.select('ethereum','ETH','ETH-USDC');
 assert.equal(v.ct.open,false,'do not force a user-closed window');
 assert.equal(v.host.children.length,1);
 v.select('concrete','CT','CT-USDT');
 assert.equal(v.ct.open,false);
 assert.equal(v.ctBody.hidden,false);
});
test('single-frame invariants reject duplicate mounts and duplicate controls',()=>{
 const v=setup();
 assert.equal(v.panel.tagName,'DIV');
 assert.equal(v.panel.parent,v.ct);
 assert.equal(v.host.children.filter(x=>x.tagName==='DETAILS').length,1);
 assert.equal(v.nav.children.filter(x=>x.id==='aiCtToggle').length,1);
 assert.equal(v.nav.children.filter(x=>x.id==='aiSevenToggle').length,0);
 assert.match(code,/ct\.append\(panel\)/);
 assert.doesNotMatch(code,/insertAdjacentElement\('beforebegin',panel\)|el\('details','seven-asset-reading'\)|nav\.append\(quick\)/);
});
test('CT source files unchanged by renderer and account proof is opt-in only',()=>{
 assert.match(runtime,/traderSevenAssetCoreScript/);
 assert.match(runtime,/traderSevenAssetViewScript/);
 assert.match(code,/if\(symbol==='CT'\|\|graphBase==='CT'\)/);
 assert.match(code,/!same\(initial.identity,token\)/);
 assert.match(code,/basePositionReadOnly\(pair\)/);
 assert.match(code,/privateButton\.addEventListener\('click'/);
 assert.match(account,/async function basePositionReadOnly\(instId\)/);
 assert.match(account,/Une sous-position/);
 assert.doesNotMatch(code,/aiCtPanel\.hidden|aiCtPanel\.open|aiCtDetails|localStorage\./);
 assert.match(ctBefore,/Lire ma position CT\/USDC/);
});
