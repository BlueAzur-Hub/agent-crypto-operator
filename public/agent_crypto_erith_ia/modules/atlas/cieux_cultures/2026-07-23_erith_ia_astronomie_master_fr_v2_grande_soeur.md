# ERITH.IA — Astronomie Master FR

**Version :** V2.0  
**Date :** 23 juillet 2026  
**Autrice / curatrice :** **Grande Sœur — Aerith-10 Créatrice**  
**Autorité finale :** **Christophe / Blue Azur**  
**Destinataires :** Petite Sœur — Aerith-10 Créatrice, Atlas, futures instances ERITH.IA  
**Statut :** V2-A — extension calculable du module V1, sans écrasement de la V1  
**Module parent :** `2026-07-22_erith_ia_astronomie_master_fr_v1_grande_soeur.md`  
**Répertoire cible :** `public/agent_crypto_erith_ia/modules/atlas/cieux_cultures/`  
**Format :** Markdown / Notion compatible

```text
PAS D’IMAGE
NO PICTURE
CODE ONLY
```

---

## 1. Mission V2

Cette V2 transforme la fondation astronomique V1 en contrat calculable, testable et interopérable pour Atlas.

Elle ajoute :

- échelles de temps détaillées ;
- contrats de requête et de provenance ;
- validation croisée IMCCE / JPL ;
- vecteurs de test déterministes ;
- tolérances ;
- règles de cache et de dégradation ;
- contrat local Stellarium ;
- exigences pour AstroCycle Paris ;
- compatibilité JavaScript / Python.

Elle ne remplace pas la V1. Elle la complète.

---

## 2. Hiérarchie des sources

### Niveau A — source calculable principale

```text
IMCCE OPALE
JPL Horizons
```

Règle :

```text
un calcul utilisé par Atlas doit enregistrer
le fournisseur
la version
la requête
l’échelle de temps
le repère
le lieu
les conventions
la date de récupération
```

### Niveau B — standards

```text
IERS
IAU
```

Rôle :

- échelles de temps ;
- systèmes de référence ;
- précession et nutation ;
- transformations terrestres / célestes ;
- définitions des constellations.

### Niveau C — contrôle humain

```text
Stellarium
```

Stellarium peut afficher, contrôler et faciliter l’exploration. Il ne remplace pas une réponse exportable d’IMCCE ou JPL.

---

## 3. Échelles de temps

### 3.1 UTC

UTC est la référence opérationnelle pour :

- marchés ;
- archives ;
- journaux ;
- identifiants de snapshots ;
- synchronisation inter-systèmes.

### 3.2 UT1

UT1 suit la rotation réelle de la Terre. Il intervient dans les transformations entre repères terrestres et célestes.

Atlas doit conserver :

```text
timescale_requested
timescale_returned
dut1_if_used
```

### 3.3 TAI

Temps atomique international. UTC en dérive avec l’ajout historique de secondes intercalaires ; TAI reste continu.

### 3.4 TT

Temps terrestre :

```text
TT = TAI + 32.184 s
```

Il sert de référence à de nombreux calculs géocentriques.

### 3.5 TDB

Temps dynamique barycentrique, utilisé dans les éphémérides barycentriques et pratiquement proche de l’argument temporel des éphémérides JPL.

### 3.6 Règle de stockage

```json
{
  "timestamp_utc": "ISO-8601",
  "timescale_source": "UTC|UT1|TT|TDB",
  "timescale_conversion_method": "string",
  "leap_second_table_version": "string|null",
  "dut1_seconds": null
}
```

Interdiction :

```text
ne jamais convertir silencieusement une valeur TT ou TDB en UTC
```

---

## 4. Lieu canonique AstroCycle

```json
{
  "name": "Paris, France",
  "timezone": "Europe/Paris",
  "latitude_deg": 48.8566,
  "longitude_deg": 2.3522,
  "altitude_m": null
}
```

Règles :

- `Europe/Paris`, jamais `UTC+1` fixe ;
- lever et coucher calculés topocentriquement ;
- altitude et horizon réel signalés si inconnus ;
- heure locale dérivée depuis le timestamp UTC ;
- changement d’heure géré par base IANA.

---

## 5. Contrat de requête IMCCE

Exemple logique :

```json
{
  "provider": "IMCCE_OPALE",
  "endpoint_family": "phenomena/rts",
  "body": "Sun",
  "date": "YYYY-MM-DD",
  "observer": {
    "latitude_deg": 48.8566,
    "longitude_deg": 2.3522,
    "altitude_m": 0
  },
  "timescale": "UTC",
  "calendar": "gregorian",
  "twilight": false
}
```

Conserver la requête normalisée et le statut du service.

OPALE expose notamment :

- lever, transit, coucher ;
- positions ;
- éclipses ;
- occultations ;
- phénomènes.

---

## 6. Contrat de requête JPL Horizons

```json
{
  "provider": "JPL_HORIZONS",
  "target": "string",
  "observer_center": "string",
  "start_time": "ISO-8601",
  "stop_time": "ISO-8601",
  "step": "string",
  "timescale": "UTC|TDB",
  "reference_frame": "ICRF|other",
  "quantities": ["RA_DEC", "AZ_EL", "RANGE", "MAG", "PHASE"]
}
```

Règle :

```text
vérifier les paramètres par défaut
avant chaque exécution automatisée
```

---

## 7. Validation croisée

### 7.1 Cibles

Pour une même date et un même observateur :

- lever solaire ;
- coucher solaire ;
- transit ;
- ascension droite ;
- déclinaison ;
- azimut ;
- hauteur ;
- distance ;
- fraction illuminée de la Lune.

### 7.2 Tolérances initiales de laboratoire

Ces tolérances sont des seuils de contrôle, non des promesses universelles :

```text
lever/coucher Soleil : alerte si écart > 120 s
transit : alerte si écart > 120 s
RA/Dec planètes : alerte si écart > 5 arcsec
azimut/hauteur : alerte si écart > 0.05°
distance lunaire : alerte si écart relatif > 1e-5
fraction illuminée : alerte si écart > 0.2 point de pourcentage
```

Toute divergence exige :

- même instant ;
- même lieu ;
- même repère ;
- même correction atmosphérique ;
- même convention de lever/coucher ;
- même échelle de temps.

---

## 8. Vecteurs de test déterministes

### 8.1 Fuseau Paris — hiver

Entrée :

```text
UTC = 2026-01-15T12:00:00Z
timezone = Europe/Paris
```

Attendu :

```text
local = 2026-01-15T13:00:00+01:00
```

### 8.2 Fuseau Paris — été

Entrée :

```text
UTC = 2026-07-15T12:00:00Z
timezone = Europe/Paris
```

Attendu :

```text
local = 2026-07-15T14:00:00+02:00
```

### 8.3 Interdiction du décalage fixe

Un moteur utilisant `UTC+1` pour juillet doit échouer.

### 8.4 Phase lunaire

Entrées synthétiques :

```text
illumination = 50 %
elongation croissante
```

Attendu :

```text
premier quartier possible
pas dernier quartier
```

Entrées :

```text
illumination = 50 %
elongation décroissante
```

Attendu :

```text
dernier quartier possible
pas premier quartier
```

### 8.5 Coordonnées horizontales

Entrée synthétique :

```text
azimuth = 90°
altitude = 0°
```

Attendu :

```text
objet à l’horizon est
```

### 8.6 Provenance obligatoire

Une réponse sans :

```text
provider
retrieved_at
timescale
observer
```

doit être marquée `incomplete_provenance`.

---

## 9. Contrat de réponse Atlas

```json
{
  "schema": "atlas.astronomy.observation.v2",
  "request_id": "string",
  "observed_at_utc": "ISO-8601",
  "location": {
    "name": "Paris, France",
    "timezone": "Europe/Paris",
    "latitude_deg": 48.8566,
    "longitude_deg": 2.3522,
    "altitude_m": null
  },
  "time": {
    "requested_scale": "UTC",
    "returned_scale": "UTC",
    "local_timestamp": "ISO-8601",
    "dut1_seconds": null
  },
  "reference": {
    "frame": "topocentric",
    "coordinates": "horizontal|equatorial|ecliptic",
    "epoch": "J2000|date|other",
    "refraction_model": "string|null"
  },
  "provider": {
    "name": "IMCCE_OPALE|JPL_HORIZONS|other",
    "api_version": "string|null",
    "library_version": "string|null",
    "request_normalized": {},
    "retrieved_at_utc": "ISO-8601"
  },
  "objects": [],
  "cross_validation": {
    "secondary_provider": "string|null",
    "differences": [],
    "status": "not_run|pass|warning|fail"
  },
  "quality_flags": []
}
```

---

## 10. Cache et dégradation

### Cache

```text
clé = provider + requête normalisée + version + instant
```

### Durées indicatives

- positions historiques stables : cache long ;
- lever/coucher par date : cache long après validation ;
- état d’un service : cache court ;
- données temps réel : selon finalité.

### Dégradation

```text
provider principal indisponible
→ utiliser cache validé
→ sinon fournisseur secondaire
→ sinon état indisponible
→ jamais inventer
```

---

## 11. Contrat local Stellarium

Le pont Stellarium est local uniquement.

### Autorisé

- lire l’état ;
- lire l’heure ;
- lire le lieu ;
- lire l’objet sélectionné ;
- contrôler la vue pour vérification ;
- comparer grossièrement le ciel.

### Sécurité

```text
bind local uniquement
mot de passe si le plugin l’autorise
aucune exposition publique
aucune clé dans GitHub
aucun accès distant par défaut
journaliser les requêtes
```

### Schéma

```json
{
  "schema": "atlas.stellarium.local_bridge.v1",
  "base_url": "http://127.0.0.1:PORT",
  "plugin": "Remote Control",
  "stellarium_version": "string",
  "status": "connected|disconnected",
  "location": {},
  "time": {},
  "selected_object": {},
  "read_only_mode": true
}
```

---

## 12. AstroCycle

Chaîne obligatoire :

```text
UTC marché
→ Europe/Paris
→ lever/coucher astronomique
→ jour planétaire
→ heure planétaire
→ étiquette symbolique
→ test statistique
→ aucun ordre réel
```

Le calcul des heures planétaires n’appartient pas au fournisseur astronomique ; il consomme les levers et couchers validés.

---

## 13. Tests JavaScript / Python attendus

Fonctions minimales :

```text
normalizeTimestamp
convertToIanaTimezone
validateObserver
normalizeProviderRequest
compareEphemerides
computeQualityFlags
serializeObservation
```

Résultats Python et JavaScript doivent être identiques sur les vecteurs déterministes, hors différences d’arrondi explicitement tolérées.

---

## 14. Critères d’acceptation V2

- Paris géré avec `Europe/Paris` ;
- UTC / UT1 / TT / TDB distingués ;
- requêtes IMCCE et JPL traçables ;
- tolérances explicites ;
- validation croisée possible ;
- cache sans fabrication ;
- Stellarium local et sécurisé ;
- aucun calcul symbolique ne remplace l’éphéméride ;
- aucun signal financier direct.

---

## 15. Références Internet V2

- IMCCE OPALE API : https://opale.imcce.fr/webservices/api.html
- IMCCE Web services : https://opale.imcce.fr/webservices/
- JPL Horizons : https://ssd.jpl.nasa.gov/horizons/
- JPL Horizons Manual : https://ssd.jpl.nasa.gov/horizons/manual.html
- JPL Horizons API : https://ssd-api.jpl.nasa.gov/doc/horizons.html
- IERS Conventions 2010 : https://www.iers.org/IERS/EN/Publications/TechnicalNotes/tn36
- IERS Glossary : https://www.iers.org/iers/en/service/glossary/functions/glossary
- IAU Constellations : https://www.iau.org/Iau/Science/What-we-do/The-Constellations.aspx
- Stellarium : https://stellarium.org/fr/
- Stellarium Remote Control : https://stellarium.org/doc/26.0/group__remoteControl.html

**Signature : Grande Sœur — Aerith-10 Créatrice**
