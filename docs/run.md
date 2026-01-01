# Running the Project

## Prerequisites

- Any static web server (Python, Node, or similar)
- A modern browser with ES module support

## Start the Solar System simulation

From the repository root:

```bash
python -m http.server 8080
```

Then open:

- `http://localhost:8080/planetesimal.html`

## Start the Earth-sky viewer

From the same server:

- `http://localhost:8080/nightsky/earth-sky/index.html`

## Important notes

- Do not open `planetesimal.html` via `file://` or modules will fail to load.
- Basis textures are loaded by Three.js and require network access to the transcoder.
- If a dataset fetch fails, check the browser network panel and disable cache.

## Optional data

- Constellation lines and boundaries can be added to the `assets/` folder.
- 3D star catalog data can be converted into `assets/stars3d.json`.

Refer to `docs/source/README.md` for dataset preparation steps.
