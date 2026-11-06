/* Deterministic V6 PAPER order-book smoke/regression fixtures; no network or order API. */
"use strict";
const assert=require("node:assert/strict");
const path=require("node:path");
require(path.join(__dirname,"../js/market-microscope-orderbook-paper-v6.js"));
const api=globalThis.ErithMarketBookPaperV6;
assert.equal(api.read_only,true);
assert.equal(api.real_order,false);
assert.equal(api.uses_historical_book,false);
const NOW=Date.parse("2026-11-06T06:37:30Z");
const basicBook=()=>({
  provider:"okx",freshness:"FRESH",loading:false,error:null,external:false,
  pair:"BTC/USDC",loadedAsset:"BTC",loadedQuote:"USDC",
  sourceObservedAt:new Date(NOW-1000).toISOString(),
  bids:[[100,4],[99,20]],asks:[[102,4],[103,20]]
});
const chart=()=>({loadedInstrument:"BTC-USDC",source:"OKX public candles",loading:false,error:null});
const settings=(side="BUY",quoteBudget=1000,feePercent=0.1)=>({side,quoteBudget,feePercent});
let passed=0;
function test(name,fn){try{fn();passed++;process.stdout.write("PASS "+name+"\n");}catch(e){process.stderr.write("FAIL "+name+" "+String(e.stack||e)+"\n");process.exitCode=1;}}
test("buy sweep: quote budget includes fee, no order",()=>{
 const r=api.simulate(basicBook(),chart(),settings(),NOW);
 assert.equal(r.ok,true);assert.equal(r.mode,"LIVE_BOOK_INSTANT_PAPER");
 assert.equal(r.levelsUsed,2);assert.ok(r.vwap>102);assert.ok(r.impactBestBps>0);
 assert.ok(Math.abs(r.totalQuote-1000)<1e-7);assert.ok(r.feeQuote>0);
 assert.equal(r.orders,0);assert.equal(r.read_only,true);assert.equal(r.quote,"USDC");
});
test("sell sweep: base quantity from mid reference, fee reduces proceeds",()=>{
 const r=api.simulate(basicBook(),chart(),settings("SELL"),NOW);
 assert.equal(r.ok,true);assert.equal(r.levelsUsed,2);assert.ok(r.vwap<100);
 assert.ok(r.totalQuote<r.grossQuote);assert.ok(r.feeQuote>0);assert.equal(r.orders,0);
});
test("fee increases on fixed buy budget, modeled BTC quantity decreases",()=>{
 const noFee=api.simulate(basicBook(),chart(),settings("BUY",1000,0),NOW);
 const withFee=api.simulate(basicBook(),chart(),settings("BUY",1000,0.1),NOW);
 assert.equal(noFee.ok,true);assert.equal(withFee.ok,true);
 assert.ok(noFee.baseQuantity>withFee.baseQuantity);
});
test("too little visible depth is refused, not partially filled",()=>{
 const b=basicBook();b.asks=[[102,0.0001]];
 const r=api.simulate(b,chart(),settings(),NOW);
 assert.equal(r.ok,false);assert.equal(r.code,"INSUFFICIENT_LIQUIDITY");
});
test("stale timestamp refused even if badge says FRESH",()=>{
 const b=basicBook();b.sourceObservedAt=new Date(NOW-30000).toISOString();
 assert.equal(api.simulate(b,chart(),settings(),NOW).code,"BOOK_STALE");
});
test("book timestamp >5s future refused",()=>{
 const b=basicBook();b.sourceObservedAt=new Date(NOW+6000).toISOString();
 assert.equal(api.simulate(b,chart(),settings(),NOW).code,"BOOK_STALE");
});
test("stale badge refused even if timestamp is recent",()=>{
 const b=basicBook();b.freshness="STALE";
 assert.equal(api.simulate(b,chart(),settings(),NOW).code,"BOOK_CONTEXT");
});
test("different book quote or chart instrument refused",()=>{
 const b=basicBook();b.loadedQuote="EUR";
 assert.equal(api.simulate(b,chart(),settings(),NOW).code,"BOOK_CONTEXT");
 const c=chart();c.loadedInstrument="ETH-USDC";
 assert.equal(api.simulate(basicBook(),c,settings(),NOW).code,"BOOK_CONTEXT");
});
test("unsupported or stale chart refused",()=>{
 const c=chart();c.source="CoinGecko";
 assert.equal(api.simulate(basicBook(),c,settings(),NOW).code,"CHART_UNAVAILABLE");
});
test("external book and empty depth refused",()=>{
 const ext=basicBook();ext.external=true;
 assert.equal(api.simulate(ext,chart(),settings(),NOW).code,"BOOK_CONTEXT");
 const empty=basicBook();empty.asks=[];
 assert.equal(api.simulate(empty,chart(),settings(),NOW).code,"BOOK_LEVELS");
});
test("crossed and unsorted books rejected",()=>{
 const crossed=basicBook();crossed.bids=[[105,3],[99,5]];
 assert.equal(api.simulate(crossed,chart(),settings(),NOW).code,"BOOK_CROSSED");
 const unsorted=basicBook();unsorted.asks=[[103,4],[102,20]];
 assert.equal(api.simulate(unsorted,chart(),settings(),NOW).code,"BOOK_LEVELS");
});
test("nonpositive and infinite levels rejected",()=>{
 const a=basicBook();a.bids=[[100,-2],[99,3]];
 assert.equal(api.simulate(a,chart(),settings(),NOW).code,"BOOK_LEVELS");
 const b=basicBook();b.asks=[[102,Infinity]];
 assert.equal(api.simulate(b,chart(),settings(),NOW).code,"BOOK_LEVELS");
});
test("invalid user settings rejected",()=>{
 for(const s of [settings("BUY",1),settings("BUY",1000,-1),settings("SHORT"),settings("BUY",Infinity)]){
  assert.equal(api.simulate(basicBook(),chart(),s,NOW).code,"SETTINGS_INVALID");
 }
});
test("no modification of source snapshot arrays",()=>{
 const b=basicBook(),copy=JSON.stringify(b);
 const r=api.simulate(b,chart(),settings(),NOW);
 assert.equal(r.ok,true);assert.equal(JSON.stringify(b),copy);
});
test("one-level full fill gives no book impact beyond best ask",()=>{
 const b=basicBook();b.asks=[[102,100],[103,20]];
 const r=api.simulate(b,chart(),settings("BUY",100,0.1),NOW);
 assert.equal(r.ok,true);assert.equal(r.levelsUsed,1);
 assert.ok(Math.abs(r.impactBestBps)<1e-9);
 assert.ok(r.deviationMidBps>0); // spread still matters
});
process.stdout.write(passed+"/15 V6 historical-safe instant-depth tests passed\n");
if(passed!==15)process.exitCode=1;

// Integration orchestration tests: one click opens Depth, uses existing refresh,
// awaits a validated public book, and stays read-only. No real browser or network.
(async()=>{
 let extraPassed=0;
 async function scenario(name,fn){
   try{await fn();extraPassed++;process.stdout.write("PASS "+name+"\n");}
   catch(e){process.stderr.write("FAIL "+name+" "+String(e.stack||e)+"\n");process.exitCode=1;}
 }
 function mockBook(initial=basicBook()){
   return {
     state:initial,opened:0,restored:0,refreshes:0,
     snapshot(){return this.state;},
     setOpen(value){assert.equal(value,true);this.opened++;return true;},
     setMinimized(value){assert.equal(value,false);this.restored++;return false;},
     async refresh(){this.refreshes++;this.state=basicBook();return true;}
   };
 }
 const options={now:()=>NOW,showDepth:()=>true,sleep:async()=>{},ensureReading:async()=>true};
 await scenario("one click opens Depth and estimates with current valid book",async()=>{
   const book=mockBook();let shown=0;
   const r=await api.openDepthAndEstimate(book,{snapshot:chart},settings(),{...options,showDepth:()=>{shown++;return true;}});
   assert.equal(r.ok,true);assert.equal(r.orders,0);
   assert.equal(book.opened,1);assert.equal(book.restored,1);assert.equal(shown,1);assert.equal(book.refreshes,0);
 });
 await scenario("initial background loading is awaited before calculation",async()=>{
   const book=mockBook({...basicBook(),loading:true,freshness:"UNKNOWN"});
   let waits=0;
   const r=await api.openDepthAndEstimate(book,{snapshot:chart},settings(),{
     ...options,sleep:async()=>{waits++;book.state=basicBook();}
   });
   assert.equal(r.ok,true);assert.equal(book.opened,1);assert.equal(book.refreshes,0);assert.ok(waits>0);
 });
 await scenario("existing stale book refreshes once, then returns FRESH estimate",async()=>{
   const old={...basicBook(),sourceObservedAt:new Date(NOW-30000).toISOString()};
   const book=mockBook(old);
   const r=await api.openDepthAndEstimate(book,{snapshot:chart},settings(),options);
   assert.equal(r.ok,true);assert.equal(book.refreshes,1);assert.equal(book.opened,1);
 });
 await scenario("stale after explicit refresh remains blocked",async()=>{
   const stale={...basicBook(),sourceObservedAt:new Date(NOW-30000).toISOString()};
   const book=mockBook(stale);book.refresh=async()=>{book.refreshes++;return false;};
   const r=await api.openDepthAndEstimate(book,{snapshot:chart},settings(),options);
   assert.equal(r.ok,false);assert.equal(r.code,"BOOK_STALE");assert.equal(book.refreshes,1);
 });
 await scenario("missing depth API refuses without guessing a snapshot",async()=>{
   const r=await api.openDepthAndEstimate(null,{snapshot:chart},settings(),options);
   assert.equal(r.code,"BOOK_SERVICE_UNAVAILABLE");
 });
 await scenario("wrong chart and invalid settings refused before opening",async()=>{
   const book=mockBook();
   const other=()=>({...chart(),source:"CoinGecko"});
   assert.equal((await api.openDepthAndEstimate(book,{snapshot:other},settings(),options)).code,"CHART_UNAVAILABLE");
   assert.equal((await api.openDepthAndEstimate(book,{snapshot:chart},settings("BUY",1000,-1),options)).code,"SETTINGS_INVALID");
   assert.equal(book.opened,0);
 });
 await scenario("different pair is blocked even after explicit refresh",async()=>{
   const book=mockBook({...basicBook(),pair:"ETH/USDC",loadedAsset:"ETH"});
   book.refresh=async()=>{book.refreshes++;return true;};
   const r=await api.openDepthAndEstimate(book,{snapshot:chart},settings(),options);
   assert.equal(r.code,"BOOK_CONTEXT");assert.equal(book.refreshes,1);
 });
 await scenario("loading timeout is finite and never uses stale book",async()=>{
   const book=mockBook({...basicBook(),loading:true});
   let clock=NOW;
   const r=await api.openDepthAndEstimate(book,{snapshot:chart},settings(),{
     now:()=>clock,showDepth:()=>true,sleep:async()=>{clock+=2000;},ensureReading:async()=>true
   });
   assert.equal(r.code,"BOOK_LOADING_TIMEOUT");assert.equal(book.refreshes,0);
 });
 await scenario("unavailable Depth UI shows an error without execution",async()=>{
   const book=mockBook();
   const r=await api.openDepthAndEstimate(book,{snapshot:chart},settings(),{...options,showDepth:()=>false});
   assert.equal(r.code,"DEPTH_TAB_UNAVAILABLE");assert.equal(book.opened,1);assert.equal(book.refreshes,0);
 });
 // Native Lecture Technique rail is authoritative; minimal simulated DOM.
 async function withReadingDom(config,fn){
   const {collapsed=false,rail=true,railWorks=true,width=340,height=600,panel=true}=config;
   const priorDoc=globalThis.document,priorRaf=globalThis.requestAnimationFrame;
   const classes=new Set(collapsed?["detail-collapsed"]:[]);
   let clicks=0;
   const deck={classList:{contains:v=>classes.has(v)}};
   const detail={getBoundingClientRect:()=>({width:classes.has("detail-collapsed")?0:width,height:classes.has("detail-collapsed")?0:height})};
   const sideRail={click(){clicks++;if(railWorks)classes.delete("detail-collapsed");}};
   globalThis.document={getElementById:id=>({
     analyste:deck,detailPanel:panel?detail:null,detailPanelRail:rail?sideRail:null
   })[id]||null};
   globalThis.requestAnimationFrame=cb=>{cb();return 1;};
   try{return await fn({classes,clicks:()=>clicks});}
   finally{
     if(priorDoc===undefined)delete globalThis.document;else globalThis.document=priorDoc;
     if(priorRaf===undefined)delete globalThis.requestAnimationFrame;else globalThis.requestAnimationFrame=priorRaf;
   }
 }
 await scenario("collapsed Lecture Technique opens via existing native rail",async()=>{
   await withReadingDom({collapsed:true},async d=>{
     assert.equal(await api.ensureTechnicalReading(),true);
     assert.equal(d.clicks(),1);assert.equal(d.classes.has("detail-collapsed"),false);
   });
 });
 await scenario("already open Lecture Technique is not toggled shut",async()=>{
   await withReadingDom({},async d=>{
     assert.equal(await api.ensureTechnicalReading(),true);
     assert.equal(d.clicks(),0);
   });
 });
 await scenario("missing rail refuses and prevents oversized Depth",async()=>{
   await withReadingDom({collapsed:true,rail:false},async()=>{
     assert.equal(await api.ensureTechnicalReading(),false);
   });
 });
 await scenario("rail did not open reading: fail closed",async()=>{
   await withReadingDom({collapsed:true,railWorks:false},async d=>{
     assert.equal(await api.ensureTechnicalReading(),false);assert.equal(d.clicks(),1);
   });
 });
 await scenario("hidden or missing technical panel fails dock guard",async()=>{
   await withReadingDom({width:0,height:0},async()=>{
     assert.equal(await api.ensureTechnicalReading(),false);
   });
   await withReadingDom({panel:false},async()=>{
     assert.equal(await api.ensureTechnicalReading(),false);
   });
 });
 await scenario("one click orders Lecture, unmaximize, redock, open and switch Depth",async()=>{
   const book=mockBook({...basicBook(),maximized:true,detached:true});
   const order=[];
   book.setMaximized=value=>{assert.equal(value,false);order.push("unmaximize");book.state.maximized=false;};
   book.setDetached=value=>{assert.equal(value,false);order.push("dock");book.state.detached=false;};
   book.setMinimized=value=>{assert.equal(value,false);order.push("unminimize");};
   book.setOpen=value=>{assert.equal(value,true);order.push("depthOpen");return true;};
   const r=await api.openDepthAndEstimate(book,{snapshot:chart},settings(),{
     ...options,ensureReading:async()=>{order.push("lectureOpen");return true;},
     showDepth:()=>{order.push("depthTab");return true;}
   });
   assert.equal(r.ok,true);assert.equal(r.orders,0);
   assert.deepEqual(order,["lectureOpen","unmaximize","dock","unminimize","depthOpen","depthTab"]);
 });
 await scenario("unavailable Lecture refuses with no Depth open or refresh",async()=>{
   const book=mockBook();
   const r=await api.openDepthAndEstimate(book,{snapshot:chart},settings(),{
     ...options,ensureReading:async()=>false
   });
   assert.equal(r.code,"TECH_PANEL_UNAVAILABLE");assert.equal(book.opened,0);assert.equal(book.refreshes,0);
 });
 process.stdout.write(extraPassed+"/16 one-click & Lecture tests passed\n");
 if(extraPassed!==16)process.exitCode=1;
})().catch(e=>{process.stderr.write(String(e.stack||e)+"\n");process.exitCode=1;});

