# ORACLE EVIDENCE HOT WINDOW SIZING — 40.6.489

Cette version mesure automatiquement l'empreinte Oracle Evidence avant toute politique de rétention.

Le panneau est monté dans Oracle → Evidence & validation.

## Sorties
Local · Échantillon · Moyenne · Médiane · P95 · Payload estimé · Origin usage/quota · GitHub froid.

Trois scénarios sont affichés :
- HOT 10 000
- HOT 5 000
- HOT 2 500

Ils sont des bornes d'estimation uniquement. Ils ne constituent pas une liste de lignes à retirer.

La sélection future devra être fondée sur le watermark froid et les chunks VERIFIED, jamais sur un simple compteur global.

## Sécurité
READ ONLY · aucune modification locale · rétention non activée.
