# Radar 20 — État de preuve et décision de recherche

**15 octobre 2026 · Laboratoire IA · Lecture seule · Aucun ordre réel.**

Ce document est un **point de contrôle scientifique**, pas une stratégie ni une certification de gains. Le script Node tests/radar20_scientific_gate.cjs relit les sources à chaque exécution ; utiliser le paramètre --markdown pour produire une version humaine, et node --test tests/radar20_scientific_gate.test.cjs pour les vérifications.

## Deux expériences rétrospectives indépendantes

| Période | Trades clôturés | Gain/perte nette sur 400 USDT fictifs réinitialisés | Recul maximal estimé |
|---|---:|---:|---:|
| Avril–juin 2026 | 109 | **−222,36 USDT** | **57,17 %** |
| Juillet–septembre 2026 | 149 | **+97,75 USDT** | **32,24 %** |

Règles historiques : 20 actifs Binance Spot USDT, pression acheteuse agressive ≥ 50 % sur bougie achevée, volume supérieur à la médiane des 24 heures précédentes, entrée fictive à l'ouverture de l'heure suivante, sortie 48 h après, ticket 100 USDT, au plus quatre positions, coût aller-retour **supposé** de 0,8 %. Les deux capitaux ont été **réinitialisés** : ne pas additionner ces résultats pour prétendre reconstruire un portefeuille de six mois.

La performance diverge fortement selon les périodes. Les 20 actifs ont été sélectionnés avec des informations postérieures aux dates étudiées ; les seuils ont déjà fait l'objet d'exploration. Même avril–juin n'est **pas** une véritable validation prospective hors échantillon. L'hypothèse de frais et le moteur de trésorerie peuvent modifier les transactions fictives retenues.

## Protocole prospectif gelé

Sources : data/trader_flux/radar20_forward/experiment.json, index.json et summary.json.

- Début prévu : **14 octobre 2026** ; durée **90 jours** ; univers fixe de 20 cryptomonnaies.
- Capital fictif : 400 USDT ; ticket 100 USDT ; au plus quatre positions ; durée 48 h.
- Modèle A : signal original ; modèle B : filtre de tendance sur les 72 heures connues avant le signal (seuil 3 %).
- Sensibilités de coûts hypothétiques aller-retour : 0,8 %, 1,2 % et 1,6 %.
- **État du résumé audité : 0/90 jour effectivement collecté.** Cela signifie *absence de résultat prospectif*, pas 0 % de rentabilité.
- **Fenêtre de clôture : 48 heures supplémentaires** après les 90 journées de signaux. Le collecteur conserve donc jusqu'à **92 journées sources (90 + 2)** pour permettre la sortie des dernières positions fictives. Ces deux journées ne constituent ni de nouveaux jours de signaux ni une prolongation opportuniste du protocole.
- Collecteur existant : `tools/trader_radar20_forward.py` ; programme GitHub `agent-crypto-radar20-forward.yml` avec déclenchement quotidien planifié **14:19 UTC** et déclenchement manuel, sans nécessité de redéfinir l'expérience. La première collecte effective dépend de la disponibilité des **20 archives horaires Binance et de leurs fichiers CHECKSUM** pour une même journée UTC close.

Les observations ponctuelles publiées dans data/trader_flux/radar20_execution sont distinctes. Lors de cette revue, l'index comprenait **5 observations, 16 candidats et 16 relevés de carnets OKX publics**. Ces carnets ont été observés après le début des heures de signal : ils ne démontrent ni les prix effectivement exécutables à l'ouverture, ni le slippage historique, ni les frais authentifiés du compte.

## Blocages avant toute conclusion de rentabilité

1. Obtenir 90 journées prospectives **réellement écrites et vérifiées** dans radar20_forward. Les observations horaires ne remplissent pas le compteur.
2. Ne pas modifier les paramètres gelés pendant la période ; tout changement devient une expérience distincte.
3. Distinguer les frais hypothétiques des spreads, profondeurs, minimums d'ordre et latences mesurés sur les **bonnes paires et aux bons instants**.
4. Vérifier les pertes, reculs maximaux, refus de signaux, référence comparable, exposition et données manquantes, sans remplacer une source par une autre.
5. Ne délivrer aucune certification automatique. Garder les ordres réels désactivés et le compte privé hors des archives publiques.

## Contrôle automatique et limites

Le contrôle exécutable tests/radar20_scientific_gate.cjs vérifie le protocole SHA-256, les fichiers indexés et leurs empreintes, l'intégrité des compteurs, l'absence de revendication d'ordre réel ou de frais authentifiés, la cohérence comptable des deux expériences et le nombre de jours prospectifs.

**PASS signifie « archives cohérentes et contrôles satisfaits », jamais « système rentable ».** En cas d'écart, l'exécution échoue explicitement ; le programme ne modifie ni archives, ni Trader, ni stockage Firefox, ni compte OKX.

Provenance : data/trader_flux/radar20_portfolio/summary.json ; radar20_retro_stress/summary.json ; radar20_forward/{experiment,index,summary}.json ; radar20_execution/index.json et ses observations ; radar20_regimes/RAPPORT.md.
