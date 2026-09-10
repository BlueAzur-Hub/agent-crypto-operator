# Atlas-10 Crypto — Data Truth & Sources FR

**Version :** V1.0 
**Date :** 2026-07-24 
**Statut :** Module public Atlas-10 Crypto 
**Périmètre :** Agent-Crypto @erith.IA / Atlas-10 Full Crypto 

---

## Mission

Garantir que chaque valeur affichée possède une provenance, une date, une devise, un type et un statut de fraîcheur.

## Types de données

- spot ;
- historique ;
- global ;
- on-chain ;
- dérivé ;
- cache ;
- estimation ;
- indisponible.

## Contrat minimal

Toute donnée contient :

- source ;
- endpoint ou document ;
- actif ;
- devise ;
- timestamp source ;
- timestamp de récupération ;
- statut de fraîcheur ;
- méthode si dérivée ;
- limite connue.

## Hiérarchie

1. source ou API officielle ;
2. API publique documentée ;
3. agrégateur reconnu ;
4. source secondaire recoupée ;
5. cache daté ;
6. absence de donnée.

## Contradictions

Ne jamais fusionner silencieusement deux valeurs incompatibles.

Afficher :

- source A ;
- source B ;
- écart ;
- cause connue ou hypothèse ;
- source retenue pour le contexte courant.

## Réseau

- timeout ;
- retry borné ;
- backoff après 429 ;
- conservation du dernier état valide ;
- pause lorsque l’onglet est caché ;
- reprise explicite au retour.

## Règle dure

```text
Pas de source réelle = pas de prix.
Pas de données récupérées = pas de tableau chiffré.
```
