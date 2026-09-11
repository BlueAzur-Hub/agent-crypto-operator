import time
from tradus.core import TradusCore
from tradus.models import Action, MarketTick

def test_buy_execution_with_allowed_spread():
    engine = TradusCore()
    tick = MarketTick("X", time.time(), 99.95, 100.05, 100, 10, 100)
    decision = engine.process_tick(tick)
    assert decision.action == Action.BUY
    assert decision.risk_approved is True
    assert engine.position("X").quantity == 1

def test_no_trade_when_balanced():
    engine = TradusCore()
    tick = MarketTick("X", time.time(), 99.95, 100.05, 50, 50, 100)
    decision = engine.process_tick(tick)
    assert decision.action == Action.NO_TRADE
    assert decision.risk_approved is False

def test_wide_spread_is_not_forced_into_buy():
    engine = TradusCore()
    tick = MarketTick("X", time.time(), 99, 100, 100, 10, 100)
    decision = engine.process_tick(tick)
    assert decision.action == Action.NO_TRADE
    assert decision.reason == "NO_ACTION"

def test_stale_tick_is_rejected_by_default_clock():
    engine = TradusCore()
    tick = MarketTick("X", time.time() - 20, 99.95, 100.05, 100, 10, 100)
    decision = engine.process_tick(tick)
    assert decision.action == Action.NO_TRADE
    assert decision.reason == "STALE_DATA"

def test_short_open_and_cover_realized_pnl():
    engine = TradusCore()
    sell_tick = MarketTick("X", time.time(), 99.95, 100.05, 10, 100, 100)
    sell = engine.process_tick(sell_tick)
    assert sell.action == Action.SELL
    assert sell.risk_approved is True
    assert engine.position("X").quantity == -1
    assert engine.position("X").average_price == 99.95

    buy_tick = MarketTick("X", time.time(), 89.95, 90.05, 100, 10, 90)
    buy = engine.process_tick(buy_tick)
    assert buy.action == Action.BUY
    assert buy.risk_approved is True
    assert engine.position("X").quantity == 0
    assert round(engine.position("X").realized_pnl, 8) == 9.9
