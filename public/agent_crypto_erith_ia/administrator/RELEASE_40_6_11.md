# Agent-Crypto @erith.IA — Build 40.6.11

## ORACLE SEMANTIC BIAS SURFACE · CHRONOS/VERSION/WIDTH FREEZE

Parent: **40.6.10**  
Market Core: **38.15.11 protected**

### Cible
Rendre le biais Oracle lisible immédiatement dans **la colonne Lecture Oracle uniquement**, sans créer de second moteur, sans toucher au canvas et sans modifier le calcul de scénario.

### Règle sémantique
La source reste la valeur Oracle déjà rendue dans `#atlasOracleBull` (`Force N/100`), issue du `bullStrength` existant :
- `> 50` → accent **haussier / vert** ;
- `= 50` → accent **neutre / or** ;
- `< 50` → accent **baissier / rouge**.

Le texte de régime (`MIXTE`, etc.) et toutes les valeurs numériques restent autoritaires. La couleur est une aide de lecture, **pas un signal de trading**.

### Chirurgie 40.6.11
- `oracle-presentation-405010.css` reste le propriétaire de présentation Oracle ; ajout d'un bloc colorimétrique strictement scoped à `.atlas-oracle-readout`.
- Nouveau lecteur passif `js/oracle-semantic-bias-406011.js` : il observe uniquement le texte déjà rendu de `#atlasOracleBull` et pose `data-oracle-bias-state`.
- Aucun timer, fetch, WebSocket, storage ou calcul prédictif ajouté.
- Les cartes natives **Oracle hausse** et **Oracle baisse** gardent leurs couleurs propres vert/rouge.
- Canvas Oracle, courbes, historique, horizons, Evidence, V2 shadow, Atlas, Aerith et modèle mathématique inchangés.
- **40.6.10 width contract gelé** : minimum structurel 1111 px conservé.
- **Chronos 40.6.9 gelé byte-for-byte**.
- **Version Truth 40.6.8 gelé byte-for-byte**.
- Strategy A / `js/app.js` gelé byte-for-byte.

### Preuve Firefox attendue
Avec la valeur visible de ton exemple `Oracle hausse Force 48/100`, la colonne Lecture Oracle doit prendre un accent **baissier rouge** car `48 < 50`, tandis que la carte Hausse reste verte et la carte Baisse rouge. À `>50`, l'accent global passe vert ; à `50`, il devient neutre/or.
