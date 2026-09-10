# Mémoire Métaux publique dans l’Interface

Build 28.2.59 — Public Metals Archive.

- GitHub Actions produit automatiquement `data/metals/latest.json`, `status.json`, l’historique annuel et le taux USD/EUR.
- La même Interface lit ces fichiers sur le Ryzen et sur le Transformer Book.
- IndexedDB conserve la dernière copie valide comme secours local.
- Aucun rapport ne doit être fabriqué ou publié manuellement depuis le Ryzen.
- Le Bridge reste facultatif et local ; il ne commande plus la disponibilité des données publiques.
- L’ancien rapport Ryzen/Metals.Dev est conservé uniquement dans `data/metals/archive/metals_dev_2026-08-01/`.
