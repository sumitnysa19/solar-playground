# Proposal: Port High-Value Parts of `nightsky_v41.js` into `earth-sky`

## Status Update (2026-01-01)

Porting proposal is legacy. The Earth-sky viewer has been integrated under `nightsky/earth-sky/`.

Source bundle: `C:\Users\sumit\source\nightsky\nightsky_v41.js` (minified/bundled)

Target project: `C:\Users\sumit\source\nightsky\earth-sky`

This document proposes a *clean-room style* port: re-implement the same rendering techniques and APIs as small ES modules inside `earth-sky`, without copying the bundled framework/UI and without relying on globals (e.g. `window.TAD`) or remote assets.

## Goals

- Improve visual fidelity (day/twilight/night sky gradient + sun scattering look).
- Improve performance and scalability (billboard planets via `THREE.Points` + atlas).
- Improve realism (altitude-based extinction/magnitude dimming, better twinkle).
- Reduce duplication in the codebase (centralize label/sprite rendering).

## Non-Goals

- Port the full "NightSky" application shell or GUI widgets.
- Copy the bundled `three.js` inside `nightsky_v41.js` (we already ship `earth-sky/assets/three/three.module.js`).
- Preserve exact internal class names/structure from the bundle.

## Constraints / Risks

### External dependencies in the source bundle

The source bundle assumes:

- Globals (examples seen in the bundle): `window.TAD`, `window.TO`, `window.TAD.lat/lon`, etc.
- Remote assets (example): planet gradients from `//c.tadst.com/gfx/sky/...`.

Port plan: replace globals with explicit inputs (observer/time/state objects) and replace remote assets with local procedural textures or locally-stored assets under `earth-sky/assets/`.

### Licensing

If `nightsky_v41.js` is third-party proprietary code, copying verbatim may be disallowed.

Port plan: implement the *approach* (shader uniforms, geometry attributes, math pipeline) in new files written for `earth-sky`. Keep references to the source only as "inspiration" with file/line pointers for internal review.

## Summary of High-Value Components to Port

### 1) Atmospheric sky shader (physically-inspired scattering)

- Source: module `74` starting near `C:\Users\sumit\source\nightsky\nightsky_v41.js:10877`
- What it provides:
  - A skybox/sphere shader with Rayleigh + Mie scattering parameters (`rayleighCoefficient`, `mieCoefficient`, `mieDirectionalG`, `turbidity`, `luminance`, sun direction, tonemapping weighting).
  - Smooth transition between day/twilight/night driven by sun direction / solar altitude.
- Target integration:
  - Replace the flat background in `earth-sky/scene/skySphere.js` with a shader-driven sky dome.
  - Use the existing `earth-sky` time pipeline (`astro/time.js`) and solar position (`astro/solarSystem.js`) to drive `sunDirection`.

Deliverable modules:

- `earth-sky/scene/atmosphereSky.js`
  - Exports: `createAtmosphereSky({ radius })`, `updateAtmosphereSky(sky, { sunDirection, settings })`
  - Contains: `THREE.ShaderMaterial` with uniforms mirroring the source shader's conceptual parameters.

Acceptance criteria:

- Clear visual differentiation: night (dark blue/black), twilight (gradient), day (bright).
- No remote dependencies.
- Works with the existing render loop in `earth-sky/scene/scene.js`.

### 2) Planet + Sun/Moon billboards via `THREE.Points` + texture atlas

- Source: module `44` starting near `C:\Users\sumit\source\nightsky\nightsky_v41.js:9749`
- What it provides:
  - Single draw-call style rendering for multiple bodies using:
    - `BufferGeometry` attributes per body: `position`, `size`, `overexposure`, `offset`
    - A `CanvasTexture` atlas (or loaded image atlas)
  - Optional "overexposure" near sun and visibility threshold logic.
- Target integration:
  - Replace mesh spheres in:
    - `earth-sky/scene/solarSystem.js` (Sun/Moon)
    - `earth-sky/scene/planets.js` (planets)
  - Continue to compute RA/Dec via existing astro modules, but render as billboards.

Deliverable modules:

- `earth-sky/scene/billboardField.js`
  - Generic engine for "N billboards in one Points".
  - Exports: `createBillboardField(options)`, `updateBillboardField(field, items)`
- `earth-sky/scene/bodiesBillboardField.js`
  - Applies the generic field to Sun/Moon/planets using `astro/solarSystem.js` and `astro/planets.js`.

Asset plan (no remote URLs):

- Option A (procedural): generate simple radial gradients for each body into the atlas with 2D canvas.
- Option B (local images): store small PNG/SVG under `earth-sky/assets/textures/` and pack into atlas at runtime.

Acceptance criteria:

- Sun/Moon/planets render crisply at multiple zoom levels.
- Rendering cost does not scale linearly with number of bodies (single `THREE.Points`).
- Picking still works (raycaster point threshold), and `scene.js` can show info in HUD.

### 3) Magnitude dimming / extinction near the horizon

- Source: math/util module `21` near `C:\Users\sumit\source\nightsky\nightsky_v41.js:7352`
  - Notable function: `magnitudeAdjustForAtmosphere(mag, zenith)`
- What it provides:
  - A physically-inspired "objects dim near the horizon" effect (air mass / extinction approximation).
- Target integration:
  - Apply to:
    - Stars: modulate `color`/alpha in `earth-sky/scene/stars.js`
    - Planets: modulate billboard brightness (via uniform/attribute)

Deliverable module:

- `earth-sky/astro/extinction.js`
  - Exports: `extinctionDeltaMag(altitudeDeg, { k })` or `adjustMagnitudeForAltitude(mag, altitudeDeg, { k })`
  - Uses `altitudeDeg` (already computed in `astro/coordinates.js`) instead of `zenith` to match existing code.

Acceptance criteria:

- Stars/planets fade smoothly as altitude approaches 0deg.
- No discontinuity at the horizon; clamp near singularities.

### 4) Generic sprite/label system (canvas-generated textures, layering)

- Source: module `77` near `C:\Users\sumit\source\nightsky\nightsky_v41.js:9017`
  - Related label helpers: module `73` near `C:\Users\sumit\source\nightsky\nightsky_v41.js:11244`
- What it provides:
  - A reusable sprite system with:
    - `CanvasTexture` generation
    - optional multiple "layers" per sprite
    - stable positioning update hooks
- Target integration:
  - Replace repeated `createTextSprite()` implementations in:
    - `earth-sky/scene/solarSystem.js`
    - `earth-sky/scene/planets.js`
  - (Optional) Use for constellation labels later.

Deliverable modules:

- `earth-sky/scene/sprites.js`
  - Exports: `createLabelSprite({ text, font, ... })`, `updateLabelSprite(sprite, nextText)`

Acceptance criteria:

- Labels look consistent across bodies.
- Label texture generation does not leak GPU resources (dispose old textures/materials when updated).

### 5) Star-field "sparkle" twinkle (subset animation with delay/duration)

- Source: around `C:\Users\sumit\source\nightsky\nightsky_v41.js:11639` (`getStarVisibility`, `twinkle*` attributes)
- What it provides:
  - Twinkle driven per-star with randomized windows (delay/duration/min-size), rather than a global sine wave.
- Target integration:
  - Extend the star shader in `earth-sky/scene/stars.js` to optionally use:
    - `aTwinkleDelay`, `aTwinkleDuration`, `aTwinkleMin`, `uTime`
  - Update scheduling on CPU at low frequency (e.g. every 0.1-0.3s), not per-frame, to keep it cheap.

Deliverable changes:

- Update `earth-sky/scene/stars.js`
  - Add attributes for scheduled twinkle windows
  - Add a small scheduler that selects visible stars to twinkle

Acceptance criteria:

- Twinkle looks less "uniform" than global sine.
- Performance remains stable for large star counts.

## Proposed Implementation Order (Milestones)

### Milestone 1: Atmosphere sky dome

- Add `earth-sky/scene/atmosphereSky.js`
- Replace `earth-sky/scene/skySphere.js` usage in `earth-sky/scene/scene.js`
- Drive uniforms from sun direction derived from `astro/solarSystem.js`

### Milestone 2: Billboard bodies (Sun/Moon/planets)

- Add `earth-sky/scene/billboardField.js` and `earth-sky/scene/bodiesBillboardField.js`
- Replace mesh spheres in `earth-sky/scene/solarSystem.js` and `earth-sky/scene/planets.js`
- Keep existing RA/Dec math; swap rendering only

### Milestone 3: Shared label/sprite module

- Add `earth-sky/scene/sprites.js`
- Remove duplicate label code from body modules

### Milestone 4: Extinction (magnitude dimming near horizon)

- Add `earth-sky/astro/extinction.js`
- Apply to stars and billboards (brightness/alpha)

### Milestone 5: Twinkle scheduler + shader attributes

- Extend `earth-sky/scene/stars.js` and its shaders
- Add scheduling logic gated behind an option flag

## Integration Notes (How it fits `earth-sky` today)

- The "Earth rotation" model already exists: `earth-sky/scene/scene.js` rotates `skyRoot` by `-lstDeg`.
- RA/Dec -> Alt/Az conversion already exists: `earth-sky/astro/coordinates.js`.
- Solar and planetary RA/Dec already exist:
  - `earth-sky/astro/solarSystem.js` (sun/moon)
  - `earth-sky/astro/planets.js` (planets)

The port should therefore focus on rendering upgrades while keeping the astro math stable and testable.

## Verification Plan

- Visual checks:
  - At noon: bright sky, sun above horizon.
  - At night: dark sky, stars visible.
  - Around twilight: smooth gradient shift.
  - Near horizon: stars/bodies fade.
- Performance checks (console / renderer info already logged in `earth-sky/scene/scene.js`):
  - Ensure draw calls stay low (especially after billboard bodies).
- Interaction checks:
  - Raycasting still selects stars and bodies.
  - HUD info remains correct.

## Open Questions

- Preferred "look": do we want a realistic daylight sky, or keep the simulation "night-sky-first" with subtle twilight only?
- Do we want locally-authored planet textures (assets), or procedural gradients only?
- Should Sun/Moon remain separate objects for easier selection, or be part of one shared billboard field?


