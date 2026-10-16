# Agent-Crypto 40.6.254 — ATLAS AUTO READER · RESIDENT SCHEDULER RECOVERY

Parent: **40.6.253**  
Market Core: **38.15.11 — protected**

## Fault proved
The visible Auto Reader claimed an active 60 s local cadence while the canonical runtime had regressed to a 5 min public-market callback. The local V4 tick owner no longer existed, and a hidden resident refresh could finish without rearming the local reader.

## Surgery
- Restores one canonical Auto Reader owner in `administrator/app.js`.
- Reuses the existing `state.auto.timer`; no second recurring scheduler.
- Local observation cadence: 60 s.
- Binance Spot remains 30 s.
- Canonical GitHub/CoinGecko source probe remains 5 min.
- Hidden-tab public-source refresh remains resident.
- Same-canonical local observations update `last_seen_at` instead of inventing a new canonical snapshot.
- Both "Lecture maintenant" bindings use the same owner.
- Visibility return rearms local cadence and only probes the public source when due.

## Protected
Market Core 38.15.11, Atlas CURRENT semantics, Decision Intelligence, Strategy A, Oracle, Lecture Technique, Aether, Window Manager and Web Classique are unchanged.

## Firefox acceptance
1. Ctrl+F5 on Administrator 40.6.254.
2. Keep Auto ON and the tab visible >70 s.
3. Verify the local last-read timestamp advances without manual click.
4. Briefly hide and return to the tab; verify the timer rearms.
5. With a newer canonical `latest.json`, verify Atlas starts automatically through 4/4 → NØX → Aerith.
6. Confirm no Firefox slowdown banner.
