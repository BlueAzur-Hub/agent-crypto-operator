# Agent-Crypto @erith.IA — Build 40.6.12

## ORACLE FX LIGHT SURFACE · PRICE TICK FLASH · CORE FREEZE

Parent: **40.6.11**  
Market Core: **38.15.11 protected**

### Destination
Alléger la colorimétrie Oracle de 40.6.11 et ajouter un contrôle local **FX ●** sans toucher au moteur Oracle.

### Contrat FX
- Mini bouton **FX ●** placé dans le header `LECTURE ORACLE`.
- **ON par défaut**, persistant localement.
- FX OFF restaure la présentation Oracle native : aucun halo sémantique et aucun flash prix.
- Biais Oracle : `>50` vert léger, `=50` neutre, `<50` rouge léger.
- Le biais ne recolore plus toute la colonne : fine bordure + halo intérieur discret + hero seulement.
- Le **prix Oracle** prend une teinte de base selon le biais, puis effectue un flash court **vert si le prix réel monte / rouge s'il baisse**.
- Les cartes `Oracle hausse` et `Oracle baisse` gardent leurs couleurs natives indépendantes.

### Anti-destruction
- Oracle math/model/canvas : inchangés.
- `js/app.js` : byte-for-byte.
- Chronos 40.6.9 : byte-for-byte.
- Version Truth 40.6.8 : byte-for-byte.
- Dashboard width contract 40.6.10 : conservé.
- Market Core 38.15.11 : inchangé.
- Aucun fetch/WebSocket/timer récurrent ajouté.

### Preuve Firefox
1. `FX ●` visible à droite de `LECTURE ORACLE`.
2. FX ON : bordure/hero légèrement vert, or ou rouge selon le score Oracle.
3. Le prix change légèrement de teinte avec le biais et flashe brièvement au tick réel.
4. FX OFF : retour visuel natif, sans flash ; les calculs continuent normalement.
5. Rechargement : l'état FX est conservé localement.
