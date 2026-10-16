# Agent-Crypto 40.6.87 — Version Truth Entry Authority V2

This note records the one-time versioning repair introduced with Build 40.6.87.

- Market Core remains `38.15.11` and is not modified.
- `index-40.6.87.html` is an immutable-entry alias of the validated 40.6.86 document snapshot.
- Runtime loaded-build authority is now the immutable entry pathname (`index-X.Y.Z.html`) when present.
- The historical compatibility script path `js/version-truth-406086-authority-lock.js` is intentionally retained so the existing 40.6.86 document can hand off without rewriting the multi-megabyte HTML surface.
- `build.json` remains the published-build manifest.
- The complete historical manifest through 40.6.86 is preserved byte-for-byte at `architecture/build-history-through-40.6.86.json`.
- Canonical `index.html` may initially report its embedded 40.6.86 document build, then expose 40.6.87 as available. The operator click loads the immutable `index-40.6.87.html` entry, whose pathname becomes loaded-build authority.
- No recurring timer, observer, storage owner, order path, wallet path, or private exchange API is introduced.
- OKX Wave 1 remains READ ONLY; Binance remains primary; Kraken, Coinbase and OKX are controls.
