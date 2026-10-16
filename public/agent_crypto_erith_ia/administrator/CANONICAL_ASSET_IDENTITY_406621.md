# 40.6.621 — Canonical Asset Identity

Terrain 40.6.620 exposed three simultaneous identities for one selected asset: Ligne = M, Bougies = BTC-USDC, Profondeur = MEMECORE/USDC.

Root cause: after 40.6.620 repaired the shared pair owner and Backend 1.4.6, Candles, Depth and Market Instrument Resolver still kept private 2–16 character asset validators.

40.6.621 routes all three through `okx-market-pair-resolver.js::normalizeAsset()`.

Invariant: selected Market coin → canonical symbol → Ligne = Bougies = Profondeur = Market Resolver.

For MemeCore: `M → M-USDC / M-USDT`, never BTC and never MEMECORE-*.

No new local installation. Keep Aether Control 2.3.2R19, Bridge 1.9.13, and the already patched Private Backend 1.4.6 from 40.6.620.

Market Core 38.15.11, candle mathematics, Depth rendering/freshness, Lecture Technique, Oracle, Math Core and Strategy are unchanged.

Terrain Firefox: PENDING Christophe.


## Terrain validation — PASS

Firefox terrain 2026-10-07:

- MemeCore `M` → **Bitget** → `M-USDT` → 300 candles + fresh orderbook: **PASS**.
- `XAUT` → **OKX** → `XAUT-USDT` → 300 candles + fresh orderbook: **PASS**.

This validates both the single-character identity path and provider switching across Bitget / OKX with the same canonical chain.

Validated local stack:
- Aether Control 2.3.2R19;
- Bridge 1.9.13 unchanged;
- Private Backend 1.4.6 R2 single-character patch.

Backend R2 package:
`coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_BACKEND_1_4_6_MARKET_RESOLVER_R2_SINGLE_CHAR.zip`

SHA-256:
`6473f8bc3af0c7571e84b36b14bb34c3fa572ad7bc6ddc96140d76e59d90d42a`

Patched `private_backend.py` SHA-256:
`990134125c77dd7ba774d0225a00edb89f1668ec200c416fb7b8d72960ed158f`

40.6.621 is now the validated baseline. No runtime change is required for this consolidation.
