import * as THREE from "../assets/three/three.module.js";

const SKY_SHADER = {
  uniforms: {
    luminance: { value: 1.0 },
    mieCoefficient: { value: 0.005 },
    mieDirectionalG: { value: 0.98 },
    rayleighCoefficient: { value: 1.5 },
    tonemapWeighting: { value: 1000.0 },
    turbidity: { value: 2.0 },
    sunDirection: { value: new THREE.Vector3(0, 1, 0) },
    sunAngularDiameterCos: { value: Math.cos((0.53 * Math.PI) / 180) },
    sunFade: { value: 1.0 },
    sunIntensity: { value: 1000.0 },
    dayColor: { value: new THREE.Color(0x7fb7ff) },
    twilightColor: { value: new THREE.Color(0x1d335a) },
    nightColor: { value: new THREE.Color(0x04040a) },
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
      vec4 vertex = vec4(position, 1.0);
      vec4 worldPosition = modelMatrix * vertex;
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vertex;
      // Force to far plane so it behaves like a background layer.
      gl_Position.z = gl_Position.w;
    }
  `,
  fragmentShader: `
    varying vec3 vWorldPosition;
    uniform float luminance;
    uniform float mieCoefficient;
    uniform float mieDirectionalG;
    uniform float rayleighCoefficient;
    uniform float tonemapWeighting;
    uniform float turbidity;
    uniform vec3 sunDirection;
    uniform float sunAngularDiameterCos;
    uniform float sunFade;
    uniform float sunIntensity;
    uniform vec3 dayColor;
    uniform vec3 twilightColor;
    uniform vec3 nightColor;

    #ifndef M_PI
    #define M_PI 3.14159265358979323846264338327950288
    #endif

    #define ONE_OVER_FOURPI (0.25 / M_PI)
    #define THREE_OVER_SIXTEENPI (0.75 * ONE_OVER_FOURPI)
    #define PI_SQUARED (M_PI * M_PI)
    #define PI_CUBED (PI_SQUARED * M_PI)

    const float rayleighZenithLength = 8400.0;
    const float mieZenithLength = 1250.0;
    const vec3 mieKCoefficient = vec3(0.686282, 0.677739, 0.665996);
    const vec3 totalRayleighScattering =
      (8.0 * PI_CUBED * 0.00060009 * 0.00060009 * 6.105 / 5.755) /
      vec3(16.324680576, 6.9865021875, 3.1308271875);

    vec3 totalMie() {
      const vec3 mieK_lambda_sq = mieKCoefficient / vec3(4.624, 3.025, 2.025);
      float c_scaled = (0.6544 * turbidity - 0.6510);
      return 0.434e-3 * 4.0 * PI_CUBED * c_scaled * mieK_lambda_sq;
    }

    float rayleighPhase(float cosTheta) {
      return THREE_OVER_SIXTEENPI * (2.0 + 0.5 * cosTheta * cosTheta);
    }

    float miePhase(float cosTheta) {
      float g_sq = mieDirectionalG * mieDirectionalG;
      return ONE_OVER_FOURPI * (1.0 - g_sq) / pow(1.0 - 2.0 * mieDirectionalG * cosTheta + g_sq, 1.5);
    }

    float rad2deg(float rad) {
      return rad * (180.0 / M_PI);
    }

    vec3 Uncharted2Tonemap(vec3 x) {
      float A = 0.15;
      float B = 0.50;
      float C = 0.10;
      float D = 0.20;
      float E = 0.02;
      float F = 0.30;
      return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
    }

    vec3 Uncharted2Helper(vec3 x) {
      return Uncharted2Tonemap(x);
    }

    void main() {
      vec3 eyeToVertexDirection = normalize(vWorldPosition - cameraPosition);
      // Mask below-horizon half to let the ground/horizon layer show.
      if (eyeToVertexDirection.y < 0.0) discard;

      float _rayleighCoefficient = rayleighCoefficient - (1.0 * (1.0 - sunFade));
      vec3 betaR = totalRayleighScattering * _rayleighCoefficient;
      vec3 betaM = totalMie() * mieCoefficient;

      float cosZenithAngle = eyeToVertexDirection.y;
      float zenithAngle = acos(cosZenithAngle);
      float denom = cosZenithAngle + 0.15 * pow(93.885 - rad2deg(zenithAngle), -1.253);

      float sR = rayleighZenithLength / denom;
      float sM = mieZenithLength / denom;

      vec3 Fex = exp(-(betaR * sR + betaM * sM));

      float cosTheta = dot(eyeToVertexDirection, sunDirection);
      vec3 betaRTheta = betaR * rayleighPhase(cosTheta);
      vec3 betaMTheta = betaM * miePhase(cosTheta);

      vec3 sIBetaRBetaM = sunIntensity * ((betaRTheta + betaMTheta) / (betaR + betaM));
      vec3 Lin = pow(sIBetaRBetaM * (1.0 - Fex), vec3(1.5));

      // Darken the sky as the sun dips below the horizon.
      Lin *= mix(vec3(0.4), vec3(1.0), clamp(sunDirection.y * 2.0 + 0.1, 0.0, 1.0));

      float sundisk = smoothstep(sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta);
      vec3 L0 = vec3(0.1) * Fex;
      L0 += (sunIntensity * 19000.0 * sundisk) * Fex;

      vec3 texColor = (Lin + L0) * 0.04 + vec3(0.0, 0.0003, 0.00075);

      vec3 whiteScale = 1.0 / Uncharted2Helper(vec3(tonemapWeighting));
      vec3 curr = Uncharted2Helper((log2(2.0 / pow(luminance, 4.0))) * texColor);
      vec3 color = curr * whiteScale;
      vec3 retColor = pow(color, vec3(1.0 / (1.2 + (1.2 * sunFade))));

      // Extra artistic grade to ensure a bright daytime sky while preserving the
      // scattering look: blend between night/twilight/day based on sun altitude.
      float sunY = clamp(sunDirection.y, -1.0, 1.0);
      float twilightT = smoothstep(-0.14, 0.02, sunY);
      float dayT = smoothstep(-0.02, 0.20, sunY);
      vec3 grade = mix(nightColor, twilightColor, twilightT);
      grade = mix(grade, dayColor, dayT);

      // Day: lift exposure, Night: keep scattering dominant.
      float gradeMix = mix(0.15, 0.65, dayT);
      retColor = mix(retColor, grade, gradeMix);
      retColor *= mix(0.55, 2.10, dayT);

      // Sun bloom/whitening at the disk during the day.
      retColor = mix(retColor, vec3(1.0), clamp(0.55 * sundisk * dayT, 0.0, 1.0));
      retColor = clamp(retColor, 0.0, 1.0);

      gl_FragColor = vec4(retColor, 1.0);
    }
  `,
};

export function createAtmosphereSky({
  radius = 1500,
  settings = {},
  renderOrder = -1000,
} = {}) {
  const material = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(SKY_SHADER.uniforms),
    vertexShader: SKY_SHADER.vertexShader,
    fragmentShader: SKY_SHADER.fragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    transparent: true,
  });

  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), material);
  mesh.name = "AtmosphereSky";
  mesh.renderOrder = renderOrder;
  mesh.scale.setScalar(radius);

  applySkySettings(mesh, settings);
  return mesh;
}

export function applySkySettings(skyMesh, settings = {}) {
  const u = skyMesh?.material?.uniforms;
  if (!u) return;

  if (Number.isFinite(settings.luminance)) u.luminance.value = settings.luminance;
  if (Number.isFinite(settings.rayleighCoefficient))
    u.rayleighCoefficient.value = settings.rayleighCoefficient;
  if (Number.isFinite(settings.mieCoefficient)) u.mieCoefficient.value = settings.mieCoefficient;
  if (Number.isFinite(settings.mieDirectionalG))
    u.mieDirectionalG.value = settings.mieDirectionalG;
  if (Number.isFinite(settings.tonemapWeighting))
    u.tonemapWeighting.value = settings.tonemapWeighting;
  if (Number.isFinite(settings.turbidity)) u.turbidity.value = settings.turbidity;
  if (Number.isFinite(settings.sunIntensity)) u.sunIntensity.value = settings.sunIntensity;

  if (settings.dayColor) u.dayColor.value.set(settings.dayColor);
  if (settings.twilightColor) u.twilightColor.value.set(settings.twilightColor);
  if (settings.nightColor) u.nightColor.value.set(settings.nightColor);
}

export function updateAtmosphereSky(
  skyMesh,
  {
    sunDirection,
    sunAngularDiameterDeg = 0.53,
    sunFade = undefined,
    sunIntensity = undefined,
  } = {}
) {
  const u = skyMesh?.material?.uniforms;
  if (!u) return;

  if (sunDirection && sunDirection.isVector3) {
    u.sunDirection.value.copy(sunDirection).normalize();
    if (typeof sunFade !== "number") {
      // Fade the daytime contribution as the sun approaches/below the horizon.
      const y = u.sunDirection.value.y;
      u.sunFade.value = THREE.MathUtils.clamp((y + 0.08) / 0.18, 0, 1);
    } else {
      u.sunFade.value = THREE.MathUtils.clamp(sunFade, 0, 1);
    }
  }

  u.sunAngularDiameterCos.value = Math.cos((sunAngularDiameterDeg * Math.PI) / 180);

  if (typeof sunIntensity === "number" && Number.isFinite(sunIntensity)) {
    u.sunIntensity.value = sunIntensity;
  } else if (sunDirection && sunDirection.isVector3) {
    // Simple intensity ramp: bright above horizon, dim below.
    const y = skyMesh.material.uniforms.sunDirection.value.y;
    const t = THREE.MathUtils.clamp((y + 0.05) / 0.20, 0, 1);
    u.sunIntensity.value = THREE.MathUtils.lerp(0, 1200, t);
  }
}
