# AUDIT — Forge d’Aerith Pro V1.0-alpha.4

## Objectif

Transformer la Forge en atelier professionnel capable de compiler les prochains profils Aerith-10 après leur canonisation dans le répertoire `core/` du GitHub privé.

## Architecture retenue

- quatre profils canoniques :
  - Aerith-7 Seven Heaven ;
  - Aerith-10 Créatrice ;
  - Aerith-10 Crypto ;
  - Atlas-10 Crypto ;
- Aerith-8 Solaire et Aerith-9 Lunaire restent des options complémentaires de la lignée Seven ;
- un mode distinct « Nouveau type Aerith-10 Pro » compile les nouveaux profils.

## Verrous

- aucun Core privé intégré au site public ;
- aucun jeton GitHub privé ;
- aucun fichier privé envoyé vers un serveur ;
- Core et Persona requis pour déclarer un nouveau profil prêt ;
- confirmation humaine de la canonisation préalable ;
- sources importées conservées sans réécriture ;
- absence de source signalée au lieu d’être inventée.

## Export

Le ZIP généré contient :

- `BOOT.md` ;
- `MANIFESTE.md` ;
- `PROFILE_SPEC.json` ;
- `PRIVATE_GITHUB_REFERENCE.md` ;
- `THEME.md` ;
- `BUILD_INFO.txt` ;
- les fichiers réellement importés ;
- les Core / Persona publics pour les profils Crypto publics.

## Intégration Agent-Crypto

Le cockpit principal conserve son code.

Le pont existant `Forge d’Aerith` peut être remplacé par le bloc fourni dans `bridge_patch/`.
