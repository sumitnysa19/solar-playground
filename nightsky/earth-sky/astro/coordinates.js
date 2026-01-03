/**
 * Coordinate transforms for the sky simulation.
 *
 * Conventions (matches the project prompt):
 * - Angles exposed in degrees; internal trig in radians.
 * - Azimuth: 0° = North, 90° = East, increases eastward (clockwise looking down).
 * - Altitude: 0° = horizon, +90° = zenith, negative below horizon.
 *
 * Pipeline:
 *   RA/Dec + Observer(lat) + Local Sidereal Time -> Hour Angle -> Alt/Az
 *   Alt/Az -> 3D vector (Three.js-friendly)
 *
 * Atmospheric refraction:
 * - We apply Bennett’s formula as an *altitude correction* (degrees) added to the
 *   geometric altitude before building the 3D vector.
 */

export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

function assertFiniteNumber(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be a finite number`);
}

function normalizeDegrees(angleDeg) {
  assertFiniteNumber(angleDeg, "angleDeg");
  const wrapped = angleDeg % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/**
 * Hour angle in degrees, normalized to [0, 360).
 *
 * @param {number} lstDeg Local Sidereal Time in degrees
 * @param {number} raDeg Right Ascension in degrees
 * @returns {number} Hour angle in degrees
 */
export function hourAngle(lstDeg, raDeg) {
  assertFiniteNumber(lstDeg, "lstDeg");
  assertFiniteNumber(raDeg, "raDeg");
  return normalizeDegrees(lstDeg - raDeg);
}

/**
 * Bennett's refraction formula (simple standard approximation).
 * Returns the refraction correction in degrees to add to the geometric altitude.
 *
 * Notes:
 * - Near the horizon, refraction is large; we clamp altitude to avoid singularity.
 * - Above ~85°, refraction is negligible for visualization.
 *
 * @param {number} altDeg geometric altitude, degrees
 * @returns {number} correction in degrees (typically 0..~0.6° near horizon)
 */
export function getRefraction(altDeg) {
  assertFiniteNumber(altDeg, "altDeg");
  if (altDeg > 85) return 0;
  const h = Math.max(altDeg, -0.575);
  const R = 1.0 / Math.tan((h + 7.31 / (h + 4.4)) * DEG2RAD);
  return R / 60.0; // arcminutes -> degrees
}

/**
 * Convert RA/Dec to Alt/Az for an observer.
 *
 * Uses a numerically stable azimuth computation via atan2 from sinAz/cosAz.
 *
 * @param {number} raDeg Right Ascension (deg)
 * @param {number} decDeg Declination (deg)
 * @param {number} latDeg Observer latitude (deg, north positive)
 * @param {number} lstDeg Local Sidereal Time (deg)
 * @returns {{altitudeDeg:number, azimuthDeg:number, refractionDeg:number}}
 */
export function raDecToAltAz(raDeg, decDeg, latDeg, lstDeg) {
  assertFiniteNumber(raDeg, "raDeg");
  assertFiniteNumber(decDeg, "decDeg");
  assertFiniteNumber(latDeg, "latDeg");
  assertFiniteNumber(lstDeg, "lstDeg");

  const H = hourAngle(lstDeg, raDeg) * DEG2RAD;
  const dec = decDeg * DEG2RAD;
  const lat = latDeg * DEG2RAD;

  const sinAlt =
    Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(H);
  const alt = Math.asin(Math.min(1, Math.max(-1, sinAlt)));

  const cosAlt = Math.cos(alt);
  // Guard against division by zero at the zenith/nadir.
  const sinAz =
    cosAlt === 0 ? 0 : (-Math.sin(H) * Math.cos(dec)) / cosAlt;
  const cosAz =
    cosAlt === 0
      ? 1
      : (Math.sin(dec) - Math.sin(alt) * Math.sin(lat)) / (cosAlt * Math.cos(lat));

  let az = Math.atan2(sinAz, cosAz); // [-π, π]
  if (az < 0) az += 2 * Math.PI; // [0, 2π)

  const altitudeDeg = alt * RAD2DEG;
  const refractionDeg = getRefraction(altitudeDeg);

  return {
    altitudeDeg,
    azimuthDeg: az * RAD2DEG,
    refractionDeg,
  };
}

/**
 * Convert Alt/Az to a 3D position vector.
 *
 * Vector convention:
 * - +Y is up (zenith).
 * - +Z is north.
 * - +X is west. (So when facing south, east appears on the left like most sky maps.)
 *
 * @param {number} altitudeDeg degrees
 * @param {number} azimuthDeg degrees, 0°=north, 90°=east
 * @param {number} radius distance from origin
 * @returns {{x:number,y:number,z:number}}
 */
export function altAzToVector3(altitudeDeg, azimuthDeg, radius = 1) {
  assertFiniteNumber(altitudeDeg, "altitudeDeg");
  assertFiniteNumber(azimuthDeg, "azimuthDeg");
  assertFiniteNumber(radius, "radius");

  const alt = altitudeDeg * DEG2RAD;
  const az = azimuthDeg * DEG2RAD;

  const cosAlt = Math.cos(alt);
  return {
    x: -radius * cosAlt * Math.sin(az),
    y: radius * Math.sin(alt),
    z: radius * cosAlt * Math.cos(az),
  };
}
