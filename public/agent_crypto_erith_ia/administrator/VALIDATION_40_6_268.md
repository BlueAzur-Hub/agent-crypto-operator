# VALIDATION — Agent-Crypto 40.6.268

Status: COMMITTED RELEASE · FIREFOX TERRAIN PENDING

## Static checks

- new durable owner parses successfully;
- runtime-shell adds one script tag only;
- no Strategy A threshold changed;
- no recurring timer added;
- no MutationObserver added;
- no network request added;
- IndexedDB is the only new persistent owner;
- no real-order path;
- no historical backfill fabrication;
- unresolved persisted OPEN_SYNCED PAPER state => REVIEW REQUIRED.

## Firefox proof

1. Load Build 40.6.268.
2. Confirm DURABLE READY.
3. Note durable cycle count.
4. Let Auto A create another normal cycle (NO TRADE is valid evidence).
5. Reload Firefox.
6. Confirm durable count survives and does not reset to zero.
7. Confirm Strategy A gates/thresholds are unchanged.
8. Confirm the cockpit remains responsive.
