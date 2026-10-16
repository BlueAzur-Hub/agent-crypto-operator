# Agent-Crypto @erith.IA — HANDOFF 40.6.132

Date: 2026-09-15  
Socle fonctionnel: 40.6.131  
Checkpoint de reprise: 40.6.132  
Engine protégé: Market Core 38.15.11

## Nature de 40.6.132

40.6.132 est une **version de consolidation / gel / passage de relais**. Elle ne modifie volontairement aucun algorithme de marché, aucun moteur Atlas/Oracle, aucune Lecture Technique, aucune logique Strategy A/TRADUS et aucun comportement de trading. Elle matérialise un point de reprise propre après la récupération du versionnage en 40.6.131.

Règle: **ne pas transformer ce checkpoint en nouvelle cascade de correctifs**. La prochaine modification fonctionnelle doit partir en 40.6.133 avec un objectif unique, une preuve et un arrêt.

## État confirmé au passage de relais

- Administrator fonctionne sur la lignée 40.6.131 / Market Core 38.15.11.
- Binance Top 5 reste distinct du snapshot marché CoinGecko.
- CURRENT reste séparé du marché live et de Market Memory.
- Le pipeline analytique reste: Marché → Top 5 → Math → Contradictions → NØX → Aerith.
- Un CURRENT fermé doit rester en lecture seule et attendre un nouveau snapshot canonique.
- DEX: la preuve d'adresse, la fraîcheur et l'éligibilité Atlas restent fail-closed; ne jamais forcer artificiellement 3/5 ou 5/5.
- Strategy A et TRADUS restent deux lecteurs indépendants; PAPER/SHADOW uniquement, aucun ordre réel.
- INFORMATION MANQUANTE reste INFORMATION MANQUANTE.
- Importance d'une news ≠ causalité démontrée.

## Architecture de versionnage à préserver

1. `administrator/index.html` est l'entrée canonique.
2. L'identité publiée vient du manifeste `administrator/build.json`.
3. `js/version-truth.js` est l'unique propriétaire visible du contrôle de version.
4. Une release historique est immuable sous `administrator/releases/<build>/`.
5. Les assets fonctionnels actifs gardent des noms canoniques stables; Git porte l'historique.
6. Ne jamais afficher une build qui n'est pas réellement chargée.
7. Ne jamais dépendre de F5 pour atteindre un état final correct.

### Discipline de publication obligatoire

Pour toute nouvelle build:

1. une seule dette / un seul objectif;
2. lire complètement la zone avant chirurgie;
3. patch minimal;
4. créer d'abord l'entrée de release immuable;
5. vérifier que la release et ses dépendances existent;
6. seulement ensuite promouvoir le manifeste publié;
7. tester cold boot + F5 + retour de page;
8. preuve; puis arrêt.

Le défaut 40.6.130 (`runtime-shell.html HTTP 404`) ne doit jamais être reproduit.

## Dettes à reprendre — ordre recommandé

### A. Interface / UX Administrator

Le système est fonctionnel mais encore trop dense et inégal. Priorité à la lisibilité, à la hiérarchie et au premier rendu sans F5. Ne pas toucher Market Core 38.15.11 pour corriger une dette d'interface.

### B. Aerith-10 Créatrice · Full Matrix

La sous-section existe déjà comme portail Administrator. À consolider sans casser le parcours principal:

- rendre la frontière Agent-Crypto → Aerith-10 explicite;
- conserver le transfert de contexte comme action volontaire;
- garder Notion / Forge externes isolés tant que le fournisseur refuse l'iframe;
- clarifier `Actualiser contexte`, `Copier vers Aerith-10`, `Continuer vers la Forge`;
- éviter toute prétention d'envoi automatique si seul le presse-papiers est utilisé;
- améliorer la présentation sans créer un second moteur de mémoire.

### C. Salon de partage

État actuel: **Local First · messages de ce Firefox · backend partagé non connecté**.

Avant toute connexion distante, définir le contrat:

- identité / pseudo local;
- salon et historique;
- synchronisation explicite;
- état connecté / déconnecté impossible à confondre;
- confidentialité et données envoyées clairement visibles;
- aucune clé privée ou secret exposé dans GitHub Pages;
- mode local utilisable même sans backend.

Ne jamais afficher `partagé` comme effectif tant qu'aucun backend n'est réellement relié.

### D. Audit technique à revalider — ne présumer ni corrigé ni cassé

Un audit externe a relevé six points. Les builds 40.6.127 à 40.6.131 ont traité une partie de cette lignée, mais la sœur suivante doit les **reproduire / revalider avant toute nouvelle chirurgie**:

1. DEX: `observed_at_utc` doit être compris par la fraîcheur; API source gelée sans Proxy incompatible.
2. Strategy A AUTO: un STOP opérateur doit survivre au retour de page / réhydratation et ne peut être levé que par START explicite.
3. TRADUS: la comparaison historique doit être figée au moment de capture; inconnu d'un côté = NON COMPARABLE.
4. CURRENT: seul le propriétaire canonique peut émettre une finalisation métier avec fingerprint; aucun doublon de finalisation de présentation.
5. Commentaires IA: tous les garde-fous nécessaires doivent vivre dans la chaîne réellement chargée, sans dépendance fantôme à une ancienne couche.
6. TRADUS refresh: `{ok:false}` est un échec; distinguer dernière tentative, dernier succès et dernière erreur.

## Contrats intouchables

- Web Classique protégé.
- Market Core 38.15.11 protégé.
- Pas de wallet, pas de clé, pas d'ordre réel.
- PAPER / SHADOW clairement étiqueté.
- MARKET ≠ CURRENT.
- SNAPSHOT ≠ LIVE.
- OBSERVATION ≠ PRÉDICTION.
- News / impact ≠ causalité.
- Watchlist ≠ portefeuille.
- Donnée inconnue ≠ zéro, attente ou convergence inventée.
- Lecture Technique ne doit pas être détruite par une correction voisine.

## Tests d'acceptation pour 40.6.133+

- aucune 404 lors d'un changement de version;
- cold boot cohérent sans F5;
- bouton de version = build réellement chargée / build réellement disponible;
- un seul propriétaire de vérité visible;
- Atlas CURRENT: 4 rapports et conclusion Aerith partagent le même fingerprint;
- aucune finalisation métier sans résultat canonique;
- STOP Strategy A persiste après pageshow/F5/rehydration;
- TRADUS historique ne change pas rétroactivement;
- inconnu/stale → UNKNOWN / NON COMPARABLE / EXCLU selon contrat, jamais une valeur fabriquée;
- DEX proof gate cohérent entre Sources, diagnostics et Atlas;
- aucune donnée privée / clé API privée publiée;
- Aerith-10 et Salon de partage n'affectent pas le runtime marché tant qu'ils sont fermés.

## Prochaine séquence conseillée

**40.6.133 — Aerith-10 portal contract + UX**, sans backend nouveau.  
**40.6.134 — Salon de partage Local First contract**, toujours sans backend distant si le contrat n'est pas validé.  
**40.6.135 — revalidation des six dettes techniques**, uniquement celles encore reproductibles.

Pas de cascade automatique: 1 version → test → décision de continuer.

## Prompt de reprise court

> Reprends Agent-Crypto à partir de `administrator/HANDOFF_40.6.132.md`. Commence en lecture seule. Considère 40.6.132 comme checkpoint gelé et Market Core 38.15.11 / Web Classique comme protégés. Ne corrige rien avant d'avoir reproduit la dette ciblée. Prochaine build fonctionnelle: 40.6.133. Une seule dette par version, release immuable créée et vérifiée avant promotion, cold boot + F5 + preuve puis arrêt.
