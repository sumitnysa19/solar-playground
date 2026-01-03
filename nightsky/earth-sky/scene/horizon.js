import * as THREE from "../assets/three/three.module.js";
import { createLabelSprite } from "./labelSprite.js";

/**
 * Earth ground + horizon (local frame).
 *
 * Coordinate conventions in this project:
 * - +Y is up (zenith)
 * - +Z is north
 * - +X is west
 *
 * The horizon is the great circle at altitude = 0°, i.e. the XZ plane (y = 0).
 * The "ground" is the lower hemisphere (y < 0) seen from the origin.
 *
 * This must be Earth-fixed, so it should be added to the scene root, NOT skyRoot.
 */
export function createGroundAndHorizon({
  radius = 1480,
  groundColor = 0x1f7a3a,
  groundTextureUrl = null,
  horizonColor = 0xe6d3a7,
  withCompass = true,
  compassRadius = radius * 0.985,
  compassHeight = 6,
} = {}) {
  const group = new THREE.Group();
  group.name = "GroundAndHorizon";

  // Lower hemisphere: theta from π/2 (equator) to π (south pole).
  const groundGeo = new THREE.SphereGeometry(
    radius,
    64,
    32,
    0,
    Math.PI * 2,
    Math.PI / 2,
    Math.PI / 2
  );
  
  const groundMat = new THREE.MeshBasicMaterial({
    color: groundColor,
    side: THREE.BackSide,
    transparent: false,
    opacity: 1.0,
    depthWrite: true,
    depthTest: true,
  });
  
  // Load texture if provided
  if (groundTextureUrl) {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      groundTextureUrl,
      // onLoad callback
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2); // Repeat texture for better coverage
        groundMat.map = texture;
        groundMat.needsUpdate = true;
      },
      // onProgress callback (optional)
      undefined,
      // onError callback
      (error) => {
        console.warn("Failed to load ground texture:", error);
        // Fall back to color
      }
    );
  }
  
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.name = "Ground";
  group.add(ground);

  // Horizon ring at y=0.
  const segments = 256;
  const ringPositions = new Float32Array((segments + 1) * 3);
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    ringPositions[i * 3 + 0] = radius * Math.cos(t);
    ringPositions[i * 3 + 1] = 0;
    ringPositions[i * 3 + 2] = radius * Math.sin(t);
  }
  const ringGeo = new THREE.BufferGeometry();
  ringGeo.setAttribute("position", new THREE.BufferAttribute(ringPositions, 3));
  const ringMat = new THREE.LineBasicMaterial({
    color: horizonColor,
    transparent: false,
    opacity: 1.0,
    depthWrite: true,
  });
  const horizon = new THREE.Line(ringGeo, ringMat);
  horizon.name = "HorizonRing";
  horizon.renderOrder = 10;
  group.add(horizon);

  if (withCompass) {
    const compass = createCompassMarkers({
      radius: compassRadius,
      height: compassHeight,
    });
    compass.renderOrder = 20;
    group.add(compass);
  }

  return group;
}

function createCompassMarkers({ radius, height = 6 } = {}) {
  const group = new THREE.Group();
  group.name = "CompassMarkers";

  const points = [
    { label: "N", azDeg: 0, kind: "primary" },
    { label: "NE", azDeg: 45, kind: "secondary" },
    { label: "E", azDeg: 90, kind: "primary" },
    { label: "SE", azDeg: 135, kind: "secondary" },
    { label: "S", azDeg: 180, kind: "primary" },
    { label: "SW", azDeg: 225, kind: "secondary" },
    { label: "W", azDeg: 270, kind: "primary" },
    { label: "NW", azDeg: 315, kind: "secondary" },
  ];

  for (const p of points) {
    const isPrimary = p.kind === "primary";
    const isSecondary = p.kind === "secondary";

    const sprite = createLabelSprite(p.label, {
      font: isPrimary
        ? "900 64px system-ui, Segoe UI, Arial"
        : isSecondary
          ? "850 56px system-ui, Segoe UI, Arial"
          : "800 48px system-ui, Segoe UI, Arial",
      backgroundColor: "rgba(255,255,255,1)",
      textColor: "rgba(139,0,0,1)",
      borderColor: "rgba(139,0,0,1)",
      borderWidth: 1,
      paddingX: isPrimary ? 14 : 12,
      paddingY: isPrimary ? 8 : 7,
      cornerRadius: 0,
    });

    sprite.scale.set(
      isPrimary ? 210 : isSecondary ? 182 : 162,
      isPrimary ? 78 : 68,
      1
    );

    // Azimuth convention: 0°=North, 90°=East, increasing eastward.
    // World axes: +Z north, +X west, so East is -X.
    const azRad = (p.azDeg * Math.PI) / 180;
    const x = -Math.sin(azRad) * radius;
    const z = Math.cos(azRad) * radius;
    sprite.position.set(x, height, z);
    sprite.name = `Compass:${p.label}`;
    sprite.userData.kind = "compassMarker";
    sprite.userData.azDeg = p.azDeg;

    group.add(sprite);
  }

  return group;
}
