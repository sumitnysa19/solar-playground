# System Architecture

## High-level structure

```mermaid
flowchart LR
  subgraph App[Planetesimal Solar System]
    HTML[planetesimal.html] --> Main[scripting.js]
    Main --> Funcs[functions.js]
    Main --> Data[construction.js]
    Main --> Bodies[planet.js / moon.js]
    Main --> Shaders[shaders.js]
    Main --> Three[module.js + Three.js]
    Main --> Post[EffectComposer + passes]
  end

  subgraph Sky[Earth-sky Viewer]
    SkyHTML[nightsky/earth-sky/index.html] --> SkyMain[nightsky/earth-sky/main.js]
    SkyMain --> SkyScene[nightsky/earth-sky/scene/scene.js]
    SkyScene --> Astro[nightsky/earth-sky/astro/*]
    SkyScene --> SkyRender[nightsky/earth-sky/scene/*]
  end

  Main -->|posts lat/lon| SkyMain
```

## Data flow for the Solar System scene

```mermaid
sequenceDiagram
  participant UI
  participant Main as scripting.js
  participant Data as construction.js
  participant Orbit as functions.js
  participant Scene as Three.js

  UI->>Main: user input (mouse/keyboard)
  Main->>Data: create bodies and orbits
  Data->>Orbit: compute orbital geometry
  Main->>Scene: update meshes and labels
  Main->>Scene: render frame
```

## Data flow for the Earth-sky viewer

```mermaid
sequenceDiagram
  participant UI as main.js
  participant Astro as astro/*
  participant Scene as scene.js
  participant Render as WebGLRenderer

  loop Each frame
    UI->>Scene: getObserver()
    Scene->>Astro: compute LST, RA/Dec, Alt/Az
    Scene->>Scene: update sky objects
    Scene->>Render: render(scene,camera)
  end
```

## Key runtime systems

- **Scene graph**: All bodies, orbits, labels, and sky dome are Three.js objects.
- **Time system**: Simulation time is advanced by a configurable multiplier and applied to orbital motion and rotation.
- **Interaction**: Raycasting is used for selection, labels, and horizon placement.
- **Horizon disc**: A tangent plane positioned on Earth, oriented by the local surface normal and North/East basis.
