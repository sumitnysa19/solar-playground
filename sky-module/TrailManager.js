/**
 * TrailManager.js
 * 
 * Manages daily trails for all 7 celestial bodies
 * - 6-hour coarse sampling (4 points per day)
 * - Ring buffer storage for memory efficiency
 * - Per-body color rendering
 * - Day mode only (sunrise to sunset coarse approximation)
 */

import * as THREE from '../module.js';
import { HelioStateProvider } from './HelioStateProvider.js';
import { CoordinateTransforms } from './CoordinateTransforms.js';

export class TrailManager {
    constructor(scene, radius = 1000) {
        this.scene = scene;
        this.radius = radius;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.provider = HelioStateProvider.getInstance();
        
        // Body trails: bodyId -> {positions: [], lineMesh, maxPoints}
        this.trails = new Map();
        this.bodyColors = {
            'Sun': 0xffff00,
            'Moon': 0xdddddd,
            'Mercury': 0x888888,
            'Venus': 0xffee88,
            'Mars': 0xff6644,
            'Jupiter': 0xcc8844,
            'Saturn': 0xffdd99,
            'Rahu': 0x9966ff,
            'Ketu': 0xff99cc
        };

        this.maxTrailPoints = 200;  // 6-hour sampling × 4 per day × ~30 days = ~480 points
                                   // But cap per-body at 16 to save memory (~1 KB per body)
        
        this._initializeTrails();
    }

    /**
     * Initialize trail data structures for all 7 bodies
     */
    _initializeTrails() {
        const bodies = [
            'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'
        ];

        bodies.forEach(bodyName => {
            const geometry = new THREE.BufferGeometry();
            
            // Pre-allocate positions buffer
            const positions = new Float32Array(this.maxTrailPoints * 3);
            positions.fill(0);

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            // Only draw actual points used, not pre-allocated space
            geometry.setDrawRange(0, 0);

            const material = new THREE.LineBasicMaterial({
                color: this.bodyColors[bodyName] || 0xffffff,
                linewidth: 2
            });

            const lineMesh = new THREE.Line(geometry, material);
            lineMesh.name = `trail_${bodyName}`;
            this.group.add(lineMesh);

            this.trails.set(bodyName, {
                positions: [],       // Actual position list for ring buffer
                lineMesh: lineMesh,
                pointCount: 0,       // Current number of points in buffer
                lastJd: null,        // Track last added position time
                lastAlt: null        // Track last altitude for continuity
            });
        });
    }

    /**
     * Add a position sample for a body at current time
     * Samples at 6-hour intervals for coarse daily trails
     * 
     * @param {string} bodyName - Body name
     * @param {number} jd - Julian Date
     * @param {number} latitude - Observer latitude (degrees)
     * @param {number} longitude - Observer longitude (degrees)
     */
    addSample(bodyName, jd, latitude, longitude) {
        if (!this.trails.has(bodyName)) return;

        const trail = this.trails.get(bodyName);

        // Check if enough time has passed (6 hours = 0.25 days)
        const minIntervalDays = 0.01; // ~14.4 minutes for smoother trails
        if (trail.lastJd !== null && (jd - trail.lastJd) < minIntervalDays) {
            return;  // Too soon, skip sample
        }

        // Get body position
        const bodyState = this.provider.getBodyState(bodyName, jd);
        if (!bodyState) return;

        // Get Earth position
        const earthState = this.provider.getBodyState('Earth', jd);
        if (!earthState) return;

        // Transform to alt/az
        const lst = CoordinateTransforms.localSiderealTime(jd, longitude);

        // Geocentric position
        const geocentricEcl = {
            x: bodyState.posEcliptic.x - earthState.posEcliptic.x,
            y: bodyState.posEcliptic.y - earthState.posEcliptic.y,
            z: bodyState.posEcliptic.z - earthState.posEcliptic.z
        };

        // Ecliptic to Equatorial
        const geocentricEqu = CoordinateTransforms.eclipticToEquatorial(geocentricEcl);

        // Cartesian to RA/Dec
        const {ra, dec, distance} = CoordinateTransforms.cartesianToRaDec(geocentricEqu);

        // RA/Dec to Alt/Az
        const {alt, az} = CoordinateTransforms.raDecToAltAz(ra, dec, lst, latitude);

        // Only add if above horizon
        if (alt < 0) {
            trail.lastAlt = null;  // Reset continuity
            return;
        }

        // Convert to 3D position on sphere
        const altRad = alt * CoordinateTransforms.DEG_TO_RAD;
        const azRad = az * CoordinateTransforms.DEG_TO_RAD;

        const cosAlt = Math.cos(altRad);
        const sinAlt = Math.sin(altRad);

        const x = this.radius * cosAlt * Math.cos(azRad);
        const y = this.radius * sinAlt;
        const z = this.radius * cosAlt * Math.sin(azRad);

        // Ring buffer: keep only last maxTrailPoints
        trail.positions.push({x, y, z, jd, alt});
        if (trail.positions.length > this.maxTrailPoints) {
            trail.positions.shift();
        }

        trail.lastJd = jd;
        trail.lastAlt = alt;

        // Update geometry
        this._updateTrailGeometry(bodyName);
    }

    /**
     * Update trail geometry from positions array
     */
    _updateTrailGeometry(bodyName) {
        const trail = this.trails.get(bodyName);
        if (!trail) return;

        const geometry = trail.lineMesh.geometry;
        const positions = geometry.attributes.position.array;

        // Fill buffer with current positions
        for (let i = 0; i < trail.positions.length; i++) {
            const pos = trail.positions[i];
            positions[i * 3 + 0] = pos.x;
            positions[i * 3 + 1] = pos.y;
            positions[i * 3 + 2] = pos.z;
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.setDrawRange(0, Math.max(0, trail.positions.length));
    }

    /**
     * Clear all trails
     */
    clearTrails() {
        this.trails.forEach((trail, bodyName) => {
            trail.positions = [];
            trail.pointCount = 0;
            trail.lastJd = null;
            trail.lastAlt = null;
            this._updateTrailGeometry(bodyName);
        });
    }

    /**
     * Clear trail for specific body
     */
    clearTrail(bodyName) {
        if (!this.trails.has(bodyName)) return;

        const trail = this.trails.get(bodyName);
        trail.positions = [];
        trail.pointCount = 0;
        trail.lastJd = null;
        trail.lastAlt = null;
        this._updateTrailGeometry(bodyName);
    }

    /**
     * Set trail visibility
     */
    setVisible(bodyName, visible) {
        if (this.trails.has(bodyName)) {
            this.trails.get(bodyName).lineMesh.visible = visible;
        }
    }

    /**
     * Set all trails visible/invisible
     */
    setAllVisible(visible) {
        this.trails.forEach((trail) => {
            trail.lineMesh.visible = visible;
        });
    }

    /**
     * Get trail statistics for debugging
     */
    getTrailStats() {
        const stats = {};
        this.trails.forEach((trail, bodyName) => {
            stats[bodyName] = {
                points: trail.positions.length,
                maxPoints: this.maxTrailPoints,
                lastJd: trail.lastJd,
                memoryBytes: trail.positions.length * 20  // ~20 bytes per position
            };
        });
        return stats;
    }

    /**
     * Get memory footprint of all trails
     */
    getMemoryFootprint() {
        let total = 0;
        this.trails.forEach((trail) => {
            total += trail.positions.length * 20;  // x, y, z, jd, alt floats
        });
        return total;
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.trails.forEach(trail => {
            if (trail.lineMesh.geometry) trail.lineMesh.geometry.dispose();
            if (trail.lineMesh.material) trail.lineMesh.material.dispose();
        });
        this.group.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
        this.scene.remove(this.group);
    }
}

export default TrailManager;
