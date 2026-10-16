# Agent-Crypto 40.6.256 — ADMIN IDLE AUTH CONTINUITY · NON-BLOCKING BRIDGE EXPIRY

Parent: **40.6.255**  
Market Core: **38.15.11 — protected**

## Operator proof

The Ryzen Administrator page has repeatedly been left running unattended for several hours / overnight.
The privileged Bridge session eventually expires and the full Aether Trust authentication gate reappears.

40.6.255 already added bounded pre-expiry renewal, but that path depends on the already-validated
Administrator secret remaining in volatile document JS memory. A Firefox restore/reload/discard can
legitimately lose that volatile secret while the local Administrator role in sessionStorage is still present.

## Root cause

40.4.273 `atlasBridgeAuthRequireTrust()` deliberately called `atlasAccessOpen()` whenever privileged
Bridge authentication became invalid. That behavior conflated two distinct truths:

- **local Administrator cockpit authorization**, and
- **privileged Bridge token validity**.

An unattended Bridge expiry therefore replaced the still-authorized Administrator cockpit with the gate.

## Surgery

- Keep the 40.6.255 pre-expiry renewal path unchanged.
- Keep the password/secret **JS-memory-only**; do not persist it anywhere.
- On unattended/background Bridge expiry:
  - clear the expired Bridge token;
  - pause Atlas local safely;
  - preserve the local Administrator cockpit;
  - show auth-required truth in Atlas status;
  - **do not open Aether Trust automatically**.
- Open Aether Trust only when:
  - an explicit/manual Atlas run reaches auth preflight, or
  - a protected Bridge request fails with recent visible operator input.
- Explicit Lock / Operator handoff behavior remains unchanged.

## Decision Intelligence layout audit

No move is made.

`js/decision-intelligence-current-truth.js` declares:
- `data-layout-family="analysis"`
- host anchor `#news-sentinel`

Therefore **Decision Intelligence · vérité courante** canonically belongs to
**01 · Analyse & décision** and is correctly located before family 02.

## Protected

Market Core 38.15.11 · Auto Reader 40.6.254 · Atlas CURRENT semantics ·
Strategy A business rules/Gates · Decision Intelligence engine · Oracle ·
Lecture Technique · Web Classique.

## Static validation

- administrator/app.js JavaScript parse: **PASS**
- build.json JSON parse: **PASS**
- New recurring timer: **NO**
- New MutationObserver: **NO**
- Password persistence: **NO**
- Real orders: **NO**
- PAPER ONLY · G3 PENDING · G9 LOCKED

## Firefox acceptance

1. Load **40.6.256** and authenticate Administrator once.
2. Leave the tab unattended through the previous multi-hour expiry horizon.
3. Expected: the Administrator cockpit remains visible.
4. Bridge expiry may pause Atlas local and display auth-required state, but must not force-open Aether Trust.
5. On explicit Atlas/Bridge use, reauthentication may be requested if required.
6. Confirm no Firefox slowdown banner.
