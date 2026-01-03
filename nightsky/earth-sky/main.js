import { debugSiderealSnapshot } from "./astro/time.js";
import { createSkyScene } from "./scene/scene.js";
import { sunRaDec } from "./astro/solarSystem.js";
import { raDecToAltAz } from "./astro/coordinates.js";
import { Sd79Adapter } from "./sd79-adapter.js";

function pad2(value) {
  return String(value).padStart(2, "0");
}

function toDatetimeLocalValue(date) {
  // datetime-local has no timezone; we display the user's local time.
  const yyyy = date.getFullYear();
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const min = pad2(date.getMinutes());
  const ss = pad2(date.getSeconds());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
}

function parseDatetimeLocalValue(value) {
  // Interprets the input as local time.
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function fmt(number, digits = 6) {
  if (!Number.isFinite(number)) return "-";
  return number.toFixed(digits);
}

function parseNumberOrNaN(raw) {
  const value = Number(raw);
  return Number.isFinite(value) ? value : Number.NaN;
}

const el = {
  skyCanvas: document.getElementById("skyCanvas"),
  skyHud: document.getElementById("skyHud"),
  timeOfDay: document.getElementById("timeOfDay"),
  timeOfDayLabel: document.getElementById("timeOfDayLabel"),
  sunEvents: document.getElementById("sunEvents"),
  datePicker: document.getElementById("datePicker"),
  currentDateLabel: document.getElementById("currentDateLabel"),
  advancedToggle: document.getElementById("advancedToggle"),
  advancedPanel: document.getElementById("advancedPanel"),
  timeLive: document.getElementById("timeLive"),
  timePlay: document.getElementById("timePlay"),
  timePause: document.getElementById("timePause"),
  timeFaster: document.getElementById("timeFaster"),
  timeSpeed: document.getElementById("timeSpeed"),
  dt: document.getElementById("dt"),
  lon: document.getElementById("lon"),
  now: document.getElementById("now"),
  addHour: document.getElementById("addHour"),
  subHour: document.getElementById("subHour"),
  jd: document.getElementById("jd"),
  lst: document.getElementById("lst"),

  lat: document.getElementById("lat"),
  focusObject: document.getElementById("focusObject"),
  focusGo: document.getElementById("focusGo"),
  rasiBelt: document.getElementById("rasiBelt"),
  rasiLabels: document.getElementById("rasiLabels"),
  rasiTicks: document.getElementById("rasiTicks"),
  nakshatraLines: document.getElementById("nakshatraLines"),
  ayanamsa: document.getElementById("ayanamsa"),
};

const FAST_SPEEDS = [2, 4, 8, 18, 32, 64, 128, 256, 512, 1024];

function ensureDatetimeInput() {
  if (el.dt) return;
  const input = document.createElement("input");
  input.id = "dt";
  input.type = "datetime-local";
  input.step = "1";
  input.hidden = true;
  document.body.appendChild(input);
  el.dt = input;
}

function initAdvancedPanelToggle() {
  if (!el.advancedToggle || !el.advancedPanel) return;

  let expanded = false;
  try {
    expanded = localStorage.getItem("earthSky.controlsExpanded") === "true";
  } catch {
    // ignore
  }

  function apply(nextExpanded) {
    expanded = Boolean(nextExpanded);
    el.advancedPanel.hidden = !expanded;
    el.advancedToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    el.advancedToggle.textContent = expanded ? "\u2212" : "+";
    el.advancedToggle.title = expanded ? "Collapse location controls" : "Expand location controls";
    el.advancedToggle.setAttribute(
      "aria-label",
      expanded ? "Collapse location controls" : "Expand location controls"
    );
    try {
      localStorage.setItem("earthSky.controlsExpanded", expanded ? "true" : "false");
    } catch {
      // ignore
    }
  }

  apply(expanded);
  el.advancedToggle.addEventListener("click", () => apply(!expanded));
}

const timeSim = {
  mode: "pause",
  speed: 1,
  fastIndex: -1,
  lastPerfMs: performance.now(),
  simEpochMs: Date.now(),
};

function syncSimEpochFromInputs() {
  ensureDatetimeInput();
  const date = parseDatetimeLocalValue(el.dt.value) ?? new Date();
  timeSim.simEpochMs = date.getTime();
}

function updateTimeControlsUi() {
  if (el.timeLive)
    el.timeLive.setAttribute(
      "aria-pressed",
      timeSim.mode === "live" ? "true" : "false"
    );
  if (el.timePlay)
    el.timePlay.setAttribute(
      "aria-pressed",
      timeSim.mode === "play" ? "true" : "false"
    );
  if (el.timePause)
    el.timePause.setAttribute(
      "aria-pressed",
      timeSim.mode === "pause" ? "true" : "false"
    );

  if (!el.timeSpeed) return;
  if (timeSim.mode === "live") {
    el.timeSpeed.textContent = "Live";
  } else if (timeSim.mode === "play") {
    el.timeSpeed.textContent = `${timeSim.speed}\u00D7`;
  } else {
    el.timeSpeed.textContent = "Paused";
  }
}

function setTimeMode(mode, options = {}) {
  timeSim.mode = mode;
  if (typeof options.speed === "number") timeSim.speed = options.speed;
  if (typeof options.fastIndex === "number") timeSim.fastIndex = options.fastIndex;
  timeSim.lastPerfMs = performance.now();

  if (mode === "live") {
    timeSim.simEpochMs = Date.now();
  } else {
    syncSimEpochFromInputs();
  }

  updateTimeControlsUi();
  broadcastTime();
}

function initTimeControls() {
  syncSimEpochFromInputs();
  updateTimeControlsUi();
  broadcastTime();

  if (el.timeLive) {
    el.timeLive.addEventListener("click", () => setTimeMode("live"));
  }
  if (el.timePlay) {
    el.timePlay.addEventListener("click", () =>
      setTimeMode("play", { speed: 1, fastIndex: -1 })
    );
  }
  if (el.timePause) {
    el.timePause.addEventListener("click", () => setTimeMode("pause"));
  }
  if (el.timeFaster) {
    el.timeFaster.addEventListener("click", () => {
      const nextIndex =
        timeSim.fastIndex >= 0
          ? (timeSim.fastIndex + 1) % FAST_SPEEDS.length
          : 0;
      setTimeMode("play", { speed: FAST_SPEEDS[nextIndex], fastIndex: nextIndex });
    });
  }

  function tick() {
    const nowPerf = performance.now();
    const deltaPerf = Math.max(0, nowPerf - timeSim.lastPerfMs);
    timeSim.lastPerfMs = nowPerf;

    if (timeSim.mode === "live") {
      timeSim.simEpochMs = Date.now();
    } else if (timeSim.mode === "play") {
      timeSim.simEpochMs += deltaPerf * timeSim.speed;
    }

    if (timeSim.mode === "live" || timeSim.mode === "play") {
      ensureDatetimeInput();
      el.dt.value = toDatetimeLocalValue(new Date(timeSim.simEpochMs));
      updateSliderFromDatetime();
      updateDateUiFromDatetime();
      render();
      updateTimeSliderGradient();
      broadcastTime();
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function startOfLocalDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function secondsIntoLocalDay(date) {
  return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
}

function formatHmsFromSeconds(totalSeconds) {
  const s = Math.max(0, Math.min(86400, Math.floor(totalSeconds)));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}

function toDateInputValue(date) {
  const yyyy = date.getFullYear();
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateLabel(date) {
  try {
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return toDateInputValue(date);
  }
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function percentFromSeconds(seconds) {
  return clamp01(seconds / 86400) * 100;
}

function formatPercent(value) {
  return `${Math.round(value * 1000) / 1000}%`;
}

function sunAltitudeDegForDate(date, latitudeDeg, longitudeDeg) {
  const snap = debugSiderealSnapshot(date, longitudeDeg);
  const sun = sunRaDec(snap.jd);
  const { altitudeDeg, refractionDeg } = raDecToAltAz(
    sun.raDeg,
    sun.decDeg,
    latitudeDeg,
    snap.lstDeg
  );
  return altitudeDeg + refractionDeg;
}

function refineCrossingTimeSeconds(day0, latitudeDeg, longitudeDeg, aSec, bSec) {
  // Binary search for the altitude=0 crossing in [aSec, bSec].
  let lo = Math.min(aSec, bSec);
  let hi = Math.max(aSec, bSec);
  let altLo =
    sunAltitudeDegForDate(new Date(day0.getTime() + lo * 1000), latitudeDeg, longitudeDeg) > 0;

  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    const altMid =
      sunAltitudeDegForDate(new Date(day0.getTime() + mid * 1000), latitudeDeg, longitudeDeg) >
      0;
    if (altMid === altLo) {
      lo = mid;
      altLo = altMid;
    } else {
      hi = mid;
    }
  }

  return (lo + hi) / 2;
}

function buildSunVisibilitySegments(day0, latitudeDeg, longitudeDeg) {
  // Returns segments like: [{fromSec,toSec,visible}...], covering [0,86400].
  const stepSec = 600; // 10 min coarse scan; refined with binary search.
  const segments = [];

  let prevSec = 0;
  let prevVisible =
    sunAltitudeDegForDate(new Date(day0.getTime()), latitudeDeg, longitudeDeg) > 0;

  for (let sec = stepSec; sec <= 86400; sec += stepSec) {
    const clamped = Math.min(86400, sec);
    const visible =
      sunAltitudeDegForDate(new Date(day0.getTime() + clamped * 1000), latitudeDeg, longitudeDeg) >
      0;

    if (visible !== prevVisible) {
      const crossing = refineCrossingTimeSeconds(
        day0,
        latitudeDeg,
        longitudeDeg,
        prevSec,
        clamped
      );
      segments.push({ fromSec: prevSec, toSec: crossing, visible: prevVisible });
      prevSec = crossing;
      prevVisible = visible;
    }
  }

  segments.push({ fromSec: prevSec, toSec: 86400, visible: prevVisible });
  return segments;
}

function deriveSunEventsFromSegments(segments) {
  // Looks for transitions: night->day = sunrise, day->night = sunset.
  const events = [];
  if (!Array.isArray(segments) || segments.length < 2) return events;

  for (let i = 1; i < segments.length; i++) {
    const prev = segments[i - 1];
    const cur = segments[i];
    if (prev.visible === cur.visible) continue;
    const tSec = cur.fromSec;
    events.push({ type: cur.visible ? "sunrise" : "sunset", sec: tSec });
  }

  return events;
}

function buildSliderGradientFromSegments(segments, colors) {
  const stops = [];
  const safeSegments = Array.isArray(segments) && segments.length ? segments : [];
  if (!safeSegments.length) {
    return `linear-gradient(to right, ${colors.night} 0%, ${colors.night} 100%)`;
  }

  for (let i = 0; i < safeSegments.length; i++) {
    const seg = safeSegments[i];
    const color = seg.visible ? colors.day : colors.night;
    const p0 = formatPercent(percentFromSeconds(seg.fromSec));
    const p1 = formatPercent(percentFromSeconds(seg.toSec));

    if (i === 0) stops.push(`${color} 0%`);
    stops.push(`${color} ${p0}`);
    stops.push(`${color} ${p1}`);
  }

  // Ensure 100% stop exists.
  const lastColor = safeSegments[safeSegments.length - 1].visible ? colors.day : colors.night;
  stops.push(`${lastColor} 100%`);

  return `linear-gradient(to right, ${stops.join(", ")})`;
}

function updateDateUiFromDatetime() {
  ensureDatetimeInput();
  const date = parseDatetimeLocalValue(el.dt.value) ?? new Date();
  if (el.datePicker) el.datePicker.value = toDateInputValue(date);
  if (el.currentDateLabel) el.currentDateLabel.textContent = formatDateLabel(date);
}

function updateSliderFromDatetime() {
  if (!el.timeOfDay || !el.timeOfDayLabel) return;
  ensureDatetimeInput();
  const date = parseDatetimeLocalValue(el.dt.value);
  if (!date) return;
  const sec = secondsIntoLocalDay(date);
  el.timeOfDay.value = String(sec);
  el.timeOfDayLabel.textContent = formatHmsFromSeconds(sec);
}

function updateDatetimeFromSlider() {
  if (!el.timeOfDay || !el.timeOfDayLabel) return;
  ensureDatetimeInput();
  const date = parseDatetimeLocalValue(el.dt.value) ?? new Date();
  const day0 = startOfLocalDay(date);
  const sec = Number(el.timeOfDay.value);
  const next = new Date(day0.getTime() + sec * 1000);
  el.dt.value = toDatetimeLocalValue(next);
  el.timeOfDayLabel.textContent = formatHmsFromSeconds(sec);
}

let lastSliderGradientKey = "";
function updateTimeSliderGradient() {
  if (!el.timeOfDay) return;

  const { date, longitudeDeg, latitudeDeg } = getInputs();
  if (!Number.isFinite(longitudeDeg) || !Number.isFinite(latitudeDeg)) return;

  const day0 = startOfLocalDay(date);
  const key = `${toDateInputValue(day0)}|${latitudeDeg.toFixed(4)}|${longitudeDeg.toFixed(4)}`;
  if (key === lastSliderGradientKey) return;
  lastSliderGradientKey = key;

  const segments = buildSunVisibilitySegments(day0, latitudeDeg, longitudeDeg);
  const gradient = buildSliderGradientFromSegments(segments, {
    day: "rgba(255, 221, 87, 0.95)",
    night: "rgba(25, 58, 125, 0.95)",
  });

  el.timeOfDay.style.setProperty("--timeTrackGradient", gradient);

  if (el.sunEvents) {
    const events = deriveSunEventsFromSegments(segments);
    el.sunEvents.replaceChildren();

    for (const event of events) {
      const node = document.createElement("div");
      node.className = "timelineEvent";
      const label = event.type === "sunrise" ? "Sunrise" : "Sunset";
      node.textContent = `${label} ${formatHmsFromSeconds(event.sec).slice(0, 5)}`;
      node.style.left = `${percentFromSeconds(event.sec)}%`;
      el.sunEvents.appendChild(node);
    }

    el.sunEvents.hidden = events.length === 0;
  }
}

function getInputs() {
  ensureDatetimeInput();
  const date = parseDatetimeLocalValue(el.dt.value) ?? new Date();
  const longitudeDeg = parseNumberOrNaN(el.lon.value);
  const latitudeDeg = parseNumberOrNaN(el.lat.value);
  const ayanamsaDeg = el.ayanamsa ? parseNumberOrNaN(el.ayanamsa.value) : Number.NaN;
  return { date, longitudeDeg, latitudeDeg, ayanamsaDeg };
}

function render() {
  const { date, longitudeDeg } = getInputs();
  const snap = debugSiderealSnapshot(date, longitudeDeg);

  if (el.jd) el.jd.textContent = fmt(snap.jd, 6);
  if (el.lst) el.lst.textContent = fmt(snap.lstDeg, 6);
}

function broadcastTime() {
  const { date, longitudeDeg } = getInputs();
  const snap = debugSiderealSnapshot(date, longitudeDeg);
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      type: 'EARTH_SKY_DATA',
      payload: {
        jd: snap.jd,
        speed: timeSim.mode === "play" ? timeSim.speed : (timeSim.mode === "pause" ? 0 : 1),
        paused: timeSim.mode === "pause"
      }
    }, '*');
  }
}

// Listen for time updates from Solar System simulation (SD79_DATA)
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SD79_DATA') {
    const payload = event.data.payload;
    if (typeof payload.jd === 'number') {
      // J_D in scripting.js is days since J2000 (2451545.0)
      const fullJD = payload.jd + 2451545.0;
      const unixMs = (fullJD - 2440587.5) * 86400000;

      setTimeMode("pause");
      ensureDatetimeInput();
      el.dt.value = toDatetimeLocalValue(new Date(unixMs));
      updateSliderFromDatetime();
      syncSimEpochFromInputs();
      render();
      updateTimeSliderGradient();
    }
  } else if (event.data && event.data.type === 'SD79_LOCATION') {
    const payload = event.data.payload;
    if (typeof payload.lat === 'number' && typeof payload.lon === 'number') {
      if (el.lat) el.lat.value = String(payload.lat.toFixed(4));
      if (el.lon) el.lon.value = String(payload.lon.toFixed(4));
      render();
      updateTimeSliderGradient();
    }
  }
});

function addHours(hours) {
  setTimeMode("pause");
  ensureDatetimeInput();
  const date = parseDatetimeLocalValue(el.dt.value) ?? new Date();
  const next = new Date(date.getTime() + hours * 3600000);
  el.dt.value = toDatetimeLocalValue(next);
  updateSliderFromDatetime();
  syncSimEpochFromInputs();
  render();
}

if (el.now) {
  el.now.addEventListener("click", () => {
    setTimeMode("pause");
    ensureDatetimeInput();
    el.dt.value = toDatetimeLocalValue(new Date());
    updateSliderFromDatetime();
    syncSimEpochFromInputs();
    render();
  });
}
if (el.addHour) el.addHour.addEventListener("click", () => addHours(1));
if (el.subHour) el.subHour.addEventListener("click", () => addHours(-1));

ensureDatetimeInput();
if (el.dt) {
  el.dt.addEventListener("input", () => {
    setTimeMode("pause");
    updateSliderFromDatetime();
    updateDateUiFromDatetime();
    syncSimEpochFromInputs();
    render();
    updateTimeSliderGradient();
  });
}
if (el.lon) el.lon.addEventListener("input", render);
if (el.lat) el.lat.addEventListener("input", render);
if (el.lon) el.lon.addEventListener("input", updateTimeSliderGradient);
if (el.lat) el.lat.addEventListener("input", updateTimeSliderGradient);
if (el.ayanamsa) el.ayanamsa.addEventListener("input", render);

if (el.timeOfDay) {
  el.timeOfDay.addEventListener("input", () => {
    setTimeMode("pause");
    updateDatetimeFromSlider();
    updateDateUiFromDatetime();
    syncSimEpochFromInputs();
    render();
    updateTimeSliderGradient();
    broadcastTime();
  });
}

if (el.datePicker) {
  el.datePicker.addEventListener("input", () => {
    setTimeMode("pause");
    const current = parseDatetimeLocalValue(el.dt.value) ?? new Date();
    const sec = secondsIntoLocalDay(current);
    const picked = new Date(`${el.datePicker.value}T00:00:00`);
    const base = Number.isNaN(picked.getTime()) ? current : picked;
    const next = new Date(startOfLocalDay(base).getTime() + sec * 1000);
    el.dt.value = toDatetimeLocalValue(next);
    updateSliderFromDatetime();
    updateDateUiFromDatetime();
    syncSimEpochFromInputs();
    render();
    updateTimeSliderGradient();
  });
}

// Initialize.
ensureDatetimeInput();
if (!el.dt.value) {
  el.dt.value = toDatetimeLocalValue(new Date());
}
updateSliderFromDatetime();
updateDateUiFromDatetime();
render();
updateTimeSliderGradient();
initAdvancedPanelToggle();
initTimeControls();

const helioAdapter = new Sd79Adapter();
const sky = createSkyScene(el.skyCanvas, { helioProvider: helioAdapter });
if (el.skyHud && typeof sky.setHudElement === "function") {
  sky.setHudElement(el.skyHud);
}
sky.getObserver = () => {
  const { date, longitudeDeg, latitudeDeg, ayanamsaDeg } = getInputs();
  const snap = debugSiderealSnapshot(date, longitudeDeg);
  return {
    jd: snap.jd,
    latitudeDeg,
    longitudeDeg,
    lstDeg: snap.lstDeg,
    ayanamsaDeg,
  };
};
sky.start();

function syncRasiUi() {
  if (el.rasiBelt && typeof sky.setRasiVisible === "function") {
    sky.setRasiVisible(el.rasiBelt.checked);
  }
  if (el.rasiLabels && typeof sky.setRasiLabelsVisible === "function") {
    sky.setRasiLabelsVisible(el.rasiLabels.checked);
  }
  if (el.rasiTicks && typeof sky.setRasiDegreeTicksVisible === "function") {
    sky.setRasiDegreeTicksVisible(el.rasiTicks.checked);
  }
  if (el.nakshatraLines && typeof sky.setRasiNakshatraVisible === "function") {
    sky.setRasiNakshatraVisible(el.nakshatraLines.checked);
  }
}

if (el.rasiBelt) el.rasiBelt.addEventListener("change", syncRasiUi);
if (el.rasiLabels) el.rasiLabels.addEventListener("change", syncRasiUi);
if (el.rasiTicks) el.rasiTicks.addEventListener("change", syncRasiUi);
if (el.nakshatraLines) el.nakshatraLines.addEventListener("change", syncRasiUi);
syncRasiUi();

function focusSelectedObject() {
  const key = (el.focusObject?.value || "").trim();
  if (typeof sky.focusObject === "function") sky.focusObject(key);
}

if (el.focusObject) el.focusObject.addEventListener("change", focusSelectedObject);
if (el.focusGo) el.focusGo.addEventListener("click", focusSelectedObject);
