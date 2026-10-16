# Agent-Crypto 40.6.73 R3 — ADMINISTRATOR RETURN STATE LOCK

Build: **40.6.73**  
Revision: **R3**  
Engine: **Market Core 38.15.11**  
Scope: **Administrator only**  
Parent checkpoint: **40.6.73 R2**

## Field symptom

After an authenticated owner selected **Administration**, a later return/reload could paint the **Intermédiaire** badge again even though the page identity and runtime remained the Administrator build.

The first-paint preseed reads `agent_crypto_erith_ia_v2_interface_mode`; an older persisted `intermediate` value could therefore win the next return.

## Single surgery

Carrier: `administrator/js/aerith10-workspace-bridge.js`.

A strictly isolated `40.6.73 R3` block now captures a trusted click on `#btnAdminAccountToggle` at `window` capture phase and, only when the local access session is `owner`, persists:

`agent_crypto_erith_ia_v2_interface_mode = advanced`

The value is written immediately and re-asserted in a microtask after the canonical click transaction. This means the next normal return/reload enters the Administrator view instead of restoring a stale Intermediate choice.

## Preserved

- Explicit `?view=intermediate` URL override remains valid.
- Non-owner sessions cannot persist Administrator mode through this lock.
- Operator/Yohan runtime is not modified.
- Market Core 38.15.11 is unchanged.
- Graphique, Lecture Technique, Aether Watch, Atlas, Oracle, Shared Memory and Strategy A are unchanged.
- No recurring timer, observer, fetch, WebSocket, market action or trading action is added.

## Firefox acceptance

1. Open the canonical Administrator page as owner.
2. Click **Administration** once.
3. Navigate away to another tab/page, then return or reload the Administrator page.
4. Confirm **Administration** remains the active field and **Intermédiaire** does not reappear as the restored view.
5. Optional guard test: open an explicit `?view=intermediate` URL and confirm the Intermediate override is still respected.

## Next debt

After R3 field validation, the next bounded UI debt is the stacking rule requested for active fiche windows: an explicitly opened fiche must be able to rise above Aether Watch without rebuilding either surface or changing the Window Manager ownership contract.
