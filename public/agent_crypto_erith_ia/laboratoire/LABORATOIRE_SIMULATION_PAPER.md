# Laboratoire PAPER — BTC et CT (Seven Heaven)

**Statut : expérimentation pédagogique locale, sans ordre et sans autorisation Strategy A.**

## Utilisation dans le Trader

1. Sélectionner **BTC Solo, 24h, USD** et attendre que le graphique affiche une série CoinGecko datée, puis descendre dans **LABORATOIRE PAPER · BTC / CT** et cliquer sur **Capturer la source**.
2. Cliquer sur **Simuler −5 / 0 / +5 %** pour voir une quantité fictive, le seuil de rentabilité après coûts et les résultats nets hypothétiques.
3. Sélectionner **CT dans Nouveaux listings**, vérifier que la courbe native OKX CT/USDT affiche son historique USD converti explicitement par USDT/USD CoinGecko, puis répéter.
4. Pour un suivi prospectif, cliquer sur **Ouvrir scénario prospectif** au moment de la première observation. Lors d'une consultation ultérieure, sélectionner **le même actif avec une nouvelle série horodatée**, puis **Évaluer sur un nouveau relevé**. Une même cotation ou une paire/fournisseur différent déclenche un refus.
5. Copier volontairement le journal si une conservation est souhaitée. Aucun export n'est automatique ; le journal est uniquement en mémoire et disparaît lors de la fermeture.

## Correction terrain et automatisme facultatif (16 octobre)

- **Problème observé dans Firefox** : le laboratoire refusait une série CT réelle pourtant affichée, avec « CT/USDT et conversion USDT/USD CoinGecko non démontrés ». Cause établie : le propriétaire externe publie la paire sous la forme `CT/USDT` alors que le laboratoire exigeait `CT-USDT`. Ces deux formes sont maintenant normalisées de façon restrictive ; `CT/USDC` ne passe toujours pas.
- Le propriétaire de la ligne précise désormais la conversion `USDT/USD CoinGecko` chaque fois que la devise affichée diffère de la devise du marché, **y compris si le coefficient vaut exactement 1**. La provenance reste requise.
- **Démarrer Auto PAPER** : consentement explicite dans le panneau ; écoute seulement les événements des graphiques déjà chargés (BTC 24h CoinGecko USD et CT ligne native OKX/USD). Aucune interrogation réseau supplémentaire ni capture de solde OKX.
- Première observation valide : simulation des trois mouvements et ouverture d'un T0 fictif pour l'actif sélectionné ; observation ultérieure de la même paire/source **après au moins 5 minutes de temps de marché** : résultat fictif et écriture au journal ; le cycle peut repartir avec un nouveau T0, dans la limite de **20 observations par session**.
- **Arrêter Auto PAPER** : arrêt immédiat des captures, sans effacer le journal de la session. F5 et fermeture arrêtent également l'automatisme ; il ne fonctionne pas en arrière-plan quand le Trader est fermé.
- Ce n'est **pas** un robot autonome de surveillance simultanée BTC/CT : sans nouvelle série publique déjà publiée pour l'actif sélectionné, l'observateur attend. Aucun score d'ordre, aucune stratégie exécutée, aucun clic OKX.

## Modèle de calcul

- Capital par défaut **5 USD fictifs** ; ne lit **aucun** solde réel du Bridge.
- Les frais d'achat et de vente, le spread total et le glissement **par côté** sont des hypothèses réglables par l'humain.
- Prix d'achat fictif = prix observé × (1 + spread/2 + glissement).
- Quantité fictive = (capital × (1 − frais d'achat)) / prix d'achat fictif.
- Recette fictive à la revente = quantité × prix futur × (1 − spread/2 − glissement) × (1 − frais de vente).
- Résultat = recette fictive − capital ; les scénarios utilisent des déplacements de cours de **−5 %, 0 % et +5 %** et calculent le point mort.
- **USD, USDC et USDT ne sont pas déclarés équivalents**. Les simulations sont en USD notionnels, pas en USDC réellement négociables.
- Ni minimum Spot, ni profondeur du carnet, ni frais effectifs Convert, ni éligibilité d'ordre ne sont prouvés. Le simulateur ne génère aucun signal.

## Provenance et exclusions

- BTC accepte uniquement le **graphique public BTC 24 h USD CoinGecko** prêt et concordant.
- CT accepte uniquement la courbe **OKX CT/USDT** déjà publiée par le propriétaire Nouveaux listings, avec conversion explicite USDT/USD CoinGecko ; aucun autre symbole ne s'y substitue.
- La dernière observation doit dater de moins de **15 minutes** et contenir **au moins 21 points positifs strictement ordonnés**. Pas de repli sur un prix fictif si elle échoue.
- Lecture des propriétaires existants ; **pas de fetch supplémentaire**, pas de nouvelle base de marché, pas de stockage du compte privé et pas de Bridge appelé.
- Le composant n'active pas Strategy A Paper Auto, ne modifie aucun gate et ne dispose d'aucune route Trade/Withdraw.

## Liste d'anomalies non bloquantes (reportées)

- **Math Core CT/USDT** : malgré le correctif de source de la PR #420, la capture Firefox du 16 octobre vers 02:35 affiche encore « aucune série complète, assez récente et identifiée ». **Ne pas relancer maintenant une série de correctifs Math Core ; faire un audit isolé plus tard** (propriétaire de la ligne, horodatage, identité, événements).
- Conserver l'invariant **BTC Math ≠ CT Math**, même en cas de panne.
- L'affichage du cours BTC a été clarifié par PR #421 (snapshot CoinGecko daté / ancien). Il ne prétend pas être un ordre exécutable.
- Le rapprochement du cycle CT est visible sur le Bridge 1.9.16 avec une différence arithmétique positive, mais la classification automatique de l'opération **Convert classique** reste à démontrer ; aucun résultat de ce compte privé n'est injecté dans ce laboratoire.

## Prochaine phase après test terrain

Collecter plusieurs observations prospectives **gagnantes, perdantes et refusées** par BTC et CT. Comparer la distribution des écarts après coûts, l'ancienneté des séries et les cas où aucune décision ne pouvait être établie. Une première simulation ou un gain historique ne prouve ni rentabilité future ni possibilité d'exécuter des ordres.
