import * as THREE from "../assets/three/three.module.js";
import { parseConstellationBoundarySegments } from "../astro/constellationBoundaries.js";

function raHoursToDeg(raHours) {
  return raHours * 15.0;
}

function raDecToSkyVector3(raDeg, decDeg, radius) {
  const ra = (raDeg * Math.PI) / 180;
  const dec = (decDeg * Math.PI) / 180;
  return new THREE.Vector3(
    radius * Math.cos(dec) * Math.sin(ra),
    radius * Math.sin(dec),
    radius * Math.cos(dec) * Math.cos(ra)
  );
}

/**
 * Load and render IAU constellation boundaries as line segments on the sky dome.
 *
 * These boundaries are not "stick figure" asterisms; they are official IAU borders.
 * They still provide full-sky constellation structure and rotate correctly with skyRoot.
 */
export async function loadConstellationBoundaries({
  url = "./assets/data/constbnd.dat",
  radius = 1490,
} = {}) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load constellation boundaries: ${res.status}`);
  const text = await res.text();

  const segments = parseConstellationBoundarySegments(text);

  const positions = new Float32Array(segments.length * 2 * 3);
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const v1 = raDecToSkyVector3(raHoursToDeg(s.raHours1), s.decDeg1, radius);
    const v2 = raDecToSkyVector3(raHoursToDeg(s.raHours2), s.decDeg2, radius);

    const o = i * 6;
    positions[o + 0] = v1.x;
    positions[o + 1] = v1.y;
    positions[o + 2] = v1.z;
    positions[o + 3] = v2.x;
    positions[o + 4] = v2.y;
    positions[o + 5] = v2.z;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();

  const material = new THREE.LineBasicMaterial({
    // Light "sand/wheat" tone for subtle boundaries.
    color: 0xe2d296,
    transparent: true,
    opacity: 0.05,
    depthWrite: false,
  });

  const lines = new THREE.LineSegments(geometry, material);
  lines.name = "ConstellationBoundaries";

  const group = new THREE.Group();
  group.name = "ConstellationsIAU";
  group.add(lines);

  return { group, segmentCount: segments.length };
}
