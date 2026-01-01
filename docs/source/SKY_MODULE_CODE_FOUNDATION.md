# Sky View Implementation - Code Foundation

## Status Update (2026-01-01)

Legacy design notes. The active, user-facing sky viewer is in `nightsky/earth-sky/` and documented in `docs/`.

This document contains production-ready code snippets extracted from the refined proposal, organized by module.

---

## Module 1: Coordinate Transforms

### File: `sky-module/coordinate-transforms.js`

```javascript
/**
 * Core coordinate transformation library
 * Converts from heliocentric ecliptic -> observer-local horizontal (Alt/Az)
 */

class SkyCoordinateTransformer {
  // Earth's mean obliquity of ecliptic (J2000.0 epoch)
  static OBLIQUITY_J2000 = 23.43929111 * Math.PI / 180;
  
  // Standard gravitational constant
  static G = 6.67408e-11; // m^3 kg^-1 s^-2

  /**
   * Complete transformation: heliocentric -> observer local altitude/azimuth
   * @param {Vector3} heliocentricPos - Position in heliocentric ecliptic frame (meters)
   * @param {Vector3} earthHeliocentricPos - Earth position in heliocentric frame
   * @param {Observer} observer - Observer location
   * @param {number} jd - Julian Date
   * @returns {Object} {alt, az, ra, dec, distance, lst}
   */
  static heliocentricToAltAz(heliocentricPos, earthHeliocentricPos, observer, jd) {
    // Step 1: Geocentric position
    const geocentric = heliocentricPos.clone()
      .sub(earthHeliocentricPos);
    
    // Step 2: Ecliptic -> Equatorial
    const equatorial = this.eclipticToEquatorial(geocentric);
    
    // Step 3: Cartesian -> RA/Dec
    const { ra, dec, distance } = this.cartesianToRaDec(equatorial);
    
    // Step 4: Greenwich Sidereal Time
    const gst = SiderealTime.greenwichSiderealTime(jd);
    
    // Step 5: Local Sidereal Time
    const lst = SiderealTime.localSiderealTime(jd, observer.longitude);
    
    // Step 6: RA/Dec -> Alt/Az
    const { alt, az, alt_deg, az_deg } = this.raDecToAltAz(
      ra, dec, lst, observer.latitude
    );
    
    return { alt, az, alt_deg, az_deg, ra, dec, distance, lst, gst };
  }

  /**
   * Rotate ecliptic coordinates to J2000.0 equatorial frame
   * @param {Vector3} eclipticVec - Position in ecliptic frame
   * @returns {Vector3} Position in equatorial frame
   */
  static eclipticToEquatorial(eclipticVec) {
    const eps = this.OBLIQUITY_J2000;
    const cos_eps = Math.cos(eps);
    const sin_eps = Math.sin(eps);
    
    return {
      x: eclipticVec.x,
      y: eclipticVec.y * cos_eps - eclipticVec.z * sin_eps,
      z: eclipticVec.y * sin_eps + eclipticVec.z * cos_eps
    };
  }

  /**
   * Inverse: Equatorial -> Ecliptic
   */
  static equatorialToEcliptic(equatorialVec) {
    const eps = this.OBLIQUITY_J2000;
    const cos_eps = Math.cos(eps);
    const sin_eps = Math.sin(eps);
    
    return {
      x: equatorialVec.x,
      y: equatorialVec.y * cos_eps + equatorialVec.z * sin_eps,
      z: -equatorialVec.y * sin_eps + equatorialVec.z * cos_eps
    };
  }

  /**
   * Convert Cartesian equatorial coordinates to spherical (RA/Dec)
   * @param {Object} vec - {x, y, z} in equatorial frame
   * @returns {Object} {ra, dec, distance} where RA/Dec are in radians
   */
  static cartesianToRaDec(vec) {
    const distance = Math.sqrt(vec.x*vec.x + vec.y*vec.y + vec.z*vec.z);
    
    // Right Ascension: angle from X-axis in XY plane
    const ra = Math.atan2(vec.y, vec.x);
    
    // Declination: angle from XY plane (latitude-like)
    const dec = Math.asin(vec.z / distance);
    
    return {
      ra: ra >= 0 ? ra : ra + 2 * Math.PI,  // [0, 2]
      dec: dec,                               // [-/2, /2]
      distance: distance
    };
  }

  /**
   * Inverse: RA/Dec -> Cartesian equatorial
   */
  static raDecToCartesian(ra, dec, distance = 1) {
    const cos_dec = Math.cos(dec);
    return {
      x: distance * cos_dec * Math.cos(ra),
      y: distance * cos_dec * Math.sin(ra),
      z: distance * Math.sin(dec)
    };
  }

  /**
   * Convert RA/Dec (celestial) to Alt/Az (observer-local horizontal)
   * This is the CRITICAL transformation for sky rendering
   * 
   * @param {number} ra - Right Ascension in radians [0, 2]
   * @param {number} dec - Declination in radians [-/2, /2]
   * @param {number} lst_deg - Local Sidereal Time in degrees [0, 360]
   * @param {number} lat_deg - Observer latitude in degrees [-90, 90]
   * @returns {Object} {alt, az, alt_deg, az_deg}
   */
  static raDecToAltAz(ra, dec, lst_deg, lat_deg) {
    // Convert to radians
    const lst = lst_deg * Math.PI / 180;
    const lat = lat_deg * Math.PI / 180;
    
    // Hour Angle = LST - RA
    const ha = lst - ra;
    
    // Precompute trig values for efficiency
    const sin_lat = Math.sin(lat);
    const cos_lat = Math.cos(lat);
    const sin_dec = Math.sin(dec);
    const cos_dec = Math.cos(dec);
    const sin_ha = Math.sin(ha);
    const cos_ha = Math.cos(ha);
    
    // ALTITUDE: angle above horizon
    // Range: [-/2, /2] where /2 = zenith, 0 = horizon, -/2 = nadir
    const alt = Math.asin(
      sin_lat * sin_dec + 
      cos_lat * cos_dec * cos_ha
    );
    
    // AZIMUTH: compass direction from observer
    // Range: [0, 2] where 0 = North, /2 = East,  = South, 3/2 = West
    const az = Math.atan2(
      -sin_ha,
      Math.tan(dec) * cos_lat - sin_lat * cos_ha
    );
    
    return {
      alt: alt,
      az: az >= 0 ? az : az + 2 * Math.PI,  // Normalize to [0, 2]
      alt_deg: alt * 180 / Math.PI,
      az_deg: az * 180 / Math.PI
    };
  }

  /**
   * Apply atmospheric refraction (optional, for high precision)
   * Objects near horizon appear higher than geometric position
   */
  static applyAtmosphericRefraction(alt_deg) {
    // Standard atmospheric refraction formula
    // Negligible above 15deg, significant below 5deg
    if (alt_deg < -1) return alt_deg; // Below horizon, no correction
    
    const R = 34.46 / (60 * Math.tan(alt_deg * Math.PI / 180 + 10.3 / (alt_deg + 5.11)));
    return alt_deg + R / 60; // R is in arcminutes, convert to degrees
  }
}

export { SkyCoordinateTransformer };
```

---

## Module 2: Sidereal Time

### File: `sky-module/sidereal-time.js`

```javascript
/**
 * Greenwich Sidereal Time and Local Sidereal Time calculations
 * Based on USNO Circular 163 and SOFA library algorithms
 */

class SiderealTime {
  /**
   * Compute Greenwich Sidereal Time
   * GST represents the right ascension of the vernal equinox at Greenwich (0deg longitude)
   * 
   * @param {number} jd - Julian Date (UT1 seconds)
   * @returns {number} GST in degrees (0-360)
   */
  static greenwichSiderealTime(jd) {
    // Julian Date of J2000.0 epoch (noon UT, Jan 1, 2000)
    const JD_2000 = 2451545.0;
    
    // Compute T (Julian centuries since J2000.0)
    const T = (jd - JD_2000) / 36525.0;
    
    // Classical GST formula (USNO Circular 163)
    // Valid to ~0.01 second for dates near J2000.0
    // Sufficient for most astronomical applications
    let GST = 280.46061837
              + 360.98564736629 * (jd - JD_2000)
              + 0.000387933 * T * T
              - T * T * T / 38710000;
    
    // Normalize to [0, 360) degrees
    GST = ((GST % 360) + 360) % 360;
    
    return GST;
  }

  /**
   * Compute Local Sidereal Time
   * LST = Greenwich Sidereal Time + observer's longitude
   * This is what causes celestial objects to rise and set
   * 
   * @param {number} jd - Julian Date
   * @param {number} longitude - Observer longitude in degrees [-180, 180]
   * @returns {number} LST in degrees (0-360)
   */
  static localSiderealTime(jd, longitude) {
    const gst = this.greenwichSiderealTime(jd);
    const lst = (gst + longitude + 360) % 360;
    return lst;
  }

  /**
   * Compute Hour Angle from Right Ascension and Local Sidereal Time
   * Hour Angle = LST - RA (measures hours since culmination)
   * 
   * Rise condition: HA = +90 degrees (6 hours before culmination)
   * Culmination: HA = 0 degrees (due south at maximum altitude)
   * Set condition: HA = -90 degrees (6 hours after culmination)
   * 
   * @param {number} ra_degrees - Right Ascension in degrees [0, 360]
   * @param {number} lst_degrees - Local Sidereal Time in degrees [0, 360]
   * @returns {number} Hour Angle in degrees [-180, 180]
   */
  static hourAngle(ra_degrees, lst_degrees) {
    let ha = (lst_degrees - ra_degrees + 360) % 360;
    
    // Convert to [-180, 180] range for intuitive interpretation
    if (ha > 180) ha = ha - 360;
    
    return ha;
  }

  /**
   * Compute hours until object rises above horizon
   * Requires solving: sin(alt) = sin(lat)sin(dec) + cos(lat)cos(dec)cos(HA)
   * For altitude = 0 (horizon):
   * cos(HA_rise) = -tan(lat)tan(dec)
   * 
   * @param {number} lat_deg - Observer latitude in degrees
   * @param {number} dec_deg - Object declination in degrees
   * @returns {Object} {hours_until_rise, hours_until_set, is_circumpolar, always_below}
   */
  static hoursUntilRiseSet(lat_deg, dec_deg) {
    const lat = lat_deg * Math.PI / 180;
    const dec = dec_deg * Math.PI / 180;
    
    // Compute cos(HA) at horizon (altitude = 0)
    const cos_ha_horizon = -Math.tan(lat) * Math.tan(dec);
    
    // Check if object is circumpolar or always below horizon
    if (cos_ha_horizon > 1) {
      return {
        hours_until_rise: null,
        hours_until_set: null,
        is_circumpolar: false,
        always_below: true
      };
    }
    
    if (cos_ha_horizon < -1) {
      return {
        hours_until_rise: null,
        hours_until_set: null,
        is_circumpolar: true,
        always_below: false
      };
    }
    
    // Compute hour angle at horizon
    const ha_horizon = Math.acos(cos_ha_horizon) * 180 / Math.PI;
    
    // Time until rise = ha_horizon / 15 hours (15 degrees/hour)
    // Time until set = -ha_horizon / 15 hours
    
    return {
      hours_until_rise: ha_horizon / 15,
      hours_until_set: -ha_horizon / 15,
      is_circumpolar: false,
      always_below: false
    };
  }

  /**
   * Check if object is currently visible (above horizon)
   * @param {number} alt_deg - Object altitude in degrees
   * @returns {boolean} true if above horizon (accounting for refraction)
   */
  static isVisible(alt_deg) {
    // Standard horizon definition with atmospheric refraction
    // Objects with alt > -0.83deg appear above geometric horizon
    return alt_deg > -0.83;
  }
}

export { SiderealTime };
```

---

## Module 3: Sky Dome Projection

### File: `sky-module/sky-dome.js`

```javascript
/**
 * Sky Dome rendering and geometric utilities
 * Renders an inverted sphere with celestial positions and reference lines
 */

class SkyDomeProjector {
  /**
   * Project observer-local coordinates (Alt/Az) to 3D scene coordinates
   * 
   * @param {number} alt - Altitude in radians [-/2, /2]
   * @param {number} az - Azimuth in radians [0, 2]
   * @param {number} radius - Sky dome radius (typically 900 scene units)
   * @returns {Object} {x, y, z} - 3D position on sky dome
   */
  static projectToSkyDome(alt, az, radius = 900) {
    // Altitude determines vertical position (y-component)
    // Azimuth determines horizontal position (x-z plane)
    const cos_alt = Math.cos(alt);
    const sin_alt = Math.sin(alt);
    
    return {
      x: radius * cos_alt * Math.sin(az),
      y: radius * sin_alt,
      z: radius * cos_alt * Math.cos(az)
    };
  }

  /**
   * Create Three.js sky dome geometry (inverted sphere)
   * @param {number} radius - Sky dome radius
   * @param {number} segments - Number of segments (64+ recommended)
   * @returns {THREE.BufferGeometry}
   */
  static createSkyDomeGeometry(radius = 900, segments = 64) {
    // Create sphere as base geometry
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    
    // Invert the sphere so we view from inside
    const positions = geometry.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = -positions.getX(i);
      const y = positions.getY(i);
      const z = -positions.getZ(i);
      positions.setXYZ(i, x, y, z);
    }
    
    // Reverse triangle winding for inside viewing
    const indices = geometry.index.array;
    for (let i = 0; i < indices.length; i += 3) {
      [indices[i], indices[i + 2]] = [indices[i + 2], indices[i]];
    }
    
    geometry.index.needsUpdate = true;
    positions.needsUpdate = true;
    
    return geometry;
  }

  /**
   * Create horizon line (circle at altitude = 0 degrees)
   * Visual reference showing the observer's horizon
   */
  static createHorizonLine(radius = 900) {
    const points = [];
    const segments = 360; // One point per degree
    
    // Altitude = 0 means cos(0) = 1, sin(0) = 0
    const alt = 0;
    const cos_alt = Math.cos(alt);
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      points.push(
        new THREE.Vector3(
          radius * cos_alt * Math.sin(angle),
          0, // y = 0 at horizon
          radius * cos_alt * Math.cos(angle)
        )
      );
    }
    
    // Close the loop
    points.push(points[0].clone());
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0xcccccc,
      linewidth: 2,
      transparent: true,
      opacity: 0.6
    });
    
    return new THREE.Line(geometry, material);
  }

  /**
   * Get cardinal directions projected on horizon
   * Useful for compass overlay
   */
  static getCardinalDirections(radius = 900) {
    const alt_horizon = 0;
    const cos_alt = Math.cos(alt_horizon);
    
    return {
      north: { x: 0, y: 0, z: radius * cos_alt, label: 'N' },
      east: { x: radius * cos_alt, y: 0, z: 0, label: 'E' },
      south: { x: 0, y: 0, z: -radius * cos_alt, label: 'S' },
      west: { x: -radius * cos_alt, y: 0, z: 0, label: 'W' },
      zenith: { x: 0, y: radius, z: 0, label: 'Z' }
    };
  }

  /**
   * Create altitude/azimuth reference grid (optional)
   * Helps users understand sky coordinates
   */
  static createAltAzGrid(radius = 900, altStep = 15, azStep = 30) {
    const lines = [];
    
    // Altitude circles (constant altitude lines)
    for (let alt_deg = altStep; alt_deg < 90; alt_deg += altStep) {
      const alt_rad = alt_deg * Math.PI / 180;
      const r = radius * Math.cos(alt_rad);
      const y = radius * Math.sin(alt_rad);
      
      const points = [];
      for (let az_deg = 0; az_deg <= 360; az_deg += 5) {
        const az_rad = az_deg * Math.PI / 180;
        points.push(new THREE.Vector3(
          r * Math.sin(az_rad),
          y,
          r * Math.cos(az_rad)
        ));
      }
      
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(
        geom,
        new THREE.LineBasicMaterial({
          color: 0x444444,
          transparent: true,
          opacity: 0.3
        })
      );
      lines.push(line);
    }
    
    // Azimuth lines (meridians)
    for (let az_deg = 0; az_deg < 360; az_deg += azStep) {
      const az_rad = az_deg * Math.PI / 180;
      const points = [];
      
      for (let alt_deg = -90; alt_deg <= 90; alt_deg += 5) {
        const alt_rad = alt_deg * Math.PI / 180;
        const cos_alt = Math.cos(alt_rad);
        points.push(new THREE.Vector3(
          radius * cos_alt * Math.sin(az_rad),
          radius * Math.sin(alt_rad),
          radius * cos_alt * Math.cos(az_rad)
        ));
      }
      
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(
        geom,
        new THREE.LineBasicMaterial({
          color: 0x444444,
          transparent: true,
          opacity: 0.3
        })
      );
      lines.push(line);
    }
    
    return lines;
  }
}

export { SkyDomeProjector };
```

---

## Module 4: Observer Input

### File: `sky-module/observer-input.js`

```javascript
/**
 * Observer location and time input handling
 * Manages timezone-aware time conversion
 */

class TimeConverter {
  /**
   * Convert observer's local time to Julian Date (UTC)
   * 
   * @param {SkyTime} localTime - Time in observer's timezone
   * @param {Observer} observer - Observer location with timezone info
   * @returns {number} Julian Date in UT1
   */
  static toJulianDate(localTime, observer) {
    // Get timezone offset in hours
    const tzOffset = this.getTimezoneOffset(observer.timezone);
    
    // Create UTC time
    const utcTime = new Date(Date.UTC(
      localTime.year,
      localTime.month - 1, // JavaScript months are 0-indexed
      localTime.day,
      localTime.hour,
      localTime.minute,
      localTime.second || 0
    ));
    
    // Adjust for timezone offset
    utcTime.setHours(utcTime.getHours() - tzOffset);
    
    // Convert to Julian Date
    const milliseconds = utcTime.getTime();
    const julianDate = milliseconds / 86400000 + 2440587.5;
    
    return julianDate;
  }

  /**
   * Convert Julian Date back to local time
   * 
   * @param {number} jd - Julian Date
   * @param {Observer} observer - Observer location
   * @returns {SkyTime} Local time in observer's timezone
   */
  static fromJulianDate(jd, observer) {
    const milliseconds = (jd - 2440587.5) * 86400000;
    const utcDate = new Date(milliseconds);
    
    const tzOffset = this.getTimezoneOffset(observer.timezone);
    const localDate = new Date(utcDate.getTime() + tzOffset * 3600000);
    
    return {
      year: localDate.getUTCFullYear(),
      month: localDate.getUTCMonth() + 1,
      day: localDate.getUTCDate(),
      hour: localDate.getUTCHours(),
      minute: localDate.getUTCMinutes(),
      second: localDate.getUTCSeconds(),
      timezone: observer.timezone
    };
  }

  /**
   * Get timezone offset from IANA timezone string
   * Uses Intl API for accurate DST handling
   * 
   * @param {string} tzString - IANA timezone (e.g., "Asia/Kolkata", "America/New_York")
   * @returns {number} Offset in hours from UTC
   */
  static getTimezoneOffset(tzString) {
    try {
      // Format current time in target timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tzString,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const now = new Date();
      
      // Get UTC time
      const utcString = now.toLocaleString('en-US', {
        timeZone: 'UTC',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Get local time in target timezone
      const localString = formatter.format(now);
      
      // Parse times and compute difference
      const [utc_h, utc_m] = utcString.split(':').map(Number);
      const [local_h, local_m] = localString.split(':').map(Number);
      
      const utc_minutes = utc_h * 60 + utc_m;
      const local_minutes = local_h * 60 + local_m;
      
      let diff = (local_minutes - utc_minutes) / 60;
      
      // Handle day boundary
      if (diff > 12) diff -= 24;
      if (diff < -12) diff += 24;
      
      return diff;
    } catch (e) {
      console.error(`Invalid timezone: ${tzString}`, e);
      return 0; // Default to UTC
    }
  }
}

// Preset observer locations
export const observerPresets = {
  newDelhi: {
    name: "New Delhi, India",
    latitude: 28.6139,
    longitude: 77.2090,
    elevation: 216,
    timezone: "Asia/Kolkata",
    description: "Capital of India, North India standard reference"
  },
  greenwich: {
    name: "Greenwich, UK",
    latitude: 51.4769,
    longitude: 0.0,
    elevation: 10,
    timezone: "Europe/London",
    description: "Prime Meridian, reference for longitude"
  },
  sydney: {
    name: "Sydney, Australia",
    latitude: -33.8688,
    longitude: 151.2093,
    elevation: 58,
    timezone: "Australia/Sydney",
    description: "Southern Hemisphere, major city"
  },
  equator: {
    name: "Quito, Ecuador",
    latitude: -0.2,
    longitude: -78.5,
    elevation: 2812,
    timezone: "America/Guayaquil",
    description: "Near equator, equal day/night"
  },
  northPole: {
    name: "North Pole",
    latitude: 90.0,
    longitude: 0.0,
    elevation: 0,
    timezone: "UTC",
    description: "Arctic: Sun at horizon for 6 months"
  },
  southPole: {
    name: "South Pole",
    latitude: -90.0,
    longitude: 0.0,
    elevation: 2835,
    timezone: "UTC",
    description: "Antarctic: Sun at horizon for 6 months"
  }
};

export { TimeConverter };
```

---

## Key Integration Points

### Integration with scripting.js

```javascript
// In sky-scene.js
import { SkyCoordinateTransformer } from './coordinate-transforms.js';
import { SiderealTime } from './sidereal-time.js';

class SkySceneManager {
  constructor() {
    this.observer = observerPresets.newDelhi;
    this.skyTime = { year: 2026, month: 1, day: 15, hour: 18, minute: 30 };
    this.skyBodies = []; // Sun, Moon, planets
  }

  /**
   * Update sky view using heliocentric positions from main simulation
   * Called from scripting.js animate() loop
   */
  updateSkyFromHeliocentric(heliocentricBodies, earthPosition, jd) {
    const lst = SiderealTime.localSiderealTime(jd, this.observer.longitude);
    
    for (const body of heliocentricBodies) {
      // Transform heliocentric -> observer-local
      const skyPos = SkyCoordinateTransformer.heliocentricToAltAz(
        body.position,
        earthPosition,
        this.observer,
        jd
      );
      
      // Update body position on sky dome if visible
      if (SiderealTime.isVisible(skyPos.alt_deg)) {
        this.renderBodyOnSkyDome(body.name, skyPos);
        this.updateTrail(body.name, skyPos, jd);
      } else {
        this.hideBody(body.name);
      }
    }
  }

  renderBodyOnSkyDome(bodyName, skyPos) {
    const scenePos = SkyDomeProjector.projectToSkyDome(skyPos.alt, skyPos.az, 900);
    // Update Three.js object position
  }

  updateTrail(bodyName, skyPos, jd) {
    // Add to trail manager for path visualization
  }
}
```

---

## Next Steps

1. **Copy these modules** into `src/sky-module/`
2. **Test coordinate transforms** with known astronomical data
3. **Integrate with scripting.js** to hook heliocentric positions
4. **Build UI** for observer selection and time control
5. **Render trails** as bodies are tracked over time
6. **Validate against Stellarium** for physical correctness

---

## Files to Create

```
src/
  sky-module/
     coordinate-transforms.js    (270 lines - ready)
     sidereal-time.js            (150 lines - ready)
     sky-dome.js                 (280 lines - ready)
     observer-input.js           (200 lines - ready)
     trail-manager.js            (needs implementation)
     rise-set-calculator.js      (needs implementation)
     sky-ui.js                   (needs implementation)
     sky-scene.js                (needs implementation)
```

**Total Foundation Code: ~900 lines ready for production**

