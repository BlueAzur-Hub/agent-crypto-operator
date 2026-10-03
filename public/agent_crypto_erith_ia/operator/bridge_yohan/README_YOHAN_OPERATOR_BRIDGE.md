# Yohan Operator Bridge V1.0.0

Bridge local préparé pour la lignée séparée `BlueAzur-Hub/agent-crypto-operator`.

## Contrat

- rôle fixe : **operator** ;
- écoute locale seulement : `127.0.0.1:8787` ;
- Backend marché read-only : `127.0.0.1:8790` ;
- compatible avec l’entrée publique Yohan sur `blueazur-hub.github.io` ;
- mot de passe créé **sur le PC de Yohan** ; verifier scrypt stocké dans `%LOCALAPPDATA%/ERITH.IA/YohanOperatorBridge/trust/operator_auth.json` ;
- token de session : mémoire uniquement ;
- aucune clé/mot de passe dans GitHub ;
- aucune publication GitHub ;
- aucune permission wallet, retrait, ordre ou exchange privé ;
- aucun accès `owner` / Administrator accordé par ce Bridge.

## Capacités Operator

- `history.read`
- `scanner.read`
- `atlas.run`
- `aerith.run`
- `chat.run`
- `security.read`

Les routes de publication Book/Oracle Evidence et `scanner.write` ne font pas partie du contrat Yohan.

## Package local

`YOHAN_OPERATOR_BRIDGE_V1.0.0_FULL.zip`  
SHA-256 : `6dd45336225d5ad6938db3df8f778662c01d9529917ef8d20cccbe38170668d9`

Le ZIP est livré séparément comme artefact local vérifié ; il n'est pas stocké dans ce dépôt public. Son empreinte est conservée dans `BRIDGE_PACKAGE_SHA256.txt`.

## Installation sur le PC de Yohan

1. Installer Python 3 et Ollama.
2. Extraire le ZIP.
3. Lancer `bridge/CONFIGURE_YOHAN_MODEL.bat` et choisir **le modèle installé par Yohan**.
4. Lancer `START_YOHAN_STACK.bat`.
5. Lancer une seule fois `bridge/CREATE_OPERATOR_ACCOUNT.bat` pour créer le mot de passe local Operator.
6. Tester avec `bridge/TEST_BRIDGE_YOHAN.bat`.
7. Ouvrir :
   `https://blueazur-hub.github.io/agent-crypto-operator/public/agent_crypto_erith_ia/administrator/yohan.html`

## Limite importante

Ce compte Operator est **local au PC de Yohan**. Il ne crée pas une authentification distante. Si l’interface doit un jour authentifier Yohan depuis n’importe quelle machine lorsque son PC/Bridge est éteint, il faudra une autorité distante séparée. Ne jamais exposer `8787` ou `8790` directement sur Internet.
