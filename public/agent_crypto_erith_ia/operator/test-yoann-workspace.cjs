"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {calculatePaper,validSnapshot}=require("./yoann-workspace.js");
const here=__dirname,snapshot=JSON.parse(fs.readFileSync(path.join(here,"research-snapshot.json"),"utf8"));
test("provenance and isolation guards",()=>{
 assert(validSnapshot(snapshot));
 assert.equal(snapshot.seven_capital.orders,0);
 assert(snapshot.latest_delivered_prs.includes(606));
 assert(!validSnapshot({...snapshot,isolation:{...snapshot.isolation,no_execution:false}}));
 assert(!validSnapshot({...snapshot,seven_capital:{...snapshot.seven_capital,orders:1}}));
});
test("ledger is fee-aware independent PAPER math",()=>{
 const r=calculatePaper(10,1,.1,.3);
 assert(r.pnl>0&&r.finalValue<10.1);
 assert(r.breakEvenMovePct>.49&&r.breakEvenMovePct<.51);
 assert(calculatePaper(10,0,.1,.3).pnl<0);
 assert.throws(()=>calculatePaper(10,1,-.1,.3),RangeError);
 assert.throws(()=>calculatePaper(NaN,1,.1,.3),RangeError);
 assert.throws(()=>calculatePaper(10,1,0,100),RangeError);
});
test("HTML is standalone operator with no privileged capability",()=>{
 const html=fs.readFileSync(path.join(here,"yoann-workspace.html"),"utf8");
 const js=fs.readFileSync(path.join(here,"yoann-workspace.js"),"utf8");
 const compose=fs.readFileSync(path.join(here,"docker/compose.yaml"),"utf8");
 assert(html.includes("Operator Yoann"));
 assert(html.includes("Sandbox Microtransactions"));
 assert(html.includes("connect-src 'self'"));
 assert(!/api\/v5\/trade|api\.okx\.com|localStorage\.setItem|document\.cookie|eval\(/.test(js));
 assert(compose.includes("127.0.0.1:8097:8080"));
 assert(compose.includes("read_only: true"));
 assert(compose.includes("no-new-privileges:true"));
 assert(!compose.includes("docker.sock"));
});
