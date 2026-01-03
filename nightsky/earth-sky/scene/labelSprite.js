import * as THREE from "../assets/three/three.module.js";

function createLabelCanvas({
  text,
  width = 512,
  height = 128,
  font = "600 44px system-ui, Segoe UI, Arial",
  textColor = "rgba(240,244,255,0.95)",
  backgroundColor = "rgba(0,0,0,0.55)",
  borderColor = null,
  borderWidth = 0,
  paddingX = 14,
  paddingY = 8,
  cornerRadius = 14,
} = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable for labels.");

  ctx.clearRect(0, 0, width, height);
  ctx.font = font;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  const labelText = text ?? "";

  if (backgroundColor && labelText) {
    const metrics = ctx.measureText(labelText);
    const textWidth = Math.ceil(metrics.width);
    const fontSizeMatch = /(\d+(?:\.\d+)?)px/.exec(font);
    const fontSize = fontSizeMatch ? Number(fontSizeMatch[1]) : 44;

    const bgW = Math.min(width, textWidth + paddingX * 2);
    const bgH = Math.min(height, Math.ceil(fontSize * 1.25) + paddingY * 2);
    const bgX = Math.floor((width - bgW) / 2);
    const bgY = Math.floor((height - bgH) / 2);

    const r = Math.max(0, Math.min(cornerRadius, Math.min(bgW, bgH) / 2));

    ctx.save();
    ctx.fillStyle = backgroundColor;
    ctx.beginPath();
    ctx.moveTo(bgX + r, bgY);
    ctx.arcTo(bgX + bgW, bgY, bgX + bgW, bgY + bgH, r);
    ctx.arcTo(bgX + bgW, bgY + bgH, bgX, bgY + bgH, r);
    ctx.arcTo(bgX, bgY + bgH, bgX, bgY, r);
    ctx.arcTo(bgX, bgY, bgX + bgW, bgY, r);
    ctx.closePath();
    ctx.fill();

    if (borderColor && borderWidth > 0) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.stroke();
    }
    ctx.restore();
  }

  if (labelText) {
    ctx.fillStyle = textColor;
    ctx.fillText(labelText, width / 2, height / 2);
  }

  return canvas;
}

export function createLabelSprite(text, options = {}) {
  const canvas = createLabelCanvas({ text, ...options });
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.name = `Label:${text}`;
  return sprite;
}

export function updateLabelSprite(sprite, text, options = {}) {
  if (!(sprite instanceof THREE.Sprite)) return;
  const material = sprite.material;
  if (!(material instanceof THREE.SpriteMaterial)) return;
  const texture = material.map;
  if (!(texture instanceof THREE.Texture)) return;

  const canvas = createLabelCanvas({
    text,
    width: texture.image?.width ?? 512,
    height: texture.image?.height ?? 128,
    ...options,
  });

  texture.image = canvas;
  texture.needsUpdate = true;
  sprite.name = `Label:${text}`;
}

export function disposeLabelSprite(sprite) {
  if (!(sprite instanceof THREE.Sprite)) return;
  const material = sprite.material;
  if (material?.map) material.map.dispose();
  material?.dispose?.();
}
