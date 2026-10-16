# PUBLIC CRYPTO COLLECTOR PRE-480 RESTORE — 40.6.488

## Définition appliquée

Restaurer signifie remettre le sous-système dans sa dernière implémentation validée avant la régression, au lieu de conserver la branche fautive et d'en masquer les symptômes.

## Périmètre

Uniquement le producteur canonique Top-250.

## Action

Les trois propriétaires sont repris exactement depuis 40.6.479 / commit `aa120142b856596739e0fc6abd5b418fe58f379a`.

Aucune couche fonctionnelle nouvelle n'est ajoutée.
Aucun fournisseur n'est changé.
Aucune logique Strategy A ou Atlas CURRENT n'est modifiée.

## Sécurité

Une réussite provider publie un snapshot frais.
Un échec provider conserve le dernier valide.
Aucune donnée synthétique.
Aucun ordre réel.
