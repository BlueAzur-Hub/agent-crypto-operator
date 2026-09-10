# Agent-Crypto @erith.IA — Changelog V1.1-alpha.5

Date : 2026-07-20

## Objectif

Ajouter un explorateur de mémoire locale.

V1.1-alpha.4 savait enregistrer des snapshots.  
V1.1-alpha.5 commence à les lire, les comparer et les expliquer.

## Ajouts

- Bloc `EXPLORATEUR DE MÉMOIRE`.
- Bouton `Lire mémoire`.
- Bouton `Comparer premier / dernier`.
- Bouton `Résumer refus`.
- Bouton `Télécharger rapport .md`.

## Fonctions

### Lire mémoire

Affiche :

- nombre de snapshots ;
- premier snapshot ;
- dernier snapshot ;
- tags dominants ;
- dernier état simulé ;
- refus observés ;
- lecture pédagogique.

### Comparer premier / dernier

Compare les prix BTC / ETH / SOL entre le premier et le dernier snapshot.

### Résumer refus

Compte les refus :

- montant trop gros ;
- crypto non autorisée ;
- plafond / réserve ;
- Livecheck requis ;
- autres refus.

### Rapport Markdown

Exporte un rapport lisible pour reprise ou partage.

## Sécurité

Toujours aucune donnée sensible :

- aucune clé API ;
- aucun wallet ;
- aucun compte réel ;
- aucun ordre réel.
