# Agent-Crypto 40.6.108 — Local Dialogue Presentation Truth

Parent: **40.6.107**  
Market Core: **38.15.11** — unchanged.

## Purpose

Make the existing local Atlas/Aerith dialogue easier to read without changing analytical state or business logic.

User-observed issues on 40.6.106:

- the local status line (`Dialogue local prêt... Atlas-10 75 % · 3/4`) reads like debug text rather than an operator status;
- the provenance line under the Aerith conclusion is too small;
- the preserved synthesis line shows `08:45:07` without explaining that it is the **market snapshot time**, not the time at which the latest analytical CURRENT was produced.

## Owner

`js/local-dialogue-presentation-406108.js`

The patch adds:

- a visual pipeline card;
- six presentation chips: Marché, Top 5, Math, Contradictions, NØX, Aerith;
- a progress meter derived only from the status already produced by the runtime;
- readable provenance under the Aerith synthesis;
- explicit clock labels: `snapshot marché` versus `CURRENT produit`.

`CURRENT produit` is read from the existing Analytical Memory owner (`atlasAnalyticalMemoryStats394.latestAt`). It is never replaced by the current wall-clock time.

## Preserved

- CoinGecko market snapshot timestamp;
- CURRENT fingerprint and analytical memory;
- Atlas 4/4 → NØX → Aerith lifecycle;
- Market Core 38.15.11;
- Web Classic;
- Oracle;
- Lecture Technique;
- Strategy A / TRADUS;
- prices and market data;
- IndexedDB/storage ownership.

No recurring timer, MutationObserver, fetch, storage writer, wallet or trading endpoint is added.

## Acceptance

Static pure self-test: **4/4 expected**.

Terrain proof after deployment:

1. open immutable Administrator 40.6.108;
2. observe the local dialogue during 0/4 → 4/4 → NØX → Aerith;
3. verify the progress status is readable and graphical;
4. verify provenance is legible;
5. verify `snapshot marché` keeps the CoinGecko snapshot time while `CURRENT produit` shows the latest closed analytical CURRENT time.
