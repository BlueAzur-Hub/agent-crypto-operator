# Agent-Crypto @erith.IA — Protocole Livecheck FR

Version : 0.2

---

# 1. But

Empêcher l’affichage de prix inventés.

Un tableau marché n’est autorisé que si au moins une source réelle a répondu.

---

# 2. Étapes

```text
1. Tester CoinGecko.
2. Si OK, utiliser CoinGecko comme source principale marché.
3. Tester DEX Screener pour statut DEX.
4. Tester GeckoTerminal pour statut pools.
5. Tester DefiLlama pour statut DeFi.
6. Tester Binance/Kraken/Coinbase comme comparaison exchange.
7. Afficher source active et heure.
8. Si aucune source marché ne répond : refuser tableau.
```

---

# 3. Statuts

```text
OK : source répond et données exploitables.
PARTIEL : source répond mais données limitées.
ÉCHEC : source ne répond pas ou format invalide.
NON CONFIGURÉ : source nécessite une clé ou un backend.
```

---

# 4. Message d’échec

```text
ACCÈS LIVE INDISPONIBLE

Aucune source marché exploitable n’a répondu.
Aucun prix ne sera affiché.
Aucun tableau chiffré ne sera produit.
```
