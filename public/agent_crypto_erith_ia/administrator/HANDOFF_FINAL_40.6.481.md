# HANDOFF FINAL — 40.6.481

## Acquis
- .478 : chaîne prospective Strategy réelle observée.
- .479 : Input Freshness Truth + diagnostic Atlas upstream.
- .480 : plomberie CoinGecko Demo, fail-closed si secret absent.
- .481 : récupération du lecteur Oracle Evidence par cursor, sans perte volontaire.

## Terrain à prouver
Firefox doit ouvrir Oracle → Evidence & validation sans `serialized value is too large`, avec compteur Evidence conservé.

## Après PASS
Le prochain chantier d'architecture peut séparer :
- navigateur / IndexedDB = mémoire chaude ;
- GitHub = mémoire froide durable par chunks + manifest ;
- Notion = registre humain de vérité ;
- Bridge/backend = transport authentifié.

Aucune purge locale avant écriture + relecture + hash + count vérifiés côté archive froide.
