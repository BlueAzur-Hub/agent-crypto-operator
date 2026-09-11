# TRADUS V1.0

Trading Unified Decision & Execution System.

TRADUS V1.0 is a research and simulation framework for algorithmic trading. It is disabled for live trading by design.

## Features

- Market-data validation
- Microstructure indicators
- Signal generation
- Strategy selection
- Risk gate
- Paper/backtest execution simulator
- Position state management
- Structured event journal
- Unit tests

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -q
python -m tradus
```

Windows:

```powershell
.venv\Scripts\activate
```

## Safety

This repository does not connect to a broker or exchange. Live execution is intentionally unavailable in V1.0.


## Agent-Crypto integration R1 · 40.6.64

This preserved copy fixes three integration defects without enabling live trading:

- stale data now uses the real current clock when `now` is omitted;
- long/short fill accounting supports partial close and direction flips without negative-basis corruption;
- the original BUY test now uses a spread that actually satisfies the strategy's unchanged `0.002` maximum spread ratio.

Thresholds remain unchanged. Live execution remains unavailable.
