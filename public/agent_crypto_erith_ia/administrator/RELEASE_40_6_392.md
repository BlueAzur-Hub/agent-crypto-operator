# Agent-Crypto 40.6.392 — REDIVIDER Full Layout Rebuild

Parent: **40.6.391**
Market Core: **38.15.11**

## Why

The 40.6.391 Firefox terrain result is rejected. Its visual hierarchy still behaved like independently positioned HTML layered over the HUD and produced a poor composition.

40.6.392 restarts the confirmation component layout instead of patching 40.6.391.

## Rebuild

- rebuild the REDIVIDER confirmation DOM;
- one HUD container owns art + one centered live-copy block;
- title / subtitle / percentage / glyphs / state are grouped together;
- command deck follows the HUD in normal flow;
- no independent floating title/state offsets;
- desktop PNG stays byte-for-byte unchanged;
- no desktop scrollbar;
- compact/mobile makes no PNG request and uses a CSS-only native ring;
- existing element IDs are preserved so STOP/RESUME rendering logic remains unchanged.

## Local Chromium proof before publication

- 900×650 PASS
- 1024×700 PASS
- 1280×720 PASS
- 1648×920 PASS
- 1920×1080 PASS
- 390×844 PASS, PNG absent

Desktop document and modal geometry show no horizontal or vertical overflow.

## Protected

No change to REDIVIDER STOP/RESUME logic, Paper Only semantics, Math Core, Strategy, Aether, Lecture Technique, Market Core 38.15.11, timers, observers, storage, wallets or real orders.

Firefox terrain proof remains required.
