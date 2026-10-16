# Agent-Crypto 40.6.390 — REDIVIDER Canonical HUD Integration

Date: 2026-09-24
Parent: **40.6.389**
Market Core: **38.15.11**

## Decision

40.6.390 is the first canonical REDIVIDER visual integration after the validated 40.6.389 runtime.

The design rule is now explicit:

**PNG = chassis · HTML = dynamic state · CSS = integration only.**

## What changes

- approved transparent artwork: `assets/images/redivider-hud-frame-406390.png`;
- source dimensions: 1672×941;
- source SHA-256: `de198991daccd55efd49e7578289f208ff640417392655f236273197d35b6503`;
- asset is preserved byte-for-byte;
- desktop uses the artwork at full opacity;
- legacy CSS side rails are hidden on desktop;
- legacy painted confirmation ring is transparent on desktop;
- semantic HTML owns KILL SWITCH / REDIVIDER / confirmation mode / percentage / state / question / safety copy / actions;
- duplicate lower percentage text is removed from the confirmation state;
- mobile has no PNG rule and keeps the canonical 40.6.389 native dialog.

## Local rendering proof before publication

Rendered with Chromium at:
- 1280×720;
- 1366×768;
- 1648×920;
- 1920×1080;
- mobile 390×844.

No desktop text collision was detected in the confirmation hierarchy. Mobile CSS does not apply the PNG.

## Untouched

- REDIVIDER STOP/RESUME behavior;
- explicit manual-stop truth;
- Paper Only safety semantics;
- Math Core;
- Lecture Technique;
- Aether / Aether Watch;
- Market Core 38.15.11;
- Strategy / Gates / Shared Memory;
- timers / observers / storage owners / business fetch owners;
- wallets / real orders.

## Terrain proof

Firefox + Chrome/Blackview remain the final terrain authority.

Status at publication: **PENDING**.
