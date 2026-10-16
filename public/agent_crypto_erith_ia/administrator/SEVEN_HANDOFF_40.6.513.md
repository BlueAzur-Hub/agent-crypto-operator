# SEVEN HANDOFF — Agent-Crypto Administrator 40.6.513

## Point de reprise canonique

Repository : `BlueAzur-Hub/erith-ia-memory`  
Surface : `public/agent_crypto_erith_ia/administrator/`  
Build : **40.6.513**  
Release : **DEPTH BODY DOCUMENT DOCK · RESTORE + CORRECT**  
Market Core : **38.15.11 — protégé**

## Dernière demande opérateur

Profondeur doit être **au-dessus de Lecture Technique dans cette zone**, avec son menu natif `⠿ — □ ⤢ ×`, et rester **techniquement indépendante** du Graphique et de Lecture Technique.

Ne pas interpréter "au-dessus" comme "enfant DOM de Lecture Technique".

## Architecture 40.6.513

- Profondeur : portal `document.body` en docké **et** détaché.
- Docké : `position:absolute` en coordonnées document calculées une fois depuis `#detailPanel`.
- Détaché/maximisé : `position:fixed`.
- Aucun timer 180 ms.
- Aucun scroll-follow.
- Aucun `panel.appendChild(root)`.
- `□` : resnap one-shot.
- `⠿` : détache et déplace Profondeur seule.

## Historique immédiat

- .506 : indépendance body portal correcte.
- .507 : menu natif correct, mais suivi géométrique continu incorrect.
- .510 : context/freshness truth du carnet OKX validée sur Firefox.
- .511 : suivi supprimé mais erreur `position:fixed` docké → fenêtre collée au viewport.
- .512 : tentative child-dock dans `#detailPanel` → rejet terrain, pire visuellement.
- .513 : restore .511 + correction `absolute document coordinates`.

## Protections

Ne pas toucher sans demande distincte :
- Market Core 38.15.11 ;
- Lecture Technique logic ;
- Strategy / Cost Gate ;
- Oracle / Aether ;
- Backend 1.4.4 ;
- Bridge 1.9.13 ;
- Operator Yohan (chantier séparé).

## Test attendu au prochain chat

Firefox :
1. Ctrl+F5 ; vérifier Build 40.6.513.
2. Profondeur couvre Lecture Technique.
3. Scroll/navigation : elle quitte naturellement l’écran avec sa zone.
4. Elle ne doit jamais rester collée au viewport.
5. `⠿` déplace seulement Profondeur.
6. `□` la raccroche en one-shot.
7. FRESH/STALE et colonnes dynamiques toujours OK.

## Après PASS

Reprendre l’audit Astra :
**OKX LOCAL TRANSPORT ABORT SIGNAL**.

## Discipline

Lire le Fil Crypto + ce handoff avant toute modification.  
Correction minimale → preuve CI → Firefox → livraison → arrêt.
