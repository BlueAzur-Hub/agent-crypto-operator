# Agent-Crypto Administrator — 40.6.74 Candidate 2.1

## Aether Watch V2 — Activation & Responsive Stabilization

Parent validated runtime: **40.6.73 · Administrator** with **Market Core 38.15.11**.
Parent visual candidate: **40.6.74 C2**.

C2.1 is a narrow corrective pass. It does not redesign Aether again.

### Corrected

1. **V2 activation attribute**
   - JS now writes the exact HTML attribute consumed by the V2 CSS:
     `data-aether-backplate-v2-406074="ready"`.
   - This removes the prior dataset/camelCase mismatch that could leave the V2 geometry dormant even when the PNG loaded correctly.

2. **Decode safety contract**
   - successful load + successful decode => V2 activation;
   - load or decode failure => fallback to the validated 40.6.73 geometry;
   - `decode()` failure no longer activates V2.

3. **Responsive headroom**
   - the new V2 cells retain their secondary header state, Atlas support line and third recent-event row through normal Administrator window sizes;
   - those secondary details now collapse only when the Aether stage becomes genuinely compact;
   - primary facts remain protected.

### Runtime truth

The visible/global build remains **40.6.73** until Christophe validates the V2 result in Firefox.

### Protected

- Market Core 38.15.11 unchanged;
- Administrator Window Manager unchanged;
- R5 Crypto fiche > Aether foreground behavior preserved;
- Atlas / Oracle / Graph / Lecture Technique unchanged;
- no new timer;
- no MutationObserver;
- no storage owner;
- no network API owner.

### Acceptance

1. Reload Administrator after Pages deployment.
2. Open Aether Watch.
3. Confirm the V2 artwork is displayed.
4. Confirm live DOM cards sit within the enlarged V2 painted capsules.
5. Confirm Sources / Atlas / Market / Events / Oracle remain readable at the normal window size.
6. Confirm three recent-event rows can survive normal windowed mode.
7. Resize smaller and confirm tertiary state yields only when genuinely compact.
8. Open a Crypto fiche and confirm R5 still paints it above Aether.

Only after field PASS should 40.6.74 be promoted to canonical build truth.
