import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root="public/agent_crypto_erith_ia/";
const js=fs.readFileSync(root+"administrator/js/top250-history-catalog.js","utf8");
const dir=root+"data/historical_archive_prototype/";
const fixtures=new Map([
 ["top250_multisource_coverage/index.json",JSON.parse(fs.readFileSync(dir+"top250_multisource_coverage/index.json","utf8"))],
 ["top250_history_catalog/index.json",JSON.parse(fs.readFileSync(dir+"top250_history_catalog/index.json","utf8"))],
 ["bitget_verified_views/index.json",JSON.parse(fs.readFileSync(dir+"bitget_verified_views/index.json","utf8"))],
 ["year_depth_index.json",JSON.parse(fs.readFileSync(dir+"year_depth_index.json","utf8"))],
 ["wbt_private_status.json",JSON.parse(fs.readFileSync(dir+"wbt_private_status.json","utf8"))]
]);
// Use real, independently verified source indexes. Their snapshots do not
// have to share the same collection time or count. No mock candles added.

const base="https://blueazur-hub.github.io",path="/erith-ia-memory/public/agent_crypto_erith_ia/data/historical_archive_prototype/";
function harness(mutate=()=>{}){
 const nodes=new Map(),requests=[],events=[];
 function element(id){
  if(nodes.has(id))return nodes.get(id);
  const listener={};
  const el={id,tagName:id,textContent:"",value:id==="top250-limit"?"250":"",checked:false,
   children:[],append(...items){this.children.push(...items)},
   replaceChildren(...items){this.children=[...items]},
   addEventListener(name,fn){listener[name]=fn},
   setAttribute(){},
   dispatch(name){return listener[name]?.()},
   get innerText(){return this.textContent}};
  nodes.set(id,el);return el;
 }
 const document={
  currentScript:{src:base+"/erith-ia-memory/public/agent_crypto_erith_ia/administrator/js/top250-history-catalog.js"},
  getElementById:element,
  createDocumentFragment:()=>element("fragment"+nodes.size),
  createElement:tag=>element("created-"+tag+"-"+nodes.size),
  dispatchEvent:event=>{events.push(event);return true}
 };
 const fetchMock=async uri=>{
  const url=new URL(uri);
  assert.equal(url.origin,base);
  assert.ok(url.pathname.startsWith(path));
  const id=url.pathname.slice(path.length);
  assert.ok(fixtures.has(id),"Unknown catalog "+id);
  requests.push(id);
  const data=structuredClone(fixtures.get(id));mutate(id,data);
  return new Response(JSON.stringify(data),{status:200});
 };
 const window={};
 vm.runInNewContext(js,{window,document,fetch:fetchMock,
   location:{origin:base},URL,Response,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}}},
   {timeout:5000});
 return {window,nodes,element,requests,events};
}
async function ready(h){
 for(let i=0;i<80;i++){
  const status=h.element("top250-status").textContent;
  if(status.includes("Sources indépendantes validées")||status.includes("Vérification refusée"))
   return;
  await new Promise(resolve=>setImmediate(resolve));
 }
 throw Error("Timed out while loading Top250");
}
test("actual asynchronous source snapshots render Binance and Bitget without double counting",async()=>{
 const h=harness();await ready(h);
 const source=fixtures.get("top250_history_catalog/index.json");
 const alt=fixtures.get("bitget_verified_views/index.json");
 const result=h.window.SevenTop250Catalog.read();
 assert.ok(result,"Expected validated exact-ID source catalogs: "+h.element("top250-status").textContent);
 assert.equal(result.assets.length,250);
 assert.equal(result.archived_assets,source.archived_assets);
 assert.equal(result.rank_snapshot,source.rank_snapshot);
 const byId=new Map(source.assets.map(a=>[a.id,a]));
 const expected=source.archived_assets+alt.assets.filter(a=>
   byId.has(a.id)&&!byId.get(a.id).months.length).length;
 assert.ok(h.element("top250-title").textContent.includes(expected+"/250"));
 assert.match(h.element("top250-title").textContent,/archives publiques/);
 assert.match(h.element("top250-counts").textContent,/Top 250/);
 assert.ok(h.element("top250-summary").children.length>0);
 assert.ok(h.element("top250-rows").children.length>0);
 assert.match(h.element("top250-status").textContent,/Sources indépendantes validées/);
});
test("old federated monthly counter does not hide newer genuine Binance sources",async()=>{
 const h=harness((file,data)=>{
  if(file==="top250_multisource_coverage/index.json"){
   const btc=data.assets.find(a=>a.id==="bitcoin");
   btc.months-=1;btc.native_1m_count-=43200;
   data.native_1m_candles-=43200;
  }
 });
 await ready(h);
 assert.ok(h.window.SevenTop250Catalog.read());
 assert.match(h.element("top250-status").textContent,/instantanés historiques distincts/);
});
test("tampering a genuine Binance source count blocks the view",async()=>{
 const h=harness((file,data)=>{
  if(file==="top250_history_catalog/index.json")
   data.assets[0].candles+=1;
 });
 await ready(h);
 assert.equal(h.window.SevenTop250Catalog.read(),null);
 assert.match(h.element("top250-status").textContent,/Sources mensuelles Binance incohérentes/);
});
test("forged Bitget native minute count cannot enter the catalog",async()=>{
 const h=harness((file,data)=>{
  if(file==="bitget_verified_views/index.json")data.assets[0].total_verified_1m_count+=1440;
 });
 await ready(h);
 assert.equal(h.window.SevenTop250Catalog.read(),null);
 assert.match(h.element("top250-status").textContent,/Source Bitget native minute count invalid/);
});
test("a changed frozen Top250 exact coin identity is rejected",async()=>{
 const h=harness((file,data)=>{
  if(file==="top250_history_catalog/index.json")data.assets[0].id="fake-bitcoin";
 });
 await ready(h);
 assert.equal(h.window.SevenTop250Catalog.read(),null);
 assert.match(h.element("top250-status").textContent,/Identité ou comptage Binance incorrect/);
});
test("historic rank drift cannot transplant candles across owners",async()=>{
 const h=harness();await ready(h);
 const b=fixtures.get("top250_history_catalog/index.json");
 const f=fixtures.get("top250_multisource_coverage/index.json");
 assert.notEqual(f.assets.find(a=>a.id==="cosmos").rank,
   b.assets.find(a=>a.id==="cosmos").rank);
 assert.equal(h.window.SevenTop250Catalog.read().assets[0].id,"bitcoin");
 assert.equal(b.assets.find(a=>a.id==="bitcoin").months[0].pair,"BTCUSDT");
 assert.match(h.element("top250-status").textContent,/Sources indépendantes validées/);
});
test("Bitget source with falsified owner ticker is refused",async()=>{
 const h=harness((file,data)=>{
  if(file==="bitget_verified_views/index.json")
   data.assets.find(a=>a.id==="cosmos").symbol="OTHER";
 });await ready(h);
 assert.equal(h.window.SevenTop250Catalog.read(),null);
 assert.match(h.element("top250-status").textContent,/Source Bitget invalide/);
});
test("the WBT private proof is shown without publishing source prices",async()=>{
 const h=harness();await ready(h);
 for(let i=0;i<30;i++){
  if(h.element("wbt-private-status").textContent.includes("Métadonnées publiques"))break;
  await new Promise(resolve=>setImmediate(resolve));
 }
 assert.match(h.element("wbt-private-status").textContent,/aucun prix publié/);
 assert.equal(fixtures.get("wbt_private_status.json").candle_rows,2172121);
});
test("a corrupted frozen federation header is still refused",async()=>{
 const h=harness((file,data)=>{
  if(file==="top250_multisource_coverage/index.json")
   data.binance_archived_assets+=1;
 });
 await ready(h);
 assert.equal(h.window.SevenTop250Catalog.read(),null);
 assert.match(h.element("top250-status").textContent,/Index fédéré incorrect/);
});
test("the canonical vault mounts both verified readers without editing Trader",()=>{
 const html=fs.readFileSync(root+"administrator/historical-vault.html","utf8");
 assert.match(html,/id="top250-rows"/);
 assert.match(html,/id="shared-month-reader"/);
 assert.match(html,/id="vault-yearly-inline"/);
 assert.match(html,/src="\.\/js\/historical-yearly-browser\.js"/);
 assert.match(html,/src="\.\/js\/shared-historical-view\.js"/);
 assert.match(html,/id="vault-year-rows"/);
});

test("an older year-depth index does not block the current 1m sources",async()=>{
 const h=harness((file,data)=>{
  if(file==="year_depth_index.json"){
   data.archive_assets=104;data.source_catalog_minutes=83676960;
  }
 });
 await ready(h);
 assert.ok(h.window.SevenTop250Catalog.read());
 assert.match(h.element("top250-status").textContent,/Sources indépendantes validées/);
});
test("a future or impossible year-depth source is still rejected",async()=>{
 const h=harness((file,data)=>{
  if(file==="year_depth_index.json")data.source_catalog_minutes=9999999999999;
 });
 await ready(h);
 assert.equal(h.window.SevenTop250Catalog.read(),null);
 assert.match(h.element("top250-status").textContent,/Vérification refusée/);
});
