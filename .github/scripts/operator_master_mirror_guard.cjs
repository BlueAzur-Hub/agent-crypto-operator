/* Read-only regression guard for the shared Administrator / Operator contract. */
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"../../");
const admin=fs.readFileSync(path.join(root,"public/agent_crypto_erith_ia/administrator/app.js"),"utf8");
const paper=fs.readFileSync(path.join(root,"public/agent_crypto_erith_ia/trader/trader-paper-lab-view.js"),"utf8");
const trader=fs.readFileSync(path.join(root,"public/agent_crypto_erith_ia/trader/trader-runtime-mirror.js"),"utf8");
const graph=fs.readFileSync(path.join(root,"public/agent_crypto_erith_ia/administrator/js/graph-native-usd.js"),"utf8");
function section(src,start,end){
  const at=src.indexOf(start),after=src.indexOf(end,at+start.length);
  assert.ok(at>=0&&after>at,"Missing section: "+start);
  return src.slice(at,after);
}
const context=section(admin,"function atlasExpectedChartContextKey(","function atlasChartContextMatches(");
assert.match(context,/const quote = atlasChartDisplayCurrency\(\)/);
assert.match(context,/:\$\{days\}:\$\{quote\}/);
assert.match(section(admin,"function atlasComparisonIds(","function atlasComparisonCoins("),/atlasCanonicalPresetSelection/);
assert.match(admin,/function atlasCanonicalPresetSelection\(/);
assert.match(section(admin,"function atlasComparisonResultFingerprint(","function atlasComparisonCurveChange("),/quote\.currency/);
assert.match(section(admin,"function atlasWorkspaceRestoreCachedGraph(","function atlasComparisonEndpointComposition("),/atlasComparisonCertifiedCurrency\(aligned\) !== requestedCurrency/);
assert.match(section(admin,"function atlasBuildAlignedComparisonEntries(","function atlasBuildBestAlignedComparisonEntries("),/atlasScannerWindowEnd/);
assert.match(section(admin,"function atlasDownsampleNativeComparisonRows(","function atlasBuildNativeComparisonTimeline("),/Math\.min\(/);
assert.match(admin,/minCoverageHours: 23\.5/);
assert.match(admin,/CoinGecko USD natif indisponible/);
assert.match(graph,/vs_currency=usd/);
assert.match(paper,/function studyNow\(/);
assert.match(paper,/function watchTick\(/);
assert.match(paper,/function stopWatch\(/);
assert.match(paper,/function automaticTick\(/);
assert.match(paper,/traderYoannOperatorSection/);
assert.match(paper,/malabaryo\/tradus/);
assert.match(paper,/realOrders:false,network:false,storage:false/);
assert.match(trader,/traderTradusReadOnlyScript/);
assert.match(trader,/operator-trader-default-usd/);
console.log("Operator / Master shared mirror guard PASS; Yoann TRADUS and access boundaries retained.");
