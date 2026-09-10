# Pack — ERITH.IA Yohan Crypto Auto-Agent FR V1.2

Ce pack contient le fichier maître :

```text
erith_ia_yohan_crypto_auto_agent_fr_v1_2.md
```

## Nouveauté V1.2

Cette version corrige le problème observé dans AnythingLLM :

```text
Le modèle ne doit plus créer de tableau hypothétique.
```

Règle dure :

```text
Pas de source live, pas de prix.
Pas de données récupérées, pas de tableau.
Pas de synthèse hypothétique chiffrée.
```

## Test rapide dans AnythingLLM

Utiliser :

```text
@agent fais une recherche web.

Utilise des sources actuelles comme CoinGecko ou CoinMarketCap.

Donne-moi les 20 principales cryptomonnaies actuelles avec :
- rang ;
- nom ;
- symbole ;
- prix actuel ;
- variation 24h ;
- variation 7j ;
- volume 24h ;
- market cap ;
- source ;
- heure approximative des données ;
- décision de veille.

Important :
si tu n’as pas accès au web ou aux données live, ne crée aucune table hypothétique.
Réponds seulement :
“Accès live indisponible, données non récupérées.”
```

## Commande de diagnostic

```text
/livecheck
```

Elle doit répondre :

```text
Accès web/API :
Source live consultée :
Données récupérées :
Statut :
```

## Résultat attendu si l’accès live ne fonctionne pas

```text
ACCÈS LIVE INDISPONIBLE

Je n’ai pas récupéré de données de marché en temps réel.
Je ne dois pas inventer de prix, de volume, de market cap ou de classement.
```

## Règle centrale

```text
Information → Validation → Risque → Position.
Jamais l’inverse.
```
