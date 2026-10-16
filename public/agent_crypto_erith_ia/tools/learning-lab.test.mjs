import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const moduleFile=new URL("../administrator/js/learning-lab.js",import.meta.url);
const htmlFile=new URL("../administrator/index.html",import.meta.url);
const cssFile=new URL("../administrator/css/learning-lab.css",import.meta.url);
const source=fs.readFileSync(moduleFile,"utf8");
const html=fs.readFileSync(htmlFile,"utf8");
const css=fs.readFileSync(cssFile,"utf8");

class Elem {
  constructor(tag,registry){
    this.tagName=tag.toUpperCase();this.children=[];this.parentNode=null;
    this.dataset={};this.style={};this.attributes={};this.listeners={};
    this.className="";this.value="";this._text="";this._id="";this.registry=registry;
    this.classList={toggle:()=>{},add:()=>{},remove:()=>{}};
  }
  get nextSibling(){
    if(!this.parentNode)return null;
    const children=this.parentNode.children;
    return children[children.indexOf(this)+1]||null;
  }
  set id(v){this._id=v;this.registry.set(v,this);}
  get id(){return this._id;}
  set textContent(v){this._text=String(v);this.children=[];}
  get textContent(){return this._text+this.children.map(x=>x.textContent||"").join("");}
  append(...children){for(const x of children){
    if(x.parentNode){const index=x.parentNode.children.indexOf(x);if(index>=0)x.parentNode.children.splice(index,1);}
    x.parentNode=this;this.children.push(x);
  }}
  replaceChildren(...children){this.children.forEach(x=>x.parentNode=null);this.children=[];this._text="";this.append(...children);}
  insertBefore(node,ref){
    const idx=this.children.indexOf(ref);assert.ok(idx>=0);
    if(node.parentNode){const old=node.parentNode.children.indexOf(node);if(old>=0)node.parentNode.children.splice(old,1);}
    this.children.splice(idx,0,node);node.parentNode=this;
  }
  setAttribute(k,v){this.attributes[k]=String(v);}
  addEventListener(name,fn){this.listeners[name]=fn;}
  fire(name,extra={}){this.listeners[name]?.({preventDefault(){},...extra});}
  querySelectorAll(selector){
    const results=[];
    function walk(node){
      for(const child of node.children){
        if(selector==="[data-lab-asset]"&&child.dataset.labAsset)results.push(child);
        walk(child);
      }
    }
    walk(this);return results;
  }
}
function boot(query="?surface=trader"){
  const registry=new Map(),legacy=new Elem("details",registry),parent=new Elem("section",registry);
  const following=new Elem("details",registry);following.id="traderVerifiedHistory";
  legacy.id="traderOkbCaseStudy";parent.append(legacy,following);
  const graphTitle=new Elem("strong",registry);graphTitle.id="atlasChartInsightOverlayTitle";
  const top5Button=new Elem("button",registry);top5Button.id="btnChartTop5";
  top5Button.active=false;top5Button.classList.contains=name=>name==="active"&&top5Button.active;
  const storage=new Map();
  const doc={
    readyState:"complete",
    createElement:tag=>new Elem(tag,registry),
    getElementById:id=>registry.get(id)||null,
    addEventListener(){},
    documentElement:{}
  };
  const sandbox={
    location:{search:query},document:doc,URLSearchParams,Intl,Date,Number,String,JSON,
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,val)=>storage.set(key,val)},
    window:{},MutationObserver:class{observe(){}},console
  };
  vm.runInNewContext(source,sandbox,{timeout:1000});
  return {registry,legacy,following,parent,sandbox,storage,graphTitle,top5Button,
          get:id=>registry.get(id)};
}
test("Trader HTML mounts only the isolated lab, with no new account capability",()=>{
  assert.match(html,/css\/learning-lab\.css/);
  assert.match(html,/js\/learning-lab\.js/);
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(source,/fetch\s*\(|XMLHttpRequest|sendOrder|placeOrder|privateKey|API_SECRET/i);
});
test("Administrator never mounts or displaces the BTC report",()=>{
  const t=boot("?surface=administrator");
  assert.equal(t.sandbox.window.AgentCryptoLearningLab,undefined);
  assert.equal(t.legacy.parentNode,t.parent);
});
test("Trader mounts a single report and changes educational dossier without placing orders",()=>{
  const t=boot();
  const lab=t.get("agentCryptoLearningLab"),api=t.sandbox.window.AgentCryptoLearningLab;
  assert.ok(lab);
  assert.equal(t.legacy.parentNode,t.parent);
  assert.equal(lab.parentNode,t.parent);
  assert.deepEqual(t.parent.children,[t.legacy,lab,t.following]);
  assert.equal(lab.open,false);
  assert.equal(t.legacy.style.display,undefined);
  assert.equal(api.read().asset,"BTC");
  assert.equal(api.read().real_order,false);
  api.select("CT");
  assert.equal(api.read().asset,"CT");
  assert.match(t.get("lab-content").textContent,/CT\/USDT/);
  assert.match(t.get("lab-content").textContent,/CT\/USDC/);
  assert.equal(t.legacy.parentNode,t.parent);
  assert.equal(t.legacy.style.display,undefined);
  api.select("Q");
  assert.equal(api.read().asset,"Q");
  api.select("BTC");
  assert.equal(t.legacy.parentNode,t.parent);
  assert.equal(t.legacy.style.display,undefined);
  assert.deepEqual(t.parent.children,[t.legacy,lab,t.following]);
});
test("legacy BTC content is outside a collapsed laboratory and always survives CT or Q",()=>{
  const t=boot(),lab=t.get("agentCryptoLearningLab"),api=t.sandbox.window.AgentCryptoLearningLab;
  assert.equal(t.parent.children[0],t.legacy);
  assert.equal(t.parent.children[1],lab);
  assert.equal(t.parent.children[2],t.following);
  assert.equal(lab.open,false);
  for(const symbol of ["CT","Q","BTC"]){
    api.select(symbol);
    assert.equal(t.legacy.parentNode,t.parent);
    assert.equal(t.legacy.style.display,undefined);
    assert.deepEqual(t.parent.children,[t.legacy,lab,t.following]);
  }
  assert.doesNotMatch(source,/legacySlot|legacy\.style\.display|legacySlot\.append/);
});
test("Follow mode does not interpret a Top 5 comparison as a single crypto",()=>{
  const t=boot(),lab=t.get("agentCryptoLearningLab");
  lab.open=true;t.graphTitle.textContent="TOP 5 · 24h · BTC/ETH/BNB";
  assert.equal(t.sandbox.window.AgentCryptoLearningLab.read().mode,"follow",
    "New Lab sessions follow the chart by default");
  assert.equal(t.sandbox.window.AgentCryptoLearningLab.read().asset,"BTC");
  t.graphTitle.textContent="CT · Concrete · 7j · prix USD";
  // Retoggle mode twice to exercise the read-only market sync.
  t.get("lab-mode-toggle").fire("click");
  t.get("lab-mode-toggle").fire("click");
  assert.equal(t.sandbox.window.AgentCryptoLearningLab.read().asset,"CT");
});
test("an old BTC headline cannot override CT while Top 5 remains active",()=>{
  const h=boot(),api=h.sandbox.window.AgentCryptoLearningLab;
  api.select("CT");
  h.get("agentCryptoLearningLab").open=true;
  h.graphTitle.textContent="BTC · Bitcoin · 24h prix USD historique conservé";
  h.top5Button.active=true;
  assert.equal(api.read().mode,"follow",
    "The Lab remains in follow mode without an explicit toggle");
  assert.equal(api.read().asset,"CT");
  h.top5Button.active=false;
  h.get("lab-mode-toggle").fire("click");
  h.get("lab-mode-toggle").fire("click");
  assert.equal(api.read().asset,"BTC");
});
test("The journal contains no bundled account balances or private bridge data",()=>{
  assert.doesNotMatch(source,/9[,.]99\s*CT|3[,.]522\s*USDC|0[,.]3525526|CT\-USDC.*9,99/);
  assert.match(source,/real_order:false/);
  assert.match(source,/localStorage\.setItem/);
  assert.match(source,/textContent/);
});

function descendants(node, predicate){
  const found=[];
  const walk=n=>{if(predicate(n))found.push(n);for(const c of n.children)walk(c);};
  walk(node);return found;
}
function activateTab(t,id){
  const tab=descendants(t.get("agentCryptoLearningLab"),n=>n.dataset.labTab===id)[0];
  assert.ok(tab,"Missing laboratory tab "+id);tab.fire("click");
}
test("Empty fees are not silently treated as zero, but explicit zero is permitted",()=>{
  const t=boot();
  activateTab(t,"simulation");
  const pane=t.get("lab-content");
  const inputs=descendants(pane,n=>n.tagName==="INPUT");
  assert.equal(inputs.length,5);
  ["4","0,35","0,38","","0,1"].forEach((v,i)=>{inputs[i].value=v;inputs[i].fire("input");});
  const button=descendants(pane,n=>n.tagName==="BUTTON")[0];
  button.fire("click");
  assert.match(descendants(pane,n=>n.tagName==="OUTPUT")[0].textContent,/incomplète|invalide/);
  inputs[3].value="0";inputs[3].fire("input");button.fire("click");
  assert.match(descendants(pane,n=>n.tagName==="OUTPUT")[0].textContent,/Quantité fictive/);
});
test("Simulation inputs survive tab switches and stay separated by asset",()=>{
  const t=boot(),api=t.sandbox.window.AgentCryptoLearningLab;
  api.select("CT");activateTab(t,"simulation");
  let inputs=descendants(t.get("lab-content"),n=>n.tagName==="INPUT");
  inputs[0].value="12,50";inputs[0].fire("input");
  inputs[3].value="0,2";inputs[3].fire("input");
  activateTab(t,"coffre");activateTab(t,"simulation");
  inputs=descendants(t.get("lab-content"),n=>n.tagName==="INPUT");
  assert.equal(inputs[0].value,"12,50");
  assert.equal(inputs[3].value,"0,2");
  api.select("Q");activateTab(t,"simulation");
  inputs=descendants(t.get("lab-content"),n=>n.tagName==="INPUT");
  assert.equal(inputs[0].value,"");
  api.select("CT");activateTab(t,"simulation");
  inputs=descendants(t.get("lab-content"),n=>n.tagName==="INPUT");
  assert.equal(inputs[0].value,"12,50");
});

test("USD price card does not forge a CoinGecko origin or zero variation",()=>{
  const graph=fs.readFileSync(new URL("../administrator/js/graph-native-usd-406520.js",import.meta.url),"utf8");
  assert.doesNotMatch(graph,/replace\("PRIX LIVE BINANCE","PRIX SNAPSHOT COINGECKO"\)/);
  assert.match(graph,/function usdTooltipSource\(/);
  assert.match(graph,/coingecko-stale/);
  assert.doesNotMatch(graph,/"PRIX INDICATIF · SOURCE NON CONFIRMÉE"/);
  assert.match(graph,/c\.change24h==null/);
});
