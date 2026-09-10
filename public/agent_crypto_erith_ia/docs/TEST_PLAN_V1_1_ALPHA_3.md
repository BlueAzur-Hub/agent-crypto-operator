# Agent-Crypto @erith.IA — Test Plan V1.1-alpha.3

## Préparation

```text
Ctrl + F5
Vérifier : GitHub Pack V1.1-alpha.3
Lancer Livecheck
Aller dans Simulation
```

## Test 1 — Générer une mémoire pédagogique

1. Cliquer `Remettre le simulateur à 100 €`.
2. Cliquer `1 · Tester une opération prudente`.
3. Cliquer `2 · Tester une opération trop grosse`.
4. Cliquer `3 · Tester une crypto interdite`.
5. Cliquer `Résumer ma session`.

Résultat attendu :

```text
Le bloc Journal pédagogique affiche :
- statut sécurité ;
- profil actif ;
- résumé de session ;
- positions simulées ;
- ce que j’ai appris ;
- snapshot marché public.
```

## Test 2 — Export Markdown

Cliquer :

```text
Télécharger journal .md
```

Résultat attendu :

```text
Un fichier Markdown lisible est téléchargé.
Il ne contient aucune clé, aucun wallet, aucun compte réel.
```

## Test 3 — Export JSON

Cliquer :

```text
Télécharger data JSON
```

Résultat attendu :

```text
Un fichier JSON est téléchargé.
Il contient des données publiques / simulation uniquement.
Il prépare la future base locale.
```

## Critère de validation

La version est validée si l’utilisateur comprend ce qu’il a testé et peut exporter une trace propre de session.
