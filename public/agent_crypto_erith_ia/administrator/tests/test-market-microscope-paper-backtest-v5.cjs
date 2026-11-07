/* V5 reproducible Node regression checks; run: node tests/test-market-microscope-paper-backtest-v5.cjs */
(function v5TestRunner(){
  "use strict";
  const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
  const source=fs.readFileSync(path.join(__dirname,"../js/market-microscope-paper-backtest-v5.js"),"utf8");
  const sandbox={};sandbox.globalThis=sandbox;vm.runInNewContext(source,sandbox);
  const {simulate,defaults,real_order,read_only}=sandbox.ErithMarketPaperBacktestV5;
  const closes=[10,10,10,10,10,10,9,8,7,8,9,11,13,15,13,10,7,6,7,9,12,15],ms=900000,now=1700000000000;
  const rows=closes.map((c,i)=>({t:now-(closes.length+5-i)*ms,o:c,h:c+1,l:c-1,c,v:5,confirm:"1"}));
  function ema(n){let current=null;return rows.map((r,i)=>{if(current===null){if(i+1<n)return null;current=rows.slice(i-n+1,i+1).reduce((s,x)=>s+x.c,0)/n;return current;}current=r.c*2/(n+1)+current*(n-1)/(n+1);return current;});}
  const fast=ema(2),slow=ema(4),events=[];
  for(let i=1;i<rows.length;i++){if(fast[i-1]===null||slow[i-1]===null)continue;const old=fast[i-1]-slow[i-1],recent=fast[i]-slow[i],direction=old<=0&&recent>0?"UP":old>=0&&recent<0?"DOWN":null;if(direction)events.push({index:i,t:rows[i].t,direction,price:rows[i].c});}
  const snapshot={mode:"candles",loading:false,error:null,source:"OKX",loadedInstrument:"BTC-USDC",loadedBar:"15m",emaPeriods:[2,4,12],rows};
  const cross={instrument:"BTC-USDC",bar:"15m",fastPeriod:2,slowPeriod:4,archiveSupported:true,events};
  const run=(s=snapshot,c=cross,settings=defaults,n=now)=>simulate(s,c,settings,n);
  let count=0;function test(label,fn){fn();count++;process.stdout.write("PASS "+label+"\n");}
  test("V4 cross fixture",()=>assert.equal(events.map(x=>x.direction+":"+x.index).join(","),"DOWN:6,UP:10,DOWN:15,UP:19"));
  test("read-only one completed and one open position",()=>{const r=run();assert.equal(r.ok,true);assert.equal(r.orders,0);assert.equal(real_order,false);assert.equal(read_only,true);assert.equal(r.closedTrades.length,1);assert.equal(r.openPosition.entryAt,rows[20].t);assert.equal(r.closedTrades[0].entryAt,rows[11].t);assert.equal(r.closedTrades[0].exitAt,rows[16].t);});
  test("fees and slippage reproducible",()=>{const r=run(),qty=1000/(rows[11].o*1.0005*1.001),proceeds=qty*rows[16].o*.9995*.999;assert.ok(Math.abs(r.closedTrades[0].capitalAfter-proceeds)<1e-7);});
  test("no signals means no trades",()=>assert.equal(run(snapshot,{...cross,events:[]}).closedTrades.length,0));
  test("forming last bar cannot fill pending signal",()=>{const s={...snapshot,rows:[...rows.slice(0,-2),{...rows.at(-2),confirm:"0"}]};const r=run(s);assert.equal(r.ok,true);assert.equal(r.excludedFormingBars,1);assert.equal(r.openPosition,null);assert.equal(r.pendingSignal.direction,"UP");});
  test("future series anomaly denied",()=>{const s={...snapshot,rows:[...rows.slice(0,-1),{...rows.at(-1),t:now+ms}]};assert.equal(run(s).code,"HISTORY_GAP");});
  test("middle unconfirmed denied",()=>assert.equal(run({...snapshot,rows:rows.map((r,i)=>i===11?{...r,confirm:"0"}:r)}).code,"UNCONFIRMED_HISTORY"));
  test("gaps denied",()=>assert.equal(run({...snapshot,rows:rows.map((r,i)=>i===12?{...r,t:r.t+ms}:r)}).code,"HISTORY_GAP"));
  test("different provider and pair denied",()=>{assert.equal(run({...snapshot,source:"CoinGecko"}).code,"CONTEXT_MISMATCH");assert.equal(run({...snapshot,loadedInstrument:"ETH-USDC"}).code,"CONTEXT_MISMATCH");});
  test("broken OHLC denied",()=>assert.equal(run({...snapshot,rows:rows.map((r,i)=>i===8?{...r,o:0}:r)}).code,"OHLC_INVALID"));
  test("mismatched V4 signal denied",()=>assert.equal(run(snapshot,{...cross,events:[{...events[1],price:120}]}).code,"SIGNAL_INVALID"));
  test("invalid costs denied",()=>assert.equal(run(snapshot,cross,{initialCapital:1000,feePercent:-1,slippagePercent:0}).code,"INVALID_SETTINGS"));
  test("future candles cannot affect earlier completed trade",()=>{const s={...snapshot,rows:rows.map((r,i)=>i>16?{...r,o:r.o+100,h:r.h+100,l:r.l+100,c:r.c+100}:r)};const x={...cross,events:events.filter(e=>e.index<=15)};assert.equal(run(s,x).ok,true);assert.ok(Math.abs(run(s,x).closedTrades[0].pnl-run(snapshot,x).closedTrades[0].pnl)<1e-9);});

  test("Buy & Hold uses exactly the EMA warm-up date and final closed candle",()=>{
    const r=run(),c=r.comparison,fee=1.001,slipIn=1.0005,slipOut=.9995,feeOut=.999;
    const start=rows[5].o,end=rows.at(-1).c;
    const final=(1000/(start*slipIn*fee))*end*slipOut*feeOut;
    assert.equal(c.startAt,rows[5].t);assert.equal(c.endAt,rows.at(-1).t);
    assert.ok(Math.abs(c.holdFinal-final)<1e-8);assert.equal(c.orders,0);
    assert.equal(c.read_only,true);assert.equal(c.quote,"USDC");
  });
  test("EMA liquidation comparison includes open position but keeps V5 realized PnL",()=>{
    const r=run(),c=r.comparison;
    assert.equal(c.emaHasOpenPosition,true);
    assert.ok(Math.abs(c.emaFinal-r.openPosition.quantity*rows.at(-1).c*.9995*.999)<1e-8);
    assert.ok(Math.abs(r.closedNetPnL-r.closedTrades.reduce((s,t)=>s+t.pnl,0))<1e-8);
    assert.ok(Math.abs(c.advantage-(c.emaFinal-c.holdFinal))<1e-8);
  });
  test("No EMA signals leaves original capital in cash, compared with buy and hold",()=>{
    const r=run(snapshot,{...cross,events:[]});
    assert.equal(r.ok,true);assert.equal(r.closedNetPnL,0);
    assert.equal(r.comparison.emaFinal,1000);assert.equal(r.comparison.emaHasOpenPosition,false);
    assert.ok(r.comparison.holdFinal>0);
  });
  test("Forming final candle is excluded from both comparison methods",()=>{
    const modified={...snapshot,rows:[...rows.slice(0,-1),{...rows.at(-1),o:99,c:99,h:100,l:98,confirm:"0"}]};
    const r=run(modified),c=r.comparison;
    assert.equal(r.ok,true);assert.equal(r.excludedFormingBars,1);
    assert.equal(c.endAt,rows.at(-2).t);
    assert.equal(c.holdFinal,1000/(rows[5].o*1.0005*1.001)*rows.at(-2).c*.9995*.999);
  });
  test("Flat candles without costs make Buy & Hold exactly neutral",()=>{
    const data=rows.map(r=>({...r,o:10,h:11,l:9,c:10}));
    const s={...snapshot,rows:data};
    const c={...cross,events:[]};
    const result=run(s,c,{initialCapital:1000,feePercent:0,slippagePercent:0});
    assert.equal(result.ok,true);assert.equal(result.comparison.holdFinal,1000);
    assert.equal(result.comparison.emaFinal,1000);
  });
  process.stdout.write(count+"/"+count+" focused tests PASS\n");
})();
