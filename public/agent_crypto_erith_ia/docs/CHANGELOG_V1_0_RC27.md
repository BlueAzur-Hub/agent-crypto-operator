# Agent-Crypto @erith.IA — Changelog V1.0-RC27

Date : 2026-07-20

## Objectif

Hotfix fonctionnel après test réel de RC26.

## Corrections

### Export Markdown

- Correction des `\n` visibles dans le fichier `.md`.
- Export avec vrais retours ligne.
- Nettoyage automatique des préfixes :
  - `Champ Objectif de la session :`
  - `Champ Cryptos prioritaires :`
  - `Champ Risques interdits :`

### Coinbase

- Coinbase n’est plus traité comme un échec réseau utilisateur.
- Coinbase est classé `Backend requis`.
- GitHub Pages ne force plus un endpoint Coinbase inadapté au frontend public.

## Sécurité

Aucune clé réelle.
Aucun wallet réel.
Aucun ordre réel.
Aucun trading automatique.

## Commit conseillé

```text
hotfix markdown export and coinbase backend rc27
```
