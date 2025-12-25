/**
 * functions-shim.js
 * 
 * Minimal re-export of utility functions from functions.js
 * WITHOUT loading the full dependency chain (stellar, construction, scripting)
 * 
 * Used by skyview.html to avoid circular dependencies
 */

// Import only what we need - pure utility functions
// These don't depend on stellar, planet, moon, or shaders
export function DegToRad(d) {
    return d * Math.PI / 180;
}

export function RadToDeg(r) {
    return r * 180 / Math.PI;
}

export function vector(M, a, e, i, p, n, m0) {
    // Kepler's equation solver
    // M = mean anomaly, a = semi-major axis, e = eccentricity,
    // i = inclination, p = long. of ascending node, n = long. of perihelion
    
    // Simple iterative solver for eccentric anomaly
    let E = M;
    for (let j = 0; j < 10; j++) {
        E = M + e * Math.sin(E);
    }
    
    // True anomaly
    const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
    
    // Distance
    const r = a * (1 - e * e) / (1 + e * Math.cos(nu));
    
    // Position in orbital plane
    const x = r * Math.cos(nu);
    const y = r * Math.sin(nu);
    
    // Rotate to ecliptic
    const X = x * (Math.cos(n) * Math.cos(p) - Math.sin(n) * Math.sin(p) * Math.cos(i)) - y * (Math.sin(n) * Math.cos(p) + Math.cos(n) * Math.sin(p) * Math.cos(i));
    const Y = x * (Math.cos(n) * Math.sin(p) + Math.sin(n) * Math.cos(p) * Math.cos(i)) + y * (Math.cos(n) * Math.cos(p) * Math.cos(i) - Math.sin(n) * Math.sin(p));
    const Z = x * Math.sin(n) * Math.sin(i) + y * Math.cos(n) * Math.sin(i);
    
    return { x: X, y: Y, z: Z };
}

export function EclipticToEquatorial(v) {
    // Convert ecliptic coordinates to equatorial
    // Obliquity of ecliptic: ~23.44 degrees
    const eps = DegToRad(23.44);
    
    if (!v || typeof v.x === 'undefined') return v;
    
    const x = v.x;
    const y = v.y * Math.cos(eps) - v.z * Math.sin(eps);
    const z = v.y * Math.sin(eps) + v.z * Math.cos(eps);
    
    return { x, y, z };
}

export function Round(n) {
    return Math.round(n * 1000) / 1000;
}

export function arctan2(y, x) {
    return Math.atan2(y, x);
}

export function CurrentMa(a, n, time) {
    // Mean anomaly as function of time
    return n * time;
}

export function CartesianToPolar(cart) {
    // Convert Cartesian to polar/spherical coordinates
    const r = Math.sqrt(cart.x * cart.x + cart.y * cart.y + cart.z * cart.z);
    const lon = Math.atan2(cart.y, cart.x);
    const lat = Math.asin(cart.z / r);
    return { r, lon, lat };
}

export function ArraySub(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function comma(n) {
    return n.toLocaleString();
}

export function DegToHour(deg) {
    return deg / 15;
}

// Dummy exports for compatibility
export const stars = [];
export const planets = [];
export const moons = [];
export const continuum = [];

export function MakeStar() {
    return null;
}

export function MakeMoon() {
    return null;
}

export function MakeMinorMoon() {
    return null;
}

export function vector_opt_2() {
    return null;
}

export function CurrentMa_opt() {
    return null;
}

export function BinaryMa() {
    return null;
}

export function perturbations() {
    return null;
}

export function foci() {
    return null;
}

export function Semi() {
    return null;
}

export function CelestialToEcliptic() {
    return null;
}

export function getAllIndexes() {
    return null;
}

export function MakeOrbit_2() {
    return null;
}
