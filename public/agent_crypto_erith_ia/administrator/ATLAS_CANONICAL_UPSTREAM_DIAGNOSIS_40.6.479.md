# ATLAS CANONICAL UPSTREAM DIAGNOSIS — 40.6.479

## Conclusion

Atlas n'est pas bloqué par son moteur CURRENT : son upstream canonique CoinGecko est **DEGRADED** et conserve volontairement le dernier snapshot valide.

## Preuves GitHub actuelles

- `data/crypto/latest.json`
  - generated_at : **2026-09-29T05:38:03.339Z**
  - snapshot_id : `coingecko-top250-usd-ecb-eur-github_2026-09-29T05:38:03.339Z`
  - assets_count : 250.
- `data/crypto/status.json`
  - status : **degraded**
  - dernier essai : **2026-09-29T23:46:38Z**
  - last_success_at : **2026-09-29T05:38:03.339Z**
  - last_error : **HTTP 403 CoinGecko**
  - preserved_last_valid : **true**.
- Les derniers commits `archive public crypto market snapshot` modifient **status.json seulement** : le producteur se réveille, échoue, puis protège `latest.json`.
- Le collecteur Top-50 indépendant est lui aussi en **HTTP 403** avec son dernier snapshot valide conservé : le symptôme est donc upstream CoinGecko / accès collecteur, pas une panne spécifique de la promotion CURRENT Atlas.

## Ce que cela explique

Le CURRENT visible peut rester fermé sur le snapshot marché du 29/09 07:38:03 local pendant que :
- Binance LIVE continue de bouger ;
- Strategy A continue ses cycles de 5 minutes ;
- les workflows de collecte continuent à se déclencher.

Le watchdog ne peut pas fabriquer une nouvelle donnée : il redéclenche le producteur, qui rencontre toujours le même 403.

## Séparation des responsabilités

- **Strategy A** : scheduler et cycles actifs indépendamment d'un nouveau CURRENT Atlas.
- **Atlas CURRENT** : ne doit être promu que sur un nouveau snapshot canonique qualifié.
- **Public Crypto Collector** : propriétaire réel de la fraîcheur du snapshot canonique.
- **Watchdog** : propriétaire du redémarrage, pas de la donnée source.

## Prochaine correction autorisée

Ne pas forcer Atlas à recalculer sur le même snapshot.

La correction doit viser **le collecteur public CoinGecko** et rester séparée de 40.6.479. Toute alternative de source doit préserver provenance, schéma et absence de valeur inventée.
