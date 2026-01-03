import * as THREE from "../assets/three/three.module.js";
import { CONSTELLATIONS } from "../astro/constellationsData.js";
import { createLabelSprite } from "./labelSprite.js";
import { altAzToVector3, raDecToAltAz } from "../astro/coordinates.js";

function raDecToSkyVector3(raDeg, decDeg, radius) {
  const ra = (raDeg * Math.PI) / 180;
  const dec = (decDeg * Math.PI) / 180;
  return new THREE.Vector3(
    radius * Math.cos(dec) * Math.sin(ra),
    radius * Math.sin(dec),
    radius * Math.cos(dec) * Math.cos(ra)
  );
}

function computeCentroidFromStars(starsByIndex, starIndices, radius) {
  const centroid = new THREE.Vector3();
  let count = 0;
  for (const idx of starIndices) {
    const s = starsByIndex[idx];
    if (!s) continue;
    centroid.add(raDecToSkyVector3(s.raDeg, s.decDeg, radius));
    count++;
  }
  if (count) centroid.multiplyScalar(1 / count);
  return centroid;
}

function addConstellationLabel(group, name, position) {
  const label = createLabelSprite(name, {
    font: "600 44px system-ui, Segoe UI, Arial",
    backgroundColor: "rgba(0,0,0,0.35)",
    textColor: "rgba(240,244,255,0.85)",
  });
  label.scale.set(260, 60, 1);
  label.position.copy(position);
  group.add(label);
}

/**
 * Render stick-figure constellations from a Timeanddate-style catalog.
 *
 * @param {{radius?:number, stars: Array<{raDeg:number, decDeg:number}>, constellations: Array<{name:string, edges:number[][], starIndices?:number[]}>, withLabels?:boolean}} opts
 */
export function createConstellationsFromCatalog({
  radius = 1490,
  starsByIndex,
  constellations,
  withLabels = true,
} = {}) {
  const group = new THREE.Group();
  group.name = "Constellations";
  group.userData.kind = "constellationsCatalog";
  group.userData.radius = radius;

  const material = new THREE.LineBasicMaterial({
    color: 0x7aa2ff,
    transparent: true,
    opacity: 1.0,
    depthWrite: false,
  });

  const starsArr = Array.isArray(starsByIndex) ? starsByIndex : [];
  const list = Array.isArray(constellations) ? constellations : [];

  for (const c of list) {
    if (!c || (!Array.isArray(c.edges) && !Array.isArray(c.indices))) continue;

    const positions = [];
    const edgePairs = [];

    const edges = Array.isArray(c.edges)
      ? c.edges
      : Array.isArray(c.indices)
        ? c.indices.slice(1).map((idx, i) => [c.indices[i], idx])
        : [];

    for (const e of edges) {
      if (!Array.isArray(e) || e.length < 2) continue;
      const ai = e[0];
      const bi = e[1];
      const a = starsArr[ai];
      const b = starsArr[bi];
      if (!a || !b) continue;
      const va = raDecToSkyVector3(a.raDeg, a.decDeg, radius);
      const vb = raDecToSkyVector3(b.raDeg, b.decDeg, radius);
      positions.push(va.x, va.y, va.z, vb.x, vb.y, vb.z);
      edgePairs.push(ai, bi);
    }
    if (positions.length < 6) continue;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeBoundingSphere();

    const lines = new THREE.LineSegments(geometry, material);
    lines.name = `Constellation:${c.name}`;
    lines.userData.edgePairs = edgePairs;
    lines.userData.labelName = c.name;
    group.add(lines);

    if (withLabels) {
      const starIndices = Array.isArray(c.starIndices)
        ? c.starIndices
        : edgePairs.length
          ? Array.from(new Set(edgePairs))
          : [];

      const centroid = computeCentroidFromStars(starsArr, starIndices, radius);
      const label = createLabelSprite(c.name, {
        font: "600 44px system-ui, Segoe UI, Arial",
        backgroundColor: "rgba(0,0,0,0.35)",
        textColor: "rgba(240,244,255,0.85)",
      });
      label.scale.set(260, 60, 1);
      label.position.copy(centroid);
      label.name = `ConstellationLabel:${c.name}`;
      label.userData.kind = "constellationLabel";
      label.userData.constellationName = c.name;
      label.userData.starIndices = starIndices;
      group.add(label);
    }
  }

  return group;
}

export function updateConstellationsForObserver(group, starsByIndex, observer) {
  if (!group || group.userData?.kind !== "constellationsCatalog") return;
  if (!observer) return;
  const latitudeDeg = observer.latitudeDeg;
  const lstDeg = observer.lstDeg;
  if (!Number.isFinite(latitudeDeg) || !Number.isFinite(lstDeg)) return;

  const radius = group.userData.radius || 1490;

  // Cache updates similarly to stars: minute + location.
  const jd = observer.jd;
  const longitudeDeg = observer.longitudeDeg;
  const timeKey = typeof jd === "number" && Number.isFinite(jd) ? Math.round(jd * 24 * 60) : 0;
  const latKey = Math.round(latitudeDeg * 1000);
  const lonKey = Number.isFinite(longitudeDeg) ? Math.round(longitudeDeg * 1000) : 0;
  const cacheKey = `${timeKey}|${latKey}|${lonKey}`;
  if (group.userData._cacheKey === cacheKey) return;
  group.userData._cacheKey = cacheKey;

  const starsArr = Array.isArray(starsByIndex) ? starsByIndex : [];

  group.traverse((obj) => {
    if (obj.isLineSegments && Array.isArray(obj.userData.edgePairs)) {
      const pairs = obj.userData.edgePairs;
      const posAttr = obj.geometry.getAttribute("position");
      if (!posAttr) return;
      const out = posAttr.array;
      let w = 0;

      for (let i = 0; i < pairs.length; i += 2) {
        const a = starsArr[pairs[i]];
        const b = starsArr[pairs[i + 1]];
        if (!a || !b) continue;
        const ha = raDecToAltAz(a.raDeg, a.decDeg, latitudeDeg, lstDeg);
        const hb = raDecToAltAz(b.raDeg, b.decDeg, latitudeDeg, lstDeg);
        const aa = ha.altitudeDeg + (ha.refractionDeg || 0);
        const ab = hb.altitudeDeg + (hb.refractionDeg || 0);
        const va = altAzToVector3(aa, ha.azimuthDeg, radius);
        const vb = altAzToVector3(ab, hb.azimuthDeg, radius);
        out[w++] = va.x;
        out[w++] = va.y;
        out[w++] = va.z;
        out[w++] = vb.x;
        out[w++] = vb.y;
        out[w++] = vb.z;
      }

      // Shrink draw range if we skipped segments.
      obj.geometry.setDrawRange(0, Math.floor(w / 3));
      posAttr.needsUpdate = true;
      obj.geometry.computeBoundingSphere();
    } else if (obj.isSprite && obj.userData?.kind === "constellationLabel") {
      const starIndices = obj.userData.starIndices;
      if (!Array.isArray(starIndices) || starIndices.length < 1) return;
      const centroid = new THREE.Vector3();
      let count = 0;
      for (const idx of starIndices) {
        const s = starsArr[idx];
        if (!s) continue;
        const h = raDecToAltAz(s.raDeg, s.decDeg, latitudeDeg, lstDeg);
        const a = h.altitudeDeg + (h.refractionDeg || 0);
        const v = altAzToVector3(a, h.azimuthDeg, radius);
        centroid.x += v.x;
        centroid.y += v.y;
        centroid.z += v.z;
        count++;
      }
      if (!count) return;
      centroid.multiplyScalar(1 / count);
      obj.position.copy(centroid);
    }
  });
}

/**
 * Fallback minimal constellations from `astro/constellationsData.js`.
 */
export function createConstellations({ radius = 1490, withLabels = true } = {}) {
  const group = new THREE.Group();
  group.name = "Constellations";

  const material = new THREE.LineBasicMaterial({
    color: 0x7aa2ff,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });

  for (const c of CONSTELLATIONS) {
    const positions = [];

    for (const [a, b] of c.edges) {
      const sa = c.stars[a];
      const sb = c.stars[b];
      if (!sa || !sb) continue;

      const va = raDecToSkyVector3(sa.raDeg, sa.decDeg, radius);
      const vb = raDecToSkyVector3(sb.raDeg, sb.decDeg, radius);
      positions.push(va.x, va.y, va.z, vb.x, vb.y, vb.z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeBoundingSphere();

    const lines = new THREE.LineSegments(geometry, material);
    lines.name = `Constellation:${c.key}`;
    group.add(lines);

    if (withLabels) {
      const keys = Object.keys(c.stars);
      const centroid = new THREE.Vector3();
      for (const key of keys) {
        const s = c.stars[key];
        centroid.add(raDecToSkyVector3(s.raDeg, s.decDeg, radius));
      }
      centroid.multiplyScalar(1 / Math.max(1, keys.length));
      addConstellationLabel(group, c.name, centroid);
    }
  }

  return group;
}
