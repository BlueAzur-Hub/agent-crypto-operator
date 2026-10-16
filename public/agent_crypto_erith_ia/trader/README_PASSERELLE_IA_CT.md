# ERITH.IA — Passerelle IA commune, pilote CT (lecture seule)

Premier incrément : un modèle de réponse commun pour le Trader et les autres IA, alimenté depuis les routes déjà existantes du Bridge 1.9.16 et du Backend 1.4.6.

## Architecture respectée

- **Trader** : la page `trader/trading-desk.html` charge déjà l'Administrator vivant dans une iframe same-origin. Aucun duplicata des propriétaires du Graphique/Market/Math Core.
- **Panneau pilote** : fichiers `ai-ct-*` isolés **dans le document parent Trader**, sans écrire dans l'iframe Administrator. Le panneau n'interroge les données que sur clic explicite « Lire ma position CT ».
- **Bridge local 127.0.0.1:8787** : session propriétaire préexistante Aether Trust ; les seules routes privées GET utilisées sont `/okx/account`, `/okx/fills` et `/okx/fees?instId=CT-USDC`.
- **Backend local 127.0.0.1:8790** : GET public `/market-book?provider=okx&instrument=CT-USDC&limit=100`.
- **Coffre GitHub** : source commune des historiques publics ; **aucune donnée privée du compte n'y est déposée**.

## Preuves et garde-fous

- Distinction explicite CT/USDC (transaction réelle) et CT/USDT (bougies de l'Interface). Aucune conversion implicite entre USD, USDT et USDC.
- Solde CT tiré de la balance authentifiée. Frais d'achat tirés des transactions OKX récentes. Si une transaction, sa commission ou une conversion manque, « coût d'acquisition non confirmé ».
- Le prix de revente est illustratif : le programme simule la consommation des quantités acheteuses du carnet OKX, avec frais taker authentifiés et une ancienneté maximale de 20 s.
- Les balances >120 s, les carnets incomplets, les devises divergentes et les prix non traçables sont rejetés : **ne pas calculer de gain faux**.
- Le programme ne sait ni transmettre des ordres, ni transférer des fonds, ni publier des informations privées sur GitHub. Le bouton « Copier » place seulement un résumé privé dans le presse-papiers du PC, sur demande explicite.
- Le modèle normalisé est disponible comme `globalThis.AgentCryptoAiCtContract` au sein du Trader ; **ce n'est pas encore une API réseau pour ChatGPT**.
- Le test de sécurité réel nécessite le Bridge et le Backend actifs sur le PC. Aucun test local simulé ne démontre à lui seul que la connexion fonctionne en Firefox.

## Vérifications

`node --test public/agent_crypto_erith_ia/trader/test-ai-ct-contract.cjs`

## Prochaine étape, après la preuve en Firefox

Étendre le contrat commun aux actifs sélectionnés, exposer un endpoint local versionné au moteur Atlas/Aerith avec permissions explicites, puis seulement ensuite préparer une passerelle volontaire vers ChatGPT via une connexion autorisée. **Ne jamais exposer 127.0.0.1 publiquement, ni les jetons de session, ni les historiques personnels sur GitHub Pages**.
