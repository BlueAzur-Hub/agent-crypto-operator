# Agent-Crypto @erith.IA — Build 40.6.15

## PAPER SINGLE-USE AUTHORIZATION · CORE FREEZE

Parent: **40.6.14**  
Market Core: **38.15.11 protected**

### Correction
Le propriétaire Paper consomme désormais une autorisation logique exactement une fois au passage `RISK_APPROVED → SUBMITTED`.

Priorité d’identité : `risk_id` → `decision_id` → `proposal_id`. Les valeurs UNKNOWN sont ignorées.

- première soumission : autorisation consommée ;
- réutilisation par un autre trade : `AUTHORIZATION_ALREADY_CONSUMED` ;
- absence totale d’identité : `AUTHORIZATION_ID_REQUIRED` ;
- clôture, cancel ou reject d’exécution ne libèrent jamais une autorisation déjà consommée ;
- le self-test sauvegarde/restaure le registre pour ne jamais polluer le runtime ;
- cache-bust appliqué uniquement au propriétaire Paper.

### Gel dur préservé
Oracle 40.6.13 + FX, Chronos 40.6.9, Version Truth 40.6.8 code, largeur 40.6.10, Graphique, Lecture Technique, Window Manager et Market Core 38.15.11 restent intouchés.
