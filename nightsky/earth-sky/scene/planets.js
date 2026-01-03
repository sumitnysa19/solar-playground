import * as THREE from "../assets/three/three.module.js";
import { altAzToVector3, raDecToAltAz } from "../astro/coordinates.js";
import { localSiderealTime } from "../astro/time.js";
import { planetRaDec, PLANET_KEYS } from "../astro/planets.js";
import { createPointBillboards } from "./pointBillboards.js";
import { createLabelSprite } from "./labelSprite.js";

function titleCase(key) {
  return key.slice(0, 1).toUpperCase() + key.slice(1);
}

const PLANET_STYLE = {
  mercury: { color: 0xb9b6b0, radius: 5 },
  venus: { color: 0xfff0c2, radius: 7 },
  mars: { color: 0xff6a4a, radius: 6 },
  jupiter: { color: 0xffc07a, radius: 9 },
  saturn: { color: 0xf1d47a, radius: 8 },
};

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

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function normalizeDegrees(deg) {
  const w = deg % 360;
  return w < 0 ? w + 360 : w;
}

function normalizeDeltaDegrees(delta) {
  let d = delta % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
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

function buildPathPositions({
  jdNow,
  latitudeDeg,
  longitudeDeg,
  radius,
  planetKey,
}) {
  // Sample -12h .. +12h with 10-minute spacing.
  const halfWindowHours = 12;
  const stepMinutes = 10;
  const steps = (halfWindowHours * 2 * 60) / stepMinutes;

  const positions = [];

  for (let i = 0; i <= steps; i++) {
    const minutesFromNow = -halfWindowHours * 60 + i * stepMinutes;
    const jd = jdNow + minutesFromNow / (24 * 60);

    const { raDeg, decDeg } = planetRaDec(jd, planetKey);
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
  line.geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  line.geometry.computeBoundingSphere();
}

export function createPlanetObjects({ radius = 1490 } = {}) {
  const group = new THREE.Group();
  group.name = "Planets";

  const tiles = PLANET_KEYS.map((key) => {
    const style = PLANET_STYLE[key];
    const col = new THREE.Color(style.color);
    const inner = `rgba(${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(
      col.b * 255
    )},0.95)`;
    return {
      inner,
      outer: "rgba(0,0,0,0)",
      glow: `rgba(${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(
        col.b * 255
      )},0.20)`,
      ringColor: "rgba(0,0,0,0.35)",
      ringWidth: 3,
    };
  });

  const field = createPointBillboards({
    count: PLANET_KEYS.length,
    tileSize: 128,
    tiles,
    renderOrder: 310,
    alphaTest: 0.01,
    depthTest: false,
    depthWrite: false,
    scale: 1,
  });
  field.points.name = "PlanetBillboards";
  field.points.userData.kind = "planetPoints";
  field.points.userData.keys = PLANET_KEYS.slice();
  field.points.userData.items = PLANET_KEYS.map((key) => ({
    kind: "planet",
    key,
    title: titleCase(key),
  }));
  group.add(field.points);

  // Tint each planet's billboard (atlas is neutral; we colorize in-shader).
  for (let i = 0; i < PLANET_KEYS.length; i++) {
    const key = PLANET_KEYS[i];
    const col = new THREE.Color(PLANET_STYLE[key].color);
    field.attributes.colors[i * 3 + 0] = col.r;
    field.attributes.colors[i * 3 + 1] = col.g;
    field.attributes.colors[i * 3 + 2] = col.b;
  }
  field.geometry.getAttribute("aColor").needsUpdate = true;

  const planetLabels = {};
  const planetPaths = {};
  const _tmp = new THREE.Vector3();

  for (const key of PLANET_KEYS) {
    const style = PLANET_STYLE[key];
    const label = createLabelSprite(titleCase(key), {
      font: "600 40px system-ui, Segoe UI, Arial",
      backgroundColor: "rgba(0,0,0,0.45)",
      textColor: "rgba(240,244,255,0.90)",
    });
    label.scale.set(220, 54, 1);
    label.visible = false;
    group.add(label);
    planetLabels[key] = label;

    const path = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({
        color: style.color,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      })
    );
    path.name = `${titleCase(key)}Path`;
    group.add(path);
    planetPaths[key] = path;
  }

  return {
    group,
    radius,
    field,
    planetLabels,
    planetPaths,
    _pathCacheKey: "",
    _tmp,
  };
}

// Helper to get Ra/Dec (degrees) from helio state
function getRaDec(helioProvider, bodyId, jd) {
  if (!helioProvider) return null;
  const earth = helioProvider.getBodyState('Earth', jd);
  const target = helioProvider.getBodyState(bodyId, jd);

  if (!earth || !target) return null;

  // Relative vector (Target - Earth)
  const x = target.x - earth.x;
  const y = target.y - earth.y;
  const z = target.z - earth.z;

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



export function updatePlanetObjects(objects, {
  jd,
  latitudeDeg,
  longitudeDeg,
  lstDeg,
  forceVisibleKey,
  helioProvider,
  ayanamsaDeg,
}) {
  const { radius, field, planetLabels, planetPaths, _tmp } = objects;
  const pos = field.attributes.positions;
  const sizePx = field.attributes.sizePx;
  const alpha = field.attributes.alpha;
  const over = field.attributes.overexposure;

  // Track which planets are currently above the horizon.
  const aboveHorizon = {};
  const aboveHorizonRaw = {};

  const ephemeris = arguments.length > 1 ? arguments[1]?.ephemeris : null;

  for (let i = 0; i < PLANET_KEYS.length; i++) {
    const key = PLANET_KEYS[i];
    const style = PLANET_STYLE[key];
    const titleKey = titleCase(key); // e.g. "Mercury" for helper lookup

    let eq = getRaDec(helioProvider, titleKey, jd);
    if (!eq) eq = ephemeris?.getRaDec?.(jd, key) ?? planetRaDec(jd, key);

    const rasi = computeRasiInfo({
      raDeg: eq.raDeg,
      decDeg: eq.decDeg,
      jd,
      ayanamsaDeg,
    });

    const deltaDays = 1.0;
    let eqNext = getRaDec(helioProvider, titleKey, jd + deltaDays);
    if (!eqNext) eqNext = ephemeris?.getRaDec?.(jd + deltaDays, key) ?? planetRaDec(jd + deltaDays, key);
    const rasiNext = computeRasiInfo({
      raDeg: eqNext.raDeg,
      decDeg: eqNext.decDeg,
      jd: jd + deltaDays,
      ayanamsaDeg,
    });
    const deltaLambda = normalizeDeltaDegrees(rasiNext.lambdaSidereal - rasi.lambdaSidereal);
    const rateDegPerDay = deltaLambda / deltaDays;
    const retroThreshold = 0.02;
    let retrogradeState = "Direct";
    if (Math.abs(rateDegPerDay) < retroThreshold) retrogradeState = "Stationary";
    else if (rateDegPerDay < 0) retrogradeState = "Retrograde";

    const hor = raDecToAltAz(eq.raDeg, eq.decDeg, latitudeDeg, lstDeg);
    const forced = forceVisibleKey === key;
    const visible = forced || hor.altitudeDeg > 0;
    aboveHorizon[key] = visible;
    aboveHorizonRaw[key] = hor.altitudeDeg > 0;

    const apparentAlt = hor.altitudeDeg + (hor.refractionDeg || 0);
    const v = altAzToVector3(apparentAlt, hor.azimuthDeg, radius);
    pos[i * 3 + 0] = v.x;
    pos[i * 3 + 1] = v.y;
    pos[i * 3 + 2] = v.z;

    // Size tuned in pixels, loosely matching the old sphere radii.
    sizePx[i] = visible ? style.radius * (forced ? 4.2 : 3.2) : 0;
    alpha[i] = visible ? 1 : 0;
    over[i] = forced ? 0.10 : 0;

    const label = planetLabels[key];
    label.visible = visible;
    if (visible) {
      _tmp.copy(v).normalize().multiplyScalar(14 + style.radius * 0.6);
      label.position.copy(v).add(_tmp);
    }

    const item = field.points.userData.items?.[i];
    if (item) {
      item.eq = eq;
      item.hor = hor;
      item.rasi = {
        name: rasi.rasiName,
        degreeInRasi: rasi.degreeInRasi,
        lambdaSidereal: rasi.lambdaSidereal,
        lambdaTropical: rasi.lambdaTropical,
        rasiStartDeg: rasi.rasiIndex * 30,
        retrogradeState,
        rateDegPerDay,
      };
    }
  }

  // Recompute cached paths only when time (minute), latitude, or longitude changes.
  const timeKey = Math.round(jd * 24 * 60);
  const latKey = Math.round(latitudeDeg * 10000);
  const lonKey = Math.round(longitudeDeg * 10000);
  const cacheKey = `${timeKey}|${latKey}|${lonKey}`;

  if (objects._pathCacheKey !== cacheKey) {
    objects._pathCacheKey = cacheKey;

    for (const key of PLANET_KEYS) {
      const positions = buildPathPositions({
        jdNow: jd,
        latitudeDeg,
        longitudeDeg,
        radius,
        planetKey: key,
      });
      const line = planetPaths[key];
      setLinePositions(line, positions);
      // Only show lines for planets that are above the horizon at the current time/place.
      line.visible = aboveHorizonRaw[key] && positions.length >= 6;
    }
  }

  // Even when geometry is cached (no recompute), enforce the "above horizon only" rule.
  for (const key of PLANET_KEYS) {
    const line = planetPaths[key];
    const posAttr = line.geometry.getAttribute("position");
    const hasLine = !!posAttr && posAttr.count >= 2;
    line.visible = (forceVisibleKey !== key ? aboveHorizon[key] : false) && hasLine;
  }

  field.geometry.getAttribute("position").needsUpdate = true;
  field.geometry.getAttribute("aSizePx").needsUpdate = true;
  field.geometry.getAttribute("aAlpha").needsUpdate = true;
  field.geometry.computeBoundingSphere();
}
