# ERITH.IA · Cas d'école DNA / NeoSoul — étude PAPER sur 48 heures

**Statut initial : en attente du premier relevé Spot public vérifié.** Il n'y a **aucun ordre réel**, aucun accès au Bridge ou au compte OKX, et aucun rendement inventé.

[Ouvrir le tableau de bord DNA](dna-paper.html) · [État JSON public](../data/trader_flux/dna_paper/state.json) · [Méthode / source du programme](../tools/neosoul_dna_paper.cjs)

## 1. Objet de l'expérience

Étudier le tout début de cotation d'un jeton dont le symbole peut avoir plusieurs homonymes :

- **Projet annoncé** : NeoSoul, symbole `DNA`, sur BNB Chain.
- **Contrat cité par Bitget** : `0xA991F61940095AEA0724ef54077223B048c5CF7b`.
- **Annonce officielle** : [Bitget, 15 octobre 2026](https://www.bitget.com/support/articles/12560603897627).
- **Début annoncé DNA/USDT Spot** : 16 octobre 2026 **11:00 UTC**.
- **Instrument étudié** : `DNAUSDT`, catégorie **SPOT**, chez Bitget ; **pas** `DNAUSDT` contrat perpétuel, **pas** une paire DNA/USDC inventée.
- **Conversion de la monnaie fictive** : `USDCUSDT` Spot chez le **même** fournisseur Bitget. Les deux actifs stables ne sont pas supposés avoir une parité parfaite.
- L'annonce Bitget identifie le projet et son contrat ; le carnet API identifie la *paire de cotation*, pas directement l'adresse du contrat à chaque observation. Cette distinction de provenance est conservée.

## 2. Trois scénarios indépendants

| Scénario | Capital fictif initial | Durée | Mécanique |
| --- | ---: | --- | --- |
| Micro | 10 USDC | 48 h | USDC→USDT→DNA au carnet Spot vérifié ; clôture hypothétique inverse |
| Intermédiaire | 25 USDC | 48 h | Même instant d'entrée, quantité distincte |
| Référence | 100 USDC | 48 h | Même instant, impact du carnet plus important potentiellement |

Il s'agit de **trois expériences séparées**, non de 135 USDC réellement dépensés. Aucun levier, bot, dépôt ni retrait.

Les entrées sont **fixées au premier carnet recevable observé après publication** : pas de reconstruction des meilleures cotations passées, pas de sélection a posteriori du creux. Si un montant dépasse la profondeur visible, est inférieur au minimum d'ordre ou contrevient à la précision du symbole, le scénario est noté `blocked`, sans opération fictive. Il ne reçoit **pas** une deuxième chance d'acheter ultérieurement à un meilleur prix.

La clôture a lieu **au premier relevé réellement vérifié au moins 48 h après ce T0**. Le programme conserve le vrai moment de clôture : il ne prétend pas que la cotation exacte à T0+48h était connue entre deux collectes.

## 3. Données et modèle de prix

Sources publiques Bitget v3, catégorie `SPOT` :

- `/api/v3/market/instruments?category=SPOT&symbol=DNAUSDT` et `...USDCUSDT` : identité, statut online, montant minimum, précision.
- `/api/v3/market/orderbook?category=SPOT&symbol=DNAUSDT&limit=100` et `...USDCUSDT` : côté vendeur/acheteur du carnet, niveau, quantité, horodatage.
- Aucune cotation Market CoinGecko, graphique DNA historique ou prix d'une autre place n'est substitué au carnet.
- Les carnets doivent être cohérents, non croisés et dater de **120 secondes maximum**.

Les frais, faute de tarification du compte (aucune clé utilisée), sont des **hypothèses de calcul, jamais les frais réellement garantis** :

| Opération | Hypothèse appliquée |
| --- | ---: |
| Conversion fictive USDC→USDT | 0,10 % |
| Achat fictif DNA | 0,10 % |
| Vente fictive DNA | 0,10 % |
| Conversion fictive USDT→USDC | 0,10 % |

L'achat est calculé en consommant successivement les offres vendeuses (`asks`) du carnet, la vente au cours des offres acheteuses (`bids`). L'achat intègre la précision maximale du jeton, mais **ne constitue pas un émulateur complet des ordres réels** : quantité et devise réelles des frais, limites dynamiques, latence et exécution partielle restent à qualifier. La disponibilité du carnet à un instant ne garantit jamais une exécution.

Évolution du résultat PAPER : `USDC hypothétiques récupérables après vente et reconversion − USDC fictifs initiaux`.

Un résultat `unpriced` signifie carnet insuffisant ou minimum de sortie non respecté, **pas** une perte de 100 % inventée. Le programme n'omet pas les cas perdants ou bloqués.

## 4. Collecte prospectivement horodatée

- Un [workflow GitHub Actions](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/workflows/seven-dna-paper.yml) est prévu toutes les **4 heures** environ, avec un premier déclenchement après fusion.
- Il écrit uniquement [l'état public JSON](../data/trader_flux/dna_paper/state.json), en taille bornée par la fenêtre de 48h ; jamais d'identifiants financiers.
- **Si l'API échoue, aucune observation n'est fabriquée** : le workflow signale l'erreur et l'état précédent reste inchangé.
- Le tableau de bord lit le JSON publié et affiche les trois scénarios, les écarts et la fraîcheur.
- La collecte et l'expérience sont closes après une observation admissible au-delà du terme. Elle ne recommence pas automatiquement.

Les publications GitHub Pages peuvent être différées. La présence d'une annonce Bitget ne constitue pas une capture de carnet. Tant qu'aucune capture n'a été exécutée et archivée, l'étude est `waiting_source`.

## 5. Portée pour Aerith, Atlas et le Trader

Ce cas complète **CT / Concrete** sans toucher à sa position, au Trader 40.6.640, au Market Core 38.15.11, au Radar ni au Bridge R22.

À l'issue des 48 heures, les IA pourront comparer :

- la marge théorique après **deux passages de spread** (DNA et USDC/USDT) et les frais estimés ;
- l'écart de résultat selon 10 / 25 / 100 USDC ;
- les trous de données, limites de liquidité, tailles bloquées, dates et provenance ;
- la variation du prix **réellement exécutable théorique** vs la variation spectaculaire affichée par le Radar.

L'existence du cas DNA n'est **pas un signal d'achat** ni la preuve que DNA Spot est disponible sur OKX en Europe. La surveillance indépendante de sa disponibilité OKX reste distincte.
