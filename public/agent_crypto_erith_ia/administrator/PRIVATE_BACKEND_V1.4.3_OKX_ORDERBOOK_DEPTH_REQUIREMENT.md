# Private Backend V1.4.3 requirement — 40.6.492

Required local loopback route: `GET http://127.0.0.1:8790/orderbook?asset=BTC&depth=100`.

Upstream public market data: `GET https://www.okx.com/api/v5/market/books?instId=BTC-EUR&sz=100`.

Backend remains loopback-only and read-only; POST/PUT/PATCH/DELETE stay blocked. No private exchange API, credential, wallet, order, withdrawal or signature capability is added. The separate R18 complete-source bundle is the Ryzen installation artifact.
