/**
 * Time utilities for the sky simulation.
 *
 * All angles are in degrees unless stated otherwise.
 *
 * References (public-domain style formulas widely published):
 * - Julian Date from Unix epoch: JD = (ms / 86400000) + 2440587.5
 * - GMST approximation (IAU 1982-era polynomial form, common in astronomy texts):
 *   θ = 280.46061837 + 360.98564736629*(JD - 2451545.0)
 *       + 0.000387933*T^2 - (T^3)/38710000, where T is Julian centuries from J2000.
 *
 * This is sufficient for a visual sky simulation and matches the expected behavior:
 * - Earth rotates ~15° per (solar) hour relative to the stars (actually ~15.041°).
 */

const MS_PER_DAY = 86400000;
const JD_UNIX_EPOCH = 2440587.5; // 1970-01-01T00:00:00Z
const JD_J2000 = 2451545.0; // 2000-01-01T12:00:00Z

function assertFiniteNumber(value, name) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
}

function normalizeDegrees(angleDeg) {
  assertFiniteNumber(angleDeg, "angleDeg");
  const wrapped = angleDeg % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/**
 * Convert a JavaScript Date to Julian Date (JD, UTC-based).
 *
 * @param {Date} date
 * @returns {number} Julian Date (days)
 */
export function toJulianDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError("date must be a valid Date");
  }
  return date.getTime() / MS_PER_DAY + JD_UNIX_EPOCH;
}

/**
 * Greenwich Mean Sidereal Time (GMST) in degrees, normalized to [0, 360).
 *
 * @param {number} jd Julian Date
 * @returns {number} GMST degrees
 */
export function greenwichSiderealTime(jd) {
  assertFiniteNumber(jd, "jd");

  const T = (jd - JD_J2000) / 36525.0;
  const thetaDeg =
    280.46061837 +
    360.98564736629 * (jd - JD_J2000) +
    0.000387933 * T * T -
    (T * T * T) / 38710000.0;

  return normalizeDegrees(thetaDeg);
}

/**
 * Local Sidereal Time (LST) in degrees, normalized to [0, 360).
 *
 * Longitude convention: east-positive degrees (e.g., +10° for 10°E, -122° for 122°W).
 *
 * @param {number} jd Julian Date
 * @param {number} longitudeDeg Observer longitude, degrees east-positive
 * @returns {number} LST degrees
 */
export function localSiderealTime(jd, longitudeDeg) {
  assertFiniteNumber(longitudeDeg, "longitudeDeg");
  return normalizeDegrees(greenwichSiderealTime(jd) + longitudeDeg);
}

/**
 * Convenience: compute sidereal metrics for debugging/validation.
 * Not used by the core simulation, but useful for Step 1 UI.
 */
export function debugSiderealSnapshot(date, longitudeDeg) {
  const jd = toJulianDate(date);
  const gmstDeg = greenwichSiderealTime(jd);
  const lstDeg = localSiderealTime(jd, longitudeDeg);

  const oneHourLater = new Date(date.getTime() + MS_PER_DAY / 24);
  const jd2 = toJulianDate(oneHourLater);
  const gmst2 = greenwichSiderealTime(jd2);

  // Delta in degrees in [-180, 180] to make it readable.
  let delta = gmst2 - gmstDeg;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;

  return {
    jd,
    gmstDeg,
    lstDeg,
    gmstAdvanceDegPerHour: delta,
  };
}

