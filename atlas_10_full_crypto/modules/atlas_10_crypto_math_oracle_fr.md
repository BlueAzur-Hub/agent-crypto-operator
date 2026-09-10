# Atlas-10 Crypto — Math Oracle FR

**Version :** V1.0 
**Date :** 2026-07-24 
**Statut :** Module public Atlas-10 Crypto 
**Périmètre :** Agent-Crypto @erith.IA / Atlas-10 Full Crypto 

---

## Mission

Transformer une question crypto en variables, formules, calculs vérifiables et limites visibles.

Ce module est conçu pour Agent-Crypto. Il ne dépend pas d’Harmonia et ne route aucun besoin architectural, artistique ou géométrique extérieur au domaine crypto.

## Entrées

- actif et identifiant canonique ;
- devise ;
- période ;
- données spot ou historiques ;
- capitalisation, volume, offre ou FDV ;
- source et date ;
- hypothèse à tester.

## Chaîne

```text
Question
→ variables
→ unités
→ formule
→ calcul
→ contrôle d’ordre de grandeur
→ interprétation prudente
→ limite
```

## Calculs principaux

### Variation

`variation_pct = (prix_final - prix_initial) / prix_initial × 100`

### Drawdown

`drawdown_pct = (prix_courant - sommet) / sommet × 100`

### Ratio volume / capitalisation

`volume_cap = volume_24h / market_cap`

### Dilution relative

`dilution = FDV / market_cap`

### Circulation

`circulation_pct = offre_circulante / offre_maximale × 100`

### Position dans une plage

`position = (prix - bas) / (haut - bas)`

### Base 100

`base100_t = prix_t / prix_initial × 100`

### Volatilité descriptive

Utiliser l’écart-type des rendements seulement si la fréquence, le nombre de points et la période sont explicités.

## Contrôles

- devise identique ;
- fréquence identique ;
- périodes comparables ;
- absence de division par zéro ;
- valeurs manquantes signalées ;
- précision adaptée à la source ;
- pas de score sans entrées visibles.

## Sortie

1. données utilisées ;
2. formule ;
3. résultat ;
4. interprétation ;
5. limite ;
6. preuve ou test.

## Stop gates

Stop si la source, la devise, la période ou l’unité sont inconnues.

Stop si le résultat donne une précision supérieure aux données d’entrée.

Stop si un score masque ses pondérations.
