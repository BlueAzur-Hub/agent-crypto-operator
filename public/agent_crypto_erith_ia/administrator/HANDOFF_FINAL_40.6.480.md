# HANDOFF FINAL — 40.6.480

## Vérités acquises

- 40.6.478 : chaîne prospective réelle T0 → T+5 → T+15 → T+60 observée.
- 40.6.479 : fraîcheur des entrées Strategy rendue visible ; Atlas upstream CoinGecko identifié DEGRADED.
- 40.6.480 : plomberie d'authentification Demo préparée en fail-closed pour le collecteur canonique Top-250.

## Ce qui est statiquement prouvable

- secret requis ;
- en-tête `x-cg-demo-api-key` limité aux appels CoinGecko ;
- aucune clé dans les en-têtes globaux de session ;
- fallback rank-complete authentifié ;
- aucune valeur de secret écrite dans le statut public ;
- dernier snapshot valide conservé sur échec.

## Ce qui reste à prouver sur le provider

Un run réel avec `COINGECKO_DEMO_API_KEY` valide doit produire :
- `status = ready` ;
- un `latest.json` plus récent ;
- puis, seulement ensuite, un nouveau CURRENT Atlas qualifié.

Ne pas forcer Atlas avant cette preuve.
