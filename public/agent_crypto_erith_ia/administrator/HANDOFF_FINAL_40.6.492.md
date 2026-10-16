# HANDOFF — 40.6.492 OKX ORDERBOOK DEPTH TRUTH

1. Launch Control Center **2.3.2R18** / Bridge **V1.9.13** / Private Backend **V1.4.3**.
2. Verify `http://127.0.0.1:8790/health`: version 1.4.3 + OKX orderbook capability.
3. Verify `http://127.0.0.1:8790/orderbook?asset=BTC&depth=100`: read_only=true, provider=okx, pair=BTC-EUR, bids/asks non-empty.
4. Firefox Ctrl+F5 → Administrator 40.6.492 → Simulation → **EXECUTION COST TRUTH**.
5. Click **RAFRAÎCHIR KRAKEN + OKX**.
6. Expected OKX: numeric depth ±5/25 bp and numeric slippage 10/25/50/100 EUR when the book is valid.
7. Safe fallback: if book proof fails, bid/ask+spread remain but depth/slippage stay UNKNOWN.

Do not alter Strategy thresholds to manufacture a PASS.
