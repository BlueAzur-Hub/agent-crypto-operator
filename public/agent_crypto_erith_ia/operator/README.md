# Agent-Crypto Operator — Yohan — 40.6.509

Cette livraison synchronise la lignée séparée `BlueAzur-Hub/agent-crypto-operator` sur le checkpoint MASTER **Administrator 40.6.509 / Market Core 38.15.11** sans recopier le runtime maître.

## Architecture

- runtime : `BlueAzur-Hub/erith-ia-memory` / Administrator 40.6.509 ;
- entrée Yohan : `administrator/yohan.html` ;
- profil local : `administrator/js/yohan-operator-profile.js` ;
- client Bridge mémoire : `administrator/js/yohan-operator-bridge-client.js` ;
- package Bridge Yohan : `operator/bridge_yohan/YOHAN_OPERATOR_BRIDGE_V1.0.0_FULL.zip` ;
- runtime partagé, aucun second moteur ;
- aucun privilège Administrator, wallet, secret public ou ordre réel.

## Règle canonique

**Vue et rôle ne sont pas la même chose.**

Vues : Classique / Intermédiaire / Administration.  
Rôles : public / operator / owner.

Le profil Yohan est `operator`, mais il ne remplace pas le nom de la vue Intermédiaire et ne transforme pas une query string en autorisation.

## Bridge local Yohan V1.0.0

Le Bridge est dérivé du socle R19/V1.9.13 mais réduit au rôle Operator :
- `history.read` ;
- `scanner.read` ;
- `atlas.run` ;
- `aerith.run` ;
- `chat.run` ;
- `security.read`.

Owner/GitHub publication, scanner write, Oracle Evidence publication, wallet et ordres sont exclus.

Le Bridge écoute uniquement sur `127.0.0.1:8787`; le Backend marché read-only 1.4.4 reste sur `127.0.0.1:8790`. Le mot de passe est créé localement sur le PC de Yohan et n'est jamais stocké dans GitHub.
