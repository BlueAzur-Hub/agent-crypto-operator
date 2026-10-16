# 40.6.622 — Support / Résistance · current-edge fallback

## Défaut terrain

Sur SOL-USDC en Bougies 1m, la dernière clôture était exactement égale au plus bas visible. Le panneau Lecture Technique affichait pourtant **Support : Aucun niveau**.

La cause était une condition de bord dans le fallback S/R :
- support seulement si `low < current`;
- résistance seulement si `high > current`.

Quand la clôture courante était exactement sur l'extrême visible, le fallback était donc supprimé.

## Correction

Le moteur conserve la méthode `PIVOTS_VISIBLES_W2` et les pivots historiques inchangés.

Seule la condition de fallback visible devient :
- support : `low <= current`;
- résistance : `high >= current`.

Le niveau d'égalité est marqué `currentEdge: true`, reste un fallback indicatif, et sa distance à la clôture vaut 0 %.

## Non-régressions

- Resolver multi-source inchangé.
- Bridge 1.9.13 inchangé.
- Backend opérateur inchangé.
- Market Core 38.15.11 inchangé.
- Bougies / Profondeur transport inchangé.
- Aucun ordre réel.
- Aucun timer ou observer ajouté.

## Tests automatiques ajoutés

- current-edge support ;
- current-edge resistance ;
- Guard CI exige désormais la présence du fallback d'égalité et des deux self-tests.

## Terrain attendu

1. SOL-USDC ou tout actif dont la clôture courante coïncide avec le plus bas visible : le Support doit afficher ce niveau au lieu de « Aucun niveau ».
2. Cas symétrique au plus haut visible : la Résistance doit afficher le niveau courant.
3. M / Bitget, XAUT / OKX et OKB / OKX restent consultables.
