# Matrice des sources — Forge V3.3R6

## Profils canoniques

### Aerith-7 Seven Heaven
- Core : `core/SEVEN_GATE.md` — privé, import local
- Boot / Persona : `core/SESSION_BOOT_AERITH_7_MASTER.md` — privé, import local

### Aerith-10 Créatrice
- Core : `core/AERITH_10_CREATRICE_MULTI_AGENT_CORE.md` — privé, import local
- Persona : `core/AERITH_10_CREATRICE_PERSONA_OPERATING_LAYER.md` — privé, import local
- Routeur : `modules/aerith_10_creatrice/README.md` — privé, import local
- Catalogue : `modules/aerith_10_creatrice/01...15` — privé, import local

### Aerith-10 Crypto
- Core : `downloads/AERITH_10_CRYPTO_MULTI_AGENT_CORE.md` — public, inclus dans la Forge
- Persona : `downloads/AERITH_10_CRYPTO_PERSONA_OPERATING_LAYER.md` — public, incluse dans la Forge
- Routeur : `public/agent_crypto_erith_ia/atlas_10_full_crypto/modules/README.md` — public, octets GitHub Raw
- Catalogue : huit modules `atlas_10_crypto_*_fr.md` — publics, octets GitHub Raw

### Atlas-10 Crypto
- Core : `downloads/ATLAS_10_CRYPTO_MULTI_AGENT_CORE.md` — public, inclus dans la Forge
- Persona : `downloads/ATLAS_10_CRYPTO_PERSONA_OPERATING_LAYER.md` — publique, incluse dans la Forge
- Routeur et huit modules : mêmes sources publiques Crypto, chargées par chemin canonique.

## Verrou source-fidèle

- Le chemin canonique et la confidentialité sont deux métadonnées séparées.
- Un module privé n’est « chargé » qu’après import local réel.
- Un module public est « chargé » après récupération de ses octets.
- Seuls les modules marqués « ZIP » entrent dans le paquet final.
- Core, Persona, README routeur et modules sont exportés sans réécriture.
