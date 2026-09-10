# Agent-Crypto @erith.IA — Protocole Live Data FR

Version : 0.2

---

# 1. Règle prioritaire

```text
Pas de source live réellement consultée = pas de prix.
```

L’application ne doit jamais précharger des faux prix.

Elle ne doit pas contenir de tableau statique présenté comme marché réel.

---

# 2. Sources directes côté navigateur

À tester en priorité :

```text
CoinGecko
DEX Screener
GeckoTerminal
DefiLlama
Binance public ticker
Kraken public ticker
Coinbase public market data
```

Ces sources peuvent échouer selon :

```text
CORS
quota
rate limit
changement d’endpoint
blocage régional
panne temporaire
```

---

# 3. Sources avec clé / secret

Ne jamais mettre dans GitHub Pages :

```text
clé CoinMarketCap
clé Etherscan
clé Token Sniffer
clé privée GoPlus si nécessaire
clé d’exchange
clé wallet
seed phrase
```

Si une source demande une clé :

```text
utiliser proxy backend privé
ou export manuel
ou ne pas l’intégrer au prototype public
```

---

# 4. Livecheck

Format attendu :

```text
LIVECHECK — AGENT-CRYPTO @erith.IA

Accès live : oui / non / partiel
Sources testées :
- CoinGecko : OK / ÉCHEC / PARTIEL
- DEX Screener : OK / ÉCHEC / PARTIEL
- GeckoTerminal : OK / ÉCHEC / PARTIEL
- DefiLlama : OK / ÉCHEC / PARTIEL
- Binance : OK / ÉCHEC / PARTIEL
- Kraken : OK / ÉCHEC / PARTIEL
- Coinbase : OK / ÉCHEC / PARTIEL

Source principale active :
Heure approximative des données :
Données récupérées : oui / non / partiel
Décision : afficher / refuser / afficher partiel
```

---

# 5. Normalisation interne

Chaque actif doit être normalisé ainsi :

```json
{
  "rank": 1,
  "name": "Bitcoin",
  "symbol": "BTC",
  "price": 0,
  "change24h": 0,
  "change7d": 0,
  "marketCap": 0,
  "volume24h": 0,
  "source": "CoinGecko",
  "timestamp": "ISO-8601"
}
```

Si une donnée manque :

```text
null
```

ou :

```text
Donnée manquante
```

Jamais une estimation.
