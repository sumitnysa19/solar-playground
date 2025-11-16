# Next Session Plan

## 1. Prepare Offline 3D Tiles
- Capture or source high-resolution photogrammetry/LiDAR data for the target region.
- Clean meshes (normals, UVs) in Blender/Meshlab and export as OBJ/FBX.
- Run a 3D Tiles tiler (Cesium ion download, 3d-tiles-tools, or py3dtiles) with low geometric-error settings.
- Verify the generated 	ileset.json locally in CesiumJS to ensure texture quality.

## 2. Host and Integrate Local Tiles
- Copy the tileset directory into public/tiles/offline-earth.
- Update earth.jsx to swap the CesiumIon loader with a TilesRenderer('/tiles/offline-earth/tileset.json') instance (remove auth plugins).
- Add a flag so you can flip between online/offline tiles for testing.
- Test in dev mode with network disabled to confirm the dataset loads fully offline.

## 3. Camera Focus & UI Polish
- Re-check ISS/Moon/Earth focus hitboxes after integrating new tiles (ensure setTarget fires).
- Consider reintroducing labels once focus is reliable (maybe use small Html elements with distanceFactor={8} so they stay proportional).
- Add a HUD toggle button to quickly jump between Earth/Moon/ISS targets without clicking objects.

## 4. QA Pass
- Verify zoom/pan limits can’t clip through the offline mesh (adjust OrbitControls minDistance).
- Inspect performance: watch fps with offline tiles, tune errorTarget/maxDepth to balance quality vs. load.
- Check ISS orbit trail and Moon orbit still align with the new dataset extents.

Document any issues you hit so we can iterate next session.
