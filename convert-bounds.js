const fs = require('fs');

const SRC = 'assets/constellations.bounds.json';
const DST = 'assets/constellation_boundaries.json';

function loadJson(path) {
return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function main() {
const data = loadJson(SRC);
const out = [];

for (const f of data.features) {
const name = (f.properties && (f.properties.name || f.id)) || 'Unknown';
const geom = f.geometry || {};
let polys = [];

if (geom.type === 'MultiPolygon') {
  polys = geom.coordinates;                // [ [ [ [ra,dec], ... ] /* ring */, ... ] /* poly */, ... ]
} else if (geom.type === 'Polygon') {
  polys = [geom.coordinates];
} else {
  // Skip anything unexpected
  continue;
}

// Emit one entry per ring (avoids drawing spurious lines between rings)
for (const poly of polys) {
  for (const ring of poly) {
    // ring: array of [ra, dec] points
    if (Array.isArray(ring) && ring.length >= 2) {
      out.push({ name, boundary: ring.map(pt => [pt[0], pt[1]]) });
    }
  }
}

}

fs.writeFileSync(DST, JSON.stringify(out));
console.log('Wrote', DST, 'with', out.length, 'entries.');
}

main();