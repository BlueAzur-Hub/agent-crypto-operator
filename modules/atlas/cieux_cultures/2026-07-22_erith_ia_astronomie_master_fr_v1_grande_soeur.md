# ERITH.IA — Astronomie Master FR

**Version :** V1.0  
**Date :** 22 juillet 2026  
**Autrice / curatrice :** **Grande Sœur — Aerith-10 Créatrice**  
**Autorité finale :** **Christophe / Blue Azur**  
**Destinataires :** Aerith-10 Créatrice, Petite Sœur, Atlas, futures instances ERITH.IA  
**Statut :** module candidat à intégrer après audit du clone et validation de Christophe  
**Format :** Markdown / Notion compatible  

```text
PAS D’IMAGE
NO PICTURE
CODE ONLY
```


## 1. Mission du module

Ce module donne à Atlas et aux Aerith une base d’astronomie physique, observationnelle et calculable. Il sert à décrire le ciel réel, les mouvements apparents, les systèmes de coordonnées, les phénomènes du Système solaire et les sources d’éphémérides.

Il constitue la couche scientifique de référence pour :

- AstroCycle Paris ;
- ChronosXP ;
- Stellarium ;
- calendriers et heures planétaires ;
- archéoastronomie ;
- futures recherches temporelles appliquées aux marchés ;
- distinction entre constellation astronomique et figure culturelle.

Le module ne valide aucune interprétation astrologique. Il permet seulement de mesurer le ciel auquel les systèmes symboliques se réfèrent.

## 2. Verrou épistémique

```text
ASTRONOMIE = observation, mesure, modèle physique et calcul.
ASTROLOGIE = tradition historique et système symbolique étudié séparément.
CONSTELLATION IAU = région délimitée du ciel.
FIGURE DE CONSTELLATION = représentation culturelle variable.
CORRÉLATION = relation statistique à tester, jamais causalité automatique.
```

## 3. Compétences attendues

Atlas doit savoir :

- conserver l’instant en UTC ;
- convertir vers un fuseau IANA, notamment `Europe/Paris` ;
- distinguer temps civil, temps solaire apparent, temps solaire moyen et temps sidéral ;
- utiliser latitude, longitude et altitude de l’observateur ;
- distinguer repères horizontal, équatorial et écliptique ;
- distinguer position géocentrique, topocentrique, héliocentrique et barycentrique ;
- reconnaître les effets de parallaxe, réfraction, précession et nutation ;
- calculer ou interroger lever, coucher, transit et crépuscules ;
- interpréter correctement une phase lunaire et un pourcentage d’illumination ;
- distinguer conjonction apparente et proximité physique ;
- identifier les limites d’une éphéméride ;
- enregistrer source, version, méthode, date d’accès et précision.

## 4. Échelles de temps

### 4.1 UTC

UTC est l’échelle opérationnelle recommandée pour les timestamps de marché et les archives Atlas.

Règle :

```text
market_timestamp_utc = référence de stockage
local_timestamp = dérivation pour affichage et rattachement culturel
```

### 4.2 Heure locale

Une heure locale doit toujours être associée à un fuseau IANA.

Correct :

```text
Europe/Paris
```

Incorrect comme règle permanente :

```text
UTC+1
```

Paris alterne entre heure standard et heure d’été. Un simple décalage fixe produit des erreurs historiques et saisonnières.

### 4.3 Temps solaire

- **Temps solaire apparent :** lié à la position réelle apparente du Soleil.
- **Temps solaire moyen :** lisse les irrégularités apparentes sur l’année.
- **Midi solaire :** passage du Soleil au méridien local, qui ne coïncide pas nécessairement avec 12 h civile.
- **Équation du temps :** différence entre temps solaire apparent et moyen.

### 4.4 Temps sidéral

Le temps sidéral suit la rotation terrestre par rapport aux étoiles lointaines. Il sert à relier l’heure d’observation aux coordonnées équatoriales visibles au méridien.

## 5. Repères et coordonnées

### 5.1 Repère horizontal

Dépend de l’observateur et de l’instant :

- azimut ;
- hauteur ou altitude ;
- zénith ;
- horizon.

### 5.2 Repère équatorial

Utilisé pour cataloguer les positions célestes :

- ascension droite ;
- déclinaison ;
- époque de référence, par exemple J2000 ;
- équinoxe et date de la position.

### 5.3 Repère écliptique

Fondé sur le plan apparent de l’orbite terrestre :

- longitude écliptique ;
- latitude écliptique ;
- obliquité de l’écliptique.

Ce repère est important pour l’histoire du zodiaque, mais ses coordonnées restent astronomiques.

### 5.4 Origine de l’observation

- **Topocentrique :** depuis un lieu terrestre précis.
- **Géocentrique :** depuis le centre de la Terre.
- **Héliocentrique :** depuis le Soleil.
- **Barycentrique :** depuis le barycentre du Système solaire.

Pour le lever et le coucher à Paris, le calcul doit être topocentrique.

## 6. Mouvements apparents et corrections

### 6.1 Rotation terrestre

Elle produit l’alternance jour/nuit et le mouvement quotidien apparent d’est en ouest.

### 6.2 Révolution terrestre

Elle participe aux saisons, au déplacement annuel apparent du Soleil et à la visibilité saisonnière des constellations.

### 6.3 Précession

L’axe terrestre change lentement de direction. Les coordonnées et les relations entre signes tropicaux et constellations ne doivent donc pas être projetées à travers les millénaires sans correction.

### 6.4 Nutation

Oscillations plus petites superposées à la précession.

### 6.5 Parallaxe

Le déplacement apparent dépend du point d’observation. Il est particulièrement important pour la Lune et les objets proches.

### 6.6 Réfraction atmosphérique

L’atmosphère déplace la position apparente près de l’horizon. Les définitions de lever et coucher dépendent donc de conventions et de modèles.

## 7. Soleil et calendrier

Atlas doit conserver :

- lever ;
- coucher ;
- transit ;
- crépuscule civil, nautique et astronomique si nécessaire ;
- longitude écliptique apparente ;
- solstices ;
- équinoxes ;
- équation du temps ;
- source et convention de calcul.

### 7.1 Saisons

Les saisons astronomiques sont liées aux solstices et équinoxes. Elles ne doivent pas être confondues avec saisons météorologiques, agricoles ou culturelles.

### 7.2 Jour planétaire

Le futur laboratoire AstroCycle utilise une convention traditionnelle :

```text
le jour planétaire commence au lever local du Soleil
```

Cette règle est symbolique et calendaire. Le lever lui-même doit provenir d’un calcul astronomique documenté.

## 8. Lune

Atlas doit distinguer :

- âge de la Lune ;
- phase géométrique ;
- fraction illuminée ;
- croissante ou décroissante ;
- lever et coucher ;
- distance ;
- diamètre apparent ;
- périgée et apogée ;
- nœuds ;
- éclipses ;
- libration si utile.

Erreur fréquente : une illumination de 50 % ne suffit pas à distinguer premier et dernier quartier.

## 9. Planètes et petits corps

Pour chaque objet :

- identifiant stable ;
- type ;
- position apparente ;
- distance ;
- magnitude ;
- élongation ;
- phase si applicable ;
- mouvement direct ou rétrograde apparent ;
- source d’éphéméride ;
- précision.

Le mouvement rétrograde est apparent dans le repère géocentrique ; il ne signifie pas que la planète inverse physiquement son orbite autour du Soleil.

## 10. Éclipses, conjonctions et événements

### Éclipses

Une éclipse dépend de la géométrie Soleil–Terre–Lune et des nœuds orbitaux.

Conserver :

- type ;
- instant ;
- échelle de temps ;
- zone de visibilité ;
- magnitude/obscuration selon définition ;
- source ;
- incertitude historique, notamment via `ΔT` pour les périodes anciennes.

### Conjonctions

Une conjonction est d’abord un alignement apparent en longitude ou une faible séparation angulaire. Elle ne prouve aucune interaction particulière entre objets.

## 11. Étoiles, constellations et Voie lactée

### 11.1 Étoiles

Conserver :

- désignation ;
- coordonnées ;
- magnitude apparente ;
- distance si connue ;
- type spectral si utile ;
- mouvement propre ;
- catalogue et époque.

### 11.2 Constellations IAU

L’Union astronomique internationale reconnaît 88 constellations couvrant l’ensemble du ciel. Une constellation moderne est une région officielle, pas seulement un dessin reliant des étoiles.

### 11.3 Cultures du ciel

Stellarium peut afficher plusieurs traditions de figures célestes. Ces figures doivent être stockées comme données culturelles :

```text
culture
nom original
traduction
période
source
figure ou récit
correspondance approximative avec régions IAU
```

## 12. Éphémérides et hiérarchie des sources

### Niveau A — référence calculable

- IMCCE / LTE — éphémérides, phénomènes et API OPALE ;
- JPL Horizons — éphémérides et vecteurs ;
- publications et standards IAU.

### Niveau B — visualisation et contrôle humain

- Stellarium ;
- cartes célestes ;
- logiciels de planétarium.

### Niveau C — traditions calendaires

- ChronosXP pour contrôle des jours et heures planétaires ;
- textes historiques ;
- tables traditionnelles.

Règle :

```text
une capture Stellarium ne remplace pas une éphéméride exportable
un résultat ChronosXP ne remplace pas la documentation du lever solaire
```

## 13. Contrat Atlas minimal

```json
{
  "schema": "atlas.astronomy.observation.v1",
  "observed_at_utc": "ISO-8601",
  "location": {
    "name": "Paris, France",
    "timezone": "Europe/Paris",
    "latitude_deg": 48.8566,
    "longitude_deg": 2.3522,
    "altitude_m": null
  },
  "reference_frame": "topocentric|geocentric|heliocentric|barycentric",
  "coordinate_system": "horizontal|equatorial|ecliptic",
  "ephemeris_provider": "IMCCE|JPL|other",
  "provider_version": "string|null",
  "retrieved_at_utc": "ISO-8601",
  "precision_note": "string",
  "objects": [],
  "quality_flags": []
}
```

## 14. Pont avec Agent-Crypto

La couche astronomique peut produire des variables temporelles expérimentales, mais sans effet opérationnel par défaut :

- jour civil ;
- jour de semaine ;
- session de marché ;
- saison ;
- lever/coucher ;
- phase lunaire ;
- jour et heure planétaires ;
- événements astronomiques.

Toute utilisation de ces variables exige :

- baseline sans variable céleste ;
- hypothèse annoncée avant test ;
- jeu de contrôle ;
- correction des comparaisons multiples ;
- validation hors échantillon ;
- absence d’ordre réel.

## 15. Contrôles qualité

Refuser ou signaler :

- timestamp sans fuseau ;
- décalage UTC fixe utilisé comme fuseau ;
- lieu absent pour lever/coucher ;
- coordonnées sans époque ;
- source d’éphéméride absente ;
- constellation traitée comme objet physique unique ;
- phase lunaire déduite du seul pourcentage d’illumination ;
- fusion de données astronomiques et interprétations symboliques ;
- précision excessive non justifiée.

## 16. Références Internet V1

- IMCCE — Services d’éphémérides : https://www.imcce.fr/services/ephemerides/
- IMCCE — Information astronomique : https://www.imcce.fr/services/scar/
- IMCCE — API OPALE : https://opale.imcce.fr/webservices/api.html
- IMCCE — Web services OPALE : https://opale.imcce.fr/webservices/
- JPL Horizons : https://ssd.jpl.nasa.gov/horizons/
- JPL Horizons Application : https://ssd.jpl.nasa.gov/horizons/app.html
- JPL Horizons Manual : https://ssd.jpl.nasa.gov/horizons/manual.html
- IAU — The Constellations : https://www.iau.org/IAU/Iau/Science/What-we-do/The-Constellations.aspx
- Stellarium : https://stellarium.org/fr/
- Stellarium Documentation : https://stellarium.org/fr/docs.html
- Stellarium Remote Control : https://stellarium.org/doc/26.0/group__remoteControl.html

## 17. Critères d’acceptation V1

Le module est accepté si l’agent :

- distingue correctement UTC, fuseau et temps solaire ;
- exige un lieu pour les phénomènes locaux ;
- distingue horizontal, équatorial et écliptique ;
- distingue topocentrique et géocentrique ;
- classe Stellarium comme visualisation ;
- classe IMCCE/JPL comme références calculables ;
- sépare constellation IAU et figure culturelle ;
- ne transforme aucune variable céleste en signal de trading.

## 18. Pistes V2

- formules et exemples numériques ;
- validation croisée IMCCE/JPL sur vecteurs de test ;
- gestion détaillée des échelles TT, TDB, UT1 et `ΔT` ;
- catalogue de phénomènes ;
- schémas JSON complets ;
- tests unitaires JavaScript/Python ;
- connecteur local Stellarium ;
- module ChronosXP séparé ;
- histoire des instruments astronomiques.

**Signature : Grande Sœur — Aerith-10 Créatrice**
