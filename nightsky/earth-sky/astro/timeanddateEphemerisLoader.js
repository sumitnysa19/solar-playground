/**
 * Loader + evaluator for the Timeanddate "astroserver" JSON response.
 *
 * This file expects the shape you saved as `astroserver.php` (actually JSON):
 * - `t`: Unix epoch seconds for the start of the coverage window
 * - `m`: coverage window seconds (usually 86400)
 * - `o`: per-body polynomials, with keys like `sun`, `moon`, `mars`, ...
 *   Each property like `ra` / `decl` is typically an array of segments:
 *     [{ e: endSeconds, p: [c0,c1,c2,c3] }, ...]
 *   where `e` is seconds-from-start-of-window.
 *
 * We only use `ra` and `decl` for positional rendering.
 */

const JD_UNIX_EPOCH = 2440587.5; // 1970-01-01T00:00:00Z

function normalizeDegrees(deg) {
  const w = deg % 360;
  return w < 0 ? w + 360 : w;
}

function jdToUnixSeconds(jd) {
  return (jd - JD_UNIX_EPOCH) * 86400;
}

function evalPolySegment(coeffs, dtSec) {
  // c0 + c1*t + c2*t^2 + c3*t^3
  const t = dtSec;
  const t2 = t * t;
  const t3 = t2 * t;
  return coeffs[0] + coeffs[1] * t + (coeffs[2] || 0) * t2 + (coeffs[3] || 0) * t3;
}

function evalPiecewise(segments, secFromStart) {
  if (!Array.isArray(segments) || segments.length === 0) return null;
  if (!Number.isFinite(secFromStart)) return null;

  let prevEnd = 0;
  for (const seg of segments) {
    if (!seg || typeof seg !== "object") continue;
    const end = Number(seg.e);
    const coeffs = Array.isArray(seg.p) ? seg.p.map((n) => Number(n)) : null;
    if (!Number.isFinite(end) || !coeffs || coeffs.length < 2) continue;

    if (secFromStart <= end) {
      const dt = secFromStart - prevEnd;
      return evalPolySegment(coeffs, dt);
    }
    prevEnd = end;
  }

  return null;
}

export function createTimeAndDateEphemeris(json) {
  if (!json || typeof json !== "object") {
    throw new TypeError("createTimeAndDateEphemeris(json) requires an object");
  }
  const startUnix = Number(json.t);
  const spanSec = Number(json.m);
  const bodies = json.o && typeof json.o === "object" ? json.o : {};
  if (!Number.isFinite(startUnix) || !Number.isFinite(spanSec)) {
    throw new Error("astroserver data missing valid `t`/`m`");
  }

  return {
    startUnix,
    endUnix: startUnix + spanSec,
    /**
     * Get geocentric/topocentric RA/Dec (as provided) for a body at a given JD.
     * Returns null when JD is outside the file's covered window.
     *
     * @param {number} jd
     * @param {string} key e.g. "mars", "sun", "moon"
     * @returns {{raDeg:number, decDeg:number}|null}
     */
    getRaDec(jd, key) {
      if (!Number.isFinite(jd) || typeof key !== "string") return null;
      const body = bodies[key.toLowerCase()];
      if (!body) return null;

      const unixSec = jdToUnixSeconds(jd);
      const secFromStart = unixSec - startUnix;
      if (secFromStart < 0 || secFromStart > spanSec) return null;

      const raHours = evalPiecewise(body.ra, secFromStart);
      const decDeg = evalPiecewise(body.decl, secFromStart);
      if (!Number.isFinite(raHours) || !Number.isFinite(decDeg)) return null;

      return { raDeg: normalizeDegrees(raHours * 15), decDeg };
    },
  };
}

export async function loadTimeAndDateEphemeris({ url = "../astroserver.php" } = {}) {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load ephemeris: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return createTimeAndDateEphemeris(json);
}
