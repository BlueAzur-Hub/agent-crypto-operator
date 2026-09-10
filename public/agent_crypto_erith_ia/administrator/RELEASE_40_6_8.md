# Agent-Crypto @erith.IA — Build 40.6.8

## HISTORICAL FUNCTIONAL CONTRACT RESTORE · VERSION + CHRONOS

Parent: **40.6.7**  
Market Core: **38.15.11 protected**

Cette version restaure au lieu de compenser.

- `admin-chronos.css` : restauration **octet pour octet** depuis 40.6.5 (`c0333b4d…`). Les interventions typographiques 40.6.6/40.6.7 sont retirées.
- Bouton Build : contrat historique restauré sous le propriétaire unique validé depuis 40.5.19.
  - build courante + clic = vérification seulement ; **aucun rechargement** si rien de nouveau ;
  - build plus récente = état `disponible` ;
  - clic sur `disponible` = revalidation puis **une seule** navigation.
- Aucun timer récurrent, aucun MutationObserver, aucun nouveau propriétaire de stockage.
- Market Core 38.15.11, Graphique, Lecture Technique, Atlas, Oracle, Aether/News, Strategy A/Paper et Window Manager sont hors chirurgie.

### Firefox
1. Charger 40.6.8 une fois.
2. Chronos doit retrouver exactement la présentation du checkpoint 40.6.5.
3. Cliquer Build lorsque 40.6.8 est courant : la page ne doit pas repartir.
4. À la prochaine build publiée, le badge doit annoncer `disponible`; un clic la charge une fois.
