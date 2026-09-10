# Agent-Crypto @erith.IA — Build 40.6.16

## AFTER-COST LEDGER CONSISTENCY · CORE FREEZE

Parent: **40.6.15**  
Market Core: **38.15.11 protected**

### Correction
Le propriétaire `js/strategy-a-after-cost-metrics-404298.js` ferme une ambiguïté du ledger After-Cost.

- une ligne complète inclut frais, impact, spread et slippage dans son identité comptable ;
- si tous les coûts sont connus et que `net observé != brut référence - coûts`, la ligne est refusée avec `ACCOUNTING_IDENTITY_MISMATCH` ;
- si un coût est inconnu, la ligne reste admissible comme preuve partielle mais `accounting_identity_ok = null` et `accounting_identity_status = INDETERMINATE_COSTS` ;
- aucune preuve partielle n'est présentée comme identité comptable vérifiée ;
- déduplication par `reconciliation_id` / `execution_id` préservée ;
- aucune conclusion de rentabilité ;
- cache-bust appliqué uniquement au propriétaire After-Cost.

### Gel dur
Paper Lifecycle 40.6.15, Safety, Auto/Lifecycle Bridge, Evidence, Oracle 40.6.13 + FX, Chronos 40.6.9, Version Truth 40.6.8, largeur 40.6.10, Graphique, Lecture Technique, Window Manager, `js/app.js` et Market Core 38.15.11 restent intouchés.
