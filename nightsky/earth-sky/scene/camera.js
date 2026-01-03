import * as THREE from "../assets/three/three.module.js";

/**
 * Create a camera that stays at the origin (per project architecture).
 * We "look around" by rotating the sky root group, not by moving the camera.
 */
export function createSkyCamera() {
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 5000);
  camera.position.set(0, 0, 0);
  camera.rotation.set(0, 0, 0);
  return camera;
}

export function setCameraAspect(camera, width, height) {
  camera.aspect = width / Math.max(1, height);
  camera.updateProjectionMatrix();
}

export function zoomCameraFov(camera, deltaY) {
  // Wheel delta is device-dependent; use a gentle exponential scale.
  const scale = Math.exp(deltaY * 0.0012);
  const next = THREE.MathUtils.clamp(camera.fov * scale, 25, 80);
  if (next !== camera.fov) {
    camera.fov = next;
    camera.updateProjectionMatrix();
  }
}

