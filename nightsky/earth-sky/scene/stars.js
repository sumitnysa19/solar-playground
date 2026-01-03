import * as THREE from "../assets/three/three.module.js";
import { altAzToVector3, raDecToAltAz } from "../astro/coordinates.js";
import { adjustMagnitudeForAltitude } from "../astro/extinction.js";
import { sunRaDec } from "../astro/solarSystem.js";

function mulberry32(seed) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function magnitudeToSizePx(mag) {
  return clamp(4.6 - 0.62 * mag, 0.8, 4.8);
}

function magnitudeToFlux01(mag) {
  // Convert magnitude to relative flux (normalized-ish for visuals).
  // mag=0 => 1, mag=6 => ~0.004; scale up and clamp to [0,1].
  const flux = Math.pow(10, -0.4 * mag);
  return clamp(flux * 1.6, 0, 1);
}

/**
 * Generate a simple, procedural star catalog.
 *
 * This is not a real star database; it's a legally safe placeholder that still
 * exercises all coordinate math and rendering logic.
 */
export function generateProceduralStars({ count = 2500, seed = 123456 } = {}) {
  const rand = mulberry32(seed);
  const stars = new Array(count);

  for (let i = 0; i < count; i++) {
    const raDeg = rand() * 360;

    // Uniform on sphere: u in [-1,1] corresponds to sin(dec).
    const u = rand() * 2 - 1;
    const decDeg = Math.asin(u) * (180 / Math.PI);

    // Rough magnitude distribution: many faint, few bright.
    const mag = clamp(6 * Math.pow(rand(), 2.2), 0, 6);

    stars[i] = { raDeg, decDeg, mag };
  }

  return stars;
}

function normalizeCatalogStars(stars) {
  if (!Array.isArray(stars)) return null;
  const normalized = [];
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    if (!s) continue;
    const raDeg = Number(s.raDeg);
    const decDeg = Number(s.decDeg);
    const mag = Number(s.mag);
    if (!Number.isFinite(raDeg) || !Number.isFinite(decDeg) || !Number.isFinite(mag)) continue;
    normalized.push({
      raDeg,
      decDeg,
      mag,
      name: typeof s.name === "string" ? s.name : null,
      color: s.color && Number.isFinite(s.color.r) ? s.color : null,
    });
  }
  return normalized.length ? normalized : null;
}

function createStarMaterial({ pixelRatio = 1 } = {}) {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
    },
    vertexShader: `
      attribute float aSizePx;
      attribute float aFlux01;
      attribute float aAlpha;
      attribute vec3 aRgb;
      attribute float aTwinklePhase;
      attribute float aTwinkleAmp;
      attribute float aSparkleStart;
      attribute float aSparkleDuration;
      attribute float aSparkleMin;

      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;
      uniform float uPixelRatio;

      float sparkleFactor(float nowSec, float startSec, float durationSec, float minVal) {
        if (durationSec <= 0.0) return 1.0;
        float t = (nowSec - startSec) / durationSec;
        if (t < 0.0 || t > 1.0) return 1.0;
        float up = smoothstep(0.0, 0.20, t);
        float down = 1.0 - smoothstep(0.75, 1.0, t);
        float pulse = up * down;
        // Pulse up, but keep a minimum (used for small "scintillation" dips if desired).
        float boost = 1.0 + (1.0 - minVal) * 0.9 * pulse;
        return boost;
      }

      void main() {
        float tw = 1.0 + aTwinkleAmp * sin(uTime * 2.0 + aTwinklePhase);
        float sp = sparkleFactor(uTime, aSparkleStart, aSparkleDuration, aSparkleMin);

        float b = aFlux01 * tw * sp;
        vColor = aRgb * b;
        vAlpha = clamp(aAlpha * (0.2 + 0.9 * b), 0.0, 1.0);

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = aSizePx * uPixelRatio;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(p, p);
        float alpha = smoothstep(1.0, 0.0, r2);
        alpha = pow(alpha, 1.6) * vAlpha;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
  });

  return material;
}

/**
 * Create a THREE.Points object for stars, positioned on the inside of a sky dome.
 *
 * Stars are static in RA/Dec coordinates; the dome is rotated by LST via `skyRoot`.
 * We only update a time uniform for twinkling in `updateStarsForObserver`.
 */
export function createStarField({ radius = 1490, count = 2500, seed = 123456 } = {}) {
  const stars = generateProceduralStars({ count, seed });
  return createStarFieldFromCatalog({ radius, stars });
}

export function createStarFieldFromCatalog({ radius = 1490, stars } = {}) {
  const normalized = normalizeCatalogStars(stars) ?? [];

  const positions = new Float32Array(normalized.length * 3);
  const sizePx = new Float32Array(normalized.length);
  const flux01 = new Float32Array(normalized.length);
  const alpha = new Float32Array(normalized.length);
  const rgb = new Float32Array(normalized.length * 3);
  const twPhase = new Float32Array(normalized.length);
  const twAmp = new Float32Array(normalized.length);
  const sparkleStart = new Float32Array(normalized.length);
  const sparkleDuration = new Float32Array(normalized.length);
  const sparkleMin = new Float32Array(normalized.length);

  const rand = mulberry32((normalized.length * 2654435761) ^ 0x9e3779b9);

  for (let i = 0; i < normalized.length; i++) {
    const star = normalized[i];

    const raRad = (star.raDeg * Math.PI) / 180;
    const decRad = (star.decDeg * Math.PI) / 180;

    const x = radius * Math.cos(decRad) * Math.sin(raRad);
    const y = radius * Math.sin(decRad);
    const z = radius * Math.cos(decRad) * Math.cos(raRad);

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    sizePx[i] = magnitudeToSizePx(star.mag);
    twPhase[i] = rand() * Math.PI * 2;
    twAmp[i] = 0.06 + 0.10 * rand();

    flux01[i] = magnitudeToFlux01(star.mag);
    alpha[i] = 1;
    sparkleStart[i] = -1;
    sparkleDuration[i] = 0;
    sparkleMin[i] = 0.35;

    const c = star.color;
    if (c && Number.isFinite(c.r) && Number.isFinite(c.g) && Number.isFinite(c.b)) {
      rgb[i * 3 + 0] = c.r;
      rgb[i * 3 + 1] = c.g;
      rgb[i * 3 + 2] = c.b;
    } else {
      rgb[i * 3 + 0] = 1;
      rgb[i * 3 + 1] = 1;
      rgb[i * 3 + 2] = 1;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSizePx", new THREE.BufferAttribute(sizePx, 1));
  geometry.setAttribute("aFlux01", new THREE.BufferAttribute(flux01, 1));
  geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
  geometry.setAttribute("aRgb", new THREE.BufferAttribute(rgb, 3));
  geometry.setAttribute("aTwinklePhase", new THREE.BufferAttribute(twPhase, 1));
  geometry.setAttribute("aTwinkleAmp", new THREE.BufferAttribute(twAmp, 1));
  geometry.setAttribute("aSparkleStart", new THREE.BufferAttribute(sparkleStart, 1));
  geometry.setAttribute("aSparkleDuration", new THREE.BufferAttribute(sparkleDuration, 1));
  geometry.setAttribute("aSparkleMin", new THREE.BufferAttribute(sparkleMin, 1));
  geometry.computeBoundingSphere();

  const material = createStarMaterial({
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
  });

  const points = new THREE.Points(geometry, material);
  points.name = "Stars";
  points.frustumCulled = false;
  points.userData.kind = "stars";
  points.userData.stars = normalized;

  return {
    points,
    stars: normalized,
    radius,
    material,
    _visibilityCacheKey: "",
    _sparkleNextAtSec: 0,
    _visibleIndices: [],
  };
}

export function updateStarsForObserver(starField, observer) {
  if (!starField?.material?.uniforms?.uTime) return;

  const nowSec = performance.now() / 1000;
  starField.material.uniforms.uTime.value = nowSec;
  starField.material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2);

  const jd = observer?.jd;
  const latitudeDeg = observer?.latitudeDeg;
  const longitudeDeg = observer?.longitudeDeg;
  const lstDeg = observer?.lstDeg;
  if (
    typeof jd !== "number" ||
    !Number.isFinite(jd) ||
    !Number.isFinite(latitudeDeg) ||
    !Number.isFinite(longitudeDeg) ||
    !Number.isFinite(lstDeg)
  ) {
    return;
  }

  // Daylight fade: hide stars as the sun rises above twilight.
  const sunEq = sunRaDec(jd);
  const sunHor = raDecToAltAz(sunEq.raDeg, sunEq.decDeg, latitudeDeg, lstDeg);
  const sunAlt = sunHor.altitudeDeg;
  const dayFactor = clamp((sunAlt + 6) / 10, 0, 1); // -6°..+4° => 0..1

  const timeKey = Math.round(jd * 24 * 60);
  const latKey = Math.round(latitudeDeg * 1000);
  const lonKey = Math.round(longitudeDeg * 1000);
  const cacheKey = `${timeKey}|${latKey}|${lonKey}`;

  const geometry = starField.points.geometry;
  const sizeAttr = geometry.getAttribute("aSizePx");
  const alphaAttr = geometry.getAttribute("aAlpha");
  const fluxAttr = geometry.getAttribute("aFlux01");
  const posAttr = geometry.getAttribute("position");
  const useHorizonFrame = !!observer?.useHorizonFrame;
  const radius = starField.radius || 1490;

  if (starField._visibilityCacheKey !== cacheKey) {
    starField._visibilityCacheKey = cacheKey;

    const stars = starField.stars;
    const visibleIndices = [];

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      const { altitudeDeg, azimuthDeg, refractionDeg } = raDecToAltAz(
        star.raDeg,
        star.decDeg,
        latitudeDeg,
        lstDeg
      );
      const apparentAlt = altitudeDeg + (refractionDeg || 0);

      if (apparentAlt <= 0) {
        alphaAttr.array[i] = 0;
        sizeAttr.array[i] = 0;
        continue;
      }

      const magAdj = adjustMagnitudeForAltitude(star.mag, apparentAlt, {
        k: 0.18,
        maxDeltaMag: 3.0,
      });

      fluxAttr.array[i] = magnitudeToFlux01(magAdj);
      alphaAttr.array[i] = 1 - dayFactor;
      sizeAttr.array[i] = magnitudeToSizePx(star.mag);
      visibleIndices.push(i);

      if (useHorizonFrame && posAttr) {
        const v = altAzToVector3(apparentAlt, azimuthDeg, radius);
        posAttr.array[i * 3 + 0] = v.x;
        posAttr.array[i * 3 + 1] = v.y;
        posAttr.array[i * 3 + 2] = v.z;
      }
    }

    starField._visibleIndices = visibleIndices;
    sizeAttr.needsUpdate = true;
    alphaAttr.needsUpdate = true;
    fluxAttr.needsUpdate = true;
    if (useHorizonFrame && posAttr) {
      posAttr.needsUpdate = true;
      geometry.computeBoundingSphere();
    }
  }

  // Sparkle scheduler: periodically assign short sparkle windows to a subset of visible stars.
  if (nowSec >= (starField._sparkleNextAtSec || 0)) {
    const sparkStartAttr = geometry.getAttribute("aSparkleStart");
    const sparkDurAttr = geometry.getAttribute("aSparkleDuration");
    const sparkMinAttr = geometry.getAttribute("aSparkleMin");

    const visible = starField._visibleIndices || [];
    const n = visible.length;
    if (n > 0) {
      const pickCount = Math.max(1, Math.floor(n * 0.02));
      for (let j = 0; j < pickCount; j++) {
        const idx = visible[Math.floor(Math.random() * n)];
        sparkStartAttr.array[idx] = nowSec + Math.random() * 0.6;
        sparkDurAttr.array[idx] = 0.35 + Math.random() * 0.8;
        sparkMinAttr.array[idx] = 0.25 + Math.random() * 0.35;
      }
      sparkStartAttr.needsUpdate = true;
      sparkDurAttr.needsUpdate = true;
      sparkMinAttr.needsUpdate = true;
    }

    starField._sparkleNextAtSec = nowSec + (0.14 + Math.random() * 0.20);
  }
}
