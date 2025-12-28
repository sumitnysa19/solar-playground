import { MakeOrbit_2, vector, DegToRad, CurrentMa, CurrentMa_opt, BinaryMa, CelestialToEcliptic } from "./functions.js";
import { meshes, scene, Castable, major_castable, J_S, camera, labels_visible, moons_visible, planets_visible, basisLoader, time_rate, paused, occultation } from "./scripting.js";
import * as THREE from './module.js';
import { sphereVertShader, sphereFragShader } from "./shaders.js";
import { stellar } from "./stellar.js";
class moon {
    constructor() {
        this.Orbit = null;
        this.Mesh = null;
        this.Position = [];
        this.Velocity = [];
        this.Physical = [];//physical characteristics
        this.Data = [];//orbital data
        this.name = null;
        this.parent = null;
        this.label = null;
        this.trueAnomaly = null;
        this.color = null;//color of orbit
        this.binary = false;
        this.displace = true;//if atmosphere present
        this.atmosphere = null;
        this.majorLabel = false;//if the label is visible regardless of distance
        this.initiated = false;//whether this object's geometries have been created yet.
        this.loaded = false;//whether the meshes and textures associated with this object are loaded in
        this.glow = false;//if the object emits planet shine
        this.light = false;
        this.cloudy = true;//if the object has clouds
        this.atmosphereColor = null;
        this.atmosphereDensity = null;
        this.clouds = null;
        this.tidalLock = false;
        this.manualBumpScale = null;
        this.eclipse = false;//if the planet is in the shadow of another object
    }
    SetPos() {
        if (this.binary == true) {
            var pos = vector(this.parent.Physical[6], 1000 * this.Data[9], this.Data[0], DegToRad(this.Data[2]), DegToRad(this.Data[4]), DegToRad(this.Data[3]), BinaryMa(this, 0, J_S));
        }
        else {
            var pos = vector(this.parent.Physical[6], 1000 * this.Data[9], this.Data[0], DegToRad(this.Data[2]), DegToRad(this.Data[4]), DegToRad(this.Data[3]), CurrentMa(this.Data[7], this.parent.Physical[6], 1000 * this.Data[9], 0, J_S));
        }
        this.Position = new THREE.Vector3(pos[0], pos[2], -pos[1]);
        this.Position.divideScalar(10000000)
        this.Position.add(this.parent.Position);
        var vel = new THREE.Vector3(pos[3], pos[5], -pos[4])
        this.Velocity = vel.add(this.parent.Velocity);
        this.trueAnomaly = pos[6];
    }
    SetMesh() {
        var texture = new THREE.MeshPhongMaterial({ color: new THREE.Color("rgb(255,255,255)") })
        var shape = new THREE.SphereGeometry(this.Physical[0] / 20000000, 100, 200);
        this.Mesh = new THREE.Mesh(shape, texture);
        texture.shininess = 0;
        this.Mesh.owner = this;
        Castable.push(this.Mesh);
        if (this.Physical[3] > 0) {
            this.atmosphere = new THREE.Mesh(new THREE.SphereGeometry((this.Physical[0] / 20000000) + (this.Physical[3] / 50000000), 200, 100),);
            this.atmosphere.scale.y = this.Physical[1] / this.Physical[0];
            this.atmosphere.shininess = 0;
            let uniforms = {
                MA: { type: 'float', value: 0.0 },
                cam: { type: 'vec3', value: 0.0 },
                colorA: {},
                sep: { type: 'float', value: 0.0 },
                sun: { type: 'vec3', value: 0.0 },
                density: { type: 'float', value: 0.0 },
            }
            let material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                fragmentShader: sphereFragShader(),
                vertexShader: sphereVertShader(),
                transparent: true
            })
            scene.add(this.atmosphere)
            material.uniforms.colorA.value = new THREE.Color(this.atmosphereColor);
            material.uniforms.density.value = this.atmosphereDensity;
            this.atmosphere.material = material;
        }
        if (this.cloudy == true) {
            this.clouds = new THREE.Mesh(new THREE.SphereGeometry((this.Physical[0] / 20000000) + (this.Physical[3] / 30000000), 50, 100), new THREE.MeshPhongMaterial());
            this.clouds.scale.y = this.Physical[1] / this.Physical[0];
            this.clouds.shininess = 0;
            var rot = CelestialToEcliptic(DegToRad(this.Physical[4]), DegToRad(this.Physical[5]));
            this.clouds.rotateY(rot[0]);
            this.clouds.rotateZ(rot[1]);
            scene.add(this.clouds)
        }
        if (this.Physical[4] > 0) {
            var rot = CelestialToEcliptic(DegToRad(this.Physical[4]), DegToRad(this.Physical[5]));
            this.Mesh.rotateY(rot[0]);
            this.Mesh.rotateZ(rot[1]);
            if (this.Physical[3] > 0) {
                this.atmosphere.rotateY(rot[0]);
                this.atmosphere.rotateZ(rot[1]);
            }

        }
        else {
            var rot = CelestialToEcliptic(DegToRad(this.parent.Physical[4]), DegToRad(this.parent.Physical[5]));
            this.Mesh.rotateY(rot[0]);
            this.Mesh.rotateZ(rot[1]);
            if (this.Physical[3] > 0) {
                this.atmosphere.rotateY(rot[0]);
                this.atmosphere.rotateZ(rot[1]);
            }
        }
        this.Mesh.scale.y = this.Physical[1] / this.Physical[0];
        if (this.glow == true) {
            this.light = new THREE.PointLight(this.color, 0.1, 1000)
            scene.add(this.light);
        }
        this.Mesh.material.dithering = true;
        this.initiated = true;
        meshes.push(this.Mesh)

    }
    SetUp() {
        this.Orbit = MakeOrbit_2(this.Data, this.color);
        scene.add(this.Orbit);
        this.Orbit.owner = this;
        function makeTextSprite(message, fontsize) {
            var canvas = document.createElement('canvas');
            var size = 100;
            canvas.width = size
            canvas.height = size;
            var context = canvas.getContext('2d');
            context.font = "Bold " + fontsize + "px " + "Arial";
            //context.fillRect(0, 0, size, 100);
            context.strokeStyle = "rgb(255,255,255)";
            context.textAlign = 'center';
            context.lineWidth = 4;

            context.fillStyle = "rgb(255,255,255)";
            context.fillText(message, size / 2, size / 2);

            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;

            var spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false, sizeAttenuation: false });
            var sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(0.08, 0.08, 0.08);
            sprite.renderOrder = 3;
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
        this.Orbit.position.copy(this.parent.Position)
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
        this.label.scale.set(0.08 * (h), 0.08 * (h))
        if (this.loaded == false && dist < this.Physical[0] / (50000 * h)) {
            if (this.initiated == false) {
                this.SetMesh();
            }
            var obj = this
            if (obj.Physical[7] != null) {
                var bumpScale = obj.Physical[7] / 50000000;
            }
            else {
                var bumpScale = obj.Data[7] / 100000;
            }
            basisLoader.load('textures/' + this.name + '.basis', function (texture) { texture.wrapT = THREE.RepeatWrapping; texture.repeat.y = - 1; obj.Mesh.material.map = texture; obj.Mesh.material.needsUpdate = true; }, undefined, function (err) { console.log("color map not found") });
            basisLoader.load('textures/' + this.name + '_bump.basis', function (texture) { texture.wrapT = THREE.RepeatWrapping; texture.repeat.y = - 1; obj.Mesh.material.bumpMap = texture; obj.Mesh.material.bumpScale = bumpScale; obj.Mesh.material.displacementMap = texture; obj.Mesh.material.displacementScale = bumpScale; obj.Mesh.material.needsUpdate = true; }, undefined, function (err) { console.log("bump map not found") });
            basisLoader.load('textures/' + this.name + '_spec.basis', function (texture) { texture.wrapT = THREE.RepeatWrapping; texture.repeat.y = - 1; obj.Mesh.material.specularMap = texture; obj.Mesh.material.shininess = 50; obj.Mesh.material.needsUpdate = true; }, undefined, function (e) { console.error(e) });
            if (this.cloudy == true) {
                basisLoader.load('textures/' + this.name + '_clouds.basis', function (texture) { texture.wrapT = THREE.RepeatWrapping; texture.repeat.y = - 1; obj.clouds.material.map = texture; obj.clouds.material.alphaMap = texture; obj.clouds.material.transparent = true; obj.clouds.material.needsUpdate = true; }, undefined, function (err) { console.log("specular map not found") });
            }
            this.loaded = true;
            scene.add(this.Mesh);
            if (this.atmosphere) scene.add(this.atmosphere);
        }
        if (this.loaded == true && dist > 100000) {
            this.loaded = false;
            this.initiated = false;
            if (this.Mesh) {
                if (this.Mesh.geometry) this.Mesh.geometry.dispose();
                if (this.Mesh.material) {
                    // Dispose texture maps if present
                    if (this.Mesh.material.map) this.Mesh.material.map.dispose();
                    if (this.Mesh.material.bumpMap) this.Mesh.material.bumpMap.dispose();
                    if (this.Mesh.material.displacementMap) this.Mesh.material.displacementMap.dispose();
                    if (this.Mesh.material.specularMap) this.Mesh.material.specularMap.dispose();
                    this.Mesh.material.dispose();
                }
                scene.remove(this.Mesh);
            }
            if (this.atmosphere != null) {
                if (this.atmosphere.material) this.atmosphere.material.dispose();
                if (this.atmosphere.geometry) this.atmosphere.geometry.dispose();
                scene.remove(this.atmosphere);
            }
            if (this.clouds != null) {
                if (this.clouds.material) this.clouds.material.dispose();
                if (this.clouds.geometry) this.clouds.geometry.dispose();
                scene.remove(this.clouds);
            }
        }
        this.Orbit.material.uniforms.MA.value = this.trueAnomaly + Math.PI
        this.Orbit.material.needsUpdate = true;

        if (this.loaded == true) {
            this.Mesh.position.copy(this.Position);

            // Absolute Rotation Helpers
            // Use own pole if defined, else parent's
            var tiltRA = (this.Physical[4] > 0) ? this.Physical[4] : this.parent.Physical[4];
            var tiltDec = (this.Physical[5] > 0) ? this.Physical[5] : this.parent.Physical[5];

            var rot = CelestialToEcliptic(DegToRad(tiltRA), DegToRad(tiltDec));
            // Calculate absolute spin angle
            // J_S is simulated seconds. Physical[2] is period in seconds.
            // Avoid division by zero
            var period = this.Physical[2] || 86400;
            var spin = (J_S / period) * 2 * Math.PI;

            // Apply to Mesh
            this.Mesh.rotation.set(0, 0, 0);
            this.Mesh.rotateY(rot[0]);
            this.Mesh.rotateZ(rot[1]);

            if (this.tidalLock == true) {
                this.Mesh.lookAt(this.parent.Position);
                this.Mesh.rotateY(-Math.PI / 2);
            } else {
                this.Mesh.rotateY(spin);
            }

            // // Apply to Atmosphere
            // if (this.atmosphere) {
            //     this.atmosphere.position.copy(this.Position);
            //     this.atmosphere.rotation.set(0, 0, 0);
            //     this.atmosphere.rotateY(rot[0]);
            //     this.atmosphere.rotateZ(rot[1]);
            //     if (this.tidalLock == true) {
            //         this.atmosphere.lookAt(this.parent.Position);
            //         this.atmosphere.rotateY(-Math.PI / 2);
            //     } else {
            //         this.atmosphere.rotateY(spin);
            //     }
            // }

            // Apply to Clouds
            if (this.clouds && this.cloudy) {
                this.clouds.position.copy(this.Position);
                this.clouds.rotation.set(0, 0, 0);
                this.clouds.rotateY(rot[0]);
                this.clouds.rotateZ(rot[1]);
                this.clouds.rotateY(spin);
            }

            if (this.glow == true) {
                this.light.position.copy(this.Position)
            }
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

        if (this.atmosphere != null) {
            var rel = new THREE.Vector3(0, 0, 0);
            var solar = new THREE.Vector3(0, 0, 0);
            solar.copy(this.Position);
            rel.subVectors(this.Position, camera.position);
            var rot = CelestialToEcliptic(DegToRad(this.Physical[4]), DegToRad(this.Physical[5]));

            const a = new THREE.Euler(0, -rot[0], -rot[1], 'XZY');
            rel.applyEuler(a);
            this.atmosphere.material.uniforms.cam.value = rel;
            this.atmosphere.material.uniforms.sun.value = solar.applyEuler(a);
            this.atmosphere.material.needsUpdate = true;
        }
    }
};
export { moon };
