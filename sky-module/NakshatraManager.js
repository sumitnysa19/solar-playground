/**
 * NakshatraManager.js
 * 
 * Renders all 28 nakshatras as constellation lines in 3D space
 * - Loads nakshatra data with star positions
 * - Converts RA/Dec to Alt/Az for observer
 * - Renders constellation line segments
 * - Supports visibility toggling per nakshatra
 */

import * as THREE from '../module.js';
import { NAKSHATRAS } from './Nakshatras.js';
import { CoordinateTransforms } from './CoordinateTransforms.js';

export class NakshatraManager {
    constructor(scene, radius = 1000) {
        this.scene = scene;
        this.radius = radius;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.nakshatras = [];
        this.starMeshes = new Map();  // nakshatra ID -> THREE.Points
        this.lineMeshes = new Map();  // nakshatra ID -> THREE.LineSegments
        this.visibility = new Map();  // nakshatra ID -> visible boolean
        this.labelMeshes = new Map(); // nakshatra ID -> THREE.Sprite

        this._initializeNakshatras();
    }

    /**
     * Initialize all 28 nakshatras with star positions and constellation lines
     */
    _initializeNakshatras() {
        NAKSHATRAS.forEach(nakshatra => {
            // Store nakshatra reference
            this.nakshatras.push(nakshatra);
            this.visibility.set(nakshatra.id, true);

            // Create star positions group
            const starGeometry = new THREE.BufferGeometry();
            const starPositions = [];
            
            // Add stars to geometry (will be updated in update() based on observer location)
            nakshatra.primaryStars.forEach(star => {
                // Placeholder position - will be updated in update()
                starPositions.push(0, 0, 0);
            });

            if (starPositions.length > 0) {
                starGeometry.setAttribute('position', 
                    new THREE.BufferAttribute(new Float32Array(starPositions), 3));

                const starMaterial = new THREE.PointsMaterial({
                    color: nakshatra.color,
                    size: 5,
                    sizeAttenuation: true
                });

                const starMesh = new THREE.Points(starGeometry, starMaterial);
                this.group.add(starMesh);
                this.starMeshes.set(nakshatra.id, starMesh);
            }

            // Create constellation lines
            if (nakshatra.lines && nakshatra.lines.length > 0) {
                const lineGeometry = new THREE.BufferGeometry();
                const linePositions = [];

                // Add line segments connecting stars
                nakshatra.lines.forEach(line => {
                    const [startIdx, endIdx] = line;
                    if (startIdx < nakshatra.primaryStars.length && endIdx < nakshatra.primaryStars.length) {
                        // Placeholder positions - will be updated in update()
                        linePositions.push(0, 0, 0, 0, 0, 0);
                    }
                });

                if (linePositions.length > 0) {
                    lineGeometry.setAttribute('position',
                        new THREE.BufferAttribute(new Float32Array(linePositions), 3));

                    const lineMaterial = new THREE.LineBasicMaterial({
                        color: nakshatra.color,
                        linewidth: 2
                    });

                    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
                    this.group.add(lineMesh);
                    this.lineMeshes.set(nakshatra.id, lineMesh);
                }
            }

            // Labels (one per nakshatra, placed at first visible star)
            const label = this._createLabel(nakshatra.name);
            label.visible = false;
            this.group.add(label);
            this.labelMeshes.set(nakshatra.id, label);
        });
    }

    /**
     * Update all nakshatra positions for current observer and time
     * @param {number} jd - Julian Date
     * @param {number} latitude - Observer latitude (degrees)
     * @param {number} longitude - Observer longitude (degrees)
     */
    update(jd, latitude, longitude) {
        const lat = (latitude * Math.PI) / 180;
        const lon = (longitude * Math.PI) / 180;
        const lst = CoordinateTransforms.localSiderealTime(jd, longitude);

        NAKSHATRAS.forEach(nakshatra => {
            // Update star positions
            if (this.starMeshes.has(nakshatra.id)) {
                const starMesh = this.starMeshes.get(nakshatra.id);
                const positions = starMesh.geometry.attributes.position.array;
                let labelPlaced = false;

                nakshatra.primaryStars.forEach((star, idx) => {
                    // Convert RA/Dec to Alt/Az
                    const raRad = star.ra * 15 * CoordinateTransforms.DEG_TO_RAD; // hours -> deg -> rad
                    const decRad = star.dec * CoordinateTransforms.DEG_TO_RAD;
                    const {alt, az} = CoordinateTransforms.raDecToAltAz(
                        raRad,
                        decRad,
                        lst,
                        latitude
                    );

                    // Only show if above horizon (altitude >= 0)
                    if (alt >= 0) {
                        const altRad = alt * CoordinateTransforms.DEG_TO_RAD;
                        const azRad = az * CoordinateTransforms.DEG_TO_RAD;

                        const cosAlt = Math.cos(altRad);
                        const sinAlt = Math.sin(altRad);

                        const x = this.radius * cosAlt * Math.cos(azRad);
                        const y = this.radius * sinAlt;
                        const z = this.radius * cosAlt * Math.sin(azRad);

                        positions[idx * 3 + 0] = x;
                        positions[idx * 3 + 1] = y;
                        positions[idx * 3 + 2] = z;

                        // Place label at first visible star
                        if (!labelPlaced && this.labelMeshes.has(nakshatra.id)) {
                            const label = this.labelMeshes.get(nakshatra.id);
                            label.position.set(x, y - 20, z);
                            label.visible = true;
                            labelPlaced = true;
                        }
                    } else {
                        // Star below horizon - move out of view
                        positions[idx * 3 + 0] = 0;
                        positions[idx * 3 + 1] = -this.radius;
                        positions[idx * 3 + 2] = 0;
                    }
                });

                starMesh.geometry.attributes.position.needsUpdate = true;

                // Hide label if no star was above horizon
                if (!labelPlaced && this.labelMeshes.has(nakshatra.id)) {
                    this.labelMeshes.get(nakshatra.id).visible = false;
                }
            }

            // Update constellation lines
            if (this.lineMeshes.has(nakshatra.id)) {
                const lineMesh = this.lineMeshes.get(nakshatra.id);
                const positions = lineMesh.geometry.attributes.position.array;
                let posIdx = 0;

                nakshatra.lines.forEach(line => {
                    const [startIdx, endIdx] = line;

                    // Start star
                    const startStar = nakshatra.primaryStars[startIdx];
                    const startAlt = this._getAltitude(startStar, lst, latitude);
                    const [sx, sy, sz] = this._raDecToXyz(startStar, lst, latitude);

                    // End star
                    const endStar = nakshatra.primaryStars[endIdx];
                    const endAlt = this._getAltitude(endStar, lst, latitude);
                    const [ex, ey, ez] = this._raDecToXyz(endStar, lst, latitude);

                    // Only show line if both endpoints above horizon
                    if (startAlt >= 0 && endAlt >= 0) {
                        positions[posIdx * 3 + 0] = sx;
                        positions[posIdx * 3 + 1] = sy;
                        positions[posIdx * 3 + 2] = sz;
                        posIdx++;

                        positions[posIdx * 3 + 0] = ex;
                        positions[posIdx * 3 + 1] = ey;
                        positions[posIdx * 3 + 2] = ez;
                        posIdx++;
                    } else {
                        // Line below horizon - move out of view
                        positions[posIdx * 3 + 0] = 0;
                        positions[posIdx * 3 + 1] = -this.radius;
                        positions[posIdx * 3 + 2] = 0;
                        posIdx++;

                        positions[posIdx * 3 + 0] = 0;
                        positions[posIdx * 3 + 1] = -this.radius;
                        positions[posIdx * 3 + 2] = 0;
                        posIdx++;
                    }
                });

                lineMesh.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    /**
     * Helper: Convert RA/Dec to XYZ on dome
     */
    _raDecToXyz(star, lst, latitude) {
        const raRad = star.ra * 15 * CoordinateTransforms.DEG_TO_RAD;
        const decRad = star.dec * CoordinateTransforms.DEG_TO_RAD;
        const {alt, az} = CoordinateTransforms.raDecToAltAz(
            raRad,
            decRad,
            lst,
            latitude
        );

        const altRad = alt * CoordinateTransforms.DEG_TO_RAD;
        const azRad = az * CoordinateTransforms.DEG_TO_RAD;

        const cosAlt = Math.cos(altRad);
        const sinAlt = Math.sin(altRad);

        const x = this.radius * cosAlt * Math.cos(azRad);
        const y = this.radius * sinAlt;
        const z = this.radius * cosAlt * Math.sin(azRad);

        return [x, y, z];
    }

    /**
     * Helper: Get altitude of a star
     */
    _getAltitude(star, lst, latitude) {
        const raRad = star.ra * 15 * CoordinateTransforms.DEG_TO_RAD;
        const decRad = star.dec * CoordinateTransforms.DEG_TO_RAD;
        const {alt} = CoordinateTransforms.raDecToAltAz(
            raRad,
            decRad,
            lst,
            latitude
        );
        return alt;
    }

    /**
     * Toggle visibility of a single nakshatra
     */
    setNakshatraVisible(nakshatraId, visible) {
        this.visibility.set(nakshatraId, visible);

        if (this.starMeshes.has(nakshatraId)) {
            this.starMeshes.get(nakshatraId).visible = visible;
        }
        if (this.lineMeshes.has(nakshatraId)) {
            this.lineMeshes.get(nakshatraId).visible = visible;
        }
    }

    /**
     * Toggle visibility of all nakshatras
     */
    setAllVisible(visible) {
        for (let i = 1; i <= 28; i++) {
            this.setNakshatraVisible(i, visible);
        }
    }

    /**
     * Get nakshatra by ID or name
     */
    getNakshatra(idOrName) {
        if (typeof idOrName === 'number') {
            return NAKSHATRAS.find(n => n.id === idOrName);
        } else {
            return NAKSHATRAS.find(n => n.name.toLowerCase() === idOrName.toLowerCase());
        }
    }

    /**
     * Get all nakshatras
     */
    getAllNakshatras() {
        return NAKSHATRAS;
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.starMeshes.forEach(mesh => {
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) mesh.material.dispose();
        });
        this.lineMeshes.forEach(mesh => {
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) mesh.material.dispose();
        });
        this.labelMeshes.forEach(label => {
            if (label.material && label.material.map) label.material.map.dispose();
            if (label.material) label.material.dispose();
        });
        this.group.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
        this.scene.remove(this.group);
    }

    /**
     * Create canvas-based label sprite
     */
    _createLabel(text) {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, size, size);
        ctx.font = '32px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.fillStyle = '#ffffff';
        ctx.strokeText(text, size / 2, size / 2);
        ctx.fillText(text, size / 2, size / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(140, 60, 1); // readable size
        return sprite;
    }
}

export default NakshatraManager;
