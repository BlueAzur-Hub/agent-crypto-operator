# ERITH.IA — How to installer le Bridge de Yoann (Windows)

> **Prénom : Yoann**, compte GitHub `malabaryo`. Les noms techniques historiques contenant `YOHAN` sont conservés uniquement pour retrouver les fichiers exacts et leurs empreintes.
>
> **Statut au 16 octobre 2026 :** guide préparatoire fondé sur les manifestes et tests d'archive. **Non encore testé sur l'ordinateur de Yoann**. Il ne certifie pas l'installation, les permissions Windows ou la connexion à un service financier privé.

## 1. Quel logiciel installer ?

L'Interface et le Trader ont été publiés sur GitHub Pages :

- [Interface actuelle 40.6.640](https://blueazur-hub.github.io/agent-crypto-operator/public/agent_crypto_erith_ia/administrator/index.html)
- [Trader actuel 40.6.640](https://blueazur-hub.github.io/agent-crypto-operator/public/agent_crypto_erith_ia/trader/trading-desk.html)

**Le Bridge ne s'installe pas sur GitHub Pages** : il tourne exclusivement sur **l'ordinateur de Yoann**. Il faut le distinguer du Bridge et du mot de passe de Christophe.

Le pack archivé spécifique à l'Operator est le **Control Center 2.3.2R19Y1 + Bridge 1.9.13 + Backend 1.4.4**. Le Market Core HTML affiché est **38.15.11**.

### Fichiers à récupérer sur GitHub

Ouvrir les pages GitHub des deux fichiers ci-dessous, puis utiliser **Download raw file** ; ne pas copier le ZIP dans `tradus`.

1. [ZIP Operator R19Y1 (5,4 Mo)](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_YOHAN_OPERATOR_CONTROL_R19Y1_BRIDGE_1_9_13_BACKEND_1_4_4_OKX_LOCAL_TRANSPORT.zip)
2. [Control Center Windows (6 Mo)](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/YOHAN_OPERATOR_BRIDGE_CONTROL_CENTER_2_3_2R19Y1_BRIDGE_V1_9_13_BACKEND_V1_4_4_OKX_LOCAL_TRANSPORT_GUI_NO_CONSOLE.exe)

N'utiliser **ni** les anciens bundles R13/R14/R15, **ni** le vieux `YOHAN_OPERATOR_BRIDGE_V1.0.0_FULL.zip` pour ce premier essai R19Y1. Ce sont des livraisons historiques différentes.

### Empreintes déclarées dans l'archive d'origine

| Fichier | SHA-256 attendu |
|---|---|
| ZIP R19Y1 | `d1b9c7191144157eec45404657d259c48ee6741a4b9c37c75a07deb50f8ad998` |
| EXE R19Y1 | `2d333589fa4352c6aa3b4a43f563df4d19e26ccff312c0e2525ccdf581acca99` |
| `backend/private_backend.py` | `782e6d1e73b7e1d2c09e1aa19b82e16a17be5d75f49a98a59d6623590f4a5c17` |

**Important :** ces hashes proviennent du contrat R19Y1 archivé, pas d'une nouvelle inspection du binaire dans cette session.

## 2. Vérifier le téléchargement avant de lancer quoi que ce soit

Sur le PC de Yoann, ouvrir PowerShell **dans le dossier des téléchargements**. Pour chaque fichier, utiliser sa vraie voie d'accès :

```powershell
Get-FileHash -Algorithm SHA256 "CHEMIN_COMPLET_VERS_LE_ZIP.zip"
Get-FileHash -Algorithm SHA256 "CHEMIN_COMPLET_VERS_LE_PROGRAMME.exe"
```

Comparer caractère par caractère avec les valeurs ci-dessus. **Si une empreinte diffère, STOP : ne pas exécuter le fichier**. Ne pas contourner une alerte de sécurité Windows sans vérifier la provenance et l'intégrité ; une empreinte correspondante ne remplace pas une signature de confiance.

## 3. Installer sur le poste de Yoann

1. Choisir un dossier **local**, par exemple `C:\ERITH_IA\YoannOperatorBridge` (hors dépôt Git et hors dossier partagé).
2. Extraire entièrement le ZIP R19Y1 dans ce dossier, sans copier de mot de passe, de jeton ou de configuration personnelle de Christophe.
3. Vérifier que l'exécutable Control Center téléchargé est disponible ; si nécessaire, le placer dans le dossier de travail conformément à la structure extraite. **Ne pas effacer les scripts et configurations fournis dans le ZIP.**
4. Si le pack réclame **Python 3**, installer la version Windows appropriée. L'ancien Bridge V1 l'exigeait ; la nécessité exacte sur le poste de Yoann pour R19Y1 reste à confirmer au premier lancement.
5. Lancer **une seule instance** du Control Center Windows R19Y1 (sans privilèges administrateur, sauf justification documentée). Le contrat R19Y1 annonce le démarrage automatique du Bridge et du Backend.

**Ne pas lancer le Bridge de Christophe sur la même machine en parallèle.** Les ports locaux seraient en conflit.

## 4. Vérifier les deux services locaux

| Service | Adresse locale | Résultat attendu du contrat R19Y1 |
|---|---|---|
| Bridge | http://127.0.0.1:8787/health | HTTP 200 ; service vivant, modèle éventuellement non prêt |
| Backend | http://127.0.0.1:8790/health | HTTP 200 ; `status=ready`, `read_only=true`, `version=1.4.4` |

Ouvrir ces URL **sur le PC de Yoann**, pas sur celui de Christophe. Si le navigateur ne peut pas lire le JSON, utiliser le diagnostic du Control Center ou PowerShell local. Ne pas ouvrir les ports 8787/8790 dans le pare-feu vers Internet.

**Ollama non configuré ne bloque pas le test OKX public.** Le Bridge peut indiquer `ready=false` pour le modèle tant que l'IA locale n'est pas installée.

## 5. Créer le compte Operator local

Le profil attendu est **`operator`**, jamais `owner`. Le mot de passe est créé **sur le PC de Yoann**, et ne doit jamais être envoyé par message, commité sur GitHub ou réutilisé depuis la session de Christophe.

Le Bridge archivé prévoit `/auth/register` pour la première inscription, `/auth/login` ensuite et `/capabilities` pour vérifier les droits. Utiliser l'écran d'authentification / la procédure fournie dans le pack. Si un script `CREATE_OPERATOR_ACCOUNT.bat` est réellement présent et documenté dans le ZIP extrait, l'utiliser selon ses instructions ; ce script est cité dans une ancienne livraison V1 et **sa présence dans R19Y1 n'est pas garantie**.

Le stockage local de confiance annoncé par les sources R19Y1 est situé sous :
`%LOCALAPPDATA%\ERITH.IA\YohanOperatorBridge\trust`.
Ne pas partager ce répertoire. La session web conserve le jeton en mémoire uniquement selon son contrat.

## 6. Tester l'Interface et le Trader

- [Interface publique actuelle](https://blueazur-hub.github.io/agent-crypto-operator/public/agent_crypto_erith_ia/administrator/index.html)
- [Trader public actuel](https://blueazur-hub.github.io/agent-crypto-operator/public/agent_crypto_erith_ia/trader/trading-desk.html)
- [Ancienne entrée Operator R19Y1](https://blueazur-hub.github.io/agent-crypto-operator/public/agent_crypto_erith_ia/administrator/yohan.html) — **historique 40.6.509** : elle ouvre encore une page d'Administrator ancienne et ne doit pas être confondue avec le Trader 40.6.640.

Dans Firefox sur le PC de Yoann, recharger avec **Ctrl + F5**. Vérifier le démarrage et ensuite, **sans connexion financière privée**, tester une paire publique OKX : sélection de l'actif, **Bougies**, puis **Profondeur / Carnet**. Contrôler que le symbole, la provenance et la devise correspondent à l'actif affiché ; refuser toute substitution BTC sous un autre nom.

**Attention :** le bon affichage des pages 40.6.640 ne prouve pas à lui seul que toutes leurs routes de Bridge utilisent le profil `operator`. L'ancien routeur Operator 40.6.509 doit être audité avant d'affirmer cette compatibilité de bout en bout.

## 7. Option : activer l'IA locale

Après les tests de marché, et seulement si Yoann souhaite utiliser Atlas/Aerith :

1. Installer Ollama localement (ou le moteur effectivement pris en charge par son pack).
2. Choisir un modèle que **son ordinateur** peut exécuter ; ne pas recopier aveuglément le modèle `gpt-oss:20b-32k` choisi sur le Ryzen de Christophe.
3. Si `bridge/CONFIGURE_YOHAN_OLLAMA.bat` est présent dans le ZIP R19Y1, utiliser ce configurateur documenté ; sinon, vérifier la configuration réelle auprès de Yoann avant modification.
4. Redémarrer le service local, puis vérifier sa santé et un test d'analyse **sans ordre réel**.

La consultation publique des cours ne nécessite ni Ollama ni compte OKX personnel.

## 8. Protections obligatoires

Le contrat Operator R19Y1 déclare : lecture des historiques et scanners, analyse Atlas/Aerith, rôle `operator` ; **aucun** droit `owner`, ordre réel, portefeuille, exchange privé, retrait, publication automatique GitHub, Book Mirror ou Oracle Evidence.

Ne jamais exposer `127.0.0.1:8787` et `127.0.0.1:8790` sur le réseau ou Internet, ni insérer un secret dans une page GitHub Pages. Sur un même ordinateur, les sites `/erith-ia-memory/` et `/agent-crypto-operator/` partagent l'origine `blueazur-hub.github.io` : préférer un **profil Firefox séparé** pour éviter de mélanger les données locales.

## 9. Fiche de validation à remplir avec Yoann

- [ ] ZIP et EXE téléchargés depuis le dépôt attendu ; SHA-256 vérifiés.
- [ ] Version Windows et matériel de Yoann identifiés.
- [ ] Une seule instance du Control Center R19Y1 lancée.
- [ ] Bridge `8787/health` répond localement.
- [ ] Backend `8790/health` répond et confirme `read_only=true`.
- [ ] Compte **operator** de Yoann créé / connexion testée sans divulguer son mot de passe.
- [ ] Bougies OKX et Profondeur concordent dans la page publiée.
- [ ] Écart d'entrée 40.6.509 versus 40.6.640 noté et testé.
- [ ] Ollama seulement si Yoann le demande et si sa machine le permet.
- [ ] Aucun accès financier privé ni droit d'écriture GitHub ajouté.

**STOP** si un contrôle d'intégrité, de droits, de port local ou de provenance échoue.

## Sources et statut d'archive

- [Paquet R19Y1 + EXE, répertoire de coordination](https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/coordination/inter_ai_dialogues/agent_crypto)
- [Contrat R19Y1](https://github.com/BlueAzur-Hub/agent-crypto-operator/blob/main/public/agent_crypto_erith_ia/operator/bridge_yohan/R19Y1_OPERATOR_CONTROL_CONTRACT.json)
- [Procès-verbal de tests R19Y1](https://github.com/BlueAzur-Hub/agent-crypto-operator/blob/main/public/agent_crypto_erith_ia/operator/bridge_yohan/CONTROL_CENTER_R19Y1_OKX_TRANSPORT.md)
- [Ancien README Bridge V1.0.0 — historique, ne pas confondre](https://github.com/BlueAzur-Hub/agent-crypto-operator/blob/main/public/agent_crypto_erith_ia/operator/bridge_yohan/README_YOHAN_OPERATOR_BRIDGE.md)

Ce guide est daté ; il ne transforme pas l'archive historique en source de vérité courante et n'atteste pas d'une exécution réelle sur la machine de Yoann.
