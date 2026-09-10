# Agent-Crypto @erith.IA — Changelog V1.0-RC1

Date : 2026-07-20

## Objectif

Version candidate consolidée, pour arrêter les micro-uploads.

## Corrections incluses

- Interface compacte validée sur la base V0.8/V0.9.
- Titre sur une seule ligne : `Agent-Crypto @erith.IA`.
- Ticker lisible.
- Tableau marché rempli après Livecheck OK.
- Score Observation actif après Livecheck OK.
- Lecture froide synchronisée avec l’état live.
- Décision tableau synchronisée :
  - avant Livecheck : `Refusé avant Livecheck`
  - après Livecheck OK : `Autorisé · source réelle`
  - si échec : `Refusé · pas de source live`
- Compteur Sources OK conservé.
- `archives_yohan/` non modifié.

## Politique archives

```text
public/agent_crypto_erith_ia/archives_yohan/
```

Ce dossier est une archive historique figée.

Il ne doit plus être uploadé ou modifié à chaque version.

## Fichiers à uploader pour cette RC

```text
public/agent_crypto_erith_ia/web/index.html
public/agent_crypto_erith_ia/web/style.css
public/agent_crypto_erith_ia/web/app.js
public/agent_crypto_erith_ia/README.md
public/agent_crypto_erith_ia/MANIFEST.json
public/agent_crypto_erith_ia/docs/CHANGELOG_V1_0_RC1.md
```

## Commit conseillé

```text
stabilize agent crypto erith ia v1.0 rc1
```
