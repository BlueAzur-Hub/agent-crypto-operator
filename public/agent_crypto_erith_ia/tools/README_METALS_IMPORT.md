# ERITH.IA — Outil de secours pour snapshot Métaux

Cet outil historique reste présent uniquement pour la compatibilité et les diagnostics locaux.
Il n’appartient pas au flux normal de la Build 28.2.59.

## Flux normal 28.2.59

GitHub Actions exécute automatiquement `collect_public_metals.py`, puis met à jour les fichiers publics lus par le Ryzen et le Transformer Book.
Aucun rapport ni fichier ne doit être publié manuellement depuis le Ryzen.

## Usage exceptionnel

`metals_snapshot_ingest.py` peut valider et enregistrer localement un JSON déjà obtenu depuis une source réelle. Il ne contacte aucun fournisseur, ne demande aucune clé et refuse les champs ressemblant à un secret.

```text
python tools/metals_snapshot_ingest.py --input metals_snapshot_real.json --root public/agent_crypto_erith_ia --dry-run
```

Cet usage de secours ne remplace pas le collecteur GitHub Actions et ne publie rien vers GitHub.
