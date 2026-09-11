import time
from tradus.market import imbalance, validate_tick
from tradus.models import MarketTick

def test_imbalance():
    tick = MarketTick("X", time.time(), 1, 2, 75, 25, 1.5)
    assert imbalance(tick) == 0.5

def test_invalid_crossed_book():
    tick = MarketTick("X", time.time(), 2, 1, 1, 1, 1.5)
    assert validate_tick(tick)[0] is False

def test_future_tick_is_rejected():
    now = time.time()
    tick = MarketTick("X", now + 5, 99.95, 100.05, 10, 10, 100)
    assert validate_tick(tick, now=now) == (False, "FUTURE_DATA")
