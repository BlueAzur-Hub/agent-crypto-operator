import uuid
from .models import Action, Order, OrderStatus, Position

class PaperExecutor:
    def __init__(self):
        self.orders: list[Order] = []

    def submit(self, symbol: str, action: Action, quantity: float, price: float) -> Order:
        order = Order(str(uuid.uuid4()), symbol, action, quantity, price, OrderStatus.FILLED)
        self.orders.append(order)
        return order

    def apply_fill(self, order: Order, position: Position) -> Position:
        signed = order.quantity if order.action == Action.BUY else -order.quantity
        if signed == 0:
            return position

        old_qty = position.quantity
        old_avg = position.average_price

        # Flat -> open long or short.
        if old_qty == 0:
            position.quantity = signed
            position.average_price = order.price
            return position

        # Add in the same direction -> absolute-quantity weighted average.
        if (old_qty > 0 and signed > 0) or (old_qty < 0 and signed < 0):
            new_qty = old_qty + signed
            position.average_price = (abs(old_qty) * old_avg + abs(signed) * order.price) / abs(new_qty)
            position.quantity = new_qty
            return position

        # Opposite-side fill -> close partially/fully, or flip.
        closing = min(abs(old_qty), abs(signed))
        if old_qty > 0:
            position.realized_pnl += (order.price - old_avg) * closing
        else:
            position.realized_pnl += (old_avg - order.price) * closing

        new_qty = old_qty + signed
        position.quantity = new_qty
        if new_qty == 0:
            position.average_price = 0.0
        elif (new_qty > 0) == (old_qty > 0):
            # Partial close: remaining leg keeps its original basis.
            position.average_price = old_avg
        else:
            # Flip: remainder was opened by the new fill.
            position.average_price = order.price
        return position
