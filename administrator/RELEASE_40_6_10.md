# Agent-Crypto @erith.IA — Build 40.6.10

## DASHBOARD HEADER WIDTH CONTRACT · CHRONOS/VERSION FREEZE

Parent: **40.6.9**  
Market Core: **38.15.11 protected**

### Défaut reproduit
Le propriétaire actif du bandeau `#livecheck.command-bar` dans `index.html` imposait, au-dessus de 1366 px, cinq minima de colonnes : `170 + 170 + 230 + 340 + 520 px`, plus quatre gaps de `6 px`, soit **1454 px minimum**. Le breakpoint compact s'arrêtait à 1366 px : à 1367 px et sur certaines largeurs intermédiaires, la grille pouvait donc réclamer plus de largeur que le contenu réel du header.

### Chirurgie 40.6.10
- Propriétaire modifié : **uniquement la grille partagée du bandeau supérieur dans `index.html`**.
- Fractions/proportions conservées : `.66fr / .66fr / .94fr / 1.35fr / 2.05fr`.
- Minima durs ramenés à `128 / 124 / 170 / 255 / 410 px`.
- Nouveau minimum structurel : **1111 px** gaps inclus, au lieu de **1454 px**.
- Le contrat compact `<=1366 px` reste inchangé.
- **Aucune réduction de police Chronos** : `admin-chronos.css` reste byte-for-byte le checkpoint validé 40.4.107.
- **Bouton Version inchangé** : `js/version-truth.js` reste byte-for-byte le contrat 40.6.8 validé en 40.6.9.
- Aucun changement Graphique, Lecture Technique, Atlas, Oracle, Aether/News, Strategy A/Paper, Window Manager ou Market Core.

### Firefox — preuve opérateur attendue
1. À largeur ~1367–1500 px, le bandeau supérieur ne doit plus déborder horizontalement.
2. Chronos doit conserver exactement la présentation validée en 40.6.9.
3. Le bouton Build doit annoncer 40.6.10 depuis 40.6.9 puis charger la nouvelle version une seule fois ; sur 40.6.10 à jour, il doit rester dans son comportement historique validé.
