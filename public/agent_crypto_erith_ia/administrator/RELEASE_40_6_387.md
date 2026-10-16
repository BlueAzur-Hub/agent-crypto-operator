# Agent-Crypto 40.6.387 — AETHER VEILLE · JS NEWLINE SYNTAX RECOVERY

Date: 2026-09-23
Parent: **40.6.386**

## Why this build exists

The Aether / Veille entity-truth correction in 40.6.386 was semantically correct, but the generated edit inserted literal `\\n` tokens directly into executable `administrator/js/aether.js`.

Static V8 parse before repair:

`Unexpected token 'function'`

That means the Aether runtime could fail before the new LINK/Chainlink guard even ran.

## Exact correction

- convert only the accidental source `\\n` tokens to real line breaks;
- preserve the legitimate escaped newline used by the weather multiline display;
- preserve the 40.6.386 LINK entity-truth logic unchanged;
- update canonical runtime truth to 40.6.387.

Static V8 parse after repair: **PASS**.

## Protected / unchanged

- Market Core **38.15.11**;
- Math Core + REDIVIDER cockpit **40.6.384**;
- Lecture Technique RND **40.6.385** and Origines d’Aerith;
- Aether Watch geometry **40.6.322**;
- News collector entity rule from **40.6.386**;
- Strategy A / Gates;
- Storage / Shared Memory;
- no new timer, observer, network owner, wallet or real order.

## Firefox proof required

Ctrl+F5 and verify:

1. **Build 40.6.387**;
2. Aether / VEILLE is alive — no parser failure;
3. SEC OTC Link LLC is not presented/scoped as Chainlink `LINK`;
4. genuine crypto / macro Veille rotation remains healthy.

Then freeze 40.6.387.
