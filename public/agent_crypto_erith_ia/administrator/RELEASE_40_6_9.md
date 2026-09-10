# Agent-Crypto @erith.IA — Build 40.6.9

## CHRONOS VALIDATED CHECKPOINT RESTORE · VERSION BUTTON FREEZE

Parent: **40.6.8**  
Market Core: **38.15.11 protected**

Cette version ne cherche pas une nouvelle solution : elle restaure un état déjà validé.

- `admin-chronos.css` : restauration **octet pour octet** depuis le checkpoint validé **40.4.107** (`c4f68eb64c538439715a560874b413cb209cf227`).
- Le Fil Crypto avait explicitement qualifié 40.4.107 de checkpoint utilisable et demandé de ne plus toucher Chronos sans défaut mesurable.
- Les couches ultérieures de réduction 40.5.2 (`<=620px` / `<=520px`, date 8.8/8px) ne font pas partie du fichier restauré.
- `js/version-truth.js` : **gelé byte-for-byte depuis 40.6.8** ; son SHA-256 doit rester `749da2802a65a006928a96c44ff33d691233e3e80a8356bb9541dfc37d09e03a`.
- Aucun changement Graphique, Lecture Technique, Atlas, Oracle, Aether/News, Strategy A/Paper, Window Manager ou Market Core.

### Firefox
1. Depuis 40.6.8, le bouton Build doit annoncer 40.6.9 disponible puis la charger une seule fois.
2. Sur 40.6.9 à jour, recliquer Build ne doit pas recharger la page.
3. Chronos doit reprendre exactement la présentation du checkpoint 40.4.107, sans les réductions 40.5.2.
