# HANDOFF 40.6.398 — OPERATOR DASHBOARD CANONICAL NAME

Parent: **40.6.397**

## Intent

Remove the build number from the **active persistent Dashboard module filename**.

## Clean-upload ZIP tree

```text
administrator/
├── build.json
├── index.html
├── js/
│   └── operator-dashboard.js
├── RELEASE_40_6_398.md
└── HANDOFF_40.6.398_OPERATOR_DASHBOARD_CANONICAL_NAME.md
```

## Rename

```text
js/operator-dashboard-406384.js
            ↓
js/operator-dashboard.js
```

The payload itself is unchanged.

## Historical files

Older `operator-dashboard-406345.js` ... `406382.js` files are **not runtime owners** and are left untouched in this bounded version. Their cleanup is a separate repository-debt operation, not part of this runtime rename.

## Decision rule

If Firefox loads Dashboard/REDIVIDER/Math normally and requests only `operator-dashboard.js`, this canonicalization is complete: **STOP**.
