# Agent-Crypto @erith.IA — Build 40.6.74

**Release:** AETHER V2 · CANONICAL FRAME / READABILITY  
**Administrator:** 40.6.74 · V9  
**Engine:** Market Core 38.15.11 — inchangé  
**Parent runtime:** 40.6.73 canonical checkpoint + R3/R5 protections

## But

Promouvoir Aether Watch V2 en build réel, sans conserver C1→C5 comme chaîne active. Les candidats ont servi de laboratoire. Le défaut terrain de C5 était un défaut de cycle de vie : la migration de géométrie refusait une fenêtre Aether encore `hidden`, donc l'ancien rectangle flottant d'environ 950 px survivait au rechargement.

## Correction canonique

- `aether-v2-406074.css` devient l'unique couche V2 active : cartographie proportionnelle des capsules, grille Sources/Oracle 2×2, Top 5 marché conservé, lisibilité et centre sacré alignés sur le master.
- `js/aether-frame-406074.js` devient le pont de présentation unique vers le Window Manager existant.
- La géométrie persistée est normalisée **pendant qu'Aether est encore masquée**, en conservant `hidden` et en laissant le Window Manager propriétaire de la persistance.
- Quand Lecture Technique est visible, Aether utilise le plus grand rectangle 16:9 complet à gauche de son rail. Sans rail, Aether est centré.
- Les états explicites `minimized` / `maximized` ne sont pas annulés.
- `js/aether-role-visibility.js` conserve le runtime R5 sain (fermeture de rôle + fiche active au-dessus d'Aether), retire les liens candidats C1→C5, charge uniquement la feuille V2 finale et le pont canonique 40.6.74.
- La même intégration publie la vérité visible **Build 40.6.74 · Administrator** dans le shell en cours d'exécution, ainsi que les métadonnées Administrator V9.
- Le runtime C5 n'est plus actif.

## Validation locale avant promotion

Test fonctionnel du contrat de fenêtre avec un état persistant volontairement obsolète `950×534`, Aether masquée :

- viewport `1648×928` ; rail Lecture Technique à droite ;
- cible calculée : `1293×727 @ 12,189` ;
- migration appliquée avant ouverture ;
- `hidden=true` conservé pendant la migration ;
- ouverture ensuite : même géométrie, `hidden=false` ;
- aucune erreur JavaScript observée dans le harness.

Test visuel isolé avec le **master V2 exact 1672×941**, le DOM Aether réel et les CSS Aether réels/finalisés :

- `1648×928` : Aether occupe le grand espace gauche sans recouvrir Lecture Technique ;
- `1920×1080` : largeur plafonnée à `1450 px`, composition 16:9 intacte ;
- `1180×760` : composition conservée en mode compact, Top 5 toujours visible.

Les screenshots de validation locale sont des tests de rendu isolés ; ils ne prétendent pas remplacer la validation Firefox du site déployé.

## Non modifié

- Market Core 38.15.11 ;
- logique prix / Binance / Oracle / Atlas ;
- trading ou micro-transaction ;
- Operator / Yohan ;
- Lecture Technique ;
- Shared Memory / Strategy A ;
- propriétaires réseau (`fetch`, WebSocket) ;
- aucun timer récurrent ni `MutationObserver` ajouté.

## Fichiers du build

- `public/agent_crypto_erith_ia/administrator/aether-v2-406074.css`
- `public/agent_crypto_erith_ia/administrator/js/aether-frame-406074.js`
- `public/agent_crypto_erith_ia/administrator/js/aether-role-visibility.js`
- `public/agent_crypto_erith_ia/administrator/RELEASE_40_6_74.md`

## Validation terrain attendue

Après déploiement Pages : recharger l'Administrator, vérifier le badge **Build 40.6.74**, ouvrir Aether une fois. Le changement doit être immédiatement visible : Aether doit être nettement plus large que le rectangle C5 et exploiter l'espace disponible à gauche de Lecture Technique.
