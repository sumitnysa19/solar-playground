/**
 * Minimal constellation dataset (facts: star RA/Dec + line connections).
 *
 * This intentionally uses a tiny hand-entered dataset (2–3 constellations)
 * to keep the project legally safe and self-contained.
 *
 * Coordinates are approximate J2000 values in degrees.
 * Source: widely published star coordinates (astronomical facts).
 */

export const CONSTELLATIONS = [
  {
    key: "orion",
    name: "Orion",
    stars: {
      // α Ori (Betelgeuse)
      betelgeuse: { raDeg: 88.793, decDeg: 7.407 },
      // β Ori (Rigel)
      rigel: { raDeg: 78.634, decDeg: -8.202 },
      // γ Ori (Bellatrix)
      bellatrix: { raDeg: 81.282, decDeg: 6.350 },
      // κ Ori (Saiph)
      saiph: { raDeg: 86.939, decDeg: -9.670 },
      // ζ Ori (Alnitak)
      alnitak: { raDeg: 85.189, decDeg: -1.942 },
      // ε Ori (Alnilam)
      alnilam: { raDeg: 84.053, decDeg: -1.201 },
      // δ Ori (Mintaka)
      mintaka: { raDeg: 83.001, decDeg: 0.299 },
    },
    // Simple stick-figure lines (not the official IAU boundary).
    edges: [
      ["betelgeuse", "bellatrix"],
      ["bellatrix", "mintaka"],
      ["mintaka", "alnilam"],
      ["alnilam", "alnitak"],
      ["alnitak", "saiph"],
      ["saiph", "rigel"],
      ["rigel", "bellatrix"],
    ],
  },
  {
    key: "cassiopeia",
    name: "Cassiopeia",
    stars: {
      // β Cas (Caph)
      caph: { raDeg: 2.295, decDeg: 59.150 },
      // α Cas (Schedar)
      schedar: { raDeg: 10.126, decDeg: 56.537 },
      // γ Cas
      gamma: { raDeg: 14.177, decDeg: 60.717 },
      // δ Cas (Ruchbah)
      ruchbah: { raDeg: 21.452, decDeg: 60.235 },
      // ε Cas (Segin)
      segin: { raDeg: 28.680, decDeg: 63.670 },
    },
    edges: [
      ["caph", "schedar"],
      ["schedar", "gamma"],
      ["gamma", "ruchbah"],
      ["ruchbah", "segin"],
    ],
  },
  {
    key: "ursa_major",
    name: "Ursa Major",
    stars: {
      // Big Dipper asterism
      dubhe: { raDeg: 165.933, decDeg: 61.750 },
      merak: { raDeg: 165.458, decDeg: 56.383 },
      phecda: { raDeg: 178.457, decDeg: 53.695 },
      megrez: { raDeg: 183.856, decDeg: 57.032 },
      alioth: { raDeg: 193.504, decDeg: 55.959 },
      mizar: { raDeg: 200.982, decDeg: 54.925 },
      alkaid: { raDeg: 206.885, decDeg: 49.313 },
    },
    edges: [
      ["dubhe", "merak"],
      ["merak", "phecda"],
      ["phecda", "megrez"],
      ["megrez", "alioth"],
      ["alioth", "mizar"],
      ["mizar", "alkaid"],
    ],
  },
];

