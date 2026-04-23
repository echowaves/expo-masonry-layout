## Why

Inline expand support was implemented and archived, but follow-up verification identified two gaps: missing runtime guidance when expansion props are misconfigured and missing automated coverage for key inline-expand scenarios. Addressing these now reduces integration mistakes and prevents regressions.

## What Changes

- Add a runtime warning in column mode when `expandedItemIds` is non-empty and `getExpandedHeight` is not provided.
- Add Jest coverage for inline-expand behavior in the layout utilities.
- Cover scenarios including unmatched expanded IDs, waterline flush behavior, expanded-height precedence over `getExtraHeight`, dedicated expanded-item bands, and row-layout unaffected behavior.

### Non-goals

- No API shape changes.
- No behavioral changes to row layout beyond regression coverage.
- No animation or UI redesign work.

## Capabilities

### New Capabilities
- `inline-expand-hardening`: runtime guardrails and regression tests for inline-expand behavior.

### Modified Capabilities
- `inline-expand`: add explicit requirement-level guard behavior and scenario-level verification coverage.

## Impact

- `src/ExpoMasonryLayout.tsx`: runtime warning when required expansion callback is missing.
- `__tests__/utils.test.js`: new test cases for inline-expand layout behavior.
- Test surface expands via Jest; no runtime dependency changes.
