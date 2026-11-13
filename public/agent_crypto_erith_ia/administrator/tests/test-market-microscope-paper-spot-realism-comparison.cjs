"use strict";
/* Deterministic offline tests of the actual shared Administrator/Trader PAPER UI engine. */
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path"),crypto=require("node:crypto");
const ROOT=path.join(__dirname,".."),JS=path.join(ROOT,"js"),REPO=path.join(ROOT,"..","..","..","..");
const filenames=[
 "market-microscope-paper-backtest-v5.js",
 "market-microscope-orderbook-paper-v6.js",
 "market-microscope-paper-spot-lot-inventory-adapter.js",
 "market-microscope-paper-spot-realism-comparison.js"
];
const blobSha=buf=>crypto.createHash("sha1").update(Buffer.from("blob "+buf.length+"\0")).update(buf).digest("hex");
assert.equal(blobSha(fs.readFileSync(path.join(JS,filenames[0]))),"428003b37578b9b516a3f3e97696ee7c0a81836d");
assert.equal(blobSha(fs.readFileSync(path.join(JS,filenames[1]))),"ed7994ab8c9b8024afb49d0be11bfbc8056228bf");
const app={},ctx={console,Date,Number,Math,BigInt,Set};ctx.globalThis=ctx;
for(const filename of filenames)vm.runInNewContext(fs.readFileSync(path.join(JS,filename),"utf8"),ctx,{filename});
const core=ctx.SevenHeavenSpotPaperLotAdapter,ui=ctx.SevenHeavenPaperSpotRealism,v5=ctx.ErithMarketPaperBacktestV5,v6=ctx.ErithMarketBookPaperV6;
for(const a of [core,ui,v5,v6]){assert.equal(a.read_only,true);assert.equal(a.real_order,false);}
assert.equal(ui.orders,0);assert.equal(ui.api_credentials,false);
let passed=0;function test(name,fn){try{fn();passed++;console.log("PASS "+name)}catch(e){console.error("FAIL "+name+" "+e.stack);process.exitCode=1}}
const now=Date.parse("2026-11-13T03:00:00Z"),timeBar=900000;
const closes=[10,10,10,10,10,10,9,8,7,8,9,11,13,15,13,10,7,6,7,9,12,15];
function history(pair,price){
 const rows=closes.map((c,i)=>{
   const p=c*price/10;
   return{t:now-(closes.length+5-i)*timeBar,o:p,c:p,h:(c+1)*price/10,l:(c-1)*price/10,v:5,confirm:"1"};
 });
 function ema(n){
   let cur=null;return rows.map((r,i)=>{if(cur===null){if(i+1<n)return null;cur=rows.slice(i-n+1,i+1).reduce((s,x)=>s+x.c,0)/n;return cur}
      cur=r.c*2/(n+1)+cur*(n-1)/(n+1);return cur;});
 }
 const f=ema(2),s=ema(4),events=[];
 for(let i=1;i<rows.length;i++){
   if(f[i-1]===null||s[i-1]===null)continue;
   const a=f[i-1]-s[i-1],b=f[i]-s[i];
   const direction=a<=0&&b>0?"UP":a>=0&&b<0?"DOWN":null;
   if(direction)events.push({index:i,t:rows[i].t,direction,price:rows[i].c});
 }
 return{snapshot:{mode:"candles",source:"OKX",loadedInstrument:pair,loadedBar:"15m",emaPeriods:[2,4,12],rows},
    cross:{instrument:pair,bar:"15m",fastPeriod:2,slowPeriod:4,archiveSupported:true,events}};
}
function sampleBook(pair,price,step){
 return {provider:"okx",freshness:"FRESH",loading:false,error:null,external:false,
   pair:pair.replace("-","/"),loadedAsset:pair.split("-")[0],loadedQuote:"USDC",
   sourceObservedAt:new Date(now-1000).toISOString(),
   asks:[[(price+step).toFixed(step===0.1?1:2),0.00003],[(price+step*2).toFixed(step===0.1?1:2),100]],
   bids:[[(price-step).toFixed(step===0.1?1:2),0.00003],[(price-step*2).toFixed(step===0.1?1:2),100]]};
}
const positions=[
 ["BTC-USDC",70904.9,0.1,"0.00000001"],
 ["ETH-USDC",2009.18,0.01,"0.000001"]
];
const results=[];
for(const [pair,price,tick,lot]of positions){
 const h=history(pair,price);
 test(pair+" V5 original fixture and next open no orders",()=>{
  const o=v5.simulate(h.snapshot,h.cross,{initialCapital:1000,feePercent:.1,slippagePercent:.05},now);
  assert.equal(o.ok,true,JSON.stringify(o));assert.equal(o.closedTrades.length,1);assert(o.openPosition);assert.equal(o.orders,0);
 });
 for(const budget of [10,20,100,1000]){
  test(pair+" V5 round inventory "+budget,()=>{
    const settings={initialCapital:budget,feePercent:.1,slippagePercent:.05};
    const o=ui.compareV5(h.snapshot,h.cross,settings,now);
    assert.equal(o.ok,true,JSON.stringify(o));
    assert.equal(o.original_closed_trade_count,1);
    assert.equal(o.rounded_closed_trade_count,1);
    assert.equal(o.min_size_blocked_buy_count,0);
    assert.equal(o.orders,0);
    assert(Number.isFinite(o.rounded_paper_final));
    assert(Math.abs(o.difference_usdc)<budget*.005,"Excessive lot-round difference");
    const q=Number(o.rounded_open_quantity_base),l=Number(lot);
    assert(Math.abs(q/l-Math.round(q/l))<1e-5);
    results.push({pair,budget,mode:"V5",rounded_usdc:o.rounded_paper_final,raw_usdc:o.original_v5_final,delta:o.difference_usdc});
  });
  test(pair+" V6 same inventory roundtrip "+budget,()=>{
    const book=sampleBook(pair,price,tick),chart={loadedInstrument:pair,source:"OKX public candles"};
    const r=ui.compareV6(book,chart,{quoteBudget:budget,feePercent:.1},now);
    assert.equal(r.ok,true,JSON.stringify(r));
    assert.equal(r.orders,0);assert.equal(r.read_only,true);
    const qty=Number(r.rounded_buy_sell_base_quantity);
    assert(qty>0);
    assert(Math.abs(qty/Number(lot)-Math.round(qty/Number(lot)))<1e-5);
    assert(qty<r.raw_v6_base_quantity);
    assert(Number(r.roundtrip_book_friction_usdc)<0);
    results.push({pair,budget,mode:"V6",qty:r.rounded_buy_sell_base_quantity,
      friction:r.roundtrip_book_friction_usdc});
  });
 }
 test(pair+" V5 history gap denied",()=>{
  const broken={...h.snapshot,rows:h.snapshot.rows.map((r,i)=>i===10?{...r,t:r.t+3000}:r)};
  const r=ui.compareV5(broken,h.cross,{initialCapital:100,feePercent:.1,slippagePercent:.05},now);
  assert.equal(r.ok,false);assert.equal(r.code,"HISTORY_GAP");
 });
 test(pair+" V6 stale book denied",()=>{
  const book=sampleBook(pair,price,tick);
  book.sourceObservedAt=new Date(now-30000).toISOString();
  const r=ui.compareV6(book,{loadedInstrument:pair,source:"OKX public candles"},
    {quoteBudget:10,feePercent:.1},now);
  assert.equal(r.ok,false);assert.equal(r.code,"BOOK_STALE");
 });
 test(pair+" V5 no-signals retains full fictitious capital",()=>{
  const no={...h.cross,events:[]};
  const r=ui.compareV5(h.snapshot,no,{initialCapital:100,feePercent:.1,slippagePercent:.05},now);
  assert.equal(r.ok,true,JSON.stringify(r));
  assert.equal(r.rounded_paper_final,100);
  assert.equal(r.rounded_closed_trade_count,0);
 });
}
test("Browser has no authenticated endpoint or order writer",()=>{
 for(const filename of filenames.slice(2)){
   const s=fs.readFileSync(path.join(JS,filename),"utf8");
   assert(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendOrder|placeOrder|\/api\/v5\/trade|localStorage\./i.test(s));
 }
});
test("Administrator loads PAPER in correct dependency order exactly once",()=>{
 const html=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
 const keys=filenames.map(f=>html.indexOf("./js/"+f));
 assert(keys.every(x=>x>0)&&keys[0]<keys[1]&&keys[1]<keys[2]&&keys[2]<keys[3]);
 for(let i=2;i<4;i++)assert.equal(html.split("./js/"+filenames[i]).length,2);
});
test("Operator Trader mirrors the Operator Interface with separate Yoann profile",()=>{
 const html=fs.readFileSync(path.join(ROOT,"..","trader","trading-desk.html"),"utf8");
 assert(html.includes('src="../administrator/index.html?surface=trader&amp;view=intermediate&amp;profile=yohan"'));
 assert(html.includes("trader-runtime-mirror.js"));
 const mirror=fs.readFileSync(path.join(ROOT,"..","trader","trader-runtime-mirror.js"),"utf8");
 assert(mirror.includes("traderInterfaceRuntime"));
});
if(process.exitCode)process.exit(1);
console.log(JSON.stringify({status:"PASS_SHARED_ADMIN_TRADER_PAPER_UI_MATH",tests:passed,
  data:"synthetic offline only",fixtures:results.length,positions:results},null,2));
