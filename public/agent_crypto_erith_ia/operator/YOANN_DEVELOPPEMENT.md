# Operator Yoann · espace de développement indépendant

## Règles récupérées du fil Crypto
- **Développement privé :** \`malabaryo/tradus/public/agent_crypto_erith_ia\`.
- **Publication web publique :** \`BlueAzur-Hub/agent-crypto-operator\`, par copie **sélective** et revue des fichiers ; ne pas recopier l'intégralité du dépôt privé.
- **Administrator canonique :** \`BlueAzur-Hub/erith-ia-memory\`. Séparer les rôles Owner/Operator et préserver le Market Core 38.15.11, le profil Yoann, son Bridge et son compte OKX.
- **Installations autonomes :** le PC de Yoann n'a besoin d'aucune connexion permanente avec celui d'un autre utilisateur ; ses réglages restent locaux, jamais dans GitHub Pages.
- Un Operator pourra à terme utiliser son propre Trader, des ordres et des bots selon des autorisations séparées ; **ce n'est pas implémenté ni activé dans cette livraison**.
- Pas de copie des secrets, comptes privés, mémoires personnelles, privilèges Administrator/Owner, programmes Bridge locaux ou données du coffre de l'utilisateur principal.

## Synchronisation scientifique commune · 22 octobre 2026
Une copie datée et minimale des conclusions publiques est dans \`research-snapshot.json\`. Elle ne se présente ni comme un flux live ni comme une recommandation.

Modules référencés dans la master source :
- PR #602 : deux journaux distincts, Sept/Spot; évaluations PAPER 4 h / 24 h / 48 h.
- PR #603 : faux zéros, état de qualification ancien, tranches horaires des 258 trades historiques.
- PR #604 : candidats enregistrés, provenance, actualisation manuelle.
- PR #605 : OKX USDC, résistance relative, spread, carnet public.
- PR #606 : 86 880 observations actif-heure historiques, 152 séquences d'achats initiateurs et 144 de ventes, transactions natives de bougies 1 h.

Les modules anciens de l'Operator ne sont **pas automatiquement synchronisés** avec chaque script Trader/Administrator de la master : il faut analyser chaque dépendance, exécuter les tests, puis copier seulement ce qui est compatible.

## Docker personnel · premier bac à sable
\`docker/compose.yaml\` démarre une **page statique PAPER** locale : Market, Stratégie, Ledger et Microtransactions. Ce conteneur n'est ni le Bridge Operator Client, ni Ollama, ni un daemon de bots. Voir \`docker/README.md\`.

## Suite des développements réservés à Yoann
1. Rapports interactifs de comparaison horaire et nouvelles cohortes horodatées, sans hindsight.
2. Compteurs réels par bougies natives 1 m/5 m, avec provenance et limites de l'échantillonnage.
3. Simulation d'un ticket microtransaction tenant compte du lot minimal, des frais prélevés dans l'actif et de la possibilité de revente.
4. Configuration Bridge Operator Client **locale** en lecture OKX privée, séparée des autres comptes, vérifiée avant tout ordre réel.
5. Tests Firefox sur son Operator et vérifications de non-régression avant synchronisation publique.

**Les expérimentations ne doivent ni modifier Administrator ni permettre des opérations financières.**
