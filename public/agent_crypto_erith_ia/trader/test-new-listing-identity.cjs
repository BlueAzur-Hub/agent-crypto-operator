'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const admin=path.resolve(__dirname,'../administrator');
const registry=JSON.parse(fs.readFileSync(path.join(admin,'data/new-listings-identities.json'),'utf8'));
test('Operator static listing registry preserves verified public identity without account capabilities',()=>{
 assert.equal(registry.schema,'agent_crypto_new_listings_identity_registry_v1');
 const ids=registry.identities;
 for(const id of ['concrete','magic-hash','marscat-token','pons','canopy','neosoul','axis-robotics'])
   assert.ok(ids[id]&&ids[id].verified===true,'missing public identity '+id);
 const axis=ids['axis-robotics'];
 assert.equal(axis.symbol,'AXIS');
 assert.equal(axis.coingeckoId,'axis-robotics');
 assert.equal(axis.spotUsdcOkxVerified,false,'OKX spot must not be inferred from derivatives');
 assert.equal(axis.okxDerivativesNotSpot,true);
 assert.equal(axis.venue,'Bitget');
 assert.equal(axis.spotPair,'AXIS/USDT');
 assert.ok(fs.existsSync(path.join(admin,axis.image)),'local logo is not deployed');
 assert.equal(ids.neosoul.verifiedAt,'2026-10-25');
 for(const record of Object.values(ids)){
   assert.equal(record.verified,true);
   assert.match(record.image,/^\.\/assets\/crypto\/new-listings\/[a-z0-9-]+\.(?:png|svg)$/);
   assert.ok(fs.existsSync(path.join(admin,record.image)),'missing local image '+record.image);
   for(const forbidden of ['apiKey','secret','passphrase','bridgeToken','privateAccount','orders_enabled'])
     assert.equal(Object.hasOwn(record,forbidden),false);
 }
});
