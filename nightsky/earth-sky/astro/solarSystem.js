/**
 * Simplified Sun + Moon geocentric positions.
 *
 * Goal: readable, public-domain style approximations suitable for visualization.
 * Accuracy targets:
 * - Sun: good for apparent daily motion (≈0.1°–0.5° typical).
 * - Moon: simplified ellipse model (≈1° typical).
 *
 * Output is geocentric equatorial coordinates: Right Ascension and Declination.
 * These can be converted to Alt/Az using observer latitude and Local Sidereal Time.
 */

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const JD_J2000 = 2451545.0; // 2000-01-01T12:00:00Z

function normalizeDegrees(deg) {
  const w = deg % 360;
  return w < 0 ? w + 360 : w;
}

function atan2Deg(y, x) {
  return Math.atan2(y, x) * RAD2DEG;
}

function asinDeg(x) {
  return Math.asin(Math.max(-1, Math.min(1, x))) * RAD2DEG;
}

/**
 * Sun geocentric RA/Dec (simplified).
 *
 * Math sketch:
 * - Compute mean longitude L and mean anomaly g (degrees).
 * - Approximate ecliptic longitude λ with a 2-term equation of center.
 * - Convert ecliptic (λ, β=0) to equatorial using obliquity ε.
 */
export function sunRaDec(jd) {
  const n = jd - JD_J2000; // days since J2000

  const L = normalizeDegrees(280.460 + 0.9856474 * n);
  const g = normalizeDegrees(357.528 + 0.9856003 * n);

  const lambda =
    L +
    1.915 * Math.sin(g * DEG2RAD) +
    0.020 * Math.sin(2 * g * DEG2RAD);

  const epsilon = 23.439 - 0.0000004 * n;

  const lambdaR = lambda * DEG2RAD;
  const epsR = epsilon * DEG2RAD;

  const ra = atan2Deg(
    Math.cos(epsR) * Math.sin(lambdaR),
    Math.cos(lambdaR)
  );
  const dec = asinDeg(Math.sin(epsR) * Math.sin(lambdaR));

  return { raDeg: normalizeDegrees(ra), decDeg: dec };
}

/**
 * Moon geocentric RA/Dec (simplified elliptical orbit; Paul Schlyter-style).
 *
 * This model ignores many perturbations; it is "good enough" for a sky demo.
 *
 * Steps:
 * - Compute orbital elements evolving linearly with time.
 * - Solve eccentric anomaly E from mean anomaly M (1-iteration approximation).
 * - Convert to ecliptic rectangular coordinates.
 * - Rotate by obliquity to equatorial, then compute RA/Dec.
 */
export function moonRaDec(jd) {
  const d = jd - 2451543.5; // days since 2000-01-01 00:00 UT

  const N = normalizeDegrees(125.1228 - 0.0529538083 * d); // ascending node
  const i = 5.1454; // inclination
  const w = normalizeDegrees(318.0634 + 0.1643573223 * d); // arg of perigee
  const a = 60.2666; // Earth radii (only direction matters here)
  const e = 0.0549; // eccentricity
  const M = normalizeDegrees(115.3654 + 13.0649929509 * d); // mean anomaly

  // Eccentric anomaly (degrees), 1-step approximation.
  const Mr = M * DEG2RAD;
  const E = M + (e * RAD2DEG) * Math.sin(Mr) * (1 + e * Math.cos(Mr));
  const Er = E * DEG2RAD;

  const x = a * (Math.cos(Er) - e);
  const y = a * (Math.sqrt(1 - e * e) * Math.sin(Er));
  const r = Math.hypot(x, y);
  const v = Math.atan2(y, x); // true anomaly (radians)

  const Nr = N * DEG2RAD;
  const ir = i * DEG2RAD;
  const wr = w * DEG2RAD;

  // Ecliptic rectangular coordinates.
  const vw = v + wr;
  const xe = r * (Math.cos(Nr) * Math.cos(vw) - Math.sin(Nr) * Math.sin(vw) * Math.cos(ir));
  const ye = r * (Math.sin(Nr) * Math.cos(vw) + Math.cos(Nr) * Math.sin(vw) * Math.cos(ir));
  const ze = r * (Math.sin(vw) * Math.sin(ir));

  // Mean obliquity (same as the Sun routine; sufficient here).
  const n = jd - JD_J2000;
  const epsilon = (23.439 - 0.0000004 * n) * DEG2RAD;

  // Ecliptic -> Equatorial rotation about X axis.
  const xq = xe;
  const yq = ye * Math.cos(epsilon) - ze * Math.sin(epsilon);
  const zq = ye * Math.sin(epsilon) + ze * Math.cos(epsilon);

  const ra = atan2Deg(yq, xq);
  const dec = atan2Deg(zq, Math.hypot(xq, yq));

  return { raDeg: normalizeDegrees(ra), decDeg: dec };
}

