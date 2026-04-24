## Context

The ExpoMasonryLayout component renders masonry items in a VirtualizedList. Each item is wrapped in a View element with `position: 'absolute'`, `overflow: 'hidden'`, and explicit width/height dimensions that are calculated precisely during layout.

The `overflow: 'hidden'` was likely added as a safety measure, but it has an unintended consequence: it clips visual effects like shadows that naturally extend beyond the item's bounds.

## Goals / Non-Goals

**Goals:**
- Enable shadows and shadow-based effects to render smoothly without clipping
- Maintain proper layout containment for absolutely-positioned items
- Maintain backward compatibility (no API changes)

**Non-Goals:**
- Add new styling props or customization options
- Modify layout algorithms or calculations
- Change how items are positioned or sized

## Decisions

**Decision 1: Remove `overflow: 'hidden'` entirely**

Rationale: Absolute positioning with explicit width/height (`position: 'absolute'`, `width: N`, `height: N`) already creates a hard layout boundary. The overflow property only affects rendering of content that exceeds those bounds. Since item dimensions are precisely calculated and enforced, removing overflow doesn't risk layout breaking. Shadow effects naturally respect the stacking context boundary without needing overflow to clip them.

Alternatives considered:
- Add a prop to control overflow: Would require API design and version management, adds complexity for a one-line fix
- Move overflow to child elements: Would require changes to example code and user renderItem implementations
- Use `overflow: 'visible'` explicitly: Equivalent to removing it; cleaner to remove than leave a no-op

**Decision 2: No changes to TypeScript types or prop interfaces**

Rationale: This is a rendering fix with no API surface changes. Users don't need to do anything differently.

## Risks / Trade-offs

**Risk**: Content extending beyond calculated bounds could render outside the item area
- Mitigation: Items use precise width/height calculations. If content extends beyond these, it's a bug in the calculation, not related to overflow. VirtualizedList performance depends on accurate bounds anyway.

**Risk**: Item rendering behavior with certain React Native versions
- Mitigation: Overflow property doesn't affect layout—it only clips rendering. The absolute positioning and dimensions remain the same. Should be compatible with all supported versions (RN >=0.70).

## Migration Plan

**Deployment:**
1. Update `src/ExpoMasonryLayout.tsx` to remove `overflow: 'hidden'` from itemContainer style
2. Run `npm run build` to compile TypeScript to lib/
3. Publish as patch version (no breaking changes)

**Rollback:**
- If visual regressions appear (shadows incorrectly extending into adjacent items), revert the style change
- No data migration or version compatibility concerns
