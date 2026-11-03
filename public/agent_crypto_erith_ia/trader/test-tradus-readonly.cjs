const assert=require("node:assert/strict");
require("./trader-tradus-readonly.js");
const api=globalThis.AgentCryptoTraderTradusView;
assert(api,"Adapter exports dedicated read-only API");
assert.equal(api.self_test().pass,true,JSON.stringify(api.self_test().checks));
for(const key of ["real_orders","network_owner","recurring_timer","writes_storage","changes_roles"])assert.equal(api[key],false,key);
assert.equal(api.allowedLocation({search:"?surface=trader&profile=yohan"}),true);
assert.equal(api.allowedLocation({search:"?surface=trader&profile=owner"}),false);
assert.equal(api.allowedLocation({search:"?surface=administrator&profile=yohan"}),false);
const now=Date.parse("2026-11-03T20:00:00Z");
const shadow={ok:true,at:"2026-11-03T19:59:59Z",source:"BINANCE_PUBLIC_DEPTH",
  tick:{symbol:"BTCEUR"},signal:{action:"SELL",imbalance:-.3,spread_ratio:.001,risk_approved:true},
  comparison:{state:"OPPOSITION"}};
const observed=api.model({shadow,paper:{position:{side:"SHORT"},realized_net:0},observability:{archive:{trades:0}}},now);
assert.equal(observed.action,"SELL");
assert.equal(observed.signal_qualified_is_order_approval,false);
assert.equal(observed.paper_trades,0);
const stale=api.model({shadow:{...shadow,at:"2026-11-03T19:59:30Z"}},now);
assert.equal(stale.action,"N/D");assert.equal(stale.comparison,"NON COMPARABLE");assert.equal(stale.book_fresh,false);
const unknown=api.model({},now);
assert.equal(unknown.action,"N/D");assert.equal(unknown.paper_trades,null);assert.equal(unknown.source,"Source non confirmée");
const noBook=api.model({shadow:{...shadow,ok:false}},now);
assert.equal(noBook.action,"N/D");assert.equal(noBook.status,"CARNET INDISPONIBLE");
const wrongPair=api.model({shadow:{...shadow,tick:{symbol:"BTCUSDC"}}},now);
assert.equal(wrongPair.action,"N/D");
console.log("TRADUS_TRADER_READONLY_CONTRACT_PASS");
