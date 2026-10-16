# Laboratoire IA — Cas d’école CT / Concrete
**Dossier documentaire public · constat au 14 octobre 2026 · lecture seule**

## 1. Identité et fonction
- **Jeton** : Concrete (CT), projet de gestion d’actifs on-chain et de stratégies DeFi.
- **Identifiant CoinGecko** : `concrete` ; contrat cité dans l’annonce de cotation OKX : `0x0A092E544DA31150b439a1aAA1A3a2214a867F46`.
- **Première cotation Spot OKX CT/USDT** : 30 septembre 2026 à 10 h UTC (annoncée par OKX). Le 14 octobre, cette cotation a environ deux semaines, pas seulement deux ou trois jours.
- **Offre maximale annoncée** : 1 milliard de CT (CoinGecko). L’offre circulante et la capitalisation réelle ne doivent pas être inventées si la source ne les fournit pas.
- **Sources** : [Concrete officiel](https://concrete.xyz/), [OKX annonce de cotation CT/USDT](https://www.okx.com/en-us/help/okx-to-list-ct-usdt-concrete-for-spot-trading), [CoinGecko Concrete](https://www.coingecko.com/en/coins/concrete).

## 2. Preuves de marché horodatées (captures utilisateur)
Les valeurs ci-dessous ne sont **pas des cotations actuelles**. Elles n’ont pas été rapprochées d’une archive 1m certifiée.

| Capture / fenêtre | Indication | Nature exacte |
| --- | --- | --- |
| 13 octobre 2026 ~22h54 | CT/USDT, OKX, 15 min, 300 bougies | Historique externe du graphique de Bougies |
| Même capture | Meilleure offre acheteuse 0,362 USDT ; meilleure vendeuse 0,36219 USDT | Carnet OKX, instantané |
| Même capture | Écart 0,00019 USDT, soit 5,25 points de base (annoncés) | Indication du carnet, pas un coût garanti |
| Même capture | 20 meilleurs acheteurs 39 837,81 USDT ; vendeurs 20 654,02 USDT | Profondeur des vingt niveaux ; chiffres éphémères |
| 13 octobre ~23h35 | CT : 0,360092 $US ; +0,43 % sur 24 h ; bas 0,341794, haut 0,409361, 300 points | Courbe externe 24h en USD affiché, source OKX CT/USDT et USDT/USD |
| 13 octobre ~23h45 | CT : 0,36247 $US ; +16,71 % sur 7 jours ; bas 0,307567, haut 0,405832 | Série externe 7j, 300 points, **pas** une promesse de rendement |
| 14 octobre ~00h15 | Bougie CT/USDT 15 min en cours, ouverture/haut/bas/clôture autour de 0,36043 USDT et volume 100 CT | Bougie non terminée : ne pas la traiter comme clôturée |
| 14 octobre ~00h40 | Cas CT/USDC conservé par le Trader | Instrument du **compte privé**, distinct de la courbe publique CT/USDT |

Attention : les snapshots datés sont différents. Leurs variations, prix et écarts peuvent diverger légitimement. Aucune valeur n’est promue comme une cotation *live* dans ce document.

## 3. Quatre vérités à ne pas confondre
1. **CT/USDT Spot OKX** : instrument observé dans les Bougies et la Profondeur ; cotation et carnet exprimés en USDT.
2. **CT/USDC Spot OKX** : instrument lié à la position réelle étudiée ; ne pas lui attribuer automatiquement le spread CT/USDT.
3. **USD d’affichage** : prix éventuellement converti depuis USDT par une source de change explicite ; le symbole « $US » ne transforme pas l’instrument en CT/USD.
4. **Archives historiques vérifiées** : les 300 points d’une vue externe n’impliquent pas 300 bougies natives 1m ni plusieurs mois complets certifiés au Coffre Top 250.

## 4. Enseignements sur l’exécution
- Un minimum de **10 CT** a été affiché sur le formulaire Spot dans une observation de terrain. Ce minimum peut dépendre de la paire, du mode d’ordre et des règles du marché ; il n’est pas universel.
- Un convertisseur peut proposer une sortie alors qu’un formulaire Spot impose un minimum. Une cotation de conversion et les meilleures offres du carnet ne garantissent pas le même montant net.
- Le « 0 frais » affiché par une conversion ne prouve pas l’absence d’écart intégré au taux de conversion.
- Une **vente limite** au-dessous de la meilleure offre acheteuse peut être exécutée immédiatement : ce n’est pas un ordre de protection « stop ».
- La simulation doit consigner l’heure, la source, la paire, la quantité hypothétique, les frais, le glissement et les contraintes de minimum.

## 5. Risques et questions non résolues
- **Marché jeune et volatil** : amplitudes élevées constatées sur plusieurs fenêtres ; cela ne prévoit pas la prochaine direction.
- **Liquidité** : vérifier les niveaux du carnet et le montant réellement exécutable, pas uniquement la dernière transaction.
- **Tokenomics** : calendrier de déblocage, proportion circulante et détention concentrée à vérifier auprès de sources spécialisées ; ne pas déduire de chiffres de l'offre maximale.
- **Source et latence** : les vues CT peuvent provenir d’OKX, la conversion USD de CoinGecko ; leurs timestamps doivent être séparés.
- **Position personnelle** : tous les montants, soldes, prix d’acquisition et frais propres au compte restent **dans le Bridge/Trader local en lecture seule**. Aucun de ces champs n’est reproduit dans GitHub.

## 6. Expériences pédagogiques proposées
- **A — Observer** : comparer CT/USDT et CT/USDC sur un même instant ; noter profondeur, spread, taille exécutée possible et latence.
- **B — Simuler** : comparer une transaction fictive au marché, une limite, et une conversion fictive, après frais et glissement.
- **C — Vérifier** : enregistrer une hypothèse *avant* l’issue, puis relever le résultat sur 15 min, 24h et 7j si la couverture existe.
- **D — Évaluer la robustesse** : faire le même exercice sur BTC et Q ; comparer les erreurs et la variance, y compris les cas perdants.

**Pas de signal de trading, pas d’ordre réel, pas de conseiller automatique.** La décision et toute exécution éventuelle restent humaines.

## 7. Pourquoi le tableau « Historique vérifié » pouvait rester vide

**Observation Firefox (14 octobre, 03h05)** : CT/USDT affichait une courbe de 300 points alors que la sélection globale Market correspondait à **Q**, et que le dossier Laboratoire était **BTC épinglé**.

- Le lecteur **R9 / Univers / Top50** recherche uniquement une archive Binance vérifiée de la **sélection Market** (ici Q). « Q · archive non disponible » ne signifie pas que la courbe CT a disparu.
- Le graphique externe **CT/USDT (OKX)** conserve ses points dans son propre propriétaire. Avant la correction proposée 40.6.636, le lecteur du tableau complémentaire n'acceptait que le courtier CoinGecko natif, ce qui rendait CT invisible malgré son graphique.
- Le panneau proposé affiche les points du **graphique externe consulté** en séparant visiblement son identité de Q. Si les points ont été convertis en USD, la conversion **USDT/USD CoinGecko doit être attestée dans la provenance** ; sinon seules les clôtures natives cotées USDT d'un propriétaire Bougies vérifié par paire sont admissibles.
- Le lecteur n'importe aucun chiffre du dossier documentaire comme cours live, ne crée aucune archive manquante, ne remplace pas l'actif Q par CT et ne touche ni au compte OKX ni aux bougies originales. Sans données chargées et identifiables, l'état reste indisponible.

**Contrôle terrain après déploiement** : ouvrir CT dans le graphique, sélectionner Q dans Market, ouvrir l'historique vérifié et relever séparément « Q · archive indisponible » et « graphique externe CT » avec provenance, nombre de points et prix. Vérifier également le cas de la sélection CT : aucune donnée BTC/Q ne doit être injectée.
