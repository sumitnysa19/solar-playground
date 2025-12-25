/**
 * Nakshatras.js
 * 
 * Complete 28-nakshatra constellation data for Indian zodiacal system
 * Each nakshatra includes:
 * - Name and description
 * - Primary stars (used for constellation lines)
 * - RA/Dec coordinates
 * - Associated planetary lord and deity
 * - Constellation line definitions
 */

export const NAKSHATRAS = [
    {
        id: 1,
        name: 'Ashvini',
        meaning: 'Physicians to the Gods',
        lord: 'Ketu (South Lunar Node)',
        deity: 'Ashvins',
        symbol: 'Horse head',
        raMin: 0,        // degrees
        raMax: 13.333,
        decMin: 20,
        decMax: 32,
        primaryStars: [
            { name: 'β Arietis (Sheratan)', ra: 1.626, dec: 20.751 },
            { name: 'γ Arietis (Mesarthim)', ra: 1.913, dec: 19.730 }
        ],
        lines: [[0, 1]], // Connect stars
        color: 0xffffff
    },
    {
        id: 2,
        name: 'Bharani',
        meaning: 'The Bearer',
        lord: 'Shukra (Venus)',
        deity: 'Yama',
        symbol: 'Yoni (female organ)',
        raMin: 13.333,
        raMax: 26.667,
        decMin: 15,
        decMax: 28,
        primaryStars: [
            { name: '35 Arietis', ra: 2.100, dec: 27.260 },
            { name: '39 Arietis', ra: 2.296, dec: 27.571 },
            { name: '41 Arietis', ra: 2.340, dec: 27.023 }
        ],
        lines: [[0, 1], [1, 2]],
        color: 0xffffff
    },
    {
        id: 3,
        name: 'Krittika',
        meaning: 'Nurses of Kartikeya',
        lord: 'Surya (Sun)',
        deity: 'Agni',
        symbol: 'Knife or spear',
        raMin: 26.667,
        raMax: 40,
        decMin: 8,
        decMax: 35,
        primaryStars: [
            { name: 'Alcyone (Pleiades)', ra: 3.785, dec: 24.113 },
            { name: 'Atlas (Pleiades)', ra: 3.627, dec: 24.408 },
            { name: 'Electra (Pleiades)', ra: 3.706, dec: 24.110 }
        ],
        lines: [[0, 1], [1, 2]],
        color: 0xffffff
    },
    {
        id: 4,
        name: 'Rohini',
        meaning: 'The Red One',
        lord: 'Chandra (Moon)',
        deity: 'Brahma',
        symbol: 'Cart or chariot',
        raMin: 40,
        raMax: 53.333,
        decMin: 4,
        decMax: 31,
        primaryStars: [
            { name: 'Aldebaran (α Tauri)', ra: 4.599, dec: 16.509 }
        ],
        lines: [],
        color: 0xffffff
    },
    {
        id: 5,
        name: 'Mrigashira',
        meaning: 'The Deer\'s Head',
        lord: 'Mangala (Mars)',
        deity: 'Soma',
        symbol: 'Deer head',
        raMin: 53.333,
        raMax: 66.667,
        decMin: -5,
        decMax: 25,
        primaryStars: [
            { name: 'λ Orionis', ra: 5.355, dec: 9.929 },
            { name: 'φ Orionis', ra: 5.398, dec: 9.644 }
        ],
        lines: [[0, 1]],
        color: 0xffffff
    },
    {
        id: 6,
        name: 'Ardra',
        meaning: 'The Storm God',
        lord: 'Rahu (North Lunar Node)',
        deity: 'Rudra',
        symbol: 'Teardrop or diamond',
        raMin: 66.667,
        raMax: 80,
        decMin: 7,
        decMax: 32,
        primaryStars: [
            { name: 'Betelgeuse (α Orionis)', ra: 5.919, dec: 7.407 }
        ],
        lines: [],
        color: 0xffffff
    },
    {
        id: 7,
        name: 'Punarvasu',
        meaning: 'The Two Restorers',
        lord: 'Guru (Jupiter)',
        deity: 'Aditi',
        symbol: 'Bow and quiver',
        raMin: 80,
        raMax: 93.333,
        decMin: 4,
        decMax: 35,
        primaryStars: [
            { name: 'Castor (α Geminorum)', ra: 7.576, dec: 31.888 },
            { name: 'Pollux (β Geminorum)', ra: 7.746, dec: 28.026 }
        ],
        lines: [[0, 1]],
        color: 0xffffff
    },
    {
        id: 8,
        name: 'Pushya',
        meaning: 'The Flower',
        lord: 'Shani (Saturn)',
        deity: 'Brihaspati',
        symbol: 'Cow\'s udder or lotus',
        raMin: 93.333,
        raMax: 106.667,
        decMin: 8,
        decMax: 35,
        primaryStars: [
            { name: 'γ Cancri (Asellus Borealis)', ra: 8.270, dec: 21.468 },
            { name: 'δ Cancri (Asellus Australis)', ra: 8.750, dec: 18.153 },
            { name: 'θ Cancri', ra: 8.984, dec: 25.862 }
        ],
        lines: [[0, 1], [1, 2]],
        color: 0xffffff
    },
    {
        id: 9,
        name: 'Ashleshā',
        meaning: 'The Embrace',
        lord: 'Budh (Mercury)',
        deity: 'Nagas (Serpents)',
        symbol: 'Serpent',
        raMin: 106.667,
        raMax: 120,
        decMin: -2,
        decMax: 22,
        primaryStars: [
            { name: 'δ Hydrae', ra: 9.157, dec: 1.951 },
            { name: 'ε Hydrae', ra: 9.269, dec: 4.569 },
            { name: 'η Hydrae', ra: 9.727, dec: 3.404 }
        ],
        lines: [[0, 1], [1, 2]],
        color: 0xffffff
    },
    {
        id: 10,
        name: 'Maghā',
        meaning: 'The Bountiful',
        lord: 'Ketu',
        deity: 'Pitris (Ancestors)',
        symbol: 'Royal throne',
        raMin: 120,
        raMax: 133.333,
        decMin: 8,
        decMax: 35,
        primaryStars: [
            { name: 'Regulus (α Leonis)', ra: 10.139, dec: 11.967 }
        ],
        lines: [],
        color: 0xffffff
    },
    {
        id: 11,
        name: 'Purva Phalguni',
        meaning: 'First Reddish One',
        lord: 'Shukra (Venus)',
        deity: 'Bhaga',
        symbol: 'Front legs of bed',
        raMin: 133.333,
        raMax: 146.667,
        decMin: 8,
        decMax: 35,
        primaryStars: [
            { name: 'δ Leonis (Zosma)', ra: 11.238, dec: 20.524 },
            { name: 'θ Leonis (Chertan)', ra: 11.336, dec: 15.428 }
        ],
        lines: [[0, 1]],
        color: 0xffffff
    },
    {
        id: 12,
        name: 'Uttara Phalguni',
        meaning: 'Second Reddish One',
        lord: 'Surya (Sun)',
        deity: 'Aryaman',
        symbol: 'Four legs of bed',
        raMin: 146.667,
        raMax: 160,
        decMin: 8,
        decMax: 35,
        primaryStars: [
            { name: 'Denebola (β Leonis)', ra: 11.818, dec: 14.572 }
        ],
        lines: [],
        color: 0xffffff
    },
    {
        id: 13,
        name: 'Hasta',
        meaning: 'The Hand',
        lord: 'Chandra (Moon)',
        deity: 'Savitri',
        symbol: 'Hand or fist',
        raMin: 160,
        raMax: 173.333,
        decMin: -25,
        decMax: 0,
        primaryStars: [
            { name: 'α Corvi (Alchiba)', ra: 12.264, dec: -24.728 },
            { name: 'β Corvi (Kraz)', ra: 12.559, dec: -23.397 },
            { name: 'γ Corvi', ra: 12.266, dec: -17.540 },
            { name: 'δ Corvi (Algorab)', ra: 12.294, dec: -16.197 }
        ],
        lines: [[0, 1], [2, 3]],
        color: 0xffffff
    },
    {
        id: 14,
        name: 'Chitra',
        meaning: 'The Bright One',
        lord: 'Mangala (Mars)',
        deity: 'Tvastar',
        symbol: 'Bright jewel or pearl',
        raMin: 173.333,
        raMax: 186.667,
        decMin: -11,
        decMax: 15,
        primaryStars: [
            { name: 'Spica (α Virginis)', ra: 13.419, dec: -11.161 }
        ],
        lines: [],
        color: 0xffffff
    },
    {
        id: 15,
        name: 'Svati',
        meaning: 'Very Good',
        lord: 'Rahu',
        deity: 'Vayu',
        symbol: 'Shoot of plant',
        raMin: 186.667,
        raMax: 200,
        decMin: -10,
        decMax: 50,
        primaryStars: [
            { name: 'Arcturus (α Boötis)', ra: 14.261, dec: 19.183 }
        ],
        lines: [],
        color: 0xffffff
    },
    {
        id: 16,
        name: 'Vishakha',
        meaning: 'Forked or Branched',
        lord: 'Guru (Jupiter)',
        deity: 'Indra & Agni',
        symbol: 'Triumphal arch',
        raMin: 200,
        raMax: 213.333,
        decMin: -16,
        decMax: 0,
        primaryStars: [
            { name: 'α Librae (Zubenelgenubi)', ra: 14.848, dec: -16.062 },
            { name: 'β Librae (Zubeneschamali)', ra: 15.282, dec: -9.381 }
        ],
        lines: [[0, 1]],
        color: 0xffffff
    },
    {
        id: 17,
        name: 'Anuradha',
        meaning: 'Following Rādhā',
        lord: 'Shani (Saturn)',
        deity: 'Mitra',
        symbol: 'Triumphal archway',
        raMin: 213.333,
        raMax: 226.667,
        decMin: -38,
        decMax: -15,
        primaryStars: [
            { name: 'β Scorpii (Acrab)', ra: 15.796, dec: -19.439 },
            { name: 'δ Scorpii (Dschubba)', ra: 16.006, dec: -22.621 }
        ],
        lines: [[0, 1]],
        color: 0xffffff
    },
    {
        id: 18,
        name: 'Jyeshtha',
        meaning: 'The Eldest',
        lord: 'Budh (Mercury)',
        deity: 'Indra',
        symbol: 'Circular amulet',
        raMin: 226.667,
        raMax: 240,
        decMin: -40,
        decMax: -15,
        primaryStars: [
            { name: 'Antares (α Scorpii)', ra: 16.290, dec: -26.432 }
        ],
        lines: [],
        color: 0xffffff
    },
    {
        id: 19,
        name: 'Mula',
        meaning: 'The Root',
        lord: 'Ketu',
        deity: 'Nirrti',
        symbol: 'Bunch of roots',
        raMin: 240,
        raMax: 253.333,
        decMin: -45,
        decMax: -20,
        primaryStars: [
            { name: 'ε Scorpii (Larawag)', ra: 17.626, dec: -37.268 },
            { name: 'ζ Scorpii', ra: 17.868, dec: -42.360 },
            { name: 'η Scorpii', ra: 17.171, dec: -43.319 }
        ],
        lines: [[0, 1], [1, 2]],
        color: 0xffffff
    },
    {
        id: 20,
        name: 'Purva Ashadha',
        meaning: 'First of the Invincible',
        lord: 'Shukra (Venus)',
        deity: 'Apah',
        symbol: 'Elephant tusk',
        raMin: 253.333,
        raMax: 266.667,
        decMin: -35,
        decMax: -10,
        primaryStars: [
            { name: 'δ Sagittarii (Kaus Media)', ra: 18.348, dec: -29.828 },
            { name: 'ε Sagittarii (Kaus Australis)', ra: 18.408, dec: -34.383 }
        ],
        lines: [[0, 1]],
        color: 0xffffff
    },
    {
        id: 21,
        name: 'Uttara Ashadha',
        meaning: 'Later Invincible',
        lord: 'Surya (Sun)',
        deity: 'Visvedevas',
        symbol: 'Elephant tusk',
        raMin: 266.667,
        raMax: 280,
        decMin: -35,
        decMax: -10,
        primaryStars: [
            { name: 'ζ Sagittarii (Ascella)', ra: 19.045, dec: -29.230 },
            { name: 'σ Sagittarii (Nunki)', ra: 19.819, dec: -27.670 }
        ],
        lines: [[0, 1]],
        color: 0xffffff
    },
    {
        id: 22,
        name: 'Shravana',
        meaning: 'Ear or Listening',
        lord: 'Chandra (Moon)',
        deity: 'Vishnu',
        symbol: 'Ear or three footprints',
        raMin: 280,
        raMax: 293.333,
        decMin: -5,
        decMax: 40,
        primaryStars: [
            { name: 'Altair (α Aquilae)', ra: 19.846, dec: 8.868 },
            { name: 'β Aquilae', ra: 19.425, dec: 2.723 },
            { name: 'γ Aquilae', ra: 19.765, dec: 10.537 }
        ],
        lines: [[0, 1], [1, 2]],
        color: 0xffffff
    },
    {
        id: 23,
        name: 'Dhanishta',
        meaning: 'Most Famous',
        lord: 'Mangala (Mars)',
        deity: 'Eight Vasus',
        symbol: 'Drum or flute',
        raMin: 293.333,
        raMax: 306.667,
        decMin: -5,
        decMax: 25,
        primaryStars: [
            { name: 'α Delphini (Sualocin)', ra: 20.648, dec: 15.912 },
            { name: 'β Delphini', ra: 20.282, dec: 14.590 },
            { name: 'γ Delphini', ra: 20.772, dec: 16.127 },
            { name: 'δ Delphini', ra: 20.744, dec: 15.912 }
        ],
        lines: [[0, 1], [1, 2], [2, 3]],
        color: 0xffffff
    },
    {
        id: 24,
        name: 'Shatabhisha',
        meaning: 'Hundred Physicians',
        lord: 'Rahu',
        deity: 'Varuna',
        symbol: 'Empty circle',
        raMin: 306.667,
        raMax: 320,
        decMin: -15,
        decMax: 15,
        primaryStars: [
            { name: 'γ Aquarii (Sadachbia)', ra: 22.096, dec: -1.387 }
        ],
        lines: [],
        color: 0xffffff
    },
    {
        id: 25,
        name: 'Purva Bhadrapada',
        meaning: 'First of the Blessed Feet',
        lord: 'Guru (Jupiter)',
        deity: 'Ajaikapada',
        symbol: 'Swords or cot legs',
        raMin: 320,
        raMax: 333.333,
        decMin: 0,
        decMax: 35,
        primaryStars: [
            { name: 'α Pegasi (Markab)', ra: 23.080, dec: 15.205 },
            { name: 'β Pegasi', ra: 23.064, dec: 27.704 }
        ],
        lines: [[0, 1]],
        color: 0xffffff
    },
    {
        id: 26,
        name: 'Uttara Bhadrapada',
        meaning: 'Second of the Blessed Feet',
        lord: 'Shani (Saturn)',
        deity: 'Ahirbudhnya',
        symbol: 'Cot legs or snake',
        raMin: 333.333,
        raMax: 346.667,
        decMin: 0,
        decMax: 35,
        primaryStars: [
            { name: 'γ Pegasi (Algenib)', ra: 0.220, dec: 15.183 },
            { name: 'α Andromedae (Alpheratz)', ra: 0.139, dec: 29.091 }
        ],
        lines: [[0, 1]],
        color: 0xffffff
    },
    {
        id: 27,
        name: 'Revati',
        meaning: 'Prosperous',
        lord: 'Budh (Mercury)',
        deity: 'Pushan',
        symbol: 'Fish or pair of fish',
        raMin: 346.667,
        raMax: 360,
        decMin: -10,
        decMax: 15,
        primaryStars: [
            { name: 'ζ Piscium (Revati)', ra: 23.159, dec: 5.355 }
        ],
        lines: [],
        color: 0xffffff
    },
    {
        id: 28,
        name: 'Abhijit',
        meaning: 'Invincible',
        lord: 'Vishnu',
        deity: 'Vishnu',
        symbol: 'Shaligram or lotus',
        raMin: 280,
        raMax: 293.333,
        decMin: 30,
        decMax: 45,
        primaryStars: [
            { name: 'Vega (α Lyrae)', ra: 18.603, dec: 38.784 }
        ],
        lines: [],
        color: 0xffffff
    }
];

/**
 * Get nakshatra by name
 */
export function getNakshatraByName(name) {
    return NAKSHATRAS.find(n => n.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get nakshatras in RA range
 */
export function getNakshatrasInRange(raMin, raMax) {
    return NAKSHATRAS.filter(n => n.raMin >= raMin && n.raMax <= raMax);
}

/**
 * Get all nakshatras visible above horizon
 * (Currently returns all; filtering by altitude can be done by caller)
 */
export function getVisibleNakshatras(altitude) {
    // MVP: Return all nakshatras above horizon
    // Altitude cutoff at 0 degrees (visible) or higher
    return NAKSHATRAS.filter(n => altitude >= 0);
}
