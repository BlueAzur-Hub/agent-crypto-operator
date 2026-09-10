# Agent-Crypto @erith.IA — Changelog V1.0-RC4

Date : 2026-07-20

## Objectif

Stabiliser RC3 sans ralentir le cockpit.

## Changements

- Mode Avancé visible par défaut.
- Bouton `Masquer avancé` au lieu de `Afficher avancé`.
- Toggle avancé plus robuste.
- Cache-busting :
  - `style.css?v=1.0-rc4`
  - `app.js?v=1.0-rc4`
- Version visible : `GitHub Pack V1.0-RC4`.

## Pourquoi

La RC3 pouvait afficher une interface mélangée si le navigateur gardait un ancien `style.css` ou un ancien `app.js`.

## Ne pas toucher

```text
public/agent_crypto_erith_ia/archives_yohan/
```

## Commit conseillé

```text
stabilize advanced mode and cache rc4
```
