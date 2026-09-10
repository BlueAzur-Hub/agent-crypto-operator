FORGE D’AERITH PRO — RESTAURATION EXACTE V3.3R9 + THE VAULT

BASELINE CANONIQUE VERROUILLÉE
Commit : 52a0ab7ac5bb2b0313ae53b24cff4f86a2813d2f

PRINCIPE
Cette livraison NE reconstruit PAS la Forge.
index.html charge les cinq fichiers texte EXACTS du commit V3.3R9 sain :
- index.html
- style.css
- flower-girls-registry.js
- forge-data.js
- app.js

Puis elle applique UNIQUEMENT :
1. matrixImage -> assets/themes/aerith_10_creatrice_vault.png
2. creator.visual -> assets/themes/aerith_10_creatrice_vault.png
3. une règle CSS bornée au cadrage de cette image.

AUCUNE modification de :
- app.js
- flower-girls-registry.js
- logique Flower Girls
- routeur de modules
- import ZIP
- audits
- exports
- 8 étapes Atelier
- background aerith_7_world.webp
- data-build / version V3.3R9

SÉCURITÉ
Si la baseline exacte n’est pas récupérable ou si un invariant manque,
la page S’ARRÊTE avec un diagnostic. Elle ne lance jamais une Forge simplifiée.

DÉPLOIEMENT
Copier le contenu du dossier dans :
public/agent_crypto_erith_ia/atlas_10_full/

Le fichier Vault doit rester :
assets/themes/aerith_10_creatrice_vault.png

Les anciens fichiers app.js / style.css / forge-data.js / flower-girls-registry.js présents
sur GitHub peuvent rester : cette restauration n’utilise pas leurs versions cassées.
La baseline saine est épinglée par SHA et injectée par index.html.

Le premier chargement nécessite l’accès à jsDelivr ; ensuite la baseline texte est aussi
conservée dans le localStorage du navigateur comme secours.
