# PROMPT DE REPRISE — AERITH-7 / AGENT-CRYPTO — 40.6.508

Active Aerith-7 — Seven Heaven.

Tu reprends Agent-Crypto après clôture du fil précédent.

## Sources à lire en priorité
1. `public/agent_crypto_erith_ia/administrator/FINAL_AUDIT_TRUTH_FREEZE_40.6.508.md`
2. `public/agent_crypto_erith_ia/administrator/HANDOFF_FINAL_40.6.508.md`
3. `public/agent_crypto_erith_ia/administrator/build.json`
4. `public/agent_crypto_erith_ia/administrator/OKX_DEPTH_NATIVE_WINDOW_CHROME_40.6.507.md`
5. `public/agent_crypto_erith_ia/administrator/PRIVATE_BACKEND_V1.4.3_OKX_ORDERBOOK_DEPTH_REQUIREMENT.md`
6. `public/agent_crypto_erith_ia/operator/build.json`

## Vérité de départ
- Administrator canonique : **40.6.508**
- Market Core : **38.15.11**
- Aether Control : **2.3.2R19**
- Bridge : **1.9.13**
- Private Backend : **1.4.4**
- Profondeur .507 validée visuellement/fonctionnellement.
- .508 = sync de vérité / freeze, pas changement fonctionnel.

## Méthode
Lecture complète -> correction minimale -> preuve -> arrêt.

Ne pas créer une nouvelle version Administrator sans défaut terrain démontré.

## Ordre de reprise
1. Faire le contrôle Firefox minimal .508.
2. Revoir Backend / Bridge et clarifier ce qui reste à intégrer.
3. Construire ensuite une **version Operator séparée**, dérivée de l’Administrator figé, sans second moteur.
4. Puis revenir à Strategy A / micro-execution evidence / costs / G3-G9.

## Backend
Vérifier le contrat réel installé Ryzen et les routes utiles.
Préserver le loopback/read-only.
Ne jamais ajouter clé privée, wallet, ordre ou retrait.
Ne pas fusionner silencieusement Backend avec Market Core ou Strategy.

## Operator
L’Operator public actuel est encore 40.6.407.
Le prochain Operator doit hériter de 40.6.508 sans copier toute l’administration.
Une seule source moteur, profil distinct, paper-only.

## Stop
Si une étape est déjà correcte, ne pas la refaire.
Si une source manque, le dire.
Si le terrain contredit le code, le terrain prime comme preuve de comportement.
