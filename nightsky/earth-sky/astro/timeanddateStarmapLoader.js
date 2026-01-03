/**
 * Loader for the Timeanddate starmap JSON shape returned by:
 * `https://www.timeanddate.com/scripts/starmapjson.php?...`
 *
 * Expected JSON keys:
 * - `s`: stars [{ r: RA hours, d: Dec deg, m: mag, c: colorIndex, n?: name }]
 * - `c`: constellations [{ n: name, v: number[] }]
 * - `cm`: concatenated RGB hex string (6 chars per palette entry)
 *
 * Note: This loader only parses and normalizes the data; it does not render.
 */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeRaDeg(raDeg) {
  const wrapped = raDeg % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

function parseColorFromCm(cm, colorIndex) {
  if (typeof cm !== "string") return null;
  if (!Number.isFinite(colorIndex)) return null;
  const idx = Math.floor(colorIndex);
  if (idx < 0) return null;
  const start = idx * 6;
  if (start + 6 > cm.length) return null;
  const hex = cm.slice(start, start + 6);
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return { r, g, b, hex: `#${hex}` };
}

export function parseTimeAndDateStarmap(json) {
  if (!json || typeof json !== "object") {
    throw new TypeError("parseTimeAndDateStarmap(json) requires an object");
  }

  const cm = typeof json.cm === "string" ? json.cm : "";
  const rawStars = Array.isArray(json.s) ? json.s : [];
  const rawConstellations = Array.isArray(json.c) ? json.c : [];

  // Important: constellation `v` indices refer to the raw `s[]` positions.
  // Preserve a sparse array indexed by the raw star index for constellation lookup.
  const starsByIndex = new Array(rawStars.length).fill(null);
  const stars = [];

  for (let i = 0; i < rawStars.length; i++) {
    const s = rawStars[i];
    if (!s || typeof s !== "object") continue;
    const raHours = Number(s.r);
    const decDeg = Number(s.d);
    const mag = Number(s.m);
    if (!Number.isFinite(raHours) || !Number.isFinite(decDeg) || !Number.isFinite(mag)) continue;

    const raDeg = normalizeRaDeg(raHours * 15);
    const dec = clamp(decDeg, -90, 90);
    const name = typeof s.n === "string" && s.n.trim() ? s.n.trim() : null;

    const color = parseColorFromCm(cm, Number(s.c));
    const star = {
      id: i,
      raDeg,
      decDeg: dec,
      mag,
      name,
      color, // {r,g,b,hex} or null
    };

    starsByIndex[i] = star;
    stars.push(star);
  }

  const constellations = rawConstellations
    .map((c) => {
      if (!c || typeof c !== "object") return null;
      const name = typeof c.n === "string" ? c.n.trim() : "";
      const v = Array.isArray(c.v) ? c.v.map((x) => Number(x)).filter((n) => Number.isFinite(n)) : null;
      if (!name || !v || v.length < 2) return null;

      // Constellation encoding (Timeanddate payload; matches `nightsky_v41.js`):
      // - base = v[0]
      // - v[1..] are offsets from base
      // - the decoded vertex list is used with THREE.LineSegments, so edges are:
      //   (base, base+o0), (base+o1, base+o2), (base+o3, base+o4), ...
      const base = Math.trunc(v[0]);
      const offsets = v.slice(1).map((x) => Math.trunc(x)).filter((n) => Number.isFinite(n));
      if (offsets.length < 1) return null;

      const maxIndex = rawStars.length - 1;
      const edges = [];
      const starIndexSet = new Set();

      // First segment uses the explicit base vertex.
      const firstA = base;
      const firstB = base + offsets[0];
      if (
        Number.isInteger(firstA) &&
        Number.isInteger(firstB) &&
        firstA >= 0 &&
        firstA <= maxIndex &&
        firstB >= 0 &&
        firstB <= maxIndex &&
        firstA !== firstB
      ) {
        edges.push([firstA, firstB]);
        starIndexSet.add(firstA);
        starIndexSet.add(firstB);
      }

      // Remaining segments are paired offsets (o1,o2), (o3,o4), ...
      for (let i = 1; i + 1 < offsets.length; i += 2) {
        const a = base + offsets[i];
        const b = base + offsets[i + 1];
        if (!Number.isInteger(a) || !Number.isInteger(b)) continue;
        if (a < 0 || a > maxIndex || b < 0 || b > maxIndex) continue;
        if (a === b) continue;
        edges.push([a, b]);
        starIndexSet.add(a);
        starIndexSet.add(b);
      }

      if (edges.length < 1) return null;

      const starIndices = Array.from(starIndexSet).filter(
        (idx) => Number.isInteger(idx) && idx >= 0 && idx <= maxIndex
      );
      if (starIndices.length < 1) return null;

      return {
        name,
        edges,
        starIndices,
      };
    })
    .filter(Boolean);

  return { stars, starsByIndex, constellations };
}

export async function loadTimeAndDateStarmap({ url = "../starmapjson.php" } = {}) {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load starmap: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return parseTimeAndDateStarmap(json);
}
