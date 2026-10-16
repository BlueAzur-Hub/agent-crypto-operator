# Market Instrument Resolver — 40.6.619

## D — comportement demandé

`crypto sélectionnée → chercher une paire SPOT réellement disponible → choisir la source → afficher`

Aucun patch symbole par symbole.

## Runtime publié

Owner : `administrator/js/market-instrument-resolver.js`

Backend requis : **1.4.6 — Market Instrument Resolver**.

Routes :
- `/market-resolve`
- `/market-candles`
- `/market-book`

Priorité fournisseurs : **OKX → Bitget → Binance**.

Bougies : OKX / Bitget / Binance.  
Carnet : OKX / Bitget.  
Graphique Ligne : série CoinGecko existante conservée.

Affichage USD : **USDC → USDT**.  
Affichage EUR : **EUR → USDC → USDT**.

Le Resolver interroge les catalogues SPOT publics ; il ne suppose plus qu'une paire fabriquée existe.

## Terrain déjà prouvé

- **40.6.618 + Backend 1.4.5** : OKB-USDC / OKX / 300 bougies = PASS Firefox.
- **40.6.619 + Backend 1.4.5** : `MARKET_RESOLVER_HTTP / not_found` est cohérent, car 1.4.5 ne possède pas les trois routes Resolver.

## Backend 1.4.6 — vérité de livraison

Artefact actuellement publié sur `main` :

`coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_BACKEND_1_4_6_MARKET_RESOLVER_PATCH.zip`

SHA-256 :

`85a193b4b59eb397f7f67f414112d51878682addb9039c0ff8912286e8179782`

Contenu : Private Backend 1.4.6 read-only + lanceur `backend/start_private_backend.cmd`.

**Il n'existe pas, au checkpoint de cette note, de Control Center intégré Backend 1.4.6 publié sous l'ancien nom**
`AGENT_CRYPTO_AETHER_CONTROL_R19_BACKEND_OKX_LOCAL_TRANSPORT.zip`.

Les anciennes références au SHA `50bd25b4188274faaa50b19ee03008894d5ee4711f27579750515a52def511be`
désignaient un artefact de conversation/non persisté et ne constituent pas la vérité GitHub actuelle.

Le Control Center compilé pour Backend 1.4.5 vérifie strictement la version et peut donc déclarer 1.4.6 « non prêt ».  
Pour le test terrain 40.6.619, utiliser le Backend 1.4.6 autonome du ZIP publié.

Bridge : **1.9.13 inchangé**.

## EXEC / SETTLE

La vérité d'exécution suit la paire résolue :
- OKB : `DISPLAY USD · EXEC OKB-USDC · SETTLE USDC` si cette paire est choisie ;
- BTW : `DISPLAY USD · EXEC BTW-USDT · SETTLE USDT` si Bitget la déclare online ;
- aucune source : `EXEC INDISPONIBLE · SETTLE —`.

## Protections

Non refaits :
- Market Core **38.15.11** ;
- Graphique Ligne / CoinGecko ;
- formules Bougies ;
- Lecture Technique ;
- Oracle ;
- Math Core ;
- Target Top ;
- Market Flow ;
- Aether ;
- Strategy / Cost Gate ;
- Bridge 1.9.13.

Aucun ordre réel, wallet, retrait ou clé exchange.

## Terrain attendu

1. Arrêter l'ancien Backend 8790 / Control Center qui le supervise.
2. Extraire le ZIP Backend 1.4.6 dans un dossier propre.
3. Lancer `backend/start_private_backend.cmd`.
4. Firefox → Ctrl+F5 → vérifier **TRADER · 40.6.619**.
5. OKB → USD → Bougies → **OKX · OKB-USDC** si disponible.
6. BTW → USD → Bougies → **Bitget · BTW-USDT** si online.
7. BTW → Profondeur → **Bitget · BTW-USDT** avec timestamp source.
8. Crypto Market aléatoire → vraie source/pair ou indisponibilité explicite ; jamais BTC de secours.
9. Vérifier `DISPLAY / EXEC / SETTLE`.
10. Aucun ordre réel.

**Terrain Firefox : PENDING. Ne pas créer une 40.6.620 fonctionnelle avant cette preuve, sauf nouveau défaut propriétaire démontré.**
