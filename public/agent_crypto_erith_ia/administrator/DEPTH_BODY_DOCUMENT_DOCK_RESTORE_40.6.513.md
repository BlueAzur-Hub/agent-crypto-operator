# Agent-Crypto 40.6.513 — Depth Body Document Dock · Restore + Correct

## Pourquoi 40.6.512 est rejetée

La preuve Firefox 40.6.512 montre que le "true dock" comme enfant DOM de `#detailPanel` est faux pour le contrat demandé.

Le contrat historique relu dans le Fil Crypto est :

- Profondeur **visuellement au-dessus** de Lecture Technique ;
- Profondeur **techniquement indépendante** du Graphique et de Lecture Technique ;
- la surface vit dans son propre portal `document.body` ;
- `⠿ — □ ⤢ ×` comme les autres fenêtres Administrator ;
- détacher/déplacer ne doit jamais déplacer Graphique ou Lecture Technique.

40.6.506 avait établi l’indépendance correcte.  
40.6.507 avait ajouté le bon menu mais un mauvais suivi géométrique continu.  
40.6.511 avait supprimé le suivi, mais avait gardé un positionnement `fixed`, ce qui collait la fenêtre au viewport.  
40.6.512 a essayé de corriger cela en remettant Profondeur **dans** Lecture Technique : régression d’architecture.

## Correction 40.6.513

Retour au portal `document.body`, y compris en mode docké.

La différence décisive avec 40.6.511 est la géométrie :

### Mauvais 40.6.511

`position: fixed` + `getBoundingClientRect()`

Résultat : la fenêtre reste collée à l’écran quand la page défile.

### Correct 40.6.513

`position: absolute` dans `document.body`

Coordonnées :

`left = rect.left + window.scrollX`  
`top = rect.top + window.scrollY`

Résultat :

- Profondeur est posée exactement sur la zone Lecture Technique ;
- elle reste indépendante techniquement ;
- lorsque la page défile, elle quitte naturellement l’écran avec cette zone ;
- aucun timer de suivi ;
- aucun listener de scroll ;
- aucun `panel.appendChild(root)`.

## Menu

- `⠿` : détacher puis déplacer Profondeur seule ;
- `—` : réduire ;
- `□` : détacher / raccrocher ;
- `⤢` : agrandir / restaurer ;
- `×` : masquer.

Le raccrochage mesure la zone Lecture Technique **une fois** puis écrit les coordonnées document.

## Préservé

- FRESH / STALE / OFFLINE / UNKNOWN ;
- validation asset / pair / EUR / timestamp ;
- colonnes dynamiques BTC / ETH / BNB / etc. ;
- Market Core 38.15.11 ;
- Strategy / Cost Gate ;
- Oracle / Aether ;
- Lecture Technique logic ;
- Backend 1.4.4 ;
- Bridge 1.9.13 ;
- aucune API privée, wallet ou exécution réelle.

## Recette Firefox

1. Ctrl+F5 → Build 40.6.513.
2. Ouvrir Profondeur : elle couvre Lecture Technique.
3. Scroller vers Section 02/03 : Profondeur doit partir naturellement avec la page, **pas rester collée à droite de l’écran**.
4. Revenir au Graphique : si nécessaire, `□` refait un alignement one-shot.
5. `⠿` → déplacer Profondeur : seule la fenêtre bouge.
6. `□` → raccrocher au-dessus de Lecture Technique.
7. Revalider BTC/ETH/BNB + FRESH/STALE.

## Stop

Cette version clôt ce fil. Aucun nouveau chantier ne doit être ouvert dans cette conversation.

Reprise dans un nouveau chat après preuve terrain :
- si 40.6.513 PASS : reprendre la feuille Astra avec `OKX LOCAL TRANSPORT ABORT SIGNAL` ;
- si FAIL : corriger **uniquement** la géométrie Profondeur à partir de ce contrat, sans toucher au reste.
