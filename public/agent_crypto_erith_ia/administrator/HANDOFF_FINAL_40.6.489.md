# HANDOFF FINAL — Agent-Crypto 40.6.489

## ORACLE EVIDENCE HOT WINDOW SIZING PROBE

Sonde automatique READ ONLY avant toute rétention locale.

### Mesures
- nombre local exact ;
- échantillon systématique borné à 1 000 Evidence ;
- moyenne / médiane / P95 / min / max des tailles JSON ;
- estimation du payload local ;
- usage / quota de l'origin via navigator.storage.estimate() ;
- couverture GitHub froide ;
- scénarios HOT 10 000 / 5 000 / 2 500 comme estimations seulement.

### Invariants
- IndexedDB : readonly ;
- aucune modification locale ;
- aucune rétention activée ;
- aucun changement de schéma ;
- Market Core 38.15.11 protégé ;
- Strategy A protégée ;
- Atlas CURRENT protégé ;
- Oracle Math protégé ;
- archive froide 40.6.487 protégée.

### Prochaine étape
Lire le résultat Firefox et choisir la HOT WINDOW à partir des mesures réelles.
