'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'market-fiche-native.js'),'utf8');
function render(coin){
 const layer={hidden:true,innerHTML:'',dataset:{},style:{},
   getBoundingClientRect:()=>({width:360,height:450}),
   setAttribute:()=>{}};
 const doc={readyState:'loading',addEventListener:()=>{},
   getElementById:id=>id==='atlasHelpLayer'?layer:null};
 const ctx={document:doc,localStorage:{getItem:()=>null},
   innerWidth:1300,innerHeight:900,
   clearTimeout,setTimeout,Intl,Number,String,Object,Math};
 ctx.globalThis=ctx;
 vm.createContext(ctx);vm.runInContext(source,ctx,{timeout:1000});
 const row={dataset:{marketHelpId:coin.id},getBoundingClientRect:()=>({left:420,right:600,top:40})};
 assert.equal(ctx.AgentCryptoTraderNativeFiche.showAsset(row,coin),true);
 return layer.innerHTML;
}
test('external unknown zero market cap and unverified weekly/monthly zero are not asserted',()=>{
 const c={id:'concrete',name:'Concrete',symbol:'CT',priceUsd:0.274241,
  radarSource:'OKX CT/USDT',marketCapUsd:0,volume24hUsd:836450,
  change24h:-19.96,change7d:0,change30d:0};
 const h=render(c);
 assert.match(h,/<small>Capitalisation<\/small><strong>—<\/strong>/);
 assert.match(h,/<small>7 j marché<\/small><strong class="neutral">—<\/strong>/);
 assert.match(h,/<small>30 j marché<\/small><strong class="neutral">—<\/strong>/);
 assert.match(h,/-19\.96 %/);
 assert.match(h,/836/);
});
test('genuine zero percent remains valid for canonical native Market',()=>{
 const c={id:'btc',name:'Bitcoin',symbol:'BTC',priceUsd:80000,
  marketCapUsd:1600000000000,volume24hUsd:35000000000,
  change24h:0,change7d:0,change30d:0};
 const h=render(c);
 assert.match(h,/<small>7 j marché<\/small><strong class="neutral">0\.00 %<\/strong>/);
 assert.match(h,/<small>30 j marché<\/small><strong class="neutral">0\.00 %<\/strong>/);
 assert.doesNotMatch(h,/<small>Capitalisation<\/small><strong>—<\/strong>/);
});
