import { MakeOrbit_2, vector, DegToRad, CurrentMa, CurrentMa_opt, BinaryMa, CelestialToEcliptic } from "./functions.js";
import { meshes, scene, Castable, major_castable, J_S, camera, labels_visible, moons_visible, planets_visible, basisLoader, time_rate, paused, occultation } from "./scripting.js";
import * as THREE from './module.js';
import { stellar } from "./stellar.js";
class minor_moon {
    constructor() {
        this.Orbit = null;
        this.Position = [];
        this.Velocity = [];
        this.LivePosition = [];
        this.Data = [];
        this.parent = null;
        this.name = null;
        this.color = null;
        this.label = null;
        this.trueAnomaly = null;
        this.majorLabel = false;
        this.dwarfPlanet = false;
        this.barycenter = false;
        this.initiated = false;//whether this object's geometries have been created yet.
        this.loaded = false;//whether the meshes and textures associated with this object are loaded in
        this.lowPoly = true;// if the mesh is being rendered in a reduced quality mesh
        this.eclipse = false;
    }
    SetPos() {
        var pos = vector(this.parent.Physical[6], 1000 * this.Data[9], this.Data[0], DegToRad(this.Data[2]), DegToRad(this.Data[4]), DegToRad(this.Data[3]), CurrentMa(this.Data[7], this.parent.Physical[6], 1000 * this.Data[9], 0, J_S));
        this.Position = new THREE.Vector3(pos[0], pos[2], -pos[1]);
        this.Position.divideScalar(10000000)
        this.Position.add(this.parent.Position);
        this.Velocity = new THREE.Vector3(pos[3], pos[5], -pos[4])
        this.trueAnomaly = pos[6];
    }
    SetMesh(LOD) {
        var asteroid_texture = new THREE.MeshPhongMaterial();
        var shape = new THREE.SphereGeometry(0.06, 2 * LOD, LOD);
        this.Mesh = new THREE.Mesh(shape, asteroid_texture);
        this.Mesh.owner = this;
        Castable.push(this.Mesh);
        this.Mesh.material.dithering = true;
        this.initiated = true;
        scene.add(this.Mesh)
        meshes.push(this.Mesh)
    }
    SetUp() {
        this.Orbit = MakeOrbit_2(this.Data, this.color);
        scene.add(this.Orbit);
        this.Orbit.owner = this
        function makeTextSprite(message, fontsize) {
            var canvas = document.createElement('canvas');
            var size = 100;
            canvas.width = size * 2;
            canvas.height = size;
            var context = canvas.getContext('2d');
            context.font = "Bold " + fontsize + "px " + "Arial";
            //context.fillRect(0, 0, size, 100);
            context.strokeStyle = "rgb(255,255,255)";
            context.textAlign = 'center';
            context.lineWidth = 4;

            context.fillStyle = "rgb(255,255,255)";
            context.fillText(message, size / 1, size / 2);

            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;

            var spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true, opacity: 0.4, sizeAttenuation: false });
            var sprite = new THREE.Sprite(spriteMaterial);
            sprite.renderOrder = 2;
            return sprite;
        }
        this.label = makeTextSprite(this.name, 20);
        this.label.owner = this;
        Castable.push(this.label);
        if (this.majorLabel == true) {
            major_castable.push(this.label);
        }
        scene.add(this.label)
    }
    SetPosition() {
        this.Orbit.position.copy(this.parent.Position);
        this.label.position.copy(this.Position)
        var h = camera.getEffectiveFOV() / 50;
        var dist = camera.position.distanceTo(this.Position);
        if (this.majorLabel == false) {
            if (dist > 30000 / h) {
                this.label.visible = false;
            }
            else {
                if (labels_visible == true) {
                    this.label.visible = true
                    if (moons_visible == false && !(this.parent instanceof stellar)) {
                        this.label.visible = false
                    }
                    if (planets_visible == false && !(this.parent instanceof stellar)) {
                        this.label.visible = false
                    }
                }
            }
        }
        if (this.loaded == false && dist < 5 && this.barycenter == false) {
            var obj = this;
            if (obj.dwarfPlanet == true) {
                if (this.initiated == false) {
                    this.SetMesh(100);
                }
                var digit = ((obj.Data[7]).toString()).charAt(0);
                basisLoader.load("textures/dwarf" + digit + ".basis", function (texture) {
                    obj.Mesh.material.map = texture;
                });
                basisLoader.load('textures/dwarf_bump' + digit + '.basis', function (texture) {
                    obj.Mesh.material.displacementMap = texture;
                });
                basisLoader.load('textures/dwarf_spec' + digit + '.basis', function (texture) {
                    obj.Mesh.material.specularMap = texture
                });
                basisLoader.load('textures/dwarf_bump' + digit + '.basis', function (texture) {
                    obj.Mesh.material.bumpMap = texture;
                    obj.Mesh.material.bumpScale = 0.005;
                    obj.Mesh.material.displacementScale = 0.005;
                    obj.Mesh.material.shininess = 150;
                    obj.Mesh.material.needsUpdate = true;
                    obj.Mesh.scale.set(1, 1, 1)
                    obj.Mesh.geometry.needsUpdate = true;
                });
            }
            else {
                if (this.initiated == false) {
                    this.SetMesh(6);
                }
                var digit = ((obj.Data[7]).toString()).charAt(0);
                obj.Mesh.rotation.set(0, digit / Math.PI, digit / Math.PI)
                basisLoader.load("textures/asteroid" + digit + ".basis", function (texture) {
                    obj.Mesh.material.map = texture;
                });
                basisLoader.load('textures/asteroid_bump' + digit + '.basis', function (texture) {
                    obj.Mesh.material.displacementMap = texture;
                });
                basisLoader.load('textures/asteroid_bump' + digit + '.basis', function (texture) {
                    obj.Mesh.material.bumpMap = texture;
                    obj.Mesh.material.bumpScale = 0.002;
                    obj.Mesh.material.displacementScale = 0.05;
                    obj.Mesh.shininess = 0;
                    obj.Mesh.material.needsUpdate = true;
                    obj.Mesh.scale.set(0.05, 0.05, 0.05)
                    obj.Mesh.geometry.needsUpdate = true;
                });
            }
            this.loaded = true;
        }
        if (this.loaded == true) {
            if (this.dwarfPlanet != true) {
                if (dist < 0.1 && this.lowPoly == true) {
                    this.Mesh.geometry = new THREE.SphereGeometry(0.06, 200, 100);
                    this.Mesh.geometry.needsUpdate = true;
                    this.lowPoly = false
                }
                if (dist > 0.1 && this.lowPoly == false) {
                    this.Mesh.geometry = new THREE.SphereGeometry(0.06, 6, 3);
                    this.Mesh.geometry.needsUpdate = true;
                    this.lowPoly = true;
                }
            }
            this.Mesh.position.copy(this.Position)
            if (occultation(this.Position, new THREE.Vector3) == true) {
                if (this.eclipse == false) {
                    this.Mesh.material.color = new THREE.Color("rgb(1,1,1)");
                    this.eclipse = true
                }
            }
            else {
                if (this.eclipse == true) {
                    this.Mesh.material.color = new THREE.Color("rgb(255,255,255)");
                    this.eclipse = false;
                }
            }
        }
        if (this.loaded == true && dist > 100000) {
            this.Mesh.material.dispose();
            this.Mesh.geometry.dispose();
            this.Mesh.geometry.needsUpdate = true;
            this.loaded = false;
            this.Mesh.material.needsUpdate = true;
            this.initiated = false;
            scene.remove(this.Mesh);
        }
        this.Orbit.material.uniforms.MA.value = this.trueAnomaly + Math.PI
        this.Orbit.material.needsUpdate = true;
        this.label.scale.set(0.16 * (h), 0.08 * (h))
    }
};
export { minor_moon };