# ERITH.IA — Radar 20, portefeuille fictif à capital partagé

## Objet
Un seul portefeuille de **400 USDT**, partagé entre les **20 cryptomonnaies** sur **juillet–septembre 2026**, au lieu d'additionner les résultats de 60 tests mensuels indépendants. L'outil ne contient aucun système d'ordre, aucune clé et aucun accès à un compte de trading.

Sources : index canonique `data/trader_flux/radar20/index.json` et 60 vues mensuelles JSON. Le programme vérifie, avant le calcul, les SHA-256 de tous les fichiers mensuels, leur source native identifiée, les 2 208 heures continues de chaque actif, leurs cotations USDT et leur schéma. Les archives originales restent dans le Coffre.

## Méthode (figée pour le scénario principal)
- Signal : bougie horaire clôturée avec achats agressifs ≥ 50 %, et volume en USDT supérieur à la médiane des 24 heures précédant cette bougie.
- Entrée : prix d'ouverture de l'heure **suivante**, sans utiliser de futur.
- Sélection simultanée : priorité à la pression acheteuse puis au rapport de volume, avec départage alphabétique stable.
- 400 USDT partagés, tickets de 100 USDT frais d'entrée inclus, quatre positions simultanées maximum, une seule par crypto.
- Sortie au cours d'ouverture après 48 heures. Ne pas ouvrir en fin de jeu une position qui ne peut pas être clôturée dans les données.
- Frais : hypothèses de 0,8 %, 1,2 % ou 1,6 % aller-retour, moitié à l'entrée, moitié à la sortie. Pas de simulation fiable du spread/impact/slippage ni des tailles minimales d'ordre OKX.
- Variantes exploratoires : seuils de 50, 55, 60, 65 % et durées de 12 ou 48 h. Les 24 combinaisons ne doivent **pas** être sélectionnées sur ces résultats pour annoncer une rentabilité prédictive.

## Comparateurs
1. **Panier théorique synchronisé** : pour chaque position acceptée dans le portefeuille, même entrée, sortie, durée et montant, mais rendement moyen équipondéré des 20 cryptos sur le même créneau. Les découpes fictives de 5 USDT par crypto peuvent violer les minimums d'échange. Exposition identique, risque et faisabilité différents.
2. **Conservation passive intégrale** : 400 USDT virtuels répartis également entre les 20 actifs dès la première heure, sortis au terme de la période. Cela n'a pas la même exposition que la stratégie active ; c'est un contexte, pas une comparaison à risque identique.

## Publications
- `index.json` : manifestes et SHA-256 des résultats.
- `summary.json` : résultat, scénarios, risques, comparateurs et réserves.
- `trades.json` : 149 transactions fictives détaillées du scénario principal (nombre à recalculer à chaque exécution).
- `equity.json` : 2 208 valeurs horaires du capital fictif.

## Limites scientifiques
Les archives Binance Spot historiques **USDT** ne prouvent pas les prix d'exécution OKX ni un taux de conversion USD. Une partie de la configuration a déjà été discutée après avoir examiné les données ETH de septembre ; **ce trimestre ne constitue pas un test indépendant hors-échantillon**. Seule une expérience ultérieure sur une période inconnue et des frais/exécutions réalistes peut prétendre tester un avantage durable. Le modèle ne certifie aucune stratégie profitable et ne produit aucun signal de trading en direct.

## Reproduire
Sur GitHub, le workflow `agent-crypto-radar20-portfolio.yml` reconstitue un ZIP temporaire des 60 vues publiées, lance les tests et calcule les quatre JSON. La publication est interdite hors demande explicite (`workflow_dispatch.publish=true` ou commit portant le marqueur de publication). Une fois publiés, les résultats sont servis depuis GitHub Pages sans intervention du chat GPT.
