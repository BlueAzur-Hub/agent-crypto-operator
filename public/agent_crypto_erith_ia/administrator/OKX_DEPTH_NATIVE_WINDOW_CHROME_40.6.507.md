# Agent-Crypto 40.6.507 — Native Window Chrome + Exact Lecture Technique Dock

## Terrain verdict on 40.6.506

40.6.506 fixes the structural coupling: moving Depth no longer carries Graphique.

Two presentation issues remain visible on terrain:
- the docked Depth surface is not always perfectly glued to the Lecture Technique rectangle after dynamic layout changes;
- the custom text button "Décrocher" does not match the native Administrator window chrome used by Lecture Technique and other panels.

## 40.6.507 correction

The independent `document.body` portal is preserved.

### Native control strip
Depth now uses the same five-button grammar as Administrator native windows:
- `⠿` move / detach-and-move
- `—` minimize
- `□` detach / redock
- `⤢` maximize / restore
- `×` hide

No text "Décrocher" button remains.

### Exact dock
While Depth is open and docked, a bounded 180 ms sync mirrors the current `#detailPanel.getBoundingClientRect()`.
This keeps the independent body portal visually glued to Lecture Technique even when Administrator layout shifts after load.

## Terrain proof

1. Ctrl+F5, confirm Build 40.6.507.
2. Open Profondeur.
3. Confirm its border is exactly aligned to Lecture Technique.
4. Confirm native controls `⠿ — □ ⤢ ×`.
5. Use `⠿` to move Depth; only Depth may move.
6. Use `□` to redock; alignment must return exactly.
7. Test `—`, `⤢`, and `×`.
8. Confirm live 2 s remains active while open.

Protected: Market Core 38.15.11, Graphique, Strategy, Cost Gate, Oracle, Aether, Lecture Technique logic, Web Classique, Backend/Bridge, wallet and real execution.
