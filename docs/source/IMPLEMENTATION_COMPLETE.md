# Sky View MVP - Implementation Complete

## Status Update (2026-01-01)

Legacy milestone for the sky-module MVP. The current maintained viewer is `nightsky/earth-sky/`.

Notes:
- The sky-module lives under `sky-module/` and is not wired into `planetesimal.html` by default.
- Use `docs/run.md` and `docs/low-level/earth-sky.md` for the current runtime flow.

Status: legacy snapshot; not part of the default runtime

## Updates Since Initial MVP
- Added Rahu/Ketu (lunar nodes): markers, labels, trails, rise/set, and Alt/Az readouts.
- Trails: smoother (~14 min cadence), up to 200 points per body for continuous paths.
- Time controls: presets up to 1 year/sec plus a jump-to-UTC input (ISO).
- Labels: body labels enlarged/offset; constellation labels render when above horizon.
- UI: Alt/Az table for Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu to aid comparison/retrograde checks.

## Modules
- `HelioStateProvider.js` - Ephemeris adapter + cache + Rahu/Ketu nodes.
- `CoordinateTransforms.js` - Helio -> geo -> RA/Dec -> Alt/Az.
- `Nakshatras.js` - 28 Vedic constellations dataset.
- `SkyDome.js` - Dome, horizon, grid, cardinals.
- `NakshatraManager.js` - Constellation rendering + labels.
- `TrailManager.js` - Trails (200-point ring buffer, ~14 min sampling).
- `RiseSetCalculator.js` - Rise/set/transit (coarse).
- `SkyScene.js` - Scene, camera, bodies, updates.
- `SkyControls.js` - UI (time, speed presets, jump-to-UTC, observer, toggles, Alt/Az table).
- `docs/source/sky-module/README.md` - Module docs.

## Features Delivered
- Bodies: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu.
- Constellations: 28 nakshatras with lines and labels.
- Trails: continuous-looking paths with adjustable visibility and clear/reset.
- Rise/Set: per-body horizon events (coarse) shown in UI.
- Time: UTC-based, slider (+/-30 days), jump-to-UTC input, speed presets (1x -> 1 year/sec), play/pause.
- Observer: preset cities; updates sky accordingly.
- UI: fixed panel with time, speed, observer, toggles (nakshatras, trails, grid), rise/set, Alt/Az table, memory.
- Controls: OrbitControls for pan/zoom; enlarged body labels positioned beneath markers.

## Notes
- Geometric alt/az (no refraction/parallax/nutation) per MVP scope.
- Rahu/Ketu use a simplified lunar-node model (directional placement).
- Independent entry point: `skyview.html` (separate from `planetesimal.html`).



