import * as THREE from "../assets/three/three.module.js";
import { createSkyCamera, setCameraAspect, zoomCameraFov } from "./camera.js";
import { createAtmosphereSky, updateAtmosphereSky } from "./atmosphereSky.js";
import { createStarField, updateStarsForObserver } from "./stars.js";
import { createSolarSystemObjects, updateSolarSystemObjects } from "./solarSystem.js";
import {
  createConstellations,
  createConstellationsFromCatalog,
  updateConstellationsForObserver,
} from "./constellations.js";
import { createSD79Constellations, updateSD79ConstellationsForObserver } from "./sd79Constellations.js";
import { loadConstellationBoundaries } from "./constellationBoundaries.js";
import { createPlanetObjects, updatePlanetObjects } from "./planets.js";
import { createGroundAndHorizon } from "./horizon.js";
import { altAzToVector3, raDecToAltAz } from "../astro/coordinates.js";
import { sunRaDec } from "../astro/solarSystem.js";
import { loadTimeAndDateStarmap } from "../astro/timeanddateStarmapLoader.js";
import { createStarFieldFromCatalog } from "./stars.js";
import { loadTimeAndDateEphemeris } from "../astro/timeanddateEphemerisLoader.js";
import {
  createRasiBelt,
  updateRasiBeltForObserver,
  setRasiIndicatorLambda,
  setRasiIndicatorTarget,
} from "./rasiBelt.js";

function clampPitch(rad) {
  const limit = Math.PI / 2 - 0.01;
  return THREE.MathUtils.clamp(rad, -limit, limit);
}

function setPointerCaptureSafe(element, pointerId) {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Not all environments support pointer capture consistently.
  }
}

function releasePointerCaptureSafe(element, pointerId) {
  try {
    element.releasePointerCapture(pointerId);
  } catch {
    // Ignore.
  }
}

/**
 * Step 3 renderer: inverted sky sphere + basic drag-to-look controls.
 *
 * Camera stays at origin. We rotate a root group containing the sky to simulate
 * the user looking around.
 */
export function createSkyScene(canvas, options = {}) {
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new TypeError("createSkyScene(canvas) requires a <canvas> element");
  }

  const { helioProvider } = options;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = createSkyCamera();
  camera.rotation.order = "YXZ";

  const skyRoot = new THREE.Group();
  skyRoot.name = "SkyRoot";
  scene.add(skyRoot);

  function getCatalogMode() {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = (params.get("catalog") || "").trim().toLowerCase();
      if (q) return q;
    } catch {
      // ignore
    }
    try {
      const stored = (localStorage.getItem("earthSky.catalog") || "").trim().toLowerCase();
      if (stored) return stored;
    } catch {
      // ignore
    }
    return "procedural";
  }

  // Earth-fixed ground/horizon (does not rotate with LST).
  scene.add(createGroundAndHorizon({
    radius: 1480,
    groundColor: 0x1f7a3a,
    groundTextureUrl: null // Set to null to avoid 404 if ground.jpg is missing
  }));

  const atmosphere = createAtmosphereSky({
    radius: 1500,
    settings: {
      luminance: 1,
      rayleighCoefficient: 1.5,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.98,
      tonemapWeighting: 1000,
      turbidity: 2.0,
      dayColor: 0x87c6ff,
      twilightColor: 0x20375f,
      nightColor: 0x04040a,
    },
  });
  skyRoot.add(atmosphere);

  // Stars (procedural placeholder catalog).
  let starField = createStarField({ radius: 1490, count: 3000, seed: 424242 });
  skyRoot.add(starField.points);
  starField.points.frustumCulled = false;
  starField.points.geometry.computeBoundingSphere();

  // Sun + Moon (Step 5).
  const solarSystem = createSolarSystemObjects({ radius: 1490 });
  // Earth-fixed: these are placed using Alt/Az (horizon frame), so keep them out of skyRoot.
  scene.add(solarSystem.group);

  // Planets (Mercury, Venus, Mars, Jupiter, Saturn) + trace lines.
  const planets = createPlanetObjects({ radius: 1490 });
  scene.add(planets.group);

  // Rasi belt (sidereal zodiac band).
  const rasiBelt = createRasiBelt({
    radius: 1486,
    bandHalfWidthDeg: 6,
  });
  skyRoot.add(rasiBelt.group);
  skyRoot.add(rasiBelt.indicator.group);

  // STEP D: Load SD79 full constellation dataset
  // STEP D: Load SD79 full constellation dataset by default
  let constellations = null;
  const sd79Promise = createSD79Constellations({ radius: 1490 }).then(g => {
    if (!constellations) { // Only add if not already replaced by a catalog
      constellations = g;
      skyRoot.add(constellations);
    }
    return g;
  });

  // Optional: use the Timeanddate star+constellation catalog when available.
  // Modes:
  // - `catalog=timeanddate` (or localStorage): force load
  // - `catalog=procedural`: force fallback
  // - default `auto`: try to load, fallback silently
  const catalogMode = getCatalogMode();
  let useHorizonSkyForCatalog = false;
  let catalogStarsByIndex = null;
  let timeanddateEphemeris = null;
  if (catalogMode !== "procedural") {
    const catalogUrl = "../starmapjson.php";
    loadTimeAndDateStarmap({ url: catalogUrl })
      .then(({ stars, starsByIndex, constellations: catalogConstellations }) => {
        // Sanity gate: only swap in if it looks like a full catalog.
        if (!stars?.length || !catalogConstellations?.length || catalogConstellations.length < 40) {
          throw new Error("Catalog loaded but did not contain expected constellation data.");
        }

        console.log("[Sky] Using timeanddate catalog:", {
          url: catalogUrl,
          stars: stars.length,
          constellations: catalogConstellations.length,
        });

        // Debug helper: inspect decoded constellation wiring in DevTools.
        try {
          globalThis.__earthSkyCatalog = {
            url: catalogUrl,
            starsByIndex,
            constellations: catalogConstellations,
          };
        } catch {
          // ignore
        }

        // Replace star field.
        skyRoot.remove(starField.points);
        starField.material?.dispose?.();
        starField.points.geometry?.dispose?.();
        starField = createStarFieldFromCatalog({ radius: 1490, stars });
        skyRoot.add(starField.points);

        // Replace constellations.
        if (constellations) {
          skyRoot.remove(constellations);
          constellations.traverse?.((obj) => {
            obj.geometry?.dispose?.();
            obj.material?.dispose?.();
          });
        }
        constellations = createConstellationsFromCatalog({
          radius: 1490,
          starsByIndex,
          constellations: catalogConstellations,
          withLabels: true,
        });
        skyRoot.add(constellations);

        useHorizonSkyForCatalog = true;
        catalogStarsByIndex = starsByIndex;

        // Optional: load timeanddate ephemeris for planets if present.
        return loadTimeAndDateEphemeris({ url: "../astroserver.php" })
          .then((eph) => {
            timeanddateEphemeris = eph;
            console.log("[Sky] Loaded timeanddate ephemeris:", {
              startUnix: eph.startUnix,
              endUnix: eph.endUnix,
            });
          })
          .catch((err) => {
            console.log("[Sky] timeanddate ephemeris not available; using local ephemeris:", err?.message || err);
          });
      })
      .catch((err) => {
        if (catalogMode === "timeanddate") {
          console.warn("[Sky] timeanddate catalog requested but failed; using fallback:", err);
        } else {
          console.log("[Sky] catalog auto-load skipped/failed; using fallback:", err?.message || err);
        }
      });
  }

  // Full-sky constellation structure: IAU boundaries (async load).
  // This adds the "rest" of the constellations without relying on proprietary stick-figure datasets.
  loadConstellationBoundaries({ url: "./assets/data/constbnd.dat", radius: 1490 })
    .then(({ group, segmentCount }) => {
      console.log("[Sky] IAU constellation boundaries segments:", segmentCount);
      skyRoot.add(group);
    })
    .catch((err) => {
      console.warn("[Sky] constellation boundaries load failed:", err);
    });

  // One-time debug logs (requested).
  console.log("[Sky] stars:", starField.stars.length, "radius:", starField.radius);
  console.log("[Sky] camera:", {
    position: camera.position.toArray(),
    fov: camera.fov,
    near: camera.near,
    far: camera.far,
  });

  // Drag controls: yaw (Y) + pitch (X) on the camera, camera stays at origin.
  const state = {
    dragging: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startYaw: 0,
    startPitch: 0,
  };

  const sensitivity = 0.004; // radians per pixel
  const clickMaxMovePx = 5;

  let hudEl = null;
  let selected = null;
  let hovered = null;

  const raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = 22;

  const _tmpNdc = new THREE.Vector2();
  const _tmpPos = new THREE.Vector3();
  const _tmpDir = new THREE.Vector3();

  const cameraAnim = {
    active: false,
    startMs: 0,
    durationMs: 700,
    from: new THREE.Quaternion(),
    to: new THREE.Quaternion(),
  };

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function setHudText(text) {
    if (!hudEl) return;
    if (!text) {
      hudEl.hidden = true;
      hudEl.textContent = "";
      return;
    }
    hudEl.textContent = text;
    hudEl.hidden = false;
  }

  function fmt(number, digits = 3) {
    return Number.isFinite(number) ? number.toFixed(digits) : "-";
  }

  function formatRaHms(raDeg) {
    if (!Number.isFinite(raDeg)) return "-";
    let totalSeconds = ((raDeg / 15) * 3600) % (24 * 3600);
    if (totalSeconds < 0) totalSeconds += 24 * 3600;
    const hh = Math.floor(totalSeconds / 3600);
    totalSeconds -= hh * 3600;
    const mm = Math.floor(totalSeconds / 60);
    const ss = totalSeconds - mm * 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${fmt(
      ss,
      1
    ).padStart(4, "0")}`;
  }

  function formatObjectInfo(info, { hint = "" } = {}) {
    if (!info) return "";
    const lines = [];
    lines.push(info.title);

    if (info.mag != null) lines.push(`Mag: ${fmt(info.mag, 2)}`);

    if (info.eq && Number.isFinite(info.eq.raDeg) && Number.isFinite(info.eq.decDeg)) {
      lines.push(
        `RA: ${formatRaHms(info.eq.raDeg)} (${fmt(info.eq.raDeg, 3)}°)  Dec: ${fmt(
          info.eq.decDeg,
          3
        )}°`
      );
    }

    if (
      info.hor &&
      Number.isFinite(info.hor.altitudeDeg) &&
      Number.isFinite(info.hor.azimuthDeg)
    ) {
      const refr =
        typeof info.hor.refractionDeg === "number" && Number.isFinite(info.hor.refractionDeg)
          ? info.hor.refractionDeg
          : 0;
      lines.push(
        `Alt: ${fmt(info.hor.altitudeDeg, 3)}°  Az: ${fmt(info.hor.azimuthDeg, 3)}°  Refr: ${fmt(
          refr,
          3
        )}°`
      );
      if (info.hor.altitudeDeg <= 0) lines.push("Below horizon");
    }

    if (info.rasi) {
      const deg = fmt(info.rasi.degreeInRasi, 2);
      const lam = fmt(info.rasi.lambdaSidereal, 2);
      lines.push(`Rasi: ${info.rasi.name} ${deg}° (Sidereal λ ${lam}°)`);
      if (info.rasi.retrogradeState) {
        const rate = fmt(info.rasi.rateDegPerDay ?? 0, 3);
        lines.push(`Motion: ${info.rasi.retrogradeState} (${rate}°/day)`);
      }
    }

    if (hint) lines.push(hint);
    return lines.join("\n");
  }

  function resolvePickObject(obj) {
    let cur = obj;
    while (cur && !cur.userData?.kind && cur.parent) cur = cur.parent;
    return cur || obj;
  }

  function buildInfoFromPickedObject(pickedObj, hitIndex, observer) {
    if (!pickedObj) return null;

    if (pickedObj.userData.kind === "stars") {
      const stars = pickedObj.userData.stars;
      const star = Number.isInteger(hitIndex) ? stars?.[hitIndex] : null;
      if (!star) return null;
      const eq = { raDeg: star.raDeg, decDeg: star.decDeg };
      const hor =
        observer && Number.isFinite(observer.latitudeDeg) && Number.isFinite(observer.lstDeg)
          ? raDecToAltAz(eq.raDeg, eq.decDeg, observer.latitudeDeg, observer.lstDeg)
          : null;
      return {
        title: `Star #${hitIndex + 1}`,
        kind: "star",
        eq,
        hor,
        mag: star.mag,
      };
    }

    if (pickedObj.userData.kind === "planetPoints" || pickedObj.userData.kind === "solarPoints") {
      const item =
        Number.isInteger(hitIndex) && Array.isArray(pickedObj.userData.items)
          ? pickedObj.userData.items[hitIndex]
          : null;
      if (!item) return null;
      return {
        title: item.title || "Object",
        kind: item.kind || "object",
        eq: item.eq || null,
        hor: item.hor || null,
        rasi: item.rasi || null,
      };
    }

    return null;
  }

  function pickAtClientPoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;

    _tmpNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    _tmpNdc.y = -(((clientY - rect.top) / rect.height) * 2 - 1);

    raycaster.setFromCamera(_tmpNdc, camera);

    const pickTargets = [starField.points, solarSystem.field.points, planets.field.points];

    const hits = raycaster.intersectObjects(pickTargets, true);
    if (!hits.length) return null;

    const hit = hits[0];
    const picked = resolvePickObject(hit.object);
    const observer = typeof api.getObserver === "function" ? api.getObserver() : null;
    const info = buildInfoFromPickedObject(picked, hit.index, observer);
    if (!info) return null;

    if (picked.userData?.kind === "stars" || picked.isPoints) {
      _tmpDir.copy(hit.point).normalize();
    } else {
      picked.getWorldPosition(_tmpPos);
      _tmpDir.copy(_tmpPos).normalize();
    }
    return { picked, info, direction: _tmpDir.clone(), hitIndex: hit.index };
  }

  function startLookAt(directionWorld) {
    const dir = directionWorld?.clone?.().normalize?.();
    if (!dir || !Number.isFinite(dir.x) || !Number.isFinite(dir.y) || !Number.isFinite(dir.z)) {
      return;
    }

    const target = dir;
    const m = new THREE.Matrix4().lookAt(
      new THREE.Vector3(0, 0, 0),
      target,
      new THREE.Vector3(0, 1, 0)
    );

    cameraAnim.active = true;
    cameraAnim.startMs = performance.now();
    cameraAnim.from.copy(camera.quaternion);
    cameraAnim.to.setFromRotationMatrix(m);
  }

  function clearSelection() {
    selected = null;
    setRasiIndicatorLambda(rasiBelt, null);
    setRasiIndicatorTarget(rasiBelt, null);
    setHudText(hovered ? formatObjectInfo(hovered.info) : "");
  }

  canvas.addEventListener("pointerdown", (e) => {
    state.dragging = true;
    state.pointerId = e.pointerId;
    state.startX = e.clientX;
    state.startY = e.clientY;
    state.startYaw = camera.rotation.y;
    state.startPitch = camera.rotation.x;
    cameraAnim.active = false;
    setPointerCaptureSafe(canvas, e.pointerId);
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!state.dragging || state.pointerId !== e.pointerId) return;
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    camera.rotation.y = state.startYaw - dx * sensitivity;
    camera.rotation.x = clampPitch(state.startPitch - dy * sensitivity);
  });

  const endDrag = (e) => {
    if (!state.dragging || state.pointerId !== e.pointerId) return;

    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    const isClick = dx * dx + dy * dy <= clickMaxMovePx * clickMaxMovePx;

    state.dragging = false;
    releasePointerCaptureSafe(canvas, e.pointerId);
    state.pointerId = null;

    if (isClick) {
      const pick = pickAtClientPoint(e.clientX, e.clientY);
      if (pick) {
        selected = pick;
        setHudText(
          formatObjectInfo(pick.info, {
            hint: "Press Esc to clear selection",
          })
        );
        if (pick.info?.rasi?.lambdaSidereal != null) {
          setRasiIndicatorLambda(
            rasiBelt,
            pick.info.rasi.lambdaSidereal,
            pick.info.rasi.rasiStartDeg
          );
        } else {
          setRasiIndicatorLambda(rasiBelt, null);
        }
        if (pick.info?.hor) {
          setRasiIndicatorTarget(rasiBelt, pick.info.hor, 1490);
        } else {
          setRasiIndicatorTarget(rasiBelt, null);
        }
        startLookAt(pick.direction);
      } else {
        clearSelection();
      }
    }
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  // Hover (mouse only) for quick readouts.
  let hoverRaf = 0;
  canvas.addEventListener("pointermove", (e) => {
    if (state.dragging) return;
    if (!hudEl) return;
    if (e.pointerType && e.pointerType !== "mouse") return;

    const x = e.clientX;
    const y = e.clientY;
    if (hoverRaf) return;
    hoverRaf = window.requestAnimationFrame(() => {
      hoverRaf = 0;
      hovered = pickAtClientPoint(x, y);
      if (!selected) setHudText(hovered ? formatObjectInfo(hovered.info) : "");
    });
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") clearSelection();
  });

  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      zoomCameraFov(camera, e.deltaY);
    },
    { passive: false }
  );

  function resizeToDisplaySize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize =
      canvas.width !== Math.floor(width * renderer.getPixelRatio()) ||
      canvas.height !== Math.floor(height * renderer.getPixelRatio());
    if (needResize) {
      renderer.setSize(width, height, false);
      setCameraAspect(camera, width, height);
    }
  }

  function render() {
    resizeToDisplaySize();
    renderer.render(scene, camera);
  }

  function resolveFocusTarget(key) {
    const nextKey = typeof key === "string" ? key.trim().toLowerCase() : "";
    if (!nextKey) return null;

    if (nextKey === "sun") return { points: solarSystem.field.points, index: 0 };
    if (nextKey === "moon") return { points: solarSystem.field.points, index: 1 };

    const points = planets.field.points;
    const keys = points.userData?.keys;
    const index = Array.isArray(keys) ? keys.indexOf(nextKey) : -1;
    if (index < 0) return null;
    return { points, index };
  }

  let raf = 0;
  function start() {
    let loggedFrame = false;
    const tick = () => {
      // Per-frame update hook: supplied by main.js (time/observer inputs).
      if (typeof api.getObserver === "function") {
        const obs = api.getObserver();
        const focusKey = api._focusKey || "";
        const obs2 = focusKey
          ? { ...obs, forceVisibleKey: focusKey, ephemeris: timeanddateEphemeris, helioProvider }
          : { ...obs, ephemeris: timeanddateEphemeris, helioProvider };
        if (obs2 && Number.isFinite(obs2.latitudeDeg) && Number.isFinite(obs2.lstDeg)) {
          // Rotate the whole sky dome by Local Sidereal Time (Earth rotation).
          if (!useHorizonSkyForCatalog) {
            skyRoot.rotation.y = (-obs2.lstDeg * Math.PI) / 180;
          } else {
            skyRoot.rotation.y = 0;
          }

          updateStarsForObserver(starField, { ...obs2, useHorizonFrame: useHorizonSkyForCatalog });
          if (constellations && constellations.userData.kind === 'sd79Constellations') {
            updateSD79ConstellationsForObserver(constellations, { ...obs2, useHorizonFrame: useHorizonSkyForCatalog });
          } else if (useHorizonSkyForCatalog && catalogStarsByIndex) {
            updateConstellationsForObserver(constellations, catalogStarsByIndex, obs2);
          }
          updateRasiBeltForObserver(rasiBelt, obs2, true);
          if (Number.isFinite(obs2.jd)) {
            updateSolarSystemObjects(solarSystem, obs2);
            updatePlanetObjects(planets, obs2);

            // Drive the atmosphere shader from the sun direction (in skyRoot space).
            const sunEq = sunRaDec(obs2.jd);
            const sunHor = raDecToAltAz(
              sunEq.raDeg,
              sunEq.decDeg,
              obs2.latitudeDeg,
              obs2.lstDeg
            );
            const sunV = altAzToVector3(sunHor.altitudeDeg, sunHor.azimuthDeg, 1);
            const sunDir = new THREE.Vector3(sunV.x, sunV.y, sunV.z).normalize();
            updateAtmosphereSky(atmosphere, { sunDirection: sunDir });
          }

          if (api._pendingFocus) {
            api._pendingFocus = false;
            const target = resolveFocusTarget(focusKey);
            if (target) {
              const { points, index } = target;
              points.updateMatrixWorld(true);
              const posAttr = points.geometry.getAttribute("position");
              const arr = posAttr?.array;
              if (arr) {
                const local = new THREE.Vector3(
                  arr[index * 3 + 0],
                  arr[index * 3 + 1],
                  arr[index * 3 + 2]
                );
                const world = local.applyMatrix4(points.matrixWorld);
                const dir = world.lengthSq() > 0 ? world.clone().normalize() : new THREE.Vector3(0, 0, -1);

                const info = buildInfoFromPickedObject(points, index, obs2);
                selected = { picked: points, hitIndex: index, info, direction: dir };
                setHudText(
                  formatObjectInfo(info, {
                    hint: "Press Esc to clear selection",
                  })
                );
                if (info?.rasi?.lambdaSidereal != null) {
                  setRasiIndicatorLambda(
                    rasiBelt,
                    info.rasi.lambdaSidereal,
                    info.rasi.rasiStartDeg
                  );
                } else {
                  setRasiIndicatorLambda(rasiBelt, null);
                }
                if (info?.hor) {
                  setRasiIndicatorTarget(rasiBelt, info.hor, 1490);
                } else {
                  setRasiIndicatorTarget(rasiBelt, null);
                }
                startLookAt(dir);
              }
            }
          }

          if (selected?.picked) {
            const refreshed = buildInfoFromPickedObject(
              selected.picked,
              selected.hitIndex,
              obs2
            );
            if (refreshed) selected.info = refreshed;
            if (hudEl) {
              setHudText(
                formatObjectInfo(selected.info, {
                  hint: "Press Esc to clear selection",
                })
              );
            }
            if (selected.info?.rasi?.lambdaSidereal != null) {
              setRasiIndicatorLambda(
                rasiBelt,
                selected.info.rasi.lambdaSidereal,
                selected.info.rasi.rasiStartDeg
              );
            }
            if (selected.info?.hor) {
              setRasiIndicatorTarget(rasiBelt, selected.info.hor, 1490);
            }
          }
        }
      }

      if (cameraAnim.active) {
        const now = performance.now();
        const t = (now - cameraAnim.startMs) / cameraAnim.durationMs;
        if (t >= 1) {
          camera.quaternion.copy(cameraAnim.to);
          cameraAnim.active = false;
        } else if (t >= 0) {
          camera.quaternion.slerpQuaternions(
            cameraAnim.from,
            cameraAnim.to,
            easeOutCubic(t)
          );
        }
      }
      render();
      if (!loggedFrame) {
        loggedFrame = true;
        console.log("[Sky] canvas:", {
          clientWidth: canvas.clientWidth,
          clientHeight: canvas.clientHeight,
          width: canvas.width,
          height: canvas.height,
        });
        console.log("[Sky] draw:", {
          calls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
          points: renderer.info.render.points,
        });
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
  }

  function stop() {
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
  }

  const api = {
    renderer,
    scene,
    camera,
    skyRoot,
    start,
    stop,
    setHudElement: (el) => {
      hudEl = el;
      if (hudEl) {
        hudEl.hidden = true;
        hudEl.textContent = "";
      }
    },
    setRasiVisible: (visible) => {
      rasiBelt.group.visible = Boolean(visible);
    },
    setRasiLabelsVisible: (visible) => {
      const show = Boolean(visible);
      for (const label of rasiBelt.labels) {
        label.visible = show;
      }
    },
    setRasiDegreeTicksVisible: (visible) => {
      if (rasiBelt.degreeTicks?.line) {
        rasiBelt.degreeTicks.line.visible = Boolean(visible);
      }
    },
    setRasiNakshatraVisible: (visible) => {
      if (rasiBelt.nakshatraLines?.line) {
        rasiBelt.nakshatraLines.line.visible = Boolean(visible);
      }
    },
    clearSelection,
    focusObject: (key) => {
      const nextKey = typeof key === "string" ? key.trim().toLowerCase() : "";
      api._focusKey = nextKey;
      if (!nextKey) {
        clearSelection();
        return;
      }

      // Defer the actual "look at" until the next animation tick, after positions
      // have been updated for the current time and skyRoot rotation.
      api._pendingFocus = true;
    },
    // Optional callback assigned by the app:
    // () => ({ jd, latitudeDeg, lstDeg })
    getObserver: null,
    _focusKey: "",
    _pendingFocus: false,
  };
  return api;
}
