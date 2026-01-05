import { EffectComposer } from './EffectComposer.js';
import { RenderPass } from './RenderPass.js';
import { UnrealBloomPass } from './UnrealBloomPass.js';
import { definitions } from './wiki.js'
import { BasisTextureLoader } from './BasisTextureLoader.js';
import { OrbitControls, MapControls } from './OrbitControls.js';
import { TrackballControls } from './TrackballControls.js';
import { GLTFLoader } from './GLTFLoader.js';
import { VRButton } from './VRButton.js';
import { tisk } from './medium_short.js';
import { satalites } from './datamed.js';
import * as THREE from './module.js';
import { vertexShader, fragmentShader, sphereVertShader, sphereFragShader } from './shaders.js';
import { catalog } from './stars.js';
import { constellationLines } from './constellations.js';
import { moon } from "./planet.js";
import { minor_moon } from "./moon.js";
import { stellar } from "./stellar.js";
import * as bodies from "./construction.js";
import { moons, planets, stars, continuum, MakeStar, MakeMoon, MakeMinorMoon, arctan2, vector, vector_opt_2, EclipticToEquatorial, DegToRad, RadToDeg, Round, CurrentMa, CurrentMa_opt, BinaryMa, CartesianToPolar, ArraySub, comma, perturbations, DegToHour, foci, Semi, CelestialToEcliptic, getAllIndexes, MakeOrbit_2 } from './functions.js';
//global variables=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
var J_D;
var J_C;
var J_S;
var target;
var info_target;
var time_mod = 0
// Simulation speed in simulated seconds per real second
var time_rate = 1;
var fov_down = false;
var fov_up = false;
var time_acceleration;
var time_decceleration;
var strength_up = false;
var strength_down = false;
var paused = false;
var separation = 0;
//const continuum = [];//the master array, contains most objects even if they exist in other arrays
var meshes = [];
const Castable = []; //contains all meshes in the scene to facilitate with raycasting
var major_castable = [];
const ringGeo = new THREE.RingBufferGeometry(7.4, 14, 200);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const amb = new THREE.AmbientLight(0x404040, 0.05); // ambient light
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.02, 1e8);
document.body.appendChild(renderer.domElement);
const controls = new TrackballControls(camera, renderer.domElement);
//var sun = [1.98847e30, 0, 0, 0, 0, 0, 0, 1392684000, 1392851466, 92164320, 2000000];
var sim_run = true;
var info_visible = false;
var UI_visible = true;
var orbits_visible = true;
var labels_visible = true;
var minor_visible = true;
var belt_visible = true;
var tno_visible = true;
var moons_visible = true;
var planets_visible = true;
var Dwarf_visible = true;
var atmo_visible = true;
var dithering = true;
var post_processing = true;
var height_maps = true;
var quality_mesh = true;
var auto_expo = true;
var travelling = false;
var locked = false;
var high_graphics = true;
var settings_visible = false;
var spaceship_mode = false;
var spaceship_speed = 0.5;
var cinematic_mode = false;
var tour_mode = false;
var tour_index = 0;
var last_tour_switch_time = 0;
const tour_targets = ['sol', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
var help_visible = false;
var LY_UNIT = 1e6; // scene units per light-year
var maxStarsRadius = 0;
var stars3DScale = 1;
var music = true;
var follow_events = false;
var pause_on_events = false;
var event_in_progress = false;
var target_exposure;
var list = [];
var _lastUpdateMs = null;
var lastHyperTime = 0;
let horoscope_mode = false;
let horoscopeContainer = null;
let yuga_playing = false;
let horoscopeTourTargets = {};
let horoscope_tour_mode = false;
let horoscope_tour_index = -1;
let horoscope_tour_last_time = 0;
let currentNakshatraHighlight = null;
const NAKSHATRA_HIGHLIGHT_SEGMENTS = 27 * 12; // For a smooth ring
let pre_yuga_rate = 1;
const manager = new THREE.LoadingManager();
const universal_loader = new THREE.TextureLoader(manager)
const basisLoader = new BasisTextureLoader();
const modelLoader = new GLTFLoader();
const listener = new THREE.AudioListener();
camera.add(listener);
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('music/ambient.mp3', function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    sound.autoplay = true;
});

// Resume WebAudio after a user gesture (autoplay policies)
function _resumeAudioOnce() {
    try {
        const ctx = listener.context;
        if (ctx && ctx.state === 'suspended') ctx.resume();
        if (music && sound.buffer && !sound.isPlaying) sound.play();
    } catch (e) { /* ignore */ }
    window.removeEventListener('click', _resumeAudioOnce);
    window.removeEventListener('keydown', _resumeAudioOnce);
    window.removeEventListener('touchstart', _resumeAudioOnce);
}
window.addEventListener('click', _resumeAudioOnce, { once: true });
window.addEventListener('keydown', _resumeAudioOnce, { once: true });
window.addEventListener('touchstart', _resumeAudioOnce, { once: true });
basisLoader.setTranscoderPath('https://unpkg.com/three@0.118.3/examples/js/libs/basis/');
basisLoader.detectSupport(renderer);
//post processing=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const composer = new EffectComposer(renderer);
const bloomPass = new UnrealBloomPass({ x: window.innerWidth, y: window.innerHeight }, 0.5, 0.5, 0.0);
composer.setSize(window.innerWidth, window.innerHeight);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(bloomPass);
for (var i = 0; i < continuum.length; i++) {
    continuum[i].info = definitions[continuum[i].name];
}
//key binds=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (locked == false) {
        if (keyCode == 192) {
            switch (UI_visible) {
                case true:
                    if (info_visible == true) {
                        document.getElementById("info").style.zIndex = "0";
                    }
                    document.getElementById("labels").style.zIndex = "0";
                    document.getElementById("nums").style.zIndex = "0";
                    document.getElementById("search").style.zIndex = "0";
                    var tstc = document.getElementById("time_slider_top_container"); if (tstc) tstc.style.zIndex = "0";
                    document.getElementById("settings_button").style.zIndex = "0";
                    document.getElementById("info_button").style.zIndex = "0";
                    document.getElementById("help_button").style.zIndex = "0";
                    document.getElementById("time_forwards_button").style.zIndex = "0";
                    document.getElementById("time_backwards_button").style.zIndex = "0";
                    document.getElementById("time_pause_button").style.zIndex = "0";
                    document.getElementById("time_switch_button").style.zIndex = "0";
                    var yd = document.getElementById("yuga_display"); if(yd) yd.style.display = "none";
                    var ypb = document.getElementById("yuga_play_button"); if(ypb) ypb.style.display = "none";
                    UI_visible = false;
                    break;
                case false:
                    if (info_visible == true) {
                        document.getElementById("info").style.zIndex = "80";
                    }
                    document.getElementById("labels").style.zIndex = "255";
                    document.getElementById("nums").style.zIndex = "255";
                    document.getElementById("search").style.zIndex = "255";
                    var tstc = document.getElementById("time_slider_top_container"); if (tstc) tstc.style.zIndex = "255";
                    document.getElementById("settings_button").style.zIndex = "255";
                    document.getElementById("info_button").style.zIndex = "255";
                    document.getElementById("help_button").style.zIndex = "255";
                    document.getElementById("time_forwards_button").style.zIndex = "255";
                    document.getElementById("time_backwards_button").style.zIndex = "255";
                    document.getElementById("time_pause_button").style.zIndex = "255";
                    document.getElementById("time_switch_button").style.zIndex = "255";
                    var yd = document.getElementById("yuga_display"); if(yd) yd.style.display = "block";
                    var ypb = document.getElementById("yuga_play_button"); if(ypb) ypb.style.display = "block";
                    UI_visible = true;
                    break;
            }
        }
        if (keyCode == 73) {
            switch (info_visible) {
                case true:
                    document.getElementById("info").style.zIndex = "0";
                    info_visible = false;
                    break;
                case false:
                    document.getElementById("info").style.zIndex = "255";
                    info_visible = true;
                    break
            }
        }
        if (keyCode == 79) {
            switch (orbits_visible) {
                case true:
                    moons.forEach(moon => moon.Orbit.visible = false);
                    orbits_visible = false;
                    break;
                case false:
                    moons.forEach(moon => moon.Orbit.visible = true);
                    orbits_visible = true
                    break;
            }
        }
        if (keyCode == 84) {
            switch (labels_visible) {
                case true:
                    moons.forEach(moon => moon.label.visible = false);
                    labels_visible = false;
                    break;
                case false:
                    moons.forEach(moon => moon.label.visible = true);
                    labels_visible = true
                    break;
            }
        }
        if (keyCode == 75) {
            switch (paused) {
                case true:
                    paused = false;
                    break;
                case false:
                    paused = true;
                    break;
            }
        }
        if (keyCode == 191) {
            time_rate = -time_rate;
        }
        if (keyCode == 189) {
            fov_up = true;
        }
        if (keyCode == 187) {
            fov_down = true;
        }
        if (keyCode == 188) {
            time_decceleration = true;
        }
        if (keyCode == 190) {
            time_acceleration = true;
        }
        if (keyCode == 221) {
            strength_up = true;
        }
        if (keyCode == 219) {
            strength_down = true;
        }
        if (keyCode == 71) {
            GoTo(info_target)
        }
        if (keyCode == 27) {
            if (help_visible == false && info_visible == false) {
                switch (settings_visible) {
                    case true:
                        document.getElementById("settings").style.zIndex = "0";
                        settings_visible = false;
                        sim_run = true
                        break;
                    case false:
                        document.getElementById("settings").style.zIndex = "255";
                        settings_visible = true;
                        sim_run = false
                        break
                }
            }
            if (help_visible == true || info_visible == true) {
                info_visible = false;
                help_visible = false;
                document.getElementById("info").style.zIndex = "0";
                document.getElementById("help").style.zIndex = "0";
            }
        }
    }
    if (keyCode == 13) {
        if (Number.isInteger(+document.getElementById("search").value)) {
            assign2(+document.getElementById("search").value);
        }
        else {
            assign();
        }
    }
};
document.addEventListener("keyup", onDocumentKeyUp, false);
function onDocumentKeyUp(event) {
    var keyCode = event.which;
    if (locked == false) {
        if (keyCode == 189) {
            fov_up = false;
        }
        if (keyCode == 187) {
            fov_down = false;
        }
        if (keyCode == 188) {
            time_decceleration = false;
        }
        if (keyCode == 190) {
            time_acceleration = false;
        }
        if (keyCode == 221) {
            strength_up = false;
        }
        if (keyCode == 219) {
            strength_down = false;
        }
    }
}
document.getElementById("orbits").onclick = function () {
    switch (orbits_visible) {
        case true:
            moons.forEach(moon => moon.Orbit.visible = false);
            orbits_visible = false;
            break;
        case false:
            moons.forEach(moon => moon.Orbit.visible = true);
            orbits_visible = true;
            break;
    }
}
document.getElementById("Labels").onclick = function () {
    switch (labels_visible) {
        case true:
            moons.forEach(moon => moon.label.visible = false);
            labels_visible = false;
            break;
        case false:
            moons.forEach(moon => moon.label.visible = true);
            labels_visible = true
            break;
    }
}
document.getElementById("belt").onclick = function () {
    switch (belt_visible) {
        case true:
            PointCloud.visible = false;
            belt_visible = false;
            break;
        case false:
            PointCloud.visible = true;
            belt_visible = true;
            break;
    }
}
document.getElementById("tnos").onclick = function () {
    switch (tno_visible) {
        case true:
            for (i = 0; i < moons.length; i++) {
                if (moons[i].dwarfPlanet == true) {
                    moons[i].Orbit.visible = false;
                    moons[i].label.visible = false;
                }
            }
            tno_visible = false;
            break;
        case false:
            for (i = 0; i < moons.length; i++) {
                if (moons[i].dwarfPlanet == true) {
                    moons[i].Orbit.visible = true;
                    moons[i].label.visible = true;
                }
            }
            tno_visible = true;
            break;
    }
}
document.getElementById("moons").onclick = function () {
    switch (moons_visible) {
        case true:
            for (i = 0; i < moons.length; i++) {
                if (moons[i].parent != sol) {
                    moons[i].Orbit.visible = false;
                    moons[i].label.visible = false;
                }
            }
            moons_visible = false;
            break;
        case false:
            for (i = 0; i < moons.length; i++) {
                if (moons[i].parent != sol) {
                    moons[i].Orbit.visible = true;
                    moons[i].label.visible = true;
                }
            }
            moons_visible = true;
            break;
    }
}
document.getElementById("planets").onclick = function () {
    switch (planets_visible) {
        case true:
            for (i = 0; i < moons.length; i++) {
                if (moons[i].parent == sol && moons[i] instanceof moon) {
                    moons[i].Orbit.visible = false;
                    moons[i].label.visible = false;
                }
            }
            planets_visible = false;
            break;
        case false:
            for (i = 0; i < moons.length; i++) {
                if (moons[i].parent == sol && moons[i] instanceof moon) {
                    moons[i].Orbit.visible = true;
                    moons[i].label.visible = true;
                }
            }
            planets_visible = true;
            break;
    }
}
document.getElementById("atmos").onclick = function () {
    switch (atmo_visible) {
        case true:
            for (i = 0; i < moons.length; i++) {
                if (moons[i].atmosphere != null) {
                    moons[i].atmosphere.visible = false;
                }
            }
            atmo_visible = false;
            break;
        case false:
            for (i = 0; i < moons.length; i++) {
                if (moons[i].atmosphere != null) {
                    moons[i].atmosphere.visible = true;
                }
            }
            atmo_visible = true
            break;
    }
}
document.getElementById("dithering").onclick = function () {
    switch (dithering) {
        case true:
            for (i = 0; i < moons.length; i++) {
                if (moons[i].Mesh != null) {
                    moons[i].Mesh.material.dithering = false;
                }
            }
            dithering = false;
            break;
        case false:
            for (i = 0; i < moons.length; i++) {
                if (moons[i].Mesh != null) {
                    moons[i].Mesh.material.dithering = true;
                }
            }
            dithering = true
            break;
    }
}
document.getElementById("post").onclick = function () {
    switch (post_processing) {
        case true:
            post_processing = false;
            break;
        case false:
            post_processing = true
            break;
    }
}
document.getElementById("height").onclick = function () {
    switch (height_maps) {
        case true:
            for (i = 0; i < moons.length; i++) {
                if (moons[i].Mesh != null) {
                    moons[i].Mesh.material.displacementMap.dispose()
                    moons[i].Mesh.material.needsUpdate = true
                }
            }
            height_maps = false;
            break;
        case false:
            for (i = 0; i < moons.length; i++) {
                if (moons[i].Mesh != null) {
                    moons[i].Mesh.material.displacementMap.dispose()
                    moons[i].Mesh.material.needsUpdate = true
                }
            }
            height_maps = true
            break;
    }
}
document.getElementById("meshes").onclick = function () {
    switch (quality_mesh) {
        case true:
            for (i = 0; i < moons.length; i++) {
                if (moons[i].Mesh != null) {
                    moons[i].Mesh.geometry = new THREE.SphereGeometry(moons[i].Physical[0] / 20000000, 30, 30)
                    moons[i].Mesh.geometry.needsUpdate = true
                }
            }
            quality_mesh = false;
            break;
        case false:
            for (i = 0; i < moons.length; i++) {
                if (moons[i].Mesh != null) {
                    moons[i].Mesh.geometry = new THREE.SphereGeometry(moons[i].Physical[0] / 20000000, 200, 100)
                    moons[i].Mesh.geometry.needsUpdate = true
                }
            }
            quality_mesh = true
            break;
    }
}
document.getElementById("exposure").onclick = function () {
    switch (auto_expo) {
        case true:
            auto_expo = false;
            break;
        case false:
            auto_expo = true
            break;
    }
}
document.getElementById("music").onclick = function () {
    switch (music) {
        case true:
            music = false;
            sound.pause();
            break;
        case false:
            music = true;
            sound.play();
            break;
    }
}

document.getElementById("horizon_plane").onclick = function () {
    const checked = document.getElementById("horizon_plane").checked;
    if (bodies.earth && bodies.earth.horizonPlane) {
        bodies.earth.horizonPlane.visible = checked;
    }
}


// scene setup  =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.sortObjects = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//document.body.appendChild(VRButton.createButton(renderer));
//renderer.xr.enabled = true;

// Initialize time controls UI once controls/buttons are attached
initTimeControls();

function animate() {
    if (post_processing == true) {
        composer.render();
    }
    else {
        renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(animate);

    if (horoscope_tour_mode) {
        controls.enabled = false;
        if (bodies.earth && bodies.earth.Position) {
            applyVisualEnhancements();
            const now = performance.now();
            if (now - horoscope_tour_last_time > 5000) { // Switch every 5 seconds
                horoscope_tour_index++;
                horoscope_tour_last_time = now;
            }

            const tourList = ['Lagna', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
            const targetName = tourList[horoscope_tour_index % tourList.length];
            const targetPosition = horoscopeTourTargets[targetName];

            // Position camera at a viewpoint near the observer on Earth
            const observerPos = horoscopeTourTargets['Observer'] || bodies.earth.Position;
            const desiredCamPos = observerPos.clone().add(new THREE.Vector3(0, 15, 40));
            camera.position.lerp(desiredCamPos, 0.02);

            if (targetPosition) {
                // Smoothly interpolate the camera's look-at target
                const newTarget = controls.target.clone().lerp(targetPosition, 0.05);
                camera.lookAt(newTarget);
                controls.target.copy(newTarget); // Update control's target for next frame's lerp
            }
        }
    } else if (spaceship_mode) {
        controls.enabled = false;
        // Point spaceship towards mouse target
        spaceship.lookAt(mouseTarget);

        // Move spaceship forward
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(spaceship.quaternion);
        spaceship.position.add(forward.multiplyScalar(spaceship_speed));
        
        // Attach camera to spaceship
        const cameraOffset = new THREE.Vector3(0, 2, 10); // Behind and slightly above
        cameraOffset.applyQuaternion(spaceship.quaternion);
        camera.position.copy(spaceship.position).add(cameraOffset);
        camera.lookAt(spaceship.position);

    } else {
        controls.enabled = true;
    }

    //renderer.render(scene, camera);
    if (cinematic_mode) {
        const axis = new THREE.Vector3(0, 1, 0);
        const speed = 0.0005;
        camera.position.sub(controls.target);
        camera.position.applyAxisAngle(axis, speed);
        camera.position.add(controls.target);
    }
    if (tour_mode) {
        const now = performance.now();
        if (now - last_tour_switch_time > 10000) { // 10 seconds per planet
            tour_index = (tour_index + 1) % tour_targets.length;
            const key = tour_targets[tour_index];
            if (bodies[key]) {
                GoTo(bodies[key]);
            }
            last_tour_switch_time = now;
        }
    }
    if (!horoscope_tour_mode && !spaceship_mode) {
        controls.update();
    }
    sky.position.copy(camera.position);
    if (sim_run == true) {
        const now = performance.now();
        applyVisualEnhancements();
        if (Math.abs(time_rate) > 86400 && (now - lastHyperTime < 30)) {
            // Throttle simulation updates at high speeds to save CPU
        } else {
            hyper();
            lastHyperTime = now;
        }
        updateConstellationLabels();
        updateRashiLabels();
        controls.enabled = true
    }
    else {
        controls.enabled = false
    }
}

scene.add(amb);

//camera controls
controls.rotateSpeed = 0.5;
controls.zoomSpeed = 2;
controls.minDistance = 0.03;
controls.maxDistance = 8e7;
controls.enableDamping = true;
controls.dampingFactor = 0.1;
// Use default TrackballControls mouse mapping: LEFT=ROTATE, MIDDLE=ZOOM, RIGHT=PAN
controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
}

var skygeo = new THREE.SphereGeometry(5e7, 20, 20);
const sky = new THREE.Mesh(skygeo, new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide, depthWrite: false }));
basisLoader.load('textures/sky.basis', function (texture) {
    sky.material.map = texture;
    sky.material.side = THREE.BackSide;
    sky.material.depthWrite = false; sky.material.needsUpdate = true; scene.add(sky);
    document.getElementById("labels").style.visibility = "visible";
    document.getElementById("nums").style.visibility = "visible";
    document.getElementById("search").style.visibility = "visible";
    var tstc = document.getElementById("time_slider_top_container"); if (tstc) tstc.style.visibility = "visible";
    document.getElementById("info").style.visibility = "visible";
    document.getElementById("settings").style.visibility = "visible";
    document.getElementById("help").style.visibility = "visible";
    document.getElementById("settings_button").style.visibility = "visible";
    document.getElementById("info_button").style.visibility = "visible";
    document.getElementById("help_button").style.visibility = "visible";
    document.getElementById("time_forwards_button").style.visibility = "visible";
    document.getElementById("time_backwards_button").style.visibility = "visible";
    document.getElementById("time_pause_button").style.visibility = "visible";
    document.getElementById("time_switch_button").style.visibility = "visible";
    sound.play();
});

camera.position.set(0, 10000, 10000);
camera.lookAt(0, 0, 0);
raycaster.near = 0.005;
raycaster.far = 9000000;
raycaster.camera = camera;
function occultation(position, target) {
    var pos = new THREE.Vector3;
    pos.subVectors(target, position);
    raycaster.set(camera.position, pos.normalize())
    var intersects = raycaster.intersectObjects(meshes);
    if (intersects.length > 0) {
        return true
    }
}
function click(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(Castable);

    if (intersects[0] != null) {
        info_target = intersects[0].object.owner
        document.getElementById("info").innerHTML = (intersects[0].object.owner.info);

        if (info_target.name === "earth" && info_target.Mesh && intersects[0].point) {
            const earth = info_target;
            const hitPoint = intersects[0].point.clone();

            // Convert world hit point to local point relative to Earth Mesh
            earth.Mesh.updateMatrixWorld();
            const localPoint = earth.Mesh.worldToLocal(hitPoint);

            // Align horizon plane to the hit point
            if (earth.horizonPlane) {
                earth.horizonPlane.position.copy(localPoint);

                // Oblate Spheroid Normal calculation
                // a = equatorial radius, b = polar radius
                // Normal is (x/a^2, y/b^2, z/a^2)
                const a = 1.0; // Normalized equatorial
                const b = earth.Physical[1] / earth.Physical[0]; // Normalized polar
                const normal = new THREE.Vector3(
                    localPoint.x / (a * a),
                    localPoint.y / (b * b),
                    localPoint.z / (a * a)
                ).normalize();
                // Ensure normal points outward
                if (normal.dot(localPoint) < 0) normal.negate();

                // Build a stable local basis (East, North, Up) to avoid roll ambiguity
                const northAxis = new THREE.Vector3(0, 1, 0);
                let north = northAxis.clone().projectOnPlane(normal);
                if (north.lengthSq() < 1e-6) {
                    north = new THREE.Vector3(0, 0, 1).projectOnPlane(normal);
                    if (north.lengthSq() < 1e-6) {
                        north = new THREE.Vector3(1, 0, 0).projectOnPlane(normal);
                    }
                }
                north.normalize();
                const east = new THREE.Vector3().crossVectors(normal, north).normalize();
                north = new THREE.Vector3().crossVectors(east, normal).normalize();
                const basis = new THREE.Matrix4().makeBasis(east, north, normal);
                earth.horizonPlane.quaternion.setFromRotationMatrix(basis);

                // Position slightly above surface using the accurate normal
                earth.horizonPlane.position.add(normal.clone().multiplyScalar(0.005));

                // Make visible if the setting is on
                if (document.getElementById("horizon_plane").checked) {
                    earth.horizonPlane.visible = true;
                }
            }
            // Store for persistence
            earth.horizonLocalPos = localPoint.clone();

            // Calculate Lat/Lon from local point (assuming sphere of radius R)
            // localPoint is (x, y, z) in Earth's local space.
            // In Three.js SphereGeometry, +Y is up (North Pole), +Z is front, +X is right.
            const p = localPoint.clone().normalize();
            const lat = Math.asin(p.y) * (180 / Math.PI);
            const lon = Math.atan2(p.x, p.z) * (180 / Math.PI);

            document.getElementById("lat_val").innerHTML = lat.toFixed(2) + "°";
            document.getElementById("lon_val").innerHTML = lon.toFixed(2) + "°";

            // Broadcast location to Earth-Sky view
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'SD79_LOCATION',
                    payload: { lat, lon }
                }, '*');
            }
        } else {
            document.getElementById("lat_val").innerHTML = "-";
            document.getElementById("lon_val").innerHTML = "-";
        }
    }
}
function dbclick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(Castable);
    if (intersects[0] != null) {
        GoTo(intersects[0].object.owner)
        document.getElementById("info").innerHTML = (intersects[0].object.owner.info);
    }
}
function stopscroll() {
    travelling = false;
}
window.addEventListener('resize', onWindowResize, false);
//window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('click', click, false);
window.addEventListener('mousedown', dbclick, false);
window.addEventListener('dblclick', dbclick, false);
window.addEventListener('wheel', stopscroll, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}
document.getElementById("search").onclick = function () { locked = true; }
document.getElementById("settings_button").onclick = function () {
    switch (settings_visible) {
        case true:
            document.getElementById("settings").style.zIndex = "0";
            settings_visible = false;
            sim_run = true
            break;
        case false:
            document.getElementById("settings").style.zIndex = "255";
            settings_visible = true;
            sim_run = false;
            break
    }
}
document.getElementById("info_button").onclick = function () {
    switch (info_visible) {
        case true:
            document.getElementById("info").style.zIndex = "0";
            info_visible = false;
            break;
        case false:
            document.getElementById("info").style.zIndex = "255";
            info_visible = true;
            break
    }
}
document.getElementById("help_button").onclick = function () {
    if (settings_visible == false) {
        switch (help_visible) {
            case true:
                document.getElementById("help").style.zIndex = "0";
                help_visible = false;
                break;
            case false:
                document.getElementById("help").style.zIndex = "255";
                help_visible = true;
                break
        }
    }
}
document.getElementById("time_forwards_button").onmousedown = function () {
    time_acceleration = true;
}
document.getElementById("time_forwards_button").onmouseup = function () {
    time_acceleration = false;
}
document.getElementById("time_forwards_button").onmouseleave = function () {
    time_acceleration = false;
}
document.getElementById("time_backwards_button").onmousedown = function () {
    time_decceleration = true;
}
document.getElementById("time_backwards_button").onmouseup = function () {
    time_decceleration = false;
}
document.getElementById("time_backwards_button").onmouseleave = function () {
    time_decceleration = false;
}
document.getElementById("time_switch_button").onclick = function () {
    time_rate = time_rate * -1;
}
document.getElementById("time_pause_button").onclick = function () {
    switch (paused) {
        case true:
            paused = false;
            break;
        case false:
            paused = true;
            break;
    }
}
//document.getElementById("mercury_button").onclick = assign();
renderer.domElement.oncontextmenu = function (e) {
    locked = false;
    document.getElementById("search").blur();
}
//special objects=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
var pos = ringGeo.attributes.position;
var v3 = new THREE.Vector3();
for (let i = 0; i < pos.count; i++) {
    v3.fromBufferAttribute(pos, i);
    ringGeo.attributes.uv.setXY(i, v3.length() < 8 ? 0 : 1, 1);
} const ringMat = new THREE.MeshPhongMaterial({ map: universal_loader.load("assets/ring.png"), transparent: true, side: THREE.DoubleSide, });
const ring = new THREE.Mesh(ringGeo, ringMat);
var rot = CelestialToEcliptic(DegToRad(bodies.saturn.Physical[4]), DegToRad(bodies.saturn.Physical[5]));
ring.rotateY(rot[0]);
ring.rotateZ(rot[1]);
ring.rotateX(- Math.PI / 2);
//ring.receiveShadow = true;
ring.renderOrder = 3;
scene.add(ring);
var model;
modelLoader.load('chungus/chungus.gltf', function (gltf) {
    model = gltf.scene.children[0];
    model.material = new THREE.MeshBasicMaterial({ color: "rgb(255,255,255)", flatShading: false, reflectivity: 1, });
    var textureEquirec = universal_loader.load('background.jpg');
    textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
    textureEquirec.encoding = THREE.sRGBEncoding;
    model.material.envMap = textureEquirec
    model.material.needsUpdate = true;
    model.scale.set(0.0005, 0.0005, 0.0005);
    scene.add(model);

}, undefined, function (error) {

});
const snipe_mat = new THREE.SpriteMaterial({ map: universal_loader.load('assets/cross.png') });
snipe_mat.sizeAttenuation = false;
const snipe = new THREE.Sprite(snipe_mat);
snipe.scale.set(0.1, 0.1, 0.1);
scene.add(snipe);
// Constellations rendering (fixed in world so you can fly past)
const CONSTELLATION_RADIUS = 4e7;
const CONSTELLATION_TILT = 0.40904531187; // obliquity

// Rashi belt constants (moved up to fix ReferenceError)
const RASHI_NAMES = [
    'Mesha', 'Vrishabha', 'Mithuna', 'Karka',
    'Simha', 'Kanya', 'Tula', 'Vrishchika',
    'Dhanu', 'Makara', 'Kumbha', 'Meena'
];
const NAKSHATRA_NAMES = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", 
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", 
    "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", 
    "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", 
    "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];
const NAKSHATRA_DETAILS = [
    { ruler: "Ketu", deity: "Ashwini Kumaras" }, { ruler: "Venus", deity: "Yama" }, 
    { ruler: "Sun", deity: "Agni" }, { ruler: "Moon", deity: "Brahma" }, 
    { ruler: "Mars", deity: "Soma" }, { ruler: "Rahu", deity: "Rudra" }, 
    { ruler: "Jupiter", deity: "Aditi" }, { ruler: "Saturn", deity: "Brihaspati" }, 
    { ruler: "Mercury", deity: "Nagas" }, { ruler: "Ketu", deity: "Pitris" }, 
    { ruler: "Venus", deity: "Bhaga" }, { ruler: "Sun", deity: "Aryaman" }, 
    { ruler: "Moon", deity: "Savitar" }, { ruler: "Mars", deity: "Tvashtar" }, 
    { ruler: "Rahu", deity: "Vayu" }, { ruler: "Jupiter", deity: "Indra/Agni" }, 
    { ruler: "Saturn", deity: "Mitra" }, { ruler: "Mercury", deity: "Indra" }, 
    { ruler: "Ketu", deity: "Nirriti" }, { ruler: "Venus", deity: "Apah" }, 
    { ruler: "Sun", deity: "Vishvadevas" }, { ruler: "Moon", deity: "Vishnu" }, 
    { ruler: "Mars", deity: "Vasus" }, { ruler: "Rahu", deity: "Varuna" }, 
    { ruler: "Jupiter", deity: "Aja Ekapada" }, { ruler: "Saturn", deity: "Ahir Budhnya" }, 
    { ruler: "Mercury", deity: "Pushan" }
];
const RASHI_COLORS = [
    0xFF5733, 0xDAF7A6, 0x33FFF6, 0xFFC300, 
    0xFF33FF, 0x3380FF, 0xB833FF, 0xFF3380, 
    0x33FF80, 0xFF8C33, 0x8C33FF, 0x33FFBD
];
const WESTERN_RASHI_NAMES = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const GRAHA_DATA = [
    { name: "Sun", key: "sol", color: "#FFD700", symbol: "☉" },
    { name: "Moon", key: "moon", color: "#EEEEEE", symbol: "☽" },
    { name: "Mercury", key: "mercury", color: "#00FF00", symbol: "☿" },
    { name: "Venus", key: "venus", color: "#00FFFF", symbol: "♀" },
    { name: "Mars", key: "mars", color: "#FF0000", symbol: "♂" },
    { name: "Jupiter", key: "jupiter", color: "#FFA500", symbol: "♃" },
    { name: "Saturn", key: "saturn", color: "#8888FF", symbol: "♄" },
    { name: "Rahu", key: "rahu", color: "#AAAAAA", symbol: "☊" },
    { name: "Ketu", key: "ketu", color: "#777777", symbol: "☋" }
];

const CONSTELLATION_FULL_NAMES = {
    "And": "Andromeda", "Ant": "Antlia", "Aps": "Apus", "Aqr": "Aquarius", "Aql": "Aquila", "Ara": "Ara", "Ari": "Aries", "Aur": "Auriga",
    "Boo": "Boötes", "Cae": "Caelum", "Cam": "Camelopardalis", "Cnc": "Cancer", "CVn": "Canes Venatici", "CMa": "Canis Major", "CMi": "Canis Minor",
    "Cap": "Capricornus", "Car": "Carina", "Cas": "Cassiopeia", "Cen": "Centaurus", "Cep": "Cepheus", "Cet": "Cetus", "Cha": "Chamaeleon",
    "Cir": "Circinus", "Col": "Columba", "Com": "Coma Berenices", "CrA": "Corona Australis", "CrB": "Corona Borealis", "Crv": "Corvus", "Crt": "Crater",
    "Cru": "Crux", "Cyg": "Cygnus", "Del": "Delphinus", "Dor": "Dorado", "Dra": "Draco", "Equ": "Equuleus", "Eri": "Eridanus", "For": "Fornax",
    "Gem": "Gemini", "Gru": "Grus", "Her": "Hercules", "Hor": "Horologium", "Hya": "Hydra", "Hyi": "Hydrus", "Ind": "Indus", "Lac": "Lacerta",
    "Leo": "Leo", "LMi": "Leo Minor", "Lep": "Lepus", "Lib": "Libra", "Lup": "Lupus", "Lyn": "Lynx", "Lyr": "Lyra", "Men": "Mensa",
    "Mic": "Microscopium", "Mon": "Monoceros", "Mus": "Musca", "Nor": "Norma", "Oct": "Octans", "Oph": "Ophiuchus", "Ori": "Orion", "Pav": "Pavo",
    "Peg": "Pegasus", "Per": "Perseus", "Phe": "Phoenix", "Pic": "Pictor", "Psc": "Pisces", "PsA": "Piscis Austrinus", "Pup": "Puppis",
    "Pyx": "Pyxis", "Ret": "Reticulum", "Sge": "Sagitta", "Sgr": "Sagittarius", "Sco": "Scorpius", "Scl": "Sculptor", "Sct": "Scutum",
    "Ser": "Serpens", "Sex": "Sextans", "Tau": "Taurus", "Tel": "Telescopium", "Tri": "Triangulum", "TrA": "Triangulum Australe",
    "Tuc": "Tucana", "UMa": "Ursa Major", "UMi": "Ursa Minor", "Vel": "Vela", "Vir": "Virgo", "Vol": "Volans", "Vul": "Vulpecula"
};

let useWesternZodiac = false;
let ayanamsaDeg = 23.85; // Lahiri Ayanamsa (approx J2000)
let ayanamsaMode = 'Lahiri';
let yugaMode = 'SriYukteswar';
const AYANAMSA_PRESETS = {
    'Lahiri': 23.85,
    'Raman': 22.36,
    'Fagan-Bradley': 24.74
};
const PRECESSION_RATE = 1.3969; // degrees per century

let _constellationData = constellationLines;

// Visual indicator for Nakshatra
const nakshatraRingGeo = new THREE.RingGeometry(CONSTELLATION_RADIUS * 0.02, CONSTELLATION_RADIUS * 0.025, 32);
const nakshatraRingMat = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
const nakshatraSelectionRing = new THREE.Mesh(nakshatraRingGeo, nakshatraRingMat);
nakshatraSelectionRing.visible = false;
scene.add(nakshatraSelectionRing);

function raDecToVector(raDeg, decDeg, radius) {
    // RA 0�360�, Dec in degrees
    const ra = DegToRad(raDeg);
    const dec = DegToRad(decDeg);
    const x = radius * Math.cos(ra) * Math.cos(dec);
    const y = radius * Math.sin(ra) * Math.cos(dec);
    const z = radius * Math.sin(dec);
    // rotate from equatorial to ecliptic to match scene convention
    const y2 = y * Math.cos(CONSTELLATION_TILT) - z * Math.sin(CONSTELLATION_TILT);
    const z2 = y * Math.sin(CONSTELLATION_TILT) + z * Math.cos(CONSTELLATION_TILT);
    return new THREE.Vector3(x, z2, y2);
}
function buildConstellations() {
    const positions = [];
    const colors = [];
    for (const c of constellationLines) {
        // Calculate centroid for color
        let sx = 0, sy = 0, sz = 0, count = 0;
        if (c.lines) {
            for (const seg of c.lines) {
                const a = seg[0], b = seg[1];
                const va = raDecToVector(a[0], a[1], CONSTELLATION_RADIUS);
                const vb = raDecToVector(b[0], b[1], CONSTELLATION_RADIUS);
                sx += va.x + vb.x; sy += va.y + vb.y; sz += va.z + vb.z;
                count += 2;
            }
        }
        let color = new THREE.Color(0x88bbff);
        if (count > 0) {
            const cx = sx / count, cz = sz / count; // Ecliptic plane is XZ
            let ang = Math.atan2(cz, cx);
            if (ang < 0) ang += Math.PI * 2;
            const deg = ang * (180 / Math.PI);
            const rashiIdx = Math.floor(deg / 30) % 12;
            color.setHex(RASHI_COLORS[rashiIdx]);
        }

        for (const seg of c.lines) {
            const a = seg[0], b = seg[1];
            const va = raDecToVector(a[0], a[1], CONSTELLATION_RADIUS);
            const vb = raDecToVector(b[0], b[1], CONSTELLATION_RADIUS);
            positions.push(va.x, va.y, va.z, vb.x, vb.y, vb.z);
            colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
        }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const m = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.5, depthWrite: false });
    const lines = new THREE.LineSegments(g, m);
    lines.renderOrder = 1;
    return lines;
}

function updateConstellationColors() {
    if (!_constellationData || !constellationGroup.geometry) return;
    const colors = [];
    for (const c of _constellationData) {
        if (!c.lines) continue;
        let sx = 0, sy = 0, sz = 0, count = 0;
        for (const seg of c.lines) {
            const a = seg[0], b = seg[1];
            const va = raDecToVector(a[0], a[1], CONSTELLATION_RADIUS);
            const vb = raDecToVector(b[0], b[1], CONSTELLATION_RADIUS);
            sx += va.x + vb.x; sy += va.y + vb.y; sz += va.z + vb.z;
            count += 2;
        }
        let color = new THREE.Color(0x88bbff);
        if (count > 0) {
            const cx = sx / count, cz = sz / count;
            let ang = Math.atan2(cz, cx);
            if (ang < 0) ang += Math.PI * 2;
            let deg = ang * (180 / Math.PI);
            
            if (!useWesternZodiac) {
                deg -= ayanamsaDeg;
            }
            if (deg < 0) deg += 360;

            const rashiIdx = Math.floor(deg / 30) % 12;
            color.setHex(RASHI_COLORS[rashiIdx]);
        }
        for (const seg of c.lines) {
            colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
        }
    }
    constellationGroup.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    constellationGroup.geometry.attributes.color.needsUpdate = true;
}

const constellationGroup = buildConstellations();
scene.add(constellationGroup);
constellationGroup.visible = true;
constellationGroup.frustumCulled = false;

// Helper to generate geometry from data
function linesGeometryFromData(dataset) {
    const positions = [];
    const colors = [];
    for (const c of dataset) {
        if (!c.lines) continue;
        // Calculate centroid for color
        let sx = 0, sy = 0, sz = 0, count = 0;
        for (const seg of c.lines) {
            const a = seg[0], b = seg[1];
            const va = raDecToVector(a[0], a[1], CONSTELLATION_RADIUS);
            const vb = raDecToVector(b[0], b[1], CONSTELLATION_RADIUS);
            sx += va.x + vb.x; sy += va.y + vb.y; sz += va.z + vb.z;
            count += 2;
        }
        let color = new THREE.Color(0x88bbff);
        if (count > 0) {
            const cx = sx / count, cz = sz / count;
            let ang = Math.atan2(cz, cx);
            if (ang < 0) ang += Math.PI * 2;
            let deg = ang * (180 / Math.PI);
            if (!useWesternZodiac) { deg -= ayanamsaDeg; }
            if (deg < 0) deg += 360;
            const rashiIdx = Math.floor(deg / 30) % 12;
            color.setHex(RASHI_COLORS[rashiIdx]);
        }
        for (const seg of c.lines) {
            const a = seg[0], b = seg[1];
            const va = raDecToVector(a[0], a[1], CONSTELLATION_RADIUS);
            const vb = raDecToVector(b[0], b[1], CONSTELLATION_RADIUS);
            positions.push(va.x, va.y, va.z, vb.x, vb.y, vb.z);
            colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
        }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return g;
}

// Replace sample with full dataset from assets/constellations.json
(async function loadConstellationsFull() {
    try {
        const res = await fetch('assets/constellations.json', { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json();
        
        _constellationData = data;
        const g = linesGeometryFromData(data);
        
        if (constellationGroup.geometry) constellationGroup.geometry.dispose();
        constellationGroup.geometry = g;
        constellationGroup.visible = true;
        rebuildConstellationLabels();
    } catch (e) { console.warn('constellations.json load failed', e); }
})();
// Labels for constellations
const constellationLabels = new THREE.Group();
scene.add(constellationLabels);
function _makeTextSprite(text, options) {
    const canvas = document.createElement('canvas');
    const size = (options && options.size) ? options.size : 256;
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const fontStr = (options && options.font) ? options.font : '28px Arial';
    ctx.font = fontStr;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = (options && options.fillStyle) ? options.fillStyle : 'white';
    
    const lines = text.split('\n');
    const fontSizeMatch = fontStr.match(/(\d+)px/);
    const fontSize = fontSizeMatch ? parseInt(fontSizeMatch[1]) : 28;
    const lineHeight = fontSize * 1.2;
    const startY = (size - (lines.length * lineHeight)) / 2 + (lineHeight / 2);

    lines.forEach((line, i) => {
        const y = startY + i * lineHeight;
        if (options && options.stroke) {
            ctx.strokeStyle = options.strokeColor || 'black';
            ctx.lineWidth = options.strokeWidth || 4;
            ctx.strokeText(line, size / 2, y);
        }
        ctx.fillText(line, size / 2, y);
    });

    const tex = new THREE.Texture(canvas); tex.needsUpdate = true;
    const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
    const spr = new THREE.Sprite(mat); spr.scale.set(0.8, 0.8, 0.8);
    return spr;
}
function rebuildConstellationLabels() {
    while (constellationLabels.children.length) { const c = constellationLabels.children.pop(); if (c.material && c.material.map) c.material.map.dispose(); if (c.material) c.material.dispose(); }
    for (const c of _constellationData) {
        if (!c.lines || !c.name) continue;
        const pts = [];
        for (const seg of c.lines) { pts.push(seg[0], seg[1]); }
        // Average cartesian on unit sphere to find label direction
        let sx = 0, sy = 0, sz = 0;
        for (const p of pts) {
            const ra = DegToRad(p[0]); const dec = DegToRad(p[1]);
            const x = Math.cos(ra) * Math.cos(dec);
            const y = Math.sin(ra) * Math.cos(dec);
            const z = Math.sin(dec);
            // Apply obliquity so labels align with line transform
            const y2 = y * Math.cos(CONSTELLATION_TILT) - z * Math.sin(CONSTELLATION_TILT);
            const z2 = y * Math.sin(CONSTELLATION_TILT) + z * Math.cos(CONSTELLATION_TILT);
            sx += x; sy += y2; sz += z2;
        }
        const len = Math.sqrt(sx * sx + sy * sy + sz * sz) || 1;
        const dir = new THREE.Vector3(sx / len, sy / len, sz / len);
        
        // Determine Rashi and Nakshatra
        let ang = Math.atan2(dir.z, dir.x); // Ecliptic Longitude (XZ plane)
        if (ang < 0) ang += Math.PI * 2;
        let deg = ang * (180 / Math.PI);
        
        if (!useWesternZodiac) {
            deg -= ayanamsaDeg;
        }
        if (deg < 0) deg += 360;

        const rashiIdx = Math.floor(deg / 30) % 12;
        const color = RASHI_COLORS[rashiIdx];

        const pos = dir.multiplyScalar(CONSTELLATION_RADIUS * 1.001);
        let labelText = CONSTELLATION_FULL_NAMES[c.name] || c.name;
        if (!useWesternZodiac) {
            const nakIdx = Math.floor(deg / (360 / 27)) % 27;
            const nakName = NAKSHATRA_NAMES[nakIdx];
            labelText += "\n(" + nakName + ")";
        }
        const label = _makeTextSprite(labelText, { font: '24px Arial', fillStyle: '#' + new THREE.Color(color).getHexString() });
        label.position.copy(pos);
        label.renderOrder = 2;
        label.material.sizeAttenuation = false;
        constellationLabels.add(label);
    }
}
rebuildConstellationLabels();

const RASHI_BELT_RADIUS = CONSTELLATION_RADIUS * 0.985;
const RASHI_LABEL_RADIUS = CONSTELLATION_RADIUS * 1.02;
const rashiLabelSprites = [];
const nakshatraLabelSprites = [];

const grahaGroup = new THREE.Group();
scene.add(grahaGroup);
const grahaSprites = [];
const grahaSpheres = [];
let rahuKetuOrbitLine = null;
let rahuKetuAxisLine = null;
let moonInclinedOrbitLine = null;
let moonOrbitGrid = null;
let precessionTrail = null;
let greatYearLabel = null;
let precProgressArc = null;

function initGrahaMarkers() {
    GRAHA_DATA.forEach(g => {
        const options = {
            font: 'Bold 48px Arial',
            size: 512,
            fillStyle: g.color,
            stroke: true,
            strokeColor: 'black',
            strokeWidth: 8
        };
        const sprite = _makeTextSprite(g.name + " " + g.symbol, options);
        sprite.userData = { key: g.key, options: options, baseName: g.name + " " + g.symbol };
        grahaGroup.add(sprite);
        grahaSprites.push(sprite);
    });

    // Create 3D Spheres for Rahu and Ketu (Local to Earth)
    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
    
    // Rahu
    const rahuMat = new THREE.MeshBasicMaterial({ color: 0xAAAAAA, wireframe: true });
    const rahuMesh = new THREE.Mesh(sphereGeo, rahuMat);
    rahuMesh.userData = { key: 'rahu' };
    const rahuLabel = _makeTextSprite("Rahu", { font: '24px Arial', fillStyle: '#AAAAAA' });
    rahuLabel.material.sizeAttenuation = false;
    rahuMesh.add(rahuLabel);
    grahaGroup.add(rahuMesh);
    grahaSpheres.push(rahuMesh);
    
    // Ketu
    const ketuMat = new THREE.MeshBasicMaterial({ color: 0x777777, wireframe: true });
    const ketuMesh = new THREE.Mesh(sphereGeo, ketuMat);
    ketuMesh.userData = { key: 'ketu' };
    const ketuLabel = _makeTextSprite("Ketu", { font: '24px Arial', fillStyle: '#777777' });
    ketuLabel.material.sizeAttenuation = false;
    ketuMesh.add(ketuLabel);
    grahaGroup.add(ketuMesh);
    grahaSpheres.push(ketuMesh);

    // Orbit Line
    const lineGeo = new THREE.BufferGeometry();
    const linePts = new Float32Array(129 * 3);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePts, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.3 });
    rahuKetuOrbitLine = new THREE.LineLoop(lineGeo, lineMat);
    grahaGroup.add(rahuKetuOrbitLine);

    // Line of Nodes (Rahu-Ketu Axis)
    const axisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const axisMat = new THREE.LineDashedMaterial({ color: 0xFFD700, dashSize: 2, gapSize: 1, transparent: true, opacity: 0.8, depthWrite: false });
    rahuKetuAxisLine = new THREE.Line(axisGeo, axisMat);
    grahaGroup.add(rahuKetuAxisLine);

    // Moon Inclined Orbit (Visual)
    const incLineGeo = new THREE.BufferGeometry();
    const incLinePts = new Float32Array(129 * 3);
    incLineGeo.setAttribute('position', new THREE.BufferAttribute(incLinePts, 3));
    const incLineMat = new THREE.LineBasicMaterial({ color: 0x00FFFF, transparent: true, opacity: 0.6 });
    moonInclinedOrbitLine = new THREE.LineLoop(incLineGeo, incLineMat);
    grahaGroup.add(moonInclinedOrbitLine);

    // Moon Orbit Plane Grid (Yellowish)
    moonOrbitGrid = new THREE.GridHelper(1, 20, 0xffff00, 0x555500);
    moonOrbitGrid.material.transparent = true;
    moonOrbitGrid.material.opacity = 0.15;
    grahaGroup.add(moonOrbitGrid);
}
initGrahaMarkers();

function updateGrahaMarkers() {
    const toggle = document.getElementById('grahas_toggle');
    const userVisible = toggle ? toggle.checked : true;
    if (!userVisible) {
        grahaGroup.visible = false;
        return;
    }
    let fadeOpacity = 1.0;
    if (bodies.earth && bodies.earth.Position) {
        const dist = camera.position.distanceTo(bodies.earth.Position);
        const startFade = CONSTELLATION_RADIUS * 0.4;
        const endFade = CONSTELLATION_RADIUS * 0.6;
        if (dist > endFade) { grahaGroup.visible = false; return; }
        if (dist > startFade) { fadeOpacity = 1.0 - (dist - startFade) / (endFade - startFade); }
    }
    grahaGroup.visible = true;

    if (!bodies.earth || !bodies.earth.Position) return;
    if (typeof J_D === 'undefined') return;

    const earthPos = bodies.earth.Position;
    // Place markers slightly inside the Rashi labels
    const R = RASHI_BELT_RADIUS * 0.96; 
    const currentJC = J_D / 36525.0;

    grahaSprites.forEach(sprite => {
        const key = sprite.userData.key;
        let ang = 0;
        let visible = true;

        if (key === 'rahu' || key === 'ketu') {
            // Mean Node: 125.04452 - 1934.136261 * T (T in centuries)
            const omega = 125.04452 - 1934.136261 * currentJC;
            let nodeDeg = omega % 360;
            if (nodeDeg < 0) nodeDeg += 360;
            
            if (key === 'rahu') ang = DegToRad(nodeDeg);
            else ang = DegToRad((nodeDeg + 180) % 360);
        } else {
            const body = bodies[key];
            if (!body || !body.Position) { visible = false; }
            else {
                // Geocentric Vector: Body - Earth
                const vec = new THREE.Vector3().subVectors(body.Position, earthPos);
                // Ecliptic Longitude (XZ plane)
                ang = Math.atan2(vec.z, vec.x);
            }
        }

        sprite.visible = visible;
        if (!visible) return;
        sprite.material.opacity = fadeOpacity;

        const x = R * Math.cos(ang);
        const z = R * Math.sin(ang);
        sprite.position.set(x, 0, z);

        // Update Text with Degree
        let deg = RadToDeg(ang);
        if (!useWesternZodiac) deg -= ayanamsaDeg;
        deg = (deg % 360 + 360) % 360;
        const signDeg = deg % 30;
        const d = Math.floor(signDeg);
        const m = Math.floor((signDeg - d) * 60);
        const degStr = `${d}°${m.toString().padStart(2, '0')}'`;
        
        const newText = `${sprite.userData.baseName} ${degStr}`;
        
        if (sprite.userData.lastText !== newText) {
            const options = sprite.userData.options;
            const canvas = document.createElement('canvas');
            const size = options.size || 256;
            canvas.width = size; canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.font = options.font || '28px Arial';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            if (options.stroke) { ctx.strokeStyle = options.strokeColor || 'black'; ctx.lineWidth = options.strokeWidth || 4; ctx.strokeText(newText, size / 2, size / 2); }
            ctx.fillStyle = options.fillStyle || 'white'; ctx.fillText(newText, size / 2, size / 2);
            const tex = new THREE.Texture(canvas); tex.needsUpdate = true;
            if (sprite.material.map) sprite.material.map.dispose();
            sprite.material.map = tex;
            sprite.userData.lastText = newText;
        }
    });

    // Update Spheres (Local to Earth)
    if (grahaSpheres.length > 0 && bodies.earth && bodies.earth.Position) {
        const earthPos = bodies.earth.Position;
        let dist = 30; // Default distance
        if (bodies.moon && bodies.moon.Position) {
            dist = bodies.moon.Position.distanceTo(earthPos);
        }

        // Calculate Node Position (Moved up to fix ReferenceError)
        const omega = 125.04452 - 1934.136261 * currentJC;
        let nodeDeg = omega % 360;
        if (nodeDeg < 0) nodeDeg += 360;
        
        if (rahuKetuOrbitLine) {
            const positions = rahuKetuOrbitLine.geometry.attributes.position.array;
            for (let i = 0; i <= 128; i++) {
                const t = (i / 128) * Math.PI * 2;
                positions[i * 3] = earthPos.x + dist * Math.cos(t);
                positions[i * 3 + 1] = earthPos.y;
                positions[i * 3 + 2] = earthPos.z + dist * Math.sin(t);
            }
            rahuKetuOrbitLine.geometry.attributes.position.needsUpdate = true;
            rahuKetuOrbitLine.material.opacity = 0.3 * fadeOpacity;
        }

        // Update Moon Orbit Grid
        if (moonOrbitGrid) {
            moonOrbitGrid.position.copy(earthPos);
            const gridSize = dist * 2.5; // Scale to be larger than orbit
            moonOrbitGrid.scale.set(gridSize, 1, gridSize);

            const inc = DegToRad(5.145);
            const nodeRad = DegToRad(nodeDeg);
            const axis = new THREE.Vector3(Math.cos(nodeRad), 0, Math.sin(nodeRad));
            moonOrbitGrid.quaternion.setFromAxisAngle(axis, inc);
            moonOrbitGrid.material.opacity = 0.15 * fadeOpacity;
        }

        // Update Inclined Orbit Line
        if (moonInclinedOrbitLine) {
            const positions = moonInclinedOrbitLine.geometry.attributes.position.array;
            const inc = DegToRad(5.145); // Moon inclination
            const nodeRad = DegToRad(nodeDeg);
            // Rotate around the Nodal Axis (which lies on XZ plane at angle nodeDeg)
            const axis = new THREE.Vector3(Math.cos(nodeRad), 0, Math.sin(nodeRad));
            const q = new THREE.Quaternion().setFromAxisAngle(axis, inc);

            for (let i = 0; i <= 128; i++) {
                const t = (i / 128) * Math.PI * 2;
                const v = new THREE.Vector3(dist * Math.cos(t), 0, dist * Math.sin(t));
                v.applyQuaternion(q);
                positions[i * 3] = earthPos.x + v.x;
                positions[i * 3 + 1] = earthPos.y + v.y;
                positions[i * 3 + 2] = earthPos.z + v.z;
            }
            moonInclinedOrbitLine.geometry.attributes.position.needsUpdate = true;
            moonInclinedOrbitLine.material.opacity = 0.6 * fadeOpacity;
        }

        // Update Axis Line
        if (rahuKetuAxisLine && grahaSpheres.length >= 2) {
            const posAttr = rahuKetuAxisLine.geometry.attributes.position;
            const rPos = grahaSpheres[0].position; // Rahu
            const kPos = grahaSpheres[1].position; // Ketu
            posAttr.setXYZ(0, rPos.x, rPos.y, rPos.z);
            posAttr.setXYZ(1, kPos.x, kPos.y, kPos.z);
            posAttr.needsUpdate = true;
            rahuKetuAxisLine.computeLineDistances();
            rahuKetuAxisLine.material.opacity = 0.8 * fadeOpacity;
        }

        grahaSpheres.forEach(mesh => {
            let ang = 0;
            const isRahu = mesh.userData.key === 'rahu';
            if (isRahu) ang = DegToRad(nodeDeg);
            else ang = DegToRad((nodeDeg + 180) % 360);
            
            mesh.position.set(
                earthPos.x + dist * Math.cos(ang),
                earthPos.y,
                earthPos.z + dist * Math.sin(ang)
            );
            
            mesh.scale.set(0.5, 0.5, 0.5);
            if (mesh.material) { mesh.material.transparent = true; mesh.material.opacity = fadeOpacity; }
            
            if (mesh.children.length > 0) {
                const lbl = mesh.children[0];
                lbl.scale.set(0.05, 0.05, 0.05);
                lbl.position.y = 1.5;

                // Update label text with degrees to show movement
                let deg = RadToDeg(ang);
                if (!useWesternZodiac) deg -= ayanamsaDeg;
                deg = (deg % 360 + 360) % 360;
                const signDeg = deg % 30;
                const d = Math.floor(signDeg);
                const m = Math.floor((signDeg - d) * 60);
                const degStr = `${d}°${m.toString().padStart(2, '0')}'`;
                const baseName = isRahu ? "Rahu" : "Ketu";
                const newText = `${baseName} ${degStr}`;

                if (lbl.userData.lastText !== newText) {
                    const canvas = document.createElement('canvas');
                    const size = 256;
                    canvas.width = size; canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    ctx.font = 'Bold 32px Arial';
                    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillStyle = isRahu ? '#AAAAAA' : '#777777';
                    ctx.fillText(newText, size / 2, size / 2);
                    const tex = new THREE.Texture(canvas); tex.needsUpdate = true;
                    if (lbl.material.map) lbl.material.map.dispose();
                    lbl.material.map = tex;
                    lbl.userData.lastText = newText;
                    lbl.material.needsUpdate = true;
                }
                lbl.material.opacity = fadeOpacity;
            }
        });
    }
}

const rashiBeltGroup = new THREE.Group();
scene.add(rashiBeltGroup);
rashiBeltGroup.visible = false;
rashiBeltGroup.frustumCulled = false;

const ayanamsaGroup = new THREE.Group();
scene.add(ayanamsaGroup);
ayanamsaGroup.visible = false;

function updateAyanamsaVisuals() {
    while (ayanamsaGroup.children.length) {
        const c = ayanamsaGroup.children[0];
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
        ayanamsaGroup.remove(c);
    }

    if (!ayanamsaGroup.visible) return;

    const radius = CONSTELLATION_RADIUS * 0.92;
    const angle = DegToRad(ayanamsaDeg);
    
    // Arc from 0 (Vernal Equinox) to angle (Sidereal Start)
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, angle, false, 0);
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, 0, p.y)));
    const material = new THREE.LineBasicMaterial({ color: 0x00FFFF, linewidth: 2 });
    const arc = new THREE.Line(geometry, material);
    ayanamsaGroup.add(arc);

    // Line to Sidereal 0
    const endX = radius * Math.cos(angle);
    const endZ = radius * Math.sin(angle);
    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(endX, 0, endZ)]);
    const lineMat = new THREE.LineDashedMaterial({ color: 0x00FFFF, dashSize: radius/20, gapSize: radius/40, transparent: true, opacity: 0.5 });
    const line = new THREE.Line(lineGeo, lineMat);
    line.computeLineDistances();
    ayanamsaGroup.add(line);

    const midAngle = angle / 2;
    const labelPos = new THREE.Vector3(radius * Math.cos(midAngle), 0, radius * Math.sin(midAngle)).multiplyScalar(0.95);
    const label = _makeTextSprite(`Ayanamsa\n${ayanamsaDeg.toFixed(2)}°`, { font: '24px Arial', fillStyle: '#00FFFF' });
    label.position.copy(labelPos);
    label.scale.set(0.1, 0.1, 0.1);
    ayanamsaGroup.add(label);
}

function updateRashiBelt() {
    const group = rashiBeltGroup;
    while (group.children.length > 0) {
        const child = group.children[0];
        group.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
    }
    rashiLabelSprites.length = 0;
    nakshatraLabelSprites.length = 0;

    const segments = RASHI_NAMES.length;
    const segmentAngle = (Math.PI * 2) / segments;
    const stepsPerRashi = 24;
    const offsetAngle = useWesternZodiac ? 0 : DegToRad(ayanamsaDeg);
    
    // Zodiac belt width is ~18 degrees (+/- 9 degrees from ecliptic)
    const latRad = DegToRad(9);
    const yOffset = Math.sin(latRad) * RASHI_BELT_RADIUS;
    const rProjected = Math.cos(latRad) * RASHI_BELT_RADIUS;

    // Pre-calculate top/bottom Y for the fill
    const yTop = yOffset;
    const yBottom = -yOffset;

    for (let i = 0; i < segments; i++) {
        const start = i * segmentAngle + offsetAngle;
        const color = RASHI_COLORS[i % RASHI_COLORS.length];
        const positions = [];

        // 1. Create Filled Mesh for Rashi Segment
        const fillPositions = [];
        const fillIndices = [];
        for (let s = 0; s <= stepsPerRashi; s++) {
            const theta = start + (s / stepsPerRashi) * segmentAngle;
            const c = Math.cos(theta);
            const sVal = Math.sin(theta);
            fillPositions.push(c * rProjected, yTop, sVal * rProjected);    // Top
            fillPositions.push(c * rProjected, yBottom, sVal * rProjected); // Bottom
        }
        for (let s = 0; s < stepsPerRashi; s++) {
            const a = 2 * s, b = 2 * s + 1, c = 2 * (s + 1), d = 2 * (s + 1) + 1;
            fillIndices.push(a, b, c, b, d, c);
        }
        const fillGeo = new THREE.BufferGeometry();
        fillGeo.setAttribute('position', new THREE.Float32BufferAttribute(fillPositions, 3));
        fillGeo.setIndex(fillIndices);
        const fillMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.15, side: THREE.DoubleSide, depthWrite: false });
        const fillMesh = new THREE.Mesh(fillGeo, fillMat);
        group.add(fillMesh);
        
        // Vertical divider at start of Rashi
        const cosStart = Math.cos(start);
        const sinStart = Math.sin(start);
        positions.push(
            cosStart * rProjected, -yOffset, sinStart * rProjected,
            cosStart * rProjected, yOffset, sinStart * rProjected
        );

        // Add degree markers
        const DEG_TO_RAD = Math.PI / 180;
        for (let deg = 5; deg < 30; deg += 5) {
            const markerAngle = start + deg * DEG_TO_RAD;
            const cosMarker = Math.cos(markerAngle);
            const sinMarker = Math.sin(markerAngle);
            // Make 15-degree marker slightly longer
            const markerHeightFactor = (deg === 15) ? 0.8 : 0.4;
            
            positions.push(
                cosMarker * rProjected, -yOffset * markerHeightFactor, sinMarker * rProjected,
                cosMarker * rProjected, yOffset * markerHeightFactor, sinMarker * rProjected
            );
        }

        // Add degree labels
        for (let deg = 5; deg < 30; deg += 5) {
            const labelAngle = start + deg * DEG_TO_RAD;
            const labelRadius = rProjected * 0.9; // Position inside the belt
            const lx = Math.cos(labelAngle) * labelRadius;
            const lz = Math.sin(labelAngle) * labelRadius;
            
            const label = _makeTextSprite(String(deg) + "°", {
                font: 'Bold 28px Arial',
                fillStyle: '#' + new THREE.Color(color).getHexString(),
                size: 128
            });
            label.material.sizeAttenuation = false;
            label.scale.set(0.04, 0.04, 0.04);
            label.position.set(lx, 0, lz);
            label.renderOrder = 2;
            group.add(label);
        }

        for (let s = 0; s < stepsPerRashi; s++) {
            const a0 = start + (s / stepsPerRashi) * segmentAngle;
            const a1 = start + ((s + 1) / stepsPerRashi) * segmentAngle;
            
            const c0 = Math.cos(a0), s0 = Math.sin(a0);
            const c1 = Math.cos(a1), s1 = Math.sin(a1);
            
            // Center line (Ecliptic), Top (+9 deg), Bottom (-9 deg)
            positions.push(c0 * RASHI_BELT_RADIUS, 0, s0 * RASHI_BELT_RADIUS, c1 * RASHI_BELT_RADIUS, 0, s1 * RASHI_BELT_RADIUS);
            positions.push(c0 * rProjected, yOffset, s0 * rProjected, c1 * rProjected, yOffset, s1 * rProjected);
            positions.push(c0 * rProjected, -yOffset, s0 * rProjected, c1 * rProjected, -yOffset, s1 * rProjected);
        }

        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const m = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.6, depthWrite: false });
        const lines = new THREE.LineSegments(g, m);
        lines.renderOrder = 1;
        group.add(lines);

        const mid = start + segmentAngle * 0.5;
        const lx = Math.cos(mid) * RASHI_LABEL_RADIUS;
        const lz = Math.sin(mid) * RASHI_LABEL_RADIUS;
        const name = useWesternZodiac ? WESTERN_RASHI_NAMES[i] : RASHI_NAMES[i];
        
        const label = _makeTextSprite(name, {
            font: 'Bold 64px Arial',
            size: 512,
            fillStyle: '#' + new THREE.Color(color).multiplyScalar(0.8).getHexString(),
            stroke: true,
            strokeColor: 'black',
            strokeWidth: 8
        });
        label.material.sizeAttenuation = false;
        label.position.set(lx, 0, lz);
        label.renderOrder = 2;
        group.add(label);
        rashiLabelSprites.push(label);
    }

    // Draw Nakshatras
    if (!useWesternZodiac) {
    const nakCount = NAKSHATRA_NAMES.length;
    const nakAngle = (Math.PI * 2) / nakCount;
    const NAK_LABEL_RADIUS = CONSTELLATION_RADIUS * 1.05;

    for (let i = 0; i < nakCount; i++) {
        const angle = i * nakAngle + offsetAngle;
        const rashiIndex = Math.floor(angle / segmentAngle) % 12;
        const color = RASHI_COLORS[rashiIndex];

        // Divider line (skip if aligns with Rashi start)
        if (i % 9 !== 0) {
            const c = Math.cos(angle);
            const s = Math.sin(angle);
            const positions = [
                c * rProjected, -yOffset, s * rProjected,
                c * rProjected, yOffset, s * rProjected
            ];
            const gNak = new THREE.BufferGeometry();
            gNak.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            const mNak = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.4, depthWrite: false });
            const linesNak = new THREE.LineSegments(gNak, mNak);
            linesNak.renderOrder = 1;
            group.add(linesNak);
        }
        
        // Pada Ticks (4 quarters per Nakshatra)
        const padaPositions = [];
        const padaStep = nakAngle / 4;
        for (let p = 1; p < 4; p++) {
            const pAngle = angle + p * padaStep;
            const cP = Math.cos(pAngle);
            const sP = Math.sin(pAngle);
            const tickSize = yOffset * 0.25;
            padaPositions.push(cP * rProjected, -yOffset, sP * rProjected, cP * rProjected, -yOffset + tickSize, sP * rProjected);
            padaPositions.push(cP * rProjected, yOffset, sP * rProjected, cP * rProjected, yOffset - tickSize, sP * rProjected);
        }
        const gPada = new THREE.BufferGeometry();
        gPada.setAttribute('position', new THREE.Float32BufferAttribute(padaPositions, 3));
        const mPada = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.3, depthWrite: false });
        const linesPada = new THREE.LineSegments(gPada, mPada);
        group.add(linesPada);

        // Nakshatra Label
        const mid = angle + nakAngle * 0.5;
        const midRashiIndex = Math.floor(mid / segmentAngle) % 12;
        const labelColor = RASHI_COLORS[midRashiIndex];
        
        const lx = Math.cos(mid) * NAK_LABEL_RADIUS;
        const lz = Math.sin(mid) * NAK_LABEL_RADIUS;
        
        const label = _makeTextSprite(NAKSHATRA_NAMES[i], {
            font: 'Bold 48px Arial',
            fillStyle: '#' + new THREE.Color(labelColor).getHexString(),
            size: 512
        });
        label.material.sizeAttenuation = false;
        label.position.set(lx, 0, lz);
        label.renderOrder = 2;
        group.add(label);
        nakshatraLabelSprites.push(label);
    }
    }
    updateAyanamsaVisuals();
}

updateRashiBelt();

function updateMoonLabel() {
    if (!bodies.moon || !bodies.moon.label) return;

    const moonLabel = bodies.moon.label;
    const baseName = "Moon";
    const defaultOptions = { font: 'Bold 24px Arial', fillStyle: 'white', size: 256 };

    if (!moonLabel.visible || useWesternZodiac) {
        // If label is not visible or we are in western mode, reset it to default if needed.
        if (moonLabel.userData && moonLabel.userData.lastText !== baseName) {
             _updateTextSprite(moonLabel, baseName, defaultOptions);
        }
        return;
    }

    // 1. Calculate Nakshatra
    const earthPos = bodies.earth.Position;
    const vec = new THREE.Vector3().subVectors(bodies.moon.Position, earthPos);
    let ang = Math.atan2(vec.z, vec.x);
    let deg = RadToDeg(ang);
    deg = (deg - ayanamsaDeg + 360) % 360;
    const nakshatraSizeDeg = 360 / 27;
    const nakIndex = Math.floor(deg / nakshatraSizeDeg);
    const nakName = NAKSHATRA_NAMES[nakIndex];

    // 2. Update label text
    const newText = `${baseName}\n(${nakName})`;
    _updateTextSprite(moonLabel, newText, defaultOptions);
}

function initNakshatraHighlight() {
    const yOffset = Math.sin(DegToRad(9)) * RASHI_BELT_RADIUS;
    const pathPoints = [];
    for (let i = 0; i <= NAKSHATRA_HIGHLIGHT_SEGMENTS; i++) {
        const t = (i / NAKSHATRA_HIGHLIGHT_SEGMENTS) * Math.PI * 2;
        pathPoints.push(new THREE.Vector3(Math.cos(t) * RASHI_BELT_RADIUS, 0, Math.sin(t) * RASHI_BELT_RADIUS));
    }
    const path = new THREE.CatmullRomCurve3(pathPoints);
    const geo = new THREE.TubeBufferGeometry(path, NAKSHATRA_HIGHLIGHT_SEGMENTS, yOffset, 4, true);
    const mat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false });
    currentNakshatraHighlight = new THREE.Mesh(geo, mat);
    currentNakshatraHighlight.visible = false;
    currentNakshatraHighlight.renderOrder = 3; // On top of rashi belt fills
    rashiBeltGroup.add(currentNakshatraHighlight);
}
initNakshatraHighlight();

function updateCurrentNakshatraHighlight() {
    const toggle = document.getElementById('nakshatra_highlight_toggle');
    if (!currentNakshatraHighlight || !toggle || !toggle.checked || useWesternZodiac) {
        if (currentNakshatraHighlight) currentNakshatraHighlight.visible = false;
        return;
    }

    if (!bodies.moon || !bodies.moon.Position || !bodies.earth || !bodies.earth.Position) {
        if (currentNakshatraHighlight) currentNakshatraHighlight.visible = false;
        return;
    }
    
    currentNakshatraHighlight.visible = true;

    // 1. Get Moon's sidereal longitude
    const earthPos = bodies.earth.Position;
    const vec = new THREE.Vector3().subVectors(bodies.moon.Position, earthPos);
    let ang = Math.atan2(vec.z, vec.x);
    let deg = RadToDeg(ang);
    deg = (deg - ayanamsaDeg + 360) % 360;

    // 2. Get Nakshatra index
    const nakshatraSizeDeg = 360 / 27;
    const nakIndex = Math.floor(deg / nakshatraSizeDeg);

    // 3. Rotate the highlight ring to account for ayanamsa
    currentNakshatraHighlight.rotation.y = DegToRad(ayanamsaDeg);

    // 4. Set draw range to show only the current Nakshatra segment
    const indicesPerNakshatra = currentNakshatraHighlight.geometry.index.count / 27;
    currentNakshatraHighlight.geometry.setDrawRange(Math.floor(nakIndex * indicesPerNakshatra), Math.floor(indicesPerNakshatra));
}

// Visual Helpers: Ecliptic Plane, Celestial Sphere, Earth Axis
const helpersGroup = new THREE.Group();
scene.add(helpersGroup);

// 1. Ecliptic Grid (Dynamic)
const eclipticGrid = new THREE.GridHelper(1, 64, 0xffffff, 0xffffff);
eclipticGrid.material = new THREE.ShaderMaterial({
    uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        opacity: { value: 0.15 },
        time: { value: 0 }
    },
    vertexShader: `
        varying vec3 vPos;
        void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 color;
        uniform float opacity;
        uniform float time;
        varying vec3 vPos;
        void main() {
            float r = length(vPos.xz);
            float alpha = 1.0 - smoothstep(0.35, 0.5, r);
            float pulse = 0.7 + 0.3 * sin(time * 1.5);
            gl_FragColor = vec4(color, opacity * alpha * pulse);
        }
    `,
    transparent: true,
    depthWrite: false
});
helpersGroup.add(eclipticGrid);

// 1b. Ecliptic Line on Celestial Sphere
const eclipticLineGeo = new THREE.BufferGeometry();
const eclipticLinePts = [];
for (let i = 0; i <= 128; i++) {
    const t = (i / 128) * Math.PI * 2;
    eclipticLinePts.push(Math.cos(t) * CONSTELLATION_RADIUS, 0, Math.sin(t) * CONSTELLATION_RADIUS);
}
eclipticLineGeo.setAttribute('position', new THREE.Float32BufferAttribute(eclipticLinePts, 3));
const eclipticLine = new THREE.Line(eclipticLineGeo, new THREE.LineBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.6 }));
helpersGroup.add(eclipticLine);

// 2. Celestial Sphere (Wireframe, Tilted)
const celSphereGeo = new THREE.SphereGeometry(CONSTELLATION_RADIUS * 0.99, 48, 24);
const celSphereMat = new THREE.MeshBasicMaterial({ color: 0x222222, wireframe: true, transparent: true, opacity: 0.15 });
const celSphere = new THREE.Mesh(celSphereGeo, celSphereMat);
celSphere.rotation.x = -CONSTELLATION_TILT;
helpersGroup.add(celSphere);

// 2b. Celestial Equator (Line on Celestial Sphere)
const celEqPts = [];
for (let i = 0; i <= 128; i++) {
    const t = (i / 128) * Math.PI * 2;
    const x = Math.cos(t) * CONSTELLATION_RADIUS;
    const z = Math.sin(t) * CONSTELLATION_RADIUS;
    const y = 0;
    // Rotate by -CONSTELLATION_TILT around X (to match Celestial Sphere orientation)
    const y2 = y * Math.cos(-CONSTELLATION_TILT) - z * Math.sin(-CONSTELLATION_TILT);
    const z2 = y * Math.sin(-CONSTELLATION_TILT) + z * Math.cos(-CONSTELLATION_TILT);
    celEqPts.push(x, y2, z2);
}
const celEqGeo = new THREE.BufferGeometry();
celEqGeo.setAttribute('position', new THREE.Float32BufferAttribute(celEqPts, 3));
const celEqLine = new THREE.Line(celEqGeo, new THREE.LineBasicMaterial({ color: 0x00ccff, transparent: true, opacity: 0.6 }));
helpersGroup.add(celEqLine);

// 3. Earth Axis (Red Line)
const axisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -CONSTELLATION_RADIUS, 0), new THREE.Vector3(0, CONSTELLATION_RADIUS, 0)]);
const axisMat = new THREE.LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.6 });
const earthAxisLine = new THREE.Line(axisGeo, axisMat);
earthAxisLine.rotation.x = -CONSTELLATION_TILT;
helpersGroup.add(earthAxisLine);

// 3b. Earth Axis (Red Line - Local Scale for Zoom)
const localAxisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -100, 0), new THREE.Vector3(0, 100, 0)]);
const localAxisMat = new THREE.LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 });
const localEarthAxisLine = new THREE.Line(localAxisGeo, localAxisMat);
helpersGroup.add(localEarthAxisLine);

// 4. Earth Ecliptic Normal (Green Line - Celestial Scale)
const normalGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -CONSTELLATION_RADIUS, 0), new THREE.Vector3(0, CONSTELLATION_RADIUS, 0)]);
const normalMat = new THREE.LineDashedMaterial({ color: 0x00ff00, dashSize: CONSTELLATION_RADIUS / 20, gapSize: CONSTELLATION_RADIUS / 40, transparent: true, opacity: 0.5 });
const earthNormalLine = new THREE.Line(normalGeo, normalMat);
earthNormalLine.computeLineDistances();
helpersGroup.add(earthNormalLine);

// 4b. Earth Ecliptic Normal (Green Line - Local Scale for Zoom)
const localNormalGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -100, 0), new THREE.Vector3(0, 100, 0)]);
const localNormalMat = new THREE.LineDashedMaterial({ color: 0x00ff00, dashSize: 2, gapSize: 1, transparent: true, opacity: 0.8 });
const localEarthNormalLine = new THREE.Line(localNormalGeo, localNormalMat);
localEarthNormalLine.computeLineDistances();
helpersGroup.add(localEarthNormalLine);

// 5. Angle Arc
const arcRadius = 1.5;
const arcPts = [];
const arcSteps = 20;
for (let i = 0; i <= arcSteps; i++) {
    const t = (i / arcSteps) * CONSTELLATION_TILT;
    const c = Math.cos(t);
    const s = Math.sin(t);
    arcPts.push(0, c * arcRadius, -s * arcRadius);
}
const arcGeo = new THREE.BufferGeometry();
arcGeo.setAttribute('position', new THREE.Float32BufferAttribute(arcPts, 3));
const arcMat = new THREE.LineBasicMaterial({ color: 0xffff00 });
const earthTiltArc = new THREE.Line(arcGeo, arcMat);
helpersGroup.add(earthTiltArc);

// 6. Tilt Label
const tiltLabel = _makeTextSprite("23.5°", { font: 'Bold 32px Arial', fillStyle: '#ffff00' });
tiltLabel.material.sizeAttenuation = false;
tiltLabel.scale.set(0.15, 0.15, 0.15);
helpersGroup.add(tiltLabel);

// 7. Ecliptic Label
const eclipticLabel = _makeTextSprite("Ecliptic", { font: '24px Arial', fillStyle: '#ffff00' });
eclipticLabel.material.sizeAttenuation = false;
eclipticLabel.scale.set(0.12, 0.12, 0.12);
const angEc = DegToRad(45);
eclipticLabel.position.set(Math.cos(angEc) * CONSTELLATION_RADIUS, 0, Math.sin(angEc) * CONSTELLATION_RADIUS);
helpersGroup.add(eclipticLabel);

// 8. Celestial Equator Label
const celEqLabel = _makeTextSprite("Celestial Equator", { font: '24px Arial', fillStyle: '#00ccff' });
celEqLabel.material.sizeAttenuation = false;
celEqLabel.scale.set(0.12, 0.12, 0.12);
const angEq = DegToRad(225);
const xEq = Math.cos(angEq) * CONSTELLATION_RADIUS;
const zEq = Math.sin(angEq) * CONSTELLATION_RADIUS;
const yEq2 = -zEq * Math.sin(-CONSTELLATION_TILT);
const zEq2 = zEq * Math.cos(-CONSTELLATION_TILT);
celEqLabel.position.set(xEq, yEq2, zEq2);
helpersGroup.add(celEqLabel);

// 9. Equinox & Solstice Markers
const equinoxSolsticeGroup = new THREE.Group();
helpersGroup.add(equinoxSolsticeGroup);

const vernalPos = new THREE.Vector3(CONSTELLATION_RADIUS, 0, 0);
const vernalMarkerGeo = new THREE.SphereGeometry(CONSTELLATION_RADIUS * 0.005, 16, 16);
const vernalMarkerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const vernalMarker = new THREE.Mesh(vernalMarkerGeo, vernalMarkerMat);
vernalMarker.position.copy(vernalPos);
equinoxSolsticeGroup.add(vernalMarker);

const vernalLabel = _makeTextSprite("Vernal Equinox (♈)", { font: 'Bold 24px Arial', fillStyle: '#ffffff' });
vernalLabel.material.sizeAttenuation = false;
vernalLabel.scale.set(0.12, 0.12, 0.12);
vernalLabel.position.copy(vernalPos).multiplyScalar(1.05);
equinoxSolsticeGroup.add(vernalLabel);

// 10. Autumnal Equinox Marker (Intersection at -X)
const autumnalPos = new THREE.Vector3(-CONSTELLATION_RADIUS, 0, 0);
const autumnalMarker = new THREE.Mesh(vernalMarkerGeo, vernalMarkerMat);
autumnalMarker.position.copy(autumnalPos);
equinoxSolsticeGroup.add(autumnalMarker);

const autumnalLabel = _makeTextSprite("Autumnal Equinox (♎)", { font: 'Bold 24px Arial', fillStyle: '#ffffff' });
autumnalLabel.material.sizeAttenuation = false;
autumnalLabel.scale.set(0.12, 0.12, 0.12);
autumnalLabel.position.copy(autumnalPos).multiplyScalar(1.05);
equinoxSolsticeGroup.add(autumnalLabel);

// Solstice Material (Orange)
const solsticeMarkerMat = new THREE.MeshBasicMaterial({ color: 0xFFAA00 });

// 11. Summer Solstice Marker (Intersection at +Z)
const summerPos = new THREE.Vector3(0, 0, CONSTELLATION_RADIUS);
const summerMarker = new THREE.Mesh(vernalMarkerGeo, solsticeMarkerMat);
summerMarker.position.copy(summerPos);
equinoxSolsticeGroup.add(summerMarker);

const summerLabel = _makeTextSprite("Summer Solstice (♋)", { font: 'Bold 24px Arial', fillStyle: '#FFAA00' });
summerLabel.material.sizeAttenuation = false;
summerLabel.scale.set(0.12, 0.12, 0.12);
summerLabel.position.copy(summerPos).multiplyScalar(1.05);
equinoxSolsticeGroup.add(summerLabel);

// 12. Winter Solstice Marker (Intersection at -Z)
const winterPos = new THREE.Vector3(0, 0, -CONSTELLATION_RADIUS);
const winterMarker = new THREE.Mesh(vernalMarkerGeo, solsticeMarkerMat);
winterMarker.position.copy(winterPos);
equinoxSolsticeGroup.add(winterMarker);

const winterLabel = _makeTextSprite("Winter Solstice (♑)", { font: 'Bold 24px Arial', fillStyle: '#FFAA00' });
winterLabel.material.sizeAttenuation = false;
winterLabel.scale.set(0.12, 0.12, 0.12);
winterLabel.position.copy(winterPos).multiplyScalar(1.05);
equinoxSolsticeGroup.add(winterLabel);

// 13. Earth Ecliptic Marker (Follows Earth)
const earthEcMarkerGeo = new THREE.SphereGeometry(0.5, 16, 16);
const earthEcMarkerMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
const earthEcMarker = new THREE.Mesh(earthEcMarkerGeo, earthEcMarkerMat);
helpersGroup.add(earthEcMarker);

// 14. Earth Ecliptic Date Label
const earthEcDateLabel = _makeTextSprite("", { font: '24px Arial', fillStyle: '#ffffff' });
earthEcDateLabel.material.sizeAttenuation = false;
earthEcDateLabel.scale.set(0.12, 0.12, 0.12);
earthEcDateLabel.visible = false;
helpersGroup.add(earthEcDateLabel);

// 15. Earth Ecliptic Trail
const earthTrailPoints = [];
const earthTrailGeo = new THREE.BufferGeometry();
const earthTrailMat = new THREE.LineBasicMaterial({ color: 0x666666 });
const earthTrail = new THREE.Line(earthTrailGeo, earthTrailMat);
helpersGroup.add(earthTrail);

// 16. Earth Ecliptic Vertical Line
const earthEcLineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)]);
const earthEcLineMat = new THREE.LineDashedMaterial({ color: 0x888888, dashSize: 1, gapSize: 0.5, transparent: true, opacity: 0.5 });
const earthEcLine = new THREE.Line(earthEcLineGeo, earthEcLineMat);
helpersGroup.add(earthEcLine);

// 17. Dhruva (Polaris) Marker & Label
const dhruvaPos = new THREE.Vector3(0, CONSTELLATION_RADIUS, 0);
dhruvaPos.applyAxisAngle(new THREE.Vector3(1, 0, 0), -CONSTELLATION_TILT);

const dhruvaMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
const dhruvaGeo = new THREE.SphereGeometry(CONSTELLATION_RADIUS * 0.006, 16, 16);
const dhruvaMarker = new THREE.Mesh(dhruvaGeo, dhruvaMat);
dhruvaMarker.position.copy(dhruvaPos);
dhruvaMarker.owner = {
    name: "Dhruva (Polaris)",
    info: "<b>Dhruva (Polaris)</b><br>The Pole Star (North Star).<br>Constellation: Ursa Minor",
    Position: dhruvaMarker.position,
    Orbit: { visible: false, material: { uniforms: { colorA: { value: new THREE.Color() } }, needsUpdate: false } },
    color: 0xffffff
};
Castable.push(dhruvaMarker);
helpersGroup.add(dhruvaMarker);

// 17b. Dynamic Pole Star Label
const poleStarLabel = _makeTextSprite("Polaris", { font: 'Bold 40px Arial', fillStyle: '#AAAAFF', size: 512 });
poleStarLabel.material.sizeAttenuation = false;
poleStarLabel.scale.set(0.12, 0.12, 0.12);
helpersGroup.add(poleStarLabel);

// 18. North/South on Earth Normal Line (Dashed)
const northLabel = _makeTextSprite("North", { font: 'Bold 32px Arial', fillStyle: '#00ff00' });
northLabel.material.sizeAttenuation = false;
northLabel.scale.set(0.15, 0.15, 0.15);
northLabel.position.set(0, CONSTELLATION_RADIUS * 1.02, 0);
helpersGroup.add(northLabel);

const southLabel = _makeTextSprite("South", { font: 'Bold 32px Arial', fillStyle: '#00ff00' });
southLabel.material.sizeAttenuation = false;
southLabel.scale.set(0.15, 0.15, 0.15);
southLabel.position.set(0, -CONSTELLATION_RADIUS * 1.02, 0);
helpersGroup.add(southLabel);

// 19. Saptarishi (Big Dipper)
const saptarishiGroup = new THREE.Group();
helpersGroup.add(saptarishiGroup);
const saptarishiLabelsGroup = new THREE.Group();
saptarishiGroup.add(saptarishiLabelsGroup);
const saptarishiStars = [];

const SAPTARISHI_DATA = [
    { name: "Kratu (Dubhe)", ra: 165.93, dec: 61.75 }, // Alpha
    { name: "Pulaha (Merak)", ra: 165.46, dec: 56.38 }, // Beta
    { name: "Pulastya (Phecda)", ra: 178.46, dec: 53.69 }, // Gamma
    { name: "Atri (Megrez)", ra: 183.86, dec: 57.03 }, // Delta
    { name: "Angiras (Alioth)", ra: 193.51, dec: 55.96 }, // Epsilon
    { name: "Vashistha (Mizar)", ra: 200.98, dec: 54.92 }, // Zeta
    { name: "Marichi (Alkaid)", ra: 206.88, dec: 49.31 }  // Eta
];

// Calculate positions
const saptarishiPoints = SAPTARISHI_DATA.map(s => raDecToVector(s.ra, s.dec, CONSTELLATION_RADIUS));

// Draw Stars & Labels
saptarishiPoints.forEach((pos, i) => {
    const starGeo = new THREE.SphereGeometry(CONSTELLATION_RADIUS * 0.005, 16, 16);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true });
    const starMesh = new THREE.Mesh(starGeo, starMat);
    starMesh.position.copy(pos).multiplyScalar(0.995); // Slightly closer to avoid z-fighting
    
    starMesh.owner = {
        name: SAPTARISHI_DATA[i].name,
        info: `<b>${SAPTARISHI_DATA[i].name}</b><br>Saptarishi (Big Dipper)`,
        Position: starMesh.position,
        Orbit: { visible: false, material: { uniforms: { colorA: { value: new THREE.Color() } }, needsUpdate: false } },
        color: 0xffffff
    };
    Castable.push(starMesh);
    
    saptarishiGroup.add(starMesh);
    saptarishiStars.push(starMesh);

    const label = _makeTextSprite(SAPTARISHI_DATA[i].name, { font: '32px Arial', fillStyle: '#FFA500', size: 512 });
    label.material.sizeAttenuation = false;
    label.scale.set(0.15, 0.15, 0.15);
    label.position.copy(pos).multiplyScalar(1.01);
    label.position.y += CONSTELLATION_RADIUS * 0.025;
    saptarishiLabelsGroup.add(label);
});

// Draw Constellation Lines
// Sequence: Alkaid(6)->Mizar(5)->Alioth(4)->Megrez(3)->Phecda(2)->Merak(1)->Dubhe(0)->Megrez(3)
const sapIndices = [6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 3];
const sapLinePts = [];
sapIndices.forEach(idx => sapLinePts.push(saptarishiPoints[idx]));
const sapLineGeo = new THREE.BufferGeometry().setFromPoints(sapLinePts);
const sapLineMat = new THREE.LineBasicMaterial({ color: 0xFFFF00, transparent: true, opacity: 1.0, linewidth: 3 });
const sapLine = new THREE.LineSegments(sapLineGeo, sapLineMat);
saptarishiGroup.add(sapLine);

// Pointer to Dhruva (Dubhe -> Dhruva)
const pointerGeo = new THREE.BufferGeometry().setFromPoints([saptarishiPoints[0], dhruvaPos]);
const pointerMat = new THREE.LineDashedMaterial({ color: 0xFFD700, dashSize: CONSTELLATION_RADIUS/30, gapSize: CONSTELLATION_RADIUS/60, transparent: true, opacity: 0.5 });
const pointerLine = new THREE.Line(pointerGeo, pointerMat);
pointerLine.computeLineDistances();
saptarishiGroup.add(pointerLine);

// Main Label
const sapLabel = _makeTextSprite("Saptarishi (Big Dipper)", { font: 'Bold 40px Arial', fillStyle: '#FFD700', size: 512 });
sapLabel.material.sizeAttenuation = false;
sapLabel.scale.set(0.15, 0.15, 0.15);
const centerPos = new THREE.Vector3().addVectors(saptarishiPoints[3], saptarishiPoints[4]).multiplyScalar(0.5).multiplyScalar(1.05);
sapLabel.position.copy(centerPos);
saptarishiGroup.add(sapLabel);

// 23. Swastika Pattern (Seasonal Rotation of Saptarishi)
const swastikaGroup = new THREE.Group();
helpersGroup.add(swastikaGroup);
swastikaGroup.visible = false;

for (let k = 0; k < 4; k++) {
    const offset = k * 90; // 90, 180, 270 degrees
    const pts = SAPTARISHI_DATA.map(s => raDecToVector(s.ra + offset, s.dec, CONSTELLATION_RADIUS));
    const linePts = [];
    sapIndices.forEach(idx => linePts.push(pts[idx]));
    const geo = new THREE.BufferGeometry().setFromPoints(linePts);
    const mat = new THREE.LineDashedMaterial({ color: 0xFF9933, dashSize: CONSTELLATION_RADIUS/40, gapSize: CONSTELLATION_RADIUS/80, transparent: true, opacity: 0.6, linewidth: 2 });
    const line = new THREE.LineSegments(geo, mat);
    line.computeLineDistances();
    swastikaGroup.add(line);
}

// 24. Galactic Center
const galacticCenterGroup = new THREE.Group();
helpersGroup.add(galacticCenterGroup);
const gcRa = 266.4168;
const gcDec = -29.0078;
const gcPos = raDecToVector(gcRa, gcDec, CONSTELLATION_RADIUS * 0.95);
const gcGeo = new THREE.SphereGeometry(CONSTELLATION_RADIUS * 0.002, 16, 16);
const gcMat = new THREE.MeshBasicMaterial({ color: 0xFF00FF, transparent: true, opacity: 0.8 });
const gcMesh = new THREE.Mesh(gcGeo, gcMat);
gcMesh.position.copy(gcPos);
gcMesh.owner = {
    name: "Galactic Center",
    info: "<b>Galactic Center</b><br>Sagittarius A*<br>Distance: ~26,000 ly",
    Position: gcMesh.position,
    Orbit: { visible: false, material: { uniforms: { colorA: { value: new THREE.Color() } }, needsUpdate: false } },
    color: 0xFF00FF
};
Castable.push(gcMesh);
galacticCenterGroup.add(gcMesh);
const gcLabel = _makeTextSprite("Galactic Center", { font: 'Bold 32px Arial', fillStyle: '#FF00FF', size: 512 });
gcLabel.scale.set(0.15, 0.15, 0.15);
gcLabel.material.sizeAttenuation = false;
gcLabel.position.copy(gcPos).multiplyScalar(1.02);
gcLabel.position.y += CONSTELLATION_RADIUS * 0.02;
galacticCenterGroup.add(gcLabel);

// Line to Galactic Center
const gcLineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), gcPos]);
const gcLineMat = new THREE.LineDashedMaterial({ color: 0xFF00FF, dashSize: CONSTELLATION_RADIUS / 20, gapSize: CONSTELLATION_RADIUS / 40, transparent: true, opacity: 0.4 });
const gcLine = new THREE.Line(gcLineGeo, gcLineMat);
gcLine.computeLineDistances();
galacticCenterGroup.add(gcLine);

const gcDistLabel = _makeTextSprite("Distance: ~26,000 ly", { font: 'Bold 24px Arial', fillStyle: '#FF00FF', size: 256 });
gcDistLabel.material.sizeAttenuation = false;
gcDistLabel.scale.set(0.12, 0.12, 0.12);
gcDistLabel.visible = true;
gcDistLabel.position.copy(gcPos).multiplyScalar(0.5);
galacticCenterGroup.add(gcDistLabel);

// Voyager 1 Marker
const voyagerGroup = new THREE.Group();
helpersGroup.add(voyagerGroup);

const voyagerGeo = new THREE.SphereGeometry(200, 16, 16);
const voyagerMat = new THREE.MeshBasicMaterial({ color: 0x00AAFF });
const voyagerMesh = new THREE.Mesh(voyagerGeo, voyagerMat);
voyagerMesh.owner = {
    name: "Voyager 1",
    info: "<b>Voyager 1</b><br>Launched: 1977<br>Interstellar Space",
    Position: voyagerMesh.position,
    Orbit: { visible: false, material: { uniforms: { colorA: { value: new THREE.Color() } }, needsUpdate: false } },
    color: 0x00AAFF
};
Castable.push(voyagerMesh);
voyagerGroup.add(voyagerMesh);

const voyagerLabel = _makeTextSprite("Voyager 1", { font: '24px Arial', fillStyle: '#00AAFF' });
voyagerLabel.material.sizeAttenuation = false;
voyagerLabel.scale.set(0.1, 0.1, 0.1);
voyagerGroup.add(voyagerLabel);

const voyagerLineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)]);
const voyagerLineMat = new THREE.LineDashedMaterial({ color: 0x00AAFF, dashSize: 2000, gapSize: 1000, transparent: true, opacity: 0.4 });
const voyagerLine = new THREE.Line(voyagerLineGeo, voyagerLineMat);
voyagerGroup.add(voyagerLine);

function updateVoyager() {
    if (!voyagerGroup.visible) return;
    const distAU = 75 + 360 * J_C;
    const distScene = distAU * 14960;
    const pos = raDecToVector(258.25, 12.13, distScene);
    voyagerMesh.position.copy(pos);
    voyagerLabel.position.copy(pos).multiplyScalar(1.02);
    const positions = voyagerLine.geometry.attributes.position.array;
    positions[0] = 0; positions[1] = 0; positions[2] = 0;
    positions[3] = pos.x; positions[4] = pos.y; positions[5] = pos.z;
    voyagerLine.geometry.attributes.position.needsUpdate = true;
    voyagerLine.computeLineDistances();
    voyagerMesh.owner.info = `<b>Voyager 1</b><br>Dist: ${distAU.toFixed(2)} AU<br>Speed: 17 km/s`;
    if (info_target === voyagerMesh.owner && document.getElementById("info")) {
         document.getElementById("info").innerHTML = voyagerMesh.owner.info;
    }
}

// Andromeda Galaxy (M31)
const andromedaGroup = new THREE.Group();
helpersGroup.add(andromedaGroup);

// RA 00h 42m 44s = 10.68 deg, Dec +41d 16m 09s = 41.27 deg
const m31Pos = raDecToVector(10.68, 41.27, CONSTELLATION_RADIUS * 0.92);
// Flattened sphere to look like a galaxy disk
const m31Geo = new THREE.SphereGeometry(CONSTELLATION_RADIUS * 0.015, 32, 16);
m31Geo.applyMatrix4(new THREE.Matrix4().makeScale(1, 1, 0.2)); 
const m31Mat = new THREE.MeshBasicMaterial({ color: 0xAAAAFF, transparent: true, opacity: 0.6 });
const m31Mesh = new THREE.Mesh(m31Geo, m31Mat);
m31Mesh.position.copy(m31Pos);
m31Mesh.lookAt(0,0,0); 
m31Mesh.owner = {
    name: "Andromeda Galaxy (M31)",
    info: "<b>Andromeda Galaxy (M31)</b><br>Distance: ~2.5 million ly<br>Spiral Galaxy",
    Position: m31Mesh.position,
    Orbit: { visible: false, material: { uniforms: { colorA: { value: new THREE.Color() } }, needsUpdate: false } },
    color: 0xAAAAFF
};
Castable.push(m31Mesh);
andromedaGroup.add(m31Mesh);

const m31Label = _makeTextSprite("Andromeda (M31)", { font: 'Bold 24px Arial', fillStyle: '#AAAAFF', size: 256 });
m31Label.material.sizeAttenuation = false;
m31Label.scale.set(0.12, 0.12, 0.12);
m31Label.position.copy(m31Pos).multiplyScalar(1.02);
andromedaGroup.add(m31Label);

// Nearest Stars Visualization
const nearestStarsGroup = new THREE.Group();
helpersGroup.add(nearestStarsGroup);
nearestStarsGroup.visible = false;

const NEAREST_STARS_DATA = [
    { name: "Proxima Centauri", ra: 217.43, dec: -62.68, dist: 4.24, color: 0xFF0000 },
    { name: "Alpha Centauri", ra: 219.90, dec: -60.83, dist: 4.37, color: 0xFFFFCC },
    { name: "Barnard's Star", ra: 269.45, dec: 4.69, dist: 5.96, color: 0xFF4400 },
    { name: "Wolf 359", ra: 164.12, dec: 7.01, dist: 7.78, color: 0xFF0000 },
    { name: "Lalande 21185", ra: 165.83, dec: 35.97, dist: 8.29, color: 0xFF8800 },
    { name: "Sirius", ra: 101.28, dec: -16.71, dist: 8.60, color: 0xAADDFF },
    { name: "Luyten 726-8", ra: 24.75, dec: -17.95, dist: 8.73, color: 0xFF0000 },
    { name: "Ross 154", ra: 282.45, dec: -23.83, dist: 9.68, color: 0xFF0000 }
];

NEAREST_STARS_DATA.forEach(star => {
    const pos = raDecToVector(star.ra, star.dec, star.dist * LY_UNIT);
    
    // Star Marker
    const geo = new THREE.SphereGeometry(LY_UNIT * 0.1, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: star.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    mesh.owner = {
        name: star.name,
        info: `<b>${star.name}</b><br>Distance: ${star.dist} ly`,
        Position: mesh.position,
        Orbit: { visible: false, material: { uniforms: { colorA: { value: new THREE.Color() } }, needsUpdate: false } },
        color: star.color
    };
    Castable.push(mesh);
    nearestStarsGroup.add(mesh);

    const label = _makeTextSprite(star.name, { font: '24px Arial', fillStyle: '#' + new THREE.Color(star.color).getHexString(), size: 256 });
    label.material.sizeAttenuation = false;
    label.scale.set(0.16, 0.16, 0.16);
    label.position.copy(pos).multiplyScalar(1.05);
    nearestStarsGroup.add(label);

    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), pos]);
    const lineMat = new THREE.LineBasicMaterial({ color: star.color, transparent: true, opacity: 0.3 });
    const line = new THREE.Line(lineGeo, lineMat);
    nearestStarsGroup.add(line);
});

// Horoscope Visualization
const horoscopeGroup = new THREE.Group();
scene.add(horoscopeGroup);

function initHoroscope() {
    // Create Container
    horoscopeContainer = document.createElement('div');
    horoscopeContainer.id = 'horoscopeContainer';
    horoscopeContainer.style.position = 'absolute';
    horoscopeContainer.style.top = '50px';
    horoscopeContainer.style.right = '10px';
    horoscopeContainer.style.width = '350px';
    horoscopeContainer.style.height = '400px';
    horoscopeContainer.style.minWidth = '250px';
    horoscopeContainer.style.minHeight = '300px';
    horoscopeContainer.style.border = '1px solid #444';
    horoscopeContainer.style.borderRadius = '8px';
    horoscopeContainer.style.background = 'rgba(10, 10, 20, 0.8)';
    horoscopeContainer.style.backdropFilter = 'blur(5px)';
    horoscopeContainer.style.display = 'none';
    horoscopeContainer.style.zIndex = '1000';
    horoscopeContainer.style.resize = 'both';
    horoscopeContainer.style.overflow = 'hidden';

    // Header for dragging
    const header = document.createElement('div');
    header.style.width = '100%';
    header.style.height = '25px';
    header.style.background = '#222';
    header.style.cursor = 'move';
    header.style.color = '#FFD700';
    header.style.textAlign = 'center';
    header.style.lineHeight = '25px';
    header.textContent = 'Horoscope Chart';
    horoscopeContainer.appendChild(header);

    // Create Iframe
    const horoscopeIframe = document.createElement('iframe');
    horoscopeIframe.src = 'horoscope.html';
    horoscopeIframe.style.width = '100%';
    horoscopeIframe.style.height = 'calc(100% - 25px)';
    horoscopeIframe.style.border = 'none';
    horoscopeContainer.appendChild(horoscopeIframe);
    
    document.body.appendChild(horoscopeContainer);

    // Drag logic
    let isDragging = false;
    let offsetX, offsetY;
    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - horoscopeContainer.offsetLeft;
        offsetY = e.clientY - horoscopeContainer.offsetTop;
        horoscopeIframe.style.pointerEvents = 'none';
        e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        horoscopeContainer.style.left = (e.clientX - offsetX) + 'px';
        horoscopeContainer.style.top = (e.clientY - offsetY) + 'px';
        horoscopeContainer.style.right = 'auto';
        horoscopeContainer.style.bottom = 'auto';
    });
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            horoscopeIframe.style.pointerEvents = 'auto';
        }
    });
}
initHoroscope();

function updateHoroscope() {
    if (!horoscope_mode) {
        if (horoscopeContainer) horoscopeContainer.style.display = 'none';
        horoscopeGroup.visible = false;
        return;
    }
    if (horoscopeContainer) horoscopeContainer.style.display = 'block';
    horoscopeGroup.visible = true;

    // 1. Determine Observer Position (Lat/Lon)
    // Use the last clicked position on Earth, or default to Ujjain (23.17, 75.78)
    let lat = 23.17;
    let lon = 75.78;
    if (bodies.earth && bodies.earth.horizonLocalPos) {
        // Recalculate lat/lon from stored local pos
        const p = bodies.earth.horizonLocalPos.clone().normalize();
        lat = Math.asin(p.y) * (180 / Math.PI);
        lon = Math.atan2(p.x, p.z) * (180 / Math.PI);
    }

    // 2. Calculate Ascendant (Lagna)
    // Need GMST and Obliquity
    const d = J_D; // Days since J2000
    const T = d / 36525.0;
    const obliq = DegToRad(23.4392911 - (0.0130042 * T));
    
    // GMST (Greenwich Mean Sidereal Time) in degrees
    let gmst = 280.46061837 + 360.98564736629 * d + 0.000387933 * T * T - T * T * T / 38710000;
    gmst = (gmst % 360 + 360) % 360;
    
    // RAMC (Right Ascension of Medium Coeli) = LMST = GMST + Lon
    let ramc = (gmst + lon) % 360;
    if (ramc < 0) ramc += 360;
    const ramcRad = DegToRad(ramc);
    const latRad = DegToRad(lat);

    // Ascendant Formula
    // tan(Asc) = cos(RAMC) / ( -sin(RAMC)*cos(eps) + tan(lat)*sin(eps) )
    const y = Math.cos(ramcRad);
    const x = -Math.sin(ramcRad) * Math.cos(obliq) + Math.tan(latRad) * Math.sin(obliq);
    let ascRad = Math.atan2(y, x);
    let ascDeg = RadToDeg(ascRad);
    ascDeg = (ascDeg % 360 + 360) % 360;

    // Apply Ayanamsa (Sidereal)
    const ayanamsa = ayanamsaDeg; // Calculated in update()
    let siderealAsc = (ascDeg - ayanamsa + 360) % 360;

    // VISUALIZE LAGNA (Ascendant)
    // Use Tropical Ascendant (ascDeg) to find direction in J2000 Ecliptic (where 0 is Vernal Equinox)
    const lagnaRad = DegToRad(ascDeg);
    const lagnaDir = new THREE.Vector3(Math.cos(lagnaRad), 0, Math.sin(lagnaRad));
    
    // Raycast to Rashi Belt
    const rashiSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), RASHI_BELT_RADIUS);
    const ray = new THREE.Ray(bodies.earth.Position, lagnaDir);
    let lagnaPos = new THREE.Vector3();
    ray.intersectSphere(rashiSphere, lagnaPos);
    if (lagnaPos.lengthSq() === 0) lagnaPos.copy(bodies.earth.Position).add(lagnaDir.multiplyScalar(RASHI_BELT_RADIUS));

    const lagnaPts = [bodies.earth.Position, lagnaPos];
    const lagnaGeo = new THREE.BufferGeometry().setFromPoints(lagnaPts);
    const lagnaMat = new THREE.LineDashedMaterial({ color: 0x00FFFF, dashSize: 1000000, gapSize: 500000, opacity: 0.8, transparent: true, linewidth: 2 });
    const lagnaLine = new THREE.Line(lagnaGeo, lagnaMat);
    lagnaLine.computeLineDistances();
    horoscopeGroup.add(lagnaLine);

    // Calculate Lagna details
    const lRashiIndex = Math.floor(siderealAsc / 30);
    const lRashiName = RASHI_NAMES[lRashiIndex];
    const lRashiAngle = siderealAsc % 30;
    const lNakIndex = Math.floor(siderealAsc / (360 / 27));
    const lNakName = NAKSHATRA_NAMES[lNakIndex];
    const lPada = Math.floor((siderealAsc % (360 / 27)) / ((360 / 27) / 4)) + 1;
    const lagnaText = `Lagna (Asc)\n${lRashiName} ${lRashiAngle.toFixed(1)}°\n(${lNakName} - Pada ${lPada})`;

    const lagnaLabel = _makeTextSprite(lagnaText, { font: 'Bold 32px Arial', fillStyle: '#00FFFF', size: 1024 });
    lagnaLabel.scale.set(0.12, 0.12, 0.12);
    lagnaLabel.scale.set(0.36, 0.36, 0.36);
    const lagnaLabelPos = lagnaPos.clone().multiplyScalar(0.95); // Slightly inside
    lagnaLabel.position.copy(lagnaLabelPos);
    lagnaLabel.userData.tourName = 'Lagna'; // Tag for tour
    horoscopeGroup.add(lagnaLabel);

    // 3. Calculate Planetary Positions (Geocentric Ecliptic Longitude)
    const planets = [];
    const planetKeys = ['sol', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    const earthPos = bodies.earth.Position;

    planetKeys.forEach(key => {
        const body = bodies[key];
        if (body && body.Position) {
            const vec = new THREE.Vector3().subVectors(body.Position, earthPos);
            // Ecliptic Longitude (XZ plane in simulation)
            // Note: Simulation X is Vernal Equinox? 
            // In raDecToVector: x = R cos(ra), z = R sin(ra) (after tilt correction)
            // So angle is atan2(z, x)
            let ang = Math.atan2(vec.z, vec.x);
            let deg = RadToDeg(ang);
            deg = (deg - ayanamsa + 360) % 360;
            
            // Retrograde Check
            let isRetro = false;
            if (!body.userData) body.userData = {};
            
            // Persist previous state to avoid flickering on zero-motion frames
            if (typeof body.userData.isRetro === 'boolean') {
                isRetro = body.userData.isRetro;
            }

            if (typeof body.userData.lastHoroscopeLon === 'number') {
                let diff = deg - body.userData.lastHoroscopeLon;
                if (diff < -180) diff += 360;
                if (diff > 180) diff -= 360;
                
                // Only update status if there is significant motion (above noise)
                if (Math.abs(diff) > 1e-10 && time_rate !== 0) {
                    isRetro = (diff * time_rate < 0);
                }
            }
            body.userData.lastHoroscopeLon = deg;
            body.userData.isRetro = isRetro;

            let name = body.name;
            if (key === 'sol') name = 'Sun';
            if (key === 'moon') name = 'Moon';
            // Capitalize
            name = name.charAt(0).toUpperCase() + name.slice(1);
            if (isRetro) name += " (R)";
            
            planets.push({ name: name, deg: deg });
        }
    });

    // Rahu/Ketu
    // Mean Node: 125.04452 - 1934.136261 * T
    const omega = 125.04452 - 1934.136261 * T;
    let rahuMean = (omega % 360 + 360) % 360;
    let rahuSid = (rahuMean - ayanamsa + 360) % 360;
    let ketuSid = (rahuSid + 180) % 360;
    planets.push({ name: 'Rahu (R)', deg: rahuSid });
    planets.push({ name: 'Ketu (R)', deg: ketuSid });

    // 4. Send Data to Iframe
    const horoscopeIframe = horoscopeContainer.querySelector('iframe');
    if (horoscopeIframe.contentWindow) {
        horoscopeIframe.contentWindow.postMessage({
            type: 'HOROSCOPE_DATA',
            payload: {
                ascendant: siderealAsc,
                planets: planets
            }
        }, '*');
    }

    // 5. Visual Lines in 3D
    // Clear old lines
    horoscopeTourTargets = {}; // Clear tour targets for rebuild
    while(horoscopeGroup.children.length > 0) {
        const c = horoscopeGroup.children[0];
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
        horoscopeGroup.remove(c);
    }
    
    // Re-add Lagna line/label after clearing
    horoscopeGroup.add(lagnaLine);
    horoscopeGroup.add(lagnaLabel);
    horoscopeTourTargets['Lagna'] = lagnaLabelPos.clone();
    
    let origin = earthPos.clone();
    if (bodies.earth.horizonPlane && bodies.earth.horizonPlane.visible) {
        const localPos = bodies.earth.horizonLocalPos || new THREE.Vector3(0,0,0);
        origin.add(localPos);
    }

    // Create a list of bodies to draw lines to, including their sidereal degrees
    horoscopeTourTargets['Observer'] = origin.clone();
    const bodiesToVisualize = [];
    planets.forEach(p => {
        let bodyKey;
        if (p.name === 'Sun') bodyKey = 'sol';
        else if (p.name === 'Rahu') bodyKey = 'rahu';
        else if (p.name === 'Ketu') bodyKey = 'ketu';
        else bodyKey = p.name.toLowerCase();
        if (p.name.startsWith('Sun')) bodyKey = 'sol';
        else if (p.name.startsWith('Rahu')) bodyKey = 'rahu';
        else if (p.name.startsWith('Ketu')) bodyKey = 'ketu';
        else bodyKey = p.name.split(' ')[0].toLowerCase();

        let position;
        if (bodyKey === 'rahu' && grahaSpheres.length > 0) {
            position = grahaSpheres[0].position;
        } else if (bodyKey === 'ketu' && grahaSpheres.length > 1) {
            position = grahaSpheres[1].position;
        } else if (bodies[bodyKey] && bodies[bodyKey].Position) {
            position = bodies[bodyKey].Position;
        }

        if (position) {
            bodiesToVisualize.push({
                name: p.name,
                deg: p.deg,
                position: position
            });
        }
    });

    bodiesToVisualize.forEach(b => {
        // Draw line from observer to body
        const direction = new THREE.Vector3().subVectors(b.position, origin).normalize();
        const ray = new THREE.Ray(origin, direction);
        // The Rashi belt is drawn at RASHI_BELT_RADIUS
        const rashiSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), RASHI_BELT_RADIUS);
        
        let intersectionPoint = new THREE.Vector3();
        ray.intersectSphere(rashiSphere, intersectionPoint);

        // If for some reason there's no intersection, just project far out.
        if (intersectionPoint.lengthSq() === 0) {
            intersectionPoint.copy(origin).add(direction.multiplyScalar(RASHI_BELT_RADIUS * 1.1));
        }
        const pts = [origin, intersectionPoint];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineDashedMaterial({ color: 0xFFD700, dashSize: 1000000, gapSize: 500000, opacity: 0.5, transparent: true });
        const line = new THREE.Line(geo, mat);
        line.computeLineDistances();
        horoscopeGroup.add(line);

        // Calculate astrological data from sidereal degree
        const rashiIndex = Math.floor(b.deg / 30);
        const rashiName = RASHI_NAMES[rashiIndex];
        const rashiAngle = b.deg % 30;
        const nakshatraSpan = 360 / 27;
        const nakshatraIndex = Math.floor(b.deg / nakshatraSpan);
        const nakshatraName = NAKSHATRA_NAMES[nakshatraIndex];
        const degInNak = b.deg % nakshatraSpan;
        const pada = Math.floor(degInNak / (nakshatraSpan / 4)) + 1;

        // Format the text
        const labelText = `${b.name}\n${rashiName} ${rashiAngle.toFixed(1)}°\n(${nakshatraName} - Pada ${pada})`;

        // Create and position the text sprite
        const label = _makeTextSprite(labelText, { font: 'Bold 32px Arial', fillStyle: '#FFFF88', size: 512 });
        label.material.sizeAttenuation = false;
        // label.scale.set(0.12, 0.12, 0.12);
        label.scale.set(0.18, 0.18, 0.18);

        const labelPos = new THREE.Vector3().lerpVectors(origin, intersectionPoint, 0.75);
        label.position.copy(labelPos);
        horoscopeGroup.add(label);
        horoscopeTourTargets[b.name] = labelPos.clone();
    });
}

// Nebulae Visualization
const nebulaGroup = new THREE.Group();
helpersGroup.add(nebulaGroup);

function createNebulaTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.3)');
    g.addColorStop(0.2, 'rgba(255,255,255,0.8)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.2)');
    g.addColorStop(0, 'rgba(255,255,255,0.8)');
    g.addColorStop(0.2, 'rgba(255,255,255,0.4)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.1)');
    g.addColorStop(0.8, 'rgba(255,255,255,0.05)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,64,64);
    const tex = new THREE.Texture(canvas);
    tex.needsUpdate = true;
    return tex;
}
const nebulaTex = createNebulaTexture();

function addNebula(name, ra, dec, distLY, color, sizeLY, count, shape = 'sphere') {
    const pos = raDecToVector(ra, dec, distLY * LY_UNIT);
    const mat = new THREE.SpriteMaterial({ 
        map: nebulaTex, 
        color: color, 
        transparent: true, 
        opacity: 0.2,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    const group = new THREE.Group();
    group.position.copy(pos);
    
    const rot = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    
    // Pre-calculate cloud centers if shape is cloud
    const cloudCenters = [];
    if (shape === 'cloud') {
        const numCenters = 3 + Math.floor(Math.random() * 3); // 3 to 5 blobs
        for(let k=0; k<numCenters; k++) {
            cloudCenters.push(new THREE.Vector3(
                (Math.random()-0.5)*1.5, (Math.random()-0.5)*0.5, (Math.random()-0.5)*1.5
            ));
        }
    }

    // Create a cluster of sprites
    for(let i=0; i<count; i++) {
        const sprite = new THREE.Sprite(mat);
        let x, y, z;
        const R = sizeLY * LY_UNIT;

        if (shape === 'ring') {
            const theta = Math.random() * Math.PI * 2;
            const r = R * (0.8 + 0.2 * Math.random());
            x = r * Math.cos(theta);
            z = r * Math.sin(theta);
            y = (Math.random() - 0.5) * R * 0.2;
        } else if (shape === 'filament') {
            const t = (Math.random() - 0.5) * 2;
            x = t * R;
            y = Math.sin(t * Math.PI) * R * 0.3 + (Math.random() - 0.5) * R * 0.2;
            z = (Math.random() - 0.5) * R * 0.2;
        } else if (shape === 'ellipsoid') {
            const r = R * Math.pow(Math.random(), 0.5);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            x = r * Math.sin(phi) * Math.cos(theta) * 1.5;
            y = r * Math.sin(phi) * Math.sin(theta) * 0.7;
            z = r * Math.cos(phi) * 0.7;
        } else if (shape === 'cloud') {
            const center = cloudCenters[i % cloudCenters.length];
            const r = R * 0.5 * Math.pow(Math.random(), 1/3);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            x = (center.x * R) + r * Math.sin(phi) * Math.cos(theta);
            y = (center.y * R) + r * Math.sin(phi) * Math.sin(theta);
            z = (center.z * R) + r * Math.cos(phi);
        } else {
            // Sphere
            const r = R * Math.pow(Math.random(), 0.5);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            x = r * Math.sin(phi) * Math.cos(theta);
            y = r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi);
        }

        const p = new THREE.Vector3(x, y, z);
        if (shape !== 'sphere') p.applyEuler(rot);
        sprite.position.copy(p);
        
        const s = sizeLY * LY_UNIT * (0.5 + Math.random());
        sprite.scale.set(s, s, s);
        sprite.userData.baseScale = sprite.scale.clone();
        group.add(sprite);
    }
    
    // Add Label
    const labelText = `${name} (${distLY} ly)`;
    const label = _makeTextSprite(labelText, { font: '16px Arial', fillStyle: '#' + new THREE.Color(color).getHexString(), size: 512 });
    label.material.sizeAttenuation = false;
    label.scale.set(0.1, 0.1, 0.1);
    // Position label slightly above the nebula center
    label.position.set(0, sizeLY * LY_UNIT * 0.8, 0);
    group.add(label);

    // Add Hit Target for Raycasting (Go To)
    const hitGeo = new THREE.SphereGeometry(sizeLY * LY_UNIT * 0.5, 8, 8);
    const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    const ownerData = {
        name: name,
        info: `<b>${name}</b><br>Distance: ${distLY} ly<br>Type: Nebula`,
        Position: group.position,
        Orbit: { visible: false, material: { uniforms: { colorA: { value: new THREE.Color() } }, needsUpdate: false } },
        color: color
    };
    hitMesh.owner = ownerData;
    label.owner = ownerData;
    Castable.push(hitMesh);
    Castable.push(label);
    group.add(hitMesh);
    
    nebulaGroup.add(group);
}

var nebulae = [
    { name: "Orion Nebula", ra: 83.8, dec: -5.4, dist: 1344, color: "rgba(255, 100, 200, 0.8)", scale: 60 },
    { name: "Crab Nebula", ra: 83.6, dec: 22.0, dist: 6500, color: "rgba(100, 200, 255, 0.8)", scale: 40 },
    { name: "Eagle Nebula", ra: 274.7, dec: -13.8, dist: 7000, color: "rgba(255, 150, 100, 0.8)", scale: 70 },
    { name: "Ring Nebula", ra: 283.4, dec: 33.0, dist: 2500, color: "rgba(100, 255, 150, 0.8)", scale: 30 },
    { name: "Helix Nebula", ra: 337.4, dec: -20.8, dist: 650, color: "rgba(200, 100, 255, 0.8)", scale: 40 },
    { name: "Carina Nebula", ra: 161.3, dec: -59.9, dist: 8500, color: "rgba(255, 100, 100, 0.8)", scale: 100 },
    { name: "Lagoon Nebula", ra: 271.0, dec: -24.4, dist: 4100, color: "rgba(255, 100, 200, 0.8)", scale: 80 },
    { name: "Trifid Nebula", ra: 270.6, dec: -23.0, dist: 5200, color: "rgba(100, 150, 255, 0.8)", scale: 60 },
    { name: "Dumbbell Nebula", ra: 299.9, dec: 22.7, dist: 1360, color: "rgba(100, 255, 200, 0.8)", scale: 40 },
    { name: "Omega Nebula", ra: 275.2, dec: -16.1, dist: 5500, color: "rgba(255, 100, 150, 0.8)", scale: 70 },
    { name: "North America Nebula", ra: 314.8, dec: 44.3, dist: 2590, color: "rgba(255, 50, 50, 0.8)", scale: 90 },
    { name: "Rosette Nebula", ra: 98.4, dec: 4.9, dist: 5000, color: "rgba(255, 100, 100, 0.8)", scale: 80 },
    { name: "Veil Nebula", ra: 311.4, dec: 30.7, dist: 2400, color: "rgba(100, 200, 255, 0.6)", scale: 100 },
    { name: "Cat's Eye Nebula", ra: 269.6, dec: 66.6, dist: 3300, color: "rgba(100, 255, 100, 0.8)", scale: 30 },
    { name: "California Nebula", ra: 60.8, dec: 36.4, dist: 1000, color: "rgba(255, 80, 80, 0.8)", scale: 80 },
    { name: "Tarantula Nebula", ra: 84.7, dec: -69.1, dist: 160000, color: "rgba(255, 150, 200, 0.8)", scale: 200 },
    { name: "Flame Nebula", ra: 85.4, dec: -1.9, dist: 1350, color: "rgba(255, 150, 50, 0.8)", scale: 50 },
    { name: "Horsehead Nebula", ra: 85.3, dec: -2.5, dist: 1500, color: "rgba(255, 100, 100, 0.8)", scale: 40 },
    { name: "Cone Nebula", ra: 100.2, dec: 9.9, dist: 2700, color: "rgba(200, 100, 50, 0.8)", scale: 50 },
    { name: "Owl Nebula", ra: 168.7, dec: 55.0, dist: 2030, color: "rgba(100, 200, 255, 0.8)", scale: 35 },
    { name: "Saturn Nebula", ra: 316.1, dec: -11.4, dist: 5000, color: "rgba(150, 255, 150, 0.8)", scale: 30 },
    { name: "Blue Snowball", ra: 351.5, dec: 42.5, dist: 2500, color: "rgba(100, 200, 255, 0.8)", scale: 25 },
    { name: "Ghost of Jupiter", ra: 156.2, dec: -18.6, dist: 1400, color: "rgba(100, 255, 200, 0.8)", scale: 25 },
    { name: "Little Dumbbell", ra: 25.6, dec: 51.6, dist: 2500, color: "rgba(255, 100, 150, 0.8)", scale: 30 },
    { name: "Medusa Nebula", ra: 112.4, dec: 13.2, dist: 1500, color: "rgba(200, 100, 100, 0.8)", scale: 45 },
    { name: "Pleiades Merope", ra: 56.6, dec: 23.9, dist: 444, color: "rgba(100, 150, 255, 0.6)", scale: 60 },
    { name: "Running Chicken", ra: 174.0, dec: -62.8, dist: 6500, color: "rgba(255, 100, 150, 0.8)", scale: 70 },
    { name: "Statue of Liberty", ra: 169.5, dec: -61.2, dist: 9000, color: "rgba(255, 150, 100, 0.8)", scale: 60 },
    { name: "Fighting Dragons", ra: 254.2, dec: -48.7, dist: 4000, color: "rgba(100, 100, 200, 0.8)", scale: 80 },
    { name: "Cat's Paw", ra: 259.9, dec: -35.8, dist: 5500, color: "rgba(255, 100, 100, 0.8)", scale: 70 },
    { name: "Lobster Nebula", ra: 261.0, dec: -34.1, dist: 5900, color: "rgba(255, 200, 100, 0.8)", scale: 70 },
    { name: "Bug Nebula", ra: 258.1, dec: -37.1, dist: 3400, color: "rgba(200, 200, 255, 0.8)", scale: 30 },
    { name: "Bubble Nebula", ra: 348.1, dec: 61.2, dist: 7100, color: "rgba(255, 100, 200, 0.8)", scale: 40 },
    { name: "Cave Nebula", ra: 344.2, dec: 62.5, dist: 2400, color: "rgba(200, 100, 100, 0.8)", scale: 50 },
    { name: "Cocoon Nebula", ra: 326.9, dec: 47.3, dist: 4000, color: "rgba(255, 150, 150, 0.8)", scale: 35 },
    { name: "Crescent Nebula", ra: 303.1, dec: 38.4, dist: 5000, color: "rgba(150, 150, 255, 0.8)", scale: 40 },
    { name: "Elephant's Trunk", ra: 324.4, dec: 57.5, dist: 2400, color: "rgba(200, 150, 100, 0.8)", scale: 80 },
    { name: "Heart Nebula", ra: 38.3, dec: 61.4, dist: 7500, color: "rgba(255, 50, 50, 0.8)", scale: 90 },
    { name: "Soul Nebula", ra: 41.3, dec: 60.4, dist: 7500, color: "rgba(255, 100, 100, 0.8)", scale: 80 },
    { name: "Pacman Nebula", ra: 12.9, dec: 56.6, dist: 9200, color: "rgba(255, 100, 200, 0.8)", scale: 50 },
    { name: "Wizard Nebula", ra: 342.0, dec: 53.9, dist: 7000, color: "rgba(200, 100, 255, 0.8)", scale: 60 },
    { name: "Iris Nebula", ra: 315.2, dec: 68.1, dist: 1300, color: "rgba(100, 150, 255, 0.8)", scale: 30 },
    { name: "Jellyfish Nebula", ra: 94.2, dec: 22.5, dist: 5000, color: "rgba(200, 150, 100, 0.8)", scale: 50 },
    { name: "Monkey Head", ra: 92.4, dec: 20.3, dist: 6400, color: "rgba(255, 150, 100, 0.8)", scale: 40 },
    { name: "Seagull Nebula", ra: 106.5, dec: -10.5, dist: 3700, color: "rgba(255, 100, 200, 0.8)", scale: 90 },
    { name: "Thor's Helmet", ra: 109.6, dec: -13.3, dist: 12000, color: "rgba(100, 200, 255, 0.8)", scale: 50 },
    { name: "Witch Head", ra: 77.2, dec: -7.2, dist: 900, color: "rgba(100, 100, 200, 0.6)", scale: 70 },
    { name: "Pencil Nebula", ra: 136.3, dec: -45.9, dist: 800, color: "rgba(150, 150, 255, 0.8)", scale: 20 },
    { name: "Gum Nebula", ra: 130.0, dec: -40.0, dist: 1400, color: "rgba(255, 100, 100, 0.4)", scale: 300 },
    { name: "Barnard's Loop", ra: 87.0, dec: -2.0, dist: 1600, color: "rgba(255, 50, 50, 0.4)", scale: 200 },
    { name: "Eta Carinae", ra: 161.3, dec: -59.7, dist: 7500, color: "rgba(255, 150, 100, 0.8)", scale: 60 },
    { name: "Sadr Region", ra: 305.6, dec: 40.2, dist: 1800, color: "rgba(255, 100, 100, 0.6)", scale: 100 },
    { name: "Veil East", ra: 313.5, dec: 30.7, dist: 2400, color: "rgba(100, 200, 255, 0.8)", scale: 40 },
    { name: "Veil West", ra: 309.0, dec: 30.7, dist: 2400, color: "rgba(255, 150, 150, 0.8)", scale: 40 },
    { name: "Flaming Star", ra: 79.1, dec: 34.1, dist: 1500, color: "rgba(200, 100, 255, 0.8)", scale: 60 },
    { name: "Tadpole Nebula", ra: 79.8, dec: 35.3, dist: 12000, color: "rgba(255, 200, 100, 0.8)", scale: 50 },
    { name: "Spider Nebula", ra: 79.3, dec: 34.9, dist: 10000, color: "rgba(150, 255, 150, 0.8)", scale: 40 },
    { name: "Skull Nebula", ra: 11.2, dec: -2.5, dist: 1600, color: "rgba(200, 100, 200, 0.8)", scale: 30 },
    { name: "Eight-Burst", ra: 151.4, dec: -42.1, dist: 2000, color: "rgba(255, 150, 100, 0.8)", scale: 25 },
    { name: "Box Nebula", ra: 261.5, dec: -3.0, dist: 11000, color: "rgba(100, 200, 255, 0.8)", scale: 20 },
    { name: "Stingray Nebula", ra: 260.7, dec: -59.2, dist: 18000, color: "rgba(150, 255, 150, 0.8)", scale: 15 },
    { name: "Red Spider", ra: 286.3, dec: -26.3, dist: 3000, color: "rgba(255, 100, 100, 0.8)", scale: 25 },
    { name: "Butterfly Nebula", ra: 255.3, dec: -34.5, dist: 3800, color: "rgba(255, 200, 200, 0.8)", scale: 30 },
    { name: "Twin Jet", ra: 257.1, dec: -6.3, dist: 2100, color: "rgba(200, 200, 255, 0.8)", scale: 25 },
    { name: "Egg Nebula", ra: 315.1, dec: 30.1, dist: 3000, color: "rgba(200, 200, 255, 0.8)", scale: 20 },
    { name: "Rotten Egg", ra: 115.2, dec: -14.8, dist: 5000, color: "rgba(255, 255, 100, 0.8)", scale: 20 },
    { name: "Lemon Slice", ra: 188.5, dec: 74.5, dist: 4500, color: "rgba(255, 255, 100, 0.8)", scale: 15 },
    { name: "Oyster Nebula", ra: 104.2, dec: 20.8, dist: 5000, color: "rgba(200, 200, 200, 0.8)", scale: 20 },
    { name: "Spirograph", ra: 79.5, dec: -6.7, dist: 2000, color: "rgba(255, 100, 200, 0.8)", scale: 20 },
    { name: "Retina Nebula", ra: 226.2, dec: -40.5, dist: 1900, color: "rgba(150, 100, 255, 0.8)", scale: 25 },
    { name: "Eskimo Nebula", ra: 112.3, dec: 20.9, dist: 2870, color: "rgba(100, 200, 255, 0.8)", scale: 25 },
    { name: "Ant Nebula", ra: 244.5, dec: -48.4, dist: 8000, color: "rgba(255, 150, 200, 0.8)", scale: 30 },
    { name: "Hourglass Nebula", ra: 209.9, dec: -67.2, dist: 8000, color: "rgba(255, 150, 100, 0.8)", scale: 25 },
    { name: "Boomerang Nebula", ra: 191.1, dec: -54.5, dist: 5000, color: "rgba(200, 200, 255, 0.8)", scale: 30 },
    { name: "Necklace Nebula", ra: 293.6, dec: 25.9, dist: 15000, color: "rgba(100, 255, 100, 0.8)", scale: 20 },
    { name: "Soap Bubble", ra: 301.3, dec: 38.1, dist: 4000, color: "rgba(200, 200, 255, 0.6)", scale: 30 },
    { name: "Lower's Nebula", ra: 91.3, dec: 25.8, dist: 3000, color: "rgba(255, 100, 100, 0.6)", scale: 40 },
    { name: "Fishhead Nebula", ra: 28.7, dec: 61.5, dist: 6000, color: "rgba(255, 150, 100, 0.8)", scale: 40 },
    { name: "Gamma Cygni", ra: 305.6, dec: 40.3, dist: 1800, color: "rgba(255, 200, 100, 0.6)", scale: 80 },
    { name: "Tulip Nebula", ra: 299.1, dec: 35.3, dist: 6000, color: "rgba(255, 100, 150, 0.8)", scale: 30 },
    { name: "Pelican Nebula", ra: 312.5, dec: 44.5, dist: 1800, color: "rgba(200, 200, 200, 0.8)", scale: 60 },
    { name: "Kepler's SNR", ra: 262.6, dec: -21.5, dist: 20000, color: "rgba(255, 100, 100, 0.8)", scale: 30 },
    { name: "Tycho's SNR", ra: 6.4, dec: 64.1, dist: 9000, color: "rgba(255, 150, 150, 0.8)", scale: 30 },
    { name: "SN 1006", ra: 225.7, dec: -41.9, dist: 7200, color: "rgba(150, 150, 255, 0.6)", scale: 50 },
    { name: "RCW 86", ra: 220.0, dec: -62.5, dist: 8000, color: "rgba(200, 150, 255, 0.8)", scale: 40 },
    { name: "Vela SNR", ra: 128.8, dec: -45.0, dist: 800, color: "rgba(100, 150, 255, 0.4)", scale: 250 },
    { name: "Cygnus Loop", ra: 311.5, dec: 30.7, dist: 2500, color: "rgba(150, 200, 255, 0.6)", scale: 120 }
];

nebulae.forEach(function(n) {
    var color = new THREE.Color(n.color.replace(/rgba?\((\d+),\s*(\d+),\s*(\d+).*/, "rgb($1,$2,$3)"));
    addNebula(n.name, n.ra, n.dec, n.dist, color, n.scale, 64, 'cloud');
});

// 20. Precession Cone
const precessionGroup = new THREE.Group();
helpersGroup.add(precessionGroup);

const precRadius = CONSTELLATION_RADIUS * Math.sin(CONSTELLATION_TILT);
const precY = CONSTELLATION_RADIUS * Math.cos(CONSTELLATION_TILT);
const precCurve = new THREE.EllipseCurve(0, 0, precRadius, precRadius, 0, 2 * Math.PI, false, 0);
const precPts2D = precCurve.getPoints(64);
const precPts3D = precPts2D.map(p => new THREE.Vector3(p.x, precY, p.y));
const precGeo = new THREE.BufferGeometry().setFromPoints(precPts3D);
const precMat = new THREE.LineBasicMaterial({ color: 0x00FF00, transparent: true, opacity: 0.3 });
const precCircle = new THREE.LineLoop(precGeo, precMat);
precessionGroup.add(precCircle);

const coneLinesPts = [];
for(let i=0; i<precPts3D.length; i+=8) { coneLinesPts.push(new THREE.Vector3(0,0,0)); coneLinesPts.push(precPts3D[i]); }
const coneLinesGeo = new THREE.BufferGeometry().setFromPoints(coneLinesPts);
const coneLinesMat = new THREE.LineBasicMaterial({ color: 0x00FF00, transparent: true, opacity: 0.15 });
const coneLines = new THREE.LineSegments(coneLinesGeo, coneLinesMat);
precessionGroup.add(coneLines);

// Yuga Arcs (Great Year Sectors)
// Model: Satya (Top), Kali (Bottom), with Treta/Dwapara in between.
// Angles relative to center (0 is Top/North on the circle)
const yugaSegments = [
    { name: "Asc Kali (1200y)", color: 0xFF3333, start: 247.5, end: 265.5 },
    { name: "Asc Dwapara (2400y)", color: 0xFF8C00, start: 265.5, end: 301.5 },
    { name: "Asc Treta (3600y)", color: 0x00BFFF, start: 301.5, end: 355.5 },
    { name: "Asc Satya (4800y)", color: 0xFFD700, start: 355.5, end: 427.5 },
    { name: "Desc Satya (4800y)", color: 0xFFD700, start: 67.5, end: 139.5 },
    { name: "Desc Treta (3600y)", color: 0x00BFFF, start: 139.5, end: 193.5 },
    { name: "Desc Dwapara (2400y)", color: 0xFF8C00, start: 193.5, end: 229.5 },
    { name: "Desc Kali (1200y)", color: 0xFF3333, start: 229.5, end: 247.5 }
];

function _makeYugaLabelMesh(text, color, angleRad, radius) {
    const canvas = document.createElement('canvas');
    const w = 1024;
    const h = 256;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.font = 'Bold 60px Arial';
    ctx.fillStyle = '#' + new THREE.Color(color).getHexString();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2);

    const tex = new THREE.Texture(canvas);
    tex.needsUpdate = true;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const aspect = w / h;
    const worldHeight = radius * 0.12; 
    const worldWidth = worldHeight * aspect;
    const geo = new THREE.PlaneGeometry(worldWidth, worldHeight);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(Math.cos(angleRad) * radius, precY, Math.sin(angleRad) * radius);
    mesh.rotation.set(-Math.PI / 2, 0, angleRad - Math.PI / 2); // Lay flat and rotate tangent
    return mesh;
}

yugaSegments.forEach(seg => {
    const startRad = DegToRad(seg.start);
    const endRad = DegToRad(seg.end);
    const curve = new THREE.EllipseCurve(0, 0, precRadius, precRadius, startRad, endRad, false, 0);
    const pts = curve.getPoints(64);
    const pts3D = pts.map(p => new THREE.Vector3(p.x, precY, p.y));
    
    const path = new THREE.CatmullRomCurve3(pts3D);
    const tubeGeo = new THREE.TubeBufferGeometry(path, 64, precRadius * 0.01, 8, false);
    const mat = new THREE.MeshBasicMaterial({ color: seg.color, transparent: true, opacity: 0.8 });
    const arc = new THREE.Mesh(tubeGeo, mat);
    precessionGroup.add(arc);
    seg.mesh = arc;
    
    // Label
    const midAngle = (seg.start + seg.end) / 2;
    const midRad = DegToRad(midAngle); 
    const label = _makeYugaLabelMesh(seg.name, seg.color, midRad, precRadius * 1.12);
    precessionGroup.add(label);
    seg.label = label;
});

// Great Year Clock Hand & Dial
const precHandGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, precY, 0), new THREE.Vector3(0, precY, precRadius)]);
const precHandMat = new THREE.LineBasicMaterial({ color: 0xFF00FF, linewidth: 2 });
const precHand = new THREE.Line(precHandGeo, precHandMat);
precessionGroup.add(precHand);

for(let i=0; i<12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const x1 = Math.sin(angle) * precRadius * 0.9;
    const z1 = Math.cos(angle) * precRadius * 0.9;
    const x2 = Math.sin(angle) * precRadius * 1.1;
    const z2 = Math.cos(angle) * precRadius * 1.1;
    const tickGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1, precY, z1), new THREE.Vector3(x2, precY, z2)]);
    const tickMat = new THREE.LineBasicMaterial({ color: 0xFF00FF, transparent: true, opacity: 0.5 });
    const tick = new THREE.Line(tickGeo, tickMat);
    precessionGroup.add(tick);
}

// 21. Precession Trail (Traces the axis tip)
const precTrailGeo = new THREE.BufferGeometry();
const precTrailMaxPoints = 2000;
const precTrailPts = new Float32Array(precTrailMaxPoints * 3);
precTrailGeo.setAttribute('position', new THREE.BufferAttribute(precTrailPts, 3));
precTrailGeo.setDrawRange(0, 0);
const precTrailMat = new THREE.LineBasicMaterial({ color: 0xFF00FF, transparent: true, opacity: 0.5 });
precessionTrail = new THREE.Line(precTrailGeo, precTrailMat);
precessionTrail.userData = { points: [] };
helpersGroup.add(precessionTrail);

// 22. Great Year Label & Progress Arc
greatYearLabel = _makeTextSprite("Great Year", { font: 'Bold 40px Arial', fillStyle: '#FF00FF', size: 512 });
greatYearLabel.material.sizeAttenuation = false;
greatYearLabel.scale.set(0.12, 0.12, 0.12);
helpersGroup.add(greatYearLabel);

const precArcGeo = new THREE.BufferGeometry();
const precArcPts = new Float32Array(303 * 3); // 100 segments * 3 coords
precArcGeo.setAttribute('position', new THREE.BufferAttribute(precArcPts, 3));
precArcGeo.setDrawRange(0, 0);
const precArcMat = new THREE.LineBasicMaterial({ color: 0xFF00FF, linewidth: 2 });
precProgressArc = new THREE.Line(precArcGeo, precArcMat);
precessionGroup.add(precProgressArc);

// 25. Manvantara Visualization (71 Mahayugas)
const manvantaraGroup = new THREE.Group();
helpersGroup.add(manvantaraGroup);
manvantaraGroup.visible = false;

const manRadius = precRadius * 1.4;
const manCurve = new THREE.EllipseCurve(0, 0, manRadius, manRadius, 0, 2 * Math.PI, false, 0);
const manPts = manCurve.getPoints(142);
const manGeo = new THREE.BufferGeometry().setFromPoints(manPts.map(p => new THREE.Vector3(p.x, precY, p.y)));
const manMat = new THREE.LineBasicMaterial({ color: 0x00FFFF, transparent: true, opacity: 0.4 });
const manRing = new THREE.LineLoop(manGeo, manMat);
manvantaraGroup.add(manRing);

for(let i=0; i<71; i++) {
    const angle = (i / 71) * Math.PI * 2;
    // 28th Mahayuga (index 27)
    const isCurrent = (i === 27);
    
    const rInner = manRadius * 0.96;
    const rOuter = manRadius * 1.04;
    const x1 = Math.sin(angle) * rInner;
    const z1 = Math.cos(angle) * rInner;
    const x2 = Math.sin(angle) * rOuter;
    const z2 = Math.cos(angle) * rOuter;
    
    const tickGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1, precY, z1), new THREE.Vector3(x2, precY, z2)]);
    const color = isCurrent ? 0xFFFFFF : 0x008888;
    const opacity = isCurrent ? 1.0 : 0.3;
    const tickMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity });
    const tick = new THREE.Line(tickGeo, tickMat);
    manvantaraGroup.add(tick);
    
    if (isCurrent) {
        const labelPos = new THREE.Vector3(Math.sin(angle) * manRadius * 1.12, precY, Math.cos(angle) * manRadius * 1.12);
        const label = _makeTextSprite("28th Mahayuga", { font: '24px Arial', fillStyle: '#FFFFFF' });
        label.scale.set(0.08, 0.08, 0.08);
        label.position.copy(labelPos);
        manvantaraGroup.add(label);
    }
}

const manLabel = _makeTextSprite("Vaivasvata Manvantara (7th)", { font: 'Bold 32px Arial', fillStyle: '#00FFFF' });
manLabel.scale.set(0.12, 0.12, 0.12);
manLabel.position.set(0, precY, -manRadius * 1.25);
manvantaraGroup.add(manLabel);

// 26. Kalpa Visualization (14 Manvantaras)
const kalpaGroup = new THREE.Group();
helpersGroup.add(kalpaGroup);
kalpaGroup.visible = false;

const kalpaRadius = precRadius * 1.8;
const kalpaCurve = new THREE.EllipseCurve(0, 0, kalpaRadius, kalpaRadius, 0, 2 * Math.PI, false, 0);
const kalpaPts = kalpaCurve.getPoints(140);
const kalpaGeo = new THREE.BufferGeometry().setFromPoints(kalpaPts.map(p => new THREE.Vector3(p.x, precY, p.y)));
const kalpaMat = new THREE.LineBasicMaterial({ color: 0xFF00FF, transparent: true, opacity: 0.4 });
const kalpaRing = new THREE.LineLoop(kalpaGeo, kalpaMat);
kalpaGroup.add(kalpaRing);

const MANVANTARA_NAMES = [
    "Svayambhuva", "Svarocisha", "Uttama", "Tamasa", "Raivata", "Caksusha",
    "Vaivasvata", "Savarni", "Daksa Savarni", "Brahma Savarni",
    "Dharma Savarni", "Rudra Savarni", "Raucya", "Bhaautya"
];

for(let i=0; i<14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    // Current is 7th (index 6)
    const isCurrent = (i === 6);
    
    const rInner = kalpaRadius * 0.96;
    const rOuter = kalpaRadius * 1.04;
    const x1 = Math.sin(angle) * rInner;
    const z1 = Math.cos(angle) * rInner;
    const x2 = Math.sin(angle) * rOuter;
    const z2 = Math.cos(angle) * rOuter;
    
    const tickGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1, precY, z1), new THREE.Vector3(x2, precY, z2)]);
    const color = isCurrent ? 0xFFFFFF : 0xFF00FF;
    const opacity = isCurrent ? 1.0 : 0.3;
    const tickMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity });
    const tick = new THREE.Line(tickGeo, tickMat);
    kalpaGroup.add(tick);
    
    if (isCurrent) {
        const startAngle = (i / 14) * Math.PI * 2;
        const endAngle = ((i + 1) / 14) * Math.PI * 2;
        const midAngle = (startAngle + endAngle) / 2;
        
        const labelPos = new THREE.Vector3(Math.sin(midAngle) * kalpaRadius * 1.15, precY, Math.cos(midAngle) * kalpaRadius * 1.15);
        const label = _makeTextSprite(MANVANTARA_NAMES[i] + " (Current)", { font: 'Bold 24px Arial', fillStyle: '#FFFFFF' });
        label.scale.set(0.1, 0.1, 0.1);
        label.position.copy(labelPos);
        kalpaGroup.add(label);
        
        const arcPts = [];
        const steps = 20;
        for(let s=0; s<=steps; s++) {
            const t = startAngle + (s/steps)*(endAngle - startAngle);
            arcPts.push(new THREE.Vector3(Math.sin(t)*kalpaRadius, precY, Math.cos(t)*kalpaRadius));
        }
        const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPts);
        const arcMat = new THREE.LineBasicMaterial({ color: 0xFFFFFF, linewidth: 3 });
        const arc = new THREE.Line(arcGeo, arcMat);
        kalpaGroup.add(arc);
    }
}

const kalpaLabel = _makeTextSprite("Shveta Varaha Kalpa", { font: 'Bold 32px Arial', fillStyle: '#FF00FF' });
kalpaLabel.scale.set(0.15, 0.15, 0.15);
kalpaLabel.position.set(0, precY, -kalpaRadius * 1.3);
kalpaGroup.add(kalpaLabel);


function updateConstellationLabels() {
    if (!constellationLabels || !constellationLabels.children) return;
    const R = CONSTELLATION_RADIUS;
    for (let i = 0; i < constellationLabels.children.length; i++) {
        const spr = constellationLabels.children[i];
        const d = camera.position.distanceTo(spr.position);
        // sizeAttenuation is false, so scale is screen relative. 0.12 is reasonable.
        spr.scale.set(0.12, 0.12, 0.12);
        if (spr.material) {
            let op = Math.min(Math.max((d - 0.15 * R) / (0.7 * R), 0.05), 1.0);
            
            // Fade out when zooming out too far
            const fadeStart = 1.5 * R;
            const fadeEnd = 2.5 * R;
            if (d > fadeStart) {
                op *= Math.max(0, 1.0 - (d - fadeStart) / (fadeEnd - fadeStart));
            }

            spr.material.opacity = op;
            spr.material.transparent = true;
            spr.material.needsUpdate = true;
        }
    }
}

function updateRashiLabels() {
    const R = CONSTELLATION_RADIUS;
    
    function updateList(list, screenScale) {
        if (!list.length) return;
        for (let i = 0; i < list.length; i++) {
            const spr = list[i];
            const d = camera.position.distanceTo(spr.position);
            spr.scale.set(screenScale, screenScale, screenScale);
            if (spr.material) {
                const op = Math.min(Math.max((d - 0.1 * R) / (0.5 * R), 0.0), 1.0);
                spr.material.opacity = op;
                spr.material.transparent = true;
                spr.material.needsUpdate = true;
            }
        }
    }

    updateList(rashiLabelSprites, 0.125);
    updateList(nakshatraLabelSprites, 0.11);
    updateList(grahaSprites, 0.20);
}

// Hook up UI toggles
(function () {
    try {
        const settingsDiv = document.getElementById('settings');
        if (!settingsDiv) return;

        function addCheckbox(id, text, isChecked) {
            if (document.getElementById(id)) return;
            const label = document.createElement('label');
            label.className = 'container';
            label.innerHTML = `${text} <input type="checkbox" id="${id}" ${isChecked ? 'checked' : ''}> <span class="checkmark"></span>`;
            settingsDiv.appendChild(label);
        }

        addCheckbox('ecliptic_grid', 'Ecliptic grid visible', eclipticGrid.visible);

        var t = document.getElementById('constellations'); if (t) { constellationGroup.visible = t.checked; t.addEventListener('change', function () { constellationGroup.visible = t.checked; }); }
        var tl = document.getElementById('const_labels'); if (tl) { constellationLabels.visible = tl.checked; tl.addEventListener('change', function () { constellationLabels.visible = tl.checked; }); }
        var rb = document.getElementById('rashi_belt'); if (rb) { rb.checked = false; rashiBeltGroup.visible = rb.checked; rb.addEventListener('change', function () { rashiBeltGroup.visible = rb.checked; }); }
        var es = document.getElementById('equinox_solstice'); if (es) { equinoxSolsticeGroup.visible = es.checked; es.addEventListener('change', function () { equinoxSolsticeGroup.visible = es.checked; }); }
        var fe = document.getElementById('follow_events'); if (fe) { follow_events = fe.checked; fe.addEventListener('change', function () { follow_events = fe.checked; }); }
        var pe = document.getElementById('pause_events'); if (pe) { pause_on_events = pe.checked; pe.addEventListener('change', function () { pause_on_events = pe.checked; }); }
        var eg = document.getElementById('ecliptic_grid'); if (eg) { eclipticGrid.visible = eg.checked; eg.addEventListener('change', function () { eclipticGrid.visible = eg.checked; }); }
        var cs = document.getElementById('celestial_sphere'); if (cs) { celSphere.visible = cs.checked; cs.addEventListener('change', function () { celSphere.visible = cs.checked; }); }
        
        if (!document.getElementById('western_zodiac')) {
            addCheckbox('western_zodiac', 'Western Zodiac', false);

            const div2 = document.createElement('div');
            div2.innerHTML = 'Ayanamsa: <span id="ayanamsa_val">23.85</span>&deg;<br><input type="range" id="ayanamsa_slider" min="0" max="30" step="0.01" value="23.85" style="width: 100%;">';
            settingsDiv.appendChild(div2);

            const div3 = document.createElement('div');
            div3.innerHTML = 'Preset: <select id="ayanamsa_mode" style="color:black; width:100%"><option value="Manual">Manual</option><option value="Lahiri" selected>Lahiri</option><option value="Raman">Raman</option><option value="Fagan-Bradley">Fagan-Bradley</option></select>';
            settingsDiv.appendChild(div3);
            
            addCheckbox('grahas_toggle', 'Show Grahas (Planets)', true);
            addCheckbox('swastika_toggle', 'Show Swastika Pattern', false);
            addCheckbox('sap_labels_toggle', 'Saptarishi Star Names', true);
            addCheckbox('ayanamsa_toggle', 'Show Ayanamsa', false);
            addCheckbox('gc_toggle', 'Show Galactic Center', true);

            const div9 = document.createElement('div');
            div9.innerHTML = 'Yuga Cycle: <select id="yuga_mode" style="color:black; width:100%"><option value="SriYukteswar" selected>Sri Yukteswar (24k yr)</option><option value="Traditional">Traditional (Long Count)</option></select>';
            settingsDiv.appendChild(div9);

            addCheckbox('manvantara_toggle', 'Show Manvantara', false);
            addCheckbox('kalpa_toggle', 'Show Kalpa', false);
            addCheckbox('cinematic_toggle', 'Cinematic Mode', false);
            addCheckbox('tour_toggle', 'Tour Mode', false);
            addCheckbox('voyager_toggle', 'Show Voyager 1', true);
            addCheckbox('andromeda_toggle', 'Show Andromeda (M31)', true);
            addCheckbox('nearest_stars_toggle', 'Show Nearest Stars (<10ly)', false);
            addCheckbox('nebula_toggle', 'Show Nebulae', true);
            addCheckbox('spaceship_mode_toggle', 'Spaceship Mode', false);
            addCheckbox('horoscope_toggle', 'Show Horoscope Chart', false);
            addCheckbox('horoscope_tour_toggle', 'Horoscope Tour', false);
            addCheckbox('nakshatra_highlight_toggle', 'Highlight Current Nakshatra', false);
        }
        var gt = document.getElementById('grahas_toggle');
        if (gt) {
            grahaGroup.visible = gt.checked;
            gt.addEventListener('change', function() { grahaGroup.visible = gt.checked; });
        }
        var st = document.getElementById('swastika_toggle');
        if (st) {
            swastikaGroup.visible = st.checked;
            st.addEventListener('change', function() { swastikaGroup.visible = st.checked; });
        }
        var sl = document.getElementById('sap_labels_toggle');
        if (sl) {
            saptarishiLabelsGroup.visible = sl.checked;
            sl.addEventListener('change', function() { saptarishiLabelsGroup.visible = sl.checked; });
        }
        var at = document.getElementById('ayanamsa_toggle');
        if (at) {
            ayanamsaGroup.visible = at.checked;
            at.addEventListener('change', function() { ayanamsaGroup.visible = at.checked; updateAyanamsaVisuals(); });
        }
        var gct = document.getElementById('gc_toggle');
        if (gct) {
            galacticCenterGroup.visible = gct.checked;
            gct.addEventListener('change', function() { galacticCenterGroup.visible = gct.checked; });
        }
        var ym = document.getElementById('yuga_mode');
        if (ym) {
            ym.value = yugaMode;
            ym.addEventListener('change', function() {
                yugaMode = ym.value;
                yugaSegments.forEach(seg => {
                    if (seg.mesh) seg.mesh.visible = (yugaMode === 'SriYukteswar');
                    if (seg.label) seg.label.visible = (yugaMode === 'SriYukteswar');
                });
            });
        }
        var mt = document.getElementById('manvantara_toggle');
        if (mt) {
            manvantaraGroup.visible = mt.checked;
            mt.addEventListener('change', function() { manvantaraGroup.visible = mt.checked; });
        }
        var kt = document.getElementById('kalpa_toggle');
        if (kt) {
            kalpaGroup.visible = kt.checked;
            kt.addEventListener('change', function() { kalpaGroup.visible = kt.checked; });
        }
        var cm = document.getElementById('cinematic_toggle');
        if (cm) {
            cm.checked = cinematic_mode;
            cm.addEventListener('change', function() { cinematic_mode = cm.checked; });
        }
        var tm = document.getElementById('tour_toggle');
        if (tm) {
            tm.checked = tour_mode;
            tm.addEventListener('change', function() { 
                tour_mode = tm.checked; 
                if (tour_mode) {
                    last_tour_switch_time = performance.now();
                    tour_index = 0;
                    if (bodies[tour_targets[tour_index]]) GoTo(bodies[tour_targets[tour_index]]);
                }
            });
        }
        var vt = document.getElementById('voyager_toggle');
        if (vt) {
            voyagerGroup.visible = vt.checked;
            vt.addEventListener('change', function() { voyagerGroup.visible = vt.checked; });
        }
        var ant = document.getElementById('andromeda_toggle');
        if (ant) {
            andromedaGroup.visible = ant.checked;
            ant.addEventListener('change', function() { andromedaGroup.visible = ant.checked; });
        }
        var nst = document.getElementById('nearest_stars_toggle');
        if (nst) {
            nearestStarsGroup.visible = nst.checked;
            nst.addEventListener('change', function() { nearestStarsGroup.visible = nst.checked; });
        }
        var nt = document.getElementById('nebula_toggle');
        if (nt) {
            nebulaGroup.visible = nt.checked;
            nt.addEventListener('change', function() { nebulaGroup.visible = nt.checked; });
        }
        var smt = document.getElementById('spaceship_mode_toggle');
        if (smt) {
            smt.checked = spaceship_mode;
            smt.addEventListener('change', function() {
                spaceship_mode = smt.checked;
                spaceship.visible = spaceship_mode;
            });
        }
        var ht = document.getElementById('horoscope_toggle');
        if (ht) {
            ht.checked = horoscope_mode;
            ht.addEventListener('change', function() { horoscope_mode = ht.checked; updateHoroscope(); });
        }
        var htt = document.getElementById('horoscope_tour_toggle');
        if (htt) {
            htt.addEventListener('change', function() {
                horoscope_tour_mode = htt.checked;
                if (horoscope_tour_mode) {
                    // Disable other camera modes
                    tour_mode = false;
                    if(document.getElementById('tour_toggle')) document.getElementById('tour_toggle').checked = false;
                    spaceship_mode = false;
                    if(document.getElementById('spaceship_mode_toggle')) document.getElementById('spaceship_mode_toggle').checked = false;
                    
                    // Auto-enable horoscope view if it's off
                    if (!horoscope_mode) {
                        const ht = document.getElementById('horoscope_toggle');
                        if (ht) ht.click();
                    }
                    horoscope_tour_index = -1; // Reset tour
                    horoscope_tour_last_time = performance.now();
                }
            });
        }
        var nht = document.getElementById('nakshatra_highlight_toggle');
        if (nht) {
            nht.addEventListener('change', function() {
                if (currentNakshatraHighlight) currentNakshatraHighlight.visible = nht.checked;
            });
        }
        var wz = document.getElementById('western_zodiac'); 
        if (wz) { 
            wz.checked = useWesternZodiac; 
            wz.addEventListener('change', function () { 
                useWesternZodiac = wz.checked; 
                const as = document.getElementById('ayanamsa_slider');
                const am = document.getElementById('ayanamsa_mode');
                if (as) as.disabled = (useWesternZodiac || ayanamsaMode !== 'Manual');
                if (am) am.disabled = useWesternZodiac;
                updateRashiBelt();
                rebuildConstellationLabels();
                updateConstellationColors();
            }); 
        }
        var as = document.getElementById('ayanamsa_slider');
        var av = document.getElementById('ayanamsa_val');
        var am = document.getElementById('ayanamsa_mode');
        if (as && av) {
            as.value = ayanamsaDeg;
            av.textContent = ayanamsaDeg.toFixed(2);
            as.disabled = (useWesternZodiac || ayanamsaMode !== 'Manual');
            as.addEventListener('input', function() {
                ayanamsaDeg = parseFloat(as.value);
                av.textContent = ayanamsaDeg.toFixed(2);
                updateRashiBelt();
                rebuildConstellationLabels();
                updateConstellationColors();
            });
        }
        if (am) {
            am.value = ayanamsaMode;
            am.disabled = useWesternZodiac;
            am.addEventListener('change', function() {
                ayanamsaMode = am.value;
                if (as) as.disabled = (useWesternZodiac || ayanamsaMode !== 'Manual');
                if (ayanamsaMode !== 'Manual' && typeof J_C !== 'undefined') {
                    const base = AYANAMSA_PRESETS[ayanamsaMode];
                    ayanamsaDeg = base + (PRECESSION_RATE * J_C);
                    if (as && av) { as.value = ayanamsaDeg; av.textContent = ayanamsaDeg.toFixed(2); }
                    updateRashiBelt();
                    rebuildConstellationLabels();
                    updateConstellationColors();
                }
            });
        }
    } catch (e) { }
})();

// Attempt to load boundaries from assets/constellation_boundaries.json
let constellationBoundaryGroup = null;
(async function loadConstellationBoundaries() {
    try {
        const res = await fetch('assets/constellation_boundaries.json', { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json(); _stars3DData = data; const positions = [];
        for (const poly of data) {
            const pts = poly.boundary || poly.lines || [];
            for (let i = 1; i < pts.length; i++) {
                const a = pts[i - 1], b = pts[i];
                const va = raDecToVector(a[0], a[1], CONSTELLATION_RADIUS);
                const vb = raDecToVector(b[0], b[1], CONSTELLATION_RADIUS);
                positions.push(va.x, va.y, va.z, vb.x, vb.y, vb.z);
            }
        }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const m = new THREE.LineBasicMaterial({ color: 0x66ffaa, transparent: true, opacity: 0.35, depthWrite: false });
        constellationBoundaryGroup = new THREE.LineSegments(g, m);
        scene.add(constellationBoundaryGroup);
        constellationBoundaryGroup.visible = true;
        const cb = document.getElementById('const_boundaries'); if (cb) { constellationBoundaryGroup.visible = cb.checked; cb.addEventListener('change', function () { if (constellationBoundaryGroup) constellationBoundaryGroup.visible = cb.checked; }); }
    } catch (e) { }
    // 3D Stars (HYG) layer
    const stars3DGroup = new THREE.Group();
    stars3DGroup.visible = false;
    scene.add(stars3DGroup);
    var constellationStars3DGroup = new THREE.Group();
    constellationStars3DGroup.visible = true;
    scene.add(constellationStars3DGroup);
    let _stars3DBaseLoaded = false;
    let _stars3DData = null;

    function _hygColor(ci) {
        // Approximate color from B-V color index (ci). Fallback to white.
        if (ci === undefined || isNaN(ci)) return new THREE.Color(1, 1, 1);
        // Simple mapping: blue (-0.3)->(0.6,0.7,1), yellow (0.65)->(1,1,0.6), red (1.5)->(1,0.7,0.6)
        const t = Math.max(-0.3, Math.min(1.5, ci));
        if (t < 0.65) {
            const k = (t + 0.3) / (0.95);
            return new THREE.Color(0.6 + 0.4 * k, 0.7 + 0.3 * k, 1);
        } else {
            const k = (t - 0.65) / (0.85);
            return new THREE.Color(1, 1 - 0.3 * k, 0.6 + 0.1 * k);
        }
    }

    async function loadStars3D() {
        try {
            const res = await fetch('assets/stars3d.json', { cache: 'no-cache' });
            if (!res.ok) return;
            const data = await res.json(); _stars3DData = data; const N = data.length;
            const positions = new Float32Array(N * 3);
            const colors = new Float32Array(N * 3);
            const sizes = new Float32Array(N);
            const TILT = CONSTELLATION_TILT;
            // Use same axis mapping as constellations
            for (let i = 0; i < N; i++) {
                const s = data[i];
                const ra = DegToRad((s.ra || 0) * 15);
                const dec = DegToRad(s.dec);
                // distance in light-years; scale to scene units
                const ly = s.ly;
                const R = ly * LY_UNIT; // 1 ly ~ 1e6 scene units (tweakable)
                const x = R * Math.cos(ra) * Math.cos(dec);
                const y = R * Math.sin(ra) * Math.cos(dec);
                const z = R * Math.sin(dec);
                const y2 = y * Math.cos(TILT) - z * Math.sin(TILT);
                const z2 = y * Math.sin(TILT) + z * Math.cos(TILT);
                const idx = 3 * i;
                positions[idx] = x; positions[idx + 1] = z2; positions[idx + 2] = y2;
                const c = _hygColor(s.ci);
                colors[idx] = c.r; colors[idx + 1] = c.g; colors[idx + 2] = c.b;
                sizes[i] = Math.max(0.5, 3.5 - (s.mag || 5) / 2);
            }
            if (R > maxStarsRadius) maxStarsRadius = R;
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            const mat = new THREE.PointsMaterial({ size: 3.5, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 1.0, depthWrite: false, blending: THREE.AdditiveBlending });
            const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; stars3DGroup.add(pts); _stars3DBaseLoaded = true;
        } catch (e) { /* ignore if file missing */ }
    }

    (function initStars3DUI() {
        const cb = document.getElementById('stars3d');
        const slider = document.getElementById('parallax_slider');
        const label = document.getElementById('parallax_value');
        if (cb) {
            cb.addEventListener('change', () => {
                stars3DGroup.visible = cb.checked;
                if (cb.checked && !_stars3DBaseLoaded) loadStars3D();
            });
        }
        if (slider && label) {
            const apply = () => {
                const f = parseFloat(slider.value) || 1; stars3DScale = f; stars3DGroup.scale.set(f, f, f); if (typeof constellationLines3DGroup !== 'undefined' && constellationLines3DGroup) { constellationLines3DGroup.scale.set(f, f, f); } label.textContent = f.toFixed(1) + "x";
            };
            slider.addEventListener('input', apply);
            slider.addEventListener('change', apply);
            apply();
        }
    })();
})();
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
var center = new THREE.Vector3(0, 0, 0);
target = bodies.sol;
info_target = bodies.sol;
target.Position = new THREE.Vector3(0, 0, 0);
// Approximate galactic orbital speed for the Sun (~230 km/s)
// Velocity in SI (m/s); positions use 1e7 m per scene unit (handled in stellar.update)
bodies.sol.Velocity = new THREE.Vector3(230000, 0, 0);

moons.forEach(moon => moon.SetUp());
stars.forEach(stellar => stellar.SetUp());
//continuum.forEach(moon => moon.SetMesh());
bodies.universal_asteroid.label.visible = false;
bodies.universal_asteroid.Orbit.visible = false;
//sol.SetPos();
//=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//-=-=-=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//-=-=-=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X


function hyper() {
    var darkness = occultation(camera.position, new THREE.Vector3);
    var past = target.Position;

    // --- OPTIMIZATION ---
    // Only calculate planetary and asteroid positions if not in high-speed Yuga animation mode.
    if (!yuga_playing) {
        moons.forEach(moon => moon.SetPos());
        stars.forEach(stellar => stellar.update());
    }

    if (bodies.earth && bodies.earth.Position) {
        if (!yuga_playing) {
            updateGrahaMarkers();
            updateHoroscope();
            updateMoonLabel();
            updateCurrentNakshatraHighlight();
        }
        earthAxisLine.position.copy(bodies.earth.Position);
        
        // Animate Precession
        const precAngle = -DegToRad(PRECESSION_RATE * J_C);
        earthAxisLine.rotation.set(-CONSTELLATION_TILT, precAngle, 0, 'YXZ');
        
        // Update Local Axis
        localEarthAxisLine.position.copy(bodies.earth.Position);
        localEarthAxisLine.rotation.copy(earthAxisLine.rotation);

        earthNormalLine.position.copy(bodies.earth.Position);
        localEarthNormalLine.position.copy(bodies.earth.Position);
        earthTiltArc.position.copy(bodies.earth.Position);

        const halfTilt = CONSTELLATION_TILT / 2;
        const lr = arcRadius * 1.1;
        tiltLabel.position.set(bodies.earth.Position.x, bodies.earth.Position.y + Math.cos(halfTilt) * lr, bodies.earth.Position.z - Math.sin(halfTilt) * lr);

        const d = camera.position.distanceTo(bodies.earth.Position);
        const showAngle = d < 40;
        
        // Visibility Logic
        // Global lines fade out when very close to avoid clutter, but stay visible longer
        // Local lines fade in when close
        const fadeStart = 100;
        const fadeEnd = 10;
        let op = 1.0;
        if (d < fadeStart) op = Math.max(0, (d - fadeEnd) / (fadeStart - fadeEnd));
        
        earthNormalLine.material.opacity = op * 0.5;
        earthNormalLine.visible = op > 0.01;
        
        earthAxisLine.material.opacity = Math.max(0.3, op * 0.8); // Keep axis visible but fainter when close
        earthAxisLine.visible = true;

        // Local Axis Line (Visible when zoomed in)
        localEarthAxisLine.material.opacity = (1.0 - op) * 0.8;
        localEarthAxisLine.visible = (1.0 - op) > 0.01;

        // Local Normal Line (Visible when zoomed in)
        localEarthNormalLine.material.opacity = (1.0 - op) * 0.8;
        localEarthNormalLine.visible = (1.0 - op) > 0.01;

        // Twinkle Dhruva
        if (dhruvaMarker) {
            const time = performance.now() * 0.001;
            const scale = 1.0 + 0.3 * Math.sin(time * 5);
            dhruvaMarker.scale.setScalar(scale);
            dhruvaMarker.material.opacity = 0.85 + 0.15 * Math.cos(time * 3);

            // Twinkle Saptarishi
            saptarishiStars.forEach((star, i) => {
                const phase = i * 1.0;
                const sScale = 1.0 + 0.2 * Math.sin(time * 1.0 + phase);
                star.scale.setScalar(sScale);
                star.material.opacity = 0.85 + 0.15 * Math.cos(time * 0.6 + phase);
            });
        }

        // Pulse Equinox Markers
        if (equinoxSolsticeGroup.visible) {
            const time = performance.now() * 0.001;
            const scale = 1.2 + 0.3 * Math.sin(time * 2.0);
            if (vernalMarker) vernalMarker.scale.setScalar(scale);
            if (autumnalMarker) autumnalMarker.scale.setScalar(scale);
        }

        earthTiltArc.visible = showAngle;
        tiltLabel.visible = showAngle;

        // Update Pole Star Label
        const currentYear = 2000 + (J_C * 100);
        const POLE_STARS = [
            { name: "Polaris (Ursa Minor)", year: 2000 },
            { name: "Errai (Cepheus)", year: 4000 },
            { name: "Alderamin (Cepheus)", year: 7500 },
            { name: "Deneb (Cygnus)", year: 10000 },
            { name: "Vega (Lyra)", year: 14000 },
            { name: "Thuban (Draco)", year: -3000 },
            { name: "Kochab (Ursa Minor)", year: -1000 }
        ];
        let closestStar = POLE_STARS[0];
        let minDiff = Math.abs(currentYear - POLE_STARS[0].year);
        for(let ps of POLE_STARS) {
            const diff = Math.abs(currentYear - ps.year);
            if(diff < minDiff) { minDiff = diff; closestStar = ps; }
        }
        
        // Calculate tip position for label and trail
        const tipLocal = new THREE.Vector3(0, CONSTELLATION_RADIUS, 0);
        tipLocal.applyEuler(earthAxisLine.rotation);
        const tipWorld = tipLocal.clone().add(bodies.earth.Position);

        if (poleStarLabel) {
            poleStarLabel.position.copy(tipWorld).multiplyScalar(1.02);
            const labelText = closestStar.name;
            if (poleStarLabel.userData.lastText !== labelText) {
                const canvas = document.createElement('canvas');
                const size = 512; canvas.width = size; canvas.height = size;
                const ctx = canvas.getContext('2d');
                ctx.font = 'Bold 40px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillStyle = '#AAAAFF'; ctx.fillText(labelText, size/2, size/2);
                const tex = new THREE.Texture(canvas); tex.needsUpdate = true;
                if (poleStarLabel.material.map) poleStarLabel.material.map.dispose();
                poleStarLabel.material.map = tex;
                poleStarLabel.userData.lastText = labelText;
                poleStarLabel.material.needsUpdate = true;
            }
        }

        // Update Great Year Label & Arc
        if (greatYearLabel && precProgressArc) {
            greatYearLabel.position.copy(tipWorld).multiplyScalar(1.06); // Slightly above Pole Star label
            
            let txt = "";
            const currentYear = 2000 + (J_C * 100);

            if (yugaMode === 'SriYukteswar') {
                // Sri Yukteswar Model: 24,000 year cycle
                // 499 AD is start of Ascending Kali (Bottom of clock)
                let delta = currentYear - 499;
                let pos = delta % 24000;
                if (pos < 0) pos += 24000;
                
                let yuga = "";
                let year = 0;
                let phase = "";
                
                if (pos < 12000) {
                    phase = "Asc";
                    if (pos < 1200) { yuga = "Kali"; year = pos; }
                    else if (pos < 3600) { yuga = "Dwapara"; year = pos - 1200; }
                    else if (pos < 7200) { yuga = "Treta"; year = pos - 3600; }
                    else { yuga = "Satya"; year = pos - 7200; }
                } else {
                    phase = "Desc";
                    let dPos = pos - 12000;
                    if (dPos < 4800) { yuga = "Satya"; year = dPos; }
                    else if (dPos < 8400) { yuga = "Treta"; year = dPos - 4800; }
                    else if (dPos < 10800) { yuga = "Dwapara"; year = dPos - 8400; }
                    else { yuga = "Kali"; year = dPos - 10800; }
                }
                txt = `${yuga} ${Math.floor(year + 1)} (${phase})`;
            } else {
                // Traditional Model: Kali Yuga started 3102 BCE (-3101)
                const kYear = currentYear + 3101;
                txt = `Kali Yuga ${Math.floor(kYear)}`;
            }
            
            if (greatYearLabel.userData.lastText !== txt) {
                const canvas = document.createElement('canvas');
                const size = 512; canvas.width = size; canvas.height = size;
                const ctx = canvas.getContext('2d');
                ctx.font = 'Bold 40px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FF00FF'; ctx.fillText(txt, size/2, size/2);
                const tex = new THREE.Texture(canvas); tex.needsUpdate = true;
                if (greatYearLabel.material.map) greatYearLabel.material.map.dispose();
                greatYearLabel.material.map = tex;
                greatYearLabel.userData.lastText = txt;
                greatYearLabel.material.needsUpdate = true;
            }

            const yd = document.getElementById('yuga_display');
            if (yd) yd.textContent = txt;

            // Update Arc
            const radius = CONSTELLATION_RADIUS * Math.sin(CONSTELLATION_TILT);
            const y = CONSTELLATION_RADIUS * Math.cos(CONSTELLATION_TILT);
            const cycleAngle = -DegToRad(PRECESSION_RATE * J_C) % (Math.PI * 2);
            const segments = 100;
            const pos = precProgressArc.geometry.attributes.position.array;
            for(let i=0; i<=segments; i++) {
                const t = (i/segments) * cycleAngle;
                // x = R sin(t), z = R cos(t) matches the axis rotation logic
                pos[i*3] = radius * Math.sin(t);
                pos[i*3+1] = y;
                pos[i*3+2] = radius * Math.cos(t);
            }
            precProgressArc.geometry.setDrawRange(0, segments+1);
            precProgressArc.geometry.attributes.position.needsUpdate = true;
        }

        // Animate Swastika (Seasonal Rotation)
        if (swastikaGroup && swastikaGroup.visible) {
            const axis = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), -CONSTELLATION_TILT);
            const angle = -(J_D / 365.2422) * Math.PI * 2; // Rotate clockwise (Westward drift of stars at fixed solar time)
            swastikaGroup.setRotationFromAxisAngle(axis, angle);
        }

        // Animate Kalpa (Cosmic Breath)
        if (kalpaGroup && kalpaGroup.visible) {
            const time = performance.now() * 0.001;
            const scale = 1.0 + 0.05 * Math.sin(time * 0.5);
            kalpaGroup.scale.set(scale, 1, scale);
        }

        // Animate Nearest Stars
        if (nearestStarsGroup && nearestStarsGroup.visible) {
            const time = performance.now() * 0.001;
            nearestStarsGroup.children.forEach((child, i) => {
                // We only want to animate the star meshes, not the labels or lines
                if (child instanceof THREE.Mesh) {
                    const scaleFactor = 1.0 + 0.1 * Math.sin(time * 0.8 + i); // Slow pulse
                    child.scale.setScalar(scaleFactor);
                }
            });
        }

        // Animate Nebulae (Rotation and Pulsing)
        if (nebulaGroup && nebulaGroup.visible) {
            const time = performance.now() * 0.001;
            nebulaGroup.children.forEach((nebulaCluster, i) => {
                nebulaCluster.rotation.y += 0.00005 * (i % 2 === 0 ? 1 : -1); // Slow rotation
                nebulaCluster.rotation.y += 0.0002 * (i % 2 === 0 ? 1 : -1); // Faster rotation
                nebulaCluster.rotation.z += 0.0001 * (i % 3 === 0 ? 1 : -1); // Add Z rotation
                nebulaCluster.children.forEach((sprite, j) => {
                    if (sprite.userData.baseScale) {
                        const scaleFactor = 1.0 + 0.05 * Math.sin(time * 0.5 + i * 0.7 + j * 0.3); // Subtle pulse
                        sprite.scale.set(sprite.userData.baseScale.x * scaleFactor, sprite.userData.baseScale.y * scaleFactor, sprite.userData.baseScale.z * scaleFactor);
                    }
                });
            });
        }

        // Animate Nearest Stars
        if (nearestStarsGroup && nearestStarsGroup.visible) {
            const time = performance.now() * 0.001;
            nearestStarsGroup.children.forEach((child, i) => {
                // We only want to animate the star meshes, not the labels or lines
                if (child instanceof THREE.Mesh) {
                    const scaleFactor = 1.0 + 0.1 * Math.sin(time * 0.8 + i); // Slow pulse
                    child.scale.setScalar(scaleFactor);
                }
            });
        }

        if (!yuga_playing) {
            updateVoyager();
        }

        // Update Precession Hand (Great Year Clock)
        if (precHand) {
            const precY = CONSTELLATION_RADIUS * Math.cos(CONSTELLATION_TILT);
            const center = new THREE.Vector3(0, precY, 0);
            const tip = tipLocal.clone(); // Use the correct precessing pole position
            const posAttr = precHand.geometry.attributes.position;
            posAttr.setXYZ(0, center.x, center.y, center.z);
            posAttr.setXYZ(1, tip.x, tip.y, tip.z);
            posAttr.needsUpdate = true;

            // Highlight Active Yuga (Only in Sri Yukteswar Mode)
            if (yugaMode === 'SriYukteswar') {
                // Calculate angle in standard math convention (0 at +X, CCW)
                // tip is on the XZ plane at height precY
                let angle = RadToDeg(Math.atan2(tip.z, tip.x));
                const normalize = (d) => (d % 360 + 360) % 360;
                const nAngle = normalize(angle);

                yugaSegments.forEach(seg => {
                    const nStart = normalize(seg.start);
                    const nEnd = normalize(seg.end);
                    let active = false;
                    // Handle wrapping (e.g. start 300, end 20)
                    if (nStart <= nEnd) {
                        active = (nAngle >= nStart && nAngle <= nEnd);
                    } else {
                        active = (nAngle >= nStart || nAngle <= nEnd);
                    }

                    if (active) {
                        seg.mesh.material.opacity = 1.0;
                        if (seg.label) { seg.label.visible = false; } // Hide static label to avoid overlap
                    } else {
                        seg.mesh.material.opacity = 0.5;
                        if (seg.label) { seg.label.visible = true; seg.label.material.opacity = 0.8; }
                    }
                });
            }
        }

        // Update Precession Trail
        if (precessionTrail) {
            const pts = precessionTrail.userData.points;
            // Only add point if moved enough or empty
            if (pts.length === 0 || pts[pts.length - 1].distanceTo(tipWorld) > CONSTELLATION_RADIUS * 0.005) {
                pts.push(tipWorld);
                if (pts.length > 2000) pts.shift();
                
                const posAttr = precessionTrail.geometry.attributes.position;
                for (let i = 0; i < pts.length; i++) {
                    posAttr.setXYZ(i, pts[i].x, pts[i].y, pts[i].z);
                }
                precessionTrail.geometry.setDrawRange(0, pts.length);
                posAttr.needsUpdate = true;
            }
        }

        // Update Earth Ecliptic Marker
        earthEcMarker.position.set(bodies.earth.Position.x, 0, bodies.earth.Position.z);

        // Update Earth Ecliptic Vertical Line
        const elPos = earthEcLine.geometry.attributes.position.array;
        elPos[0] = bodies.earth.Position.x; elPos[1] = bodies.earth.Position.y; elPos[2] = bodies.earth.Position.z;
        elPos[3] = bodies.earth.Position.x; elPos[4] = 0; elPos[5] = bodies.earth.Position.z;
        earthEcLine.geometry.attributes.position.needsUpdate = true;
        earthEcLine.computeLineDistances();

        // Update Trail
        const currentEcPos = new THREE.Vector3(bodies.earth.Position.x, 0, bodies.earth.Position.z);
        if (earthTrailPoints.length === 0 || earthTrailPoints[earthTrailPoints.length - 1].distanceTo(currentEcPos) > 200) {
            earthTrailPoints.push(currentEcPos);
            if (earthTrailPoints.length > 300) earthTrailPoints.shift();
            earthTrailGeo.setFromPoints(earthTrailPoints);
        }

        const angle = Math.atan2(bodies.earth.Position.z, bodies.earth.Position.x);
        const deg = RadToDeg(angle);
        let lit = false;
        const tol = 2.5;
        if (Math.abs(deg) < tol || Math.abs(deg - 90) < tol || Math.abs(deg + 90) < tol || Math.abs(Math.abs(deg) - 180) < tol) {
            lit = true;
        }
        if (lit) {
            earthEcMarker.visible = true;
            earthEcMarker.material.color.setHex(0xffffff);
            earthEcMarker.scale.set(4, 4, 4);

            // Date Display
            var sim_time = new Date((1000 * J_S) + 946684800858);
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const dateStr = sim_time.getUTCDate() + " " + monthNames[sim_time.getUTCMonth()] + " " + sim_time.getUTCFullYear();
            
            if (earthEcDateLabel.currentText !== dateStr) {
                const canvas = document.createElement('canvas');
                const size = 256;
                canvas.width = size; canvas.height = size;
                const ctx = canvas.getContext('2d');
                ctx.font = 'Bold 40px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(dateStr, size / 2, size / 2);
                const tex = new THREE.Texture(canvas); tex.needsUpdate = true;
                if (earthEcDateLabel.material.map) earthEcDateLabel.material.map.dispose();
                earthEcDateLabel.material.map = tex;
                earthEcDateLabel.currentText = dateStr;
                earthEcDateLabel.material.needsUpdate = true;
            }
            earthEcDateLabel.position.copy(earthEcMarker.position).multiplyScalar(1.05);
            earthEcDateLabel.visible = true;

            if (follow_events && target !== bodies.earth) {
                GoTo(bodies.earth);
            }

            if (pause_on_events && !paused && !event_in_progress) {
                paused = true;
                event_in_progress = true;
            }
        } else {
            earthEcMarker.visible = false;
            earthEcDateLabel.visible = false;
            event_in_progress = false;
        }
    }

    // Update Ecliptic Grid (Dynamic Density)
    if (eclipticGrid.visible) {
        const d = camera.position.distanceTo(controls.target);
        eclipticGrid.position.set(controls.target.x, 0, controls.target.z);
        eclipticGrid.scale.setScalar(d * 3);
        eclipticGrid.material.uniforms.time.value = performance.now() / 1000;
    }
    if (!yuga_playing) {
        updateCloud();
        updateSataliteCloud();
    }
    sataliteCloud.position.copy(bodies.earth.Position)
    if (model != null) {
        model.position.copy(bodies.gonggong1.Position);
        model.rotateY(0.01);
        model.position.y += 0.025;
    }
    var present = target.Position;
    var delta = new THREE.Vector3(0, 0, 0);
    delta.subVectors(present, past);
    camera.position.add(delta);
    //camera.position.x += 0.001;
    ring.position.copy(bodies.saturn.Position);
    var rel = new THREE.Vector3(0, 0, 0);
    rel.subVectors(camera.position, target.Position)
    if (travelling == true) {
        if (rel.length() < controls.minDistance * 2) {
            travelling = false;
        }
        rel.divideScalar(10);
        camera.position.sub(rel);
    }
    if (fov_down == true && camera.fov > 5) {
        camera.fov = camera.fov * 0.98;
        camera.near = 0.02;
        if (maxStarsRadius > 0) { farTarget = Math.max(farTarget, maxStarsRadius * stars3DScale * 1.5); }
        camera.far = 1e10;
        camera.updateProjectionMatrix();
        document.getElementById("fov").innerHTML = camera.fov.toFixed(1) + "&deg";
        controls.rotateSpeed = controls.rotateSpeed * 0.99;
    }
    if (fov_up == true && camera.fov < 110) {
        camera.fov = camera.fov * 1.02;
        camera.near = 0.02;
        if (maxStarsRadius > 0) { farTarget = Math.max(farTarget, maxStarsRadius * stars3DScale * 1.5); }
        camera.far = 1e10;
        camera.updateProjectionMatrix();
        document.getElementById("fov").innerHTML = camera.fov.toFixed(1) + "&deg";
        controls.rotateSpeed = controls.rotateSpeed * 1.01;
    }
    if (time_decceleration == true && Math.abs(time_rate) > 0.5) {
        if (Math.abs(time_rate) < 10000) {
            time_rate = time_rate * 0.8
        }
        else {
            time_rate = time_rate * 0.95
        }
    }
    if (time_acceleration == true && Math.abs(time_rate) < 1000000000) {
        if (Math.abs(time_rate) < 10000) {
            time_rate = time_rate * 1.2
        }
        else {
            time_rate = time_rate * 1.05
        }
    }
    if (strength_up == true && bloomPass.strength < 10) {
        bloomPass.strength = bloomPass.strength + 0.02;
    }
    if (strength_down == true && bloomPass.strength > 0) {
        bloomPass.strength = bloomPass.strength - 0.02;
    }
    center.copy(target.Position)
    if (target instanceof moon) { }
    else {
        if (target.dwarfPlanet == true) {
            controls.minDistance = 0.1;
            //asteroid.position.copy(target.Position)
            //asteroid.rotateY(time_rate * 0.0000001)
        }
        else {
            controls.minDistance = 0.008;
            //asteroid.position.copy(target.Position)
            //asteroid.rotateY(time_rate * 0.000005)
        }
    }
    const __d = camera.position.distanceTo(target.Position);
    const __nearestConst = Math.abs(__d - CONSTELLATION_RADIUS);
    camera.near = 0.02;
    // Expand far plane to include 3D stars extent
    var farTarget = Math.max(1e8, (camera.position.distanceTo(target.Position) + CONSTELLATION_RADIUS * 1.2));
    if (maxStarsRadius > 0) { farTarget = Math.max(farTarget, maxStarsRadius * stars3DScale * 1.5); }
    camera.far = 1e10;
    camera.far = 1e10;
    camera.updateProjectionMatrix();
    controls.target = center;
    var orientation = new THREE.Vector3(0, 0, 0);
    orientation.copy(present);
    orientation.sub(target.parent.parent.Position)
    orientation.normalize();
    // three r118+ requires a target vector
    const _camDir = new THREE.Vector3();
    camera.getWorldDirection(_camDir);
    orientation.sub(_camDir)
    separation = orientation.lengthSq()
    if (auto_expo == true) {
        if (camera.position.distanceTo(target.Position) > 1000) {
            target_exposure = 0.75;

        }
        if (camera.position.distanceTo(target.Position) > 5000000) {
            const dist = camera.position.distanceTo(target.Position);
            const factor = Math.min(1.0, 10000 / dist);
            target_exposure = 0.2 + 0.8 * Math.sqrt(factor);

        }
        if (camera.position.distanceTo(target.Position) < 1000) {
            var brightness = 0.1 + (separation / 6);
            amb.intensity = 0.05 * brightness;
            if (darkness == true) {
                brightness = 0.1 + (separation / 3);
                amb.intensity = 0.4 * brightness;
            }
            target_exposure = brightness;
        }
        var exposure = bloomPass.strength + 0.075 * (target_exposure - bloomPass.strength);
        bloomPass.strength = exposure;
        sky.material.color = new THREE.Color(exposure - 0.5, exposure - 0.5, exposure - 0.5);
        PointCloud.material.color = new THREE.Color(exposure, exposure, exposure);
        PointCloud.material.needsUpdate = true
    }
    moons.forEach(moon => {
        moon.SetPosition();
        if (moon.label && labels_visible) {
            // Hide Earth Barycenter label
            if (bodies.earth_barycenter && moon === bodies.earth_barycenter) {
                moon.label.visible = false;
                return;
            }

            const d = camera.position.distanceTo(moon.Position);
            
            // Default thresholds for Planets (orbiting Sun)
            let startFade = 5000000; 
            let endFade = 20000000;

            // For Moons (orbiting Planets)
            // Treat Earth as a planet for visibility purposes
            const isEarth = (bodies.earth && moon === bodies.earth);
            if (moon.parent !== bodies.sol && !isEarth) {
                startFade = 1000; 
                endFade = 5000;
            }

            let op = 1.0;
            if (d > startFade) {
                op = Math.max(0, 1.0 - (d - startFade) / (endFade - startFade));
            }
            
            moon.label.visible = op > 0.01;
            if (moon.label.visible) moon.label.material.opacity = op;
        }
    });
    updateConstellationLabels();

    document.getElementById("name").innerHTML = info_target.name
    document.getElementById("x").innerHTML = comma((info_target.Position.x * 10000).toFixed(0)) + "KM";
    document.getElementById("y").innerHTML = comma((info_target.Position.z * 10000).toFixed(0)) + "KM";
    document.getElementById("z").innerHTML = comma((-info_target.Position.y * 10000).toFixed(0)) + "KM";
    document.getElementById("inc").innerHTML = info_target.Data[2].toFixed(3) + "&deg";
    document.getElementById("ecc").innerHTML = info_target.Data[0].toFixed(3);
    document.getElementById("ta").innerHTML = (RadToDeg(target.trueAnomaly)).toFixed(3) + "&deg";
    snipe.visible = false;
    var sma = info_target.Data[9];
    if (sma < bodies.earth_barycenter.Data[9] / 10) {
        document.getElementById("sma").innerHTML = (info_target.Data[9]).toFixed(0) + "KM";
    }
    else {
        document.getElementById("sma").innerHTML = (info_target.Data[9] / bodies.earth_barycenter.Data[9]).toFixed(1) + "AU";
    }
    var period = (target.Data[11] / 86400);
    if (period > 3) {
        document.getElementById("period").innerHTML = (period * 1).toFixed(1) + "D";
    }
    if (period < 3) {
        document.getElementById("period").innerHTML = (period * 24).toFixed(1) + "H";
    }
    if (period > 3000) {
        document.getElementById("period").innerHTML = (period / 365).toFixed(1) + "Y";
    }
    document.getElementById("count").innerHTML = satalites.length + continuum.length + tisk.length;
    document.getElementById("camx").innerHTML = camera.position.x.toFixed(0);
    document.getElementById("camy").innerHTML = camera.position.y.toFixed(0);
    document.getElementById("camz").innerHTML = camera.position.z.toFixed(0);
    // Adaptive zoom speed: increase with distance (in ly)
}


//=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//-=-=-=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//-=-=-=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X=-=-=-=-=X
var dummyNakshatra = {
    Position: new THREE.Vector3(),
    Velocity: new THREE.Vector3(),
    name: "",
    info: "Nakshatra View",
    Data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    parent: bodies.sol,
    Orbit: { visible: false, material: { uniforms: { colorA: { value: new THREE.Color() } }, needsUpdate: false } },
    color: 0xffffff
};
function focusOnNakshatra(index) {
    const nakAngle = (Math.PI * 2) / 27;
    const offsetAngle = useWesternZodiac ? 0 : DegToRad(ayanamsaDeg);
    const angle = index * nakAngle + nakAngle / 2 + offsetAngle;
    const R = CONSTELLATION_RADIUS * 0.9;
    const x = R * Math.cos(angle);
    const z = R * Math.sin(angle);
    dummyNakshatra.Position.set(x, 0, z);
    dummyNakshatra.name = NAKSHATRA_NAMES[index];
    
    // Update Info
    const details = NAKSHATRA_DETAILS[index];
    dummyNakshatra.info = `<b>${NAKSHATRA_NAMES[index]}</b><br>Ruler: ${details.ruler}<br>Deity: ${details.deity}`;
    document.getElementById("info").innerHTML = dummyNakshatra.info;

    // Update Visual Indicator
    nakshatraSelectionRing.position.copy(dummyNakshatra.Position);
    nakshatraSelectionRing.lookAt(0, 0, 0);
    nakshatraSelectionRing.visible = true;

    GoTo(dummyNakshatra);
}
function assign() {
    var object = document.getElementById("search").value;
    if (typeof NAKSHATRA_NAMES !== 'undefined') {
        var nakIndex = NAKSHATRA_NAMES.findIndex(n => n.toLowerCase() === object.toLowerCase());
        if (nakIndex > -1) {
            focusOnNakshatra(nakIndex);
            return;
        }
    }
    function within(array) {
        return array.name == object;
    }
    var index = continuum.findIndex(within);
    if (index > -1) {
        GoTo(continuum[index]);
    }
    else {
        function lookfor(array) {
            return array.Name == object;
        }
        function lookfordesignation(array) {
            return array.Principal_desig == object;
        }
        index = tisk.findIndex(lookfor);
        if (index > -1) {
            //document.getElementById("search").value = index + 1;
            assign2(index + 1)
        }
        else {
            index = tisk.findIndex(lookfordesignation);
            if (index > -1) {
                //document.getElementById("search").value = index + 1;
                assign2(index + 1)
            }
        }
    }
}
function assign2(object) {
    function makeTextSprite(message, fontsize) {
        var canvas = document.createElement('canvas');
        var size = 100;
        canvas.width = size * 2;
        canvas.height = size;
        var context = canvas.getContext('2d');
        context.font = fontsize + "px Arial";
        //context.strokeStyle = "rgb(255,255,255)";
        context.textAlign = 'center';
        //context.lineWidth = 4;

        context.fillStyle = "rgb(100, 200, 255)";
        context.fillText(message, size / 1, size / 2);

        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial({ map: texture, useScreenCoordinates: false, depthTest: false, transparent: true, opacity: 0.6, sizeAttenuation: false });
        return spriteMaterial;
    }
    bodies.universal_asteroid.label.owner = bodies.universal_asteroid;
    bodies.universal_asteroid.label.material.needsUpdate = true;
    bodies.universal_asteroid.label.visible = true;
    scene.remove(bodies.universal_asteroid.Orbit);
    scene.remove(bodies.universal_asteroid.label);
    if (tisk[object - 1].Name != null) {
        bodies.universal_asteroid.name = tisk[object - 1].Name
        bodies.universal_asteroid.label.material = makeTextSprite(tisk[object - 1].Name, 20);
        bodies.universal_asteroid.label.scale.set(0.3, 0.3, 0.3);
    }
    else {
        bodies.universal_asteroid.name = tisk[object - 1].Principal_desig
        bodies.universal_asteroid.label.material = makeTextSprite(tisk[object - 1].Principal_desig, 20);
        bodies.universal_asteroid.label.scale.set(0.3, 0.3, 0.3);
    }
    bodies.universal_asteroid.Data[0] = tisk[object - 1].e
    bodies.universal_asteroid.Data[2] = tisk[object - 1].i
    bodies.universal_asteroid.Data[3] = tisk[object - 1].Node
    bodies.universal_asteroid.Data[4] = tisk[object - 1].Peri
    bodies.universal_asteroid.Data[7] = 86400 * (tisk[object - 1].Epoch - 2451545);
    bodies.universal_asteroid.Data[9] = tisk[object - 1].a * 149598023
    bodies.universal_asteroid.SetUp();
    GoTo(bodies.universal_asteroid)
}

function _updateTextSprite(sprite, text, options) {
    const canvas = document.createElement('canvas');
    const size = (options && options.size) ? options.size : 256;
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.font = (options && options.font) ? options.font : '28px Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = (options && options.fillStyle) ? options.fillStyle : 'white';
    ctx.fillText(text, size / 2, size / 2);
    const tex = new THREE.Texture(canvas); tex.needsUpdate = true;
    if (sprite.material.map) sprite.material.map.dispose();
    sprite.material.map = tex;
}

function GoTo(object) {
    if (object !== dummyNakshatra) {
        nakshatraSelectionRing.visible = false;
    }
    if (!(target instanceof stellar)) {
        target.Orbit.material.uniforms.colorA.value = new THREE.Color(target.color);
        target.Orbit.material.needsUpdate = true;
    }
    travelling = true;
    target = object;
    info_target = object;
    controls.target.copy(object.Position);
    if (!(target instanceof stellar)) {
        target.Orbit.material.uniforms.colorA.value = new THREE.Color("rgb(0,255,0)")
        target.Orbit.material.needsUpdate = true;
    }
    if (target instanceof moon) {
        controls.minDistance = target.Physical[0] / 15000000;
    }
    document.getElementById("search").blur();
}
const SataliteMesh = new THREE.Geometry();
const MegaMesh = new THREE.Geometry();
var MaxPoints = tisk.length;
var PointCloud;
var sataliteCloud;
function pack() {
    var points = [];
    for (var i = 0; i < MaxPoints; i++) {
        points[i] = new THREE.Vector3();
        if (tisk[i].Name != null) {
            list.push(tisk[i].Name);
        }
        else {
            list.push(tisk[i].Principal_desig);
        }
    }
    for (var i = 0; i < MaxPoints; i++) {
        MegaMesh.vertices.push(points[i]);
        if (tisk[i].Orbit_type === "Hilda") {
            MegaMesh.colors[i] = new THREE.Color("rgb(0, 217, 255)")
        }
        if (tisk[i].Orbit_type === "Distant Object") {
            MegaMesh.colors[i] = new THREE.Color("rgb(0, 255, 64)")
        }
        if (tisk[i].Orbit_type === "Jupiter Trojan") {
            MegaMesh.colors[i] = new THREE.Color("rgb(244, 184, 252)")
        }
        if (tisk[i].Orbit_type === "Hungaria") {
            MegaMesh.colors[i] = new THREE.Color("rgb(255, 255, 0)")
        }
        if (tisk[i].Orbit_type === "Phocaea") {
            MegaMesh.colors[i] = new THREE.Color("rgb(89, 255, 0)")
        }
        if (tisk[i].Orbit_type === "Object with perihelion distance < 1.665 AU") {
            MegaMesh.colors[i] = new THREE.Color("rgb(149, 0, 255)")
        }
        if (tisk[i].Orbit_type === "Aten") {
            MegaMesh.colors[i] = new THREE.Color("rgb(183, 255, 0)")
        }
        if (tisk[i].Orbit_type === "Apollo") {
            MegaMesh.colors[i] = new THREE.Color("rgb(255, 0, 221)")
        }
        if (tisk[i].Orbit_type === "Amor") {
            MegaMesh.colors[i] = new THREE.Color("rgb(255, 0, 43)")
        }
        if (tisk[i].Orbit_type === "Atira") {
            MegaMesh.colors[i] = new THREE.Color("rgb(0, 38, 255)")
        }
        if (tisk[i].Orbit_type === "MBA") {
            MegaMesh.colors[i] = new THREE.Color("rgb(255, 222, 173)")
        }
        var mu = 6.67408e-11 * 1.98847e30;
        var coef = ((Math.sqrt((mu) / (Math.pow((149598023000 * tisk[i].a), 3)))));
        var m0 = DegToRad(tisk[i].M);
        var b = tisk[i].a * Math.sqrt(1 - (tisk[i].e * tisk[i].e))
        var Cw = Math.cos(DegToRad(tisk[i].Peri));
        var Sw = Math.sin(DegToRad(tisk[i].Peri));
        var co = Math.cos(DegToRad(tisk[i].Node));
        var so = Math.sin(DegToRad(tisk[i].Node));
        var ci = Math.cos(DegToRad(tisk[i].i));
        var si = Math.sin(DegToRad(tisk[i].i));
        var swci = Sw * ci;
        var cwci = Cw * ci;
        var pX = Cw * co - so * swci;
        var pY = Cw * so + co * swci;
        var pZ = Sw * si;
        var qx = -Sw * co - so * cwci;
        var qy = -Sw * so + co * cwci;
        var qz = Cw * si;
        var epoch = 86400 * (tisk[i].Epoch - 2451545);
        tisk[i].test = [coef, 149598023000 * b, pX, pY, pZ, qx, qy, qz, (149598023000 * tisk[i].a), tisk[i].e, epoch, m0];
    }
}
function packSatalites() {
    var points = [];
    for (var i = 0; i < satalites.length; i++) {
        points[i] = new THREE.Vector3();
    }
    for (var i = 0; i < satalites.length; i++) {
        SataliteMesh.vertices.push(points[i]);
        SataliteMesh.colors[i] = new THREE.Color("rgb(255, 255, 255)")
        var a = satalites[i].SEMIMAJOR_AXIS * 1000;
        var mu = 6.67408e-11 * 5.972e24;
        var coef = ((Math.sqrt((mu) / (Math.pow(a, 3)))));
        var m0 = DegToRad(satalites[i].MEAN_ANOMALY);
        var b = a * Math.sqrt(1 - (satalites[i].ECCENTRICITY * satalites[i].ECCENTRICITY))
        var Cw = Math.cos(DegToRad(satalites[i].ARG_OF_PERICENTER));
        var Sw = Math.sin(DegToRad(satalites[i].ARG_OF_PERICENTER));
        var co = Math.cos(DegToRad(satalites[i].RA_OF_ASC_NODE));
        var so = Math.sin(DegToRad(satalites[i].RA_OF_ASC_NODE));
        var ci = Math.cos(DegToRad(satalites[i].INCLINATION));
        var si = Math.sin(DegToRad(satalites[i].INCLINATION));
        var swci = Sw * ci;
        var cwci = Cw * ci;
        var pX = Cw * co - so * swci;
        var pY = Cw * so + co * swci;
        var pZ = Sw * si;
        var qx = -Sw * co - so * cwci;
        var qy = -Sw * so + co * cwci;
        var qz = Cw * si;
        var epoch = 0;//86400 * (tisk[i].Epoch - 2451545);
        satalites[i].test = [coef, b, pX, pY, pZ, qx, qy, qz, a, satalites[i].ECCENTRICITY, epoch, m0];
    }
}
function pointer(shape) {
    var PointMaterial = new THREE.PointsMaterial({ size: 1, sizeAttenuation: false, vertexColors: THREE.VertexColors });
    return new THREE.Points(shape, PointMaterial);
}
// Time rate controls (slider + unit + reverse)

var visualStylesApplied = false;
function applyVisualEnhancements() {
    if (visualStylesApplied) return;
    
    // Style Moons & Planets
    moons.forEach(m => {
        // Orbits: Smoother, transparent
        if (m.Orbit && m.Orbit.material) {
            m.Orbit.material.transparent = true;
            m.Orbit.material.opacity = 0.3;
            m.Orbit.material.depthWrite = false;
        }
        
        // Labels: Thinner font, colored
        if (m.label) {
            let color = '#DDDDDD'; 
            const gData = GRAHA_DATA.find(g => g.key === m.name.toLowerCase() || g.name.toLowerCase() === m.name.toLowerCase());
            if (gData) color = gData.color;
            
            const canvas = document.createElement('canvas');
            const size = 512; 
            canvas.width = size; canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.font = '96px Arial'; // Thinner (no Bold)
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillStyle = color;
            const displayName = m.name.charAt(0).toUpperCase() + m.name.slice(1);
            ctx.fillText(displayName, size/2, size/2);
            
            const tex = new THREE.Texture(canvas);
            tex.needsUpdate = true;
            if (m.label.material.map) m.label.material.map.dispose();
            m.label.material.map = tex;
            m.label.scale.set(0.3, 0.3, 0.3);
        }
    });
    visualStylesApplied = true;
}

function _formatTimeRateDisplay(rate) {
    const abs = Math.abs(rate);
    const sign = rate < 0 ? '-' : '';
    let unit = 's';
    let value = abs;
    if (abs >= 86400) { unit = 'd'; value = abs / 86400; }
    else if (abs >= 3600) { unit = 'h'; value = abs / 3600; }
    else if (abs >= 60) { unit = 'min'; value = abs / 60; }
    return `${sign}${value.toFixed(1)} ${unit}/s`;
}

function initTimeControls() {
    const slider = document.getElementById('time_slider');
    const val = document.getElementById('time_value');
    const unit = document.getElementById('time_unit');
    const rev = document.getElementById('time_reverse');
    const pretty = document.getElementById('time_pretty');
    if (!slider || !val || !unit || !rev || !pretty) return;

    const unitMax = { '1': 600, '60': 120, '3600': 48, '86400': 365 };

    function apply() {
        const u = parseFloat(unit.value);
        const number = Math.max(0, parseFloat(val.value) || 0);
        const sign = rev.checked ? -1 : 1;
        time_rate = sign * number * u;
        pretty.textContent = _formatTimeRateDisplay(time_rate);
        const tr = document.getElementById('time_rate');
        if (tr) tr.innerHTML = Math.floor(time_rate);
    }

    function syncSliderFromValue() {
        const max = unitMax[unit.value] || 600;
        slider.max = String(max);
        const number = Math.max(0, parseFloat(val.value) || 0);
        slider.value = String(Math.min(number, max));
    }

    function syncValueFromSlider() {
        val.value = slider.value;
    }

    // Initialize from current time_rate
    let abs = Math.abs(time_rate);
    rev.checked = time_rate < 0;
    if (abs >= 86400) { unit.value = '86400'; val.value = (abs / 86400).toFixed(1); }
    else if (abs >= 3600) { unit.value = '3600'; val.value = (abs / 3600).toFixed(1); }
    else if (abs >= 60) { unit.value = '60'; val.value = (abs / 60).toFixed(1); }
    else { unit.value = '1'; val.value = abs.toFixed(1); }
    syncSliderFromValue();
    apply();

    slider.addEventListener('input', () => { syncValueFromSlider(); apply(); });
    val.addEventListener('input', () => { syncSliderFromValue(); apply(); });
    unit.addEventListener('change', () => { syncSliderFromValue(); apply(); });
    rev.addEventListener('change', () => { apply(); });
}
pack();
packSatalites();
PointCloud = pointer(MegaMesh);
PointCloud.frustumCulled = false;
PointCloud.material.transparent = true;
PointCloud.material.opacity = 0.35;

sataliteCloud = pointer(SataliteMesh);
sataliteCloud.frustumCulled = false;
sataliteCloud.material.transparent = true;
sataliteCloud.material.opacity = 0.7;
function updateCloud() {
    var geom = PointCloud.geometry;
    for (var i = 0; i < MaxPoints; i++) {
        var pos = vector_opt_2(tisk[i].test[1], tisk[i].test[2], tisk[i].test[3], tisk[i].test[4], tisk[i].test[5], tisk[i].test[6], tisk[i].test[7], tisk[i].test[8], tisk[i].test[9], CurrentMa_opt(tisk[i].test[11], tisk[i].test[0], tisk[i].test[10], J_S));
        geom.vertices[i].x = pos[0] * 1e-7;
        geom.vertices[i].y = pos[2] * 1e-7;
        geom.vertices[i].z = -pos[1] * 1e-7;
    }
    geom.verticesNeedUpdate = true;
}
function updateSataliteCloud() {
    var geom = sataliteCloud.geometry;
    for (var i = 0; i < satalites.length; i++) {
        var pos = vector_opt_2(satalites[i].test[1], satalites[i].test[2], satalites[i].test[3], satalites[i].test[4], satalites[i].test[5], satalites[i].test[6], satalites[i].test[7], satalites[i].test[8], satalites[i].test[9], CurrentMa_opt(satalites[i].test[11], satalites[i].test[0], satalites[i].test[10], J_S));
        geom.vertices[i].x = pos[0] * 1e-7;
        geom.vertices[i].y = pos[2] * 1e-7;
        geom.vertices[i].z = -pos[1] * 1e-7;

    }
    geom.verticesNeedUpdate = true;
}
setInterval(onTimerTick, 16)
function onTimerTick() { update(); }
function update() {
    var d = new Date();
    var time = (((d.getTime() / 86400000) + 2440587.5 + (37 + 32.184) / 86400) - 2451545); //julian days since J2000
    var nowMs = d.getTime();
    if (_lastUpdateMs === null) { _lastUpdateMs = nowMs; }
    var dt = (nowMs - _lastUpdateMs) / 1000; // real seconds since last update
    _lastUpdateMs = nowMs;

    if (paused == false) {
        // Advance simulation: base real time + accelerated offset in days
        // time_rate represents simulated seconds per real second
        time_mod = time_mod + ((time_rate - 1) * dt) / 86400;
    }
    J_D = time + time_mod;
    J_C = J_D / 36525;//centuries
    J_S = J_D * 86400;//seconds

    // Auto-update Ayanamsa
    if (!useWesternZodiac && ayanamsaMode !== 'Manual' && AYANAMSA_PRESETS[ayanamsaMode] !== undefined) {
        const base = AYANAMSA_PRESETS[ayanamsaMode];
        const newVal = base + (PRECESSION_RATE * J_C);
        if (Math.abs(newVal - ayanamsaDeg) > 0.01) {
            ayanamsaDeg = newVal;
            updateRashiBelt();
            rebuildConstellationLabels();
            updateConstellationColors();
            const as = document.getElementById('ayanamsa_slider');
            const av = document.getElementById('ayanamsa_val');
            if (as && av) { as.value = ayanamsaDeg; av.textContent = ayanamsaDeg.toFixed(2); }
        }
    }

    var sim_time = new Date((1000 * J_S) + 946684800858);
    var sec = sim_time.getUTCSeconds();
    if (sec < 10) { sec = "0" + sec }
    var min = sim_time.getUTCMinutes();
    if (min < 10) { min = "0" + min }
    var hor = sim_time.getUTCHours();
    if (hor < 10) { hor = "0" + hor }
    var day = sim_time.getUTCDate();
    if (day < 10) { day = "0" + day }
    var mon = sim_time.getUTCMonth();
    if (mon < 10) { mon = "0" + mon }
    var yrs = sim_time.getUTCFullYear();
    document.getElementById("time").innerHTML = yrs + ":" + mon + ":" + day + ":" + hor + ":" + min + ":" + sec;
    document.getElementById("time_rate").innerHTML = Math.floor(time_rate);
}
scene.add(PointCloud);
sataliteCloud.rotateX(-0.40904531187);
sataliteCloud.material.size = 1.5;
scene.add(sataliteCloud);
function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        var count = 0;
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase() && count <= 20) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                    assign();
                });
                a.appendChild(b);
                count++
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}
for (var i = 0; i < continuum.length; i++) {
    list.push(continuum[i].name);
}
if (typeof NAKSHATRA_NAMES !== 'undefined') {
    for (var i = 0; i < NAKSHATRA_NAMES.length; i++) {
        list.push(NAKSHATRA_NAMES[i]);
    }
}
autocomplete(document.getElementById("search"), list);

// Yuga Display UI
const yugaDisplay = document.createElement('div');
yugaDisplay.id = 'yuga_display';
yugaDisplay.style.position = 'absolute';
yugaDisplay.style.top = '60px';
yugaDisplay.style.left = '50px';
yugaDisplay.style.color = '#FFD700';
yugaDisplay.style.fontFamily = 'Arial, sans-serif';
yugaDisplay.style.fontSize = '20px';
yugaDisplay.style.fontWeight = 'bold';
yugaDisplay.style.textShadow = '2px 2px 4px #000000';
yugaDisplay.style.zIndex = '999';
yugaDisplay.style.pointerEvents = 'none';
document.body.appendChild(yugaDisplay);

// Yuga Play Button
const yugaPlayBtn = document.createElement('div');
yugaPlayBtn.id = 'yuga_play_button';
yugaPlayBtn.textContent = '▶';
yugaPlayBtn.style.position = 'absolute';
yugaPlayBtn.style.top = '58px';
yugaPlayBtn.style.left = '15px';
yugaPlayBtn.style.color = '#00FF00';
yugaPlayBtn.style.fontFamily = 'Arial, sans-serif';
yugaPlayBtn.style.fontSize = '24px';
yugaPlayBtn.style.fontWeight = 'bold';
yugaPlayBtn.style.cursor = 'pointer';
yugaPlayBtn.style.zIndex = '999';
yugaPlayBtn.style.textShadow = '2px 2px 4px #000000';
yugaPlayBtn.title = "Play Yuga Cycle (Fast Forward)";

yugaPlayBtn.onclick = function() {
    yuga_playing = !yuga_playing;
    if (yuga_playing) {
        pre_yuga_rate = time_rate;
        time_rate = 31557600 * 500; // 500 years per second
        yugaPlayBtn.textContent = '⏸';
        yugaPlayBtn.style.color = '#FF0000';
    } else {
        time_rate = pre_yuga_rate;
        yugaPlayBtn.textContent = '▶';
        yugaPlayBtn.style.color = '#00FF00';
    }
    const tr = document.getElementById('time_rate');
    if (tr) tr.innerHTML = Math.floor(time_rate);
};
document.body.appendChild(yugaPlayBtn);

animate();
export { meshes, universal_loader, target, scene, Castable, major_castable, J_S, camera, labels_visible, moons_visible, planets_visible, basisLoader, time_rate, paused, occultation };

// Top time slider control: apply on release, preview while dragging
(function initTimeSliderTop() {
    const cont = document.getElementById('time_slider_top_container');
    const slider = document.getElementById('time_slider_top');
    const label = document.getElementById('time_pretty_top');
    if (!cont || !slider || !label) return;

    // Discrete mapping across seconds ? minutes ? hours ? days
    const map = [
        { name: '1 s/s', rate: 1 },
        { name: '10 s/s', rate: 10 },
        { name: '1 min/s', rate: 60 },
        { name: '10 min/s', rate: 600 },
        { name: '1 h/s', rate: 3600 },
        { name: '6 h/s', rate: 21600 },
        { name: '12 h/s', rate: 43200 },
        { name: '1 d/s', rate: 86400 },
        { name: '7 d/s', rate: 604800 },
        { name: '30 d/s', rate: 2592000 },
        { name: '365 d/s', rate: 31557600 },
        { name: '10 yr/s', rate: 315576000 },
        { name: '100 yr/s', rate: 3155760000 },
        { name: '1000 yr/s', rate: 31557600000 },
        { name: '5000 yr/s', rate: 157788000000 },
        { name: '10000 yr/s', rate: 315576000000 }
    ];

    function nearestIndexFromRate(r) {
        const abs = Math.abs(r);
        let idx = 0, best = Infinity;
        for (let i = 0; i < map.length; i++) { const d = Math.abs(map[i].rate - abs); if (d < best) { best = d; idx = i; } }
        return idx;
    }
    function setLabel(idx) { label.textContent = map[idx].name; }
    function applyFromSlider() { const idx = parseInt(slider.value) || 0; const sign = (time_rate < 0) ? -1 : 1; time_rate = sign * map[idx].rate; setLabel(idx); const tr = document.getElementById('time_rate'); if (tr) tr.innerHTML = Math.floor(time_rate); }
    function preview() { const idx = parseInt(slider.value) || 0; setLabel(idx); }

    // Initialize from current time_rate
    slider.value = String(nearestIndexFromRate(time_rate));
    setLabel(parseInt(slider.value));

    // Preview while dragging
    slider.addEventListener('input', preview);
    // Apply on release/commit
    slider.addEventListener('change', applyFromSlider);
    slider.addEventListener('mouseup', applyFromSlider);
    slider.addEventListener('touchend', applyFromSlider);
})();



// Constellations toggle hookup
(function () { try { var t = document.getElementById('constellations'); if (t) { constellationGroup.visible = t.checked; t.addEventListener('change', function () { constellationGroup.visible = t.checked; }); } } catch (e) { } })();


















// 3D Constellation lines using HYG star positions
var constellationLines3DGroup = new THREE.Group();
constellationLines3DGroup.visible = false;
scene.add(constellationLines3DGroup);

function _angSepDeg(raDeg1, decDeg1, raDeg2, decDeg2) {
    const ra1 = DegToRad(raDeg1), dec1 = DegToRad(decDeg1);
    const ra2 = DegToRad(raDeg2), dec2 = DegToRad(decDeg2);
    const s = Math.sin(dec1) * Math.sin(dec2) + Math.cos(dec1) * Math.cos(dec2) * Math.cos(ra1 - ra2);
    const ang = Math.acos(Math.max(-1, Math.min(1, s)));
    return ang * 57.29577951308232; // rad->deg
}

function buildConstellationLines3D(stars, lines, lyScale) {
    // stars: array of { ra(hours), dec(deg), ly }
    // lines: array of { lines: [ [[ra,dec],[ra,dec]], ... ] }
    const starList = stars.map(s => ({ raDeg: (s.ra || 0) * 15, decDeg: s.dec || 0, ly: s.ly || 0 }));
    const positions = [];
    const TILT = CONSTELLATION_TILT;
    function posFrom(radeg, decdeg, ly) {
        const ra = DegToRad(radeg);
        const dec = DegToRad(decdeg);
        const R = ly * LY_UNIT;
        const x = R * Math.cos(ra) * Math.cos(dec);
        const y = R * Math.sin(ra) * Math.cos(dec);
        const z = R * Math.sin(dec);
        const y2 = y * Math.cos(TILT) - z * Math.sin(TILT);
        const z2 = y * Math.sin(TILT) + z * Math.cos(TILT);
        return new THREE.Vector3(x, z2, y2);
    }
    function nearestStar(radeg, decdeg) {
        let best = -1, bestAng = 1e9;
        for (let i = 0; i < starList.length; i++) {
            const s = starList[i];
            const ang = _angSepDeg(radeg, decdeg, s.raDeg, s.decDeg);
            if (ang < bestAng) { bestAng = ang; best = i; }
        }
        return (bestAng <= 1.0) ? starList[best] : null; // 1 degree tolerance
    }
    for (const c of lines) {
        if (!c.lines) continue;
        for (const seg of c.lines) {
            const a = seg[0], b = seg[1];
            const sa = nearestStar(a[0], a[1]);
            const sb = nearestStar(b[0], b[1]);
            if (!sa || !sb) continue;
            const va = posFrom(sa.raDeg, sa.decDeg, sa.ly);
            const vb = posFrom(sb.raDeg, sb.decDeg, sb.ly);
            positions.push(va.x, va.y, va.z, vb.x, vb.y, vb.z);
        }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const m = new THREE.LineBasicMaterial({ color: 0xffaa66, transparent: true, opacity: 0.7, depthWrite: false });
    const lines3d = new THREE.LineSegments(g, m);
    lines3d.frustumCulled = false;
    return lines3d;
}

async function ensureConstellationLines3D() {
    if (!_stars3DBaseLoaded) await loadStars3D();
    try {
        const res = await fetch('assets/stars3d.json', { cache: 'no-cache' }); if (!res.ok) return;
        const stars = await res.json();
        const lyScale = LY_UNIT; // keep in sync with loadStars3D
        const lines3d = buildConstellationLines3D(stars, _constellationData || constellationLines, lyScale);
        while (constellationLines3DGroup.children.length) constellationLines3DGroup.remove(constellationLines3DGroup.children[0]);
        constellationLines3DGroup.add(lines3d);
    } catch (e) { }
}

(function initConstellation3DToggle() { /* disabled */ })();









function buildConstellationStars3D(stars, lines, lyScale) {
    const TILT = CONSTELLATION_TILT;
    function posFrom(radeg, decdeg, ly) {
        const ra = DegToRad(radeg);
        const dec = DegToRad(decdeg);
        const R = ly * lyScale;
        const x = R * Math.cos(ra) * Math.cos(dec);
        const y = R * Math.sin(ra) * Math.cos(dec);
        const z = R * Math.sin(dec);
        const y2 = y * Math.cos(TILT) - z * Math.sin(TILT);
        const z2 = y * Math.sin(TILT) + z * Math.cos(TILT);
        return new THREE.Vector3(x, z2, y2);
    }
    function angSepDeg(raDeg1, decDeg1, raDeg2, decDeg2) {
        const ra1 = DegToRad(raDeg1), dec1 = DegToRad(decDeg1);
        const ra2 = DegToRad(raDeg2), dec2 = DegToRad(decDeg2);
        const s = Math.sin(dec1) * Math.sin(dec2) + Math.cos(dec1) * Math.cos(dec2) * Math.cos(ra1 - ra2);
        const ang = Math.acos(Math.max(-1, Math.min(1, s)));
        return ang * 57.29577951308232;
    }
    const starList = stars.map(s => ({ raDeg: (s.ra || 0) * 15, decDeg: s.dec || 0, ly: s.ly || 0 }));
    const picked = new Set();
    for (const c of (lines || [])) {
        if (!c.lines) continue;
        for (const seg of c.lines) {
            const a = seg[0], b = seg[1];
            let bestA = -1, bestB = -1, bestAngA = 1e9, bestAngB = 1e9;
            for (let i = 0; i < starList.length; i++) {
                const s = starList[i];
                const angA = angSepDeg(a[0], a[1], s.raDeg, s.decDeg);
                if (angA < bestAngA) { bestAngA = angA; bestA = i; }
                const angB = angSepDeg(b[0], b[1], s.raDeg, s.decDeg);
                if (angB < bestAngB) { bestAngB = angB; bestB = i; }
            }
            if (bestAngA <= 1.0 && bestA >= 0) picked.add(bestA);
            if (bestAngB <= 1.0 && bestB >= 0) picked.add(bestB);
        }
    }
    const positions = [];
    picked.forEach(i => {
        const s = starList[i];
        const v = posFrom(s.raDeg, s.decDeg, s.ly);
        positions.push(v.x, v.y, v.z);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xFFD84D, size: 8.0, sizeAttenuation: false, transparent: true, opacity: 1.0, depthWrite: false, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    pts.renderOrder = 5;
    return pts;
}

(async function refreshConstellationStars3D() { try { const res = await fetch('assets/stars3d.json', { cache: 'no-cache' }); if (!res.ok) return; const stars = await res.json(); const lyScale = LY_UNIT; const pts = buildConstellationStars3D(stars, (_constellationData || constellationLines), lyScale); while (constellationStars3DGroup.children.length) constellationStars3DGroup.remove(constellationStars3DGroup.children[0]); constellationStars3DGroup.add(pts); } catch (e) { } })();



// Default-enable 3D stars on load
(function defaultEnable3DStars() { /* disabled */ })();

// Reset sky/space layers to sane defaults
function ResetSkyLayers() {
    try {
        const cb2d = document.getElementById('constellations');
        const cbBound = document.getElementById('const_boundaries');
        const cbRashi = document.getElementById('rashi_belt');
        const cb3dStars = document.getElementById('stars3d');
        const cb3dLines = document.getElementById('constellations_3d');
        const cbEclipticGrid = document.getElementById('ecliptic_grid');
        const cbCelSphere = document.getElementById('celestial_sphere');
        if (cb2d) { cb2d.checked = true; if (typeof constellationGroup !== 'undefined' && constellationGroup) constellationGroup.visible = true; }
        if (cbBound) { cbBound.checked = true; if (typeof constellationBoundaryGroup !== 'undefined' && constellationBoundaryGroup) constellationBoundaryGroup.visible = true; }
        if (cbRashi) { cbRashi.checked = false; if (typeof rashiBeltGroup !== 'undefined' && rashiBeltGroup) rashiBeltGroup.visible = false; }
        if (cb3dLines) { cb3dLines.checked = false; if (typeof constellationLines3DGroup !== 'undefined' && constellationLines3DGroup) constellationLines3DGroup.visible = false; }
        if (cb3dStars) {
            cb3dStars.checked = true;
            stars3DGroup.visible = true;
            if (!_stars3DBaseLoaded) { loadStars3D(); }
        }
        if (cbEclipticGrid) { cbEclipticGrid.checked = true; if (typeof eclipticGrid !== 'undefined' && eclipticGrid) eclipticGrid.visible = true; }
        if (cbCelSphere) { cbCelSphere.checked = true; if (typeof celSphere !== 'undefined' && celSphere) celSphere.visible = true; }
        const slider = document.getElementById('parallax_slider');
        const f = slider ? (parseFloat(slider.value) || 1) : (typeof stars3DScale !== 'undefined' ? stars3DScale : 1);
        if (!isNaN(f)) {
            if (typeof stars3DScale !== 'undefined') stars3DScale = f;
            if (typeof stars3DGroup !== 'undefined' && stars3DGroup) stars3DGroup.scale.set(f, f, f);
            if (typeof constellationLines3DGroup !== 'undefined' && constellationLines3DGroup) constellationLines3DGroup.scale.set(f, f, f);
            if (typeof constellationStars3DGroup !== 'undefined' && constellationStars3DGroup) constellationStars3DGroup.scale.set(f, f, f);
        }
        camera.near = 0.02;
        camera.far = 1e10;
        camera.updateProjectionMatrix();
    } catch (e) { }
}
(function hookResetButton() {
    try {
        const btn = document.getElementById('reset_layers_button');
        if (btn) btn.addEventListener('click', ResetSkyLayers);
    } catch (e) { }
})();






// Helper to broadcast simulation state to parent/sibling frames
const _broadcastCache = { lastTime: 0 };
function broadcastSimulationState() {
    // Limit broadcast rate to ~30fps or so to avoid flooding postMessage
    const now = performance.now();
    if (now - _broadcastCache.lastTime < 32) return;
    _broadcastCache.lastTime = now;

    // Pack data
    const payload = {
        jd: J_D,
        Sun: { x: bodies.sol.Position.x, y: bodies.sol.Position.y, z: bodies.sol.Position.z },
        Mercury: { x: bodies.mercury.Position.x, y: bodies.mercury.Position.y, z: bodies.mercury.Position.z },
        Venus: { x: bodies.venus.Position.x, y: bodies.venus.Position.y, z: bodies.venus.Position.z },
        Earth: { x: bodies.earth.Position.x, y: bodies.earth.Position.y, z: bodies.earth.Position.z },
        Moon: { x: bodies.moon.Position.x, y: bodies.moon.Position.y, z: bodies.moon.Position.z },
        Mars: { x: bodies.mars.Position.x, y: bodies.mars.Position.y, z: bodies.mars.Position.z },
        Jupiter: { x: bodies.jupiter.Position.x, y: bodies.jupiter.Position.y, z: bodies.jupiter.Position.z },
        Saturn: { x: bodies.saturn.Position.x, y: bodies.saturn.Position.y, z: bodies.saturn.Position.z },
        Uranus: { x: bodies.uranus.Position.x, y: bodies.uranus.Position.y, z: bodies.uranus.Position.z },
        Neptune: { x: bodies.neptune.Position.x, y: bodies.neptune.Position.y, z: bodies.neptune.Position.z }
    };

    // Send to parent (if iframe)
    if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'SD79_DATA', payload }, '*');
    }
}

// Listen for time updates from Earth-Sky view
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'EARTH_SKY_DATA') {
        const payload = event.data.payload;
        if (typeof payload.jd === 'number') {
            const targetJD = payload.jd;
            // Reverse engineer time_mod
            // J_D = time + time_mod 
            // J_D (in code) is days since J2000 (2451545.0)

            const d = new Date();
            // Same calculation as in update()
            const time = (((d.getTime() / 86400000) + 2440587.5 + (37 + 32.184) / 86400) - 2451545);

            // incoming JD is full JD. Convert to J2000 offset.
            const targetJ2000 = targetJD - 2451545.0;

            // Set time_mod
            time_mod = targetJ2000 - time;
        }
        if (typeof payload.speed === 'number') {
            time_rate = payload.speed;
        }
        if (typeof payload.paused === 'boolean') {
            paused = payload.paused;
        }
    }
});
