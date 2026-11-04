"use strict";
// Read-only Master -> Operator migration contract. No network, account, or orders.
const assert=require("node:assert/strict");
const {test}=require("node:test");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const dir=__dirname;
const read=name=>fs.readFileSync(path.join(dir,name),"utf8");
const gitBlob=text=>crypto.createHash("sha1").update("blob "+Buffer.byteLength(text)+"\\0").update(text).digest("hex");

const canonical=Object.freeze({
 "strategy-comparator.js":"b38bb9bb611bf40918b372708737c109aa19dda5",
 "spot-paper-order-engine.js":"0d35f806d6ff0392eb978e27dcf4e1fb4dea0d60",
 "trader-paper-decision-core.js":"8154cb8f26a37aae9252e7766a1cf11462e4822b",
 "trader-paper-decision-view.js":"be40e1889f80f4735ed4a6c5e10e4ec77a2e6d57",
 "trader-order-entry-view.js":"2a117277200b6f2240c052cc5e3182e3a8776264",
 "trader-order-entry.css":"05f4c084f21005c77cc2decc45b5291bb24ad0d3",
 "trader-paper-lab-core.js":"34ee6cf2f48696cee4d2bc53acef31c8d2108fc7"
});

test("ported public modules are EXACT canonical MASTER source blobs",()=>{
 for(const [name,sha] of Object.entries(canonical)){
  const file=read(name);
  assert.equal(gitBlob(file),sha,name);
  if(name.endsWith(".js"))new vm.Script(file,{filename:name});
 }
});

test("public PAPER APIs remain non-executing and multi-asset",()=>{
 const orders=require("./spot-paper-order-engine.js");
 const decision=require("./trader-paper-decision-core.js");
 const core=require("./trader-paper-lab-core.js");
 const compare=require("./strategy-comparator.js");
 for(const item of [orders,decision,core,compare])assert.equal(item.realOrders,false);
 assert.equal(orders.tradeEndpoint,null);
 assert.equal(orders.network,false);
 assert.equal(orders.bridge,false);
 assert.equal(decision.network,false);
 assert.equal(core.readOnly,true);
 assert.equal(core.fetch,false);
 assert.equal(typeof core.historicalStudy,"function");
 assert.equal(typeof compare.qualifyReport,"function");
 assert.equal(compare.privateAccount,false);
});

test("one shared Operator graph + preserved Yoann TRADUS + PAPER chain",()=>{
 const mirror=read("trader-runtime-mirror.js");
 const desk=read("trading-desk.html");
 const admin=fs.readFileSync(path.join(root,"administrator/index.html"),"utf8");
 assert.match(desk,/\\.\\.\\/administrator\\/index\\.html\\?surface=trader/);
 assert.match(admin,/\\.\\.\\/web\\/vault-data-router\\.js/);
 assert.match(mirror,/mountPublicPaper\\(\\)/);
 for(const file of ["strategy-comparator.js","spot-paper-order-engine.js",
  "trader-paper-decision-core.js","trader-order-entry-view.js","trader-paper-decision-view.js",
  "trader-order-entry.css","trader-tradus-readonly.js"]){
  assert.ok(mirror.includes(file),file);
 }
 assert.ok(mirror.indexOf('mountPublicPaper();')<mirror.indexOf('tradus.id="traderTradusReadOnlyScript"'));
 assert.match(mirror,/duplicated_chart_owner:false/);
 assert.match(mirror,/real_orders:false/);
 assert.match(mirror,/if\\(!doc\\.getElementById\\("traderYoannOperatorSection"\\)\\)/);
});

test("public MASTER data paths resolve, while private, external and writes do not",async()=>{
 const source=fs.readFileSync(path.join(root,"web/vault-data-router.js"),"utf8");
 const base="https://blueazur-hub.github.io/agent-crypto-operator/public/agent_crypto_erith_ia/administrator/index.html";
 const calls=[];
 const context={
  URL,Request,Headers,
  document:{baseURI:base},
  location:{origin:"https://blueazur-hub.github.io"},
  fetch:(url,options)=>{calls.push({url:String(url),options});return Promise.resolve({ok:true});}
 };
 context.globalThis=context;
 vm.runInNewContext(source,context);
 const router=context.AgentCryptoVaultDataRouter;
 assert.equal(router.read_only,true);
 assert.equal(router.private_access,false);
 for(const p of [
  "../data/trader_flux/radar20_portfolio/summary.json",
  "../data/trader_flux/seven_capital_spot/paper_evaluation.json",
  "../data/crypto/radar-opportunities/signal-evidence.json",
  "../data/crypto/okx-hourly/latest.json",
  "../data/historical_archive_prototype/verified_periods/index.json"
 ]){
  const actual=router.route(p,"GET");
  assert.ok(actual&&actual.startsWith("https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/data/"),p);
 }
 assert.equal(router.route("../private/secrets.json"),null);
 assert.equal(router.route("../data/crypto/okx-hourly/latest.json","POST"),null);
 assert.equal(router.route("https://evil.example/data/crypto/file.json"),null);
 assert.equal(router.route("../data/%2Fprivate/data.json"),null);
 await context.fetch("../data/crypto/radar-opportunities/signal-evidence.json");
 assert.equal(calls[0].options.credentials,"omit");
 assert.equal(calls[0].options.mode,"cors");
 assert.equal(calls[0].options.method,"GET");
 assert.equal(router.stats().routed,1);
});
