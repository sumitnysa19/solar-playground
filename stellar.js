import * as THREE from './module.js';
import { scene, universal_loader, camera, target, J_S } from "./scripting.js";
import { Lensflare, LensflareElement } from './Lensflare.js';
class stellar {
    constructor(Position, name) {
        this.Position = [];
        this.Physical = [];
        this.Velocity = new THREE.Vector3(0, 0, 0);
        this.color = null;
        this.name = null;
        this.lensflare = null;
        this.luminocity
        this.tempurature
        this.parent = this;
        this.Data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this._prevJS = null;
    }
    SetUp() {
        function colorTemperatureToRGB(kelvin) {
            var temp = kelvin / 100;
            var red, green, blue;
            if (temp <= 66) {
                red = 255;
                green = 99.4708025861 * Math.log(temp) - 161.1195681661;
                if (temp <= 19) {
                    blue = 0;
                } else {
                    blue = 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
                }
            } else {
                red = temp - 60;
                red = 329.698727446 * Math.pow(red, -0.1332047592);
                green = temp - 60;
                green = 288.1221695283 * Math.pow(green, -0.0755148492);
                blue = 255;
            }
            return new THREE.Color((clamp(red, 0, 255)) / 255, (clamp(green, 0, 255)) / 255, (clamp(blue, 0, 255)) / 255);
        }
        function clamp(x, min, max) {
            if (x < min) { return min; }
            if (x > max) { return max; }
            return x;
        }
        this.color = colorTemperatureToRGB(this.tempurature)
        this.light = new THREE.PointLight(this.color, this.luminocity, 5000000);
        var textureFlare0 = universal_loader.load("assets/glare.png");
        var textureFlare1 = universal_loader.load("assets/flare1.jpg");
        var textureFlare2 = universal_loader.load("assets/flare2.jpg");
        var textureFlare3 = universal_loader.load("assets/flare3.jpg");
        var textureFlare4 = universal_loader.load("assets/flare1.jpg");
        var lensflare = new Lensflare();
        lensflare.addElement(new LensflareElement(textureFlare0, 512, 0, this.color));
        lensflare.addElement(new LensflareElement(textureFlare1, 60, 0.1, this.color));
        lensflare.addElement(new LensflareElement(textureFlare2, 30, 0.05, this.color));
        lensflare.addElement(new LensflareElement(textureFlare3, 30, 0.075, this.color));
        lensflare.addElement(new LensflareElement(textureFlare4, 30, 0.3, this.color));
        this.lensflare = lensflare;
        this.light.add(this.lensflare);
        scene.add(this.light);
        this.light.position.copy(this.Position);
        this._prevJS = (typeof J_S !== 'undefined') ? J_S : null;
    }
    update() {
        /*
        // Incomplete and not precise - commenting out Sun movement for now
        // Integrate simple linear drift using simulated seconds and SI velocity
        const jsFinite = Number.isFinite(J_S);
        const prevFinite = Number.isFinite(this._prevJS);
        if (jsFinite && prevFinite) {
            const dS = J_S - this._prevJS; // simulated seconds since last update
            if (Number.isFinite(dS) && dS !== 0 && this.Velocity && typeof this.Velocity.x === 'number') {
                const dsScene = dS / 10000000; // convert meters -> scene units (1e7 m per unit)
                if (Number.isFinite(dsScene)) {
                    this.Position.addScaledVector(this.Velocity, dsScene);
                    if (this.light) this.light.position.copy(this.Position);
                }
            }
        }
        // Initialize _prevJS only when J_S is valid to avoid NaN propagation
        if (jsFinite) this._prevJS = J_S;
        */
        if (camera.position.distanceTo(target.Position) > 5000000) {
            this.lensflare.visible = true;
            this.lensflare.material.color = new THREE.Color(0, 0, 1);

        }
        if (camera.position.distanceTo(target.Position) < 5000000 && camera.position.distanceTo(this.Position) > 5000000) {
            this.lensflare.visible = false;
        }
    }
}
export { stellar };
