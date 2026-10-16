# Agent-Crypto 40.6.504 — Depth Full Lecture Technique Cover + Readability

## Terrain verdict on 40.6.503

Functional behavior remains valid:
- local Backend 8790 orderbook loads;
- no browser OKX NetworkError;
- read-only 2 s refresh works while Depth is open;
- chart width is preserved;
- close restores the normal detail panel.

Presentation is still wrong:
- Depth only covers the lower half of Lecture Technique;
- the decorative illustration remains visually dominant;
- the orderbook/table typography is still too small.

## 40.6.504 correction

The Depth surface now covers the **entire Lecture Technique panel**.

Changes:
- overlay uses `inset:0` inside `#detailPanel`;
- underlying Lecture Technique content is dimmed to 8% while Depth is open;
- overlay background is darker and more opaque, while keeping slight transparency + blur;
- title ~15 px;
- metadata ~10.5 px;
- KPI values ~13 px;
- orderbook rows ~12 px;
- fewer visible rows per side (6 ASK + 6 BID) so the larger type stays readable;
- live 2 s polling remains unchanged and open-only.

## Protected

Unchanged:
- Market Core 38.15.11
- native chart / Base100
- 40.6.501 candle zoom / pan / fullspace
- local Backend 8790 contract
- Backend 1.4.4 / Bridge 1.9.13
- Strategy / Cost Gate / Oracle
- Aether / Atlas CURRENT
- Lecture Technique logic
- Web Classique
- storage ownership
- real execution

## Terrain proof

1. Ctrl+F5 and confirm Build 40.6.504.
2. Open **Profondeur**.
3. Depth must cover all of Lecture Technique, not begin halfway down.
4. The decorative image should be only faintly visible behind the darker overlay.
5. Text must be clearly larger than 40.6.503.
6. Leave open ~10 s and confirm the values continue to update about every 2 s.
7. Close and confirm Lecture Technique returns intact.
8. Confirm Candles zoom/pan are unchanged.

The multi-crypto asset switcher is intentionally deferred to the next functional build after this terrain correction.
