/**
 * IAU constellation boundaries parser.
 *
 * Data file: `assets/data/constbnd.dat`
 * Source: CDS catalog VI/49 (IAU constellation boundaries)
 * URL: https://cdsarc.cds.unistra.fr/ftp/VI/49/constbnd.dat
 *
 * File format (per line):
 *   <RA_hours> <Dec_degrees> <Con1> [Con2]
 *
 * Many lines specify the two constellations on each side of a boundary.
 * Some lines have a single constellation token; we treat the second as empty.
 */

function parseBoundaryLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/\s+/);
  if (parts.length < 3) return null;

  const raHours = Number(parts[0]);
  const decDeg = Number(parts[1]);
  if (!Number.isFinite(raHours) || !Number.isFinite(decDeg)) return null;

  const con1 = parts[2];
  const con2 = parts.length >= 4 ? parts[3] : "";

  return { raHours, decDeg, con1, con2 };
}

function pairKey(con1, con2) {
  // Normalize ordering so "And Lac" and "Lac And" are treated the same.
  const a = con1 || "";
  const b = con2 || "";
  return a <= b ? `${a}|${b}` : `${b}|${a}`;
}

/**
 * Parse constbnd.dat into line segments.
 *
 * We connect consecutive points only when they belong to the same boundary pair.
 * This avoids drawing spurious jumps when the dataset switches to a new boundary.
 *
 * @param {string} text Full file contents
 * @returns {Array<{raHours1:number, decDeg1:number, raHours2:number, decDeg2:number, key:string}>}
 */
export function parseConstellationBoundarySegments(text) {
  const lines = text.split(/\r?\n/);
  const rows = [];

  for (const line of lines) {
    const row = parseBoundaryLine(line);
    if (row) rows.push(row);
  }

  const segments = [];
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1];
    const cur = rows[i];

    const prevKey = pairKey(prev.con1, prev.con2);
    const curKey = pairKey(cur.con1, cur.con2);
    if (prevKey !== curKey) continue;

    segments.push({
      raHours1: prev.raHours,
      decDeg1: prev.decDeg,
      raHours2: cur.raHours,
      decDeg2: cur.decDeg,
      key: curKey,
    });
  }

  return segments;
}

