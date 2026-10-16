# Seven Heaven — Observateur autonome BTC / CT · PAPER uniquement

**16 octobre 2026 — Observer, comprendre, comparer ; aucun ordre de trading.**

## Un observateur qui n'attend plus Firefox

Workflow [`btc-ct-auto-paper-observer.yml`](../../../.github/workflows/btc-ct-auto-paper-observer.yml) : exécution GitHub Actions **toutes les heures vers minute 41 UTC**, sous réserve des délais/disponibilités GitHub. Un passage de développement sur `main` le déclenche aussi ; il ne nécessite pas de clic utilisateur, de Bridge démarré ni de navigateur ouvert. Les workflows de planification peuvent être retardés/suspendus par GitHub : ceci **n'est pas** un service de trading en temps réel.

**Deux marchés indépendants**, nominaux en USDT :
- BTC/USDT · bougies Spot Binance clôturées, source publique `data-api.binance.vision/api/v3/klines`.
- CT-USDT · bougies Spot OKX clôturées (`confirm=1`), source publique `www.okx.com/api/v5/market/candles`.

Le programme vérifie 48 heures consécutives et au moins 48 bougies complètes, une dernière clôture de moins de 2 h 30, des prix et volumes cohérents. **Aucune interpolation** en cas de réponse absente, source vieillie ou trou horaire.

## Deux hypothèses de stratégies PAPER (indépendantes du Radar 20)

1. **REBOND** : clôture sous moyenne mobile 24h d'au moins 1,5 %, après une baisse puis une première clôture supérieure à la précédente ; volume de la dernière heure au moins 1,2 fois le volume médian des 24 heures antérieures.
2. **BREAKOUT** : moyenne mobile 12h supérieure à la moyenne 36h, clôture au-dessus du plus haut des 24 précédentes d'au moins 0,1 %, volume supérieur à 1,32 fois la médiane des 24 heures antérieures.

Un signal n'est pas une exécution : `PAPER_SIGNAL` reste **en attente** jusqu'à une nouvelle clôture horaire. Une entrée fictive utilise ce **relevé ultérieur**, jamais un prix de clôture déjà connu au moment de décider. Un trou de données fait expirer la proposition, sans remplir un prix imaginaire.

**Modèle d'ordre virtuel** : achat fictif de 5 USDT par actif, frais supposés 0,2 % à l'entrée et 0,2 % à la sortie, spread total 0,1 %, glissement 0,1 % de chaque côté. Un seul scénario ouvert par actif ; cible de hausse 3 % sur REBOND ou 4 % sur BREAKOUT ; seuil de perte si recul d'au moins 2 %, sortie au bout de 24h. Les seuils sont calculés sur les **clôtures horaires**, pas des ordres stop exécutables intra-bougie. Il est possible de sortir fictivement plus bas que le seuil de perte.

Journal `data/trader_flux/btc_ct_auto_paper/state.json` et `journal/YYYY-MM-DD.json` : décisions WAIT, PAPER_SIGNAL, PAPER_OPEN, HOLD_PAPER, EXIT_PAPER et GAP_PAUSE, horodatage, source, cours, raisons et résultat après coûts simulés.

## Les interdits

- Aucun endpoint privé OKX, aucune clé API, aucun compte personnel, aucune route d'ordre, aucun ordre réel, aucun retrait.
- Le capital est entièrement fictif en **USDT**, pas les USDC de l'utilisateur ; taux de change USDT/USDC **non présumé**, tailles minimales et disponibilité du carnet non vérifiées.
- Modèle exploratoire non optimisé ni certifié : pas de promesse de gains. Aucune stratégie ne commence à négocier des fonds réels après une période de simulation, même positive.
- Le protocole Radar 20 de 90 jours reste **inchangé**. Ses échecs rétrospectifs et les données prospectives manquantes sont importants ; cet observateur constitue un **autre** cas d'école.

## Validation

`python -m unittest discover -s public/agent_crypto_erith_ia/tools -p test_btc_ct_auto_observer.py -v`

Le CI teste l'absence d'accès aux ordres, le refus d'une API non admise, les bougies encore ouvertes, les identités BTC/CT, trous de série, fraîcheur, stratégies REBOND / BREAKOUT, chronologie signal → entrée prospective → sortie, coûts, refus des doublons et des données invalides.

**Premier passage après fusion** : vérifier GitHub Actions et `state.json`. Une archive `SOURCE_UNAVAILABLE` correspond à une API indisponible depuis le runner, pas à un marché calme. Un résultat de backtest ne doit jamais être reconstruit à partir des décisions enregistrées. La fréquence horaire ne permet pas une stratégie de scalping minute.

La consultation humaine ne crée aucune action sur OKX. Pour une exécution future, prévoir un service local séparé (paper broker → order adapter) avec secrets hors GitHub public, autorisations explicites, limites de perte, stops de sécurité, taille mini par paire et bouton d'arrêt matériel. **Aucun de ces modules d'exécution n'est livré ici.**
