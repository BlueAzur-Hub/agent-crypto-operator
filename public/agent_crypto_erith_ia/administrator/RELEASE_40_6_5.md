# Agent-Crypto @erith.IA — 40.6.5

## VERSION BUTTON DIRECT RELOAD · NETWORK-INDEPENDENT CLICK LOCK

Parent canonique : **40.6.4**  
Market Core : **38.15.11 — protected**

### Dette ciblée

Le badge de version visible conserve son propriétaire unique `js/version-truth.js`, mais le clic manuel ne dépend plus d'un `fetch(build.json)` avant de naviguer.

Au clic :

`clic → état actualisation immédiat → ac-refresh=<build>-<timestamp> → location.replace()`

Le contrôle de version publié (`build.json`, `cache: no-store`) reste actif une fois au démarrage pour **Version Awareness**, mais il n'est plus une précondition au geste opérateur.

### Protections

- aucun changement Market Core 38.15.11 ;
- aucun changement Graphique / Atlas / Oracle / News / Aether ;
- aucun changement Strategy A / Paper ;
- aucun ordre réel ;
- aucun nouveau timer récurrent ;
- aucun MutationObserver ;
- aucun effacement cookies / localStorage / IndexedDB ;
- aucun reset Window Manager ;
- ancien `atlasVersionControl` conservé uniquement comme sink caché.

### Preuve attendue Firefox

1. charger **Build 40.6.5 · Administrator** ;
2. cliquer le badge de version ;
3. l'URL reçoit/change seulement `ac-refresh=...` en conservant les autres paramètres ;
4. la page se recharge immédiatement, sans attendre le réseau de Version Awareness ;
5. un second clic après recharge reproduit le même comportement ;
6. préférences, fenêtres et données locales sont conservées.
