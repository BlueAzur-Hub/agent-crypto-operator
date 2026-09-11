from dataclasses import dataclass
from .models import Action, Position, Signal

@dataclass
class RiskLimits:
    max_order_quantity: float = 1.0
    max_abs_position: float = 2.0
    max_spread_score: float = 0.0

class RiskEngine:
    def __init__(self, limits: RiskLimits | None = None):
        self.limits = limits or RiskLimits()

    def approve(self, signal: Signal, position: Position, quantity: float) -> tuple[bool, str]:
        if signal.action not in (Action.BUY, Action.SELL):
            return False, "NO_ACTION"
        if quantity <= 0 or quantity > self.limits.max_order_quantity:
            return False, "ORDER_SIZE_LIMIT"
        signed = quantity if signal.action == Action.BUY else -quantity
        if abs(position.quantity + signed) > self.limits.max_abs_position:
            return False, "POSITION_LIMIT"
        return True, "RISK_APPROVED"
