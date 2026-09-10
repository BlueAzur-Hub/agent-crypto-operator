# Agent-Crypto @erith.IA — Build 40.6.7

## CHRONOS CANONICAL OWNER · DATE READABILITY RESTORE

Parent: **40.6.6**

### Correction réelle
Le Fil Crypto demandait une dette unique : **Chronos / la date**. 40.6.6 avait augmenté la typographie uniquement au-dessus de 620 px, alors que la carte Firefox opérateur tombe couramment sous ce seuil ; les anciennes règles 620/520 px réduisaient alors la date jusqu’à 8 px.

40.6.7 ne rajoute pas une quatrième surcouche. `admin-chronos.css` est reconsolidé comme propriétaire unique :

- date normale : **15 px** ;
- heure : 14 px ;
- libellés planétaires : 11 px ;
- groupe intrinsèque réellement centré ;
- ancien tassement automatique 620/520 supprimé ;
- fallback compact seulement sous **440 px** ;
- calcul ChronosXP inchangé.

### Protections
Market Core 38.15.11, Atlas, Oracle, Aether/News, Strategy A/Paper, Window Manager, stockage et bouton de version : **inchangés**.

### Preuve Firefox
1. Charger Build 40.6.7.
2. Vérifier immédiatement que `Lundi 07 septembre 2026` est nettement plus grand que sur 40.6.6.
3. Vérifier une ligne complète centrée, sans texte amputé.
4. Aucun jugement PASS avant capture opérateur.
