# Forge d’Aerith Pro — V3.3R6 Routeur modules réels

Base : V3.3R5 Profils canoniques, sans refonte visuelle.

## Ajout borné

- catalogue Créatrice complet : 15 modules ;
- catalogue Crypto / Atlas : 8 modules publics ;
- états séparés : référencé, chargé, actif, inclus ;
- routes Créatrice conformes au Core du 27 juillet 2026 ;
- modules privés chargés localement depuis leur vrai dossier ;
- modules publics récupérés en octets via leur chemin GitHub Raw ;
- ZIP final : Core + Persona + documents Forge + README routeur + modules explicitement inclus.

## Test local

Depuis le dossier qui contient `atlas_10_full` :

`python -m http.server 8000`

Puis ouvrir :

`http://localhost:8000/atlas_10_full/`

Pour Créatrice, importer :

1. le Core canonique ;
2. la Persona canonique ;
3. le dossier `aerith_10_creatrice` contenant README + modules 01 à 15 ;
4. confirmer la validation humaine ;
5. choisir une route, puis forger le ZIP.

Aucun push GitHub n’a été effectué.
