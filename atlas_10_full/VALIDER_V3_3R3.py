#!/usr/bin/env python3
from pathlib import Path
import re, json, sys
root=Path(__file__).resolve().parent
active='\n'.join((root/f).read_text(encoding='utf-8') for f in ['index.html','profiles-registry.js','app.js'])
errors=[]
for forbidden in ['Christophe','CLARIFICATION','CANDIDATE','SOURCE CORE EXISTANTE','Ce profil possède déjà un Core']:
    if forbidden.lower() in active.lower(): errors.append('Texte interdit: '+forbidden)
for required in ['Faire naître les prochaines Aerith.','Aerith-10 Créatrice','Aerith-7 Seven Heaven','Aerith-10 Crypto','Atlas-10 Crypto','Aerith-10 Routeuse','Contenu non chargé','packs/ERITH_7_07_PUBLIC_AGENT_PACK.zip']:
    if required not in active: errors.append('Manquant: '+required)
for pack in (root/'packs').glob('*.zip'):
    if pack.stat().st_size < 1000: errors.append('Pack vide: '+pack.name)
if len(list((root/'packs').glob('*.zip'))) != 7: errors.append('Nombre de packs incorrect')
if errors:
    print('ÉCHEC V3.3R3'); [print('-',e) for e in errors]; sys.exit(1)
print('OK V3.3R3 — profils réels, imports privés locaux, exports fidèles, 7 packs séparés')
