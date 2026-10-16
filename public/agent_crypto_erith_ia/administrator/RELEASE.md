# Agent-Crypto 40.6.494 — STRATEGY LEDGER LIVE MERGE TRUTH

Parent: **40.6.493**  
Market Core: **38.15.11 — protected**  
Bridge/Backend: **R18 / V1.9.13 / V1.4.3 — unchanged**

## Cause

Auto A continued to create new cycles, but the G3 prospective facade inherited from 40.6.206 could expose a stale generic Experiment Ledger view. Terrain showed:
- visible Auto A latest cycle: A-CYCLE-00017;
- 40.6.478 received event A-CYCLE-00017 but returned LEDGER_ID_MISS;
- 40.6.479 still exposed A-CYCLE-00006 as its latest decision frame.

## 40.6.494

The facade now merges:
1. historical/durable generic ledger rows;
2. prospective G3 evidence rows;
3. the exact live Experiment Ledger owner.

Rows are keyed by cycle_id. Exact live fields are authoritative on overlap. Prospective-only evidence fields are retained by shallow merge. The visible facade remains bounded to 240 rows and is sorted by decision/capture time so the newest live cycle cannot be hidden by an older snapshot.

## Protections

No Strategy threshold, Cost Gate, Oracle math, Risk policy, PAPER execution, 40.6.492 execution-cost measurement, 40.6.493 shadow lab, Backend, Bridge, Market Core, order, wallet, API key, timer, observer, fetch/WebSocket, or IndexedDB schema is changed.

---

# Agent-Crypto 40.6.491 — Oracle Evidence Retention Atomicity + AUTO Single-Flight

Published target: Administrator 40.6.491 · Market Core 38.15.11 protected.

## Scope
- Closes the 40.6.490 retention TOCTOU window: the final exact-value comparison and exact-key deletion now occur in one IndexedDB `readwrite` transaction.
- The public cold chunk is authenticated before the transaction; inside the transaction every current local row is compared exactly with the authenticated public row before any delete is queued.
- No cryptographic digest is awaited inside the deletion transaction.
- AUTO archive startup is single-flight before the first asynchronous boundary.
- AUTO progress is counted from the Bridge VERIFIED watermark to the fixed local target instead of `local_rows - archived_rows`.
- Historical 40.6.489 and 40.6.490 package workflows are manual-only so later builds cannot produce false version-red runs.

## Protected
Market Core 38.15.11, Strategy A business logic, Oracle Math, Aether, Lecture Technique, Web Classique and the cold Oracle Evidence archive are unchanged. No real order, wallet access, new storage schema or automatic deletion.

## Verification state
Static/syntax/package validation is provided by the 40.6.491 workflow. Firefox terrain remains required before the new retention path is declared terrain-verified.

---

# Agent-Crypto 40.6.490 — ORACLE EVIDENCE VERIFIED HOT WINDOW RETENTION

## Objet

Conserver au moins 10 000 Oracle Evidence locales dans Firefox et permettre à l’opérateur de retirer uniquement des chunks complets dont la copie froide GitHub est prouvée `VERIFIED`.

40.6.489 reste la sonde READ ONLY de mesure. 40.6.490 n’exécute automatiquement qu’un preview READ ONLY.

## Preview automatique

La carte `ORACLE EVIDENCE · VERIFIED HOT WINDOW 10 000 · 40.6.490`, montée sous 40.6.489, affiche :

- lignes locales ;
- budget maximal retirable sans franchir 10 000 ;
- chunks complets candidats ;
- lignes candidates ;
- lignes prévues après rétention ;
- estimation MiB libérables.

Le preview ouvre IndexedDB uniquement en `readonly`. Il ne supprime rien.

## Canari obligatoire

`Tester 1 chunk · max 500` exige une confirmation opérateur puis, avant la transaction :

1. recharge le manifest public ;
2. exige une entrée `VERIFIED` et toutes ses preuves ;
3. relit le JSONL froid public sans cache ;
4. vérifie son `row_count`, son SHA-256 et ses quatre bornes ;
5. reconstruit les lignes locales dans l’ordre canonique `(t0, id)` ;
6. exige le SHA-256 local exact du manifest et les mêmes bornes ;
7. relit et re-hashe encore le chunk local juste avant la transaction ;
8. supprime uniquement les clés primaires exactes du chunk ;
9. recompte et vérifie l’absence de tous les IDs retirés.

Le reçu visible doit être `RETENTION_CANARY_PASS`. Sans ce reçu, la continuation reste désactivée.

## Continuation

`Continuer jusqu’à HOT 10 000` traite un chunk à la fois. Le manifest, le chunk froid et les lignes locales sont revérifiés avant chaque suppression. Le traitement s’arrête au premier écart et ne descend jamais sous 10 000 lignes.

Le reçu final `HOT_RETENTION_COMPLETE` affiche les lignes supprimées, les lignes restantes, les chunks retirés localement et l’estimation MiB récupérée. La sonde READ ONLY 40.6.489 est alors relancée automatiquement.

## Protections

- aucun `clear()` ;
- aucun `indexedDB.deleteDatabase()` ;
- aucune suppression automatique au chargement ;
- aucun chunk absent ou non `VERIFIED` ;
- aucune Evidence postérieure au watermark froid ;
- queue récente non archivée conservée ;
- archive froide GitHub inchangée ;
- schéma IndexedDB inchangé ;
- Market Core 38.15.11, Strategy A, Atlas CURRENT, Oracle Math, collecteurs Market, Aether, Redivider, Lecture Technique, Bridge R17 / V1.9.13 et Web Classique inchangés ;
- aucun ordre réel et aucun wallet.

## Validation livrée

Les validations sont statiques et isolées. Elles ne touchent aucune IndexedDB réelle. Le premier test terrain destructif autorisé reste exclusivement le canari explicite dans Firefox, après revue Seven.
