# Agent-Crypto 40.6.544 — NEW LISTINGS · REAL GITHUB CRYPTO LOGOS

Parent: **40.6.543**  
Scope: **logos only**.  
Market Core: **38.15.11 unchanged**.

## Destination

Nouveaux listings remains dynamic. Bitget `launchTime` still decides which assets are recent.

GitHub is only the persistent identity/logo memory for already verified assets. It does **not** define the content of the New Listings category.

For the five currently verified identities, the real source logos are stored as binary PNG files:

- `assets/crypto/new-listings/concrete.png`
- `assets/crypto/new-listings/magic-hash.png`
- `assets/crypto/new-listings/marscat-token.png`
- `assets/crypto/new-listings/pons.png`
- `assets/crypto/new-listings/canopy.png`

The registry contains paths to those files. There is no embedded base64 image anymore.

## Rendering correction

New Listing logos are tiny local assets and must not be deferred.

The row renderer now uses:

- eager loading;
- high fetch priority;
- explicit 32 × 32 dimensions;
- no lazy loading;
- no async decode directive.

The live discovery/price/volume pipeline is unchanged.

## Firefox proof

Repeated Ctrl+F5 must show all five currently known logos every time, especially PONS and CNPY.

This build does **not** touch Flottante / Latérale. That restoration is isolated to the next build.
