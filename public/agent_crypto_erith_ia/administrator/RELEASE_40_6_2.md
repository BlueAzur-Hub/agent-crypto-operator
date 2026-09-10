# Agent-Crypto @erith.IA — 40.6.2

## COLD BOOT WARM START · VEILLE NATIVE HOLD LOCK

Parent: **40.6.1**  
Market Core: **38.15.11 — protected**

### Terrain 40.6.1

Firefox confirme que Chronos est revenu sur **une ligne**. Cette correction est donc protégée et n'est plus touchée.

La capture de démarrage reste cependant sur :

`Livecheck requis · Refusé avant Livecheck · Aucune source consultée`

avec Marché / Graphique / Lecture Technique en attente. Le Fil Crypto avait déjà fixé que Market Core, Binance LIVE, Graphique, Target Top 5, Math/V7, auth minimale et Bridge health sont des fonctions résidentes de boot.

### Correction 1 — cold boot

40.6.2 ne crée aucun nouveau moteur réseau. Sur un démarrage réellement vide uniquement, le petit bridge opérateur déclenche **une seule fois** le bouton canonique `Relancer maintenant` après le chargement du DOM.

- zéro retry automatique ;
- zéro boucle ;
- zéro timer récurrent ;
- si les données sont déjà présentes, aucun clic synthétique ;
- si l'opérateur a déjà lancé le Livecheck, aucun second lancement.

Le bouton existant reste le seul propriétaire de l'action et du réseau.

### Correction 2 — ♥ VEILLE → menu natif

40.6.1 ne faisait qu'un redémarrage d'animation sur une frame, trop fragile. 40.6.2 remplace ce comportement par un **HOLD déterministe** :

- clic sur `♥ VEILLE` → retour immédiat à `Relancer · Rafraîchir · Décision · Sources · Chronos` ;
- la ligne native reste réellement affichée ;
- aucun rebond vers VEILLE une frame plus tard ;
- clic sur `Aether` ou rechargement de la page → libère le HOLD et rend le cycle CSS canonique à nouveau propriétaire.

Le titre de la News conserve sa navigation News Sentinel lorsque le HOLD n'est pas activé.

### Verrous

- Chronos 40.6.1 préservé ;
- Market Core 38.15.11 inchangé ;
- aucun nouvel owner réseau ;
- aucun `setInterval` ;
- aucun observer ;
- aucune écriture storage ;
- Strategy A / Paper inchangés ;
- aucune autorisation d'ordre réel ;
- Web Classic inchangé ;
- Version Truth single visible owner préservé.
