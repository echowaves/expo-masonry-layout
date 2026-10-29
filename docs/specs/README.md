# Capability specs

These files are the behavioral contract for `expo-masonry-layout`: what the library must do,
written as requirements and scenarios rather than implementation notes. They are read before
planning or building a change that touches the capability they describe.

Planning and implementation tracking for this project is done with [BMad](https://bmadmethod.com)
(`bmad` skills). These specs are requirement sources that BMad tickets and build plans cite; they are
not managed by a spec tool any more.

## Capabilities

| Capability | Requirements | Covers | Originating change |
| --- | --- | --- | --- |
| [column-layout](./column-layout/spec.md) | 7 | `layoutMode`, `columns` (fixed and responsive), column packing | add-column-layout-and-extra-height |
| [extra-height](./extra-height/spec.md) | 6 | `getExtraHeight` callback feeding layout measurement | add-column-layout-and-extra-height |
| [inline-expand](./inline-expand/spec.md) | 7 | `expandedItemIds`, reflow around expanded items, imperative handles | add-inline-expand |
| [dynamic-expanded-height](./dynamic-expanded-height/spec.md) | 6 | Auto-measuring rendered expand height | add-dynamic-expanded-height |
| [auto-scroll-on-expand](./auto-scroll-on-expand/spec.md) | 7 | `autoScrollOnExpand`, programmatic scroll to toggled items | add-auto-scroll-on-expand |
| [adaptive-band-heights](./adaptive-band-heights/spec.md) | 5 | Band boundaries in virtualization, touch dead zones, gap coordinates | natural-band-boundaries, fix-band-touch-clipping, fix-band-gap-coordinates |
| [shadow-rendering](./shadow-rendering/spec.md) | 2 | Shadows and elevation not clipped by item wrappers | fix-shadow-clipping |
| [inline-expand-hardening](./inline-expand-hardening/spec.md) | 1 | Regression coverage that keeps inline expand stable | harden-inline-expand-validation-and-tests |
| [expo-sdk-58-compat](./expo-sdk-58-compat/spec.md) | 6 | Dependency floor and toolchain for Expo SDK 58 / RN 0.88 | upgrade-deps-expo-sdk-58 |
| [expo-sdk-57-compat](./expo-sdk-57-compat/spec.md) | 5 | Superseded record of the SDK 57 support window | update-expo-deps-v57 |
| [expo-sdk-55-compat](./expo-sdk-55-compat/spec.md) | 3 | Superseded record of the SDK 55 support window | update-expo-deps-v55 |

## Format

```markdown
## Purpose
What this capability guarantees, in prose.

## Requirements

### Requirement: <name>
The system SHALL <observable behavior>.

#### Scenario: <case>
- **WHEN** <trigger>
- **THEN** <expected result>
```

Write requirements in `SHALL` language about observable behavior. Keep implementation detail in the
code, the architecture notes, or the ticket that requests the work.

## Updating them

1. Write or update the requirement alongside the BMad ticket for the change.
2. Land the code and the spec in the same change; a spec that describes unshipped behavior is marked
   as such in the ticket until it ships.

## Provenance

Migrated from [OpenSpec](https://github.com/Fission-AI/OpenSpec) on 2026-10-28. The proposal, design
and task documents for the ten changes listed above were completed and are preserved in git history:
`git log --diff-filter=D --name-only -- openspec/` recovers any of them.
