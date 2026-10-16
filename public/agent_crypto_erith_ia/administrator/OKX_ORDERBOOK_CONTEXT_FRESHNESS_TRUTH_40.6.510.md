# Agent-Crypto 40.6.510 — OKX Orderbook Context + Freshness Truth

## Source

Correction bornée issue de l’audit indépendant Astra sur Administrator 40.6.509.

Les fixtures Astra ont démontré que le lecteur du carnet pouvait :
- accepter une paire différente de l’actif demandé ;
- accepter un timestamp absent ou périmé ;
- remplacer implicitement un temps source absent par l’heure locale courante ;
- conserver des niveaux BTC après passage à ETH en cas d’échec ;
- afficher BTC / Cumul BTC pour tous les actifs ;
- conserver un badge LIVE vert malgré une erreur.

Ces fixtures démontrent ce que le lecteur acceptait ; elles ne prouvent pas que le Backend réel a envoyé ces données incorrectes.

## Correction 40.6.510

Propriétaire unique :
`js/okx-microstructure-406499.js`

Avant commit des niveaux, le lecteur exige maintenant :
- `read_only=true` ;
- provider `okx` ;
- status `ok` ;
- asset reçu = asset demandé ;
- base de la paire = asset demandé ;
- quote = `EUR` ;
- timestamp source ISO valide ;
- timestamp non futur au-delà de 5 s ;
- âge source ≤ 15 s ;
- niveaux bid/ask valides et non croisés.

Le temps source et le temps de réception sont stockés séparément.

États visibles :
- **FRESH**
- **STALE**
- **OFFLINE**
- **UNKNOWN**

Après changement d’actif, les anciens niveaux ne sont plus présentés sous le nouvel actif. Les colonnes du carnet suivent l’instrument validé : ETH / Cumul ETH, SOL / Cumul SOL, etc.

Une nouvelle sélection pendant une requête carnet active invalide l’ancienne réponse et rejoue la dernière intention. Cette protection est limitée au carnet et ne remplace pas la correction séparée du Market Microscope prévue ensuite.

## Préservé

- Market Core **38.15.11**
- Graphique / Bougies
- géométrie Profondeur 40.6.507
- portal `document.body`
- dock exact Lecture Technique
- contrôles fenêtre natifs
- polling 2 s uniquement fenêtre ouverte
- Strategy / Cost Gate
- Oracle / Aether
- Backend **1.4.4** inchangé
- Bridge **1.9.13** inchangé
- aucune API privée, wallet ou ordre réel

## Recette Firefox

1. BTC/EUR frais → FRESH.
2. ETH/EUR frais → FRESH + colonnes ETH.
3. BTC→ETH → aucun niveau BTC sous ETH.
4. Couper Backend après chargement ETH → OFFLINE, ancienne preuve clairement non-live.
5. Timestamp source périmé → STALE.
6. Timestamp absent/futur ou paire contraire → UNKNOWN / rejet explicite.
7. Déplacer/détacher/replacer Profondeur → géométrie .507 inchangée.

## Étape suivante

Après preuve terrain 40.6.510 :
**40.6.511 — OKX LOCAL TRANSPORT ABORT SIGNAL**.
