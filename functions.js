import {
    EllipseCurve,
    ShaderMaterial,
    Color,
    BufferGeometry,
    Line,
    Vector3
} from "./module.js";
import { stellar } from "./stellar.js";
import { moon } from "./planet.js";
import { minor_moon } from "./moon.js";
import { vertexShader, fragmentShader } from "./shaders.js"
//import {moons } from "./scripting.js";
const stars = [];
const continuum = [];
const moons = [];
const planets = [];
function arctan2(Ey, Ex) {
    var u;
    var Pi = 3.14159265358979;


    if (Ex != 0) {
        u = Math.atan(Ey / Ex);
        if (Ex < 0) { u = u + Pi }
        if (Ex > 0 && Ey < 0) { u = u + 2 * Pi }
    }
    else {
        if (Ey < 0) { u = -Pi / 2 }
        if (Ey == 0) { u = 0 }
        if (Ey > 0) { u = Pi / 2 }
    }
    return u;
}
function vector(M, a, e, i, p, n, m0) {//does what you think it does
    var data = new Array()
    var mu = 6.67408e-11 * M; //gravitational parameter
    var eca = m0 + e / 2;
    var diff = 10000;
    var eps = 0.000001;
    var e1 = 0;
    while (diff > eps) {
        e1 = eca - (eca - e * Math.sin(eca) - m0) / (1 - e * Math.cos(eca));
        diff = Math.abs(e1 - eca);
        eca = e1;
    }
    var ceca = Math.cos(eca);
    var seca = Math.sin(eca);
    e1 = a * Math.sqrt(Math.abs(1 - e * e));
    var xw = a * (ceca - e);
    var yw = e1 * seca;
    var edot = Math.sqrt((mu) / a) / (a * (1 - e * ceca));
    var xdw = -a * edot * seca;
    var ydw = e1 * edot * ceca;
    var Cw = Math.cos(p);
    var Sw = Math.sin(p);
    var co = Math.cos(n);
    var so = Math.sin(n);
    var ci = Math.cos(i);
    var si = Math.sin(i);
    var swci = Sw * ci;
    var cwci = Cw * ci;
    var pX = Cw * co - so * swci;
    var pY = Cw * so + co * swci;
    var pZ = Sw * si;
    var qx = -Sw * co - so * cwci;
    var qy = -Sw * so + co * cwci;
    var qz = Cw * si;
    data[0] = xw * pX + yw * qx;
    data[1] = xw * pY + yw * qy;
    data[2] = xw * pZ + yw * qz;
    data[3] = xdw * pX + ydw * qx;
    data[4] = xdw * pY + ydw * qy;
    data[5] = xdw * pZ + ydw * qz;
    data[6] = arctan2(yw, xw);
    return data;
}
function vector_opt_2(b, pX, pY, pZ, qx, qy, qz, a, e, m0) {
    var data = new Array();
    var E = m0;
    var sinE;
    for (var i = 0; i < 2; i++) {
        sinE = Math.sin(E);
        E = m0 + e * sinE
    }
    var xw = a * (Math.cos(E) - e);
    var yw = b * sinE;
    data[0] = xw * pX + yw * qx;
    data[1] = xw * pY + yw * qy;
    data[2] = xw * pZ + yw * qz;
    return data;
}
function EclipticToEquatorial(x, y, z) {
    var tilt = 0.40904531187;//0.409092880422232 - (0.00022696552481141 * J_C) - (0.0000000028604007185461 * J_C * J_C) + (0.000000503611111111 * J_C * J_C * J_C);
    var data = new Array()
    data[0] = x;
    //data[1] = (-y * Math.sin(tilt)) + (z * Math.cos(tilt));old?
    //data[2] = (y * Math.cos(tilt)) + (z * Math.sin(tilt));old?
    data[1] = (y * Math.cos(tilt)) - (z * Math.sin(tilt));
    data[2] = (y * Math.sin(tilt)) + (z * Math.cos(tilt));
    return data;
}

function DegToRad(x) {
    return x * 0.017453292519943;//converts degrees to radians
}
function RadToDeg(x) {
    return x * 57.295779513083;//converts radians to degrees
}
function Round(x) {
    return x - 2 * Math.PI * Math.floor(x / (2 * Math.PI))
}
function CurrentMa(m0, mass, sma, epoch, time) {//calculates current mean anomaly
    return DegToRad(m0) + ((Math.sqrt((6.67408e-11 * mass) / (Math.pow(sma, 3)))) * (time - epoch)) //returns mean anomaly in radians
}
function CurrentMa_opt(m0, coef, epoch, time) {//calculates current mean anomaly
    return m0 + coef * (time - epoch) //returns mean anomaly in radians
}
function BinaryMa(object, epoch, time) {//calculates current mean anomaly
    return DegToRad(object.Data[7]) + ((DegToRad(object.Data[6])) * (time - epoch)) //returns mean anomaly in radians
}
function CartesianToPolar(x, y, z) {
    var data = new Array();
    data[0] = 2 * Math.PI * RadToDeg(arctan2(y, x))//right ascension
    data[1] = 2 * Math.PI * RadToDeg(Math.atan(z / Math.sqrt((x * x) + (y * y))));//declination
    data[2] = Math.sqrt((x * x) + (y * y) + (z * z)) / 149598023000;//distance 
    return data;
}
function ArraySub(A, B) {//facilitates subtracting corresponding elements of two arrays
    var data = new Array();
    data[0] = A[0] - B[0];
    data[1] = A[1] - B[1];
    data[2] = A[2] - B[2];
    return data;
}
function comma(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, "&nbsp");
}
function perturbations(object) {//applies centennial rate correction
    var data = new Array();
    data[0] = object.Data[9] + (J_C * object.precessions[0] / 1000);
    data[1] = object.Data[0] + J_C * object.precessions[1];
    data[2] = object.Data[2] + J_C * object.precessions[2];
    data[3] = object.Data[4] + J_C * object.precessions[3];
    data[4] = object.Data[3] + J_C * object.precessions[4];
    return data;
}
function DegToHour(x, activation) {//apparently 
    var hour = (24 * x / 360);
    var minute = (60 * (hour - Math.floor(hour)))
    var second = (60 * (minute - Math.floor(minute)))
    if (activation == 1) {
        return Math.floor(hour) + "�" + Math.floor(minute) + "'" + Math.floor(second) + '"';
    }
    if (activation == 0) {
        return x
    }
}
function foci(a, b) {
    return a * Math.sqrt(1 - ((b * b) / (a * a)));
}
function Semi() {
    //return a * Math.sqrt(1 - (e * e));
    return 30e9;
}

function CelestialToEcliptic(ra, dec) {
    var Tilt = 0.40904531187;
    var data = new Array();
    data[0] = Math.atan(((Math.sin(ra) * Math.cos(Tilt)) + (Math.tan(dec) * Math.sin(Tilt))) / Math.cos(ra));
    data[1] = -Math.PI / 2 + Math.asin((Math.sin(dec) * Math.cos(Tilt)) - (Math.cos(dec) * Math.sin(Tilt) * Math.sin(ra)));
    return data;
}
function getAllIndexes(arr, val) {
    var indexes = [], i;
    for (var i = 0; i < arr.length; i++)
        if (arr[i].Orbit_type === val)
            indexes.push(i + 1);
    return indexes;
}
function MakeOrbit_2(base, color) {
    function semiminor(a, e) {
        return a * Math.sqrt(1 - (e * e));
    }
    var curve = new EllipseCurve(
        foci(0.0001 * base[9], semiminor(0.0001 * base[9], base[0])), 0,            // where the middle is
        0.0001 * base[9], semiminor(0.0001 * base[9], base[0]),           // xRadius, yRadius
        0, 2 * Math.PI,  // aStartAngle, aEndAngle
        false,            // aClockwise
        0                 // aRotation
    );
    //var material = color;
    let uniforms = {
        MA: { type: 'float', value: 0.0 },
        colorA: {}
    }
    let material = new ShaderMaterial({
        uniforms: uniforms,
        fragmentShader: fragmentShader(),
        vertexShader: vertexShader(),
        transparent: true
    })
    material.uniforms.colorA.value = new Color(color);
    var geometry = new BufferGeometry().setFromPoints(curve.getPoints(800))
    var orbit = new Line(geometry, material);
    orbit.rotateX(- Math.PI / 2);
    orbit.rotateZ(DegToRad(base[3]));//ascn
    orbit.rotateX(DegToRad(base[2]));//inc
    orbit.rotateZ(Math.PI + DegToRad(base[4]));//aop
    orbit.renderOrder = 2;
    return orbit;
}
function MakeStar(input) {
    var i = new stellar()
    i.name = input.name;
    var ra = DegToRad(input.position[0]);
    var dec = DegToRad(input.position[1]);
    var rad = input.position[2] * 946100000;
    var x = rad * Math.cos(ra) * Math.cos(dec)
    var y = rad * Math.sin(ra) * Math.cos(dec)
    var z = rad * Math.sin(dec);
    var x2 = x;
    var y2 = y * Math.cos(0.40904531187) - z * Math.sin(0.40904531187)
    var z2 = y * Math.sin(0.40904531187) + z * Math.cos(0.40904531187)
    i.Position = new Vector3(x2, z2, y2);
    i.luminocity = input.luminocity || 1.0;
    i.tempurature = input.tempurature || 5772;
    i.color = input.color || "rgb(255, 255, 255)";
    i.Physical[6] = input.mass || 1.98847e30
    stars.push(i);
    continuum.push(i);
    return i;
}
function MakeMoon(input) {
    var i = new moon()
    i.name = input.name;
    i.parent = input.parent;
    i.color = input.color || "rgb(255, 0, 0)";
    i.atmosphereColor = input.atmosphereColor || i.color
    i.atmosphereDensity = input.atmosphereDensity || 1.0;
    i.binary = input.binary || false;
    i.majorLabel = input.majorLabel || false;
    i.cloudy = input.cloudy || false
    i.glow = input.glow || false;
    i.tidalLock = input.tidalLock || false;
    continuum.push(i);
    moons.push(i);
    return i;
}
function MakeMinorMoon(input) {
    var i = new minor_moon()
    i.parent = input.parent;
    i.name = input.name;
    i.color = input.color || "rgb(0, 66, 66)"
    i.majorLabel = input.majorLabel || false;
    i.dwarfPlanet = input.dwarfPlanet || false;
    i.barycenter = input.barycenter || false;
    continuum.push(i);
    moons.push(i)
    return i;
}
export { stars, planets, moons, continuum, MakeStar, MakeMoon, MakeMinorMoon, arctan2, vector, vector_opt_2, EclipticToEquatorial, DegToRad, RadToDeg, Round, CurrentMa, CurrentMa_opt, BinaryMa, CartesianToPolar, ArraySub, comma, perturbations, DegToHour, foci, Semi, CelestialToEcliptic, getAllIndexes, MakeOrbit_2};
