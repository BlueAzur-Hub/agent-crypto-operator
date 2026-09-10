# AUDIT — Forge d’Aerith Pro V2.0-alpha.2

## Dossier

La destination devient :

`public/agent_crypto_erith_ia/atlas_10_full/`

## URLs

La Forge génère désormais :

- URL GitHub lisible ;
- URL Raw ;
- Core ;
- Persona ;
- Living Reflection Heart ;
- modules et sources.

Convention :

- `public:path` force le dépôt public ;
- `private:path` force le dépôt privé ;
- `core/`, `private/` et `packs/` utilisent automatiquement le dépôt privé ;
- les autres chemins utilisent par défaut `erith-ia-memory`.

## Block LLM

La conception et la compilation produisent un Block LLM court destiné aux autres LLM, notamment locaux.

Il charge dans l’ordre :

1. Core ;
2. Persona ;
3. Living Reflection Heart ;
4. modules ciblés.

Verrou :

Une URL privée inaccessible doit être remplacée par un fichier local fourni par l’utilisateur.
Le LLM ne doit jamais prétendre avoir lu une source inaccessible.

## Images

- matrice profil : `object-fit: contain` ;
- cartes profils : vraie zone média avec `object-fit: contain` ;
- lignée Seven / Solaire / Lunaire : affiches complètes ;
- aucun visage ni titre principal ne doit être coupé.

## Exports ajoutés

- `BLOCK_LLM...md` ;
- `GITHUB_HTTP_RAW_LINKS...md`.
