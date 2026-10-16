# 40.6.620 — Single-character ticker resolver repair

## Cause racine prouvée

MemeCore a pour ticker canonique **M**.

Le propriétaire navigateur `administrator/js/okx-market-pair-resolver.js` refusait les actifs de moins de 2 caractères. Le Private Backend 1.4.6 du R19 intégré appliquait la même règle dans `_normalize_okx_public_asset()`.

Conséquence : `M` était rejeté, puis un fallback DOM pouvait produire `MEMECORE`, d'où `MEMECORE-USDC / MEMECORE-USDT` et l'absence de carnet compatible.

## Correction

- actifs : **1–16 caractères alphanumériques** ;
- quotes navigateur : **2–16 caractères** ;
- Backend : quotes toujours bornées par la whitelist existante EUR / USDC / USDT ;
- self-tests explicites : `M`, `M-USDT`, candidats `M-USDC → M-USDT`.

## Protections

Inchangés : Bridge **1.9.13**, Market Core **38.15.11**, formules Bougies, rendu Profondeur, Lecture Technique, Oracle, Math Core, Strategy. Aucun ordre réel, wallet ou clé exchange.

## Livraison locale

Patch : `coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_40.6.620_SINGLE_CHAR_TICKER_PATCH.zip`

SHA-256 : `0c7fd9462543c3999d1969be12063f77217567d71d48a9e2a2fa16fb3be1b7fa`

Installation Backend : arrêter uniquement Backend dans Aether Control, remplacer `R19/backend/private_backend.py`, relancer Aether Control. **Ne pas remplacer le Bridge.**

## Preuves hors terrain

- Browser resolver self-test : PASS.
- `M → [M-USDC, M-USDT]` : PASS.
- Backend 1.4.6 `--self-test` : PASS.
- Terrain Firefox : PENDING Christophe.
