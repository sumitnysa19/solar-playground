/**
 * CoordinateTransforms.js
 *
 * Core transformations for Earth sky simulation:
 * 1) Heliocentric ecliptic -> Geocentric ecliptic (subtract Earth position)
 * 2) Ecliptic -> Equatorial (rotate by obliquity)
 * 3) Equatorial (RA/Dec) -> Horizontal (Alt/Az) observer-dependent
 *
 * Conventions:
 * - Distances: arbitrary (AU assumed for heliocentric inputs)
 * - Angles in/out: ra/dec/lst in radians, latitude in degrees, alt/az returned in degrees.
 * - Geometric only (no refraction/parallax/nutation) for MVP.
 */

export class CoordinateTransforms {
    static OBLIQUITY_J2000 = 23.43929111;          // degrees
    static DEG_TO_RAD = Math.PI / 180;
    static RAD_TO_DEG = 180 / Math.PI;

    // Heliocentric -> Geocentric (subtract Earth)
    static heliocentricToGeocentric(bodyPos, earthPos) {
        return {
            x: bodyPos.x - earthPos.x,
            y: bodyPos.y - earthPos.y,
            z: bodyPos.z - earthPos.z
        };
    }

    // Ecliptic -> Equatorial (rotate by obliquity about X axis)
    static eclipticToEquatorial(eclipticVec) {
        const eps = this.OBLIQUITY_J2000 * this.DEG_TO_RAD;
        const cosE = Math.cos(eps);
        const sinE = Math.sin(eps);

        return {
            x: eclipticVec.x,
            y: eclipticVec.y * cosE - eclipticVec.z * sinE,
            z: eclipticVec.y * sinE + eclipticVec.z * cosE
        };
    }

    // Cartesian equatorial -> RA/Dec (radians)
    static cartesianToRaDec(vec) {
        const distance = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
        if (distance === 0) {
            return { ra: 0, dec: 0, distance: 0 };
        }

        let ra = Math.atan2(vec.y, vec.x);
        if (ra < 0) ra += 2 * Math.PI;
        const dec = Math.asin(vec.z / distance);

        return { ra, dec, distance };
    }

    // Greenwich Sidereal Time (radians); uses UTC ~ UT1 (good enough for MVP)
    static greenwichSiderealTime(jd) {
        const JD_2000 = 2451545.0;
        const T = (jd - JD_2000) / 36525.0;

        let gmst = 67310.54841
                 + (876600 * 3600 + 8640184.812866) * T
                 + 0.093104 * T * T
                 - 6.2e-6 * T * T * T;

        gmst = (gmst / 240.0) % 360.0; // degrees
        if (gmst < 0) gmst += 360;
        return gmst * this.DEG_TO_RAD;
    }

    // Local Sidereal Time (radians); longitude in degrees (East positive)
    static localSiderealTime(jd, longitudeDeg) {
        const gst = this.greenwichSiderealTime(jd);
        let lst = gst + longitudeDeg * this.DEG_TO_RAD;
        lst = lst % (2 * Math.PI);
        if (lst < 0) lst += 2 * Math.PI;
        return lst;
    }

    /**
     * RA/Dec (rad) + LST (rad) + latitude (deg) -> Alt/Az (deg)
     * Azimuth: 0=N, 90=E, 180=S, 270=W
     */
    static raDecToAltAz(ra, dec, lst, latitudeDeg) {
        const lat = latitudeDeg * this.DEG_TO_RAD;

        let ha = lst - ra;
        ha = ha % (2 * Math.PI);
        if (ha < 0) ha += 2 * Math.PI;
        if (ha > Math.PI) ha -= Math.PI * 2; // keep -pi..pi

        const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha);
        const altRad = Math.asin(sinAlt);

        const sinAz = -Math.sin(ha) * Math.cos(dec) / Math.cos(altRad);
        const cosAz = (Math.sin(dec) - Math.sin(altRad) * Math.sin(lat)) / (Math.cos(altRad) * Math.cos(lat));
        let azRad = Math.atan2(sinAz, cosAz);
        if (azRad < 0) azRad += 2 * Math.PI;

        return {
            alt: altRad * this.RAD_TO_DEG,
            az: azRad * this.RAD_TO_DEG
        };
    }

    // Full pipeline helper
    static getBodyAltAz(bodyHelioPos, earthHelioPos, jd, latitudeDeg, longitudeDeg) {
        const geocentricEcl = this.heliocentricToGeocentric(bodyHelioPos, earthHelioPos);
        const geocentricEqu = this.eclipticToEquatorial(geocentricEcl);
        const raDec = this.cartesianToRaDec(geocentricEqu);
        const lst = this.localSiderealTime(jd, longitudeDeg);
        const altAz = this.raDecToAltAz(raDec.ra, raDec.dec, lst, latitudeDeg);

        return { alt: altAz.alt, az: altAz.az, ra: raDec.ra, dec: raDec.dec, distance: raDec.distance };
    }

    static radToDeg(rad) {
        return rad * this.RAD_TO_DEG;
    }

    static degToRad(deg) {
        return deg * this.DEG_TO_RAD;
    }
}
