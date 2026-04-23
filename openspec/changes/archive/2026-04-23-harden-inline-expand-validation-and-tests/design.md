## Context

Inline expand support was recently introduced and archived, and implementation verification identified follow-up hardening work. The code updates are already present in this repository: a runtime warning in column mode when expanded IDs are provided without `getExpandedHeight`, and new Jest tests covering critical inline-expand behavior in layout utilities.

## Goals / Non-Goals

**Goals:**
- Preserve existing inline-expand behavior while adding explicit runtime guidance for misconfiguration.
- Add durable regression coverage for key layout invariants.
- Keep the hardening change small and local to existing modules.

**Non-Goals:**
- Redesign of the inline-expand API.
- Animation, UI, or rendering-style changes.
- New runtime dependencies.

## Decisions

### Decision 1: Warn at component boundary
Emit a warning in `ExpoMasonryLayout` when column-mode expansion state is provided without `getExpandedHeight`.

Rationale:
- The component boundary has direct access to props and can provide immediate, user-actionable feedback.
- Warning preserves backward compatibility while guiding correct usage.

Alternatives considered:
- Throw an error: rejected to avoid hard runtime breakage for existing consumers.
- Silent fallback only: rejected because it hides integration mistakes.

### Decision 2: Add regression tests at utility layer
Add tests in Jest for `calculateColumnMasonryLayout` and `sliceIntoBands` behavior.

Rationale:
- Utility-layer tests are deterministic and fast.
- They directly validate layout invariants independent of React Native rendering environment.

Alternatives considered:
- UI/integration tests only: rejected because they are heavier and less focused for these invariants.

## Risks / Trade-offs

- [Warning noise in development] → Keep warning conditional and narrowly scoped to invalid prop combination.
- [Spec/process overhead for test hardening] → Keep this as a compact follow-up change with limited scope.

## Migration Plan

- No migration required.
- Consumers that see the warning should provide `getExpandedHeight` when using `expandedItemIds` in column mode.

## Open Questions

- None for this follow-up scope.
