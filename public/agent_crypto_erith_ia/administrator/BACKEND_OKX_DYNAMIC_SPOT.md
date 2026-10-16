# Backend OKX Dynamic Spot

## Cause prouvée

Le R19 fourni contient dans `backend/private_backend.py` une validation `/okx-public` limitée à `DEFAULT_ASSETS = BTC, ETH, BNB, XRP, SOL` et aux quotes `EUR / USDC`.

Donc :
- `OKB-USDC` était rejeté localement avec HTTP 400 avant OKX ;
- `OKB-USDT` était également rejeté car USDT n'était pas admis par le proxy local.

C'est la cause qui manquait derrière le terrain 40.6.617.

## Réparation

Backend composant **1.4.5** :
- actifs publics dynamiques sûrs : `A-Z0-9`, 2–16 caractères ;
- quotes bornées : `EUR / USDC / USDT` ;
- endpoints toujours allowlistés : candles, ticker, books, books-rpi, trades ;
- `USD → USDC` reste le choix primaire de l'Interface ;
- aucun host arbitraire, aucune API privée, aucun wallet, aucun ordre.

Bridge **1.9.13** inchangé.

Bougies 40.6.618 conserve le résolveur partagé et ajoute la vérité d'erreur HTTP : message Backend visible et absence de fausse « dernière série valide » lorsqu'il y a 0 bougie.

## Package local

Nom stable :
`AGENT_CRYPTO_AETHER_CONTROL_R19_BACKEND_OKX_LOCAL_TRANSPORT.zip`

SHA-256 :
`ceacb8a11a5024db7048e240d5c88689f4322b5b38c21db8b03799dfc9699878`

Patch auditable :
`coordination/inter_ai_dialogues/agent_crypto/backend_okx_dynamic_spot.patch`

Le package local doit être installé puis lancé : GitHub Pages ne peut pas remplacer le processus déjà actif sur `127.0.0.1:8790`.

## Tests hors réseau

- Python compile : PASS
- Backend self-test : PASS
- OKB-USDC candles simulé : PASS
- OKB-USDT candles simulé : PASS
- OKB-USDC books simulé : PASS
- instrument/quote non autorisé : rejeté
- Control Center Windows GUI x86-64 recompilé en attendant Backend 1.4.5

## Protections

Market Core 38.15.11, Graphique Ligne, Lecture Technique, Oracle, Math Core, Target Top, Market Flow, Aether et exécution : inchangés.

Terrain Firefox : **PENDING**.
