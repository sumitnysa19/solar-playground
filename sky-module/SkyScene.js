/**
 * SkyScene.js
 * 
 * Core orchestration for sky visualization
 * - Manages independent Three.js scene (separate from planetesimal.html)
 * - Integrates all modules: SkyDome, Bodies, Trails, Nakshatras
 * - Animation loop and time updates
 * - Observer location management
 * - Memory-efficient rendering (<5 MB target)
 */

import * as THREE from '../module.js';
import { SkyDome } from './SkyDome.js';
import { HelioStateProvider } from './HelioStateProvider.js';
import { CoordinateTransforms } from './CoordinateTransforms.js';
import { NakshatraManager } from './NakshatraManager.js';
import { TrailManager } from './TrailManager.js';
import { RiseSetCalculator } from './RiseSetCalculator.js';
import { OrbitControls } from 'https://unpkg.com/three@0.118.3/examples/jsm/controls/OrbitControls.js';

export class SkyScene {
    constructor(canvasElement, width = 1024, height = 1024) {
        this.canvas = canvasElement;
        this.width = width;
        this.height = height;

        // State
        this.jd = this._getCurrentJulianDate();
        this.latitude = 28.6139;   // Default: Delhi, India
        this.longitude = 77.2090;
        this.isAnimating = false;
        this.animationSpeed = 1;   // x1 real time
        this.lastFrameTime = Date.now();

        // Initialize Three.js
        this._initScene();
        this.provider = HelioStateProvider.getInstance();
        this.riseSetCalc = new RiseSetCalculator();

        // Initialize modules
        this.skyDome = new SkyDome(this.scene, 1000);
        this.nakshatraManager = new NakshatraManager(this.scene, 1000);
        this.trailManager = new TrailManager(this.scene, 1000);
        
        // Initialize bodies
        this._initBodies();

        // Start animation loop
        this._animate();
    }

    /**
     * Initialize Three.js scene, camera, renderer
     */
    _initScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        this.scene.fog = null;  // No fog in space

        // Camera: Observer looking at sky
        // Up vector is "local vertical" at observer location
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.width / this.height,
            0.1,
            5000
        );
        this.camera.position.set(0, 0, 5);
        this.camera.up.set(0, 1, 0);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            preserveDrawingBuffer: true
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.sortObjects = false;  // Optimize sorting

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enablePan = true;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 1500;
    }

    /**
     * Initialize celestial body geometry and materials
     */
    _initBodies() {
        this.bodies = new Map();
        const bodyData = [
            {name: 'Sun', color: 0xffff00, size: 20},
            {name: 'Moon', color: 0xdddddd, size: 10},
            {name: 'Mercury', color: 0x888888, size: 6},
            {name: 'Venus', color: 0xffee88, size: 10},
            {name: 'Mars', color: 0xff6644, size: 8},
            {name: 'Jupiter', color: 0xcc8844, size: 14},
            {name: 'Saturn', color: 0xffdd99, size: 12},
            {name: 'Rahu', color: 0x9966ff, size: 6},
            {name: 'Ketu', color: 0xff99cc, size: 6}
        ];

        bodyData.forEach(data => {
            const geometry = new THREE.SphereGeometry(data.size, 16, 16);
            const material = new THREE.MeshBasicMaterial({color: data.color});
            const sphere = new THREE.Mesh(geometry, material);
            sphere.name = `body_${data.name}`;
            this.scene.add(sphere);

            // Label sprite
            const label = this._createLabel(data.name, data.color);
            label.visible = false;
            this.scene.add(label);

            this.bodies.set(data.name, {
                mesh: sphere,
                label,
                color: data.color,
                size: data.size,
                altitude: -90,  // Below horizon initially
                azimuth: 0
            });
        });
    }

    /**
     * Update all scene elements for current time
     */
    update() {
        const lat = this.latitude;
        const lon = this.longitude;
        const lst = CoordinateTransforms.localSiderealTime(this.jd, lon);

        // Update bodies
        this.bodies.forEach((bodyData, bodyName) => {
            const bodyState = this.provider.getBodyState(bodyName, this.jd);
            const earthState = this.provider.getBodyState('Earth', this.jd);

            if (bodyState && earthState) {
                // Geocentric position
                const geocentricEcl = {
                    x: bodyState.posEcliptic.x - earthState.posEcliptic.x,
                    y: bodyState.posEcliptic.y - earthState.posEcliptic.y,
                    z: bodyState.posEcliptic.z - earthState.posEcliptic.z
                };

                // Transform to equatorial
                const geocentricEqu = CoordinateTransforms.eclipticToEquatorial(geocentricEcl);

                // Get RA/Dec
                const {ra, dec} = CoordinateTransforms.cartesianToRaDec(geocentricEqu);

                // Transform to Alt/Az (degrees)
                const {alt, az} = CoordinateTransforms.raDecToAltAz(ra, dec, lst, lat);

                // Store for display
                bodyData.altitude = alt;
                bodyData.azimuth = az;

                // Position on dome if above horizon
                if (alt >= 0) {
                    const altRad = alt * CoordinateTransforms.DEG_TO_RAD;
                    const azRad = az * CoordinateTransforms.DEG_TO_RAD;

                    const cosAlt = Math.cos(altRad);
                    const sinAlt = Math.sin(altRad);
                    const radius = 1000;

                    bodyData.mesh.position.x = radius * cosAlt * Math.cos(azRad);
                    bodyData.mesh.position.y = radius * sinAlt;
                    bodyData.mesh.position.z = radius * cosAlt * Math.sin(azRad);
                    bodyData.mesh.visible = true;
                    if (bodyData.label) {
                        bodyData.label.position.copy(bodyData.mesh.position);
                        bodyData.label.position.y -= 20; // place label slightly below marker
                        bodyData.label.visible = true;
                    }
                } else {
                    bodyData.mesh.visible = false;
                    if (bodyData.label) bodyData.label.visible = false;
                }
            }
        });

        // Update nakshatras
        this.nakshatraManager.update(this.jd, lat, lon);

        // Add trail samples for all bodies
        this.bodies.forEach((bodyData, bodyName) => {
            this.trailManager.addSample(bodyName, this.jd, lat, lon);
        });
    }

    /**
     * Animation loop
     */
    _animate = () => {
        requestAnimationFrame(this._animate);

        // Update time if animating
        if (this.isAnimating) {
            const now = Date.now();
            const deltaMs = now - this.lastFrameTime;
            const deltaDays = (deltaMs / 1000 / 60 / 60 / 24) * this.animationSpeed;
            this.jd += deltaDays;
            this.lastFrameTime = now;
        }

        // Update scene
        this.update();

        // Render
        if (this.controls) {
            this.controls.update();
        }
        this.renderer.render(this.scene, this.camera);
    };

    /**
     * Play/pause animation
     */
    setAnimating(animate) {
        this.isAnimating = animate;
        this.lastFrameTime = Date.now();
    }

    /**
     * Set animation speed (1 = real-time, 24 = 1 day per second, etc)
     */
    setAnimationSpeed(speed) {
        this.animationSpeed = speed;
    }

    /**
     * Set current Julian Date
     */
    setJulianDate(jd) {
        this.jd = jd;
    }

    /**
     * Jump to specific date/time (ISO string or Julian Date)
     */
    goToDate(dateOrJd) {
        if (typeof dateOrJd === 'string') {
            // ISO string: "2024-01-15T12:30:00Z"
            const date = new Date(dateOrJd);
            this.jd = this._dateToJulianDate(date);
        } else {
            this.jd = dateOrJd;
        }
    }

    /**
     * Set observer location
     */
    setObserverLocation(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    /**
     * Get current observer info
     */
    getObserverInfo() {
        return {
            latitude: this.latitude,
            longitude: this.longitude,
            jd: this.jd,
            isAnimating: this.isAnimating,
            animationSpeed: this.animationSpeed
        };
    }

    /**
     * Get body information
     */
    getBodyInfo(bodyName) {
        if (this.bodies.has(bodyName)) {
            return this.bodies.get(bodyName);
        }
        return null;
    }

    /**
     * Get all bodies info
     */
    getAllBodies() {
        const info = {};
        this.bodies.forEach((data, name) => {
            info[name] = {
                altitude: data.altitude,
                azimuth: data.azimuth,
                visible: data.mesh.visible
            };
        });
        return info;
    }

    /**
     * Get rise/set times for all bodies
     */
    getRiseSetTimes() {
        return this.riseSetCalc.calculateAllBodies(this.jd, this.latitude, this.longitude);
    }

    /**
     * Toggle nakshatra visibility
     */
    setNakshatrasVisible(visible) {
        this.nakshatraManager.setAllVisible(visible);
    }

    /**
     * Toggle trails visibility
     */
    setTrailsVisible(visible) {
        this.trailManager.setAllVisible(visible);
    }

    /**
     * Clear trails
     */
    clearTrails() {
        this.trailManager.clearTrails();
    }

    /**
     * Get memory usage stats
     */
    getMemoryStats() {
        return {
            trails: this.trailManager.getTrailStats(),
            trailsMemoryKb: this.trailManager.getMemoryFootprint() / 1024
        };
    }

    /**
     * Handle window resize
     */
    onWindowResize(width, height) {
        this.width = width;
        this.height = height;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    /**
     * Get current Julian Date
     */
    _getCurrentJulianDate() {
        const now = new Date();
        return this._dateToJulianDate(now);
    }

    /**
     * Convert Date to Julian Date
     */
    _dateToJulianDate(date) {
        const a = Math.floor((14 - (date.getUTCMonth() + 1)) / 12);
        const y = date.getUTCFullYear() + 4800 - a;
        const m = (date.getUTCMonth() + 1) + 12 * a - 3;

        const jdn = date.getUTCDate() + 
                    Math.floor((153 * m + 2) / 5) + 
                    365 * y + 
                    Math.floor(y / 4) - 
                    Math.floor(y / 100) + 
                    Math.floor(y / 400) - 
                    32045;

        const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
        const jd = jdn + (hours / 24) - 0.5;

        return jd;
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.skyDome.dispose();
        this.nakshatraManager.dispose();
        this.trailManager.dispose();
        
        this.bodies.forEach(bodyData => {
            bodyData.mesh.geometry.dispose();
            bodyData.mesh.material.dispose();
            if (bodyData.label) {
                if (bodyData.label.material && bodyData.label.material.map) {
                    bodyData.label.material.map.dispose();
                }
                if (bodyData.label.material) bodyData.label.material.dispose();
            }
        });

        this.renderer.dispose();
    }

    /**
     * Create a canvas-based label sprite for a body
     */
    _createLabel(text, color = 0xffffff) {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, size, size);
        ctx.font = '36px monospace';
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
        // Double the label size
        sprite.scale.set(160, 80, 1);
        return sprite;
    }
}

export default SkyScene;
