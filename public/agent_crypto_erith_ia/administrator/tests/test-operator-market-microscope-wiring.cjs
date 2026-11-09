/* Operator/Yoann integration contract: shared PAPER-only microscope, no copy of private Bridge. */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,".."),files=["market-microscope-candles.js","market-microscope-strategy-options.js","market-microscope-paper-backtest-v5.js","market-microscope-orderbook-paper-v6.js"];
const html=fs.readFileSync(path.join(root,"index.html"),"utf8"),loc=files.map(name=>html.indexOf("./js/"+name));
assert.ok(loc.every(i=>i>0),"All four script imports exist");
assert.deepEqual([...loc].sort((a,b)=>a-b),loc,"Canonical script order V4 -> Options -> V5 -> V6");
for(const name of files){
  assert.equal(html.split("./js/"+name).length,2,"One canonical import "+name);
  assert.ok(fs.existsSync(path.join(root,"js",name)),"Local module exists "+name);
}
const candles=fs.readFileSync(path.join(root,"js",files[0]),"utf8");
assert.match(candles,/paperEmaCrossSnapshot/);
assert.match(candles,/setEmaPeriods/);
assert.match(candles,/setBollingerSettings/);
const v5=fs.readFileSync(path.join(root,"js",files[2]),"utf8");
const v6=fs.readFileSync(path.join(root,"js",files[3]),"utf8");
assert.match(v5,/real_order:false/);
assert.match(v6,/real_order:false/);
assert.match(v6,/ensureTechnicalReading/);
assert.match(v6,/TECH_PANEL_UNAVAILABLE/);
assert.match(v6,/AgentCryptoOkxMicrostructure/);
assert.match(v6,/feePercent/);
const desk=fs.readFileSync(path.join(root,"../trader/trading-desk.html"),"utf8");
assert.match(desk,/administrator\/index\.html\?surface=trader&amp;view=intermediate&amp;profile=yohan/);
const yoann=fs.readFileSync(path.join(root,"yoann.html"),"utf8");
const legacyYohan=fs.readFileSync(path.join(root,"yohan.html"),"utf8");
assert.match(yoann,/yohan-operator-profile\.js/);
assert.match(yoann,/yohan-operator-bridge-client\.js/);
assert.match(legacyYohan,/yoann\.html/);
const trust=fs.readFileSync(path.join(root,"js/aether-trust-r28-dual-role.js"),"utf8");
const bridgeClient=fs.readFileSync(path.join(root,"js/yohan-operator-bridge-client.js"),"utf8");
const traderMirror=fs.readFileSync(path.join(root,"../trader/trader-runtime-mirror.js"),"utf8");
const allowed=(trust.match(/const OPERATOR_CAPABILITIES = new Set\(\[([^\]]+)\]\);/)||[])[1];
assert.ok(allowed,"Explicit Operator capability allowlist required");
for(const capability of ["history.read","scanner.read","atlas.run","aerith.run","chat.run",
  "okx.instruments.read","okx.status.read","okx.account.read","okx.orders.read",
  "okx.fills.read","okx.fees.read","okx.ledger.read","okx.fee_type.read",
  "okx.order_gates.read"]){
  assert.ok(allowed.includes('"' + capability + '"'),"Expected read-only capability: "+capability);
}
for(const forbidden of ["security.read","book_mirror.publish","oracle_evidence.publish","trade.place","withdraw.write"]){
  assert.ok(!allowed.includes('"' + forbidden + '"'),"Forbidden Operator capability: "+forbidden);
}
assert.match(trust,/verified\.role !== role/,"Aether Trust must verify the Bridge role");
assert.match(trust,/readSpotCatalog\(\)/,"Use canonical Aether Trust Spot reader");
assert.match(trust,/payload\.orders_enabled !== false/,"Catalog must refuse executable orders");
assert.match(bridgeClient,/session_owner: "aether-trust"/,"Legacy client must reuse canonical session");
assert.match(bridgeClient,/capabilities\.role !== ROLE/,"Legacy client must verify Operator role");
assert.doesNotMatch(bridgeClient,/request\("\/auth\/(?:login|register)"/,"No parallel login/registration");
assert.match(traderMirror,/adminLink\.href="\.\.\/administrator\/yoann\.html"/,"Trader link uses canonical Yoann page");
assert.match(html,/operator-harmonized|operator-trader-parity/);
console.log("PASS Operator + Yoann Trader one-runtime V4/V5/V6 wiring, profile and Bridge boundaries");
