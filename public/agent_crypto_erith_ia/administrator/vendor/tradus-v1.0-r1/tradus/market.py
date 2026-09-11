import time
from .models import MarketTick

def validate_tick(tick: MarketTick, max_age_seconds: float = 10.0, now: float | None = None) -> tuple[bool, str]:
    current = time.time() if now is None else now
    if not tick.symbol:
        return False, "EMPTY_SYMBOL"
    if tick.bid <= 0 or tick.ask <= 0 or tick.last_price <= 0:
        return False, "NON_POSITIVE_PRICE"
    if tick.bid > tick.ask:
        return False, "CROSSED_BOOK"
    if tick.bid_volume < 0 or tick.ask_volume < 0 or tick.last_volume < 0:
        return False, "NEGATIVE_VOLUME"
    if current < tick.timestamp:
        return False, "FUTURE_DATA"
    if current - tick.timestamp > max_age_seconds:
        return False, "STALE_DATA"
    return True, "OK"

def mid_price(tick: MarketTick) -> float:
    return (tick.bid + tick.ask) / 2

def spread(tick: MarketTick) -> float:
    return tick.ask - tick.bid

def imbalance(tick: MarketTick) -> float:
    total = tick.bid_volume + tick.ask_volume
    return 0.0 if total == 0 else (tick.bid_volume - tick.ask_volume) / total
