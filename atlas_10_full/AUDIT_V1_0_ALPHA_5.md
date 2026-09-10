# AUDIT — Forge d’Aerith Pro V1.0-alpha.5

## Correction visuelle

Les trois images de la section « Lignée Seven » étaient utilisées comme fonds avec `background-size: cover`.
Le rapport horizontal des cartes coupait les titres, les personnages et une partie des tableaux verticaux.

La V1.0-alpha.5 :

- utilise une balise `<img>` réelle pour chaque visuel ;
- réserve un cadre portrait en ratio 4:5 ;
- applique `object-fit: contain` ;
- ne coupe plus les titres ni les bords des affiches ;
- place le texte dans une zone séparée sous l’image ;
- permet d’ouvrir chaque affiche entière dans une visionneuse plein écran ;
- maintient une grille responsive à trois, deux puis une colonne.

Aucune image n’a été régénérée. Les fichiers fournis par Christophe sont conservés.
