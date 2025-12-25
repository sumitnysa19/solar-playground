/**
 * RiseSetCalculator.js
 * 
 * Coarse rise/set time calculation for celestial bodies
 * - ±15 minute sampling through 24-hour period
 * - Altitude sign change detection (crosses horizon)
 * - Transit (maximum altitude) detection
 * - Circumpolar/never-rises detection
 * - MVP: Simple geometric (no refraction, atmospheric effects)
 */

import { HelioStateProvider } from './HelioStateProvider.js';
import { CoordinateTransforms } from './CoordinateTransforms.js';

export class RiseSetCalculator {
    constructor() {
        this.provider = HelioStateProvider.getInstance();
        this.sampleIntervalMinutes = 15;
    }

    /**
     * Calculate rise, transit, and set times for a body on a given date
     * 
     * @param {string} bodyName - Body name
     * @param {number} jdDate - Julian Date at midnight UTC for the date
     * @param {number} latitude - Observer latitude (degrees)
     * @param {number} longitude - Observer longitude (degrees)
     * @returns {object} {rise, transit, set, type} where type is 'normal'|'circumpolar'|'never-rises'
     */
    calculateRiseSetTransit(bodyName, jdDate, latitude, longitude) {
        const sampleIntervalDays = this.sampleIntervalMinutes / (24 * 60);
        
        let riseTime = null;
        let setTime = null;
        let transitTime = null;
        let maxAltitude = -90;
        let wasAboveHorizon = false;
        let isCircumpolar = false;
        let neverRises = false;

        // Sample through entire 24-hour period
        for (let samples = 0; samples < 24 * 60 / this.sampleIntervalMinutes; samples++) {
            const jd = jdDate + (samples * sampleIntervalDays);
            
            const alt = this._getBodyAltitude(bodyName, jd, latitude, longitude);
            
            // Track maximum altitude for transit
            if (alt > maxAltitude) {
                maxAltitude = alt;
                transitTime = jd;
            }

            // Detect rise (altitude crosses zero from below)
            if (alt >= 0 && !wasAboveHorizon && riseTime === null) {
                riseTime = jd;
            }

            // Detect set (altitude crosses zero from above)
            if (alt < 0 && wasAboveHorizon && setTime === null) {
                setTime = jd;
            }

            wasAboveHorizon = (alt >= 0);
        }

        // Determine type
        if (maxAltitude < 0) {
            neverRises = true;
        } else if (riseTime === null && setTime === null && maxAltitude >= 0) {
            isCircumpolar = true;
        }

        return {
            rise: riseTime ? this._jdToTimeString(riseTime) : null,
            transit: transitTime ? this._jdToTimeString(transitTime) : null,
            set: setTime ? this._jdToTimeString(setTime) : null,
            type: isCircumpolar ? 'circumpolar' : (neverRises ? 'never-rises' : 'normal'),
            maxAltitude: maxAltitude,
            riseJd: riseTime,
            transitJd: transitTime,
            setJd: setTime
        };
    }

    /**
     * Get altitude of body at specific Julian Date
     */
    _getBodyAltitude(bodyName, jd, latitude, longitude) {
        try {
            const bodyState = this.provider.getBodyState(bodyName, jd);
            if (!bodyState) return -90;

            const earthState = this.provider.getBodyState('Earth', jd);
            if (!earthState) return -90;

            // Geocentric position
            const geocentricEcl = {
                x: bodyState.posEcliptic.x - earthState.posEcliptic.x,
                y: bodyState.posEcliptic.y - earthState.posEcliptic.y,
                z: bodyState.posEcliptic.z - earthState.posEcliptic.z
            };

            // Ecliptic to Equatorial
            const geocentricEqu = CoordinateTransforms.eclipticToEquatorial(geocentricEcl);

            // Cartesian to RA/Dec
            const {ra, dec} = CoordinateTransforms.cartesianToRaDec(geocentricEqu);

            // RA/Dec to Alt/Az
            const lst = CoordinateTransforms.localSiderealTime(jd, longitude);
            const {alt} = CoordinateTransforms.raDecToAltAz(ra, dec, lst, latitude);

            return alt;
        } catch (e) {
            console.error(`Error calculating altitude for ${bodyName}:`, e);
            return -90;
        }
    }

    /**
     * Convert Julian Date to time string (HH:MM:SS UTC)
     */
    _jdToTimeString(jd) {
        // Get fractional day
        const jdFrac = jd - Math.floor(jd) + 0.5;
        const dayFrac = (jdFrac > 1) ? (jdFrac - 1) : jdFrac;

        const totalSeconds = dayFrac * 24 * 3600;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    /**
     * Format result for display
     */
    formatResult(result) {
        if (result.type === 'circumpolar') {
            return `Circumpolar (always above horizon)`;
        } else if (result.type === 'never-rises') {
            return `Never rises (always below horizon)`;
        } else {
            return `Rise: ${result.rise} | Transit: ${result.transit} | Set: ${result.set} | Max Alt: ${result.maxAltitude.toFixed(1)}°`;
        }
    }

    /**
     * Batch calculate rise/set for all 7 bodies
     */
    calculateAllBodies(jdDate, latitude, longitude) {
        const bodies = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'];
        const results = {};

        bodies.forEach(body => {
            results[body] = this.calculateRiseSetTransit(body, jdDate, latitude, longitude);
        });

        return results;
    }
}

export default RiseSetCalculator;
