# Atlas — Index de routage Cieux & Cultures

**Version :** V1.0  
**Date :** 22 juillet 2026  
**Autrice / curatrice :** **Grande Sœur — Aerith-10 Créatrice**  
**Autorité finale :** **Christophe / Blue Azur**  
**Destinataires :** Petite Sœur — Aerith-10 Créatrice, Atlas, futures instances ERITH.IA  
**Statut :** index de routage proposé après publication des cinq modules V1  
**Répertoire cible :** `public/agent_crypto_erith_ia/modules/atlas/cieux_cultures/`  
**Périmètre :** astronomie, cosmologie, astrologie historique et symbolique, cosmogonies, archéoastronomie, calendriers et cultes astraux  
**Effet opérationnel sur les marchés :** aucun par défaut

```text
PAS D’IMAGE
NO PICTURE
CODE ONLY
```

---

## 1. Mission de l’index

Cet index indique à Atlas :

- quels modules charger ;
- dans quel ordre ;
- selon quelle question ;
- quelle couche possède priorité en cas de conflit ;
- comment relier les données célestes aux traditions humaines ;
- comment empêcher une interprétation symbolique de remplacer une donnée scientifique ;
- comment préparer AstroCycle sans produire de signal financier réel.

Phrase centrale :

```text
L’Astronomie mesure.
La Cosmologie modélise l’Univers physique.
L’Archéoastronomie documente les usages humains du ciel.
L’Astrologie étudie les systèmes symboliques et historiques.
Les Cosmogonies étudient les récits d’origine.
Atlas route, distingue, cite et conserve les incertitudes.
```

---

## 2. Modules V1 enregistrés

### 2.1 Astronomie Master

```text
2026-07-22_erith_ia_astronomie_master_fr_v1_grande_soeur.md
```

Rôle :

- couche scientifique principale ;
- UTC, `Europe/Paris`, temps solaire et sidéral ;
- repères horizontal, équatorial et écliptique ;
- lever, coucher, transit et crépuscules ;
- Soleil, Lune, planètes, étoiles et constellations IAU ;
- IMCCE et JPL comme références calculables ;
- Stellarium comme visualisation et contrôle humain.

SHA Git observé lors de l’audit :

```text
0d0c204d47e8e8796e450d279443667456982bd9
```

### 2.2 Cosmologie Master

```text
2026-07-22_erith_ia_cosmologie_master_fr_v1_grande_soeur.md
```

Rôle :

- cosmologie scientifique ;
- expansion, histoire thermique et modèle `ΛCDM` ;
- matière noire, énergie noire et questions ouvertes ;
- formation des éléments ;
- pont cosmologie → étoiles → éléments → géologie → matières → marchés ;
- séparation cosmologie scientifique / cosmogonie culturelle.

SHA Git observé :

```text
79ff9baef85206b6db8dfb2797c56eb240a75f01
```

### 2.3 Astrologie symbolique, histoire et critique

```text
2026-07-22_erith_ia_astrologie_symbolique_histoire_critique_fr_v1_grande_soeur.md
```

Rôle :

- astrologies comme objets historiques et symboliques ;
- traditions mésopotamiennes, hellénistiques, indiennes, iraniennes, arabes et européennes ;
- zodiaques, maisons, aspects, jours et heures planétaires ;
- protection des données natales ;
- variables expérimentales avec baseline, placebo et hors-échantillon ;
- aucun conseil financier ou médical.

SHA Git observé :

```text
f156c199bdfc2aea4e39beec9bfd35e08a7a587c
```

### 2.4 Cosmogonies comparées

```text
2026-07-22_erith_ia_cosmogonies_comparees_fr_v1_grande_soeur.md
```

Rôle :

- récits et doctrines d’origine ;
- comparaison sans réduction ni pseudo-unification ;
- Mésopotamie, Égypte, Grèce, traditions bibliques, Inde, Chine, Japon, mondes nordiques et monde maya k’iche’ ;
- séparation corpus, traduction, commentaire et reconstruction moderne ;
- comparaison prudente avec la cosmologie scientifique.

SHA Git observé :

```text
c1b6eb5f73251ffbd0b385ce2db38f86005da9a8
```

### 2.5 Archéoastronomie, calendriers et cultes astraux

```text
2026-07-22_erith_ia_archeoastronomie_calendriers_cultes_astraux_fr_v1_grande_soeur.md
```

Rôle :

- monuments, horizons, instruments, paysages, calendriers et rites ;
- méthode de mesure des orientations ;
- précession, réfraction, parallaxe et incertitudes ;
- distinction alignement possible / intention prouvée ;
- cultes solaires, lunaires, stellaires et planétaires ;
- Stellarium comme aide, jamais comme preuve unique.

SHA Git observé :

```text
e65191b75453c7e488c58785735b00c6bcc3c92a
```

---

## 3. Ordre de priorité épistémique

En cas de contradiction apparente :

```text
1. donnée primaire ou mesure documentée
2. standard scientifique ou institution de référence
3. modèle scientifique avec hypothèses explicites
4. source historique primaire
5. édition ou traduction critique
6. étude académique
7. tradition documentée
8. reconstruction moderne signalée
9. hypothèse expérimentale
```

Règles absolues :

```text
une donnée astronomique ne peut pas être remplacée par une correspondance astrologique
une tradition ne doit pas être supprimée parce qu’elle n’est pas une théorie physique
un récit religieux ne doit pas être présenté comme une mesure
une ressemblance ne prouve ni filiation ni causalité
une variable céleste n’agit pas sur le marché tant qu’un protocole statistique ne l’a pas testée
```

---

## 4. Routage par type de demande

### ROUTE A — Ciel observable actuel ou historique

Charger :

```text
Astronomie Master
→ Archéoastronomie seulement si contexte humain, monumental ou historique
```

Exemples :

- position de la Lune ;
- lever du Soleil à Paris ;
- différence entre signe et constellation ;
- ciel simulé par Stellarium ;
- visibilité historique d’un astre.

Ne pas charger par défaut :

```text
Astrologie
Cosmogonies
Cosmologie
```

sauf demande explicite.

### ROUTE B — Origine et structure physique de l’Univers

Charger :

```text
Cosmologie Master
→ Astronomie Master pour les concepts observationnels
```

Ajouter :

```text
Cosmogonies comparées
```

uniquement si la question compare science, philosophie, religion ou histoire des idées.

### ROUTE C — Histoire des croyances astrales

Charger :

```text
Astronomie Master
→ Astrologie symbolique, histoire et critique
→ Archéoastronomie si monuments, calendriers, cultes ou pratiques matérielles
```

L’Astronomie fournit le phénomène mesuré.  
L’Astrologie fournit l’interprétation historique.  
L’Archéoastronomie fournit le contexte matériel et social.

### ROUTE D — Cosmogonie, mythologie ou religion

Charger :

```text
Cosmogonies comparées
→ Archéoastronomie si calendrier, temple, orientation ou culte astral
→ Cosmologie Master seulement pour comparaison explicitement demandée
```

Interdiction :

```text
ne jamais injecter automatiquement le Big Bang dans un récit ancien
ne jamais transformer une analogie moderne en connaissance antique
```

### ROUTE E — Calendriers et cultes astraux

Charger :

```text
Archéoastronomie, calendriers et cultes astraux
→ Astronomie Master
→ Astrologie historique si jours, heures, présages ou correspondances
→ Cosmogonies si le calendrier dépend d’un récit d’origine
```

### ROUTE F — AstroCycle Paris

Ordre obligatoire :

```text
1. Astronomie Master
2. couche de calcul solaire Paris / Europe/Paris
3. Astrologie symbolique — jours et heures planétaires
4. Math Core — tests et validation
5. interface Agent-Crypto — affichage seulement
```

Chaîne de données :

```text
timestamp marché UTC
→ conversion Europe/Paris
→ lever/coucher astronomique documenté
→ jour planétaire au lever
→ heure planétaire calculée
→ variable symbolique étiquetée
→ test statistique
→ aucun effet opérationnel par défaut
```

ChronosXP :

```text
outil de contrôle pratique
pas source astronomique unique
```

Stellarium :

```text
visualisation et contrôle humain
pas source unique de vérité
```

### ROUTE G — Métaux, pierres et matières futures

Charger :

```text
Cosmologie Master
→ pour origine des éléments

Astronomie / Astrologie
→ seulement pour histoire des correspondances planètes–métaux–pierres

Archéoastronomie / Cosmogonies
→ pour cultes, monnaies, offrandes, architecture et récits
```

Puis charger les futurs modules dédiés :

```text
or et métaux précieux
métaux critiques et stratégiques
géologie et gisements
diamants et gemmes
traçabilité
marchés de matières premières
```

---

## 5. Table de routage rapide

| Intention | Module principal | Renforts | Interdiction principale |
|---|---|---|---|
| ciel réel | Astronomie | Archéoastronomie | symbolique présentée comme mesure |
| Univers physique | Cosmologie | Astronomie | cosmogonie présentée comme modèle scientifique |
| histoire astrologique | Astrologie | Astronomie, Archéoastronomie | prédiction présentée comme validée |
| récits d’origine | Cosmogonies | Histoire des religions, Cosmologie sur demande | pseudo-unification |
| monuments et calendriers | Archéoastronomie | Astronomie, Astrologie | alignement = intention |
| AstroCycle | Astronomie puis Astrologie | Math Core | signal financier direct |
| métaux et pierres symboliques | futur module dédié | Astrologie, histoire, religions | valeur symbolique = valeur marchande |
| origine des éléments | Cosmologie | Astronomie, géologie future | raccourci cosmologie → prix |

---

## 6. Verrous de provenance

Toute sortie sérieuse doit pouvoir indiquer :

```text
source
type de source
date
langue
édition ou traduction
méthode
lieu
fuseau
époque astronomique
incertitude
statut : observation|modèle|tradition|hypothèse
```

Pour une donnée locale :

```text
timestamp sans fuseau = refus
lever/coucher sans lieu = refus
position historique sans époque = refus
```

Pour une tradition :

```text
tradition sans culture ni période = refus
traduction sans édition identifiable = signalement
correspondance dite antique sans source = reconstruction moderne
```

---

## 7. Références prioritaires communes

### Astronomie

- IMCCE : https://www.imcce.fr/services/ephemerides/
- IMCCE OPALE : https://opale.imcce.fr/webservices/
- JPL Horizons : https://ssd.jpl.nasa.gov/horizons/
- IAU Constellations : https://www.iau.org/IAU/Iau/Science/What-we-do/The-Constellations.aspx
- Stellarium : https://stellarium.org/fr/
- Stellarium Remote Control : https://stellarium.org/doc/26.0/group__remoteControl.html

### Cosmologie

- NASA Universe : https://science.nasa.gov/universe/overview/
- NASA Physics of the Cosmos : https://science.nasa.gov/astrophysics/programs/physics-of-the-cosmos/about/
- ESA Cosmic Eras : https://www.esa.int/Science_Exploration/Space_Science/Cosmic_eras
- ESA Euclid : https://www.esa.int/Science_Exploration/Space_Science/Euclid

### Histoire astrale et sources anciennes

- CDLI : https://cdli.earth/
- British Museum : https://www.britishmuseum.org/collection/object/W_1885-0430-15
- UNESCO Astronomie et patrimoine : https://whc.unesco.org/fr/astronomie/
- ICOMOS Open Archive : https://openarchive.icomos.org/id/eprint/267/

### ChronosXP

- Projet : https://sourceforge.net/projects/chronosxp/
- Sources : https://sourceforge.net/projects/chronosxp/files/Source%20Code/

---

## 8. Convention de nommage

Constat :

- les cinq fichiers Cieux & Cultures sont datés, versionnés et signés ;
- l’index mathématique existant indique une convention `minuscules`, `snake_case`, sans version dans le nom.

Décision de normalisation appliquée le 19 août 2026 :

```text
noms de fichiers en minuscules
snake_case conservé
date + version + signature conservées
références internes alignées sur les nouveaux noms
historique Git conservé comme traçabilité des anciens noms
```

Convention actuelle :

```text
conserver les archives versionnées
utiliser les noms minuscules comme noms canoniques de ce répertoire
ne jamais écraser le contenu historique d’une version
mettre à jour tout lien ou routeur qui référence encore l’ancienne casse
```

---

## 9. État de chargement recommandé

### Chargement minimal AstroCycle

```text
Astronomie
Astrologie historique et symbolique
Math Core
```

### Chargement culturel complet

```text
Astronomie
Cosmologie
Archéoastronomie
Astrologie
Cosmogonies
```

### Chargement matières futur

```text
Cosmologie
Histoire mondiale
Religions et cultes
Géologie
Marchés des matières
Métaux / diamants / gemmes
Traçabilité
```

---

## 10. Critères d’acceptation de l’index

L’index est accepté si Atlas :

- charge l’Astronomie avant toute dérivation céleste ;
- sépare cosmologie et cosmogonie ;
- route les questions historiques vers les modules culturels ;
- n’utilise pas tout le pack pour une question simple ;
- conserve provenance et incertitude ;
- ne produit aucun signal financier direct ;
- applique `Paris / Europe/Paris / lever du Soleil` pour AstroCycle ;
- traite ChronosXP et Stellarium selon leurs rôles réels ;
- peut identifier le module canonique et son SHA ;
- n’écrase aucune version antérieure.

---

## 11. Prochaine étape

```text
1. publier cet index dans cieux_cultures/
2. publier l’audit croisé V1
3. valider la vague V2-A
4. produire V2-A :
   - Astronomie
   - Astrologie historique et symbolique
   - Archéoastronomie
5. produire V2-B plus tard :
   - Cosmologie
   - Cosmogonies
```

**Signature : Grande Sœur — Aerith-10 Créatrice**
