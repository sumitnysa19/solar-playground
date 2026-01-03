import * as THREE from "../assets/three/three.module.js";

export function raDecToSkyVector3(raDeg, decDeg, radius = 1) {
  const ra = (raDeg * Math.PI) / 180;
  const dec = (decDeg * Math.PI) / 180;
  return new THREE.Vector3(
    radius * Math.cos(dec) * Math.sin(ra),
    radius * Math.sin(dec),
    radius * Math.cos(dec) * Math.cos(ra)
  );
}

export function rotateAroundY(vec3, angleRad) {
  const c = Math.cos(angleRad);
  const s = Math.sin(angleRad);
  const x = vec3.x * c + vec3.z * s;
  const z = -vec3.x * s + vec3.z * c;
  vec3.x = x;
  vec3.z = z;
  return vec3;
}

