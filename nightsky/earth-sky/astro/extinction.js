/**
 * Atmospheric extinction helpers (visual approximation).
 *
 * Uses a common airmass approximation (Kasten & Young 1989 style).
 * Output is intentionally clamped for stable visuals near the horizon.
 */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Approximate optical airmass from apparent altitude.
 *
 * @param {number} altitudeDeg Apparent altitude in degrees.
 * @returns {number} Airmass (>= 1).
 */
export function airMassFromAltitude(altitudeDeg) {
  if (!Number.isFinite(altitudeDeg)) return Number.POSITIVE_INFINITY;
  // Below the horizon, treat as "infinite" (not visible).
  if (altitudeDeg <= 0) return Number.POSITIVE_INFINITY;

  // Kasten & Young (1989) approximation, stable down to ~0 degrees.
  const zenithDeg = 90 - altitudeDeg;
  const denom =
    Math.cos((zenithDeg * Math.PI) / 180) +
    0.50572 * Math.pow(96.07995 - zenithDeg, -1.6364);
  const X = 1 / denom;
  return clamp(X, 1, 40);
}

/**
 * Convert altitude to a magnitude delta from atmospheric extinction.
 *
 * @param {number} altitudeDeg Apparent altitude in degrees.
 * @param {{k?: number, maxDeltaMag?: number}} [options]
 * @returns {number} Additional magnitudes to add (>= 0).
 */
export function extinctionDeltaMag(
  altitudeDeg,
  { k = 0.18, maxDeltaMag = 3.5 } = {}
) {
  const X = airMassFromAltitude(altitudeDeg);
  if (!Number.isFinite(X)) return maxDeltaMag;
  // Extinction vs. zenith: deltaMag = k * (X - 1)
  return clamp(k * (X - 1), 0, maxDeltaMag);
}

/**
 * Adjust a magnitude for atmospheric extinction at a given altitude.
 *
 * @param {number} mag Base magnitude.
 * @param {number} altitudeDeg Apparent altitude in degrees.
 * @param {{k?: number, maxDeltaMag?: number}} [options]
 * @returns {number} Adjusted magnitude.
 */
export function adjustMagnitudeForAltitude(mag, altitudeDeg, options) {
  if (!Number.isFinite(mag)) return mag;
  return mag + extinctionDeltaMag(altitudeDeg, options);
}

