"use strict";
const fs = require('fs');
const path = require('path');

// Input CSV: assets/hygdata_v3.csv (from https://github.com/astronexus/HYG-Database)
// Output JSON: assets/stars3d.json

function parseCSVRobust(text) {
  // Lightweight CSV parser that respects quotes
  const lines = text.split(/\r?\n/);
  if (!lines.length) return { header: [], idx: {}, rows: [] };

  function splitCSV(line) {
    const out = [];
    let cur = '';
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (q && line[i + 1] === '"') { cur += '"'; i++; }
        else { q = !q; }
      } else if (ch === ',' && !q) {
        out.push(cur); cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out;
  }

  const hraw = splitCSV(lines.shift());
  const header = [];
  const idx = {};
  for (let i = 0; i < hraw.length; i++) {
    const key = (hraw[i] || '').trim().replace(/^\uFEFF/, '');
    header.push(key);
    const lc = key.toLowerCase();
    if (!(lc in idx)) idx[lc] = i; // case-insensitive mapping
  }

  const rows = [];
  for (const line of lines) {
    if (!line || !line.trim()) continue;
    rows.push(splitCSV(line));
  }

  return { header, idx, rows };
}

function main() {
  // Prefer v3 if present, else v4.2
  let inPath = path.resolve('assets/hygdata_v3.csv');
  if (!fs.existsSync(inPath)) {
    const alt = path.resolve('assets/hyg_v42.csv');
    if (fs.existsSync(alt)) inPath = alt;
  }
  const outPath = path.resolve('assets/stars3d.json');
  if (!fs.existsSync(inPath)) {
    console.error('Missing input', inPath);
    process.exit(1);
  }
  const csv = fs.readFileSync(inPath, 'utf8');
  const { idx, rows } = parseCSVRobust(csv);
  function num(cols, key) {
    const i = idx[key.toLowerCase()];
    if (i == null) return undefined;
    const v = parseFloat(cols[i]);
    return isNaN(v) ? undefined : v;
  }

  const out = [];
  let withDist = 0, withPlx = 0;
  for (const cols of rows) {
    const ra = num(cols, 'ra');   // hours
    const dec = num(cols, 'dec'); // degrees
    let dist = num(cols, 'dist'); // parsecs
    const plx = num(cols, 'plx'); // milliarcseconds
    const mag = num(cols, 'mag');
    const ci = num(cols, 'ci');
    if (ra == null || dec == null) continue;
    if (!(dist > 0)) {
      if (plx && plx > 0) { dist = 1000.0 / plx; withPlx++; }
    } else { withDist++; }
    if (!(dist > 0) || !isFinite(dist)) continue;
    if (mag != null && mag > 8.0) continue; // performance limit
    const ly = dist * 3.26156; // parsec → ly
    out.push({ ra, dec, ly, mag, ci });
  }
  fs.writeFileSync(outPath, JSON.stringify(out));
  console.log('Wrote', outPath, 'with', out.length, 'stars. (dist:', withDist, 'parallax:', withPlx, ')');
}

main();
