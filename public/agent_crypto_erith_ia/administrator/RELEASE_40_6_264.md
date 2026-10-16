# Agent-Crypto 40.6.264 — STABILITY · DECISION INTELLIGENCE INDEX + VERSION GUARDS

Base: **40.6.263**
Base commit: `119dc1cad0b87ed8c759ca78a02ab7449126059f`
Status: **CANDIDATE · FIREFOX TERRAIN PENDING**

## Scope

This candidate is deliberately bounded. It does not redesign Section 01 and does not add a feature.

Changed runtime owners:
- `administrator/js/event-memory.js`
- `administrator/js/historical-analog-engine-405015.js`
- `administrator/js/decision-intelligence-current-truth.js`

Changed CI guard:
- `.github/scripts/agent_crypto_version_truth_guard_compat.py`

Publication metadata:
- `administrator/build.json`

## Runtime repair

### Event Memory
The previous nearest-window lookup scanned every market record for every event and every reaction window.
This candidate prepares one timestamp-sorted index for the shared record set and resolves nearest snapshots by binary search.
The original source records, windows, tolerances and tie behavior remain authoritative.

### Historical Analogs
The +24h and +48h passes now share one per-computation similarity cache.
No similarity threshold, analog limit, reaction value, regime rule or calibration rule changes.

### Decision Intelligence
- retains the existing `#decisionIntelligenceSection01Slot`;
- no Section 01 wrapper or Window Manager change;
- shares the prepared Event Memory state;
- synchronizes `Déplier` / `Replier`;
- does not launch a calculation merely because Firefox restored `<details open>` during mount;
- same-event cache behavior remains active.

## Version guards

Truth/Delivery failures since 40.6.254 were caused by exact whitespace string matching in the compatibility guard.
The guard now checks the four canonical boot expressions with whitespace-tolerant regular expressions.
The canonical-entry contract itself is unchanged.

## Protected

Unmodified:
- Market Core 38.15.11
- Section 01 flat Window Manager contract
- `runtime-shell.html`
- `admin-window-manager.js`
- `js/app.js`
- Atlas CURRENT
- Oracle
- Lecture Technique
- Strategy A business rules / Gates
- Aether
- Web Classique
- Bridge auth
- real-order paths

## Terrain acceptance

This candidate is **not stable until Firefox proves it**.

Required PASS:
1. ordinary scroll stays responsive;
2. Section 01 controls and Reduce/restore work;
3. Decision Intelligence opens without a multi-second stall or Firefox slowdown banner;
4. close/reopen is immediate for the same event;
5. label truth is `Déplier` when closed and `Replier` when open;
6. Decision Intelligence remains in Section 01;
7. Version Truth Guard PASS;
8. Version Delivery Guard PASS;
9. Pages PASS.
