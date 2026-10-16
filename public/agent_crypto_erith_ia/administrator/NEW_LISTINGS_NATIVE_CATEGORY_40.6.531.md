# Agent-Crypto 40.6.531 — New Listings · Native Market Category

Parent: **40.6.530**  
Market Core: **38.15.11 protected**

## Product correction

40.6.530 proved the complete Concrete path:
- native Market row;
- main Graphique Ligne;
- real Bougies;
- real Profondeur.

Firefox also proved the remaining UX defect: the visible `NEW · Concrete · CT/USDT · OKX` / `Retour Market` plumbing was still exposed, and the **Nouveaux listings** category was effectively CT-only.

40.6.531 removes that special-case UX.

The destination is now:

`Market → Nouveaux listings → several recent instruments → select one → same Fiche / same Ligne / same Bougies / same Profondeur`

## Discovery

Source:
- Bitget public SPOT instruments;
- `launchTime` <= 30 days;
- public tickers enrich rows with last price, 24h change and turnover.

Friendly identity enrichment currently includes:
- Concrete (CT)
- MAGNE.AI (MHA)
- MarsCat (MCAT)
- Pons (PONS)
- Canopy (CNPY)

Unknown future instruments remain exchange identities until a stronger canonical project identity is available. Ticker alone is never treated as a cross-exchange canonical identity.

## Market category

**Nouveaux listings** acts as an exclusive Market category:
- it reuses the existing Market table;
- it does not open the 40.6.528 Radar;
- it does not open the 40.6.529 Live Asset Pipeline;
- it can show more than one recent instrument;
- normal search can also surface a matching New Listing.

No New Listing is inserted into `state.coins` and no rank is fabricated.

## Price truth

Bitget spot listings are commonly quoted in USDT.

40.6.531 does **not** relabel USDT as USD.

For the default USD display:
- raw exchange price remains known as USDT;
- USD display is derived only when an explicit USDT/USD (or USDC/USD) reference is available from CoinGecko or the already-loaded canonical stablecoin Market snapshot;
- if the reference is absent, conversion is refused rather than fabricated.

The row/source text keeps the exchange pair visible.

## Existing Graphique reused

The existing main canvas and external-chart presentation owner are reused.

For a selected recent listing:
- exchange candles provide the real series;
- the close series feeds the existing Graphique Ligne;
- Volume / Base100 / Log / normal graph presentation remain the existing controls;
- period buttons are intercepted only while a New Listing is active so a new exchange series is loaded for that period.

No second line graph surface is created.

## Bougies

The existing Market Microscope owner remains the only Bougies surface.

Selecting **Bougies** loads the active exchange instrument from the New Listing context.

## Profondeur

The existing Profondeur owner remains unchanged.

The active external context supplies the requested base/quote/provider.

## Exit

There is no **Retour Market** button.

Selecting BTC / ETH / another canonical Market asset clears the New Listing exchange context and restores normal Market behavior.

## Safety

No:
- Market Core mutation;
- `state.coins` injection;
- ranking mutation;
- duplicate graph;
- duplicate Fiche;
- duplicate depth window;
- Strategy mutation;
- order / wallet / private API;
- new persistent storage owner;
- recurring timer;
- MutationObserver.

## Firefox terrain proof

1. Ctrl+F5 → confirm **Build 40.6.531**.
2. Click **Nouveaux listings**.
3. The Market table must show **multiple recent instruments**, not only CT, if Bitget currently returns more than one <=30-day listing.
4. The old Radar / Live Asset Pipeline must not appear.
5. Select **Concrete (CT)**:
   - no `NEW Concrete…` ribbon;
   - no `Retour Market` button;
   - existing Fiche;
   - existing Graphique Ligne;
   - existing Bougies;
   - existing Profondeur CT/USDT.
6. Select a **second** recent listing such as MHA / MCAT / PONS / CNPY if present:
   - same Market row UX;
   - same Graphique Ligne;
   - same Bougies;
   - same Profondeur.
7. Click BTC:
   - New Listing context clears automatically;
   - normal Market returns.
