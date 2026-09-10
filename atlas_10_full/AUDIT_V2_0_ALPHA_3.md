# AUDIT — Forge d’Aerith Pro V2.0-alpha.3 Unified

## Objectif

Supprimer la dérive UX de V2.0-alpha.2 : deux formulaires successifs, deux mémoires JavaScript et plusieurs champs redemandés.

## Correction principale

La Forge utilise désormais un parcours unique en huit étapes :

1. Point de départ
2. Mission et identité
3. Multi-agents
4. Héritages et modules
5. Persona et limites
6. Proposition
7. Sources canonisées
8. Audit et export

## Doublons supprimés

- suppression de l’interface séparée « Conception » / « Compilation » ;
- suppression de `designer.js` ;
- suppression de `designer-data.js` ;
- un seul objet d’état dans `app.js` ;
- nom, famille, rôle, héritages, modules, Persona et garde-fous saisis une seule fois ;
- la phase d’import réutilise les données de conception ;
- une seule barre de progression.

## Modules

- aucun nouveau module créé ;
- aucun dossier `modules/` copié dans la nouvelle Forge ;
- les modules crypto restent sous `atlas_10_full_crypto/modules/` ;
- les modules de Créatrice restent dans le dépôt privé sous `modules/aerith_10_creatrice/` ;
- la Forge génère des références GitHub et Raw.

## Profils clarifiés

- Aerith-10 Créatrice : spécialisation Organisatrice de production et Réalisatrice multi-agent ;
- Atlas-10 Crypto : moteur cartographique et analytique ;
- Aerith-10 Crypto : couche analyste-pédagogue, prudente et relationnelle, pouvant utiliser Atlas.

## Paquet de déploiement

L’archive contient le dossier enveloppe `atlas_10_full/`. Elle peut être extraite directement dans :

`public/agent_crypto_erith_ia/`

Elle ne contient aucun fichier destiné au répertoire parent et ne contient pas de copie des modules.

## Vérifications exécutées

- syntaxe JavaScript vérifiée avec Node.js ;
- 97 identifiants HTML contrôlés, aucun identifiant dupliqué ;
- tous les sélecteurs JavaScript `#id` correspondent à un élément HTML ;
- rendu dynamique testé dans Chromium avec CSS et scripts injectés ;
- 8 étapes rendues ;
- 5 profils rendus ;
- passage d’étape vérifié ;
- modification de l’identité propagée dans la proposition ;
- profil Créatrice et chemins de modules privés vérifiés ;
- aucune erreur JavaScript relevée pendant le test.
