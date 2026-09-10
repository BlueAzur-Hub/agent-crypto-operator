# FORGE D’AERITH PRO — V3.3R7 AIDE CRÉATION GUIDÉE

**Date :** 27 juillet 2026  
**Statut :** candidate locale testée — aucun push GitHub  
**Base préservée :** interface V3.3  
**Version remplacée :** V3.3R6, refusée fonctionnellement

---

## 1. Pourquoi une R7

La R6 reconnaissait correctement les sources et les modules, mais son parcours restait incompréhensible :

- l’étape Core + Persona arrivait avant le chargement des sources ;
- un ZIP privé était accepté visuellement mais non décompressé ;
- `15 actifs / 0 inclus` pouvait malgré tout conduire à `PRÊT 100 %` ;
- le ZIP final pouvait ne contenir que huit fichiers ;
- l’utilisateur devait deviner la différence entre référencé, chargé, actif et inclus ;
- l’aide n’indiquait pas clairement la prochaine action.

La R7 remplace cette logique par une aide de création réellement guidée.

---

## 2. Parcours principal Créatrice

### Étape 06 — Sources

Une seule action recommandée :

`CHARGER LE PACK PRIVÉ COMPLET (.ZIP)`

Le navigateur ouvre le ZIP localement. Aucun fichier privé n’est envoyé sur Internet.

Le pack attendu contient exactement :

- 1 Core ;
- 1 Persona ;
- 1 README routeur ;
- 15 modules.

**Total source : 18 fichiers.**

La Forge affiche directement :

`18 / 18 sources reconnues`

### Étape 07 — Core + Persona

L’utilisateur consulte ensuite les vrais contenus chargés :

- Core réel ;
- Persona réelle ;
- fiche factuelle.

Aucun texte de remplacement n’est généré pour un profil existant.

### Étape 08 — Forge finale

La Forge affiche avant compilation :

- le mode du paquet ;
- le total exact attendu ;
- la liste de tous les chemins produits ;
- les éléments bloquants éventuels.

Le téléchargement reste désactivé si un fichier requis manque.

---

## 3. Trois modes de paquet

### Profil complet — recommandé

Créatrice :

- 6 documents Forge ;
- Core ;
- Persona ;
- README routeur ;
- 15 modules.

**Total : 24 fichiers.**

Crypto / Atlas :

- 6 documents Forge ;
- Core ;
- Persona ;
- README routeur ;
- 8 modules.

**Total : 17 fichiers.**

### Profil minimal

- 6 documents Forge ;
- Core ;
- Persona.

**Total : 8 fichiers.**

### Profil ciblé

- 8 fichiers de base ;
- README routeur ;
- modules de la route active.

Exemple `Workflow + continuité` :

- module 14 ;
- module 15.

**Total : 11 fichiers.**

---

## 4. Pack privé Créatrice livré séparément

Nom :

`AERITH_10_CREATRICE_PACK_PRIVE_COMPLET_18_SOURCES.zip`

Le pack est séparé de l’archive publique de la Forge afin d’éviter toute publication accidentelle des sources privées.

Il contient :

- `core/AERITH_10_CREATRICE_MULTI_AGENT_CORE.md` ;
- `core/AERITH_10_CREATRICE_PERSONA_OPERATING_LAYER.md` ;
- `modules/aerith_10_creatrice/README.md` ;
- les modules 01 à 15.

---

## 5. Gestion locale du ZIP

La R7 embarque localement `JSZip` comme bibliothèque technique.

Fonctionnement :

1. l’utilisateur choisit le ZIP ;
2. le navigateur ouvre l’archive en mémoire ;
3. chaque entrée devient un fichier local reconnu par la Forge ;
4. les chemins internes sont conservés ;
5. les fichiers sont utilisés sans transmission réseau ;
6. les octets originaux sont recopiés dans le ZIP final.

Aucune source privée n’est incluse dans les fichiers publics de la Forge.

---

## 6. Routage des modules Créatrice

- Production musicale : 01, 03, 04, 12, 14
- Vidéo / action : 02, 06, 12, 14
- Image clé : 01, 05, 11, 13
- Contrôle qualité : 08
- Wan / last frame : 14
- ComfyUI / RunningHub : 15
- Workflow + continuité : 14, 15
- Full Dense : 01 à 15

La route choisit les compétences actives.

Le mode du paquet décide ce qui est inclus :

- complet : tous les modules ;
- minimal : aucun module ;
- ciblé : modules de la route active.

---

## 7. Verrous de compilation

La Forge bloque le ZIP final lorsque :

- le Core manque ;
- la Persona manque ;
- la confirmation humaine manque ;
- le README routeur manque dans un paquet avec modules ;
- un module requis manque ;
- un profil ciblé ne possède aucune route ;
- le nombre produit ne correspond pas au nombre attendu.

Le générateur vérifie une seconde fois le nombre de fichiers juste avant le téléchargement.

---

## 8. Tests exécutés

### Pack complet Créatrice

- sources reconnues : 18 / 18 ;
- statut : PACK COMPLET ;
- Core affiché : oui ;
- Persona affichée : oui ;
- état final : PRÊT · 24 FICHIERS ;
- liste prévisionnelle : 24 chemins ;
- ZIP produit : 24 fichiers ;
- README routeur présent : oui ;
- module 15 présent : oui ;
- erreurs JavaScript : 0.

### Profil minimal

- bouton annoncé : 8 fichiers ;
- ZIP produit : 8 fichiers.

### Profil ciblé 14 + 15

- bouton annoncé : 11 fichiers ;
- ZIP produit : 11 fichiers.

### Pack incomplet

Un pack test sans module 15 donne :

- 17 / 18 sources ;
- état : À COMPLÉTER ;
- bouton final : désactivé.

### Identité octet pour octet

Les 18 sources du pack privé complet ont été comparées aux 18 fichiers intégrés dans le ZIP final complet.

**Résultat : 18 / 18 identiques.**

Les détails sont dans :

`BYTE_IDENTITY_V3_3R7.json`

---

## 9. Aide visuelle

La R7 ajoute :

- une grande carte `ACTION RECOMMANDÉE` ;
- un bouton principal unique pour le pack privé ;
- un compteur `18 / 18` ;
- trois modes de paquet lisibles ;
- une checklist Core / Persona / Routeur / Modules ;
- une ligne `Prochaine action` ;
- des méthodes avancées repliées ;
- une prévisualisation exacte du ZIP final.

Les boutons de navigation font défiler la page vers le début réel du panneau actif.

---

## 10. Formulations verrouillées restaurées

En-tête :

`AERITH-10 CRÉATRICE CONSEILLÈRE · PROFILE FOUNDRY`

Titre :

`Compiler les profils.`  
`Faire naître les prochaines Aerith.`

---

## 11. Confidentialité

L’archive publique R7 ne contient :

- aucun Core privé Créatrice ;
- aucune Persona privée Créatrice ;
- aucun module privé Créatrice ;
- aucun ZIP de test contenant ces sources.

Le pack privé est livré séparément.

---

## 12. Test local

Depuis le dossier contenant `atlas_10_full` :

`python -m http.server 8000`

Puis ouvrir :

`http://localhost:8000/atlas_10_full/`

Charger ensuite :

`AERITH_10_CREATRICE_PACK_PRIVE_COMPLET_18_SOURCES.zip`

---

## 13. Commit

```text
forge: replace R6 with guided private-pack workflow

- accept one private ZIP containing Core, Persona, router README and modules
- unpack ZIP sources locally in the browser without network transfer
- default existing module profiles to complete packaging
- distinguish complete, minimal and targeted package modes
- require 18/18 Creator sources for the complete 24-file package
- block final compilation when the expected file list is incomplete
- preview every output path and verify the generated file count
- place source loading before Core and Persona verification
- add explicit next-action guidance and high-contrast status cards
- preserve the V3.3 interface, profile content and source bytes
```

---

## 14. État final

- R6 : refusée fonctionnellement ;
- R7 : candidate locale corrigée et testée ;
- GitHub : aucun push effectué ;
- prochaine décision : validation humaine dans Firefox avant publication.
