# ORACLE EVIDENCE VERIFIED HOT WINDOW RETENTION — 40.6.490

## Propriétaires identifiés

- base et store : `administrator/app.js` — `agent_crypto_oracle_evidence_v1` / `observations` ;
- clé primaire : `id` ;
- ordre temporel : index non unique `t0`, puis clé primaire IndexedDB ;
- contrat froid : `data/oracle_evidence/manifest.json` ;
- lecture et hash froids existants : `oracle-evidence-tiered-storage-foundation.js` ;
- archivage séquentiel protégé : `oracle-evidence-auto-archive-safety-gates.js` ;
- mesure avant/après : `oracle-evidence-hot-window-sizing-406489.js` ;
- résidence : `post-boot-runtime-loader.js`.

Le propriétaire `app.js` n’est pas modifié. Le nouveau module ouvre la base existante, sans upgrade ni changement de schéma.

## Algorithme par chunk

1. Charger le manifest avec `cache: no-store`.
2. Exiger le schéma froid, le watermark et les verrous de sécurité.
3. Retrouver exactement le chunk candidat courant.
4. Exiger `VERIFIED` et les preuves `read_back`, `sha256`, `row_count`, `json_parse`, `manifest_commit`.
5. Refuser tout chemin non relatif, toute borne invalide et tout chunk postérieur au watermark.
6. Relire le JSONL public, calculer son SHA-256 sur les octets texte exacts et vérifier `row_count` plus bornes.
7. Relire localement la plage `(first_t0, first_id)` à `(last_t0, last_id)` dans l’ordre index/clé primaire.
8. Produire `JSON.stringify(row)` par ligne avec LF final, calculer le SHA-256 et exiger l’égalité exacte au manifest.
9. Répéter la preuve locale juste avant la transaction.
10. Vérifier `count - row_count >= 10000`.
11. Supprimer uniquement chaque `id` exact dans une transaction `readwrite` atomique.
12. Vérifier l’absence des IDs, recompter et exiger encore `count >= 10000`.

## Politique de sélection

Les chunks sont parcourus du plus ancien au plus récent. Un chunk déjà absent localement est ignoré ; un chunk partiel ou divergent arrête le preview ou le traitement. Un chunk qui ferait passer sous 10 000 n’est jamais traité. La queue récente non archivée n’appartient à aucune plage de chunk retenue et reste locale.

## Actions

Le chargement déclenche seulement `preview()`. Les deux chemins de suppression sont des gestionnaires de clic explicites avec confirmation opérateur. La continuation vérifie en plus le reçu de canari de la session courante.

## Mesures de départ

- local observé : environ 36 242 lignes ;
- froid : 36 056 lignes, 74/74 chunks `VERIFIED` ;
- moyenne terrain : 6,41 KiB ;
- payload estimé : 226,90 MiB ;
- objectif : HOT 10 000.

Ces valeurs servent à la conception. Le preview et chaque recount relisent les valeurs Firefox réellement présentes.
