#!/usr/bin/env python3
from pathlib import Path
import json, re, sys

root = Path(__file__).resolve().parent
index = (root / "index.html").read_text(encoding="utf-8")
app = (root / "app.js").read_text(encoding="utf-8")
data = (root / "forge-data.js").read_text(encoding="utf-8")
registry = (root / "flower-girls-registry.js").read_text(encoding="utf-8")
g = json.loads((root / "GOLDEN_MASTER_HOME.json").read_text(encoding="utf-8"))
errors = []

for text in g["required_home_strings"]:
    if text not in index:
        errors.append(f"Accueil manquant: {text}")
for text in g["forbidden_home_strings"]:
    if text in index:
        errors.append(f"Accueil interdit présent: {text}")

checks = {
    'Profil Créatrice par défaut': 'find(item => item.id === "creator")' in app,
    'Nouvelle Aerith générique': 'name: "Nouvelle Aerith"' in data and 'level: "À définir"' in data,
    'Séparation des parcours': 'function existingSourceAudit()' in app and 'function renderWorkflowCopy()' in app,
    'Proposals masquées pour existant': 'downloads.hidden = !creating' in app,
    'Protection téléchargement Proposal': 'Ce profil existe déjà : aucune proposition n’est générée.' in app,
    'Préservation des chemins importés': 'if (!isNew() && state.identity[key]) continue;' in app,
    'Normalisation multi-Aerith': 'replace(/^AERITH_?([0-9]+)_?/' in app,
    'Routeuse reconnue comme existante': 'function isExistingFlowerGirl()' in app,
    'Export source fidèle': 'new Uint8Array(await core.file.arrayBuffer())' in app and 'new Uint8Array(await persona.file.arrayBuffer())' in app,
}
for label, ok in checks.items():
    if not ok:
        errors.append(label)

for text in [g["routeuse"]["profile_status"], g["routeuse"]["persona_status"], g["routeuse"]["core"], g["routeuse"]["persona"]]:
    if text not in registry:
        errors.append(f"Routeuse incohérente: {text}")

if re.search(r'ChatGPT|Grok|Claude|Gemini', index + app + data, re.I):
    errors.append("Marque de plateforme présente dans les fichiers actifs")

if errors:
    print("ÉCHEC — V3.3R2")
    for error in errors:
        print("-", error)
    sys.exit(1)

print("OK — V3.3R2 : accueil préservé, titre multi-Aerith, Créatrice Conseillère distincte, profils existants sans Proposal, export source-fidèle.")
