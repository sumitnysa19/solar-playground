# Earth Sky Simulation Extension Proposal (Extended & Refined)

## Executive Summary

This proposal adds **observer-based sky rendering** to the existing heliocentric simulation, allowing users to see the **actual sky from any Earth location and time**. The architecture leverages the existing heliocentric engine, adds coordinate transformations, and introduces trail tracking for celestial bodies. The system is modular, educational, and production-ready.

**Key Innovation:** Reuse heliocentric positions (already computed) and transform them to observer-local horizontal coordinates for rendering on a sky dome.

---

## 1. Architectural Overview

### System Architecture Diagram

```
------------------------------------------------------------------
                  Earth Sky Module                        
-------------------------------------------------------‚
â”‚  User Input Layer                                        â”‚
â”‚  â”œâ”€ Observer Position (lat, lon, elev)                 â”‚
â”‚  â”œâ”€ Date/Time Selection                                 â”‚
â”‚  â””â”€ Display Mode (daily, monthly, yearly)              â”‚
â”‚         â”‚                                                â”‚
â”‚         â†“                                                â”‚
â”‚  Coordinate Transformation Engine                        â”‚
â”‚  â”œâ”€ Heliocentric (from scripting.js)                   â”‚
â”‚  â”œâ”€ Geocentric (subtract Earth position)                â”‚
â”‚  â”œâ”€ Ecliptic â†’ Equatorial (obliquity rotation)         â”‚
â”‚  â”œâ”€ Equatorial â†’ Horizontal (observer-based)            â”‚
â”‚  â””â”€ Altitude/Azimuth (Az, Alt)                         â”‚
â”‚         â”‚                                                â”‚
â”‚         â†“                                                â”‚
â”‚  Sky Rendering Engine                                    â”‚
â”‚  â”œâ”€ Sky Dome (inverted sphere, stars)                  â”‚
â”‚  â”œâ”€ Celestial Body Markers (Sun, Moon, planets)        â”‚
â”‚  â”œâ”€ Horizon Line (altitude = 0 degrees)                â”‚
â”‚  â”œâ”€ Cardinal Directions (N, E, S, W)                   â”‚
â”‚  â””â”€ Meridian & Altitude Grid (optional)                â”‚
â”‚         â”‚                                                â”‚
â”‚         â†“                                                â”‚
â”‚  Trail & Analysis Engine                                â”‚
â”‚  â”œâ”€ Real-time Path Traces                              â”‚
â”‚  â”œâ”€ Rise/Set Times Computation                         â”‚
â”‚  â”œâ”€ Retrograde Detection                               â”‚
â”‚  â””â”€ Analemma Computation (Sun only)                    â”‚
â”‚         â”‚                                                â”‚
â”‚         â†“                                                â”‚
â”‚  Interactive Controls                                    â”‚
â”‚  â”œâ”€ Time Scrubber (date/time selection)                â”‚
â”‚  â”œâ”€ Location Picker (interactive map)                  â”‚
â”‚  â”œâ”€ Trail Toggle (day/month/year)                      â”‚
â”‚  â””â”€ Visibility Filters (which bodies to show)          â”‚
â”‚                                                          â”‚
----------------------------------------------------------------------------------------------
```

---

## 1.1 Hosting & Integration Boundaries

- `skyview.html` is a separate entry point that imports only the sky-module bundle and a read-only adapter to query heliocentric state (no coupling to `planetesimal.html` DOM/UI).
- Shared data contract: a lightweight `HelioStateProvider` exposes `getBodyState(bodyId, jd)` -> `{ posEcliptic: vec3_m, velEcliptic: vec3_m }` for Sun/Earth/planets/Moon; provider calls existing ephemeris functions from `functions.js`/`construction.js` to avoid duplicate Kepler solvers.
- Rendering isolation: distinct Three.js scene/renderer/camera to prevent side effects; optional reuse of loaders/shaders via shared module proxy, but no shared scene graph nodes.
- Build/serve: add a simple `skyview.html` that loads `skyview.js` (ES module) and mounts into its own canvas/container, leaving `planetesimal.html` untouched.

### HelioStateProvider Implementation

```javascript
class HelioStateProvider {
  constructor(scriptingModule) {
    this.scriptingModule = scriptingModule;  // Reference to scripting.js
    this.cache = new Map();                   // Cache by (bodyId, jd) key
  }

  /**
   * Get heliocentric position for a body
   * @param {string} bodyId - 'Sun', 'Earth', 'Moon', 'Mercury', etc.
   * @param {number} jd - Julian Date
   * @returns {Object} { posEcliptic: {x, y, z}, velEcliptic: {x, y, z} }
   */
  getBodyState(bodyId, jd) {
    const key = `${bodyId}_${jd.toFixed(4)}`;
    if (this.cache.has(key)) return this.cache.get(key);
    
    // Call existing ephemeris function from scripting.js
    // E.g., scriptingModule.vector() for Kepler solver
    const posEcliptic = this.scriptingModule.getBodyPosition(bodyId, jd);
    const velEcliptic = this.scriptingModule.getBodyVelocity(bodyId, jd);
    
    const state = { posEcliptic, velEcliptic };
    this.cache.set(key, state);
    return state;
  }
}
```

---

## 1.2 MVP Scope (Phase 1 - Core Features Only)

**Phase 1 Implementation: 2-3 weeks**

The MVP focuses on core functionality without Stellarium-parity features. These features are deferred to Phase 2.

**MVP Includes (Minimal, Focused Scope):**
- Observer location input: preset locations (India primary + 1-2 global; UTC only, no timezone conversion)
- Celestial body markers: **7 major bodies mandatory** (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn)
- Nakshatra constellation lines: **all 28 nakshatras mandatory** with lines and toggle control
- Static star field: 2,000 brightest stars with uniform sizing (no magnitude-based appearance)
- Sky dome: horizon line + cardinal directions (N, E, S, W) only
- Daily sky traces: day mode only with 6-hour coarse sampling (4 points per day per body)
- Rise/set times: ±15 minute accuracy (geometric, no refraction)
- UI controls: minimal (play/pause, time slider, observer preset dropdown, constellation toggle)
- Performance: 60 FPS with 7 body trails and Nakshatra constellation lines enabled

**MVP Excludes (All Deferred to Phase 2):**
- Atmospheric refraction, extinction, and twilight gradients
- Precession, nutation, and aberration/light-time corrections
- Moon phase visualization and lunar terminator
- Magnitude-based star sizing (uniform points only)
- Constellation labels and names (lines only)
- Retrograde motion visualization (detection deferred)
- Month/year trail modes (day mode only)
- Custom observer locations via map (presets only)
- Time multiplier/fast-forward controls
- Zoom/field-of-view control
- Night mode and sky coloring
- Landscape textures
- Proper motion in star catalogs
- High-precision rise/set refinement
- Automated validation against JPL Horizons

---

## 1.3 Phase 2 & Future Enhancements (Stellarium-Parity)

**Phase 2 Implementation: 1-2 weeks (future)**

Once MVP is stable and validated, Phase 2 adds advanced features for Stellarium-parity:

**Atmospheric fidelity:** Include refraction (toggleable geometric vs apparent), atmospheric extinction/airmass for brightness attenuation, twilight sky color gradient driven by Sun altitude, Moon phase shading/brightness.

**Earth orientation:** Optional precession/nutation and equation of equinoxes (IAU 2000/2006) to tighten RA/Dec over decades; document approximation level when disabled.

**Topocentric corrections:** Apply parallax for Moon/planets using observer elevation; note aberration/light-time omissions if not implemented.

**Ephemeris fidelity:** Clarify ephemeris source (current analytic elements vs higher-precision sets like VSOP/ELP/DE); include expected error bounds and validation targets.

**Time scales:** Specify handling of UTC vs UT1 and Î”T; note that precise sidereal time ideally uses UT1â€”document approximation if using UTC.

**Stars and constellations:** Define star catalog source (e.g., HYG), magnitude use, optional proper motion handling; clarify constellation dataset usage and limits.

**UX enhancements:** Red-light/night mode, field-of-view control, horizon masking/landscape texture option, label density control for clutter management.

---

## 1.4 External References (VirtualSky, Stardroid)

- VirtualSky (GPLv3): can reuse UI/visual patterns and, if necessary, small code/data snippets marked with `// Copied from VirtualSky (GPLv3) - review licensing before release`. Prefer reimplementation to avoid GPL obligations.
- Stardroid design docs (Apache 2.0): use as reference for architecture (layers, culling, rendering order), sky objects, and orientation flows; copying concepts is fine. If code/data are borrowed, annotate with `// Derived from Stardroid (Apache-2.0) - see docs`.
- Fourmilab YourSky: reference for rise/set algorithm and coordinate sanity checks (Phase 2 high-precision refinement).
- d3-celestial (MIT): reference for constellation lines/boundaries/stars (Phase 2 feature).

## 2. Observer Definition & User Input

### Observer Location Specification

The sky is rendered from a specific point on Earth supplied by the user. All coordinate transforms are observer-dependent.

```typescript
interface Observer {
  name: string;              // "New Delhi", "London", etc.
  latitude: number;          // degrees, +North [-90,90], -South
  longitude: number;         // degrees, +East [-180,180], -West
  elevation: number;         // meters above sea level
  timezone: string;          // "UTC+5:30" or IANA timezone
  description?: string;      // Optional location metadata
}

interface SkyTime {
  year: number;              // 1900-2100+
  month: number;             // 1-12
  day: number;               // 1-31
  hour: number;              // 0-23 (UTC)
  minute: number;            // 0-59
  second: number;            // 0-59 (optional)
  timezone?: string;         // Override observer timezone
}
```

### Example User Input

```javascript
// Preset locations
export const observerPresets = {
  newDelhi: {
    name: "New Delhi, India",
    latitude: 28.6139,
    longitude: 77.2090,
    elevation: 216,
    timezone: "Asia/Kolkata"
  },
  greenwich: {
    name: "Greenwich, UK",
    latitude: 51.4769,
    longitude: 0.0,
    elevation: 10,
    timezone: "Europe/London"
  },
  sydney: {
    name: "Sydney, Australia",
    latitude: -33.8688,
    longitude: 151.2093,
    elevation: 58,
    timezone: "Australia/Sydney"
  },
  equator: {
    name: "Quito, Ecuador",
    latitude: 0.2,
    longitude: -78.5,
    elevation: 2812,
    timezone: "America/Guayaquil"
  }
};

// User-selected observer
let activeObserver = observerPresets.newDelhi;
let skyTime = {
  year: 2026,
  month: 1,
  day: 15,
  hour: 18,
  minute: 30
};
```

**Key Feature:** Changing observer location or time instantly updates the sky view.

---

## 2.1 Initial State & Ephemeris Sourcing (MVP)

**MVP approach (simple, fast):**
- Start epoch: default to "now" using system clock converted to JD; allow overrides from the date/time picker.
- Body positions: reuse analytic ephemerides already in `functions.js`/`construction.js` (elliptical elements) for Sun/Earth/planets; Moon reuses existing lunar model or simplified approximation.
- Earth orientation: obliquity from J2000 constant (23.43929111 degrees); no nutation/precession in MVP.
- Refraction: NOT included in MVP. Rise/set times are geometric (altitude = 0 degrees exactly).
- Parallax: NOT applied in MVP. All bodies treated as if observed from Earth's center.

**Phase 2 enhancements:**
- Optional atmospheric refraction (standard 34 arcmin at horizon) toggled separately for rise/set reporting.
- Optional precession/nutation (IAU 2000/2006) for sub-arcminute accuracy over decades.
- Optional topocentric parallax for Moon/planets using observer elevation.

---

## 3. Time Handling & Julian Date Conversion

### Timezone-Aware Conversion

Local time must be converted to UTC before Julian Date calculation:

```javascript
class TimeConverter {
  /**
   * Convert observer local time to Julian Date
   * @param {SkyTime} localTime - Time in observer's timezone
   * @param {Observer} observer - Observer location (includes timezone)
   * @returns {number} Julian Date
   */
  static toJulianDate(localTime, observer) {
    const tzOffset = this.getTimezoneOffset(observer.timezone);
    
    const utcTime = new Date(Date.UTC(
      localTime.year,
      localTime.month - 1,
      localTime.day,
      localTime.hour,
      localTime.minute,
      localTime.second || 0
    ));
    
    utcTime.setHours(utcTime.getHours() - tzOffset);
    
    const milliseconds = utcTime.getTime();
    const julianDate = milliseconds / 86400000 + 2440587.5;
    
    return julianDate;
  }

  /**
   * Get timezone offset from IANA timezone string
   */
  static getTimezoneOffset(tzString) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tzString,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const now = new Date();
    const utcTime = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: tzString }));
    
    return (utcTime - localTime) / 3600000;
  }
}
```

---

## 4. Coordinate Pipeline (Detailed)

The full transformation pipeline from heliocentric to observer-local coordinates:

```
Step 1: Heliocentric Position
        Bodies from existing heliocentric simulation
                 â†“
Step 2: Geocentric (subtract Earth position)
        Mars_geocentric = Mars_helio - Earth_helio
                 â†“
Step 3: Ecliptic â†’ Equatorial (obliquity rotation)
        Rotate by 23.439 degrees
                 â†“
Step 4: RA/Dec Conversion
        Convert Cartesian to spherical coordinates
                 â†“
Step 5: Greenwich Sidereal Time (Earth rotation)
        GST = f(Julian Date)
                 â†“
Step 6: Local Sidereal Time (observer longitude)
        LST = GST + longitude
                 â†“
Step 7: Equatorial â†’ Horizontal (observer latitude)
        RA/Dec + LST â†’ Altitude/Azimuth
                 â†“
Step 8: Sky Dome Projection
        Alt/Az â†’ 3D scene coordinates on inverted sphere
```

---

## 5. Sidereal Time & Earth Rotation

### Greenwich Sidereal Time (USNO Algorithm)

Greenwich Sidereal Time represents the right ascension of the vernal equinox at Greenwich.

```javascript
class SiderealTime {
  /**
   * Compute Greenwich Sidereal Time
   * @param {number} jd - Julian Date (UT1)
   * @returns {number} GST in degrees (0-360)
   */
  static greenwichSiderealTime(jd) {
    const JD_2000 = 2451545.0;
    const T = (jd - JD_2000) / 36525.0;
    
    let GST = 280.46061837
              + 360.98564736629 * (jd - JD_2000)
              + 0.000387933 * T * T
              - T * T * T / 38710000;
    
    GST = ((GST % 360) + 360) % 360;
    return GST;
  }

  /**
   * Compute Local Sidereal Time (observer-dependent)
   * @param {number} jd - Julian Date
   * @param {number} longitude - Observer longitude in degrees
   * @returns {number} LST in degrees (0-360)
   */
  static localSiderealTime(jd, longitude) {
    const gst = this.greenwichSiderealTime(jd);
    const lst = (gst + longitude + 360) % 360;
    return lst;
  }

  /**
   * Compute Hour Angle from RA and LST
   * Hour Angle = LST - RA
   */
  static hourAngle(ra_degrees, lst_degrees) {
    let ha = (lst_degrees - ra_degrees + 360) % 360;
    if (ha > 180) ha = ha - 360;
    return ha;
  }
}
```

**Why LST Matters:** Objects rise when HA = 90 degrees (6 hours before culmination) and set when HA = -90 degrees (6 hours after culmination).

---

## 6. Full Sky Projection Mathematics

### Step 1: Ecliptic â†’ Equatorial Rotation

```javascript
class CoordinateFrameTransforms {
  static OBLIQUITY_J2000 = 23.43929111 * Math.PI / 180;

  /**
   * Rotate ecliptic coordinates to J2000.0 equatorial
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
}
```

### Step 2: Cartesian â†’ Right Ascension / Declination

```javascript
function cartesianToRaDec(vec) {
  const distance = Math.sqrt(vec.x*vec.x + vec.y*vec.y + vec.z*vec.z);
  
  const ra = Math.atan2(vec.y, vec.x);
  const dec = Math.asin(vec.z / distance);
  
  return {
    ra: ra >= 0 ? ra : ra + 2 * Math.PI,
    dec: dec,
    distance: distance
  };
}
```

### Step 3: RA / Dec â†’ Altitude / Azimuth

This is the critical transformation that depends on observer location and time.

```javascript
/**
 * Convert RA/Dec (celestial) to Alt/Az (observer-local)
 */
function raDecToAltAz(ra, dec, lst_deg, lat_deg) {
  const lst = lst_deg * Math.PI / 180;
  const lat = lat_deg * Math.PI / 180;
  
  // Hour Angle = LST - RA
  const ha = lst - ra;
  
  const sin_lat = Math.sin(lat);
  const cos_lat = Math.cos(lat);
  const sin_dec = Math.sin(dec);
  const cos_dec = Math.cos(dec);
  const sin_ha = Math.sin(ha);
  const cos_ha = Math.cos(ha);
  
  // Altitude
  const alt = Math.asin(
    sin_lat * sin_dec + 
    cos_lat * cos_dec * cos_ha
  );
  
  // Azimuth (N=0, E=90, S=180, W=270)
  const az = Math.atan2(
    -sin_ha,
    Math.tan(dec) * cos_lat - sin_lat * cos_ha
  );
  
  return {
    alt: alt,
    az: az >= 0 ? az : az + 2 * Math.PI,
    alt_deg: alt * 180 / Math.PI,
    az_deg: az * 180 / Math.PI
  };
}
```

**Important conventions:**
- Altitude: 90 degrees = zenith, 0 degrees = horizon, -90 degrees = nadir
- Azimuth: 0 degrees = North, 90 degrees = East, 180 degrees = South, 270 degrees = West
- Objects below horizon (alt < 0) are invisible

---

## 7. Sky Dome Rendering & Projection

### 3D Scene Projection from Alt/Az

Convert observer-local altitude/azimuth to 3D scene coordinates on an inverted sky dome:

```javascript
class SkyDomeProjector {
  /**
   * Project observer coordinates (Alt/Az) to 3D sky dome position
   */
  static projectToSkyDome(alt, az, radius = 900) {
    const cos_alt = Math.cos(alt);
    const sin_alt = Math.sin(alt);
    
    return {
      x: radius * cos_alt * Math.sin(az),
      y: radius * sin_alt,
      z: radius * cos_alt * Math.cos(az)
    };
  }

  /**
   * Create sky dome geometry (inverted sphere)
   */
  static createSkyDomeGeometry(radius = 900, segments = 64) {
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    
    // Invert sphere normals
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      positions.setXYZ(i, 
        -positions.getX(i),
        positions.getY(i),
        -positions.getZ(i)
      );
    }
    
    return geometry;
  }

  /**
   * Create horizon line (circle at alt = 0 degrees)
   */
  static createHorizonLine(radius = 900) {
    const points = [];
    const segments = 360;
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      points.push(
        new THREE.Vector3(
          radius * Math.cos(angle),
          0,
          radius * Math.sin(angle)
        )
      );
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    return new THREE.Line(geometry, material);
  }
}
```

---

## 7.1 Sky Dome Layering & Culling

- Layering: background starfield (static/dim), constellation lines/labels (toggle), horizon + cardinal markers, grid overlays (alt-az), body markers with size scaled by brightness.
- Horizon culling: hide or fade bodies with `alt < 0` (optionally clamp to âˆ’5Â° to show â€œjust below horizonâ€ with dim color).
- Brightness: magnitude-based sizing/opacity (precomputed mag table for planets, Sun/Moon special cases), global brightness slider applies exposure multiplier to marker materials.
- Cardinal/compass: 2D overlay compass rose aligned to camera yaw; 3D labels at horizon points (N/E/S/W) pinned in view space.

---

## 7.2 Stars (MVP - Static Field Only)

**MVP approach (simple, fast):**
- Use a lightweight static star catalog: brightest ~2,000 stars from HYG (public domain).
- Star data: RA, Dec, visual magnitude (V), optional Bayer name.
- Projection: convert RA/Dec â†’ Alt/Az â†’ dome position on each frame (cached RA/Dec vectors).
- Rendering: size stars by magnitude (brighter = larger points); dim very faint stars (mag > 6).
- Toggle: show/hide stars via UI checkbox.
- No proper motion in MVP.

**Constellations (Phase 2 feature - NOT in MVP):**
- Constellation lines and labels deferred to Phase 2.
- When implemented, use d3-celestial constellation data (MIT licensed) or adapt VirtualSky outlines (mark with clear licensing comments).
- Rendering: `LineSegments` on the dome; projected RA/Dec â†’ Alt/Az; cached vertices.
- Density control and fade near horizon for Phase 2 UX.

**Phase 2 implementation:**
- Constellation dataset (lines, boundaries, labels)
- Proper motion corrections for bright stars (optional)
- Star magnitude-based appearance adjustments

---

## 8. Daily, Monthly & Yearly Sky Traces (Key Feature)

### Trail Data Structure

Each celestial body maintains a trail of sky positions over configurable time periods:

```typescript
interface SkyTrail {
  bodyName: string;           // "Sun", "Mars", "Moon"
  points: SkyPoint[];         // Array of sampled positions
  mode: "day";               // MVP: day mode only
  color: string;              // Trail color for rendering
  visible: boolean;           // Toggle trail visibility
  startJD: number;            // Julian Date of trace start (today)
  endJD: number;              // Julian Date of trace end (today + 24 hours)
}

interface SkyPoint {
  alt: number;                // Altitude (radians)
  az: number;                 // Azimuth (radians)
  jd: number;                 // Julian Date (for interpolation)
}

type TraceMode = "day" | "month" | "year" | "custom";
```

### Sampling Strategy

Different trace modes require different sampling intervals:

```javascript
class SkyTraceManager {
  static SAMPLE_INTERVAL = {
    day: 6 / 24                // 6-hour sampling (4 points per day) - MVP only
  };

  /**
   * Initialize trail for a celestial body
   */
  constructor(bodyName, mode = "day", startJD, endJD) {
    this.trail = {
      bodyName,
      points: [],
      mode,
      color: this.getBodyColor(bodyName),
      visible: true,
      startJD,
      endJD
    };
    this.lastSampleJD = startJD;
  }

  /**
   * Add sample point if sampling interval elapsed
   */
  addSample(jd, altAz) {
    const sampleInterval = SkyTraceManager.SAMPLE_INTERVAL[this.trail.mode];
    
    if (jd - this.lastSampleJD >= sampleInterval) {
      this.trail.points.push({
        alt: altAz.alt,
        az: altAz.az,
        jd: jd
      });
      this.lastSampleJD = jd;
    }
  }

  /**
   * Get assigned color for body trails
   */
  static getBodyColor(bodyName) {
    const colors = {
      "Sun": 0xffff00,     // Yellow
      "Moon": 0xcccccc,    // Gray
      "Mercury": 0x8c7853, // Brown
      "Venus": 0xffc649,   // Orange-yellow
      "Mars": 0xff6347,    // Red
      "Jupiter": 0xc88b3a, // Gold-brown
      "Saturn": 0xfad5a5   // Pale yellow
    };
    return colors[bodyName] || 0xffffff;
  }
}
```

### Trail Rendering on Sky Dome

```javascript
class SkyTrailRenderer {
  /**
   * Create Three.js Line geometry from trail
   */
  static createTrailLine(trail, radius = 900) {
    const points = [];
    
    for (const point of trail.points) {
      // Only include points above horizon
      if (point.alt > -5 * Math.PI / 180) {
        const pos = SkyDomeProjector.projectToSkyDome(
          point.alt,
          point.az,
          radius
        );
        points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
      }
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: trail.color,
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    });
    
    return new THREE.Line(geometry, material);
  }
}
```

---

## 8.1 Trail Lifecycle & Storage

- Storage: per-body ring buffer per mode (day/month/year/custom) to cap memory; configurable sample cap (e.g., 300 points per trail) with downsampling via decimation when over limit.
- Regen strategy: on mode change or observer/time jump, regenerate trail asynchronously (web worker optional) to avoid blocking render.
- Continuity: keep last computed JD range and extend forward/backward when user scrubs time instead of full recompute where possible.
- Styling: faded alpha toward older samples; optional vertex colors to encode time (earlier -> cooler hue, recent -> warm).

---

## 9. Rise/Set Time Computation & Retrograde Detection

### Rise/Set Time Calculation (MVP - Simplified)

Objects become visible when they rise above the horizon (alt = 0 degrees). MVP uses **coarse 15-minute sampling** for simplicity and speed.

```javascript
class RiseSetCalculator {
  /**
   * Compute rise/set times for a celestial body (MVP: coarse 15-min resolution)
   * @param {Object} observer - Observer location
   * @param {THREE.Vector3} bodyPos - Heliocentric body position
   * @param {number} jd - Julian Date for current 24-hour period
   * @param {Object} helioProvider - HelioStateProvider for Earth position
   * @returns {Object} { riseJD, transitJD, setJD, visible, riseTime, setTime }
   */
  static calculateRiseSet(observer, bodyPos, jd, helioProvider) {
    const results = { riseJD: null, transitJD: null, setJD: null, visible: false };
    
    let maxAlt = -Math.PI / 2;
    let timeOfMaxAlt = jd;
    let previousAlt = null;
    let previousJd = null;
    let foundRise = false;
    let foundSet = false;
    
    const dayStart = Math.floor(jd);
    const step = 15 / 1440; // 15 minutes in Julian days
    
    // Sample altitude every 15 minutes for 24 hours
    for (let hour = 0; hour < 24; hour += 0.25) {
      const testJd = dayStart + hour / 24;
      const earthState = helioProvider.getBodyState('Earth', testJd);
      const altAz = SkyCoordinateTransformer.heliocentricToAltAz(
        bodyPos, earthState.posEcliptic, observer, testJd
      );
      
      const alt = altAz.alt;
      
      // Find maximum altitude (transit)
      if (alt > maxAlt) {
        maxAlt = alt;
        timeOfMaxAlt = testJd;
      }
      
      // Detect rise (altitude crosses from negative to positive)
      if (previousAlt !== null && previousAlt < 0 && alt >= 0 && !foundRise) {
        results.riseJD = previousJd; // Â±15 minutes
        foundRise = true;
        results.visible = true;
      }
      
      // Detect set (altitude crosses from positive to negative)
      if (previousAlt !== null && previousAlt >= 0 && alt < 0 && foundRise && !foundSet) {
        results.setJD = testJd; // Â±15 minutes
        foundSet = true;
      }
      
      previousAlt = alt;
      previousJd = testJd;
    }
    
    // Set transit if found
    if (maxAlt > -Math.PI / 2) {
      results.transitJD = timeOfMaxAlt;
    }
    
    // If no rise/set found during the day, mark special cases
    if (!foundRise && maxAlt < 0) {
      results.visible = false;  // Never rises
    } else if (!foundSet && foundRise) {
      results.visible = true;   // Never sets (circumpolar)
    }
    
    return results;
  }
}
```

### Retrograde Motion Detection

Retrograde motion occurs when a planet appears to move backward (westward) against the zodiac.

```javascript
class RetrogradeMeter {
  /**
   * Detect retrograde periods in trail
   */
  static detectRetrograde(trail, minDuration = 1) {
    const retroPeriods = [];
    let inRetrograde = false;
    let retroStartJD = null;
    let retroStart = null;
    
    const longitudes = this.computeEclipticLongitudes(trail);
    
    for (let i = 1; i < longitudes.length; i++) {
      const prevLon = longitudes[i - 1];
      const currLon = longitudes[i];
      const prevPoint = trail.points[i - 1];
      const currPoint = trail.points[i];
      
      const isRetro = currLon < prevLon - 0.0001;
      
      if (isRetro && !inRetrograde) {
        inRetrograde = true;
        retroStartJD = prevPoint.jd;
        retroStart = prevLon;
      } else if (!isRetro && inRetrograde) {
        inRetrograde = false;
        const retroEndJD = currPoint.jd;
        const duration = (retroEndJD - retroStartJD) * 24;
        
        if (duration >= minDuration) {
          retroPeriods.push({
            startJD: retroStartJD,
            endJD: retroEndJD,
            duration: duration,
            maxRetrogression: retroStart - currLon
          });
        }
      }
    }
    
    return retroPeriods;
  }
}
```

---

## 9.1 Accuracy Considerations (MVP vs Phase 2)

**MVP approach (geometric, no corrections):**
- Atmospheric refraction: NOT applied in MVP. Geometric horizon (alt = 0 degrees exactly). Rise/set times accurate to ±15 minutes.
- Parallax: NOT applied in MVP. All bodies treated as if viewed from Earth's center.
- Time scale: assume UTC for all JD conversions; GST formula uses UTC directly (acceptable for visualization).
- Aberration/light-time: omitted in MVP; phase 2 optional enhancement.

**Phase 2 enhancements:**
- Optional atmospheric refraction toggle (Bennett formula, ~34 arcmin at horizon).
- Optional topocentric parallax for Moon/planets using observer elevation.
- Optional UT1 support for high-precision GST (requires ΔT table).
- Optional aberration and light-time corrections.

---

## 10. Example User Experience Scenarios

### Scenario 1: Mars Retrograde from New Delhi (Jan-Dec 2026)

**Setup:**
- Observer: New Delhi (28.6 N, 77.2 E)
- Time range: Jan 1 - Dec 31, 2026
- Mode: Yearly trace

**Expected results:**
- Mars path follows zodiac constellations eastward (prograde)
- September 2026: path loops backward (retrograde, ~10 weeks)
- Loop magnitude: ~25-30 degrees
- Rise/set times shift nightly (~50 minutes/day)
- Highest altitude: ~55 degrees above horizon

### Scenario 2: Sun's Daily Arc from Equator (March Equinox)

**Setup:**
- Observer: Quito, Ecuador (0 degrees, 78 W)
- Date: March 20, 2026
- Mode: Daily trace

**Expected results:**
- Sun rises due east, sets due west
- Arc reaches zenith (90 degrees altitude) at solar noon
- Symmetric arc (equal rise/set times)
- Rise time: ~6:00 AM, Set time: ~6:00 PM (local)

---

## 11. Implementation Architecture

```
sky-module/
â”œâ”€â”€ coordinate-transforms.js
â”œâ”€â”€ sidereal-time.js
â”œâ”€â”€ sky-dome.js
â”œâ”€â”€ trail-manager.js
â”œâ”€â”€ rise-set-calculator.js
â”œâ”€â”€ observer-input.js
â”œâ”€â”€ sky-ui.js
â””â”€â”€ sky-scene.js
```

---

## 11.1 Module Responsibilities (sky-module/)

- `coordinate-transforms.js`: heliocentric â†’ geocentric â†’ equatorial â†’ horizontal; includes RA/Dec helpers.
- `sidereal-time.js`: GST/LST/hour angle calculations.
- `sky-dome.js`: dome geometry/materials, horizon line, grid overlays, star sprites (optional).
- `trail-manager.js`: trail sampling, buffers, decimation, and rendering lines.
- `rise-set-calculator.js`: rise/set/transit with refraction-aware zero crossing.
- `observer-input.js`: presets, validation, and UI binding for lat/lon/elev/timezone.
- `sky-ui.js`: controls (time scrubber, speed, toggles, brightness, presets), display panels (LST/GST, alt/az readout), compass overlay.
- `sky-scene.js`: Three.js scene/camera/renderer orchestration, marker creation, per-frame updates, integration with `HelioStateProvider`.

---

## 11.2 Implementation Plan (with VirtualSky reuse notes)

- Phase 0: Bootstrap `skyview.html` + `skyview.js` entry; isolate scene/camera/renderer; wire a placeholder UI shell (time, location, toggles).
- Phase 1: `HelioStateProvider` adapter that calls existing ephemeris functions; expose `getBodyState(bodyId, jd)`; add simple cache.
- Phase 2: `sidereal-time.js` + `coordinate-transforms.js`; verify alt/az outputs against known cases; compare with VirtualSky math as a sanity check.
- Phase 3: `sky-dome.js` dome/horizon/grid/cardinals; may reuse VirtualSky rendering patterns (mark copied snippets with comments: `// Copied from VirtualSky (GPLv3) - review licensing before release`).
- Phase 4: Body markers + culling + brightness scaling; Moon phase shading and Sun glare; optional extinction/refraction toggles.
- Phase 5: Trails via `trail-manager.js`; sampling modes (day/month/year); rendering lines; regen on observer/time changes.
- Phase 6: Rise/set/transit (`rise-set-calculator.js`) using refraction-aware zero crossing; parallax for Moon/planets.
- Phase 7: UI wiring (`sky-ui.js`, `observer-input.js`): presets/custom, time picker, speed control, toggles (trails/grid/labels/night mode/FOV).
- Phase 8: Validation pass vs Stellarium/JPL Horizons; record angular/rise-set errors; tune refraction/extinction constants.
- Licensing note: if any VirtualSky code/data is copied, mark each block/file with a clear comment for later replacement or GPL compliance review. Prefer reimplementation; copying should be minimal and flagged.
- External leverage: use Fourmilab YourSky as an algorithm/spec reference for rise/set, twilight shading, and coordinate sanity; use d3-celestial (MIT) datasets/formats for constellation lines/boundaries/stars with attribution; other referenced projects are low-priority unless a specific snippet is needed.

---

## 12. Validation & Testing

### Physical Validation Tests

**Test 1: Sun Position at Equinox**
- Date: March 20, 2026
- Location: Greenwich (51.5 N)
- Expected: Sun altitude ~38.5 degrees at noon

**Test 2: Venus Greatest Elongation**
- Date: January 2026
- Expected: Venus 47 degrees from Sun

**Test 3: Lunar Rise/Set Times**
- Observer: New Delhi
- Expected: Rise/set shift ~50 min/day

---

## 12.1 Integration Test Matrix

- Presets sanity: verify Sun rise due east/set due west on equinox for equator and mid-latitude locations.
- Polar edge cases: high latitudes (e.g., TromsÃ¸) where Sun does not set/rise near solstice; ensure trails and rise/set reporting handle â€œno rise/setâ€.
- Time reversal: run negative time multiplier and confirm trails reverse correctly and no NaNs in LST/hour angle.
- Horizon culling: confirm bodies vanish below horizon and reappear on expected altitudes; labels match markers.
- Performance: target 60 FPS with trails enabled for major bodies; measure with and without bloom/overlays.
- Ephemeris validation: cross-check Sun/Moon/planets alt/az against Stellarium or JPL Horizons for selected dates (e.g., equinox, solstice, Mars opposition) and record maximum angular error; validate rise/set within acceptable minute-level tolerance when refraction enabled.
- Atmospheric/visual validation: confirm twilight gradient changes with Sun altitude, refraction toggle shifts rise/set times as expected, and night mode/FOV controls function without impacting accuracy.
- Manual cross-checks vs public sky sites:
  - Compare current sky (now) alt/az and sky map against Stellarium Web and Sky & Telescopeâ€™s Interactive Sky Chart; verify markers match within a small angular tolerance.
  - Pick future/past dates (e.g., next Mars opposition, past lunar eclipse) and confirm positions/tracks align visually with Stellarium Web.
  - Compare rise/set/transit times and Moon phase fraction/illumination with U.S. Naval Observatory/Astronomy apps and Stellarium Web.
  - For constellations, verify line work and labels match d3-celestial output or VirtualSky for the same observer/time/FOV.

---

## 13. Performance & Optimization

### Memory Footprint (Corrected Estimate)
- Star field (2,000 brightest stars): ~80 KB
- Per body trail (1-year, 6h samples): ~24 KB (1,460 points Ã— 4 floats Ã— 4 bytes each)
- 7 major bodies: ~170 KB total trails
- Three.js LineBuffers & geometry overhead: ~1.5 MB
- **Total: ~2-3 MB with optimization** (including Three.js overhead and margin)
- Note: Original estimate of <200 KB was unrealistic; Three.js geometry buffers dominate memory usage

### Key Optimizations
- Reuse heliocentric positions via `HelioStateProvider` (no redundant Kepler solves)
- Cache coordinate transform matrices (compute once per observer, reuse for all bodies per frame)
- Batch trail rendering with shared LineBuffer
- Trail decimation strategy: hourly samples for daily view, 6-hourly for monthly, daily for yearly
- Lazy-load star dataset on first render
- Optional trail memory management: allow users to clear historical trails to free memory

---

## 14. Conclusion & Recommendation

### Phase 1: MVP (2-3 weeks, core achievable scope)

This proposal provides a complete, modular Earth sky simulation with **no Stellarium-parity features in critical path**:

**MVP Features:**
- Reuses existing heliocentric engine via `HelioStateProvider` adapter
- Handles any Earth location & time (observer presets + custom)
- Traces celestial paths (daily/monthly/yearly modes)
- Computes rise/set times (coarse Â±15 min approach, sufficient for visualization)
- Detects retrograde motion periods
- Static star field (2,000 brightest stars)
- Horizon/cardinal direction overlay
- Trail decimation by view mode

**MVP Implementation Timeline (10-15 working days):**
1. Bootstrap & architecture (1-2 days): HelioStateProvider integration, module structure
2. Coordinate transforms (2-3 days): heliocentricâ†’geocentricâ†’equatorialâ†’horizontal pipeline
3. Sky dome rendering (2-3 days): horizon, grid, cardinal directions, star sprites
4. Observer input & UI (2 days): presets, time picker, location input, basic controls
5. Trails & markers (2-3 days): body markers, trail rendering, decimation logic
6. Rise/set & validation (2-3 days): coarse sampling algorithm, cross-check vs Stellarium

**MVP Success Criteria:**
- âœ“ 60 FPS with trails enabled
- âœ“ Rise/set times within Â±15 minutes of Stellarium (no refraction)
- âœ“ Retrograde motion correctly detected and visualized
- âœ“ All 7 major bodies visible and tracked correctly
- âœ“ Observer preset locations (5+) preconfigured and validated
- âœ“ Trails work smoothly across daily/monthly/yearly modes
- âœ“ Manual cross-check vs Stellarium Web for current date passes
- âœ“ Memory footprint <5 MB including Three.js overhead

---

### Phase 2: Future Enhancements (1-2 weeks, optional, no MVP impact)

**Phase 2 Features (non-critical, deferred):**
- Atmospheric refraction toggle (optional accuracy improvement)
- Moon phase visualization (lunar terminator, percentage illumination)
- Precession/nutation corrections (long-term accuracy, 0.01 degree impact)
- Constellation lines & labels (visual context, requires constellation dataset)
- Topocentric parallax (Moon/planets, <1 degree improvement for most observers)
- UT1 time scale support (high-precision GST, requires Î”T table)
- Night mode & light adaptation (visual polish, no functional impact)

**Note:** These features provide marginal benefit for visualization use cases; reserved for Phase 2 based on user feedback priority.

---

With exact Earth latitude, longitude, elevation, and time input, Phase 1 delivers a physically accurate Earth sky simulation that traces the full apparent motion of planets across hours, days, months, and years, using your existing heliocentric engine without modification.

**This architecture is scalable, modular, and achieves MVP in 2-3 weeks with no Stellarium-parity scope creep.**


