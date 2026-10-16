# Agent-Crypto 40.6.512 — Depth True Dock · Body Only When Detached

## Terrain correction

La 40.6.511 a bien supprimé le suivi continu de Lecture Technique, mais le modèle de parent restait faux.

Capture terrain :
- Profondeur ne "courait" plus derrière `#detailPanel`;
- mais, dockée, elle restait un enfant de `document.body` avec `position:fixed`;
- en descendant dans les sections Administrator, elle restait donc collée au viewport et continuait de bloquer le contenu.

C’était une erreur de conception de la 40.6.511.

## Modèle correct 40.6.512

### Docké

Profondeur est maintenant **réellement dans la zone Lecture Technique** :

`#detailPanel.appendChild(#atlasOkxMicrostructure)`

et utilise :

`position:absolute; inset:0`

Conséquence :
- elle recouvre Lecture Technique quand elle est ouverte ;
- elle scroll avec Lecture Technique ;
- elle disparaît naturellement avec cette zone ;
- elle ne peut plus rester collée à l’écran quand on descend dans Administrator ;
- aucun calcul de coordonnées n’est nécessaire.

### Détaché

Uniquement lorsque l’utilisateur détache Profondeur :

`document.body.appendChild(#atlasOkxMicrostructure)`

avec `position:fixed`.

Elle devient alors une vraie fenêtre flottante, indépendante et déplaçable.

### Raccrochage

Le bouton `□` remet physiquement Profondeur **dans `#detailPanel`**.

Il ne recalcule pas une position fixe et ne lance aucun suivi.

### Menu conservé

`⠿ — □ ⤢ ×`

## Préservé

- FRESH / STALE / OFFLINE / UNKNOWN ;
- vérité asset / paire / EUR / timestamp ;
- colonnes dynamiques BTC / ETH / BNB / etc. ;
- polling carnet 2 s seulement fenêtre ouverte ;
- Market Core **38.15.11** ;
- Strategy / Cost Gate ;
- Oracle / Aether ;
- logique Lecture Technique ;
- Backend **1.4.4** ;
- Bridge **1.9.13** ;
- aucune API privée / wallet / exécution réelle.

## Recette Firefox

1. Ctrl+F5 → **Build 40.6.512 · Administrator**.
2. Ouvrir Profondeur.
3. Elle doit couvrir la zone Lecture Technique.
4. Descendre dans Administrator : **Profondeur doit partir avec Lecture Technique**, pas rester sur le bord droit de l’écran.
5. Remonter : elle revient avec sa zone.
6. `⠿` → Profondeur sort dans le viewport et devient déplaçable.
7. `□` → elle retourne physiquement dans Lecture Technique.
8. Revalider BTC/ETH/BNB et FRESH/STALE.

## Suite

Après PASS terrain :
**40.6.513 — OKX LOCAL TRANSPORT ABORT SIGNAL**.
