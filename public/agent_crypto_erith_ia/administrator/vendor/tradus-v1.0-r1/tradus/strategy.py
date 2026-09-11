from .models import Action, MarketTick, Signal
from .market import imbalance, spread, mid_price

class ImbalanceStrategy:
    name = "ORDER_IMBALANCE"

    def __init__(self, threshold: float = 0.25, max_spread_ratio: float = 0.002):
        self.threshold = threshold
        self.max_spread_ratio = max_spread_ratio

    def evaluate(self, tick: MarketTick) -> Signal:
        mid = mid_price(tick)
        spread_ratio = spread(tick) / mid
        if spread_ratio > self.max_spread_ratio:
            return Signal(Action.NO_TRADE, 0.0, self.name, "SPREAD_TOO_WIDE")
        value = imbalance(tick)
        if value >= self.threshold:
            return Signal(Action.BUY, value, self.name, "POSITIVE_IMBALANCE")
        if value <= -self.threshold:
            return Signal(Action.SELL, value, self.name, "NEGATIVE_IMBALANCE")
        return Signal(Action.NO_TRADE, value, self.name, "INSUFFICIENT_EDGE")
