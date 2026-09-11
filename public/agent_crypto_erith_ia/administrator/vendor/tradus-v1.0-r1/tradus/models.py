from dataclasses import dataclass, field
from enum import Enum
from typing import Optional
import time

class Action(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"
    EXIT = "EXIT"
    NO_TRADE = "NO_TRADE"

class OrderStatus(str, Enum):
    CREATED = "CREATED"
    FILLED = "FILLED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"

@dataclass(frozen=True)
class MarketTick:
    symbol: str
    timestamp: float
    bid: float
    ask: float
    bid_volume: float
    ask_volume: float
    last_price: float
    last_volume: float = 0.0

@dataclass
class Signal:
    action: Action
    score: float
    strategy: str
    reason: str

@dataclass
class Decision:
    action: Action
    score: float
    strategy: str
    risk_approved: bool
    reason: str
    timestamp: float = field(default_factory=time.time)

@dataclass
class Order:
    order_id: str
    symbol: str
    action: Action
    quantity: float
    price: float
    status: OrderStatus = OrderStatus.CREATED

@dataclass
class Position:
    symbol: str
    quantity: float = 0.0
    average_price: float = 0.0
    realized_pnl: float = 0.0
