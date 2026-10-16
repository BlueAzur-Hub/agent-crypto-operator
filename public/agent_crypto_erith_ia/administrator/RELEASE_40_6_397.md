# Agent-Crypto 40.6.397 — Operator Input Priority

Parent: **40.6.396**
Market Core: **38.15.11**

## Hypothesis

The 40.6.299 backpressure protects clicks, keyboard, wheel and touch, but it did not treat simple mouse movement as operator activity.

A user can therefore be moving the cursor toward a control while the post-boot loader considers the interface idle and begins parsing/evaluating a secondary module.

## Single functional change

Owner: `administrator/js/post-boot-runtime-loader-406281.js`

- add passive `pointermove` activity tracking;
- sample at **120 ms** to avoid turning movement tracking into its own performance cost;
- reuse the existing **1400 ms** operator quiet window;
- no extra timer;
- no observer;
- no storage or network owner;
- no direct-residency rollback in this first A/B test.

## Frozen

No change to:

- REDIVIDER;
- Math Core;
- Market Core **38.15.11**;
- Aether lifecycle;
- Oracle;
- Lecture Technique;
- Strategy A;
- Window Manager;
- storage schemas;
- business logic.

## Firefox terrain test

After Ctrl+F5 and **Build 40.6.397**:

1. move the mouse continuously across the interface;
2. hover and click several controls/subsections;
3. scroll normally;
4. compare cursor and click latency with 40.6.396.

If the interface becomes materially more responsive during active mouse use, post-boot contention is confirmed as an important owner.

Terrain at publication: **PENDING**.
