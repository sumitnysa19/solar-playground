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
var help_visible = false;
var LY_UNIT = 1e6; // scene units per light-year
var maxStarsRadius = 0;
var stars3DScale = 1;
var music = true;
var target_exposure;
var list = [];
var _lastUpdateMs = null;
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
            assign2()
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
    //renderer.render(scene, camera);
    controls.update();
    sky.position.copy(camera.position);
    if (sim_run == true) {
        hyper();
        updateConstellationLabels();
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
    if (camera.position.distanceTo(target.Position) > 30000) {
        var intersects = raycaster.intersectObjects(major_castable);
    }
    else {
        var intersects = raycaster.intersectObjects(Castable);
    }
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
    if (camera.position.distanceTo(target.Position) > 30000) {
        var intersects = raycaster.intersectObjects(major_castable);
    }
    else {
        var intersects = raycaster.intersectObjects(Castable);
    }
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
    for (const c of constellationLines) {
        for (const seg of c.lines) {
            const a = seg[0], b = seg[1];
            const va = raDecToVector(a[0], a[1], CONSTELLATION_RADIUS);
            const vb = raDecToVector(b[0], b[1], CONSTELLATION_RADIUS);
            positions.push(va.x, va.y, va.z, vb.x, vb.y, vb.z);
        }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const m = new THREE.LineBasicMaterial({ color: 0x88bbff, transparent: true, opacity: 0.5, depthWrite: false });
    const lines = new THREE.LineSegments(g, m);
    lines.renderOrder = 1;
    return lines;
}
const constellationGroup = buildConstellations();
scene.add(constellationGroup);
constellationGroup.visible = true;
constellationGroup.frustumCulled = false;
// Replace sample with full dataset from assets/constellations.json
(async function loadConstellationsFull() {
    try {
        const res = await fetch('assets/constellations.json', { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json();
        const positions = [];
        for (const c of data) {
            if (!c.lines) continue;
            for (const seg of c.lines) {
                const a = seg[0], b = seg[1];
                const va = raDecToVector(a[0], a[1], CONSTELLATION_RADIUS);
                const vb = raDecToVector(b[0], b[1], CONSTELLATION_RADIUS);
                positions.push(va.x, va.y, va.z, vb.x, vb.y, vb.z);
            }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        if (constellationGroup.geometry) constellationGroup.geometry.dispose();
        constellationGroup.geometry = g;
        constellationGroup.visible = true;
    } catch (e) { console.warn('constellations.json load failed', e); }
})();
// Labels for constellations
const constellationLabels = new THREE.Group();
scene.add(constellationLabels);
function _makeTextSprite(text) {
    const canvas = document.createElement('canvas');
    const size = 256; canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.font = '28px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, size / 2, size / 2);
    const tex = new THREE.Texture(canvas); tex.needsUpdate = true;
    const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
    const spr = new THREE.Sprite(mat); spr.scale.set(0.8, 0.8, 0.8);
    return spr;
}
let _constellationData = constellationLines;
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
        const pos = dir.multiplyScalar(CONSTELLATION_RADIUS * 1.01);
        const label = _makeTextSprite(c.name);
        label.position.copy(pos);
        label.renderOrder = 2;
        constellationLabels.add(label);
    }
}
rebuildConstellationLabels();
function updateConstellationLabels() {
    if (!constellationLabels || !constellationLabels.children) return;
    const R = CONSTELLATION_RADIUS;
    for (let i = 0; i < constellationLabels.children.length; i++) {
        const spr = constellationLabels.children[i];
        const d = camera.position.distanceTo(spr.position);
        const t = Math.min(Math.max(d / R, 0.2), 3.0); // scale factor
        const s = 0.6 * t;
        spr.scale.set(s, s, s);
        if (spr.material) {
            const op = Math.min(Math.max((d - 0.15 * R) / (0.7 * R), 0.05), 1.0);
            spr.material.opacity = op;
            spr.material.transparent = true;
            spr.material.needsUpdate = true;
        }
    }
}

// Hook up UI toggles
(function () {
    try {
        var t = document.getElementById('constellations'); if (t) { constellationGroup.visible = t.checked; t.addEventListener('change', function () { constellationGroup.visible = t.checked; }); }
        var tl = document.getElementById('const_labels'); if (tl) { constellationLabels.visible = tl.checked; tl.addEventListener('change', function () { constellationLabels.visible = tl.checked; }); }
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

// If full dataset loads, rebuild labels against it
(async function waitFullSwap() {
    try {
        const res = await fetch('assets/constellations.json', { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json(); _stars3DData = data; _constellationData = data; rebuildConstellationLabels();
    } catch (e) { }
})();

// Try to replace sample with full dataset from assets/constellations.json, if present
function linesGeometryFromData(dataset) {
    const positions = [];
    for (const c of dataset) {
        if (!c.lines) continue;
        for (const seg of c.lines) {
            const a = seg[0], b = seg[1];
            const va = raDecToVector(a[0], a[1], CONSTELLATION_RADIUS);
            const vb = raDecToVector(b[0], b[1], CONSTELLATION_RADIUS);
            positions.push(va.x, va.y, va.z, vb.x, vb.y, vb.z);
        }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
}
(async function loadConstellationsFull() {
    try {
        const res = await fetch('assets/constellations.json', { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json(); _stars3DData = data; const newGeom = linesGeometryFromData(data);
        if (constellationGroup.geometry) constellationGroup.geometry.dispose();
        constellationGroup.geometry = newGeom;
        constellationGroup.visible = true;
    } catch (e) {
        // keep sample if not present
    }
})();
scene.add(constellationGroup);
constellationGroup.visible = true;
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
    moons.forEach(moon => moon.SetPos());
    stars.forEach(stellar => stellar.update());
    updateCloud()
    updateSataliteCloud()
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
            sky.material.color = new THREE.Color(1, 1, 1);

        }
        if (camera.position.distanceTo(target.Position) > 5000000) {
            target_exposure = 1;
            sky.material.color = new THREE.Color(4, 4, 4);

        }
        if (camera.position.distanceTo(target.Position) < 1000) {
            var brightness = 0.1 + (separation / 6);
            amb.intensity = 0.05 * brightness;
            if (darkness == true) {
                brightness = 0.1 + (separation / 3);
                amb.intensity = 0.4 * brightness;
            }
            sky.material.needsUpdate = true
            target_exposure = brightness;
        }
        var exposure = bloomPass.strength + 0.075 * (target_exposure - bloomPass.strength);
        bloomPass.strength = exposure;
        sky.material.color = new THREE.Color(exposure - 0.5, exposure - 0.5, exposure - 0.5);
        PointCloud.material.color = new THREE.Color(exposure, exposure, exposure);
        PointCloud.material.needsUpdate = true
    }
    moons.forEach(moon => moon.SetPosition());
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
function assign() {
    var object = document.getElementById("search").value;
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
        context.font = "Bold " + fontsize + "px " + "Arial";
        context.strokeStyle = "rgb(255,255,255)";
        context.textAlign = 'center';
        context.lineWidth = 4;

        context.fillStyle = "rgb(255,255,255)";
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
    }
    else {
        bodies.universal_asteroid.name = tisk[object - 1].Principal_desig
        bodies.universal_asteroid.label.material = makeTextSprite(tisk[object - 1].Principal_desig, 20);
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
function GoTo(object) {
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
            MegaMesh.colors[i] = new THREE.Color("rgb(255, 255, 255)")
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
autocomplete(document.getElementById("search"), list);
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
        { name: '365 d/s', rate: 31557600 }
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
        const cb3dStars = document.getElementById('stars3d');
        const cb3dLines = document.getElementById('constellations_3d');
        if (cb2d) { cb2d.checked = true; if (typeof constellationGroup !== 'undefined' && constellationGroup) constellationGroup.visible = true; }
        if (cbBound) { cbBound.checked = true; if (typeof constellationBoundaryGroup !== 'undefined' && constellationBoundaryGroup) constellationBoundaryGroup.visible = true; }
        if (cb3dLines) { cb3dLines.checked = false; if (typeof constellationLines3DGroup !== 'undefined' && constellationLines3DGroup) constellationLines3DGroup.visible = false; }
        if (cb3dStars) {
            cb3dStars.checked = true;
            stars3DGroup.visible = true;
            if (!_stars3DBaseLoaded) { loadStars3D(); }
        }
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
