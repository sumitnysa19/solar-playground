/**
 * HelioStateProvider.js
 * 
 * Adapter that reuses existing heliocentric ephemeris functions
 * from scripting.js and functions.js without modifying planetesimal.html
 * 
 * MVP: Provides cached access to body positions for coordinate transforms
 */

// Lazy-load functions to avoid circular dependency
function getFunctions() {
    if (typeof window !== 'undefined' && window.vector) {
        return {
            vector: window.vector,
            EclipticToEquatorial: window.EclipticToEquatorial,
            DegToRad: window.DegToRad,
            RadToDeg: window.RadToDeg
        };
    }
    // Fallback: Return dummy functions if not available
    return {
        vector: () => ({ x: 0, y: 0, z: 0 }),
        EclipticToEquatorial: (v) => v,
        DegToRad: (d) => d * Math.PI / 180,
        RadToDeg: (r) => r * 180 / Math.PI
    };
}

// Body definitions matching existing solar system data
const BODY_DATA = {
    Sun: { name: 'Sun', id: 0, color: 0xffff00 },
    Moon: { name: 'Moon', id: 1, color: 0xcccccc },
    Mercury: { name: 'Mercury', id: 2, color: 0x8c7853 },
    Venus: { name: 'Venus', id: 3, color: 0xffc649 },
    Mars: { name: 'Mars', id: 4, color: 0xff6347 },
    Jupiter: { name: 'Jupiter', id: 5, color: 0xc88b3a },
    Saturn: { name: 'Saturn', id: 6, color: 0xfad5a5 },
    Earth: { name: 'Earth', id: 7, color: 0x4169e1 },
    Rahu: { name: 'Rahu', id: 8, color: 0x9966ff },
    Ketu: { name: 'Ketu', id: 9, color: 0xff99cc }
};

/**
 * HelioStateProvider
 * 
 * Reuses existing Kepler solver and orbital mechanics
 * from functions.js to get heliocentric body positions
 * 
 * Cache pattern: (bodyId, jd) -> { posEcliptic, velEcliptic }
 */
export class HelioStateProvider {
    static _instance = null;

    static getInstance() {
        if (!HelioStateProvider._instance) {
            HelioStateProvider._instance = new HelioStateProvider();
        }
        return HelioStateProvider._instance;
    }

    constructor() {
        this.cache = new Map();
        this.maxCacheSize = 500; // Limit cache memory usage
    }

    /**
     * Get heliocentric position and velocity for a body
     * Reuses existing vector() function from functions.js
     * 
     * @param {string} bodyId - 'Sun', 'Earth', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'
     * @param {number} jd - Julian Date (TT)
     * @returns {Object} { posEcliptic: {x,y,z}, velEcliptic: {x,y,z} }
     */
    getBodyState(bodyId, jd) {
        // Use higher precision so short time steps still move (1e-8 days ≈ 0.86 ms)
        const cacheKey = `${bodyId}_${Math.round(jd * 1e8)}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Get heliocentric position from orbital elements or node calc
        let posEcliptic = null;
        
        try {
            // Special handling for Rahu/Ketu (lunar nodes)
            if (bodyId === 'Rahu' || bodyId === 'Ketu') {
                posEcliptic = this._computeNodePosition(bodyId, jd);
            } else {
                posEcliptic = this._computeBodyPosition(bodyId, jd);
            }
        } catch (e) {
            console.error(`Failed to compute position for ${bodyId} at JD ${jd}:`, e);
            return { 
                posEcliptic: { x: 0, y: 0, z: 0 }, 
                velEcliptic: { x: 0, y: 0, z: 0 } 
            };
        }

        const state = {
            posEcliptic: posEcliptic,
            velEcliptic: { x: 0, y: 0, z: 0 } // Velocity optional for MVP
        };

        // Maintain cache size limit
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(cacheKey, state);
        return state;
    }

    /**
     * Compute body position using Kepler solver
     * Coordinates in AU (astronomical units)
     * 
     * @private
     * @param {string} bodyId 
     * @param {number} jd - Julian Date
     * @returns {Object} {x, y, z} in AU, ecliptic coordinates
     */
    _computeBodyPosition(bodyId, jd) {
        // MVP: Use simplified two-body problem for major bodies
        // For production, integrate with full scripting.js ephemeris engine
        
        // Placeholder orbital elements for major bodies (simplified)
        const orbitalElements = this._getOrbitalElements(bodyId, jd);
        
        if (!orbitalElements) {
            return { x: 0, y: 0, z: 0 };
        }

        // Use existing vector() function from functions.js
        // vector(M, a, e, i, p, n, m0) where:
        // M = mean anomaly, a = semi-major axis, e = eccentricity,
        // i = inclination, p = long. of ascending node, n = long. of perihelion
        const { vector } = getFunctions();
        const pos = vector(
            orbitalElements.M,
            orbitalElements.a,
            orbitalElements.e,
            orbitalElements.i,
            orbitalElements.p,
            orbitalElements.n,
            orbitalElements.m0
        );

        // If pos is a THREE.Vector3, convert to object
        if (pos && typeof pos.x !== 'undefined') {
            return { x: pos.x, y: pos.y, z: pos.z };
        }

        return { x: 0, y: 0, z: 0 };
    }

    /**
     * Get orbital elements for body at given JD
     * Uses simplified analytic elements (not full JPL ephemeris)
     * For MVP accuracy only
     * 
     * @private
     */
    _getOrbitalElements(bodyId, jd) {
        const { DegToRad } = getFunctions();
        
        // Standard orbital elements for epoch J2000.0 (JD 2451545.0)
        // From NASA/JPL Horizons
        const j2000 = 2451545.0;
        const T = (jd - j2000) / 36525.0; // Julian centuries from J2000.0

        const elements = {
            'Mercury': { a: 0.38710, e: 0.20563, i: 7.0047, p: 48.3369, n: 77.4567, M: 252.250 + 149472.674 * T },
            'Venus': { a: 0.72333, e: 0.00677, i: 3.3946, p: 76.6799, n: 131.5720, M: 181.979 + 58517.811 * T },
            'Earth': { a: 1.00000, e: 0.01671, i: 0.0000, p: -11.2604, n: 102.9573, M: 100.465 + 35999.373 * T },
            'Mars': { a: 1.52368, e: 0.09341, i: 1.8506, p: 49.5574, n: 336.0593, M: 355.433 + 19141.696 * T },
            'Jupiter': { a: 5.20265, e: 0.04849, i: 1.3053, p: 100.4812, n: 14.7519, M: 34.351 + 3034.905 * T },
            'Saturn': { a: 9.54265, e: 0.05550, i: 2.4873, p: 113.6650, n: 92.5975, M: 50.077 + 1222.494 * T },
            'Sun': { a: 0, e: 0, i: 0, p: 0, n: 0, M: 0 },
            'Moon': { a: 0.00257, e: 0.0554, i: 5.1454, p: 125.0445, n: 318.0744, M: 115.3654 }
        };

        const elem = elements[bodyId];
        if (!elem) return null;

        // Convert degrees to radians for trigonometric functions
        return {
            a: elem.a,
            e: elem.e,
            i: DegToRad(elem.i),
            p: DegToRad(elem.p),
            n: DegToRad(elem.n),
            M: DegToRad(elem.M % 360),
            m0: 0
        };
    }

    /**
     * Clear cache to free memory
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize
        };
    }

    /**
     * Compute simplified lunar node position (Rahu/Ketu) in heliocentric ecliptic coords.
     * Uses mean longitude of ascending node (Meeus): Ω = 125.04452° - 1934.136261° * T
     * Ketu is 180° opposite Rahu. Places node 1 AU from Sun along ecliptic for direction only.
     */
    _computeNodePosition(bodyId, jd) {
        const j2000 = 2451545.0;
        const T = (jd - j2000) / 36525.0; // Julian centuries from J2000.0

        // Earth heliocentric position to anchor the node in heliocentric coords
        const earthState = this._computeBodyPosition('Earth', jd) || { x: 0, y: 0, z: 0 };

        // Mean longitude of ascending node (Rahu)
        let omegaDeg = 125.04452 - 1934.136261 * T;
        if (bodyId === 'Ketu') {
            omegaDeg += 180.0;
        }
        // Normalize
        omegaDeg = ((omegaDeg % 360) + 360) % 360;
        const omegaRad = omegaDeg * Math.PI / 180;

        const R = 1.0; // 1 AU for direction vector
        const x = earthState.x + R * Math.cos(omegaRad);
        const y = earthState.y + R * Math.sin(omegaRad);
        const z = earthState.z; // on ecliptic plane

        return { x, y, z };
    }
}

// Export singleton instance for direct access
export const helioStateProvider = HelioStateProvider.getInstance();
