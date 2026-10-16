# Radar 20 — Observatoire public d'exécution (lecture seule)

Le programme `observe_radar20_execution.py` accompagne l'expérience figée Radar A/B,
**sans modifier ses règles, son capital, ses ordres fictifs ou ses résultats**.
Il est exécuté par GitHub Actions à 07 minutes après chaque heure UTC du 14 octobre
2026 au 11 janvier 2027 inclus (90 jours, arrêt le 12 janvier UTC).

- Binance Spot : récupère 73 chandelles horaires fermées par paire pour 20 paires
  *USDT*, vérifie la continuité, le volume et les achats agressifs ; calcule la
  tendance médiane 72h et repère les *candidats* des Radars A et B.
- OKX public : pour les seules paires candidates, photographie le carnet Spot
  `GET /api/v5/market/books`, simule l'achat et la revente de 100 USDT sur la
  **profondeur affichée**. Ne mesure ni frais privés du compte ni exécution réelle.
- Journal immuable : `data/trader_flux/radar20_execution/index.json` et un fichier
  par heure, avec empreintes SHA-256, date de la décision théorique, heure effective
  de l'observation, succès/erreurs. Aucun événement n'est reconstruit a posteriori.
- Si le déclenchement dépasse **45 minutes après l'heure**, il archive une
  interruption `TOO_LATE_FOR_OBSERVATION` plutôt que de fabriquer un carnet ancien.
- Si les 20 séries Binance sont incomplètes, aucun signal global A/B n'est publié.
- Les candidats de signal ne sont **pas** des transactions acceptées par un
  portefeuille : limites de capital, positions déjà ouvertes, risques et taille
  minimum OKX ne sont pas évalués par cet observateur.
- Les frais authentifiés mesurés localement sur le Bridge **restent sur le PC**.
  Ne jamais enregistrer mot de passe, jeton, clé API ni soldes dans les journaux publics.

## Limites importantes

Les horaires `cron` de GitHub Actions peuvent être retardés ou manqués.
La mesure OKX est postérieure à l'ouverture de l'heure de décision, et **ne prouve
pas le prix disponible au moment du signal**. La disparité Binance-USDT vs OKX-USDT
et les détails de remplissage (lot, tailles minimales, latence, latéralisation,
impact de marché) restent à contrôler. Le taux taker 0,2% mesuré pour un compte
le 13 octobre ne s'applique pas automatiquement à toutes les heures futures.

Ni collecte de données privées, ni transaction réelle, ni branchement automatique
sur la page Trader 40.6.625. Ceci est une couche de preuve supplémentaire.
