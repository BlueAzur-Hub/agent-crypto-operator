# Agent-Crypto 40.6.211 — G3 Durable Evidence Asset Rebind

Parent: 40.6.210  
Engine: Market Core 38.15.11  
Mode: PAPER ONLY  
G3: PENDING  
G9: LOCKED

## Terrain 40.6.210

The exported Firefox report shows Build 40.6.210, but the expected human durability block is absent. The visible evidence area still reports the older 40.6.206 prospective capture panel with 0 rows and the 40.6.208 overlap proof with no certified decision.

This does **not** prove IndexedDB failed. It proves the 40.6.210 durable asset was not observed as active in that terrain load.

## 40.6.211

Minimal cache/rebind release:

- republish `js/strategy-a-g3-overlap-live-refresh.js` first with BUILD 40.6.211;
- advance `build.json` only after the asset exists;
- the canonical Administrator loader will therefore stamp local assets with `release=40.6.211`;
- no manual Firefox cache clearing is required;
- no trading logic, Gate state, Market Core, Oracle, Atlas, Risk Governor, PAPER lifecycle or real-order path changes.

## Terrain proof requested

1. Reload until **Build 40.6.211** is visible.
2. Find **DÉCISION PAPER · MÉMOIRE DURABLE · 40.6.211**.
3. It should show **MÉMOIRE DURABLE OK**.
4. If the counter is 0, use the visible **ENREGISTRER LA PROCHAINE DÉCISION PAPER** button once.
5. When the counter is at least 1, reload once and export the markdown report.
6. Expected: the same decision remains and **APRÈS RECHARGEMENT = OUI**.
