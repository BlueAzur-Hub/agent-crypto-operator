# Seven handoff — Agent-Crypto 40.6.533

40.6.533 est uniquement une version corrective.

## Cause supprimée

New Listings ne possède plus les internals du graphique. Il fournit ses bougies exchange vérifiées à l'unique propriétaire public :
`AtlasExternalChart.present()`.

Ne pas réintroduire d'accès direct à :
- `__atlasExternalChartContext`
- `atlasExternalChartDraw`

## Contrat de sortie

Tant que CT/MHA est actif, les boutons de période restent les contrôles de la série exchange.
Lors d'une commande canonique, New Listings libère seulement sa sélection et son contexte exchange, sans vider le canvas. Le handler natif possède la transition réelle.

## Protégé

Market Core 38.15.11, Strategy, Oracle, Aether, les sémantiques Top 5/Solo/Réinit./Vider et le design des Bougies restent inchangés.

## Prochaine preuve

Firefox :
CT → Top 5 → CT → Réinit. → MHA → Top 5 → MHA → Vider → MHA → BTC.

Canvas = encart = Fiche = Carnet à chaque état possédé.
Le chantier qualité Bougies vient seulement après cette stabilisation.
