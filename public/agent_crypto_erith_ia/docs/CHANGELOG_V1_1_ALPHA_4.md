# Agent-Crypto @erith.IA — Changelog V1.1-alpha.4

Date : 2026-07-20

## Objectif

Ajouter un Data Collector local navigateur pour commencer une mémoire qui grossit.

## Ajouts

- Bloc `DATA COLLECTOR LOCAL`.
- Bouton `Enregistrer snapshot maintenant`.
- Bouton `Voir mémoire locale`.
- Export mémoire JSON.
- Export mémoire JSONL.
- Effacement de la mémoire locale.
- Compteur de snapshots.
- Dernier enregistrement affiché.

## Nature de la mémoire

LocalStorage navigateur uniquement.

Elle contient :

- profil Solo Débutant 100 € ;
- simulation locale ;
- positions fictives ;
- logs pédagogiques ;
- snapshot marché public BTC / ETH / SOL si Livecheck actif ;
- tags d’apprentissage.

Elle ne contient jamais :

- clé API ;
- wallet ;
- seed phrase ;
- compte exchange ;
- ordre réel ;
- donnée personnelle.

## Direction

Cette version prépare la future vraie base locale sur PC Ryzen 7.
