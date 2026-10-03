# HANDOFF — YOHAN OPERATOR 40.6.509

Repository cible : `BlueAzur-Hub/agent-crypto-operator`  
Runtime source : `BlueAzur-Hub/erith-ia-memory`  
Runtime cible : Administrator **40.6.509**  
Market Core : **38.15.11**  
Bridge : **Yohan Operator Bridge V1.0.0**  
Backend : **1.4.4 read-only**

## Verrous

- ne pas recopier le runtime MASTER dans Operator ;
- préserver la couche Yohan ;
- vue ≠ rôle ;
- ne pas embarquer mot de passe/token/secret ;
- ne pas exposer le Bridge local sur Internet ;
- ne pas ajouter wallet, retrait ou ordre réel ;
- ne pas modifier Market Core 38.15.11.

## Test terrain

1. Installer Python 3 et Ollama sur le PC de Yohan.
2. Télécharger/extracter `operator/bridge_yohan/YOHAN_OPERATOR_BRIDGE_V1.0.0_FULL.zip`.
3. Choisir le modèle Ollama local avec `CONFIGURE_YOHAN_MODEL.bat`.
4. Lancer `START_YOHAN_STACK.bat`.
5. Créer le compte local Operator.
6. Tester le Bridge.
7. Ouvrir `administrator/yohan.html`.
