import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const root="public/agent_crypto_erith_ia/";
const script=fs.readFileSync(root+"trader/ai-source-inventory.js","utf8");
const native=JSON.parse(fs.readFileSync(root+"data/historical_archive_prototype/top250_multisource_coverage/index.json","utf8"));
const day=JSON.parse(fs.readFileSync(root+"data/historical_archive_prototype/top250_multiresolution_sources/index.json","utf8"));
function api(){const ctx=vm.createContext({});vm.runInContext(script,ctx);return ctx.AgentCryptoHistoryInventory;}
test("actual 250 ranked asset identities and owners stay distinct",()=>{
 const x=api().assemble(native,day);assert.equal(x.totals.ranked,250);
 assert.equal(x.assets.length,250);
 assert.equal(x.totals.minute+x.totals.daily-x.totals.both,x.totals.either);
 assert.equal(x.totals.missing,250-x.totals.either);
 assert.equal(x.totals.daily+x.totals.outOfUniverse,x.totals.dailyCatalog);
 assert.equal(new Set(x.assets.map(a=>a.id)).size,250);
 assert.equal(x.verifiedCompleteness,false);
});
test("Q is native Bitget daily, not a fabricated R9 minute archive",()=>{
 const q=api().assemble(native,day).assets.find(a=>a.id==="quack-ai");
 assert.equal(q.symbol,"Q");
 assert.equal(q.minute,null);
 assert.equal(q.daily[0].points,390);
 assert.equal(q.daily[0].gaps,4);
 assert.equal(q.daily[0].quote,"USDT");
});
test("identities, ranks, quote and gaps must be authenticated",()=>{
 const m=structuredClone(native),d=structuredClone(day);
 d.assets[0].id="wrong-id";const drift=api().assemble(m,d);
 assert.ok(drift.outOfUniverse.some(x=>x.id==="wrong-id"));
 const d2=structuredClone(day);d2.assets[0].gaps_within_observed_span=-1;
 assert.throws(()=>api().assemble(m,d2),/lacunes journalières/);
 const m2=structuredClone(native);m2.assets[1].rank=m2.assets[0].rank;
 assert.throws(()=>api().assemble(m2,day),/rangs uniques/);
});
test("inventory has no exchange orders, account access, or local writes",()=>{
 assert.doesNotMatch(script,/(placeOrder|createOrder|localStorage|indexedDB|fetch\s*\(.+POST)/i);
 assert.match(script,/credentials:"omit"/);
});

test("Historical catalog keeps obsolete Top250 memberships explicit",()=>{
 const x=api().assemble(native,day);
 assert.equal(x.totals.outOfUniverse,2);
 assert.ok(x.outOfUniverse.some(a=>a.id==="geodnet"));
 assert.ok(x.outOfUniverse.some(a=>a.id==="cash-4"));
});
