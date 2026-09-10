# Agent-Crypto 40.6.0

**CHRONOS RESPONSIVE CENTER · FULL TEXT LOCK**

Parent: **40.5.23**  
Market Core: **38.15.11 protected**

Canonical presentation owner: `admin-chronos.css`

## Debt settled

Chronos could be clipped when the status-card width was too small for the complete semantic line:

`date · heure · Jour de planète · Heure de planète`

The previous CSS reduced typography but still kept `white-space: nowrap` + hidden overflow. Long French dates and planetary labels could therefore be amputated.

## 40.6.0 contract

- Sufficient width: the validated single-line centered presentation is preserved.
- Chronos card <= 560 px: the same seven semantic spans become a centered two-row CSS grid.
- Chronos card <= 360 px: a centered four-row emergency fallback keeps every semantic value readable.
- No ChronosXP calculation change.
- No JavaScript layout watcher.
- No `resize` handler.
- No recurring timer.
- No MutationObserver.
- No network/storage owner.
- Market Core 38.15.11 unchanged.
- Strategy A / Paper unchanged.

## Firefox field proof requested after upload

Check Classic, Intermediate and Administrator, at normal desktop width and a reduced window, in Metal and Glass. Confirm that long labels such as `Jour de Mercure` / `Heure de Saturne` remain complete and that the semantic group is visually centered in its own card.
