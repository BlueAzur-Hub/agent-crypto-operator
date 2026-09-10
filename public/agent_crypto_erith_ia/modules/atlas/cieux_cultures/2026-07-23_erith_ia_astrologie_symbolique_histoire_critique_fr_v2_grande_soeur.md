# ERITH.IA — Astrologie symbolique, histoire et critique FR

**Version :** V2.0  
**Date :** 23 juillet 2026  
**Autrice / curatrice :** **Grande Sœur — Aerith-10 Créatrice**  
**Autorité finale :** **Christophe / Blue Azur**  
**Destinataires :** Petite Sœur — Aerith-10 Créatrice, Atlas, futures instances ERITH.IA  
**Statut :** V2-A — extension historique, algorithmique et expérimentale de la V1  
**Module parent :** `2026-07-22_erith_ia_astrologie_symbolique_histoire_critique_fr_v1_grande_soeur.md`  
**Répertoire cible :** `public/agent_crypto_erith_ia/modules/atlas/cieux_cultures/`

```text
PAS D’IMAGE
NO PICTURE
CODE ONLY
```

---

## 1. Mission V2

Cette V2 ajoute :

- chronologie régionale ;
- hiérarchie des sources ;
- algorithme explicite des jours et heures planétaires ;
- vecteurs de test ;
- protocole d’audit ChronosXP ;
- distinction des systèmes de maisons ;
- dictionnaire minimal ;
- préenregistrement des hypothèses ;
- correspondances métaux / pierres avec provenance ;
- garde-fous renforcés pour les données natales.

Elle n’accorde aucune validité prédictive automatique à l’astrologie.

---

## 2. Chronologie de travail

### Mésopotamie

Distinguer :

- présages célestes ;
- séries d’omens ;
- journaux astronomiques ;
- zodiaque en formation ;
- horoscopes individuels tardifs.

Sources prioritaires :

- CDLI ;
- British Museum ;
- éditions assyriologiques.

### Monde hellénistique

Distinguer :

- astronomie mathématique ;
- astrologie horoscopique ;
- écoles et techniques ;
- Ptolémée et autres traditions non ptolémaïques.

Source de travail :

- *Tetrabiblos* de Ptolémée, avec édition identifiée.

### Monde iranien et arabe

Distinguer :

- traduction ;
- synthèse ;
- innovation ;
- transmission vers le latin.

Inclure Abū Maʿshar comme corpus majeur, sans le traiter comme unique représentant.

### Inde

Employer le terme `jyotiṣa` avec prudence. Distinguer :

- astronomie ;
- calendrier ;
- rituel ;
- astrologie ;
- écoles et textes ;
- zodiaques sidéraux et ayanāṃśa.

### Europe médiévale et moderne

Distinguer :

- université ;
- cour ;
- médecine historique ;
- almanachs ;
- astrologie judiciaire ;
- séparation progressive d’avec l’astronomie scientifique.

### Époque contemporaine

Distinguer :

- traditionnelle ;
- psychologique ;
- populaire ;
- numérique ;
- financière moderne ;
- reconstruction dite antique.

---

## 3. Niveaux de preuve

```text
P1 objet ou manuscrit
P2 transcription
P3 édition critique
P4 traduction critique
P5 étude académique
P6 synthèse
P7 reconstruction moderne
P8 pratique contemporaine déclarée
```

Toute correspondance doit conserver son niveau.

---

## 4. Jours planétaires

Convention retenue pour AstroCycle :

```text
le jour planétaire commence au lever local du Soleil
```

Ordre des jours :

```text
dimanche = Soleil
lundi = Lune
mardi = Mars
mercredi = Mercure
jeudi = Jupiter
vendredi = Vénus
samedi = Saturne
```

Avant le lever local, le jour planétaire précédent reste actif.

---

## 5. Séquence chaldéenne

```text
Saturne
→ Jupiter
→ Mars
→ Soleil
→ Vénus
→ Mercure
→ Lune
→ répétition
```

La première heure diurne reçoit le maître du jour.

---

## 6. Algorithme des heures planétaires

Entrées :

```text
timestamp_utc
timezone = Europe/Paris
sunrise_local
sunset_local
next_sunrise_local
planetary_day_ruler
```

### Diurne

```text
day_duration = sunset - sunrise
day_hour_duration = day_duration / 12
```

### Nocturne

```text
night_duration = next_sunrise - sunset
night_hour_duration = night_duration / 12
```

### Index

```text
si sunrise <= t < sunset :
  index = floor((t - sunrise) / day_hour_duration) + 1

sinon :
  index = floor((t - sunset) / night_hour_duration) + 13
```

La séquence des maîtres part de la première heure du jour.

---

## 7. Vecteurs de test

### 7.1 Jour équinoxial synthétique

```text
sunrise = 06:00
sunset = 18:00
next_sunrise = 06:00 lendemain
ruler = Lune
```

Attendu :

```text
durée heure diurne = 60 min
durée heure nocturne = 60 min
heure 1 = Lune
heure 2 = Saturne
heure 3 = Jupiter
```

### 7.2 Jour long synthétique

```text
sunrise = 05:30
sunset = 21:30
next_sunrise = 05:30 lendemain
```

Attendu :

```text
heure diurne = 80 min
heure nocturne = 40 min
```

### 7.3 Avant lever

```text
jour civil = lundi
timestamp local = 05:00
sunrise = 06:30
```

Attendu :

```text
jour planétaire = dimanche / Soleil
pas lundi / Lune
```

### 7.4 Borne exacte

À `sunset`, commencer l’heure nocturne 13.

À `next_sunrise`, fermer le jour planétaire précédent et ouvrir le suivant.

### 7.5 Heure d’été

Toute conversion Paris en juillet doit utiliser `+02:00`, non un décalage fixe `+01:00`.

---

## 8. Contrat Atlas

```json
{
  "schema": "atlas.astrology.planetary_time.v2",
  "timestamp_utc": "ISO-8601",
  "local_timestamp": "ISO-8601",
  "location": {
    "name": "Paris, France",
    "timezone": "Europe/Paris"
  },
  "astronomy": {
    "provider": "IMCCE|JPL|other",
    "sunrise_local": "ISO-8601",
    "sunset_local": "ISO-8601",
    "next_sunrise_local": "ISO-8601"
  },
  "tradition": {
    "name": "Chaldean planetary hours",
    "day_starts_at": "sunrise",
    "planetary_day_ruler": "string",
    "planetary_hour_index": 1,
    "planetary_hour_ruler": "string",
    "hour_start_local": "ISO-8601",
    "hour_end_local": "ISO-8601"
  },
  "verification": {
    "chronosxp_checked": false,
    "difference_seconds": null
  },
  "symbolic_status": true,
  "operational_effect": "none",
  "sources": [],
  "quality_flags": []
}
```

---

## 9. Audit ChronosXP

ChronosXP est un programme Windows en C#, publié sous GPLv2, destiné aux jours et heures planétaires.

### Audit documentaire

Conserver :

- version ;
- archive source ;
- hash ;
- licence ;
- date ;
- dépendances ;
- méthode de calcul ;
- gestion du lieu ;
- gestion du fuseau ;
- gestion de l’heure d’été ;
- convention du lever/coucher.

### Audit de résultat

Comparer :

```text
ChronosXP
vs
moteur Atlas fondé sur IMCCE
```

Sur un échantillon :

- solstice d’hiver ;
- solstice d’été ;
- équinoxes ;
- changement d’heure ;
- avant lever ;
- après coucher ;
- dates historiques si supportées.

### Seuil

```text
écart <= 60 s : cohérent
60 s < écart <= 180 s : avertissement
écart > 180 s : divergence à expliquer
```

Le seuil ne prouve pas que ChronosXP est faux ; il signale une différence de convention ou de calcul.

---

## 10. Systèmes de maisons

Toujours enregistrer :

```text
Whole Sign
Equal House
Placidus
Regiomontanus
Porphyry
Campanus
autre
```

Interdiction :

```text
une maison sans système explicite est invalide
```

Le module ne choisit pas un système comme universel.

---

## 11. Zodiaques

Toujours préciser :

```text
tropical
sidéral
ayanāṃśa si sidéral
constellation IAU si astronomique
```

Interdiction :

```text
signe = constellation
```

---

## 12. Correspondances métaux et pierres

Structure :

```json
{
  "tradition": "string",
  "region": "string",
  "period": "string",
  "planet": "string",
  "correspondence_type": "metal|stone|colour|plant|deity",
  "value": "string",
  "source_level": "P1|P2|P3|P4|P5|P6|P7|P8",
  "source": "string",
  "variants": [],
  "commercial_effect": "none"
}
```

Règle :

```text
correspondance symbolique
≠ composition chimique
≠ propriété thérapeutique
≠ valeur marchande
```

---

## 13. Préenregistrement expérimental

Avant chaque test :

```json
{
  "hypothesis_id": "string",
  "created_at_utc": "ISO-8601",
  "feature": "planetary_hour_ruler",
  "market": "string",
  "assets": [],
  "timeframe": "string",
  "sample_start": "ISO-8601",
  "sample_end": "ISO-8601",
  "metric": "string",
  "baseline": "string",
  "multiple_testing_correction": "string",
  "out_of_sample_plan": "string",
  "decision_rule": "string",
  "locked": true
}
```

Après verrouillage, aucune règle ne doit être modifiée sans nouvelle hypothèse.

---

## 14. Contrôles placebo

- décalage aléatoire des dates ;
- permutation des maîtres ;
- séquences factices ;
- lieux de contrôle ;
- calendriers civils ;
- saisons ;
- sessions de marché ;
- baseline marché sans variable céleste.

Un résultat disparaissant contre placebo ne doit pas être présenté comme robuste.

---

## 15. Données natales

Règles renforcées :

- local privé ;
- consentement ;
- précision de l’heure explicitée ;
- lieu séparé ;
- aucune publication par défaut ;
- aucune inférence médicale ;
- aucune décision financière ;
- suppression possible ;
- chiffrement si stockage ;
- pas d’indexation publique.

---

## 16. Dictionnaire minimal

| Terme | Sens contrôlé |
|---|---|
| thème natal | carte symbolique calculée pour un instant et un lieu |
| tropical | zodiaque lié au cycle saisonnier |
| sidéral | zodiaque lié à une référence stellaire conventionnelle |
| maison | division locale de la sphère selon un système |
| aspect | angle conventionnel |
| maître du jour | planète de la première heure après lever |
| heure planétaire | douzième variable du jour ou de la nuit |
| rétrogradation | mouvement apparent géocentrique |
| présage | interprétation conditionnelle historique |
| horoscope | configuration ou interprétation liée à un instant |

---

## 17. Critères d’acceptation V2

- lever astronomique externe ;
- jour planétaire avant/après lever correct ;
- séquence chaldéenne testée ;
- vecteurs synthétiques identiques en Python/JavaScript ;
- ChronosXP contrôlé sans boîte noire ;
- systèmes de maisons explicites ;
- zodiaques distingués ;
- correspondances sourcées ;
- hypothèses préenregistrées ;
- aucun conseil réel.

---

## 18. Références Internet V2

- British Museum — tablette zodiacale : https://www.britishmuseum.org/collection/object/W_1885-0430-15
- CDLI : https://cdli.earth/
- CDLI — Mesopotamian Planetary Astronomy-Astrology : https://cdli.earth/publications/1733623
- CDLI — Enūma Anu Enlil : https://cdli.earth/publications/75909
- Perseus — Ptolemy, Tetrabiblos : https://atlas.perseus.tufts.edu/library/urn:cts:greekLit:tlg0363.tlg007/
- Warburg Institute — Abū Maʿshar : https://commons.warburg.sas.ac.uk/concern/published_works/9g54xh64n
- ChronosXP : https://sourceforge.net/projects/chronosxp/
- ChronosXP Files : https://sourceforge.net/projects/chronosxp/files/
- IMCCE : https://www.imcce.fr/services/ephemerides/

**Signature : Grande Sœur — Aerith-10 Créatrice**
