# Agent-Crypto 40.6.533 — Single Graph Owner Repair

## Terrain cause

40.6.532 est rejetée par la preuve Firefox :
- une série CT pouvait être peinte alors que l'encart d'analyse décrivait encore BTC ;
- les commandes canoniques finissaient par récupérer le graphe, mais New Listings effaçait/réécrivait l'état graphique avant leurs handlers ;
- le module New Listings accédait encore directement à `__atlasExternalChartContext` et appelait `atlasExternalChartDraw`.

## Correction

Le propriétaire runtime reste stable :
- `js/new-listings-native-category.js`
- état interne : `state`
- API publique : `AgentCryptoNewListingsNativeCategory`

Le propriétaire du graphique est désormais unique :
- `app.js::AtlasExternalChart`
- entrée publique pour une série exchange déjà vérifiée : `AtlasExternalChart.present(coin, period, result)`

Le module New Listings n'accède plus au contexte graphique privé et n'appelle plus les fonctions privées de dessin.

L'encart d'analyse principal suit maintenant le propriétaire externe actif : CT/MHA ne doit plus afficher un ancien en-tête BTC pendant que leur série possède le canvas.

Lors d'une commande canonique, New Listings libère son propre état avec `clearChart:false`. Top 5 / Solo / Réinit. / Vider exécutent ensuite leurs handlers natifs, qui possèdent déjà le démontage du contexte externe.

Les accès dataset sont stabilisés :
- `dataset.newListingOpen`
- `dataset.newListingSources`

## Protégé

- Market Core 38.15.11 inchangé.
- Aucun Graphique/Fiche/Profondeur parallèle.
- Aucune injection dans state.coins ou modification de ranking.
- Aucun changement Strategy / ordre / wallet / storage / timer / observer.
- Le chantier qualité visuelle Bougies est volontairement différé.

## Preuve Firefox

1. CT → Ligne : canvas, encart, Fiche et Carnet doivent tous identifier CT.
2. CT → Top 5 : Top 5 natif doit reprendre la main sans effacement préalable par New Listings.
3. CT → Réinit. : BTC 24 h.
4. MHA → Top 5.
5. MHA → Vider.
6. MHA → BTC dans le Market.
7. Sources sur un nouveau listing doit résoudre le bon actif.

Une divergence Canvas / encart / Fiche / Carnet = FAIL.
