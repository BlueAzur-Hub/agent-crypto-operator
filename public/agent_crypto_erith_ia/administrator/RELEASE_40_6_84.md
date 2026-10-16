# Administrator 40.6.84 — Aether V2 persisted geometry ownership lock

Parent: 40.6.83  
Market Core: 38.15.11 — unchanged.

## Correction

- Supprime la migration préboot 40.6.83 qui pouvait réécrire la géométrie Aether sauvegardée avant l'initialisation du Window Manager.
- `aether-watch.preferredFloatGeometry()` ne lit plus le stockage et ne fournit qu'une géométrie initiale lorsqu'aucune géométrie opérateur valide n'existe.
- Une géométrie opérateur valide (`x`, `y`, `width`, `height`) reste la vérité et est restaurée exclusivement par `ErithAdministratorWindows`.
- Aucun recentrage ni forçage à gauche n'est appliqué au boot, à l'ouverture, au focus ou après F5 quand une géométrie sauvegardée existe.

## Protections

- Market Core 38.15.11 inchangé.
- Window Manager canonique inchangé.
- Visuel Aether / backplate inchangé.
- Lecture Technique inchangée.
- Web Classique / moteur métier inchangé.
- Aucun nouveau timer, observer, fetch, propriétaire de stockage ou migration.

## Test opérateur attendu

1. Ouvrir Aether.
2. Déplacer la fenêtre à une position volontairement non centrée.
3. Recharger avec F5.
4. Vérifier que `x`, `y`, largeur et hauteur reviennent à la géométrie sauvegardée.
5. Fermer/réouvrir Aether et vérifier qu'aucun recentrage n'intervient.
