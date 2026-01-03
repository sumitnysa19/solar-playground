import * as THREE from "../assets/three/three.module.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function makeAtlasCanvas({ tileSize, tileCount }) {
  const canvas = document.createElement("canvas");
  canvas.width = tileSize * tileCount;
  canvas.height = tileSize;
  return canvas;
}

function drawRadialGradientTile(
  ctx,
  x0,
  y0,
  size,
  { inner, outer, glow, ringColor, ringWidth = 0 } = {}
) {
  const cx = x0 + size / 2;
  const cy = y0 + size / 2;
  const r = size * 0.48;

  ctx.clearRect(x0, y0, size, size);

  // Soft glow.
  if (glow) {
    const g = ctx.createRadialGradient(cx, cy, r * 0.05, cx, cy, r * 1.1);
    g.addColorStop(0, glow);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x0, y0, size, size);
  }

  // Disk.
  const grad = ctx.createRadialGradient(cx, cy, r * 0.05, cx, cy, r);
  grad.addColorStop(0, inner ?? "rgba(255,255,255,1)");
  grad.addColorStop(1, outer ?? "rgba(255,255,255,0)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  // Optional outline ring for visibility against bright skies.
  if (ringColor && ringWidth > 0) {
    ctx.save();
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = ringWidth;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(0, r - ringWidth * 0.5), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function createAtlasTexture({ tileSize, tiles }) {
  const canvas = makeAtlasCanvas({ tileSize, tileCount: tiles.length });
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable for atlas generation.");

  for (let i = 0; i < tiles.length; i++) {
    drawRadialGradientTile(ctx, i * tileSize, 0, tileSize, tiles[i]);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  return { texture, canvas };
}

const BILLBOARD_SHADER = {
  uniforms: {
    atlasTexture: { value: null },
    repeat: { value: new THREE.Vector2(1, 1) },
    pixelRatio: { value: 1.0 },
    scale: { value: 1.0 },
    rotation: { value: 0.0 },
  },
  vertexShader: `
    attribute float aSizePx;
    attribute float aOverexposure;
    attribute vec2 aOffset;
    attribute vec3 aColor;
    attribute float aAlpha;

    uniform float pixelRatio;
    uniform float scale;

    varying float vOverexposure;
    varying vec2 vOffset;
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      float sizePx = aSizePx * pixelRatio * scale;
      gl_PointSize = sizePx;

      vOverexposure = aOverexposure;
      vOffset = aOffset;
      vColor = aColor;
      vAlpha = aAlpha;
    }
  `,
  fragmentShader: `
    #ifndef M_PI
    #define M_PI 3.14159265358979323846264338327950288
    #endif

    uniform sampler2D atlasTexture;
    uniform vec2 repeat;
    uniform float rotation;

    varying float vOverexposure;
    varying vec2 vOffset;
    varying vec3 vColor;
    varying float vAlpha;

    const vec3 whiteSmoke = vec3(245.0 / 255.0);
    const vec2 middleOffset = vec2(0.5);
    const float rotationEps = 0.01 * M_PI / 180.0;

    void main() {
      if (vAlpha <= 0.0) discard;

      vec2 uv;
      if (abs(rotation) > rotationEps) {
        float _cos = cos(rotation);
        float _sin = sin(rotation);
        vec2 offsetPointCoord = gl_PointCoord.xy - middleOffset;
        vec2 rotated = vec2(
          offsetPointCoord.x * _cos - offsetPointCoord.y * _sin,
          offsetPointCoord.x * _sin + offsetPointCoord.y * _cos
        ) + middleOffset;
        uv = clamp(vec2(rotated.x, 1.0 - rotated.y), vec2(0.0), vec2(1.0));
      } else {
        uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
      }

      vec4 tex = texture2D(atlasTexture, uv * repeat + vOffset);
      vec3 rgb = tex.rgb * vColor;
      rgb = mix(rgb, whiteSmoke, clamp(vOverexposure, 0.0, 1.0));

      float alpha = tex.a * vAlpha;
      if (alpha < 0.01) discard;
      gl_FragColor = vec4(rgb, alpha);
    }
  `,
};

/**
 * Create a points-based billboard field backed by a small horizontal atlas.
 *
 * Rendering model:
 * - Each point uses a tile in an atlas specified by `aOffset` and `repeat`.
 * - Visibility is controlled via `aAlpha` and `aSizePx` (set to 0 to hide).
 */
export function createPointBillboards({
  count,
  tileSize = 128,
  tiles,
  renderOrder = 300,
  alphaTest = 0.01,
  depthTest = true,
  depthWrite = false,
  scale = 1,
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2),
} = {}) {
  if (!Number.isInteger(count) || count <= 0) {
    throw new TypeError("createPointBillboards requires a positive integer count.");
  }
  if (!Array.isArray(tiles) || tiles.length !== count) {
    throw new TypeError("createPointBillboards requires tiles.length === count.");
  }

  const { texture } = createAtlasTexture({ tileSize, tiles });
  texture.anisotropy = 1;

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizePx = new Float32Array(count);
  const overexposure = new Float32Array(count);
  const offsets = new Float32Array(count * 2);
  const colors = new Float32Array(count * 3);
  const alpha = new Float32Array(count);

  const repeatX = 1 / count;
  for (let i = 0; i < count; i++) {
    offsets[i * 2 + 0] = i * repeatX;
    offsets[i * 2 + 1] = 0;
    sizePx[i] = 0;
    overexposure[i] = 0;
    colors[i * 3 + 0] = 1;
    colors[i * 3 + 1] = 1;
    colors[i * 3 + 2] = 1;
    alpha[i] = 0;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSizePx", new THREE.BufferAttribute(sizePx, 1));
  geometry.setAttribute("aOverexposure", new THREE.BufferAttribute(overexposure, 1));
  geometry.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 2));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
  geometry.computeBoundingSphere();

  const material = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(BILLBOARD_SHADER.uniforms),
    vertexShader: BILLBOARD_SHADER.vertexShader,
    fragmentShader: BILLBOARD_SHADER.fragmentShader,
    transparent: true,
    depthWrite,
    depthTest,
    alphaTest,
  });

  material.uniforms.atlasTexture.value = texture;
  material.uniforms.repeat.value.set(repeatX, 1);
  material.uniforms.pixelRatio.value = pixelRatio;
  material.uniforms.scale.value = scale;

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = renderOrder;

  return {
    points,
    geometry,
    material,
    texture,
    attributes: {
      positions,
      sizePx,
      overexposure,
      offsets,
      colors,
      alpha,
    },
    setPixelRatio: (pr) => {
      material.uniforms.pixelRatio.value = clamp(pr, 1, 3);
    },
    setScale: (s) => {
      material.uniforms.scale.value = clamp(s, 0.2, 6);
    },
    dispose: () => {
      texture.dispose();
      geometry.dispose();
      material.dispose();
    },
  };
}
