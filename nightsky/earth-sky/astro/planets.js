/**
 * Simplified planet positions (Mercury, Venus, Mars, Jupiter, Saturn).
 *
 * This uses a compact, widely published low-precision model based on
 * time-varying Keplerian orbital elements and a heliocentric->geocentric transform.
 *
 * Output: geocentric equatorial coordinates (RA/Dec) in degrees.
 *
 * Notes:
 * - Accuracy is suitable for visualization (order ~1° typical; worse near some configurations).
 * - Ignores light-time, aberration, nutation, and higher-order perturbations.
 */

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const JD_J2000 = 2451545.0; // 2000-01-01T12:00:00Z

function normalizeDegrees(deg) {
  const w = deg % 360;
  return w < 0 ? w + 360 : w;
}

function solveKeplerE(Mrad, e) {
  // Newton iterations for E - e sin E = M
  let E = Mrad;
  for (let i = 0; i < 6; i++) {
    const f = E - e * Math.sin(E) - Mrad;
    const fp = 1 - e * Math.cos(E);
    E = E - f / fp;
  }
  return E;
}

function obliquityRad(jd) {
  // Same linear approximation used elsewhere in this project.
  const n = jd - JD_J2000;
  const epsDeg = 23.439 - 0.0000004 * n;
  return epsDeg * DEG2RAD;
}

/**
 * Orbital elements, linearly varying with d (days since 2000-01-01 00:00 UT).
 *
 * Values are standard low-precision element sets commonly published for educational use.
 * Units:
 * - angles in degrees
 * - a in AU
 */
const ELEMENTS = {
  mercury: (d) => ({
    N: 48.3313 + 3.24587e-5 * d,
    i: 7.0047 + 5.00e-8 * d,
    w: 29.1241 + 1.01444e-5 * d,
    a: 0.387098,
    e: 0.205635 + 5.59e-10 * d,
    M: 168.6562 + 4.0923344368 * d,
  }),
  venus: (d) => ({
    N: 76.6799 + 2.46590e-5 * d,
    i: 3.3946 + 2.75e-8 * d,
    w: 54.8910 + 1.38374e-5 * d,
    a: 0.723330,
    e: 0.006773 - 1.302e-9 * d,
    M: 48.0052 + 1.6021302244 * d,
  }),
  earth: (d) => ({
    // Earth heliocentric orbit (for geocentric transform).
    N: 0.0,
    i: 0.0,
    w: 282.9404 + 4.70935e-5 * d,
    a: 1.000000,
    e: 0.016709 - 1.151e-9 * d,
    M: 356.0470 + 0.9856002585 * d,
  }),
  mars: (d) => ({
    N: 49.5574 + 2.11081e-5 * d,
    i: 1.8497 - 1.78e-8 * d,
    w: 286.5016 + 2.92961e-5 * d,
    a: 1.523688,
    e: 0.093405 + 2.516e-9 * d,
    M: 18.6021 + 0.5240207766 * d,
  }),
  jupiter: (d) => ({
    N: 100.4542 + 2.76854e-5 * d,
    i: 1.3030 - 1.557e-7 * d,
    w: 273.8777 + 1.64505e-5 * d,
    a: 5.20256,
    e: 0.048498 + 4.469e-9 * d,
    M: 19.8950 + 0.0830853001 * d,
  }),
  saturn: (d) => ({
    N: 113.6634 + 2.38980e-5 * d,
    i: 2.4886 - 1.081e-7 * d,
    w: 339.3939 + 2.97661e-5 * d,
    a: 9.55475,
    e: 0.055546 - 9.499e-9 * d,
    M: 316.9670 + 0.0334442282 * d,
  }),
};

function heliocentricEclipticXYZ(jd, elementsFn) {
  // d is days since 2000-01-01 00:00 UT (common in these element sets).
  const d = jd - 2451543.5;
  const el = elementsFn(d);

  const N = normalizeDegrees(el.N) * DEG2RAD;
  const i = el.i * DEG2RAD;
  const w = normalizeDegrees(el.w) * DEG2RAD;
  const a = el.a;
  const e = el.e;
  const M = normalizeDegrees(el.M) * DEG2RAD;

  const E = solveKeplerE(M, e);
  const xv = a * (Math.cos(E) - e);
  const yv = a * (Math.sqrt(1 - e * e) * Math.sin(E));

  const v = Math.atan2(yv, xv);
  const r = Math.hypot(xv, yv);

  const vw = v + w;
  const cosN = Math.cos(N);
  const sinN = Math.sin(N);
  const cosVW = Math.cos(vw);
  const sinVW = Math.sin(vw);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);

  const xh = r * (cosN * cosVW - sinN * sinVW * cosI);
  const yh = r * (sinN * cosVW + cosN * sinVW * cosI);
  const zh = r * (sinVW * sinI);

  return { x: xh, y: yh, z: zh };
}

/**
 * Geocentric RA/Dec for a planet, degrees.
 *
 * @param {number} jd Julian Date
 * @param {"mercury"|"venus"|"mars"|"jupiter"|"saturn"} planet
 */
export function planetRaDec(jd, planet) {
  const elementsFn = ELEMENTS[planet];
  if (!elementsFn) throw new Error(`Unknown planet: ${planet}`);

  const earth = heliocentricEclipticXYZ(jd, ELEMENTS.earth);
  const p = heliocentricEclipticXYZ(jd, elementsFn);

  // Geocentric ecliptic rectangular: planet - earth
  const xg = p.x - earth.x;
  const yg = p.y - earth.y;
  const zg = p.z - earth.z;

  // Rotate to equatorial.
  const eps = obliquityRad(jd);
  const xq = xg;
  const yq = yg * Math.cos(eps) - zg * Math.sin(eps);
  const zq = yg * Math.sin(eps) + zg * Math.cos(eps);

  const ra = Math.atan2(yq, xq) * RAD2DEG;
  const dec = Math.atan2(zq, Math.hypot(xq, yq)) * RAD2DEG;

  return { raDeg: normalizeDegrees(ra), decDeg: dec };
}

export const PLANET_KEYS = /** @type {const} */ ([
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
]);

