# Agent-Crypto @erith.IA — Changelog V1.0-RC7

Date : 2026-07-20

## Objectif

Clarifier l’affichage des sources.

## Problème

`Sources OK 6/7` et `7/7 testées` pouvaient sembler contradictoires.

## Correction

- `Sources OK` devient `Sources réussies`.
- Le sous-texte devient :
  - `0/7 interrogées` avant Livecheck ;
  - `x/7 interrogées · y réussies` pendant Livecheck ;
  - `7/7 interrogées · 1 échec` après Livecheck si une source échoue.

## Anti-hallucination

Le verrou devient dynamique :

- Livecheck OK : source marché active + limites affichées.
- Livecheck échec : prix/tableau/score bloqués.

## Commit conseillé

```text
clarify source status labels rc7
```
