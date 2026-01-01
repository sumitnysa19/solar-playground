# Low-level Design: Feature Details

This file summarizes implementation details for major user-visible features.

## Orbits

- Orbit curves are built in `functions.js` using analytic ellipse geometry.
- Each orbit is a `THREE.Line` with a shader material.
- Orbits are toggled via the UI and stored in `moons[i].Orbit.visible`.

## Labels

- Labels are canvas sprites created per body.
- Visibility depends on camera distance and settings toggles.
- Major labels bypass distance checks.

## Time controls

- `time_rate` defines simulated seconds per real second.
- Hotkeys adjust acceleration and sign of `time_rate`.
- `paused` prevents the simulation update but keeps rendering active.

## Camera controls

- `TrackballControls` provides rotate, zoom, and pan.
- `GoTo()` animates the camera toward a selected body.
- `controls.maxDistance` limits far zoom.

## Atmospheres and clouds

- Atmosphere uses a shader material with camera and sun vectors.
- Clouds are a separate sphere mesh with faster spin.
- Both can be toggled from the settings panel.

## Constellations

- Lines are built from either a sample dataset or a full JSON file.
- Labels are built as sprites and toggled via settings.
- The night-sky viewer can reproject them into Alt/Az.

## Horizon disc

- A `THREE.Group` containing a circle and grid mesh.
- Placed at Earth click location in `scripting.js`.
- Oriented with a stable tangent-plane basis.
