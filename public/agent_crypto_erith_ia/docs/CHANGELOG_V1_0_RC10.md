# Agent-Crypto @erith.IA — Changelog V1.0-RC10

Date : 2026-07-20

## Objectif

Corriger l’ergonomie de RC9.

## Problème

RC9 ajoutait un diagnostic sources en haut alors qu’un diagnostic plus lisible existait déjà en bas dans `Live Sources`.

## Correction

- Suppression du bloc diagnostic haut.
- Suppression du bouton `Diagnostic` dans la navigation haute.
- Conservation du diagnostic détaillé en bas.
- Ajout d’une note courte dans `Live Sources` :
  CoinGecko est critique pour autoriser tableau, prix et graphiques.

## Commit conseillé

```text
move source diagnostic back to bottom rc10
```
