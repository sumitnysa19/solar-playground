// Minimal constellation line set (sample): Orion, Ursa Major, Cassiopeia
// RA/Dec in degrees (RA measured 0–360°)
export const constellationLines = [
  {
    name: 'Orion',
    lines: [
      // Belt
      [[83.0, 0.3], [84.0, -1.2]],
      [[84.0, -1.2], [85.0, -1.9]],
      // Shoulders and legs
      [[88.8, 7.4], [81.5, 6.3]], // Betelgeuse–Bellatrix
      [[86.75, -9.7], [78.6, -8.2]], // Saiph–Rigel
      // Connect shoulders to belt
      [[81.5, 6.3], [83.0, 0.3]],
      [[88.8, 7.4], [85.0, -1.9]],
      // Connect legs to belt
      [[78.6, -8.2], [85.0, -1.9]],
      [[86.75, -9.7], [84.0, -1.2]]
    ]
  },
  {
    name: 'Ursa Major',
    lines: [
      // Big Dipper chain
      [[166.0, 61.75], [165.25, 56.38]], // Dubhe–Merak
      [[165.25, 56.38], [178.25, 53.7]], // Merak–Phecda
      [[178.25, 53.7], [183.75, 57.0]],  // Phecda–Megrez
      [[183.75, 57.0], [193.5, 55.96]],  // Megrez–Alioth
      [[193.5, 55.96], [201.0, 54.93]],  // Alioth–Mizar
      [[201.0, 54.93], [206.75, 49.31]]  // Mizar–Alkaid
    ]
  },
  {
    name: 'Cassiopeia',
    lines: [
      // W shape
      [[358.5, 77.63], [10.0, 56.5]],   // Achird–Schedar (wrap RA)
      [[10.0, 56.5], [2.25, 59.15]],    // Schedar–Caph
      [[2.25, 59.15], [21.5, 60.2]],    // Caph–Ruchbah
      [[21.5, 60.2], [31.25, 70.56]]    // Ruchbah–Segin
    ]
  }
];

