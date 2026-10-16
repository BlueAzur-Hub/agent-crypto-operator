# Agent-Crypto 40.6.391 — REDIVIDER AAA Visual Recovery

Parent: **40.6.390**
Market Core: **38.15.11**

40.6.390 is visually rejected on Firefox because the confirmation modal exposed horizontal and vertical scrollbars.

40.6.391 repairs only the desktop REDIVIDER presentation:
- desktop modal overflow is hidden;
- forced HUD min-width is removed;
- HUD size is bounded by viewport width and height;
- chassis + live HTML share one CSS Grid visual cell;
- approved transparent PNG is unchanged;
- legacy rails remain hidden and legacy painted ring remains transparent;
- question / safety / actions are compact;
- PNG integration starts at 900px; below 900px the native dialog remains.

Local Chromium geometry proof before publication:
900×650, 1024×700, 1280×720, 1648×920, 1920×1080 = PASS with scrollWidth=clientWidth and scrollHeight=clientHeight.
390×844 = PASS, PNG not applied.

No STOP/RESUME, Math Core, Strategy, Aether, Lecture Technique, Market Core, timer, observer, storage, wallet or real-order change.
Firefox terrain proof remains required.
