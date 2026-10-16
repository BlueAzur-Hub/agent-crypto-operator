# SEVEN HANDOFF — 40.6.530

40.6.529 is retained as a useful data proof but its visible duplicate UX is **rejected**.

The product destination is now locked:

**Nouveaux listings is a source for the existing Market, not a second workspace.**

Concrete (CT) is the terrain control:
- Market search CT → native row
- existing Fiche
- existing Graphique Ligne
- existing Bougies
- existing Profondeur
- canonical exit by selecting BTC/etc.

Important bug fixed from 40.6.529:
`state.active={...ctx,quote}` overwrote `ctx.quote="USDT"` with the ticker object. This directly explains the observed `CT/[OBJECT OBJECT]` depth context. 40.6.530 stores that object as `marketTicker`.

Do not expand provider coverage before Firefox proof of the native path.

PASS → freeze native CT integration, then decide how to canonicalize additional recent listings.
FAIL → repair only the failing owner: Market resolver, external graph, candle context, depth context, or canonical exit.
