import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {webcrypto} from "node:crypto";

const root=path.resolve("public/agent_crypto_erith_ia/data/historical_archive_prototype/ohlcv_spot_pilot");
const js=fs.readFileSync("public/agent_crypto_erith_ia/administrator/js/historical-archive-adapter.js","utf8");
const origin="https://blueazur-hub.github.io";
const remote="/erith-ia-memory/public/agent_crypto_erith_ia/data/historical_archive_prototype/ohlcv_spot_pilot/";
function harness(mutate=()=>{}) {
  let reads=0;
  const window={};
  async function mockFetch(uri) {
    const u=new URL(uri);
    assert.equal(u.origin,origin);
    assert.ok(u.pathname.startsWith(remote));
    const relative=decodeURIComponent(u.pathname.slice(remote.length));
    assert.ok(!relative.includes(".."));
    const actual=fs.readFileSync(path.join(root,relative));
    const result=mutate(relative,actual)??actual;reads++;
    return new Response(result,{status:200,headers:{"content-length":String(result.length)}});
  }
  vm.runInNewContext(js,{window,
    document:{currentScript:{src:origin+"/erith-ia-memory/public/agent_crypto_erith_ia/administrator/js/historical-archive-adapter.js"}},
    location:{origin},URL,fetch:mockFetch,crypto:webcrypto,Blob,Response,DecompressionStream,TextEncoder,TextDecoder,Uint8Array},
    {timeout:3000});
  return {window,reads:()=>reads};
}
test("no automatic reads or writes",()=>{
  const h=harness();
  assert.equal(h.reads(),0);
  assert.equal(typeof h.window.SevenHistoricalArchive.readSeries,"function");
});
test("real data: 21 continuous series, explicit USDT metadata and safe in-memory reuse",async()=>{
  const h=harness();
  const btc=await h.window.SevenHistoricalArchive.readSeries({assetId:"bitcoin",period:"24h"});
  const eth=await h.window.SevenHistoricalArchive.readSeries({assetId:"ethereum",period:"7d"});
  const zec=await h.window.SevenHistoricalArchive.readSeries({assetId:"zcash",period:"30d"});
  assert.equal(btc.metadata.pair,"BTCUSDT");
  assert.equal(btc.metadata.quote,"USDT");
  assert.equal(btc.metadata.targetGraphConnected,false);
  assert.equal(btc.metadata.isLive,false);
  assert.equal(btc.candles.length,294);
  assert.equal(eth.candles.length,169);
  assert.equal(zec.candles.length,180);
  const m=await h.window.SevenHistoricalArchive.listCoverage();
  assert.equal(m.candlesTotal,4501);
  assert.equal(m.coverage.length,21);
  const before=h.reads();
  btc.candles[0][1]=-1;
  const replay=await h.window.SevenHistoricalArchive.readSeries({assetId:"bitcoin",period:"24h"});
  assert.ok(replay.candles[0][1]>0);
  assert.equal(h.reads(),before);
});
test("unsupported or unqualified instrument returns no fabricated series",async()=>{
 const h=harness();
 await assert.rejects(h.window.SevenHistoricalArchive.readSeries({assetId:"tether",period:"24h"}),/non qualifié/);
});
test("a tampered delta fails closed at SHA-256 verification",async()=>{
 const h=harness((name,content)=>{
  if(name.startsWith("deltas/")){const b=Buffer.from(content);b[15]^=1;return b}
 });
 await assert.rejects(h.window.SevenHistoricalArchive.readSeries({assetId:"bitcoin",period:"24h"}),/SHA-256/);
});
test("an index reporting a wrong historical total is refused",async()=>{
 const h=harness((name,content)=>{
  if(name==="index.json"){const j=JSON.parse(content);j.candles_total+=1;return Buffer.from(JSON.stringify(j))}
 });
 await assert.rejects(h.window.SevenHistoricalArchive.listCoverage(),/Total d'archive incorrect/);
});
