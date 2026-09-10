# ERITH.IA — Archéoastronomie, calendriers et cultes astraux FR

**Version :** V2.0  
**Date :** 23 juillet 2026  
**Autrice / curatrice :** **Grande Sœur — Aerith-10 Créatrice**  
**Autorité finale :** **Christophe / Blue Azur**  
**Destinataires :** Petite Sœur — Aerith-10 Créatrice, Atlas, futures instances ERITH.IA  
**Statut :** V2-A — extension SIG, calcul, cas et validation de la V1  
**Module parent :** `2026-07-22_erith_ia_archeoastronomie_calendriers_cultes_astraux_fr_v1_grande_soeur.md`  
**Répertoire cible :** `public/agent_crypto_erith_ia/modules/atlas/cieux_cultures/`

```text
PAS D’IMAGE
NO PICTURE
CODE ONLY
```

---

## 1. Mission V2

Cette V2 ajoute :

- protocole SIG ;
- calcul de déclinaison cible ;
- horizon numérique ;
- propagation des incertitudes ;
- statistiques ;
- exemples de classes de sites ;
- calendrier comme système de données ;
- navigation céleste ;
- contrat local Stellarium ;
- exigences éthiques renforcées.

---

## 2. Protocole SIG

### Données minimales

```json
{
  "site_id": "string",
  "geometry": "point|line|polygon",
  "crs": "EPSG code",
  "latitude_deg": 0.0,
  "longitude_deg": 0.0,
  "altitude_m": null,
  "axis_azimuth_deg": 0.0,
  "axis_uncertainty_deg": 0.0,
  "horizon_altitude_deg": 0.0,
  "dating_from": "string|null",
  "dating_to": "string|null",
  "dating_uncertainty": "string",
  "survey_method": "string",
  "source": "string"
}
```

### Référentiel

Toujours enregistrer :

- système de coordonnées ;
- datum ;
- transformation ;
- nord vrai ou magnétique ;
- déclinaison magnétique si conversion ;
- date de mesure ;
- instrument ;
- précision.

---

## 3. Déclinaison cible

Pour :

- latitude géographique `φ` ;
- altitude apparente `h` ;
- azimut `A` mesuré depuis le nord vers l’est ;

relation :

```text
sin(δ) = sin(φ) sin(h) + cos(φ) cos(h) cos(A)
```

Puis :

```text
δ = arcsin(...)
```

Cette formule géométrique doit être corrigée ou contextualisée selon :

- réfraction ;
- demi-diamètre solaire ou lunaire ;
- parallaxe ;
- horizon réel ;
- extinction ;
- précession ;
- époque ;
- mouvement propre ;
- incertitude de mesure.

---

## 4. Vecteurs de test géométriques

### Test A — Est à l’horizon

```text
φ = 48.8566°
A = 90°
h = 0°
```

Attendu idéal :

```text
δ ≈ 0°
```

### Test B — Nord à l’horizon

```text
φ = 48.8566°
A = 0°
h = 0°
```

Attendu idéal :

```text
δ ≈ 41.1434°
```

### Test C — Sud à l’horizon

```text
φ = 48.8566°
A = 180°
h = 0°
```

Attendu idéal :

```text
δ ≈ -41.1434°
```

Ces tests valident la convention d’azimut. Ils ne valident pas un site archéologique réel.

---

## 5. Propagation des incertitudes

Variables :

```text
azimut
horizon
latitude
datation
réfraction
parallaxe
position de l’astre
```

Méthode recommandée :

```text
Monte Carlo
```

Étapes :

1. définir chaque distribution ;
2. tirer plusieurs milliers d’échantillons ;
3. recalculer `δ` ;
4. produire médiane et intervalle ;
5. comparer aux cibles ;
6. conserver le taux de compatibilité ;
7. tester les explications alternatives.

Interdiction :

```text
aucun résultat à la seconde d’arc
si le monument est mesuré à plusieurs degrés près
```

---

## 6. Horizon numérique

Sources possibles :

- levé de terrain ;
- modèle numérique d’élévation ;
- LiDAR ;
- photogrammétrie ;
- topographie historique ;
- reconstruction prudente.

Conserver :

```json
{
  "horizon_source": "field|DEM|LiDAR|reconstruction",
  "resolution_m": null,
  "date": "string",
  "vegetation_model": "string|null",
  "ancient_modification": "string|null",
  "uncertainty_deg": 0.0
}
```

Le relief actuel ne doit pas être supposé identique au relief ancien.

---

## 7. Statistique d’orientation

### Hypothèse préalable

Définir avant calcul :

- population de monuments ;
- critère d’inclusion ;
- axe mesuré ;
- cible ;
- tolérance ;
- distribution nulle ;
- corrections multiples.

### Distribution nulle

Selon le contexte :

- uniforme ;
- contrainte par topographie ;
- contrainte par réseau urbain ;
- contrainte constructive ;
- orientation des parcelles ;
- orientation des pentes.

### Sorties

```text
effectif
distribution observée
distribution nulle
écart
intervalle
p-value si pertinente
taille d’effet
robustesse
sensibilité au choix de tolérance
```

---

## 8. Classes de conclusions

```text
non testé
compatible
possible
probable
fortement étayé
non démontré
incompatible
réfuté par les données disponibles
```

Une conclusion forte exige :

- mesure ;
- datation ;
- contexte indépendant ;
- cible non choisie après coup ;
- alternatives examinées ;
- résultat reproduit.

---

## 9. Cas de travail

La V2 ne canonise aucun site par simple réputation. Elle impose des fiches.

### Fiche-type

```json
{
  "site": "string",
  "culture": "string",
  "period": "string",
  "claim": "string",
  "measurement": {},
  "astronomical_target": {},
  "dating": {},
  "independent_context": [],
  "alternative_explanations": [],
  "statistical_context": {},
  "assessment": "string",
  "sources": []
}
```

### Catégories

- observatoire instrumenté ;
- temple orienté ;
- monument funéraire ;
- paysage cérémoniel ;
- ville planifiée ;
- dispositif calendaire ;
- navigation ;
- marqueur d’horizon ;
- alignement controversé.

---

## 10. Calendriers comme données

### Schéma

```json
{
  "schema": "atlas.calendar.system.v2",
  "name": "string",
  "culture": "string",
  "region": "string",
  "period": "string",
  "day_start": "midnight|sunrise|sunset|dawn|other",
  "month_start": "observation|calculation|fixed",
  "year_type": "solar|lunar|lunisolar|other",
  "intercalation": "string|null",
  "epoch": "string|null",
  "reforms": [],
  "regional_variants": [],
  "conversion_method": "string",
  "sources": [],
  "uncertainties": []
}
```

Interdiction :

```text
projeter le jour planétaire au lever
sur tous les calendriers
```

---

## 11. Navigation céleste

Compétences :

- étoile polaire selon époque ;
- lever et coucher d’astres ;
- hauteur méridienne ;
- latitude ;
- azimut ;
- saison ;
- traditions de houle et vents ;
- apprentissage oral ;
- instruments ;
- cartes et tables.

Distinguer :

```text
navigation astronomique instrumentale
navigation stellaire traditionnelle
orientation rituelle
récit identitaire
```

---

## 12. Cultes astraux

Pour affirmer un culte, rechercher :

- dédicace ;
- inscription ;
- nom divin ;
- calendrier rituel ;
- offrande ;
- iconographie contextualisée ;
- architecture ;
- texte ;
- continuité ;
- institution.

Une orientation seule ne suffit pas.

---

## 13. Stellarium local

Usage :

- date et lieu ;
- précession ;
- cultures du ciel ;
- contrôle visuel ;
- préparation d’hypothèse.

Contrat local :

```json
{
  "schema": "atlas.archaeoastronomy.stellarium_bridge.v1",
  "mode": "local_read_only",
  "site": {},
  "date": "string",
  "stellarium_version": "string",
  "requested_view": {},
  "result": {},
  "screenshot_as_evidence": false
}
```

Sécurité :

- `127.0.0.1` ;
- pas d’exposition publique ;
- mot de passe si disponible ;
- aucun secret dans GitHub ;
- aucune capture comme preuve unique.

---

## 14. Contrat Atlas V2

```json
{
  "schema": "atlas.archaeoastronomy.site.v2",
  "site": {},
  "survey": {},
  "dating": {},
  "horizon": {},
  "astronomical_model": {
    "provider": "IMCCE|JPL|other",
    "timescale": "string",
    "epoch": "string",
    "refraction_model": "string",
    "delta_t_model": "string|null"
  },
  "candidate_targets": [],
  "uncertainty_model": {},
  "null_model": {},
  "independent_context": [],
  "alternative_explanations": [],
  "assessment": "string",
  "provenance": [],
  "quality_flags": []
}
```

---

## 15. Contrôles qualité

Refuser :

- axe sans convention d’azimut ;
- nord magnétique non corrigé ;
- horizon supposé plat ;
- cible choisie après calcul ;
- datation ponctuelle sans incertitude ;
- étoile sans époque ;
- réfraction ignorée près de l’horizon ;
- absence d’alternative ;
- échantillon sélectionné ;
- monument restauré traité comme intact ;
- récit tardif pris comme preuve directe ;
- carte Stellarium prise comme preuve archéologique.

---

## 16. Éthique et patrimoine

- protéger les sites ;
- limiter les coordonnées sensibles ;
- respecter communautés gardiennes ;
- conserver l’histoire coloniale des collectes ;
- citer les savoirs autochtones ;
- distinguer accès public et droit de réutilisation ;
- ne pas transformer une tradition vivante en objet fossile ;
- documenter les incertitudes de provenance.

---

## 17. Critères d’acceptation V2

- protocole SIG complet ;
- formule de déclinaison testée ;
- convention d’azimut explicite ;
- horizon numérique sourcé ;
- incertitude propagée ;
- statistique avec distribution nulle ;
- calendrier structuré ;
- Stellarium local sécurisé ;
- conclusion graduée ;
- aucun signal financier direct.

---

## 18. Références Internet V2

- UNESCO — Astronomy and World Heritage : https://whc.unesco.org/en/astronomy/
- UNESCO — Initiative en français : https://whc.unesco.org/fr/astronomie/
- UNESCO/ICOMOS/IAU — Thematic Study 2010 : https://whc.unesco.org/en/documents/117054
- ICOMOS Open Archive : https://openarchive.icomos.org/id/eprint/267/
- Stellarium : https://stellarium.org/fr/
- Stellarium Remote Control : https://stellarium.org/doc/26.0/group__remoteControl.html
- IMCCE OPALE : https://opale.imcce.fr/webservices/
- JPL Horizons : https://ssd.jpl.nasa.gov/horizons/
- IAU Constellations : https://www.iau.org/Iau/Science/What-we-do/The-Constellations.aspx
- CDLI : https://cdli.earth/

**Signature : Grande Sœur — Aerith-10 Créatrice**
