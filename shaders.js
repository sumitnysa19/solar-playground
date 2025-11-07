
function vertexShader() {
    return `
    varying vec3 vUv; 
    void main() {
      vUv = position; 

      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewPosition; 
    }
  `
}
function fragmentShader() {
    return `
      varying vec3 vUv;
    uniform vec3 colorA;
    uniform float MA;
      void main() {
        gl_FragColor = vec4(colorA, mod(atan((vUv.y * cos(MA)) - (vUv.x * sin(MA)), (vUv.y * sin(MA)) + (vUv.x * cos(MA)))/ 3., 6.28318530718));
      }
  `
}
function sphereVertShader() {
    return `
    varying vec3 pos;
    varying vec3 norm;
    void main() {

        vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * modelViewPosition;

        pos = position;
        norm = normal;
    }
  `
}
function sphereFragShader() {//incomplete
    return `
      varying vec3 pos;
    varying vec3 norm;
    uniform vec3 colorA;
    uniform float MA;
    uniform vec3 cam;
    uniform vec3 sun;
    uniform float density;
    void main() {
        vec3 colorB = colorA;
        float shade = clamp(asin(length(norm + normalize(cam)) / 1.41), 0.2, 1.0);
        float night = length(normalize(pos) - normalize(sun));
        float solar = length(normalize(cam) - normalize(sun));
        float sep = 1.57 - asin(length(pos) / length(cam));
        if (night < 1.41) {
            float shift = ((30.0 * night / 1.41) - 29.0);
            //colorB = vec3 (colorA.x / (shift * shift),colorA.y  / shift, colorA.z  * shift );
            float diff = clamp((50.0) * ((1.41 / night) - 1.0), 0.0, 1.0);
            colorB = vec3(colorA.x + diff * (1.0 - 2.0 * colorA.x), colorA.y + diff * (1.0 - 2.0 * colorA.y), colorA.z + diff * (1.0 - 2.0 * colorA.z));
            night = (night * shift);
        };
        if (shade / (sep * 2.0) > 0.35) {
            shade = clamp(shade * ((shade / (sep * 2.0)) / 0.32), 0.2, 1.0);
            if (night < 0.1) {
                colorB = vec3(1.0 - colorA.x, 1.0 - colorA.y, 1.0 - colorA.z);
                night = 2.0 * solar - 3.0;
            };
        }
        gl_FragColor = vec4(colorB, night * density * pow((shade / sep), 2.0) );

      }
  `
}
export { vertexShader, fragmentShader, sphereVertShader, sphereFragShader };
