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
assert.match(yohan,/yohan-operator-bridge-client\.js/);
assert.match(legacyYohan,/yoann\.html/);
assert.match(html,/operator-harmonized|operator-trader-parity/);
console.log("PASS Operator + Yoann Trader one-runtime V4/V5/V6 wiring, profile and Bridge boundaries");
