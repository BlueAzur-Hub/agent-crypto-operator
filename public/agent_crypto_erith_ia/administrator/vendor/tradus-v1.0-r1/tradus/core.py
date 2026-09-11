from .execution import PaperExecutor
from .market import validate_tick, mid_price
from .models import Action, Decision, Position
from .risk import RiskEngine
from .strategy import ImbalanceStrategy

class TradusCore:
    def __init__(self, strategy=None, risk=None, executor=None):
        self.strategy = strategy or ImbalanceStrategy()
        self.risk = risk or RiskEngine()
        self.executor = executor or PaperExecutor()
        self.positions: dict[str, Position] = {}

    def process_tick(self, tick, quantity: float = 1.0) -> Decision:
        valid, reason = validate_tick(tick)
        if not valid:
            return Decision(Action.NO_TRADE, 0.0, "NONE", False, reason)

        position = self.positions.setdefault(tick.symbol, Position(tick.symbol))
        signal = self.strategy.evaluate(tick)
        approved, risk_reason = self.risk.approve(signal, position, quantity)
        if not approved:
            return Decision(signal.action if signal.action != Action.NO_TRADE else Action.NO_TRADE,
                            signal.score, signal.strategy, False, risk_reason)

        order = self.executor.submit(tick.symbol, signal.action, quantity, tick.ask if signal.action == Action.BUY else tick.bid)
        self.executor.apply_fill(order, position)
        return Decision(signal.action, signal.score, signal.strategy, True, "EXECUTED")

    def position(self, symbol: str) -> Position:
        return self.positions.setdefault(symbol, Position(symbol))
