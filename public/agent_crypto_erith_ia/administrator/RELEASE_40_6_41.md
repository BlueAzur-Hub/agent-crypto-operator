# Agent-Crypto 40.6.41 — AETHER FREE RESIZE · SHELL / 16:9 STAGE SEPARATION

Parent: 40.6.40  
Engine: Market Core 38.15.11

## Corrective target

The 40.6.40 native Aether window was movable and maximizable, but its normal shell still inherited the historical 16:9 artwork geometry. That made the image effectively own the window size.

40.6.41 separates those responsibilities:

- **outer shell** = free native Administrator window, resizable in width and height;
- **inner stage** = existing calibrated 16:9 Observatory artwork + live DOM embroidery;
- unused shell space uses a restrained code-only dark Observatory fill;
- the current artwork is never stretched;
- Firefox native resize geometry is persisted by the already-existing directFixed `pointerup -> persistGeometry()` path in the canonical Window Manager.

## Operator test

1. Open Aether.
2. Resize from the bottom-right corner: wider, taller, then narrower/taller.
3. Confirm the shell changes ratio while the Observatory stage remains undistorted and centered.
4. Move the resized window, close/reopen or reload, and verify the saved geometry returns.
5. Maximize/restore and verify the native 40.6.40 path still works.

## Preserved

- Aether runtime byte-for-byte.
- 40.6.39 Workbench byte-for-byte.
- `js/core/admin-window-manager.js` untouched.
- `js/app.js` native Aether definition untouched.
- paid Observatory artwork byte-for-byte.
- Market Core 38.15.11, Graph, Oracle, Lecture Technique, Chronos and Version Truth behavior.
- no new observer, recurring timer, network/storage owner, automatic order or real order.

The final wider/textless artwork remains deliberately deferred until this free-resize shell is visually validated.
