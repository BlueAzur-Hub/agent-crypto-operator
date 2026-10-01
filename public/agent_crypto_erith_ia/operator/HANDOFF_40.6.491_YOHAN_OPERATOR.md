# HANDOFF — YOHAN OPERATOR 40.6.491

Repository cible : `BlueAzur-Hub/agent-crypto-operator`
Runtime source : `BlueAzur-Hub/erith-ia-memory`
Runtime cible : Administrator **40.6.491**
Market Core : **38.15.11**

## Upload

Ce paquet est PATCH-ONLY. Il ne remplace pas le dépôt complet.
Décompresser puis recopier son arborescence dans `agent-crypto-operator/` en conservant les autres fichiers existants.

## Test terrain après publication

1. Ouvrir `operator/index.html`.
2. Vérifier la livraison Yohan **40.6.491**.
3. Vérifier que le runtime affiché est **Build 40.6.491 · Administrator**.
4. Vérifier Market Core **38.15.11**.
5. Vérifier que la couche Yohan est chargée sans accorder de session Administrator.
6. Vérifier les vues principales, Math Core / REDIVIDER / Strategy, sans régression visuelle.
7. Vérifier le panneau Oracle Evidence 40.6.491 en lecture normale ; ne pas relancer une suppression si aucun chunk n'est éligible.

## Verrous

- ne pas recopier le runtime MASTER dans Operator ;
- ne pas écraser les secrets / Bridge local ;
- ne pas ajouter wallet ou ordre réel ;
- ne pas modifier Market Core 38.15.11.
