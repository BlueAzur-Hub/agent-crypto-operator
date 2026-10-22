# Docker · Laboratoire personnel de Yoann

Ce conteneur **ne contient aucun moteur de trading**. C'est uniquement un serveur Web statique pour l'atelier Operator, séparé de l'Administrator et du Bridge.

## Utilisation locale facultative

Depuis \`public/agent_crypto_erith_ia/operator/docker/\` :

\`\`\`bash
docker compose up --build -d
\`\`\`

Ouvrir **http://127.0.0.1:8097/** sur le PC où Docker tourne. Arrêter :

\`\`\`bash
docker compose down
\`\`\`

L'accès est lié à **127.0.0.1**, pas à toutes les interfaces réseau. Le conteneur n'embarque ni clé OKX ni mot de passe, n'expose aucun Backend, est exécuté sans privilèges avec un système de fichiers en lecture seule, et ne monte pas le système hôte. Il ne lance ni Atlas, ni une API d'échange, ni un ordre.

La page permet uniquement de lire le **snapshot GitHub daté**, de consulter les sources publiques par liens et d'effectuer un calcul **PAPER dans le navigateur**. Les liens externes ouverts à la demande ne sont pas des connexions du conteneur à des comptes.

**Important :** un conteneur Docker n'est pas une frontière de sécurité parfaite. Cette configuration ne bloque pas toute sortie réseau possible ; ne jamais y injecter de secret, token, clé API ou données de compte. La partie privée de Yoann reste locale dans son Bridge et hors de ce conteneur.

Les quatre zones évolutives : Market (données publiques), Stratégie (diagnostics et séquences), Ledger (capital fictif) et Microtransactions (contrôles de coûts/vente). Aucun de ces modules n'est autorisé à passer des ordres.

Pour reprendre les développements : \`../YOANN_DEVELOPPEMENT.md\`.
