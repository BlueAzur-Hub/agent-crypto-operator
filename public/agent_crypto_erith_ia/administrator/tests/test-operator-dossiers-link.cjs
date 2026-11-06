/* Regression for public MASTER documentary navigation in Yoann Operator & Trader. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"../js/new-listings-native-category.js"),"utf8");
const marker='    // MASTER owns the public documentary library; Operator keeps only the link.';
const start=source.indexOf(marker);
const end=source.indexOf('    const view=document.createElement("section");',start);
assert.ok(start>=0&&end>start,"Native Radar link mount block exists");
const mountSource=source.slice(start,end);
const expected="https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/laboratoire/crypto-knowledge.html#veille-fil-crypto";
function fixture(existing=false){
  const inserted=[],registry=new Map();
  if(existing) registry.set("atlasCryptoFollowedDossiersLink",{
    id:"atlasCryptoFollowedDossiersLink",href:"https://example.com/old",target:"_self",rel:"",attrs:{},
    setAttribute(name,value){this.attrs[name]=value;}
  });
  const document={
    getElementById:id=>registry.get(id)||null,
    createElement:tag=>({tag,attrs:{},setAttribute(name,value){this.attrs[name]=value;}})
  };
  const tab={
    insertAdjacentElement(position,element){
      assert.equal(position,"afterend");
      inserted.push(element);
      registry.set(element.id,element);
    }
  };
  vm.runInNewContext(mountSource,{document,tab});
  const link=registry.get("atlasCryptoFollowedDossiersLink");
  assert.ok(link,"Dossiers suivis anchor exists");
  assert.equal(link.href,expected,"Always route to the public MASTER, never a nonexistent Operator path");
  assert.equal(link.target,"_blank","Open a separate browser tab");
  assert.equal(link.rel,"noopener noreferrer","Prevent opener control and referrer leakage");
  assert.ok(link.attrs["aria-label"].includes("nouvel onglet"));
  return {link,inserted};
}
const first=fixture(false);
assert.equal(first.inserted.length,1,"One anchor inserted when absent");
assert.equal(first.link.textContent,"Dossiers suivis ↗");
const reused=fixture(true);
assert.equal(reused.inserted.length,0,"No duplicate when anchor is reused");
assert.equal(new URL(reused.link.href).hash,"#veille-fil-crypto","Open followed dossier section");
assert.ok(!source.includes('dossierLink.href=new URL("../laboratoire/crypto-knowledge.html'),"Broken local route removed");
console.log("PASS public MASTER dossiers link, new tab, rel security, created/reused anchor");
