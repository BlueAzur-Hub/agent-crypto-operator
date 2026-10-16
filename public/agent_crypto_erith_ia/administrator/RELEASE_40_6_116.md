# Agent-Crypto Administrator 40.6.116 — Operator Cockpit

Parent: **40.6.115**  
Market Core: **38.15.11 — unchanged**

## Mission

Provide one readable operator screen above the technical laboratory.

The cockpit answers four questions only:

1. What is the current decision?
2. What should the operator do now?
3. Why?
4. Do Strategy A and TRADUS agree?

The existing detailed Strategy A, TRADUS, Paper, Ledger, Replay, Risk and Source Truth sections remain available below for audit and engineering.

## Canonical owner

`js/operator-cockpit.js`

Loaded by the stable demand loader for Administrator **40.6.116+**.

## Human-readable surface

The cockpit uses large typography and plain French:

- **DÉCISION ACTUELLE** — ATTENDRE / SURVEILLER / STOP / SIMULATION À OBSERVER;
- **CE QUE TU DOIS FAIRE** — one explicit operator instruction;
- **POURQUOI** — one normal-language sentence;
- **Strategy A** — human state;
- **TRADUS** — human state;
- **Accord ?** — yes / no / not comparable;
- **Paper** — existing paper evidence only;
- expandable **Explication détaillée — en français normal**;
- buttons to reach the technical comparison and machine room when desired.

## Read-only contract

The cockpit:

- performs no fetch;
- adds no recurring timer;
- adds no MutationObserver;
- writes no storage;
- creates no market price;
- creates no financial signal;
- does not alter Strategy A;
- does not alter TRADUS;
- does not alter Oracle;
- does not alter Market Core;
- creates no wallet or order path.

It only translates existing read-side truths into a readable operator summary.

## Fail-closed behavior

- unknown / stale evidence can only weaken the conclusion;
- Strategy A STOP produces **STOP / NE RIEN FAIRE**;
- Strategy A wait + TRADUS wait produces **ATTENDRE**;
- Strategy A wait + directional TRADUS produces **SURVEILLER / NE PAS AGIR**;
- directional descriptive agreement remains **SIMULATION À OBSERVER**, never a real order.

## Self-test

Expected: **5/5**.

- wait + wait => ATTENDRE;
- wait + SELL divergence => SURVEILLER;
- STOP => NE RIEN FAIRE;
- directional paper agreement => SIMULATION À OBSERVER;
- no fetch/timer/storage/order side effect.

## Protected zones

No change to Market Core 38.15.11, Web Classic, Graphique, Lecture Technique, Aether, Atlas CURRENT, Oracle engine, Strategy A engine, TRADUS engine, Paper engines, Bridge protocol, wallet or order paths.

Firefox terrain proof is required after GitHub Pages propagation.
