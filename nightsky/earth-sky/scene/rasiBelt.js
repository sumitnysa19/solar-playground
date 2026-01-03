import * as THREE from "../assets/three/three.module.js";
import { altAzToVector3, raDecToAltAz } from "../astro/coordinates.js";
import { createLabelSprite } from "./labelSprite.js";

const DEFAULT_RASI = [
  { name: "Mesha", color: 0xffb74d },
  { name: "Vrishabha", color: 0x81c784 },
  { name: "Mithuna", color: 0x4fc3f7 },
  { name: "Karka", color: 0x9575cd },
  { name: "Simha", color: 0xff8a65 },
  { name: "Kanya", color: 0xaed581 },
  { name: "Tula", color: 0x64b5f6 },
  { name: "Vrishchika", color: 0xba68c8 },
  { name: "Dhanu", color: 0xffcc80 },
  { name: "Makara", color: 0x90a4ae },
  { name: "Kumbha", color: 0x4dd0e1 },
  { name: "Meena", color: 0xffab91 },
];

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function normalizeDegrees(deg) {
  const w = deg % 360;
  return w < 0 ? w + 360 : w;
}

function eclipticToRaDec(lambdaDeg, betaDeg, obliquityDeg) {
  const lam = lambdaDeg * DEG2RAD;
  const bet = betaDeg * DEG2RAD;
  const eps = obliquityDeg * DEG2RAD;

  const sinDec =
    Math.sin(bet) * Math.cos(eps) +
    Math.cos(bet) * Math.sin(eps) * Math.sin(lam);
  const dec = Math.asin(Math.max(-1, Math.min(1, sinDec)));

  const y = Math.sin(lam) * Math.cos(eps) - Math.tan(bet) * Math.sin(eps);
  const x = Math.cos(lam);
  let ra = Math.atan2(y, x);
  if (ra < 0) ra += 2 * Math.PI;

  return { raDeg: ra * RAD2DEG, decDeg: dec * RAD2DEG };
}

function raDecToVector3(raDeg, decDeg, radius) {
  const ra = raDeg * DEG2RAD;
  const dec = decDeg * DEG2RAD;

  const x = radius * Math.cos(dec) * Math.sin(ra);
  const y = radius * Math.sin(dec);
  const z = radius * Math.cos(dec) * Math.cos(ra);
  return { x, y, z };
}

function buildSegmentPositions({
  lambdaStartDeg,
  lambdaEndDeg,
  bandHalfWidthDeg,
  steps,
  radius,
  obliquityDeg,
  frame,
  observer,
}) {
  const verts = new Float32Array((steps + 1) * 2 * 3);
  const span = lambdaEndDeg - lambdaStartDeg;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lambdaDeg = lambdaStartDeg + span * t;

    const upper = eclipticToRaDec(lambdaDeg, bandHalfWidthDeg, obliquityDeg);
    const lower = eclipticToRaDec(lambdaDeg, -bandHalfWidthDeg, obliquityDeg);

    let up = raDecToVector3(upper.raDeg, upper.decDeg, radius);
    let lo = raDecToVector3(lower.raDeg, lower.decDeg, radius);

    if (frame === "horizon" && observer) {
      const upHor = raDecToAltAz(
        upper.raDeg,
        upper.decDeg,
        observer.latitudeDeg,
        observer.lstDeg
      );
      const loHor = raDecToAltAz(
        lower.raDeg,
        lower.decDeg,
        observer.latitudeDeg,
        observer.lstDeg
      );
      up = altAzToVector3(upHor.altitudeDeg, upHor.azimuthDeg, radius);
      lo = altAzToVector3(loHor.altitudeDeg, loHor.azimuthDeg, radius);
    }

    const base = i * 6;
    verts[base + 0] = up.x;
    verts[base + 1] = up.y;
    verts[base + 2] = up.z;
    verts[base + 3] = lo.x;
    verts[base + 4] = lo.y;
    verts[base + 5] = lo.z;
  }

  return verts;
}

function buildSegmentGeometry({
  lambdaStartDeg,
  lambdaEndDeg,
  bandHalfWidthDeg,
  steps,
  radius,
  obliquityDeg,
}) {
  const positions = buildSegmentPositions({
    lambdaStartDeg,
    lambdaEndDeg,
    bandHalfWidthDeg,
    steps,
    radius,
    obliquityDeg,
    frame: "equatorial",
    observer: null,
  });

  const indices = [];
  for (let i = 0; i < steps; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const c = (i + 1) * 2;
    const d = (i + 1) * 2 + 1;
    indices.push(a, b, c, b, d, c);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

function buildLabelPosition(lambdaDeg, radius, obliquityDeg, frame, observer) {
  const eq = eclipticToRaDec(lambdaDeg, 0, obliquityDeg);
  if (frame === "horizon" && observer) {
    const hor = raDecToAltAz(eq.raDeg, eq.decDeg, observer.latitudeDeg, observer.lstDeg);
    return altAzToVector3(hor.altitudeDeg, hor.azimuthDeg, radius);
  }
  return raDecToVector3(eq.raDeg, eq.decDeg, radius);
}

export function createRasiBelt({
  radius = 1486,
  bandHalfWidthDeg = 6,
  degreeTickHalfWidthDeg = 0.6,
  degreeTickStepDeg = 1,
  nakshatraCount = 27,
  rasi = DEFAULT_RASI,
  segmentsPerRasi = 36,
  obliquityDeg = 23.4393,
  opacity = 0.22,
} = {}) {
  const group = new THREE.Group();
  group.name = "RasiBelt";

  const meshes = [];
  const labels = [];
  let degreeTicks = null;
  let nakshatraLines = null;
  let indicator = null;

  for (let i = 0; i < rasi.length; i++) {
    const start = i * 30;
    const end = start + 30;
    const geometry = buildSegmentGeometry({
      lambdaStartDeg: start,
      lambdaEndDeg: end,
      bandHalfWidthDeg,
      steps: segmentsPerRasi,
      radius,
      obliquityDeg,
    });

    const material = new THREE.MeshBasicMaterial({
      color: rasi[i].color,
      transparent: true,
      opacity,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `Rasi:${rasi[i].name}`;
    mesh.renderOrder = 20;
    mesh.userData = {
      lambdaStartDeg: start,
      lambdaEndDeg: end,
      basePositions: geometry.getAttribute("position").array.slice(0),
    };

    group.add(mesh);
    meshes.push(mesh);

    const label = createLabelSprite(rasi[i].name, {
      font: "600 36px system-ui, Segoe UI, Arial",
      backgroundColor: "rgba(0,0,0,0.35)",
      textColor: "rgba(240,244,255,0.92)",
    });
    label.scale.set(140, 42, 1);
    label.renderOrder = 30;
    const pos = buildLabelPosition(start + 15, radius + 6, obliquityDeg, "equatorial");
    label.position.set(pos.x, pos.y, pos.z);
    group.add(label);
    labels.push(label);
  }

  degreeTicks = createLineSet({
    name: "RasiDegreeTicks",
    count: Math.round(360 / degreeTickStepDeg),
    startDeg: 0,
    stepDeg: degreeTickStepDeg,
    betaMin: -degreeTickHalfWidthDeg,
    betaMax: degreeTickHalfWidthDeg,
    radius: radius + 1.2,
    obliquityDeg,
    color: 0xffffff,
    opacity: 0.35,
  });
  degreeTicks.line.visible = false;
  group.add(degreeTicks.line);

  nakshatraLines = createLineSet({
    name: "NakshatraBoundaries",
    count: nakshatraCount,
    startDeg: 0,
    stepDeg: 360 / nakshatraCount,
    betaMin: -bandHalfWidthDeg,
    betaMax: bandHalfWidthDeg,
    radius: radius + 1.4,
    obliquityDeg,
    color: 0xfff3c2,
    opacity: 0.55,
  });
  nakshatraLines.line.visible = false;
  group.add(nakshatraLines.line);

  indicator = createRasiIndicator({
    radius: radius + 2.2,
    obliquityDeg,
  });
  indicator.group.visible = false;

  return {
    group,
    meshes,
    labels,
    degreeTicks,
    nakshatraLines,
    indicator,
    radius,
    bandHalfWidthDeg,
    obliquityDeg,
    segmentsPerRasi,
    _frameMode: "equatorial",
    _lastObserverKey: "",
    _indicatorLambda: null,
  };
}

export function updateRasiBeltForObserver(belt, observer, useHorizonFrame) {
  if (!belt || !belt.meshes?.length) return;

  const frame = useHorizonFrame ? "horizon" : "equatorial";
  const latKey = Math.round(observer?.latitudeDeg * 1000);
  const lstKey = Math.round(observer?.lstDeg * 1000);
  const key = `${frame}|${latKey}|${lstKey}`;

  const unchanged = belt._frameMode === frame && belt._lastObserverKey === key;
  if (!unchanged) {
    belt._frameMode = frame;
    belt._lastObserverKey = key;
  }

  if (!unchanged) {
    for (let i = 0; i < belt.meshes.length; i++) {
      const mesh = belt.meshes[i];
      const geometry = mesh.geometry;
      const posAttr = geometry.getAttribute("position");

      if (frame === "equatorial") {
        const base = mesh.userData.basePositions;
        if (base) {
          posAttr.array.set(base);
          posAttr.needsUpdate = true;
          geometry.computeBoundingSphere();
        }
        continue;
      }

      const positions = buildSegmentPositions({
        lambdaStartDeg: mesh.userData.lambdaStartDeg,
        lambdaEndDeg: mesh.userData.lambdaEndDeg,
        bandHalfWidthDeg: belt.bandHalfWidthDeg,
        steps: belt.segmentsPerRasi,
        radius: belt.radius,
        obliquityDeg: belt.obliquityDeg,
        frame: "horizon",
        observer,
      });
      posAttr.array.set(positions);
      posAttr.needsUpdate = true;
      geometry.computeBoundingSphere();
    }

    for (let i = 0; i < belt.labels.length; i++) {
      const label = belt.labels[i];
      if (frame === "equatorial") {
        const pos = buildLabelPosition((i * 30) + 15, belt.radius + 6, belt.obliquityDeg);
        label.position.set(pos.x, pos.y, pos.z);
        continue;
      }

      const pos = buildLabelPosition(
        (i * 30) + 15,
        belt.radius + 6,
        belt.obliquityDeg,
        "horizon",
        observer
      );
      label.position.set(pos.x, pos.y, pos.z);
    }

    updateLineSet(belt.degreeTicks, belt, observer, frame);
    updateLineSet(belt.nakshatraLines, belt, observer, frame);
  }
  updateRasiIndicator(belt, observer, frame);
}

export function setRasiIndicatorLambda(belt, lambdaSiderealDeg, rasiStartDeg) {
  if (!belt?.indicator?.group) return;
  if (!Number.isFinite(lambdaSiderealDeg)) {
    belt._indicatorLambda = null;
    belt._indicatorStart = null;
    belt.indicator.group.visible = false;
    return;
  }
  belt._indicatorLambda = normalizeDegrees(lambdaSiderealDeg);
  const start =
    Number.isFinite(rasiStartDeg) ? normalizeDegrees(rasiStartDeg) : Math.floor(belt._indicatorLambda / 30) * 30;
  belt._indicatorStart = start;
  belt.indicator.group.visible = true;
}

export function setRasiIndicatorTarget(belt, target, radius = 1490) {
  if (!belt?.indicator?.group) return;
  if (!target || !Number.isFinite(target.altitudeDeg) || !Number.isFinite(target.azimuthDeg)) {
    belt._indicatorTarget = null;
    return;
  }
  belt._indicatorTarget = {
    altitudeDeg: target.altitudeDeg,
    azimuthDeg: target.azimuthDeg,
    radius,
  };
}

function createLineSet({
  name,
  count,
  startDeg,
  stepDeg,
  betaMin,
  betaMax,
  radius,
  obliquityDeg,
  color,
  opacity,
}) {
  const positions = buildLinePositionsSet({
    count,
    startDeg,
    stepDeg,
    betaMin,
    betaMax,
    radius,
    obliquityDeg,
    frame: "equatorial",
    observer: null,
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();

  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    depthTest: false,
  });

  const line = new THREE.LineSegments(geometry, material);
  line.name = name;
  line.renderOrder = 25;
  line.userData = {
    basePositions: positions.slice(0),
    count,
    startDeg,
    stepDeg,
    betaMin,
    betaMax,
    radius,
    obliquityDeg,
  };

  return { line };
}

function updateLineSet(set, belt, observer, frame) {
  if (!set?.line) return;
  const geometry = set.line.geometry;
  const posAttr = geometry.getAttribute("position");
  const data = set.line.userData || {};

  if (frame === "equatorial") {
    if (data.basePositions) {
      posAttr.array.set(data.basePositions);
      posAttr.needsUpdate = true;
      geometry.computeBoundingSphere();
    }
    return;
  }

  const positions = buildLinePositionsSet({
    count: data.count,
    startDeg: data.startDeg,
    stepDeg: data.stepDeg,
    betaMin: data.betaMin,
    betaMax: data.betaMax,
    radius: data.radius,
    obliquityDeg: data.obliquityDeg,
    frame: "horizon",
    observer,
  });
  posAttr.array.set(positions);
  posAttr.needsUpdate = true;
  geometry.computeBoundingSphere();
}

function buildLinePositionsSet({
  count,
  startDeg,
  stepDeg,
  betaMin,
  betaMax,
  radius,
  obliquityDeg,
  frame,
  observer,
}) {
  const positions = new Float32Array(count * 2 * 3);
  for (let i = 0; i < count; i++) {
    const lambdaDeg = normalizeDegrees(startDeg + stepDeg * i);
    const upper = eclipticToRaDec(lambdaDeg, betaMax, obliquityDeg);
    const lower = eclipticToRaDec(lambdaDeg, betaMin, obliquityDeg);

    let up = raDecToVector3(upper.raDeg, upper.decDeg, radius);
    let lo = raDecToVector3(lower.raDeg, lower.decDeg, radius);

    if (frame === "horizon" && observer) {
      const upHor = raDecToAltAz(
        upper.raDeg,
        upper.decDeg,
        observer.latitudeDeg,
        observer.lstDeg
      );
      const loHor = raDecToAltAz(
        lower.raDeg,
        lower.decDeg,
        observer.latitudeDeg,
        observer.lstDeg
      );
      up = altAzToVector3(upHor.altitudeDeg, upHor.azimuthDeg, radius);
      lo = altAzToVector3(loHor.altitudeDeg, loHor.azimuthDeg, radius);
    }

    const base = i * 6;
    positions[base + 0] = up.x;
    positions[base + 1] = up.y;
    positions[base + 2] = up.z;
    positions[base + 3] = lo.x;
    positions[base + 4] = lo.y;
    positions[base + 5] = lo.z;
  }
  return positions;
}

function createRasiIndicator({ radius, obliquityDeg }) {
  const arcGeometry = new THREE.BufferGeometry();
  const arcMaterial = new THREE.MeshBasicMaterial({
    color: 0xff3bc7,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const arcMesh = new THREE.Mesh(arcGeometry, arcMaterial);
  arcMesh.name = "RasiIndicatorArc";
  arcMesh.renderOrder = 1000;
  arcMesh.frustumCulled = false;

  const radialGeometry = new THREE.BufferGeometry();
  const radialMaterial = new THREE.LineBasicMaterial({
    color: 0xff6adf,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const radialLine = new THREE.Line(radialGeometry, radialMaterial);
  radialLine.name = "RasiIndicatorRadial";
  radialLine.renderOrder = 1001;
  radialLine.frustumCulled = false;

  const connectorGeometry = new THREE.BufferGeometry();
  const connectorMaterial = new THREE.LineBasicMaterial({
    color: 0xff3bc7,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const connectorLine = new THREE.Line(connectorGeometry, connectorMaterial);
  connectorLine.name = "RasiIndicatorConnector";
  connectorLine.renderOrder = 1002;
  connectorLine.frustumCulled = false;

  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 12, 10),
    new THREE.MeshBasicMaterial({
      color: 0xff8fe9,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
  );
  marker.name = "RasiIndicatorMarker";
  marker.renderOrder = 1003;
  marker.frustumCulled = false;

  const group = new THREE.Group();
  group.name = "RasiIndicator";
  group.renderOrder = 999;
  group.add(arcMesh, radialLine, connectorLine, marker);

  return {
    group,
    arcMesh,
    radialLine,
    connectorLine,
    marker,
    radius,
    obliquityDeg,
    arcHalfWidthDeg: 0.9,
    arcSteps: 96,
  };
}

function updateRasiIndicator(belt, observer, frame) {
  const lambdaDeg = belt._indicatorLambda;
  if (!Number.isFinite(lambdaDeg)) return;

  const arcPositions = buildEclipticArcPositions({
    lambdaStartDeg: Number.isFinite(belt._indicatorStart) ? belt._indicatorStart : 0,
    lambdaEndDeg: lambdaDeg,
    radius: belt.indicator.radius,
    obliquityDeg: belt.indicator.obliquityDeg,
    steps: belt.indicator.arcSteps,
    frame,
    observer,
    bandHalfWidthDeg: belt.indicator.arcHalfWidthDeg,
  });
  const arcGeometry = belt.indicator.arcMesh.geometry;
  arcGeometry.setAttribute("position", new THREE.BufferAttribute(arcPositions, 3));
  arcGeometry.setIndex(buildStripIndices(belt.indicator.arcSteps));
  arcGeometry.computeBoundingSphere();

  const tip = buildEclipticPoint({
    lambdaDeg,
    radius: belt.indicator.radius,
    obliquityDeg: belt.indicator.obliquityDeg,
    frame,
    observer,
  });
  const radialPositions = new Float32Array([0, 0, 0, tip.x, tip.y, tip.z]);
  const radialGeometry = belt.indicator.radialLine.geometry;
  radialGeometry.setAttribute("position", new THREE.BufferAttribute(radialPositions, 3));
  radialGeometry.computeBoundingSphere();

  belt.indicator.marker.position.set(tip.x, tip.y, tip.z);

  const target = belt._indicatorTarget;
  if (target) {
    const tgt = altAzToVector3(target.altitudeDeg, target.azimuthDeg, target.radius);
    const connectorPositions = new Float32Array([tgt.x, tgt.y, tgt.z, tip.x, tip.y, tip.z]);
    const connectorGeometry = belt.indicator.connectorLine.geometry;
    connectorGeometry.setAttribute("position", new THREE.BufferAttribute(connectorPositions, 3));
    connectorGeometry.computeBoundingSphere();
    belt.indicator.connectorLine.visible = true;
  } else {
    belt.indicator.connectorLine.visible = false;
  }
}

function buildEclipticArcPositions({
  lambdaStartDeg,
  lambdaEndDeg,
  radius,
  obliquityDeg,
  steps,
  frame,
  observer,
  bandHalfWidthDeg,
}) {
  const start = normalizeDegrees(lambdaStartDeg);
  const end = normalizeDegrees(lambdaEndDeg);
  const count = Math.max(2, steps);
  const positions = new Float32Array(count * 2 * 3);

  let span = end - start;
  if (span < 0) span += 360;

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const lambdaDeg = normalizeDegrees(start + span * t);
    const upper = buildEclipticPoint({
      lambdaDeg,
      radius,
      obliquityDeg,
      frame,
      observer,
      betaDeg: bandHalfWidthDeg,
    });
    const lower = buildEclipticPoint({
      lambdaDeg,
      radius,
      obliquityDeg,
      frame,
      observer,
      betaDeg: -bandHalfWidthDeg,
    });
    const base = i * 6;
    positions[base + 0] = upper.x;
    positions[base + 1] = upper.y;
    positions[base + 2] = upper.z;
    positions[base + 3] = lower.x;
    positions[base + 4] = lower.y;
    positions[base + 5] = lower.z;
  }
  return positions;
}

function buildEclipticPoint({
  lambdaDeg,
  radius,
  obliquityDeg,
  frame,
  observer,
  betaDeg = 0,
}) {
  const eq = eclipticToRaDec(lambdaDeg, betaDeg, obliquityDeg);
  if (frame === "horizon" && observer) {
    const hor = raDecToAltAz(eq.raDeg, eq.decDeg, observer.latitudeDeg, observer.lstDeg);
    return altAzToVector3(hor.altitudeDeg, hor.azimuthDeg, radius);
  }
  return raDecToVector3(eq.raDeg, eq.decDeg, radius);
}

function buildStripIndices(steps) {
  const indices = [];
  const count = Math.max(2, steps);
  for (let i = 0; i < count - 1; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const c = (i + 1) * 2;
    const d = (i + 1) * 2 + 1;
    indices.push(a, b, c, b, d, c);
  }
  return indices;
}
