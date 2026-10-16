# Agent-Crypto 40.6.532 — New Listings canonical owner + native exit repair

## Cause terrain

40.6.531 a validé la découverte multi-actifs et les surfaces CT/MHA, mais Firefox a montré une régression de cycle de vie :

- après sélection d'un nouveau listing, `Solo`, `Top 5`, `Réinit.` et d'autres contrôles natifs ne reprenaient plus correctement le graphique ;
- le contexte externe MHA/CT pouvait rester actif dans le Carnet alors que le graphique repassait vers une autre intention ;
- `bindCanonicalExit()` cherchait des attributs inexistants sur les vrais boutons natifs.

40.6.531 est donc enregistré comme **terrain FAIL** pour cette transition.

## Correction 40.6.532

Le propriétaire runtime devient stable :

- `js/new-listings-native-category.js`
- état interne : `state`
- API publique : `AgentCryptoNewListingsNativeCategory`

Le numéro de release reste une métadonnée de livraison, pas une identité de fonction, d'état ou de fichier runtime.

Le contexte New Listing est libéré en capture **sans bloquer** le handler natif avant :

- Solo
- Top 3
- Top 5
- Hausses 5
- Baisses 5
- Volumes 5
- Réinit.
- Vider
- Target Top
- Market Flow
- clic sur une ligne Market canonique.

Aucun Graphique, aucune Fiche, aucune Profondeur et aucun Market parallèle n'est créé.

## Protection

- Market Core 38.15.11 : inchangé.
- Web Classique : inchangé.
- Strategy : inchangée.
- Aucun ordre réel.
- Aucun wallet.
- Aucun nouveau timer/observer/storage owner.

## Garde permanent

`.github/scripts/agent_crypto_new_listings_guard.py` et le workflow stable associé empêchent le retour de :

- fichiers runtime du type `new-listings-native-category-406533.js` ;
- états du type `state533` ;
- API du type `AgentCryptoNewListingsNativeCategory406533` ;
- sortie New Listing qui intercepte les contrôles natifs.

## Test Firefox demandé

1. Ctrl+F5 → Build 40.6.532.
2. Nouveaux listings → MHA → Ligne.
3. MHA → Top 5 : le contexte MHA doit disparaître et Top 5 fonctionner.
4. CT → Réinit. : retour BTC 24h natif.
5. MHA → Solo.
6. MHA → Vider.
7. MHA → BTC dans le Market.
8. Vérifier à chaque sortie que Graphique, en-tête, sélection et Carnet changent ensemble.

Terrain : **PENDING FIREFOX** jusqu'à cette preuve.
