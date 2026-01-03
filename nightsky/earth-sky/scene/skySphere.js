import * as THREE from "../assets/three/three.module.js";

/**
 * Create a large inverted sphere for the sky background.
 * Objects are placed on/near this sphere (or slightly inside it).
 */
export function createSkySphere(radius = 1500) {
  const geometry = new THREE.SphereGeometry(radius, 48, 32);
  const material = new THREE.MeshBasicMaterial({
    color: 0x05060c,
    side: THREE.BackSide,
    // Treat as a background layer.
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "SkySphere";
  mesh.renderOrder = -1000;
  return mesh;
}
