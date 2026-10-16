# Validation 40.6.273

Static checks completed before commit:
- new evidence demand loader parses as JavaScript;
- modified replay acceptance file parses as JavaScript;
- direct canonical evidence script injection removed from index;
- global per-release asset stamping removed;
- runtime shell cache-busts only the changed replay-acceptance owner;
- no recurring timer or MutationObserver added by the new loader;
- no Market Core / Oracle / Math Core / Shared Memory business code changed.

Terrain pending:
1. Ryzen: hard reload once; verify Classic usable and Oracle/Math Core alive.
2. Transformer Book: normal load, no repeated reload; time to usable Classic.
3. Book: verify Oracle and Math Core, then Intermediate, then Administration.
4. Open Strategy A once; verify evidence pack progressively appears and remains PAPER-only.
5. If Book freezes or Firefox raises a slow-page warning, stop and rollback to 40.6.272; do not stack another patch before profiling the remaining shell owners.
