import * as THREE from "../assets/three/three.module.js";
import { altAzToVector3, raDecToAltAz } from "../astro/coordinates.js";
import { sunRaDec, moonRaDec } from "../astro/solarSystem.js";
import { localSiderealTime } from "../astro/time.js";
import { createPointBillboards } from "./pointBillboards.js";
import { createLabelSprite } from "./labelSprite.js";

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const RASI_NAMES = [
  "Mesha",
  "Vrishabha",
  "Mithuna",
  "Karka",
  "Simha",
  "Kanya",
  "Tula",
  "Vrishchika",
  "Dhanu",
  "Makara",
  "Kumbha",
  "Meena",
];

function normalizeDegrees(deg) {
  const w = deg % 360;
  return w < 0 ? w + 360 : w;
}

function obliquityDeg(jd) {
  const n = jd - 2451545.0;
  return 23.439 - 0.0000004 * n;
}

function raDecToEclipticLongitude(raDeg, decDeg, epsDeg) {
  const ra = raDeg * DEG2RAD;
  const dec = decDeg * DEG2RAD;
  const eps = epsDeg * DEG2RAD;

  const x = Math.cos(dec) * Math.cos(ra);
  const y = Math.cos(dec) * Math.sin(ra);
  const z = Math.sin(dec);

  const yEcl = y * Math.cos(eps) + z * Math.sin(eps);
  const xEcl = x;
  let lambda = Math.atan2(yEcl, xEcl) * RAD2DEG;
  if (lambda < 0) lambda += 360;
  return lambda;
}

function computeRasiInfo({ raDeg, decDeg, jd, ayanamsaDeg }) {
  const eps = obliquityDeg(jd);
  const lambdaTropical = raDecToEclipticLongitude(raDeg, decDeg, eps);
  const ayanamsa = Number.isFinite(ayanamsaDeg) ? ayanamsaDeg : 24.0;
  const lambdaSidereal = normalizeDegrees(lambdaTropical - ayanamsa);
  const rasiIndex = Math.floor(lambdaSidereal / 30) % 12;
  const degreeInRasi = lambdaSidereal - rasiIndex * 30;
  return {
    lambdaTropical,
    lambdaSidereal,
    rasiIndex,
    rasiName: RASI_NAMES[rasiIndex],
    degreeInRasi,
  };
}

export function createSolarSystemObjects({ radius = 1490 } = {}) {
  const group = new THREE.Group();
  group.name = "SolarSystem";

  const field = createPointBillboards({
    count: 2,
    tileSize: 128,
    tiles: [
      // Sun
      {
        inner: "rgba(255,245,210,1)",
        outer: "rgba(255,190,90,0.0)",
        glow: "rgba(255,210,120,0.55)",
        ringColor: "rgba(0,0,0,0.45)",
        ringWidth: 4,
      },
      // Moon
      {
        inner: "rgba(245,248,255,0.95)",
        outer: "rgba(180,190,210,0.0)",
        glow: "rgba(190,200,220,0.18)",
        ringColor: "rgba(0,0,0,0.18)",
        ringWidth: 3,
      },
    ],
    renderOrder: 320,
    alphaTest: 0.01,
    depthTest: false,
    depthWrite: false,
    scale: 1,
  });
  field.points.name = "SolarBillboards";
  field.points.userData.kind = "solarPoints";
  field.points.userData.items = [
    { kind: "sun", title: "Sun" },
    { kind: "moon", title: "Moon" },
  ];
  group.add(field.points);

  // Per-body tint.
  field.attributes.colors[0] = 1.0;
  field.attributes.colors[1] = 0.95;
  field.attributes.colors[2] = 0.78;
  field.attributes.colors[3] = 0.90;
  field.attributes.colors[4] = 0.92;
  field.attributes.colors[5] = 0.98;
  field.geometry.getAttribute("aColor").needsUpdate = true;

  const sunLabel = createLabelSprite("Sun");
  sunLabel.scale.set(240, 60, 1);
  group.add(sunLabel);

  const moonLabel = createLabelSprite("Moon");
  moonLabel.scale.set(240, 60, 1);
  group.add(moonLabel);

  // STEP A: trace lines (paths) for -12h..+12h around current time.
  const sunPath = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({
      color: 0xffd36a,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    })
  );
  sunPath.name = "SunPath";
  group.add(sunPath);

  const moonPath = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({
      color: 0xd6dbe6,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    })
  );
  moonPath.name = "MoonPath";
  group.add(moonPath);

  return {
    group,
    field,
    sunLabel,
    moonLabel,
    sunPath,
    moonPath,
    radius,
    _pathCacheKey: "",
  };
}

function buildPathPositions({
  jdNow,
  latitudeDeg,
  longitudeDeg,
  radius,
  bodyRaDec,
}) {
  // Sample -12h .. +12h with 10-minute spacing (145 samples).
  const halfWindowHours = 12;
  const stepMinutes = 10;
  const steps = (halfWindowHours * 2 * 60) / stepMinutes;

  const positions = [];

  for (let i = 0; i <= steps; i++) {
    const minutesFromNow = -halfWindowHours * 60 + i * stepMinutes;
    const jd = jdNow + minutesFromNow / (24 * 60);

    const { raDeg, decDeg } = bodyRaDec(jd);

    // Horizon visibility test uses the time-specific LST.
    const lstDeg = localSiderealTime(jd, longitudeDeg);
    const { altitudeDeg, azimuthDeg, refractionDeg } = raDecToAltAz(
      raDeg,
      decDeg,
      latitudeDeg,
      lstDeg
    );
    const apparentAlt = altitudeDeg + (refractionDeg || 0);
    if (apparentAlt < 0) continue;

    const v = altAzToVector3(apparentAlt, azimuthDeg, radius);

    positions.push(v.x, v.y, v.z);
  }

  return positions;
}

function setLinePositions(line, positions) {
  const geometry = line.geometry;
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();
}

/**
 * Update positions from time.
 *
 * Math pipeline (explicit):
 * 1) Compute geocentric RA/Dec from Julian Date.
 * 2) Convert to Alt/Az using observer latitude + Local Sidereal Time.
 * 3) Use altitude to hide below the horizon; place object on the dome radius.
 *
 * Note: stars remain static and are rotated via skyRoot; these objects update per time-step.
 */
// Helper to get Ra/Dec (degrees) from helio state
function getRaDec(helioProvider, bodyId, jd) {
  if (!helioProvider) return null;
  const earth = helioProvider.getBodyState('Earth', jd);
  let target = helioProvider.getBodyState(bodyId, jd);

  if (!earth) return null; // Need Earth as observer

  // Special case: Sun. Target is (0,0,0) in heliocentric
  if (bodyId === 'Sun') target = { x: 0, y: 0, z: 0 };

  if (!target) return null;

  // Relative vector (Target - Earth)
  const x = target.x - earth.x;
  const y = target.y - earth.y;
  const z = target.z - earth.z;

  // Assume simulation coordinates are Ecliptic Cartesian.
  // Rotate to Equatorial. Obliquity ~23.4 degrees.
  const eps = 23.43928 * Math.PI / 180;
  const yEq = y * Math.cos(eps) - z * Math.sin(eps);
  const zEq = y * Math.sin(eps) + z * Math.cos(eps);
  const xEq = x;

  const r = Math.sqrt(xEq * xEq + yEq * yEq + zEq * zEq);
  if (r < 1e-9) return { raDeg: 0, decDeg: 0 };

  const dec = Math.asin(zEq / r);
  const ra = Math.atan2(yEq, xEq);

  let raDeg = ra * 180 / Math.PI;
  if (raDeg < 0) raDeg += 360;
  const decDeg = dec * 180 / Math.PI;

  return { raDeg, decDeg };
}

export function updateSolarSystemObjects(
  objects,
  { jd, latitudeDeg, longitudeDeg, lstDeg, forceVisibleKey, ephemeris, helioProvider, ayanamsaDeg }
) {
  const { radius, field, sunLabel, moonLabel, sunPath, moonPath } = objects;
  const pos = field.attributes.positions;
  const sizePx = field.attributes.sizePx;
  const alpha = field.attributes.alpha;
  const over = field.attributes.overexposure;

  const forceKey = forceVisibleKey;

  // Try helio provider first, then ephemeris, then fallback
  let sunEq = getRaDec(helioProvider, 'Sun', jd);
  if (!sunEq) sunEq = ephemeris?.getRaDec?.(jd, "sun") ?? sunRaDec(jd);

  const sunHor = raDecToAltAz(sunEq.raDeg, sunEq.decDeg, latitudeDeg, lstDeg);
  const sunForced = forceKey === "sun";
  const sunVisible = sunForced || sunHor.altitudeDeg > 0;
  const sunAppAlt = sunHor.altitudeDeg + (sunHor.refractionDeg || 0);
  const sunV = altAzToVector3(sunAppAlt, sunHor.azimuthDeg, radius);
  pos[0] = sunV.x;
  pos[1] = sunV.y;
  pos[2] = sunV.z;
  sizePx[0] = sunVisible ? (sunForced ? 56 : 48) : 0;
  alpha[0] = sunVisible ? 1 : 0;
  // Keep overexposure low so the sun edge remains readable (ring in atlas).
  over[0] = sunVisible ? 0.12 : 0;
  sunLabel.visible = sunVisible;
  if (sunVisible) {
    const dir = new THREE.Vector3(sunV.x, sunV.y, sunV.z).normalize();
    sunLabel.position.set(sunV.x, sunV.y, sunV.z).addScaledVector(dir, 16);
  }

  let moonEq = getRaDec(helioProvider, 'Moon', jd);
  if (!moonEq) moonEq = ephemeris?.getRaDec?.(jd, "moon") ?? moonRaDec(jd);

  const moonHor = raDecToAltAz(moonEq.raDeg, moonEq.decDeg, latitudeDeg, lstDeg);
  const moonForced = forceKey === "moon";
  const moonVisible = moonForced || moonHor.altitudeDeg > 0;
  const moonAppAlt = moonHor.altitudeDeg + (moonHor.refractionDeg || 0);
  const moonV = altAzToVector3(moonAppAlt, moonHor.azimuthDeg, radius);
  pos[3] = moonV.x;
  pos[4] = moonV.y;
  pos[5] = moonV.z;
  sizePx[1] = moonVisible ? (moonForced ? 42 : 36) : 0;
  alpha[1] = moonVisible ? 0.95 : 0;
  over[1] = 0;
  moonLabel.visible = moonVisible;
  if (moonVisible) {
    const dir = new THREE.Vector3(moonV.x, moonV.y, moonV.z).normalize();
    moonLabel.position.set(moonV.x, moonV.y, moonV.z).addScaledVector(dir, 14);
  }

  // Update pick info payload (kept on the Points object).
  field.points.userData.items[0].eq = sunEq;
  field.points.userData.items[0].hor = sunHor;
  const sunRasi = computeRasiInfo({
    raDeg: sunEq.raDeg,
    decDeg: sunEq.decDeg,
    jd,
    ayanamsaDeg,
  });
  field.points.userData.items[0].rasi = {
    name: sunRasi.rasiName,
    degreeInRasi: sunRasi.degreeInRasi,
    lambdaSidereal: sunRasi.lambdaSidereal,
    lambdaTropical: sunRasi.lambdaTropical,
    rasiStartDeg: sunRasi.rasiIndex * 30,
    retrogradeState: "Direct",
    rateDegPerDay: 0,
  };

  field.points.userData.items[1].eq = moonEq;
  field.points.userData.items[1].hor = moonHor;
  const moonRasi = computeRasiInfo({
    raDeg: moonEq.raDeg,
    decDeg: moonEq.decDeg,
    jd,
    ayanamsaDeg,
  });
  field.points.userData.items[1].rasi = {
    name: moonRasi.rasiName,
    degreeInRasi: moonRasi.degreeInRasi,
    lambdaSidereal: moonRasi.lambdaSidereal,
    lambdaTropical: moonRasi.lambdaTropical,
    rasiStartDeg: moonRasi.rasiIndex * 30,
    retrogradeState: "Direct",
    rateDegPerDay: 0,
  };

  // STEP A: recompute trace lines only when time (minute) or latitude changes.
  // (Longitude affects LST and therefore the horizon test, so we include it too.)
  const timeKey = Math.round(jd * 24 * 60); // minute resolution
  const latKey = Math.round(latitudeDeg * 10000);
  const lonKey = Math.round(longitudeDeg * 10000);
  const cacheKey = `${timeKey}|${latKey}|${lonKey}`;

  if (objects._pathCacheKey !== cacheKey) {
    objects._pathCacheKey = cacheKey;

    const sunPositions = buildPathPositions({
      jdNow: jd,
      latitudeDeg,
      longitudeDeg,
      radius,
      bodyRaDec: sunRaDec,
    });
    setLinePositions(sunPath, sunPositions);
    sunPath.visible = sunPositions.length >= 6;

    const moonPositions = buildPathPositions({
      jdNow: jd,
      latitudeDeg,
      longitudeDeg,
      radius,
      bodyRaDec: moonRaDec,
    });
    setLinePositions(moonPath, moonPositions);
    moonPath.visible = moonPositions.length >= 6;
  }

  field.geometry.getAttribute("position").needsUpdate = true;
  field.geometry.getAttribute("aSizePx").needsUpdate = true;
  field.geometry.getAttribute("aAlpha").needsUpdate = true;
  field.geometry.getAttribute("aOverexposure").needsUpdate = true;
  field.geometry.computeBoundingSphere();
}
