# Yohan Operator — 40.6.509 + Bridge local V1.0.0

Repository Operator canonique : `BlueAzur-Hub/agent-crypto-operator`.

Runtime partagé : `BlueAzur-Hub/erith-ia-memory` / Administrator **40.6.509** / Market Core **38.15.11**.

## Deux axes distincts

- vues : Classique / Intermédiaire / Administration ;
- identités : public / operator / owner.

Le profil Yohan n'autorise jamais une session `owner`. Un paramètre URL n'est pas une authentification.

## Bridge Yohan

- rôle fixe : `operator` ;
- local uniquement : `127.0.0.1:8787` ;
- Backend read-only : `127.0.0.1:8790` ;
- mot de passe local, verifier scrypt hors dépôt public ;
- token mémoire uniquement ;
- aucune publication GitHub ;
- aucun wallet / retrait / ordre / API exchange privée ;
- modèle Ollama choisi localement par Yohan.

Package : `operator/bridge_yohan/YOHAN_OPERATOR_BRIDGE_V1.0.0_FULL.zip`.

Ce Bridge n'est pas une autorité distante. Ne jamais exposer 8787/8790 publiquement.
