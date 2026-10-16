import test from 'node:test';
import assert from 'node:assert/strict';
import {compareObservedPrices, auditTraderSources} from './trader-source-coherence.mjs';
const nowMs = Date.parse('2026-10-13T02:37:27+02:00');
const btc = {assetId:'bitcoin', price:81371.81, quote:'USD', observedAt:'2026-10-13T02:29:20+02:00', source:'CoinGecko'};
const market = {assetId:'bitcoin', price:81233.71, quote:'USD', source:'CoinGecko'}; // pas d'heure exacte dans la capture
const eur = {assetId:'bitcoin', price:73088.38, quote:'EUR', observedAt:'2026-10-13T02:37:23+02:00', source:'Binance Spot'};

test('les valeurs BTC USD de la capture diffèrent de 0,17 % (indication, non signal)', () => {
  const a=compareObservedPrices(btc, market, {nowMs});
  assert.equal(a.comparable, true);
  assert.ok(Math.abs(a.differencePct-0.1700033151)<1e-8);
  assert.equal(a.timeQualified, false); // l'heure exacte du dernier prix de marché manque
  assert.equal(a.warning, 'TIMESTAMPS_MISSING');
  assert.equal(a.freshForSignal, false);
});
test('refuse le faux écart de 11,33 % entre USD et EUR', () => {
  const a=compareObservedPrices(btc, eur, {nowMs});
  assert.equal(a.comparable, false);
  assert.equal(a.blocker, 'QUOTE_MISMATCH');
  assert.equal(a.differencePct, null);
});
test('refuse aussi USD / USDT et USDC / USD comme devises équivalentes', () => {
  assert.equal(compareObservedPrices(btc,{...btc,quote:'USDT'},{nowMs}).blocker,'QUOTE_MISMATCH');
  assert.equal(compareObservedPrices({...btc,quote:'USDC'},btc,{nowMs}).blocker,'QUOTE_MISMATCH');
});
test('refuse un autre actif et une cotation non déclarée', () => {
  assert.equal(compareObservedPrices(btc,{...btc,assetId:'ethereum'},{nowMs}).blocker,'ASSET_MISMATCH');
  assert.equal(compareObservedPrices(btc,{...btc,quote:''},{nowMs}).blocker,'QUOTE_UNVERIFIED');
});
test('refuse les prix nuls et négatifs', () => {
  for(const p of [0,-1,null,undefined]) assert.equal(compareObservedPrices(btc,{...btc,price:p},{nowMs}).blocker,'PRICE_INVALID');
});
test('ne confond pas cohérence de devise et fraîcheur du signal', () => {
  const a=compareObservedPrices(btc,{...btc,price:81233.71,observedAt:'2026-10-13T02:36:30+02:00'}, {nowMs});
  assert.equal(a.timeQualified,true);
  assert.equal(a.freshForSignal,false); // le graphique a plus de 8 minutes
  assert.equal(a.warning,'STALE_FOR_SIGNAL');
});
test('les horodatages futuristes ne permettent pas un signal', () => {
  const a=compareObservedPrices({...btc,observedAt:'2026-10-14T02:29:20+02:00'},
  {...btc,observedAt:'2026-10-14T02:29:21+02:00'},{nowMs});
  assert.equal(a.freshForSignal,false);
  assert.equal(a.timeQualified,false);
});
test('la fiche est lecture seule et le trading reste interdit', () => {
  const a=auditTraderSources({chart:btc,market,spot:eur,nowMs});
  assert.equal(a.chartMarket.comparable,true);
  assert.equal(a.chartSpot.blocker,'QUOTE_MISMATCH');
  assert.equal(a.paperAuthorized,false);
  assert.equal(a.orderAuthorized,false);
  assert.equal(a.readOnly,true);
});
