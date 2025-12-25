/**
 * SkyControls.js
 * 
 * Minimal UI controls for sky visualization
 * - Time slider (±30 days from today)
 * - Play/pause animation
 * - Observer preset dropdown (major cities)
 * - Toggle nakshatras/trails
 * - Display current time and body info
 */

export class SkyControls {
    constructor(scene, containerId) {
        this.scene = scene;
        this.container = document.getElementById(containerId) || document.body;
        this.observers = {
            'Delhi, India': {lat: 28.6139, lon: 77.2090},
            'Mumbai, India': {lat: 19.0760, lon: 72.8777},
            'Bangalore, India': {lat: 12.9716, lon: 77.5946},
            'London, UK': {lat: 51.5074, lon: -0.1278},
            'New York, USA': {lat: 40.7128, lon: -74.0060},
            'Tokyo, Japan': {lat: 35.6762, lon: 139.6503},
            'Sydney, Australia': {lat: -33.8688, lon: 151.2093}
        };

        this._createUI();
        this._bindEvents();
    }

    /**
     * Create HTML UI elements
     */
    _createUI() {
        const panel = document.createElement('div');
        panel.id = 'sky-controls-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 320px;
            background: rgba(20, 20, 40, 0.95);
            border: 2px solid #4488ff;
            border-radius: 8px;
            padding: 16px;
            font-family: monospace;
            font-size: 12px;
            color: #88ddff;
            z-index: 1000;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 0 20px rgba(68, 136, 255, 0.3);
        `;

        panel.innerHTML = `
            <div style="margin-bottom: 14px;">
                <strong style="color: #ffff88;">SKY VIEW CONTROLS</strong>
            </div>

            <!-- Time Display -->
            <div style="margin-bottom: 12px; padding: 10px; background: rgba(68, 136, 255, 0.1); border-radius: 4px;">
                <div>Date/Time: <span id="current-time" style="color: #ffff88;">Loading...</span></div>
                <div>JD: <span id="current-jd" style="color: #88ff88;">0.0000</span></div>
                <div>Observer: <span id="observer-name" style="color: #ff88ff;">Delhi</span></div>
            </div>

            <!-- Time Slider -->
            <div style="margin-bottom: 12px;">
                <label style="color: #88ddff;">Date (±30 days):</label><br/>
                <input type="range" id="time-slider" min="-30" max="30" value="0" 
                    style="width: 100%; cursor: pointer;" />
                <div style="font-size: 11px; color: #88cc88;">
                    <span id="slider-info">Today</span>
                </div>
            </div>

            <!-- Jump to UTC -->
            <div style="margin-bottom: 12px;">
                <label style="color: #88ddff;">Jump to UTC:</label><br/>
                <input type="text" id="datetime-input" placeholder="YYYY-MM-DDTHH:MM:SSZ" style="
                    width: 100%;
                    padding: 6px;
                    background: #111133;
                    color: #88ddff;
                    border: 1px solid #4488ff;
                    border-radius: 4px;
                    font-size: 11px;
                    box-sizing: border-box;
                    margin-top: 4px;
                    " />
                <button id="datetime-apply" style="
                    width: 100%;
                    margin-top: 6px;
                    padding: 6px;
                    background: #3355aa;
                    color: white;
                    border: 1px solid #88aaff;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                ">Go to UTC</button>
            </div>

            <!-- Play/Pause -->
            <div style="margin-bottom: 12px;">
                <button id="play-pause-btn" style="
                    width: 48%;
                    padding: 8px;
                    margin-right: 4%;
                    background: #44aa44;
                    color: white;
                    border: 1px solid #88ff88;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                ">▶ Play</button>
                <select id="speed-select" style="
                    width: 48%;
                    padding: 6px;
                    background: #222244;
                    color: #88ddff;
                    border: 1px solid #4488ff;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                ">
                    <option value="1">1x (real time)</option>
                    <option value="60">1 minute / sec</option>
                    <option value="3600">1 hour / sec</option>
                    <option value="86400">1 day / sec</option>
                    <option value="604800">1 week / sec</option>
                    <option value="2628000">1 month / sec</option>
                    <option value="31557600">1 year / sec</option>
                </select>
            </div>

            <!-- Observer Location -->
            <div style="margin-bottom: 12px;">
                <label style="color: #88ddff;">Observer:</label><br/>
                <select id="observer-select" style="
                    width: 100%;
                    padding: 6px;
                    background: #222244;
                    color: #88ddff;
                    border: 1px solid #4488ff;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                    margin-top: 4px;
                ">
                </select>
            </div>

            <!-- Toggles -->
            <div style="margin-bottom: 12px;">
                <label style="color: #88ddff;">
                    <input type="checkbox" id="nakshatras-toggle" checked />
                    Nakshatras (28)
                </label><br/>
                <label style="color: #88ddff;">
                    <input type="checkbox" id="trails-toggle" checked />
                    Daily Trails
                </label><br/>
                <label style="color: #88ddff;">
                    <input type="checkbox" id="grid-toggle" checked />
                    Alt/Az Grid
                </label>
            </div>

            <!-- Body Info -->
            <div style="margin-bottom: 12px; padding: 10px; background: rgba(68, 136, 255, 0.1); border-radius: 4px;">
                <div style="color: #ffff88; margin-bottom: 6px;">RISE/SET TODAY</div>
                <div id="riseset-info" style="font-size: 11px; line-height: 1.4;">
                    Loading...
                </div>
            </div>

            <!-- Body positions (Alt/Az) -->
            <div style="margin-bottom: 12px; padding: 10px; background: rgba(68, 136, 255, 0.1); border-radius: 4px;">
                <div style="color: #ffff88; margin-bottom: 6px;">BODY POSITIONS (Alt/Az)</div>
                <div id="body-info" style="font-size: 11px; line-height: 1.4;">
                    Loading...
                </div>
            </div>

            <!-- Memory Stats -->
            <div style="margin-bottom: 12px; padding: 10px; background: rgba(68, 136, 255, 0.1); border-radius: 4px;">
                <div style="color: #88ff88; font-size: 11px;">
                    Memory: <span id="memory-usage">0 KB</span>
                </div>
            </div>

            <!-- Buttons -->
            <div style="margin-bottom: 12px;">
                <button id="clear-trails-btn" style="
                    width: 100%;
                    padding: 8px;
                    background: #aa4444;
                    color: white;
                    border: 1px solid #ff8888;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    margin-bottom: 6px;
                ">Clear Trails</button>
            </div>

            <div style="font-size: 10px; color: #666688; border-top: 1px solid #4488ff; padding-top: 10px;">
                <strong>7 Bodies:</strong> Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn<br/>
                <strong>28 Nakshatras:</strong> Indian zodiacal constellations<br/>
                <strong>Sampling:</strong> 6-hour trails, 15-min rise/set
            </div>
        `;

        this.container.appendChild(panel);

        // Store element references
        this.currentTimeEl = document.getElementById('current-time');
        this.currentJdEl = document.getElementById('current-jd');
        this.observerNameEl = document.getElementById('observer-name');
        this.timeSlider = document.getElementById('time-slider');
        this.sliderInfo = document.getElementById('slider-info');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.speedSelect = document.getElementById('speed-select');
        this.observerSelect = document.getElementById('observer-select');
        this.nakshatrasToggle = document.getElementById('nakshatras-toggle');
        this.trailsToggle = document.getElementById('trails-toggle');
        this.gridToggle = document.getElementById('grid-toggle');
        this.risesetInfo = document.getElementById('riseset-info');
        this.memoryUsage = document.getElementById('memory-usage');
        this.clearTrailsBtn = document.getElementById('clear-trails-btn');
        this.bodyInfoEl = document.getElementById('body-info');
        this.datetimeInput = document.getElementById('datetime-input');
        this.datetimeApply = document.getElementById('datetime-apply');

        // Populate observer dropdown
        Object.keys(this.observers).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            this.observerSelect.appendChild(option);
        });

        this.observerSelect.value = 'Delhi, India';
    }

    /**
     * Bind UI event listeners
     */
    _bindEvents() {
        // Time slider
        this.timeSlider.addEventListener('input', (e) => {
            const offset = parseInt(e.target.value);
            const now = new Date();
            const date = new Date(now.getTime() + offset * 24 * 3600 * 1000);
            this.scene.goToDate(date);
            
            const labels = {
                '0': 'Today',
                '-1': 'Yesterday',
                '1': 'Tomorrow'
            };
            this.sliderInfo.textContent = labels[offset] || date.toLocaleDateString();
            this._updateDisplay();
        });

        // Jump to UTC date/time
        this.datetimeApply.addEventListener('click', () => {
            const val = this.datetimeInput.value.trim();
            if (!val) return;
            try {
                this.scene.goToDate(val);
                this.timeSlider.value = 0; // reset relative slider
                this.sliderInfo.textContent = 'Custom UTC';
                this._updateDisplay();
            } catch (err) {
                console.error('Invalid date format, expected YYYY-MM-DDTHH:MM:SSZ', err);
            }
        });

        // Play/Pause
        this.playPauseBtn.addEventListener('click', () => {
            const isAnimating = this.scene.isAnimating;
            this.scene.setAnimating(!isAnimating);
            this.playPauseBtn.textContent = isAnimating ? '▶ Play' : '⏸ Pause';
            this.playPauseBtn.style.background = isAnimating ? '#44aa44' : '#aa4444';
        });

        // Speed
        this.speedSelect.addEventListener('change', (e) => {
            this.scene.setAnimationSpeed(parseFloat(e.target.value));
        });

        // Observer
        this.observerSelect.addEventListener('change', (e) => {
            const name = e.target.value;
            const {lat, lon} = this.observers[name];
            this.scene.setObserverLocation(lat, lon);
            this.observerNameEl.textContent = name.split(',')[0];
            this._updateDisplay();
        });

        // Toggles
        this.nakshatrasToggle.addEventListener('change', (e) => {
            this.scene.setNakshatrasVisible(e.target.checked);
        });

        this.trailsToggle.addEventListener('change', (e) => {
            this.scene.setTrailsVisible(e.target.checked);
        });

        // Clear trails
        this.clearTrailsBtn.addEventListener('click', () => {
            this.scene.clearTrails();
        });

        // Update display periodically
        setInterval(() => this._updateDisplay(), 1000);
    }

    /**
     * Update time and info display
     */
    _updateDisplay() {
        // Current time
        const jd = this.scene.jd;
        this.currentJdEl.textContent = jd.toFixed(4);

        // Convert JD back to date for display
        const date = this._julianDateToDate(jd);
        const timeStr = date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'UTC'
        }) + ' UTC';
        this.currentTimeEl.textContent = timeStr;

        // Rise/Set times
        const riseSetTimes = this.scene.getRiseSetTimes();
        let risesetHtml = '';
        ['Sun', 'Moon', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Mercury', 'Rahu', 'Ketu'].forEach(body => {
            const data = riseSetTimes[body];
            if (data.type === 'circumpolar') {
                risesetHtml += `<div><strong>${body}:</strong> Always visible</div>`;
            } else if (data.type === 'never-rises') {
                risesetHtml += `<div><strong>${body}:</strong> Never rises</div>`;
            } else {
                risesetHtml += `<div><strong>${body}:</strong> ↑${data.rise} ↑${data.transit} ↓${data.set}</div>`;
            }
        });
        this.risesetInfo.innerHTML = risesetHtml;

        // Memory usage
        const stats = this.scene.getMemoryStats();
        const memKb = stats.trailsMemoryKb.toFixed(1);
        this.memoryUsage.textContent = `${memKb} KB`;

        // Body positions table (Alt/Az)
        const bodies = this.scene.getAllBodies();
        let bodyHtml = '';
        ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'].forEach(body => {
            const b = bodies[body];
            if (!b) return;
            const altStr = (b.altitude || 0).toFixed(1);
            const azStr = (b.azimuth || 0).toFixed(1);
            const vis = b.visible ? '' : ' (below)';
            bodyHtml += `<div><strong>${body}:</strong> Alt ${altStr}°, Az ${azStr}°${vis}</div>`;
        });
        this.bodyInfoEl.innerHTML = bodyHtml || 'No data';
    }

    /**
     * Convert Julian Date to JavaScript Date
     */
    _julianDateToDate(jd) {
        const a = jd + 0.5;
        const z = Math.floor(a);
        const f = a - z;
        const A = Math.floor((z - 1867216.25) / 36524.25);
        const B = z + 1 + A - Math.floor(A / 4);
        const C = B + 1524;
        const D = Math.floor((C - 122.1) / 365.25);
        const E = Math.floor(365.25 * D);
        const G = Math.floor((C - E) / 30.6001);

        const day = C - E - Math.floor(30.6001 * G) + f;
        const month = G < 14 ? G - 1 : G - 13;
        const year = D - (month > 2 ? 4716 : 4715);

        const dayFrac = day - Math.floor(day);
        const hours = dayFrac * 24;
        const hour = Math.floor(hours);
        const minutes = (hours - hour) * 60;
        const minute = Math.floor(minutes);
        const seconds = (minutes - minute) * 60;
        const second = Math.floor(seconds);

        return new Date(Date.UTC(year, month - 1, Math.floor(day), hour, minute, second));
    }

    /**
     * Dispose of UI
     */
    dispose() {
        const panel = document.getElementById('sky-controls-panel');
        if (panel) panel.remove();
    }
}

export default SkyControls;
