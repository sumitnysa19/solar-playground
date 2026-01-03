
/**
 * Sd79Adapter.js
 * 
 * Adapts the SD79 Solar System simulation data (received via postMessage)
 * into a format consumable by the Earth-Sky simulation.
 * 
 * It acts as a "HelioStateProvider" for the SkyScene.
 */

export class Sd79Adapter {
    constructor() {
        this.latestState = null;
        this.lastUpdate = 0;

        // Listen for messages from the parent/sibling frame
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SD79_DATA') {
                this.handleData(event.data.payload);
            }
        });
    }

    handleData(payload) {
        this.latestState = payload;
        this.lastUpdate = performance.now();
        // payload expected structure:
        // { 
        //   jd: number, 
        //   Sun: {x,y,z}, 
        //   Earth: {x,y,z}, 
        //   Moon: {x,y,z}, 
        //   Mercury: {x,y,z}, ... 
        // }
    }

    /**
     * Returns the heliocentric ecliptic coordinates {x, y, z} for a given body.
     * @param {string} bodyId - 'Sun', 'Earth', 'Moon', 'Mercury', etc.
     * @param {number} jd - Julian Date (ignored in this simple streaming version, returns latest)
     * @returns {Object|null} {x, y, z} or null if not available
     */
    getBodyState(bodyId, jd) {
        if (!this.latestState) return null;

        // If asking for Julian Date
        if (bodyId === 'JD') return { jd: this.latestState.jd };

        // Direct mapping
        const body = this.latestState[bodyId];
        if (body) {
            // Check if coordinate transformation is needed.
            // SD79 `scripting.js` seems to use a scale where 1 unit = ?
            // In `scripting.js`: bodies.sol.Position...
            // In `earth-sky`, we expect AU or standard units?
            // Existing `earth-sky` uses TimeAndDate which returns heliocentric X,Y,Z in km? or AU?
            // Let's assume AU for now or check. 
            // `solarSystem.js` in Earth-Sky:
            // r = Math.sqrt(x*x + y*y + z*z)
            // It uses `149597870.7` (km in AU) for conversion sometimes.
            // 
            // SD79: `bodies.earth.Data[9]` is semi-major axis in what?
            // `scripting.js` line 1291: `... * 149598023` (km per AU)
            // So internal units might be AU? 
            // Or maybe scale is arbitrary. 
            // Let's return raw values first and debug visually.

            return { x: body.x, y: body.y, z: body.z };
        }
        return null;
    }
}
