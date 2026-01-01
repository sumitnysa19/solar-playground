# Low-level Design: Horizon Plane (Earth)

## Purpose

The horizon plane is a local tangent plane on Earth at a user-selected surface location. It is used to visualize the sky/ground separation and correlate the Solar System view with the Earth-sky viewer.

## Placement and orientation

Given the clicked point in Earth local space:

1. Compute an oblate-spheroid surface normal.
2. Build a stable local basis (East, North, Up).
3. Apply the basis as a quaternion to the horizon plane.
4. Offset slightly along the normal so the disc does not intersect the surface.

## Basis construction

```mermaid
flowchart LR
  P[local hit point] --> N[compute surface normal]
  N --> Np[ensure outward normal]
  Np --> North[project north axis onto tangent plane]
  North --> East[east = normal x north]
  East --> Basis[makeBasis(east, north, normal)]
  Basis --> Q[apply quaternion to disc]
```

## Behavior guarantees

- The disc is tangent at the clicked point.
- The disc normal is perpendicular to the local surface radius.
- The grid roll is stable and points toward local north.
- All sky objects should be on the same side of the plane.

## Relevant code

- `scripting.js` click handler for raycast hits
- `planet.js` restore logic for saved horizon position
