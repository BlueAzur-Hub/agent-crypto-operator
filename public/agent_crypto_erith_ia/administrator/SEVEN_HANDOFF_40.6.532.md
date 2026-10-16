# Seven handoff — Agent-Crypto 40.6.532

## Point de vérité

40.6.531 est fonctionnelle pour découverte CT/MHA/MCAT/PONS/CNPY et pour les surfaces New Listing isolées, mais elle est rejetée au terrain pour la transition vers les commandes graphiques natives.

## Propriétaire actuel

`js/new-listings-native-category.js`

Ne pas recréer un fichier propriétaire suffixé par le prochain numéro de build.

État : `state`.

API : `AgentCryptoNewListingsNativeCategory`.

## D réparé

Un nouveau listing peut utiliser les surfaces existantes, puis rendre le contrôle au système natif.

La sortie doit se produire avant le handler natif mais ne doit ni faire `preventDefault()` ni `stopImmediatePropagation()`.

## À ne pas toucher

Market Core 38.15.11, Web Classique, Lecture Technique, Strategy, Oracle, Aether, propriétaires USD, graphique canonique et profondeur hors preuve directe.

## Test suivant

Firefox 40.6.532 :
MHA → Top 5 → CT → Réinit. → MHA → Solo → MHA → Vider → MHA → BTC.

PASS seulement si Graphique + contexte + Carnet reviennent ensemble au propriétaire canonique.
