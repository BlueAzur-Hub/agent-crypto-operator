# Yohan Operator — Control Center R19Y1 / Bridge 1.9.13 / Backend 1.4.4

## But immédiat

Donner au poste de Yohan un **Control Center Windows du même ordre que le R19 Administrator**, avec double supervision locale :

- Bridge : `127.0.0.1:8787`
- Private Backend : `127.0.0.1:8790`
- Operator public : `administrator/yohan.html`
- OKX public transport : candles / ticker / books / books-rpi / trades

Le premier test demandé est **OKX**. Ollama peut rester non configuré : le Bridge indiquera `modèle non prêt`, mais le Backend 1.4.4 doit pouvoir fonctionner indépendamment.

## Base réelle

Le package a été dérivé du pack canonique fourni :

- Aether Control **2.3.2R19**
- Bridge **1.9.13**
- Backend **1.4.4**
- GUI Windows sans console
- Market transport OKX read-only

Le fichier `backend/private_backend.py` est conservé bit-pour-bit depuis cette base R19.

## Adaptations Yohan

Control Center :
- titre / URL / workspace dédiés Yohan ;
- ouvre `https://blueazur-hub.github.io/agent-crypto-operator/public/agent_crypto_erith_ia/administrator/yohan.html` ;
- workspace non-portable : `%LOCALAPPDATA%\ERITH.IA\YohanOperatorBridge\2.3.2R19Y1` ;
- démarre automatiquement Bridge + Backend comme le Control Center R19.

Bridge :
- rôle créé par `/auth/register` = **operator**, jamais owner ;
- trust séparé `%LOCALAPPDATA%\ERITH.IA\YohanOperatorBridge\trust` ;
- capacités : `history.read`, `scanner.read`, `atlas.run`, `aerith.run`, `chat.run`, `security.read` ;
- `book_mirror.publish` refusé ;
- publication Oracle Evidence désactivée ;
- GitHub write désactivé ;
- wallet / exchange privé / ordre réel interdits.

Backend :
- version **1.4.4** ;
- read-only ;
- CORS `https://blueazur-hub.github.io` ;
- routes OKX : `/orderbook`, `/okx-public`, `/candles`, `/microstructure`.

## Tests effectués

- Bridge `--self-test` : PASS.
- Backend `--self-test` : PASS.
- Bridge local `/health` sans Ollama : HTTP 200, service actif, `ready=false` / modèle à configurer.
- Backend local `/health` : HTTP 200, `status=ready`, `read_only=true`, version 1.4.4.
- Auth register : rôle **operator**.
- `/capabilities` : operator-only.
- tentative `/book-mirror/publish` : **403**, capacité refusée.
- CORS Backend avec origine GitHub Pages : PASS.
- EXE : PE32+ Windows x86-64 GUI / no-console.

## Artefacts locaux

ZIP :
`AGENT_CRYPTO_YOHAN_OPERATOR_CONTROL_R19Y1_BRIDGE_1_9_13_BACKEND_1_4_4_OKX_LOCAL_TRANSPORT.zip`

SHA-256 :
`36bbcb4011d96df90c95693e9cf62b288b42419ee4827ef6fb8b9ceaa9b60dd8`

EXE :
`YOHAN_OPERATOR_BRIDGE_CONTROL_CENTER_2_3_2R19Y1_BRIDGE_V1_9_13_BACKEND_V1_4_4_OKX_LOCAL_TRANSPORT_GUI_NO_CONSOLE.exe`

SHA-256 :
`2d333589fa4352c6aa3b4a43f563df4d19e26ccff312c0e2525ccdf581acca99`

Backend 1.4.4 SHA-256 :
`782e6d1e73b7e1d2c09e1aa19b82e16a17be5d75f49a98a59d6623590f4a5c17`

## Test terrain Yohan

1. Extraire le ZIP sur le PC Yohan.
2. Lancer l’EXE Control Center.
3. Attendre `PRIVATE BACKEND · actif · prêt · V1.4.4`.
4. Ollama peut être rouge / non prêt : **ce n’est pas bloquant pour OKX**.
5. Cliquer `Ouvrir Operator Yohan`.
6. Firefox : Ctrl+F5.
7. Tester **Bougies** puis **Carnet / Profondeur**.
8. Après preuve OKX, configurer Ollama avec `bridge/CONFIGURE_YOHAN_OLLAMA.bat`.

## Stop point

Ne pas toucher au MASTER Administrator 40.6.509 ni au Market Core 38.15.11 pour ce test.
