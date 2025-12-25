/**
 * SkyDome.js
 * 
 * Creates sky dome geometry with:
 * - Inverted hemisphere for star/constellation projection
 * - Horizon line at altitude = 0°
 * - Cardinal direction markers (N, E, S, W)
 * - Optional meridian grid
 */

import * as THREE from '../module.js';

export class SkyDome {
    constructor(scene, radius = 1000) {
        this.scene = scene;
        this.radius = radius;
        this.group = new THREE.Group();
        this.scene.add(this.group);
        
        this._createDomeGeometry();
        this._createHorizonLine();
        this._createCardinalDirections();
        this._createMeridianGrid();
    }

    /**
     * Create inverted hemisphere for projecting stars and constellations
     */
    _createDomeGeometry() {
        // Inverted hemisphere: geometry from top to horizon
        // Sky dome shows stars above observer, so invert normals
        const geometry = new THREE.SphereGeometry(
            this.radius,
            64,              // segments
            64,
            0,               // phiStart (0 = full circle)
            Math.PI * 2,     // phiLength
            0,               // thetaStart (0 = north pole)
            Math.PI * 0.5    // thetaLength (0.5 = hemisphere only)
        );

        // Invert normals so we see inside
        geometry.scale(-1, 1, 1);

        // Material: dark background with minimal lighting
        const material = new THREE.MeshBasicMaterial({
            color: 0x000011,  // Dark blue-black night sky
            side: THREE.BackSide,
            fog: false
        });

        const dome = new THREE.Mesh(geometry, material);
        this.group.add(dome);
        this.dome = dome;
    }

    /**
     * Create horizon line at altitude = 0°
     */
    _createHorizonLine() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];

        // Create circle at horizon (altitude = 0)
        // In alt/az coords: altitude = 0 means horizon plane
        // At radius distance from observer
        const segmentsHorizon = 128;
        for (let i = 0; i <= segmentsHorizon; i++) {
            const azimuth = (i / segmentsHorizon) * Math.PI * 2;
            const x = this.radius * Math.cos(azimuth);
            const z = this.radius * Math.sin(azimuth);
            positions.push(x, 0, z);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));

        const material = new THREE.LineBasicMaterial({
            color: 0x444466,  // Dark purple-gray
            linewidth: 2
        });

        const line = new THREE.Line(geometry, material);
        this.group.add(line);
        this.horizonLine = line;
    }

    /**
     * Create cardinal direction markers (N, E, S, W) with labels
     */
    _createCardinalDirections() {
        this.cardinalMarkers = {};
        const cardinals = [
            { name: 'N', azimuth: 0, color: 0xff4444 },       // North (red)
            { name: 'E', azimuth: Math.PI / 2, color: 0x44ff44 }, // East (green)
            { name: 'S', azimuth: Math.PI, color: 0x4444ff },     // South (blue)
            { name: 'W', azimuth: 3 * Math.PI / 2, color: 0xffff44 } // West (yellow)
        ];

        cardinals.forEach(cardinal => {
            // Small line above horizon at cardinal point
            const offsetAlt = 5; // degrees above horizon
            const altRad = (offsetAlt * Math.PI) / 180;
            const cosAlt = Math.cos(altRad);
            const sinAlt = Math.sin(altRad);

            const x = this.radius * cosAlt * Math.cos(cardinal.azimuth);
            const y = this.radius * sinAlt;
            const z = this.radius * cosAlt * Math.sin(cardinal.azimuth);

            // Vertical line marker
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array([
                x, 0, z,                    // Base on horizon
                x, y, z                     // Top of marker
            ]);
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const material = new THREE.LineBasicMaterial({ color: cardinal.color });
            const line = new THREE.Line(geometry, material);
            this.group.add(line);

            // Text label (optional - stored for potential canvas overlay)
            this.cardinalMarkers[cardinal.name] = {
                position: new THREE.Vector3(x, y, z),
                color: cardinal.color
            };
        });
    }

    /**
     * Create optional meridian grid (altitude/azimuth grid lines)
     */
    _createMeridianGrid() {
        const material = new THREE.LineBasicMaterial({
            color: 0x333344,
            linewidth: 1
        });

        // Altitude lines (0°, 15°, 30°, 45°, 60°, 75°, 90°)
        const altitudeLines = [0, 15, 30, 45, 60, 75];
        altitudeLines.forEach(alt => {
            if (alt === 0) return; // Skip horizon, already drawn
            
            const altRad = (alt * Math.PI) / 180;
            const cosAlt = Math.cos(altRad);
            const sinAlt = Math.sin(altRad);

            const positions = [];
            const segments = 64;
            for (let i = 0; i <= segments; i++) {
                const azRad = (i / segments) * Math.PI * 2;
                const x = this.radius * cosAlt * Math.cos(azRad);
                const y = this.radius * sinAlt;
                const z = this.radius * cosAlt * Math.sin(azRad);
                positions.push(x, y, z);
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            const line = new THREE.Line(geometry, material);
            this.group.add(line);
        });

        // Azimuth lines (every 15°)
        const azimuths = [];
        for (let i = 0; i < 24; i++) {
            azimuths.push((i * 15 * Math.PI) / 180);
        }

        azimuths.forEach(az => {
            const positions = [];
            for (let alt = 0; alt <= 90; alt += 5) {
                const altRad = (alt * Math.PI) / 180;
                const cosAlt = Math.cos(altRad);
                const sinAlt = Math.sin(altRad);

                const x = this.radius * cosAlt * Math.cos(az);
                const y = this.radius * sinAlt;
                const z = this.radius * cosAlt * Math.sin(az);
                positions.push(x, y, z);
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            const line = new THREE.Line(geometry, material);
            this.group.add(line);
        });
    }

    /**
     * Update dome visibility
     */
    setVisible(visible) {
        this.group.visible = visible;
    }

    /**
     * Get cardinal positions for label rendering
     */
    getCardinalPositions() {
        return this.cardinalMarkers;
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.group.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
        this.scene.remove(this.group);
    }
}

export default SkyDome;
