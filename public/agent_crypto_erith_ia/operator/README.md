# Agent-Crypto Operator — Yohan — 40.6.491

Cette livraison synchronise le dépôt séparé `BlueAzur-Hub/agent-crypto-operator`
avec le checkpoint canonique **Administrator 40.6.491 / Market Core 38.15.11**
sans recopier le runtime maître.

## Architecture

- runtime : `BlueAzur-Hub/erith-ia-memory` / Administrator 40.6.491 ;
- profil : couche locale `administrator/js/yohan-operator-profile.js` ;
- runtime partagé, aucun second moteur ;
- Operator 40.6.407 reste conservé comme historique / rollback.

## Contrat 40.6.491 hérité du MASTER

- Oracle Evidence : archivage AUTO séquentiel avec démarrage single-flight ;
- progression comptée depuis le watermark VERIFIED jusqu'à la cible figée ;
- rétention locale uniquement par chunk VERIFIED complet ;
- comparaison valeur exacte + suppression dans une seule transaction IndexedDB readwrite ;
- HOT minimum : 10 000 Evidence locales ;
- suppression automatique : désactivée ;
- Market Core 38.15.11 inchangé ;
- aucun ordre réel / wallet / privilège Administrator ajouté.

## Preuve terrain MASTER observée avant cette livraison

- archivage AUTO : 418 / 418 · 1 chunk VERIFIED · publication exacte PASS ;
- canari rétention : 500 lignes supprimées ; 10 023 restantes ;
- SHA local = SHA public = SHA manifest ;
- aucun chunk supplémentaire éligible après le canari.

## Sécurité Operator

Le paramètre URL n'est pas une authentification.
La couche Yohan n'accorde aucune session Administrator, aucun wallet et aucun trading réel.
