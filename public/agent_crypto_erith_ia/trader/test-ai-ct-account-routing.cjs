'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const nodePath=require('node:path');
const root=__dirname;
const account=fs.readFileSync(nodePath.join(root,'trader-okx-account.js'),'utf8');
const ai=fs.readFileSync(nodePath.join(root,'ai-ct-panel.js'),'utf8');
const route=account.split('p.querySelector("[data-okx-analyze-ct]")?.addEventListener("click",async()=>{')[1]
  ?.split('p.querySelector("[data-okx-auth]")?.addEventListener')[0]||'';
const inline=ai.split('async function readForAccount(target){')[1]
  ?.split('const lesson=panel.querySelector')[0]||'';
test('analyze CT from OKX account stays locally without graph scroll or state switch',()=>{
 assert.ok(route.length>100,'CTA account route exists');
 assert.match(route,/target.hidden=false/);
 assert.match(route,/await ai.readForAccount\(target\)/);
 assert.doesNotMatch(route,/scrollIntoView|scrollTo|detailPanelToggle|ai\.open|window\.location|atlasSelectMarketCoin|aiCtRead.*click\(/);
});
test('existing CT gateway is called once for inline account brief, no technical panel repaint',()=>{
 assert.ok(inline.length>100);
 assert.match(inline,/const doc=await loadCtEvidence\(\)/);
 assert.match(inline,/model\.explain\(doc,chart\)/);
 assert.match(inline,/showEvidence\(target,doc\)/);
 assert.match(inline,/showFullReport\(target,report\)/);
 assert.doesNotMatch(inline,/paint\(doc\)|scrollIntoView|detailPanelToggle|\.open\s*=\s*true/);
 assert.equal((ai.match(/BACKEND\+'\/market-book\?provider=okx&instrument=CT-USDC&limit=100'/g)||[]).length,1);
});
test('inline private CT text is hidden on owner logout and denied on lost session',()=>{
 assert.match(account,/function logoutBridge\(\)\{[\s\S]*?inline\.hidden=true;inline\.replaceChildren\(\)/);
 assert.match(account,/error\?\.status===401[\s\S]*?inline\.hidden=true;inline\.replaceChildren\(\)/);
 assert.match(ai,/sessionStorage\.getItem\(TOKEN_KEY\)!==session/);
 assert.match(ai,/!target\.isConnected\|\|target\.hidden/);
});
test('CT inline view exists in the current OKX panel, before position table',()=>{
 assert.match(account,/data-okx-ctreading hidden role="status" aria-live="polite"/);
 assert.match(account,/#traderOkxAccountPanel \.okx-ct-reading\[hidden\]\{display:none!important\}/);
});

test('under-minimum CT may open official OKX Convert manually without sending any order',()=>{
 const links=account.match(/<a class="okx-convert-link"[^>]+>Convertir mes CT sur OKX ↗<\/a>/g)||[];
 assert.equal(links.length,1);
 const link=links[0];
 assert.match(link,/href="https:\/\/www\.okx\.com\/fr-fr\/trade-convert"/);
 assert.match(link,/target="_blank"/);
 assert.match(link,/rel="noopener noreferrer"/);
 assert.doesNotMatch(link,/\b(onclick|authorization|token|amount|sz|qty|instId)=/i);
});
test('Convert warns about manual confirmation and potential spread, not zero guaranteed costs',()=>{
 assert.match(account,/À sélectionner manuellement sur OKX \(CT → USDC\)/);
 assert.match(account,/Vérifie le devis, son délai et le spread possible/);
 assert.doesNotMatch(account,/function\s+convertCtOrder\s*\(/);
});
