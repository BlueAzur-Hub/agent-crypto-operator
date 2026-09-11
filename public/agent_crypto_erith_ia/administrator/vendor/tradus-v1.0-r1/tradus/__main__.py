from .core import TradusCore
from .models import MarketTick
import time

def main():
    engine = TradusCore()
    tick = MarketTick("DEMO", time.time(), 99.9, 100.0, 150, 50, 100.0)
    decision = engine.process_tick(tick)
    print(decision)
    print(engine.position("DEMO"))

if __name__ == "__main__":
    main()
