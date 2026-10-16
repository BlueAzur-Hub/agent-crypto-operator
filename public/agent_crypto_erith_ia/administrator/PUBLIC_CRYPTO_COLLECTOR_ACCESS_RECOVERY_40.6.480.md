# PUBLIC CRYPTO COLLECTOR ACCESS RECOVERY — 40.6.480

## Scope

Repair only the canonical public Crypto Top-250 producer used by `data/crypto/latest.json`.

The Strategy A decision logic, Atlas CURRENT engine, Oracle, Cost Gate, Market Core 38.15.11, Aether, Lecture Technique, wallets and real orders are not modified.

## Root cause carried from 40.6.479

The collector is scheduled and still publishes `status.json`, but CoinGecko answers HTTP 403 and the last valid `latest.json` is intentionally preserved.

CoinGecko's current Demo contract uses:
- root: `https://api.coingecko.com/api/v3`;
- secret transport: `x-cg-demo-api-key` header;
- key stored outside public client files.

## 40.6.480 repair

- GitHub Actions reads only `secrets.COINGECKO_DEMO_API_KEY`.
- The collector reads only environment variable `COINGECKO_DEMO_API_KEY`.
- The key is attached per request to CoinGecko only.
- The global `requests.Session` headers never contain the key, so the ECB FX request cannot inherit it.
- The rank-complete fallback page also uses the same authenticated CoinGecko header.
- Missing secret fails closed before CoinGecko network access.
- Failure still preserves the last valid canonical snapshot.
- Public status records only the authentication contract, never the secret value.

## Proof levels

### Static / harness
Validated by `.github/scripts/agent_crypto_public_crypto_demo_auth_test_406480.py`.

### Live provider recovery
PENDING until a valid GitHub Actions repository secret named `COINGECKO_DEMO_API_KEY` is present and a collector run publishes a fresh `latest.json` with `status=ready`.

A missing or invalid key is not converted into fake market data.

## Out of scope

- extended ranks 251–1000;
- historical Top-50 collector;
- changing data provider;
- forcing Atlas CURRENT to recompute stale input;
- Strategy threshold/gate changes.
