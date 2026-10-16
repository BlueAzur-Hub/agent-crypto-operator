# HANDOFF FINAL — 40.6.494 STRATEGY LEDGER LIVE MERGE TRUTH

## Firefox terrain proof

1. Ctrl+F5 and verify **Build 40.6.494 · Administrator**.
2. Open **Section 04 → Simulation** and explicit Evidence if required.
3. Note the current latest cycle under **EXPERIMENT LEDGER · PAPER V2 · CYCLES RÉELS**.
4. Let Auto A produce one normal new cycle.
5. Verify the same new cycle_id appears in all four places:
   - Experiment Ledger latest cycle;
   - **PROSPECTIVE OUTCOME + OKX COST EVIDENCE 40.6.478** → event;
   - the same panel → résolu;
   - **INPUT FRESHNESS TRUTH 40.6.479** → Cycle Strategy.
6. Expected plumbing: mode **LEDGER_BY_ID**, error **—**.
7. Expected freshness: 40.6.479 follows the new cycle and must not remain stale only because an older facade snapshot hid it.
8. Verify **EXECUTION COST TRUTH 40.6.492** and **OKX MICRO EXECUTION SHADOW TRUTH 40.6.493** still behave unchanged.

PASS terrain requires:
latest ledger cycle == .478 event == .478 resolved == .479 latest cycle.

Do not change thresholds or force a PAPER trade for this test.

---

# HANDOFF — Agent-Crypto 40.6.491

Checkpoint: Administrator 40.6.491 · ORACLE EVIDENCE RETENTION ATOMICITY + AUTO SINGLE-FLIGHT.

## Why
40.6.490 could prove a local chunk, close that read transaction, and only afterwards open a separate write transaction to delete the same IDs. An Oracle update between those two transactions could therefore make the proof stale while the canary still returned PASS.

## Correction
1. Public cold JSONL is fetched and SHA/boundaries are verified.
2. Local SHA is still checked as a preflight.
3. Final comparison is repeated by exact canonical row value inside the same IndexedDB `readwrite` transaction that owns the deletes.
4. A mismatched or missing row aborts the transaction before commit.
5. HOT 10 000 is checked from the count obtained inside that same transaction.
6. AUTO `start()` sets `starting=true` before its first await; duplicate starts do not launch a second loop.
7. AUTO progress counts only rows strictly after the VERIFIED remote watermark and up to the fixed target.

## Terrain still required
Firefox Ctrl+F5 → 40.6.491 → Oracle/Evidence. Validate preview, one ≤500 canary, then AUTO single-click behavior/progression. Do not continue mass retention if any mismatch appears.

---

# HANDOFF — Agent-Crypto 40.6.490

## État livré

40.6.490 ajoute la rétention locale Oracle Evidence par chunks froids `VERIFIED`, avec HOT minimum 10 000. Aucun nettoyage réel n’a été exécuté pendant l’implémentation ou les tests.

## Parcours opérateur après revue Seven

1. `Ctrl+F5`.
2. Ouvrir `Oracle → Evidence & validation`.
3. Lire la carte 40.6.489 et la nouvelle carte 40.6.490.
4. Vérifier que le preview indique uniquement des chunks complets `VERIFIED` et un résultat prévu `≥ 10 000`.
5. Cliquer `Tester 1 chunk · max 500`.
6. Lire la confirmation et valider seulement si le chunk attendu est affiché.
7. Exiger le reçu visible `RETENTION_CANARY_PASS` et un recount cohérent.
8. Vérifier que `Continuer jusqu’à HOT 10 000` vient seulement de se déverrouiller.
9. Continuer uniquement après accord final de Christophe / Blue Azur.

## Points d’arrêt

Au moindre SHA, `row_count`, `first_t0`, `last_t0`, `first_id`, `last_id`, watermark, manifest ou recount divergent : statut `STOP`, aucun chunk suivant.

La continuation termine sur `HOT_RETENTION_COMPLETE`, puis relance automatiquement la mesure READ ONLY 40.6.489.

## Ce que Seven doit confirmer

- la sérialisation locale `JSON.stringify(row) + "\n"` correspond exactement au JSONL froid historique ;
- l’ordre IndexedDB `index("t0")`, puis clé primaire `id`, est bien l’ordre utilisé lors de l’archivage ;
- le fetch same-origin de Pages relit bien le chunk GitHub publié sans service worker obsolète ;
- le premier chunk candidat est ancien, complet, `VERIFIED` et contient au plus 500 lignes ;
- une capture récente effectuée pendant le test reste locale ;
- le compteur reste `≥ 10 000` après canari et après traitement complet ;
- le cache chaud Oracle et la carte 40.6.489 reflètent le recount final ;
- aucun fichier protégé ni donnée froide n’est modifié par le diff.

## Interdit avant merge

- ne pas merger la PR sans revue Seven ;
- ne pas exécuter la continuation sur le profil Firefox de production ;
- ne pas modifier le manifest ou les chunks froids pour faire passer une preuve ;
- ne pas utiliser d’outil global de purge IndexedDB.
