# Agent-Crypto Administrator — 40.6.65

## TRADUS SHADOW · MOUNT + STATE TRUTH

Parent: **40.6.64**  
Market Core: **38.15.11 — protected**

### Purpose

40.6.64 integrated TRADUS/Yohan but its panel could disappear when Simulation hydrated after the initial document lifecycle.
40.6.65 repairs only that runtime visibility authority and the Strategy A ↔ TRADUS state comparison.

### Runtime correction

- TRADUS mounts after late Strategy/Simulation hydration through bounded event-driven retries.
- Primary anchor remains the visible Paper proof panel; Replay Sandbox is the fallback.
- Click/focus/pageshow/visibility events schedule a double requestAnimationFrame check, then listeners self-remove after success.
- No interval, no recurring polling loop, no MutationObserver.
- Existing panel detection prevents duplicates.

### State truth correction

- Strategy A STOP is never treated as active.
- STOP + TRADUS BUY/SELL => OPPOSITION SÉCURITÉ.
- WAIT/NO TRADE + TRADUS BUY/SELL => DIVERGENCE.
- WAIT + TRADUS NO_TRADE => CONVERGENCE.
- PAPER/active + TRADUS BUY => CONVERGENCE POTENTIELLE.
- PAPER/active + TRADUS SELL => OPPOSITION.

### Naming clarity

The visible label is now **TRADUS / YOHAN · SHADOW INDÉPENDANT** to avoid confusing it with the historical Paper workspace named **STRATÉGIE B**.

### Package hygiene

Python `__pycache__`, `.pyc` and `.pytest_cache` files are excluded from this distributable ZIP. Existing tracked cache files on GitHub are not deleted by a normal web upload and may be cleaned separately.

### Protected

Aether Watch, Graphique, Lecture Technique, Atlas, Oracle, Strategy A thresholds, Strategy A Paper owners and Market Core **38.15.11** are unchanged.

SHADOW ONLY. No API key, wallet or real order.
