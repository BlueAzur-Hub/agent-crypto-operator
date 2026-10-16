# ERITH.IA Trading Desk — 40.6.601

## INTERFACE RUNTIME MIRROR

40.6.600 est rejetée comme architecture finale.

Le diagnostic complet montre que le Graphique de l'Interface n'est pas un simple lecteur de cache exportable : il appartient au runtime vivant `administrator/app.js`, avec son état, ses périodes, sa validation, son rendu Chart.js, ses refreshs et ses propriétaires additionnels.

Depuis 40.6.589, le Trader reconstruisait progressivement ses propres propriétaires. Cette branche est arrêtée.

## Décision 40.6.601

Le Trader monte directement :

`../administrator/index.html`

dans une frame same-origin, puis `trader-runtime-mirror.js` applique uniquement un filtre de présentation.

Le Trader utilise donc réellement :

- le même `administrator/app.js` ;
- le même Graphique ;
- le même Market ;
- la même Lecture Technique ;
- le même Math Core ;
- les mêmes Bougies ;
- la même Profondeur ;
- la même architecture EUR/USD ;
- les mêmes caches localStorage / IndexedDB ;
- le même Bridge / transport OKX ;
- les mêmes règles réseau et Data Truth.

Aucune copie du moteur Graphique, Market, Math ou Detail n'est chargée par `trading-desk.html`.

## Présentation Trader

Le runtime reste Administrator, mais la page Trader masque seulement les grandes familles hors mission. Sont conservés :

- header de vérité ;
- Marché ;
- Graphique ;
- Lecture Technique ;
- Market ;
- Math Core ;
- Bougies ;
- Profondeur ;
- EUR/USD.

Le filtrage ne modifie aucun owner métier Administrator.

## Fichiers Trader historiques

Les anciens fichiers tels que `line-chart-native.js`, `market-transpose.js`, `math-core-transpose.js`, etc. restent dans le dépôt pour l'historique Git, mais **ne sont plus chargés par la page Trader**.

## Diagnostic futur

Si un défaut apparaît :

1. reproduire la même action dans Administrator ;
2. si Administrator et Trader échouent pareil : bug owner Administrator ;
3. si Administrator fonctionne et Trader échoue : bug du filtre `trader-runtime-mirror.js` ;
4. ne jamais recréer un owner Trader parallèle.

## Sécurité

READ ONLY. Aucun ordre réel. Aucune clé privée. Aucun nouveau transport.
