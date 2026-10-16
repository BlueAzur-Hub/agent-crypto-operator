# Administrator 40.6.85 — Aether left boot + version action lock

Parent: 40.6.84  
Market Core: 38.15.11 — unchanged.

## Deux défauts corrigés

1. **Aether au centre au chargement** : la 40.6.84 avait laissé une géométrie par défaut centrée. La géométrie initiale canonique revient à `x = 12`. Une migration 40.6.85 unique déplace uniquement un état Aether sauvegardé qui correspond encore à une position centrée ; une position opérateur non centrée est préservée.
2. **Bouton de mise à jour sans action visible** : le contrôleur pouvait détecter une Build plus récente puis refuser silencieusement la navigation si son second contrôle `index.html` n'était pas encore aligné. Ce précontrôle bloquant est supprimé. Quand une Build plus récente est disponible, le clic lance directement `location.replace()` avec un paramètre anti-cache.

## Protections

- Market Core 38.15.11 inchangé.
- Window Manager canonique inchangé.
- Aether master/backplate inchangé.
- Lecture Technique inchangée.
- Web Classique / moteur métier inchangé.
- Aucun nouveau timer, observer ou propriétaire réseau.

## Test Firefox attendu

1. Charger Administrator 40.6.85.
2. Aether doit apparaître à gauche (`x ≈ 12`) si l'ancien état sauvegardé était centré.
3. Déplacer Aether ailleurs, F5 : la position opérateur non centrée doit revenir.
4. Lorsqu'une Build plus récente est affichée comme disponible, un clic sur le badge doit provoquer immédiatement une navigation/relecture du document, jamais un silence.
