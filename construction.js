import { MakeStar, MakeMoon, MakeMinorMoon } from "./functions.js";
export var sol = MakeStar({
    name: "sun",
    position: [0, 0, 0],
    mass: 1.98847e30
})
export var mercury = MakeMoon({
    name: "mercury",
    parent: sol,
    color: "rgb(200, 200, 200)",
    majorLabel: true
});
export var venus = MakeMoon({
    name: "venus",
    parent: sol,
    color: "rgb(235, 233, 199)",
    majorLabel: true
});
export var earth_barycenter = MakeMinorMoon({
    parent: sol,
    name: "earth barycenter",
    color: "rgb(131, 151, 201)",
    barycenter: true
});
export var mars = MakeMoon({
    name: "mars",
    parent: sol,
    color: "rgb(184, 137, 121)",
    majorLabel: true,
    glow: true
});
export var jupiter = MakeMoon({
    name: "jupiter",
    parent: sol,
    color: "rgb(255, 214, 176)",
    majorLabel: true,
    glow: true
});
export var saturn = MakeMoon({
    name: "saturn",
    parent: sol,
    color: "rgb(214, 209, 176)",
    majorLabel: true,
    glow: true
});
export var uranus = MakeMoon({
    name: "uranus",
    parent: sol,
    color: "rgb(232, 254, 255)",
    majorLabel: true,
    glow: true
});
export var neptune = MakeMoon({
    name: "neptune",
    parent: sol,
    color: "rgb(148, 187, 255)",
    majorLabel: true,
    glow: true
});
//dwarf planets
export var pluto_barycenter = MakeMinorMoon({
    parent: sol,
    name: "pluto barycenter",
    color: "rgb(108, 78, 156)",
    barycenter: true
});
export var ceres = MakeMinorMoon({
    parent: sol,
    name: "ceres",
    color: "rgb(166, 166, 166)",
    majorLabel: true,
    dwarfPlanet: true
})
export var vesta = MakeMinorMoon({
    parent: sol,
    name: "vesta",
    color: "rgb(166, 166, 166)",
    majorLabel: true,
    dwarfPlanet: true
})
export var eris = MakeMinorMoon({
    parent: sol,
    name: "Eris",
    color: "rgb(145, 114, 0)",
    majorLabel: true,
    dwarfPlanet: true
})
export var haumea = MakeMinorMoon({
    parent: sol,
    name: "Haumea",
    color: "rgb(117, 8, 0)",
    majorLabel: true,
    dwarfPlanet: true
})
export var makemake = MakeMinorMoon({
    parent: sol,
    name: "Makemake",
    color: "rgb(0, 99, 102)",
    majorLabel: true,
    dwarfPlanet: true
})
export var gonggong = MakeMinorMoon({
    parent: sol,
    name: "Gonggong",
    color: "rgb(0, 102, 51)",
    majorLabel: true,
    dwarfPlanet: true
})
export var quaoar = MakeMinorMoon({
    parent: sol,
    name: "Quaoar",
    color: "rgb(14, 0, 102)",
    majorLabel: true,
    dwarfPlanet: true
})
export var MS4 = MakeMinorMoon({
    parent: sol,
    name: "2002 MS4",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var orcus = MakeMinorMoon({
    parent: sol,
    name: "Orcus",
    color: "rgb(90, 0, 102)",
    majorLabel: true,
    dwarfPlanet: true
})
export var sedna = MakeMinorMoon({
    parent: sol,
    name: "Sedna",
    color: "rgb(90, 0, 102)",
    majorLabel: true,
    dwarfPlanet: true
})
export var salacia = MakeMinorMoon({
    parent: sol,
    name: "Salacia",
    color: "rgb(1, 21, 117)",
    majorLabel: true,
    dwarfPlanet: true
})
export var EZ51 = MakeMinorMoon({
    parent: sol,
    name: "2014 EZ51",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var AW197 = MakeMinorMoon({
    parent: sol,
    name: "2002 AW197",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var FY27 = MakeMinorMoon({
    parent: sol,
    name: "2013 FY27",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var AZ84 = MakeMinorMoon({
    parent: sol,
    name: "2003 AZ84",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var varda = MakeMinorMoon({
    parent: sol,
    name: "Varda",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var SM55 = MakeMinorMoon({
    parent: sol,
    name: "1995 SM55",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var GV9 = MakeMinorMoon({
    parent: sol,
    name: "2004 GV9",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var RN43 = MakeMinorMoon({
    parent: sol,
    name: "2005 RN43",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var varuna = MakeMinorMoon({
    parent: sol,
    name: "Varuna",
    color: "rgb(0, 60, 105)",
    majorLabel: true,
    dwarfPlanet: true
})
export var AN55 = MakeMinorMoon({
    parent: sol,
    name: "2014 AN55",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var UZ413 = MakeMinorMoon({
    parent: sol,
    name: "2003 UZ413",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var UX25 = MakeMinorMoon({
    parent: sol,
    name: "2002 UX25",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var ixion = MakeMinorMoon({
    parent: sol,
    name: "Ixion",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var UK126 = MakeMinorMoon({
    parent: sol,
    name: "Gǃkúnǁʼhòmdímà",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var YE7 = MakeMinorMoon({
    parent: sol,
    name: "2009 YE7",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var FZ27 = MakeMinorMoon({
    parent: sol,
    name: "2013 FZ27",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var chaos = MakeMinorMoon({
    parent: sol,
    name: "Chaos",
    color: "rgb(105, 87, 0)",
    majorLabel: true,
    dwarfPlanet: true
})

export var XV50 = MakeMinorMoon({
    parent: sol,
    name: "2007 XV50",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var XC26 = MakeMinorMoon({
    parent: sol,
    name: "2013 XC26",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var RE64 = MakeMinorMoon({
    parent: sol,
    name: "2010 RE64",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var WK509 = MakeMinorMoon({
    parent: sol,
    name: "2014 WK509",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var ST291 = MakeMinorMoon({
    parent: sol,
    name: "2008 ST291",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var XW93 = MakeMinorMoon({
    parent: sol,
    name: "2002 XW93",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var JJ43 = MakeMinorMoon({
    parent: sol,
    name: "2007 JJ43",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var JH43 = MakeMinorMoon({
    parent: sol,
    name: "2007 JH43",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var VS2 = MakeMinorMoon({
    parent: sol,
    name: "2003 VS2",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var CB79 = MakeMinorMoon({
    parent: sol,
    name: "2005 CB79",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var OO127 = MakeMinorMoon({
    parent: sol,
    name: "2010 OO127",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var RM43 = MakeMinorMoon({
    parent: sol,
    name: "2005 RM43",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var AP129 = MakeMinorMoon({
    parent: sol,
    name: "2008 AP129",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var OG19 = MakeMinorMoon({
    parent: sol,
    name: "2008 OG19",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var UM33 = MakeMinorMoon({
    parent: sol,
    name: "2014 UM33",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var BV64 = MakeMinorMoon({
    parent: sol,
    name: "2014 BV64",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})
export var TC302 = MakeMinorMoon({
    parent: sol,
    name: "2002 TC302",
    color: "rgb(50, 50, 50)",
    majorLabel: true,
    dwarfPlanet: true
})

//univeral asteroid helper
export var universal_asteroid = MakeMinorMoon({
    parent: sol,
    name: "%?!@#$%^&*",
    color: "rgb(166, 166, 166)",
    majorLabel: true
})
universal_asteroid.Data = [5.034043741209280E-01, 4.982214993412832E+09, 30.080265403254453E+01, 3.368395150949136E+02, 2.069876649140746E+02, 2.399390499987945E+06, 2.078453291431989E-08, 9.365819807207008E+01, 1.425294565742131E+02, 1.003274039031925E+10, 1.508326578722567E+10, 1.732057205634731E+10,]
//terran
export var luna = MakeMoon({
    name: "moon",
    parent: earth_barycenter,
    binary: true,
    tidalLock: true
});
export var earth = MakeMoon({
    name: "earth",
    parent: earth_barycenter,
    binary: true,
    majorLabel: true,
    glow: true,
    color: "rgb(20, 181, 240)",
    cloudy: true
});
//martian
export var deimos = MakeMinorMoon({
    parent: mars,
    name: "deimos"
});
export var phobos = MakeMinorMoon({
    parent: mars,
    name: "phobos"
});
//jovian
export var io = MakeMoon({
    name: "io",
    parent: jupiter,
});
export var europa = MakeMoon({
    name: "europa",
    parent: jupiter,
});
export var ganymede = MakeMoon({
    name: "ganymede",
    parent: jupiter,
});
export var callisto = MakeMoon({
    name: "callisto",
    parent: jupiter,
});
export var metis = MakeMinorMoon({
    parent: jupiter,
    name: "metis"
});
export var adrastea = MakeMinorMoon({
    parent: jupiter,
    name: "adrastea"
});
export var amalthea = MakeMinorMoon({
    parent: jupiter,
    name: "amalthea"
});
export var thebe = MakeMinorMoon({
    parent: jupiter,
    name: "thebe"
});
export var leda = MakeMinorMoon({
    parent: jupiter,
    name: "leda"
});
export var himalia = MakeMinorMoon({
    parent: jupiter,
    name: "himalia"
});
export var elara = MakeMinorMoon({
    parent: jupiter,
    name: "elara"
});
export var lysithea = MakeMinorMoon({
    parent: jupiter,
    name: "lysithea"
});
export var ananke = MakeMinorMoon({
    parent: jupiter,
    name: "ananke"
});
export var pasiphae = MakeMinorMoon({
    parent: jupiter,
    name: "pasiphae"
});
export var carme = MakeMinorMoon({
    parent: jupiter,
    name: "carme"
});
export var sinope = MakeMinorMoon({
    parent: jupiter,
    name: "sinope"
});
export var Themisto = MakeMinorMoon({
    parent: jupiter,
    name: "Themisto"
});
export var ersa = MakeMinorMoon({
    parent: jupiter,
    name: "ersa"
});
export var pandia = MakeMinorMoon({
    parent: jupiter,
    name: "pandia"
});
export var dia = MakeMinorMoon({
    parent: jupiter,
    name: "dia"
});
export var carpo = MakeMinorMoon({
    parent: jupiter,
    name: "carpo"
});
export var Valetudo = MakeMinorMoon({
    parent: jupiter,
    name: "Valetudo"
});
export var Euporie = MakeMinorMoon({
    parent: jupiter,
    name: "Euporie"
});
export var Eupheme = MakeMinorMoon({
    parent: jupiter,
    name: "Eupheme"
});
export var Euanthe = MakeMinorMoon({
    parent: jupiter,
    name: "Euanthe"
});
export var s2003j18 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2003 J18"
});
export var Hermippe = MakeMinorMoon({
    parent: jupiter,
    name: "Hermippe"
});
export var Praxidike = MakeMinorMoon({
    parent: jupiter,
    name: "Praxidike"
});
export var Thyone = MakeMinorMoon({
    parent: jupiter,
    name: "Thyone"
});
export var Thelxinoe = MakeMinorMoon({
    parent: jupiter,
    name: "Thelxinoe"
});
export var Mneme = MakeMinorMoon({
    parent: jupiter,
    name: "Mneme"
});
export var Orthosie = MakeMinorMoon({
    parent: jupiter,
    name: "Orthosie"
});
export var Harpalyke = MakeMinorMoon({
    parent: jupiter,
    name: "Harpalyke"
});
export var Iocaste = MakeMinorMoon({
    parent: jupiter,
    name: "Iocaste"
});
export var Erinome = MakeMinorMoon({
    parent: jupiter,
    name: "Erinome"
});
export var Aitne = MakeMinorMoon({
    parent: jupiter,
    name: "Aitne"
});
export var Herse = MakeMinorMoon({
    parent: jupiter,
    name: "Herse"
});
export var Taygete = MakeMinorMoon({
    parent: jupiter,
    name: "Taygete"
});
export var Eukelade = MakeMinorMoon({
    parent: jupiter,
    name: "Eukelade"
});
export var Isonoe = MakeMinorMoon({
    parent: jupiter,
    name: "Isonoe"
});
export var Autonoe = MakeMinorMoon({
    parent: jupiter,
    name: "Autonoe"
});
export var Philophrosyne = MakeMinorMoon({
    parent: jupiter,
    name: "Philophrosyne"
});
export var Cyllene = MakeMinorMoon({
    parent: jupiter,
    name: "Cyllene"
});
export var Sponde = MakeMinorMoon({
    parent: jupiter,
    name: "Sponde"
});
export var Eurydome = MakeMinorMoon({
    parent: jupiter,
    name: "Eurydome"
});
export var Kalyke = MakeMinorMoon({
    parent: jupiter,
    name: "Kalyke"
});
export var Hegemone = MakeMinorMoon({
    parent: jupiter,
    name: "Hegemone"
});
export var Kale = MakeMinorMoon({
    parent: jupiter,
    name: "Kale"
});
export var Kallichore = MakeMinorMoon({
    parent: jupiter,
    name: "Kallichore"
});
export var Chaldene = MakeMinorMoon({
    parent: jupiter,
    name: "Chaldene"
});
export var Arche = MakeMinorMoon({
    parent: jupiter,
    name: "Arche"
});
export var Eirene = MakeMinorMoon({
    parent: jupiter,
    name: "Eirene"
});
export var Kore = MakeMinorMoon({
    parent: jupiter,
    name: "Kore"
});
export var Megaclite = MakeMinorMoon({
    parent: jupiter,
    name: "Megaclite"
});
export var Aoede = MakeMinorMoon({
    parent: jupiter,
    name: "Aoede"
});
export var Callirrhoe = MakeMinorMoon({
    parent: jupiter,
    name: "Callirrhoe"
});
export var s2010j2 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2010 J2"
});
export var S2003J16 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2003 J16"
});
export var S2003J2 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2003 J2"
});
export var S2017J7 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2017 J7"
});
export var S2017J3 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2017 J3"
});
export var S2016J1 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2016 J1"
});
export var S2017J9 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2017 J9"
});
export var S2003J12 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2003 J12"
});
export var S2003J4 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2003 J4"
});
export var S2017J2 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2017 J2"
});
export var S2017J6 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2017 J6"
});
export var S2003J19 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2003 J19"
});
export var S2010J1 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2010 J1"
});
export var S2017J8 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2017 J8"
});
export var S2017J5 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2017 J5"
});
export var S2011J1 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2011 J1"
});
export var S2017J1 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2017 J1"
});
export var S2011J2 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2011 J2"
});
export var S2003J9 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2003 J9"
});
export var S2003J23 = MakeMinorMoon({
    parent: jupiter,
    name: "S/2003 J23"
});
//saturnian
export var titan = MakeMoon({
    name: "titan",
    parent: saturn,
    atmosphereColor: "rbg(224, 165, 45)",
});
export var mimas = MakeMoon({
    name: "mimas",
    parent: saturn,
});
export var enceladus = MakeMoon({
    name: "enceladus",
    parent: saturn,
});
export var tethys = MakeMoon({
    name: "tethys",
    parent: saturn,
});
export var dione = MakeMoon({
    name: "dione",
    parent: saturn,
});
export var rhea = MakeMoon({
    name: "rhea",
    parent: saturn,
});
export var iapetus = MakeMoon({
    name: "iapetus",
    parent: saturn,
});
export var pan = MakeMinorMoon({
    parent: saturn,
    name: "pan"
});
export var daphnis = MakeMinorMoon({
    parent: saturn,
    name: "daphnis"
});
export var atlas = MakeMinorMoon({
    parent: saturn,
    name: "atlas"
});
export var prometheus = MakeMinorMoon({
    parent: saturn,
    name: "prometheus"
});
export var pandora = MakeMinorMoon({
    parent: saturn,
    name: "pandora"
});
export var epimetheus = MakeMinorMoon({
    parent: saturn,
    name: "epimetheus"
});
export var janus = MakeMinorMoon({
    parent: saturn,
    name: "janus"
});
export var aegaeon = MakeMinorMoon({
    parent: saturn,
    name: "aegaeon"
});
export var methone = MakeMinorMoon({
    parent: saturn,
    name: "methone"
});
export var anthe = MakeMinorMoon({
    parent: saturn,
    name: "anthe"
});
export var pallene = MakeMinorMoon({
    parent: saturn,
    name: "pallene"
});
export var telesto = MakeMinorMoon({
    parent: saturn,
    name: "telesto"
});
export var calypso = MakeMinorMoon({
    parent: saturn,
    name: "calypso"
});
export var helene = MakeMinorMoon({
    parent: saturn,
    name: "helene"
});
export var polydeuces = MakeMinorMoon({
    parent: saturn,
    name: "polydeuces"
});
export var hyperion = MakeMinorMoon({
    parent: saturn,
    name: "hyperion"
});
export var kiviuq = MakeMinorMoon({
    parent: saturn,
    name: "kiviuq"
});
export var ijiraq = MakeMinorMoon({
    parent: saturn,
    name: "ijiraq"
});
export var phoebe = MakeMinorMoon({
    parent: saturn,
    name: "phoebe"
});
export var paaliaq = MakeMinorMoon({
    parent: saturn,
    name: "paaliaq"
});
export var skathi = MakeMinorMoon({
    parent: saturn,
    name: "skathi"
});
export var albiorix = MakeMinorMoon({
    parent: saturn,
    name: "albiorix"
});
export var bebhionn = MakeMinorMoon({
    parent: saturn,
    name: "bebhionn"
});
export var skoll = MakeMinorMoon({
    parent: saturn,
    name: "skoll"
});
export var erriapus = MakeMinorMoon({
    parent: saturn,
    name: "erriapus"
});
export var tarqeq = MakeMinorMoon({
    parent: saturn,
    name: "tarqeq"
});
export var siarnaq = MakeMinorMoon({
    parent: saturn,
    name: "siarnaq"
});
export var tarvos = MakeMinorMoon({
    parent: saturn,
    name: "tarvos"
});
export var hyrrokkin = MakeMinorMoon({
    parent: saturn,
    name: "hyrrokkin"
});
export var greip = MakeMinorMoon({
    parent: saturn,
    name: "greip"
});
export var mundilfari = MakeMinorMoon({
    parent: saturn,
    name: "mundilfari"
});
export var suttungr = MakeMinorMoon({
    parent: saturn,
    name: "suttungr"
});
export var jarnsaxa = MakeMinorMoon({
    parent: saturn,
    name: "jarnsaxa"
});
export var narvi = MakeMinorMoon({
    parent: saturn,
    name: "narvi"
});
export var bergelmir = MakeMinorMoon({
    parent: saturn,
    name: "bergelmir"
});
export var hati = MakeMinorMoon({
    parent: saturn,
    name: "hati"
});
export var farbauti = MakeMinorMoon({
    parent: saturn,
    name: "farbauti"
});
export var thrymr = MakeMinorMoon({
    parent: saturn,
    name: "thrymr"
});
export var bestla = MakeMinorMoon({
    parent: saturn,
    name: "bestla"
});
export var aegir = MakeMinorMoon({
    parent: saturn,
    name: "aegir"
});
export var kari = MakeMinorMoon({
    parent: saturn,
    name: "kari"
});
export var loge = MakeMinorMoon({
    parent: saturn,
    name: "loge"
});
export var fenrir = MakeMinorMoon({
    parent: saturn,
    name: "fenrir"
});
export var ymir = MakeMinorMoon({
    parent: saturn,
    name: "ymir"
});
export var surtur = MakeMinorMoon({
    parent: saturn,
    name: "surtur"
});
export var S2004S37 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S37"
});
export var S2007S2 = MakeMinorMoon({
    parent: saturn,
    name: "S/2007 S2"
});
export var s2004S29 = MakeMinorMoon({
    parent: saturn,
    name: "s/2004 S29"
});
export var S2004S31 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S31"
});
export var S2004S13 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S13"
});
export var S2006S1 = MakeMinorMoon({
    parent: saturn,
    name: "S/2006 S1"
});
export var S2007S3 = MakeMinorMoon({
    parent: saturn,
    name: "S/2007 S3"
});
export var S2004S20 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S20"
});
export var S2004S17 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S17"
});
export var S2004S12 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S12"
});
export var S2004S27 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S27"
});
export var S2004S7 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S7"
});
export var S2004S30 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S30"
});
export var S2004S22 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S22"
});
export var S2004S25 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S25"
});
export var S2004S32 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S32"
});
export var S2004S23 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S23"
});
export var S2006S3 = MakeMinorMoon({
    parent: saturn,
    name: "S/2006 S3"
});
export var S2004S35 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S35"
});
export var S2004S28 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S28"
});
export var S2004S38 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S38"
});
export var S2004S33 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S33"
});
export var s2004S24 = MakeMinorMoon({
    parent: saturn,
    name: "s/2004 S24"
});
export var S2004S21 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S21"
});
export var S2004S39 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S39"
});
export var S2004S36 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S36"
});
export var S2004S34 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S34"
});
export var S2004S26 = MakeMinorMoon({
    parent: saturn,
    name: "S/2004 S26"
});
//uranian
export var miranda = MakeMoon({
    name: "miranda",
    parent: uranus,
});
export var ariel = MakeMoon({
    name: "ariel",
    parent: uranus,
});
export var oberon = MakeMoon({
    name: "oberon",
    parent: uranus,
});
export var umbriel = MakeMoon({
    name: "umbriel",
    parent: uranus,
});
export var titania = MakeMoon({
    name: "titania",
    parent: uranus,
});
export var cordelia = MakeMinorMoon({
    parent: uranus,
    name: "cordelia"
});
export var ophelia = MakeMinorMoon({
    parent: uranus,
    name: "ophelia"
});
export var bianca = MakeMinorMoon({
    parent: uranus,
    name: "bianca"
});
export var cressida = MakeMinorMoon({
    parent: uranus,
    name: "cressida"
});
export var desdemona = MakeMinorMoon({
    parent: uranus,
    name: "desdemona"
});
export var juliet = MakeMinorMoon({
    parent: uranus,
    name: "juliet"
});
export var portia = MakeMinorMoon({
    parent: uranus,
    name: "portia"
});
export var rosalind = MakeMinorMoon({
    parent: uranus,
    name: "rosalind"
});
export var cupid = MakeMinorMoon({
    parent: uranus,
    name: "cupid"
});
export var belinda = MakeMinorMoon({
    parent: uranus,
    name: "belinda"
});
export var perdita = MakeMinorMoon({
    parent: uranus,
    name: "perdita"
});
export var puck = MakeMinorMoon({
    parent: uranus,
    name: "puck"
});
export var mab = MakeMinorMoon({
    parent: uranus,
    name: "mab"
});
export var francisco = MakeMinorMoon({
    parent: uranus,
    name: "francisco"
});
export var caliban = MakeMinorMoon({
    parent: uranus,
    name: "caliban"
});
export var stephano = MakeMinorMoon({
    parent: uranus,
    name: "stephano"
});
export var trinculo = MakeMinorMoon({
    parent: uranus,
    name: "trinculo"
});
export var sycorax = MakeMinorMoon({
    parent: uranus,
    name: "sycorax"
});
export var margaret = MakeMinorMoon({
    parent: uranus,
    name: "margaret"
});
export var prospero = MakeMinorMoon({
    parent: uranus,
    name: "prospero"
});
export var setebos = MakeMinorMoon({
    parent: uranus,
    name: "setebos"
});
export var ferdinand = MakeMinorMoon({
    parent: uranus,
    name: "ferdinand"
});
//neptunian
export var triton = MakeMoon({
    name: "triton",
    parent: neptune,
    atmosphereColor: "rgb(180, 180, 255)",
    atmosphereDensity: 0.3
});
export var naiad = MakeMinorMoon({
    parent: neptune,
    name: "naiad"
});
export var thalassa = MakeMinorMoon({
    parent: neptune,
    name: "thalassa"
});
export var despina = MakeMinorMoon({
    parent: neptune,
    name: "despina"
});
export var galatea = MakeMinorMoon({
    parent: neptune,
    name: "galatea"
});
export var larissa = MakeMinorMoon({
    parent: neptune,
    name: "larissa"
});
export var hippocamp = MakeMinorMoon({
    parent: neptune,
    name: "hippocamp"
});
export var proteus = MakeMinorMoon({
    parent: neptune,
    name: "proteus"
});
export var nereid = MakeMinorMoon({
    parent: neptune,
    name: "nereid"
})
export var halimede = MakeMinorMoon({
    parent: neptune,
    name: "halimede"
});
export var sao = MakeMinorMoon({
    parent: neptune,
    name: "sao"
});
export var laomedeia = MakeMinorMoon({
    parent: neptune,
    name: "laomedaia"
});
export var psamathe = MakeMinorMoon({
    parent: neptune,
    name: "psamathe"
});
export var neso = MakeMinorMoon({
    parent: neptune,
    name: "neso"
});
//dwarf
export var pluto = MakeMoon({
    name: "pluto",
    parent: pluto_barycenter,
    binary: true,
    majorLabel: true,
    atmosphereColor: "rgb(0, 100, 255)",
    atmosphereDensity: 0.1
})
export var charon = MakeMoon({
    name: "charon",
    parent: pluto_barycenter,
    binary: true
})
export var styx = MakeMinorMoon({
    parent: pluto_barycenter,
    name: "styx"
})
export var nix = MakeMinorMoon({
    parent: pluto_barycenter,
    name: "nix"
})
export var kerberos = MakeMinorMoon({
    parent: pluto_barycenter,
    name: "kerberos"
})
export var hydra = MakeMinorMoon({
    parent: pluto_barycenter,
    name: "hydra"
})
export var dysnomia = MakeMinorMoon({
    parent: eris,
    name: "dysnomia"
})
export var makemake1 = MakeMinorMoon({
    parent: makemake,
    name: "S/2015 1"
})
export var Haumea1 = MakeMinorMoon({
    parent: haumea,
    name: "Hiʻiaka"
})
export var Haumea2 = MakeMinorMoon({
    parent: haumea,
    name: "Namaka 1"
})
export var gonggong1 = MakeMinorMoon({
    parent: gonggong,
    name: "Xiangliu"
})
export var quaoar1 = MakeMinorMoon({
    parent: quaoar,
    name: "Weywot"
})
export var orcus1 = MakeMinorMoon({
    parent: orcus,
    name: "Vanth"
})
export var salacia1 = MakeMinorMoon({
    parent: salacia,
    name: "Actaea"
})
export var varda1 = MakeMinorMoon({
    parent: varda,
    name: "Ilmarë"
})
export var FY27_1 = MakeMinorMoon({
    parent: FY27,
    name: "S/2018 (2013 FY27) 1"
})
export var AZ84_1 = MakeMinorMoon({
    parent: AZ84,
    name: "S/2005 (208996) 1"
})
export var UX25_1 = MakeMinorMoon({
    parent: UX25,
    name: "S/2007 (55637) 1"
})
export var UK126_1 = MakeMinorMoon({
    parent: UK126,
    name: "Gǃòʼé ǃHú"
})
//space stations
export var tianhe = MakeMinorMoon({
    parent: earth,
    name: "tianhe core module",
    color: "rgb(200, 200, 255)",
    barycenter: true
});

//mew / old
//0 = ecc                   //2
//1 = peri distance         //na
//2 = inc                   //3
//3 = ascn                  //5
//4 = aop                   //4
//5 = time to periapsis     //na
//6 = mean motion           //na
//7 = ma                    //6
//8 = true anomaly          //na
//9 = sma                   //1
//10 = apo distance          //na
//11 orbital period         //na

//new order of elements:
//data is now just a copy-pasted line of data from the source
//all physical data is stored in its own array known as Physical.
//order of physical properties:
//0 = eq diameter           //7
//1 = polar diameter        //8
//2 = rot period in secs    //9
//3 - atmo height           //10
//4 = polar ra celestail    //16
//5 = polar dec celestial   //17
//6 = mass                  //0
//7 = forced bump scale *optional*

tianhe.Data = [0.0107052, 0, 64.4713, 188.3327, 211.1496, 0, 0, 148.3273, 0, 6610.413]
mercury.Data = [1.976193311288088E-01, 4.722525649908036E+07, 7.013873298083792E+00, 4.812376548400915E+01, 2.581669078701001E+01, 2.451500229889843E+06, 4.625713389618031E-05, 174.796, 1.792679756326384E+02, 5.885642355456796E+07, 7.048759061005555E+07, 7.782583348289268E+06];
mercury.Physical = [4879400, 4879400, 5067000, 0, 281.01, 61.45, 3.3011e23];
mercury.precessions = [98734.69518, 0.00002527, -0.00653055555, 0.28329722222, -0.12397222222];
venus.Data = [1.616509607284492E-02, 1.085717706658479E+08, 3.381654228084928E+00, 7.663280644582056E+01, 7.454007924054677E+01, 2.451525318284216E+06, 1.801673109427256E-05, 50.115, 3.159808267827712E+01, 1.103556808489555E+08, 1.121395910320631E+08, 1.998142715880588E+07,];
venus.Physical = [12103600, 12103600, 20997360, 250000, 272.76, 67.16, 4.8675e24];
venus.precessions = [137630.18116, -0.00004938, -0.00079444444, 0.24669166666, -0.27691388888];
earth_barycenter.Data = [1.487370652262564E-02, 1.466664481240442E+08, 1.196622093669550E-02, -11.26064, 114.20783, 2.451519451250377E+06, 1.149765722413008E-05, 358.617, 2.612305949633834E+01, 149598023, 1.510952685109462E+08, 3.131072643603165E+07,];
earth_barycenter.Physical = [12756200, 12713600, 86164.0905, 200000, 0, 90, 5.97237e24];
earth_barycenter.precessions = [-7479.90115, -0.00003804, -0.01303888888, 5.39625833333, -5.06340277778];
earth.Data = [6.314721694605988E-02, 4.346995596093420E+03, 5.240273131307000E+00, 1.239580563903234E+02, 1.289226717609495E+02, 2.451533992919744E+06, 1.542286696449988E-04, 1.466732745658530E+02, 1.503997598044814E+02, 4.639998593933983E+03, 4.933001591774546E+03, 2.334196364584111E+06,];
earth.Physical = [12756200, 12713600, 86164.0905, 200000, 0, 90, 5.97237e24];
mars.Data = [8.524988638067586E-02, 2.056358417611332E+08, 1.847427796803471E+00, 4.947423181771810E+01, 2.857001686643666E+02, 2.451506960125742E+06, 6.196906010882497E-06, 19.412, 2.413961480278434E+01, 2.248000177310818E+08, 2.439641937010304E+08, 5.809350656082205E+07,];
mars.Physical = [6792400, 6752400, 88642.6848, 225000, 317.68143, 52.88650, 6.4171e23, 100000];
mars.precessions = [-10802473.2408, 0.00011902, -0.007075, 0.71693611111, -0.28338611111];
jupiter.Data = [4.761834308320285E-02, 7.392938577525872E+08, 1.304250289306695E+00, 1.004850341687083E+02, 2.740397630889823E+02, 2.451307041624191E+06, 9.643600078163698E-07, 20.020, 2.178675911828646E+01, 7.762579763935691E+08, 8.132220950345510E+08, 3.733045720292354E+08,];
jupiter.Physical = [142984000, 133708000, 35730, 2000000, 268.057, 64.495, 1.8982e27, 500000];
jupiter.precessions = [90861351.2295, -0.00012880, -0.00115277777, -0.10478888888, 0.33810277777];
saturn.Data = [5.255658130460658E-02, 1.351125103050174E+09, 2.484934299522663E+00, 1.137091691420790E+02, 3.389170336102687E+02, 2.452817478672952E+06, 3.876771843664398E-07, 3.173779339980682E+02, 3.130970114954278E+02, 1.426074714741953E+09, 1.501024326433732E+09, 9.286076522360449E+08,];
saturn.Physical = [120536000, 116464000, 38018, 2000000, 40.589, 83.537, 5.6834e26];
saturn.precessions = [-451082918.752, -0.00036762, 0.00169722222, -0.0994, -0.44195833333];
uranus.Data = [4.720746657452445E-02, 2.735259529389514E+09, 7.723237928341237E-01, 7.401240975334893E+01, 9.704507920373798E+01, 2.439425907236871E+06, 1.357816043489664E-07, 1.421755077857687E+02, 1.453433111732883E+02, 2.870781868488957E+09, 3.006304207588400E+09, 2.651316441031139E+09,];
uranus.Physical = [51118000, 49946000, 88642.6848, 1000000, 257.311, -15.175, 8.6810e25];
uranus.precessions = [227426394.466, -0.00019150, -0.00058055555, 0.83165555555, -0.46705555555];
neptune.Data = [8.710838184116516E-03, 4.457921514476189E+09, 1.772436005215047E+00, 1.317729654112957E+02, 2.753526331010991E+02, 2.468632376394176E+06, 6.925291100161481E-08, 2.577585119031099E+02, 2.567853135176064E+02, 4.497094981155639E+09, 4.536268447835089E+09, 5.198337438719444E+09,];
neptune.Physical = [49528000, 48682000, 57996, 1000000, 299.3, 42.950, 1.02413e26];
neptune.precessions = [-187290740.875, 0.0000251, -0.00101111111, -0.19255, -0.04201388888];
//dwarf
pluto_barycenter.Data = [2.489765436288240E-01, 4.436471785805314E+09, 1.714056375458786E+01, 1.103012428594646E+02, 1.137774539279666E+02, 2.447809204941441E+06, 4.600375609388301E-08, 1.484875624527574E+01, 2.517158730762971E+01, 5.907234651819837E+09, 7.377997517834359E+09, 7.825447975711448E+09,];
pluto_barycenter.Physical = [0, 0, 0, 0, 0, 0, 1.303e22];
ceres.Data = [8.054785911629317E-02, 3.822386423163419E+08, 1.056199334856726E+01, 8.054481198394521E+01, 7.319696376868185E+01, 2.451512984585412E+06, 2.464117645368244E-06, 6.816074228081221E+00, 8.032498414536565E+00, 4.157243485767117E+08, 4.492100548370814E+08, 1.460969206063214E+08,];
vesta.Data = [9.376931387994529E-02, 3.223494626186700E+08, 7.117758173782256E+00, 1.038630076517935E+02, 1.497753639703823E+02, 2.451615620818522E+06, 3.113417418702223E-06, 3.410030517254836E+02, 3.370749697451484E+02, 3.557035394583473E+08, 3.890576162980247E+08, 1.156285687352710E+08,];
eris.Data = [4.384177983770324E-01, 5.699020376614010E+09, 4.399288026184585E+01, 3.597650709876918E+01, 1.512203444405219E+02, 2.545671370002177E+06, 2.043098565651202E-08, 1.938446338682283E+02, 1.860312749641593E+02, 1.014814992381149E+10, 1.459727947100897E+10, 1.762029527367693E+10,]
eris.Physical = [0, 0, 0, 0, 0, 0, 1.6466e22]
haumea.Data = [1.950067593835569E-01, 5.190686968062777E+09, 2.820493021237142E+01, 1.219476858485343E+02, 2.399471140349363E+02, 2.500199951401207E+06, 4.033859086326767E-08, 1.904251238168728E+02, 1.871691857342310E+02, 6.448112488606590E+09, 7.705538009150404E+09, 8.924456514117254E+09,]
haumea.Physical = [0, 0, 0, 0, 0, 0, 4e21]
makemake.Data = [1.603865573055912E-01, 5.714852203781650E+09, 2.900197893992392E+01, 7.944298388359995E+01, 2.960678375819785E+02, 2.407947702724090E+06, 3.719471205220548E-08, 1.401052825525136E+02, 1.502629820874177E+02, 6.806527758109828E+09, 7.898203312438006E+09, 9.678795187195263E+09,]
makemake.Physical = [0, 0, 0, 0, 0, 0, 3.1e21]
gonggong.Data = [5.034043741209280E-01, 4.982214993412832E+09, 3.080265403254453E+01, 3.368395150949136E+02, 2.069876649140746E+02, 2.399390499987945E+06, 2.078453291431989E-08, 9.365819807207008E+01, 1.425294565742131E+02, 1.003274039031925E+10, 1.508326578722567E+10, 1.732057205634731E+10,]
gonggong.Physical = [0, 0, 0, 0, 0, 0, 1.75e21]
quaoar.Data = [3.693967021750696E-02, 6.243344845016109E+09, 7.990894378768303E+00, 1.889147058989335E+02, 1.575523117282675E+02, 2.478981106430386E+06, 4.001509815295227E-08, 2.651450263130829E+02, 2.609474167285522E+02, 6.482818004170275E+09, 6.722291163324440E+09, 8.996604197344437E+09,]
quaoar.Physical = [0, 0, 0, 0, 0, 0, 1.4e21]
sedna.Data = [8.495469502228938E-01, 1.139802898977009E+10, 1.192852401657315E+01, 1.444013340172164E+02, 3.112854982846179E+02, 2.479347976651942E+06, 1.001674201318627E-09, 3.575938010890653E+02, 3.103733664432000E+02, 7.575804549429935E+10, 1.401180619988286E+11, 3.593982949007647E+11,]
salacia.Data = [1.066671762624854E-01, 5.616845195957317E+09, 2.393114296534699E+01, 2.800946889581675E+02, 3.097423318056439E+02, 2.424240355503110E+06, 4.189390912778919E-08, 9.883281271558850E+01, 1.105857829561813E+02, 6.287516865727189E+09, 6.958188535497061E+09, 8.593134598680927E+09,]
salacia.Physical = [0, 0, 0, 0, 0, 0, 5e20]
EZ51.Data = [2.278868010863333E-01, 6.019677437244737E+09, 1.027104346699028E+01, 2.756264913596172E+01, 3.315093871503782E+02, 2.494507751653827E+06, 3.034109604611312E-08, 2.473744054175367E+02, 2.261455738166425E+02, 7.796366446933157E+09, 9.573055456621578E+09, 1.186509542874995E+10,]
AW197.Data = [1.288938791103875E-01, 6.150342054296177E+09, 2.438282740866614E+01, 2.974810343330540E+02, 2.959269406291076E+02, 2.480053550960937E+06, 3.520686248711616E-08, 2.732806108752220E+02, 2.585612054469937E+02, 7.060382089859699E+09, 7.970422125423222E+09, 1.022527923730042E+10,]
FY27.Data = [3.948489136726279E-01, 5.321513395038770E+09, 3.312050274700901E+01, 1.870532531085764E+02, 1.392399659769161E+02, 2.525577408771384E+06, 2.532868350155808E-08, 1.979876058657101E+02, 1.885349234664080E+02, 8.793693864675570E+09, 1.226587433431237E+10, 1.421313507975473E+10,]
FY27.Physical = [0, 0, 0, 0, 0, 0, 3.1e21]
AZ84.Data = [1.790388919151495E-01, 4.847383683213685E+09, 1.356505761258912E+01, 2.520309513229337E+02, 1.512185915058588E+01, 2.490628068907009E+06, 4.603545195017836E-08, 2.045485376005699E+02, 1.974906727065193E+02, 5.904522924991818E+09, 6.961662166769952E+09, 7.820060078689099E+09,]
AZ84.Physical = [0, 0, 0, 0, 0, 0, 3.1e21]
varda.Data = [1.426083052699595E-01, 5.867588449046131E+09, 2.151105250099319E+01, 1.840970222662397E+02, 1.832072265111732E+02, 2.486623789263645E+06, 3.689343325138232E-08, 2.481831097714708E+02, 2.340983795050389E+02, 6.843533107576471E+09, 7.819477766106812E+09, 9.757834071636896E+09,]
varda.Physical = [0, 0, 0, 0, 0, 0, 2.45e20]
SM55.Data = [1.045161936937880E-01, 5.599184868705733E+09, 2.704443858928029E+01, 2.103645278611800E+01, 7.122141286351300E+01, 2.465995458925784E+06, 4.224438825802978E-08, 3.072570511074456E+02, 2.969650370396289E+02, 6.252692487876308E+09, 6.906200107046884E+09, 8.521841949778299E+09,]
GV9.Data = [7.667685409409254E-02, 5.793907656911349E+09, 2.198260613126328E+01, 2.506059120300790E+02, 2.921159210246915E+02, 2.447508836001055E+06, 4.201872411564690E-08, 1.465296147854059E+01, 1.710100139063931E+01, 6.275059476849491E+09, 6.756211296787633E+09, 8.567609026137553E+09,]
RN43.Data = [2.246636423969067E-02, 6.070431380646742E+09, 1.926787150757659E+01, 1.870011432605715E+02, 1.723644085120970E+02, 2.462614727011938E+06, 4.268132215826388E-08, 3.191785414732326E+02, 3.174593587639792E+02, 6.209946296042553E+09, 6.349461211438364E+09, 8.434602814437357E+09,]
varuna.Data = [5.393204289888492E-02, 6.078435992360076E+09, 1.717508996548504E+01, 9.729851445803693E+01, 2.673028974480417E+02, 2.426452210859291E+06, 4.055695671108785E-08, 8.792817087803087E+01, 9.410737249696085E+01, 6.424946481630407E+09, 6.771456970900739E+09, 8.876405657468370E+09,]
AN55.Data = [3.866281613487565E-01, 5.151358864406261E+09, 9.409626294268632E+00, 2.837935728829638E+02, 3.070755873467379E+02, 2.477133524641095E+06, 2.713767714266097E-08, 3.000027064089269E+02, 2.549074412743300E+02, 8.398427413514279E+09, 1.164549596262230E+10, 1.326568954695363E+10,]
UZ413.Data = [2.230685895909689E-01, 4.559741374617084E+09, 1.204451391199833E+01, 1.360323059743914E+02, 1.454695493132747E+02, 2.430426673471783E+06, 4.645509311048676E-08, 8.476305049779744E+01, 1.100355773475771E+02, 5.868911095017405E+09, 7.178080815417726E+09, 7.749419404752709E+09,]
UX25.Data = [1.420852327010603E-01, 5.476389615340209E+09, 1.943338778417552E+01, 2.046284169318874E+02, 2.774480292773304E+02, 2.475729187292249E+06, 4.095381259420468E-08, 2.744264441569021E+02, 2.581881632717635E+02, 6.383372596070449E+09, 7.290355576800689E+09, 8.790390373836479E+09,]
UX25.Physical = [0, 0, 0, 0, 0, 0, 1.25e20]
ixion.Data = [2.440580706645959E-01, 4.466792576302128E+09, 1.963027854907054E+01, 7.103058179807866E+01, 2.998537815362881E+02, 2.477364432029877E+06, 4.598419673039345E-08, 2.574185032573446E+02, 2.326155394163772E+02, 5.908909670123953E+09, 7.351026763945778E+09, 7.828776527525085E+09,]
UK126.Data = [4.887477356598172E-01, 5.616786668569663E+09, 2.335736739522438E+01, 1.311784060009988E+02, 3.464325741878266E+02, 2.468448327318576E+06, 1.813805037787492E-08, 3.335103300276248E+02, 2.869094220236523E+02, 1.098633113306331E+10, 1.635587559755696E+10, 1.984777815145633E+10,]
UK126.Physical = [0, 0, 0, 0, 0, 0, 1.3e20]
YE7.Data = [1.435154797970088E-01, 5.680360008297550E+09, 2.909069496917904E+01, 1.415654773720208E+02, 1.001116447357914E+02, 2.403624839070731E+06, 3.867097449163519E-08, 1.601095093284217E+02, 1.648881273767799E+02, 6.632180587398447E+09, 7.584001166499344E+09, 9.309307684446136E+09,]
FZ27.Data = [2.164580728555312E-01, 5.634398539927678E+09, 1.403392263088988E+01, 2.850435350855380E+02, 3.423312507150742E+02, 2.484909200203524E+06, 3.425245048973814E-08, 2.612615948120824E+02, 2.383370609061141E+02, 7.190934326209723E+09, 8.747470112491768E+09, 1.051019693051900E+10,]
chaos.Data = [1.034336236709579E-01, 6.133523417868793E+09, 1.203560312265859E+01, 4.998105927933177E+01, 5.743833090279143E+01, 2.464290136666471E+06, 3.691290803333446E-08, 3.193522510197561E+02, 3.108276488423248E+02, 6.841125855045197E+09, 7.548728292221602E+09, 9.752685962181562E+09,]
MS4.Data = [1.452533046516019E-01, 5.337076392581773E+09, 1.769347154040459E+01, 2.160759652071819E+02, 2.145726528810603E+02, 2.496406087012312E+06, 4.233218132762254E-08, 1.959205533155045E+02, 1.920394342338408E+02, 6.244044489000754E+09, 7.151012585419736E+09, 8.504168429541647E+09,];
orcus.Data = [2.238671962425797E-01, 4.560591211174756E+09, 2.056779021922632E+01, 2.685848117926352E+02, 7.302112041512362E+01, 2.413840058125866E+06, 4.637052054946936E-08, 1.510615683640313E+02, 1.609725395098802E+02, 5.876044910221532E+09, 7.191498609268308E+09, 7.763553131044582E+09,];
orcus.Physical = [0, 0, 0, 0, 0, 0, 6.3e20]
XV50.Data = [6.686548689326868E-02, 6.414844895064692E+09, 2.287279227166512E+01, 5.358480572669426E+01, 2.739014554961215E+02, 2.425800695947491E+06, 3.664432867520585E-08, 8.150826866813824E+01, 8.915831677648649E+01, 6.874512522002244E+09, 7.334180148939796E+09, 9.824166876976568E+09,];
XC26.Data = [2.281759722636356E-01, 4.893413326015736E+09, 1.864419664646086E+01, 4.330568130921067E+01, 1.471059009130015E+02, 2.471551905710989E+06, 4.137416310088356E-08, 2.884807601253701E+02, 2.621915288940058E+02, 6.340063473234084E+09, 7.786713620452433E+09, 8.701082342673708E+09,];
RE64.Data = [4.470925883185353E-01, 5.438301494984289E+09, 1.353509583164544E+01, 6.746784235766329E+01, 2.051986301086978E+01, 2.479604319426952E+06, 2.141180734397895E-08, 3.080908159108069E+02, 2.558458975460699E+02, 9.835826722679831E+09, 1.423335195037537E+10, 1.681315333248750E+10,];
WK509.Data = [2.088798440939456E-01, 6.039124241198955E+09, 1.450140475089382E+01, 4.096718498781483E+01, 1.341686479681555E+02, 2.490407566161454E+06, 3.131643800100348E-08, 2.548479907795630E+02, 2.337078929240790E+02, 7.633637186607213E+09, 9.228150132015472E+09, 1.149556025460062E+10,];
ST291.Data = [5.732739250676102E-01, 6.350867701249825E+09, 2.078177243063635E+01, 3.310474237048243E+02, 3.247975264022203E+02, 2.434945730718719E+06, 1.150386572215128E-08, 1.649857808716004E+01, 6.336103066246082E+01, 1.488277392530103E+10, 2.341468014935225E+10, 3.129382841341772E+10,];
XW93.Data = [2.490933707826870E-01, 4.212200822414863E+09, 1.435651087743697E+01, 4.682992729670924E+01, 2.477508805653591E+02, 2.424869454063993E+06, 4.971471288829212E-08, 1.145808380747812E+02, 1.369798109412470E+02, 5.609486797054030E+09, 7.006772771693197E+09, 7.241317088744175E+09,];
JJ43.Data = [1.591264357549057E-01, 6.033517410744367E+09, 1.205803861069628E+01, 2.725216019449268E+02, 8.011419771625897E+00, 2.465130191836861E+06, 3.436448376352998E-08, 3.196643237882840E+02, 3.059062072558278E+02, 7.175296819042038E+09, 8.317076227339709E+09, 1.047593214195342E+10,];
JH43.Data = [2.876039017743693E-02, 5.728629650066033E+09, 1.815578212796768E+01, 6.458976862089344E+01, 1.239997153159321E-01, 2.411924722092324E+06, 4.610872251938941E-08, 1.578390105760789E+02, 1.590419872248694E+02, 5.898266084012578E+09, 6.067902517959123E+09, 7.807633357194283E+09,];
VS2.Data = [7.583415421978333E-02, 5.450088137728242E+09, 1.479005969564057E+01, 3.027242013880966E+02, 1.125623434381926E+02, 2.453111088046414E+06, 4.611999100357435E-08, 3.537595036847737E+02, 3.527171371168297E+02, 5.897305297110462E+09, 6.344522456492682E+09, 7.805725720373615E+09,];
CB79.Data = [1.422758499316968E-01, 5.562581594376460E+09, 2.863385576303013E+01, 1.128223510689591E+02, 9.164147353251882E+01, 2.469548658411984E+06, 3.999231058611532E-08, 2.977913175351796E+02, 2.822635398487553E+02, 6.485280371239978E+09, 7.407979148103496E+09, 9.001730450777857E+09,];
OO127.Data = [1.311678197299688E-01, 5.481219479323019E+09, 2.588970109900209E+01, 2.198558239801664E+02, 2.469867615812165E+02, 2.491311616847363E+06, 4.168287725053608E-08, 2.167844824467880E+02, 2.088575032883239E+02, 6.308720606572684E+09, 7.136221733822350E+09, 8.636639880596775E+09,];
RM43.Data = [6.123344130201284E-01, 5.251979992458947E+09, 2.875774607459792E+01, 8.463621830394023E+01, 3.183152577865000E+02, 2.453318194478682E+06, 1.324557792903408E-08, 3.579707244397778E+02, 3.493711338369797E+02, 1.354770753157320E+10, 2.184343507068745E+10, 2.717888203359449E+10,];
AP129.Data = [1.390960980288776E-01, 5.380386816832855E+09, 2.740454843973964E+01, 1.490233262283910E+01, 5.776502958538629E+01, 2.444679089716770E+06, 4.227478381369568E-08, 2.507802101923065E+01, 3.305885139434297E+01, 6.249695006044160E+09, 7.119003195255465E+09, 8.515714748217624E+09,];
OG19.Data = [4.199218522340252E-01, 5.771494708277997E+09, 1.314474769423251E+01, 1.640957712622427E+02, 1.407674546003111E+02, 2.456605040143677E+06, 2.104587255933805E-08, 3.507990082552267E+02, 3.356251658539103E+02, 9.949512372609554E+09, 1.412753003694111E+10, 1.710549177683146E+10,];
UM33.Data = [1.548116789160418E-01, 5.440013218576345E+09, 1.737080144765471E+01, 2.366131446044938E+02, 2.681520013753839E+02, 2.483324779735852E+06, 4.044826795666013E-08, 2.489382391945482E+02, 2.336439428297483E+02, 6.436451004906813E+09, 7.432888791237280E+09, 8.900257493985552E+09,];
BV64.Data = [1.443639063270542E-01, 5.858230249377151E+09, 1.542864264462253E+01, 2.791947725886881E+02, 3.473753858128971E+02, 2.488787602143279E+06, 3.686834305185085E-08, 2.413664900384815E+02, 2.281229932795092E+02, 6.846637598268933E+09, 7.835044947160716E+09, 9.764474619694834E+09,];
TC302.Data = [2.934918281771643E-01, 5.844873954604090E+09, 3.503833123664042E+01, 2.385531180349450E+01, 8.675966744947186E+01, 2.473142953655567E+06, 2.775764966329924E-08, 3.082024715602695E+02, 2.759690021811341E+02, 8.272903538431760E+09, 1.070093312225943E+10, 1.296939778283846E+10,];
//moons  =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//       =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//earth
luna.Data = [6.314721694601877E-02, 3.534132157254273E+05, 5.240273131307005E+00, 1.239580563903234E+02, 3.089226717609725E+02, 2.451533992919744E+06, 1.542286696449841E-04, 1.466732745658300E+02, 1.503997598044585E+02, 3.772345261902945E+05, 4.010558366551618E+05, 2.334196364584333E+06,];
luna.Physical = [1738100, 1736000, 27553.843872, 0, 0, 90, 0, 100000];
//martian
deimos.Data = [3.346511008457831E-04, 2.345033048615726E+04, 2.757036412559953E+01, 8.366278221410698E+01, 2.116129859293961E+02, 2.451544981144732E+06, 3.300250737296054E-03, 5.376422569794205E+00, 5.380017239764066E+00, 2.345818079218320E+04, 2.346603109820914E+04, 1.090826208844221E+05,];
phobos.Data = [1.468856793631673E-02, 9.240852118375085E+03, 2.605536777264767E+01, 8.481541116138577E+01, 3.427142106289891E+02, 2.451545150810836E+06, 1.305511414056407E-02, 1.898911283552044E+02, 1.896071380264484E+02, 9.378610475492611E+03, 9.516368832610136E+03, 2.757540042345777E+04,];
//jovian
io.Data = [4.819986984028857E-03, 4.200468574680347E+05, 2.212592177718981E+00, 3.368509722804622E+02, 6.742816909751090E+01, 2.451545128448361E+06, 2.351841408261822E-03, 3.338994090679000E+02, 3.336550915555463E+02, 4.220812837619695E+05, 4.241157100559044E+05, 1.530715458684204E+05,];
io.Physical = [3660000, 3660000, 152853.504696, 0, 0, 0, 1e21];
europa.Data = [9.661537823344155E-03, 6.646658735054540E+05, 1.790942183579040E+00, 3.326280462406709E+02, 2.543147301382544E+02, 2.451545140718960E+06, 1.172969577284244E-03, 3.457388973157642E+02, 3.454629380800294E+02, 6.711502167093372E+05, 6.776345599132203E+05, 3.069133308926065E+05,];
europa.Physical = [1560800, 1560800, 306822.0384, 0];
ganymede.Data = [1.415827710521800E-03, 1.069077912482883E+06, 2.214135346430200E+00, 3.431736549296213E+02, 3.159055205602657E+02, 2.451546571659056E+06, 5.821634846458358E-04, 2.809472389075293E+02, 2.807878960564249E+02, 1.070593688694046E+06, 1.072109464905209E+06, 6.183829963485412E+05,];
ganymede.Physical = [2634100, 2634100, 618153.375744, 0];
callisto.Data = [7.423685220918853E-03, 1.868768629715352E+06, 2.016919351362485E+00, 3.379426810412668E+02, 1.619056899622573E+01, 2.451541056513620E+06, 2.496367180665830E-04, 8.505552940851534E+01, 8.590370279131945E+01, 1.882745539955067E+06, 1.896722450194782E+06, 1.442095549036904E+06,];
callisto.Physical = [2410300, 2410300, 1441931.18976, 0,];
//minor
metis.Data = [5.838059999712574E-03, 1.279925737237546E+05, 2.214047734534981E+00, 3.377823391396207E+02, 1.870097844877268E+02, 2.451545000501790E+06, 1.396179821394264E-02, 3.593946911363154E+02, 3.593875716722712E+02, 1.287441900297627E+05, 1.294958063357709E+05, 2.578464424736449E+04,];
adrastea.Data = [7.158242165160070E-03, 1.289002432474195E+05, 2.209896942881882E+00, 3.377277944187952E+02, 2.293953818669763E+02, 2.451544995354194E+06, 1.378707895912496E-02, 5.534100602745941E+00, 5.613916902868302E+00, 1.298295949281196E+05, 1.307589466088197E+05, 2.611140482094176E+04,];
amalthea.Data = [6.030454140707830E-03, 1.808372719606513E+05, 2.442453375623524E+00, 3.303910034362536E+02, 1.091588736931580E+02, 2.451545038624425E+06, 8.311138361969377E-03, 3.322644816696476E+02, 3.319407205612320E+02, 1.819344191318422E+05, 1.830315663030330E+05, 4.331536599695059E+04,];
thebe.Data = [1.558778798167844E-02, 2.188057849552892E+05, 3.284038843734244E+00, 3.380993340084843E+02, 2.764563376965283E+01, 2.451545335563026E+06, 6.154745574690658E-03, 1.815576434737057E+02, 1.815100173704120E+02, 2.222704902316031E+05, 2.257351955079170E+05, 5.849145113006460E+04,];
leda.Data = [1.726669456823042E-01, 9.215659123967018E+06, 2.757817174044641E+01, 2.168763074177813E+02, 2.713081128188372E+02, 2.451630008504144E+06, 1.734857373955638E-05, 2.325793274525762E+02, 2.188246342512017E+02, 1.113899544551281E+07, 1.306233176705860E+07, 2.075098537807556E+07,];
himalia.Data = [1.662139234189185E-01, 9.479731593577705E+06, 3.024687622211450E+01, 6.419127942796278E+01, 3.210630625057042E+02, 2.451491120243230E+06, 1.682366885944456E-05, 7.831772808094709E+01, 9.742543259445050E+01, 1.136950095454832E+07, 1.325927031551894E+07, 2.139842403031497E+07,];
elara.Data = [2.215868072819668E-01, 9.136048780438716E+06, 2.891246407233541E+01, 1.127969639613900E+02, 1.299391473676762E+02, 2.451554465689506E+06, 1.604022600236877E-05, 3.468817325714282E+02, 3.390581623276076E+02, 1.173675994433986E+07, 1.433747110824101E+07, 2.244357404607868E+07,];
lysithea.Data = [1.366380450803275E-01, 1.013377892876924E+07, 2.786025697818136E+01, 9.239529145554291E+00, 4.829456710948674E+01, 2.451567789185606E+06, 1.603854761472170E-05, 3.284203301179816E+02, 3.188808548362904E+02, 1.173757874206084E+07, 1.334137855535245E+07, 2.244592270122750E+07,];
ananke.Data = [3.804022208489667E-01, 1.343240312550438E+07, 1.516543229153848E+02, 1.369622442584889E+01, 7.875486099133707E+01, 2.451704798915800E+06, 6.389502125042453E-06, 2.717825317559831E+02, 2.312124443700073E+02, 2.167923058715499E+07, 2.992605804880559E+07, 5.634241807183187E+07,];
pasiphae.Data = [3.795940553225056E-01, 1.453132278930798E+07, 1.400867402465972E+02, 3.157485955738244E+02, 1.728485963927350E+02, 2.451709353858478E+06, 5.689695397793121E-06, 2.792053389146528E+02, 2.369529861102627E+02, 2.342228167536627E+07, 3.231324056142456E+07, 6.327227994307644E+07,];
carme.Data = [2.425456495198173E-01, 1.833061055860471E+07, 1.647231705391235E+02, 1.154984329745111E+02, 6.505878916102536E+00, 2.451759807425279E+06, 5.417539871947527E-06, 2.594539188370946E+02, 2.343845057203955E+02, 2.420028421116619E+07, 3.006995786372767E+07, 6.645082611465584E+07,];
sinope.Data = [3.165162238897685E-01, 1.569757522866604E+07, 1.521384379900902E+02, 3.080206523353412E+02, 3.542762452092419E+02, 2.451234007910405E+06, 5.859712004010855E-06, 1.574488005594988E+02, 1.675684937311296E+02, 2.296700489074134E+07, 3.023643455281663E+07, 6.143646646005592E+07,];
Themisto.Data = [1.967367900651840E-01, 5.940495153605537E+06, 4.598192377428499E+01, 2.026673876194022E+02, 2.363368106164701E+02, 2.451570586748886E+06, 3.206901802087224E-05, 2.891051788781153E+02, 2.665476289609632E+02, 7.395452798202475E+06, 8.850410442799412E+06, 1.122578807264047E+07,];
ersa.Data = [1.372948499130285E-01, 9.783505807746239E+06, 2.996785053231701E+01, 1.137353721401058E+02, 3.007107711060995E+02, 2.451606131531416E+06, 1.688824968517950E-05, 2.708002454808511E+02, 2.552251671797277E+02, 1.134049774335987E+07, 1.289748967897350E+07, 2.131659625543804E+07,];
pandia.Data = [1.457471983551051E-01, 9.863135781211104E+06, 2.819629591460710E+01, 2.497862774002685E+02, 1.886590306824953E+02, 2.451433454600656E+06, 1.643954963633337E-05, 1.584365295641582E+02, 1.636744421461160E+02, 1.154592149094422E+07, 1.322870720067734E+07, 2.189841011242528E+07,];
dia.Data = [1.828751603257163E-01, 1.006136824382324E+07, 2.756039126662344E+01, 2.939095315540690E+02, 1.641069412007623E+02, 2.451575311218243E+06, 1.492725213572814E-05, 3.209071797570180E+02, 3.050807175761273E+02, 1.231313473206104E+07, 1.456490122029885E+07, 2.411696384080937E+07,];
carpo.Data = [2.029665106208351E-01, 1.348575878231176E+07, 5.870156907457132E+01, 5.211141466572413E+01, 9.051373197277395E+01, 2.451574222877978E+06, 9.266902414992318E-06, 3.366023997449345E+02, 3.246962647020628E+02, 1.691993995486469E+07, 2.035412112741763E+07, 3.884793255377109E+07,];
Valetudo.Data = [1.481849714845594E-01, 1.595785455431408E+07, 3.206991121431883E+01, 2.912138473384987E+02, 3.163105899262776E+02, 2.451413434323309E+06, 7.954062686044073E-06, 9.041601367309255E+01, 1.071333224280402E+02, 1.873394342680914E+07, 2.151003229930419E+07, 4.525988972046243E+07,];
Euporie.Data = [1.207500456274935E-01, 1.718151640249331E+07, 1.470852768795840E+02, 6.339997049972769E+01, 1.095609811574899E+02, 2.451457699655712E+06, 7.466363178648031E-06, 5.631690897272185E+01, 6.877855054347263E+01, 1.954110582212680E+07, 2.190069524176029E+07, 4.821624549814450E+07,];
Eupheme.Data = [2.900764266793874E-01, 1.486437849418766E+07, 1.496083224550188E+02, 2.274790283228246E+02, 7.357097832660058E+01, 2.451579682805106E+06, 6.731782551000057E-06, 3.398275783671249E+02, 3.228876984542545E+02, 2.093799819135555E+07, 2.701161788852344E+07, 5.347766320029444E+07,];
Euanthe.Data = [2.336814376953414E-01, 1.573044972817805E+07, 1.459714671975345E+02, 2.651661954663808E+02, 3.123669666428256E+02, 2.451555727657777E+06, 6.934818921111380E-06, 3.535723269392357E+02, 3.493806193430393E+02, 2.052729830903434E+07, 2.532414688989063E+07, 5.191195388016073E+07,];
s2003j18.Data = [6.393274698490149E-02, 1.945679430432874E+07, 1.458387608314259E+02, 1.667533390239847E+02, 8.615877798979446E+01, 2.451727703658123E+06, 6.805914075742205E-06, 2.525645895688434E+02, 2.457546518649728E+02, 2.078567991953342E+07, 2.211456553473810E+07, 5.289517263862032E+07,];
Hermippe.Data = [1.832009956101877E-01, 1.739328450885769E+07, 1.499120702773710E+02, 3.303300217414580E+02, 2.772585352051819E+02, 2.451265520539208E+06, 6.563465610702820E-06, 1.584881708951166E+02, 1.648151772604739E+02, 2.129444871428473E+07, 2.519561291971177E+07, 5.484907232742413E+07,];
Praxidike.Data = [1.815726664289382E-01, 1.673276814638256E+07, 1.431392193102775E+02, 2.813090502076087E+02, 1.825031162158930E+02, 2.451332664630653E+06, 6.976720326531575E-06, 1.279933477082620E+02, 1.422282284831739E+02, 2.044502603960221E+07, 2.415728393282185E+07, 5.160017646557596E+07,];
Thyone.Data = [4.303378953330265E-01, 1.173473871526057E+07, 1.499006365700253E+02, 2.407844045430760E+02, 1.050885044960596E+02, 2.451742029303597E+06, 6.898404794650537E-06, 2.425661660776709E+02, 2.093688997639136E+02, 2.059947224700991E+07, 2.946420577875926E+07, 5.218597787696758E+07,];
Thelxinoe.Data = [1.704904485500956E-01, 1.714612997504327E+07, 1.510010773852318E+02, 1.749227864490172E+02, 3.069698054738581E+02, 2.451688173514136E+06, 6.863027439794568E-06, 2.751030354672765E+02, 2.556492470514618E+02, 2.067020198269381E+07, 2.419427399034435E+07, 5.245498479469520E+07,];
Mneme.Data = [3.092224377203721E-01, 1.414258944599619E+07, 1.479202372876845E+02, 9.440288831125543E-01, 5.015960740749382E+01, 2.451751066820813E+06, 6.962204063461226E-06, 2.360437121773025E+02, 2.125436776140106E+02, 2.047343489172459E+07, 2.680428033745299E+07, 5.170776333450757E+07,];
Orthosie.Data = [3.006382341375379E-01, 1.446809709372961E+07, 1.442930203859766E+02, 2.123485755024724E+02, 2.447229077075412E+02, 2.451272890133983E+06, 6.854385445387449E-06, 1.611486062072238E+02, 1.693190611454722E+02, 2.068757229798996E+07, 2.690704750225031E+07, 5.252111992655102E+07,];
Harpalyke.Data = [2.545619697419709E-01, 1.607709397356625E+07, 1.499618607926302E+02, 3.555675611885468E+01, 1.043158270171146E+02, 2.451732960527739E+06, 6.439302222796836E-06, 2.554270867525166E+02, 2.301279618186926E+02, 2.156731119285832E+07, 2.705752841215039E+07, 5.590667863444965E+07,];
Iocaste.Data = [2.425868246954850E-01, 1.599225855807433E+07, 1.489854924131252E+02, 2.688968381080824E+02, 9.138833988005268E+01, 2.451854867412008E+06, 6.647638510450885E-06, 1.820258028404841E+02, 1.812729061065191E+02, 2.111431260968587E+07, 2.623636666129740E+07, 5.415456924049598E+07,];
Erinome.Data = [3.236929645787949E-01, 1.589545502174266E+07, 1.612309073054151E+02, 3.111703810979389E+02, 3.598607389158599E+02, 2.451722581332119E+06, 5.660297098851172E-06, 2.731539082460054E+02, 2.376807863850398E+02, 2.350331164578665E+07, 3.111116826983065E+07, 6.360090181009518E+07];
Aitne.Data = [3.779759637057411E-01, 1.380649910225723E+07, 1.658042011349707E+02, 3.584020231313339E+02, 7.216177130828193E+01, 2.451318737587908E+06, 6.167628591265918E-06, 1.205714178963996E+02, 1.494054328438149E+02, 2.219608615851918E+07, 3.058567321478113E+07, 5.836927348540443E+07,];
Herse.Data = [3.149532825175883E-01, 1.592211696496003E+07, 1.615790842819059E+02, 2.994612048684575E+02, 3.440637275411368E+02, 2.451297403419666E+06, 5.755882046951112E-06, 1.231318118852577E+02, 1.472746290702369E+02, 2.324238122543639E+07, 3.056264548591275E+07, 6.254471461775208E+07,];
Taygete.Data = [2.922987402695600E-01, 1.572035206600730E+07, 1.620295606792381E+02, 3.007891590863584E+02, 2.076967184456322E+02, 2.451326109633412E+06, 6.160477373666100E-06, 1.165077346188538E+02, 1.414731124133648E+02, 2.221325997355877E+07, 2.870616788111024E+07, 5.843702982156462E+07,];
Eukelade.Data = [2.216430099338705E-01, 1.885337181898832E+07, 1.657839449726300E+02, 2.004361024146182E+02, 2.900894445723009E+02, 2.451814177962400E+06, 5.410252221086240E-06, 2.341738942033248E+02, 2.167324017668812E+02, 2.422201131306924E+07, 2.959065080715017E+07, 6.654033588247781E+07,];
Isonoe.Data = [1.519772577363657E-01, 2.024193036942214E+07, 1.660397188717749E+02, 1.340675958478303E+02, 1.309683806162355E+02, 2.451301412245133E+06, 5.530522646739488E-06, 1.163952801872930E+02, 1.306308579435186E+02, 2.386956075657851E+07, 2.749719114373488E+07, 6.509330546042290E+07,];
Autonoe.Data = [2.156909688538096E-01, 1.949792078764930E+07, 1.502688460518477E+02, 2.647752494035313E+02, 6.119650963684577E+01, 2.451246774580417E+06, 5.203327808067379E-06, 1.340724630635559E+02, 1.488526445945820E+02, 2.485999779851446E+07, 3.022207480937961E+07, 6.918649242929618E+07,];
Philophrosyne.Data = [9.150192461599253E-02, 1.980931905470261E+07, 1.455067990210507E+02, 2.343294468377837E+02, 9.134292161910872E-01, 2.451382570350009E+06, 6.334531687526475E-06, 8.889832208371520E+01, 9.934662116476191E+01, 2.180447002744561E+07, 2.379962100018861E+07, 5.683135198595459E+07,];
Cyllene.Data = [2.803367990136743E-01, 1.680128400763844E+07, 1.414373303087659E+02, 2.536367105247069E+02, 1.745839335421265E+02, 2.451234787313291E+06, 5.717590539387451E-06, 1.532450122035577E+02, 1.641791113673407E+02, 2.334603740279014E+07, 2.989079079794184E+07, 6.296358536345421E+07,];
Sponde.Data = [2.486627049510466E-01, 1.842805907739902E+07, 1.519788120306065E+02, 1.092781675772165E+02, 5.661956413566377E+01, 2.451158255750751E+06, 5.309649367964118E-06, 1.774203573821572E+02, 1.783973201030038E+02, 2.452701230037881E+07, 3.062596552335859E+07, 6.780108723790079E+07,];
Eurydome.Data = [2.204687067810301E-01, 1.783092908123963E+07, 1.460777230014692E+02, 2.976908263069279E+02, 2.234116012433568E+02, 2.451698577781423E+06, 5.895520963089418E-06, 2.817716230215245E+02, 2.564270669019047E+02, 2.287391056183159E+07, 2.791689204242354E+07, 6.106330589847483E+07,];
Kalyke.Data = [3.040670100108448E-01, 1.548283088131479E+07, 1.664427365139854E+02, 3.770062988206185E+01, 2.404616510781123E+02, 2.451799287924297E+06, 6.146224186515192E-06, 2.249645249677259E+02, 2.059245540888566E+02, 2.224758863860738E+07, 2.901234639589997E+07, 5.857254618044027E+07,];
Hegemone.Data = [3.782734956252326E-01, 1.445105546649711E+07, 1.464205100937368E+02, 3.114605884876649E+02, 1.921921246970466E+02, 2.451784019803679E+06, 5.755493089350552E-06, 2.411415220354564E+02, 2.115644286199326E+02, 2.324342836409983E+07, 3.203580126170254E+07, 6.254894140453608E+07,];
Kale.Data = [2.312097373904585E-01, 1.772816143023431E+07, 1.667196833820620E+02, 5.667287818571855E+01, 6.915462521326261E+01, 2.451195324207057E+06, 5.824371664702723E-06, 1.759658498137428E+02, 1.774103155141548E+02, 2.305981526100339E+07, 2.839146909177247E+07, 6.180924239119181E+07,];
Kallichore.Data = [1.620842364758505E-01, 1.854218171523662E+07, 1.657365948651451E+02, 2.390315496028618E+01, 3.526353068037093E+02, 2.451420234149331E+06, 6.195724638002337E-06, 6.678848346954962E+01, 8.501885957930429E+01, 2.212893290997528E+07, 2.571568410471395E+07, 5.810458356910990E+07,];
Chaldene.Data = [2.024082272070767E-01, 1.868002343201094E+07, 1.657257231345439E+02, 1.344540031486334E+02, 2.315517169543574E+02, 2.451717015019402E+06, 5.690333092923004E-06, 2.754297137620194E+02, 2.524101864257558E+02, 2.342053174219588E+07, 2.816104005238082E+07, 6.326518924660623E+07,];
Arche.Data = [2.054707231716769E-01, 1.784647525227682E+07, 1.626574376697230E+02, 3.333463185712573E+02, 1.725347905931215E+02, 2.451480127138512E+06, 6.058554122777829E-06, 3.395828814568444E+01, 5.038785301130858E+01, 2.246169621781347E+07, 2.707691718335013E+07, 5.942011785395112E+07,];
Eirene.Data = [2.387017048169788E-01, 1.704445264652826E+07, 1.660124116763445E+02, 1.800353183845772E+02, 8.639656702056131E+01, 2.451589287333269E+06, 6.088222462414837E-06, 3.367038697450773E+02, 3.220528927761760E+02, 2.238866519782584E+07, 2.773287774912343E+07, 5.913055940751701E+07,];
Kore.Data = [2.476988174634432E-01, 1.779386227151609E+07, 1.372745219139191E+02, 3.241690329014668E+02, 1.352824787388717E+02, 2.451461091590201E+06, 5.606800399464545E-06, 4.064754576206930E+01, 6.403923845284145E+01, 2.365257782995899E+07, 2.951129338840188E+07, 6.420774316032016E+07,];
Megaclite.Data = [4.465722190861291E-01, 1.361828068839258E+07, 1.519630967670178E+02, 2.921578879539736E+02, 3.099382745226546E+02, 2.451290695549823E+06, 5.283732569196597E-06, 1.160936673889649E+02, 1.508377790047026E+02, 2.460715048656362E+07, 3.559602028473465E+07, 6.813365273230299E+07,];
Aoede.Data = [5.975331385285727E-01, 9.253224097189229E+06, 1.564724596530107E+02, 1.564868827506379E+02, 4.306895376318383E+01, 2.451846400578233E+06, 5.850438066628848E-06, 2.076486840405250E+02, 1.887874971797293E+02, 2.299126955039043E+07, 3.672931500359164E+07, 6.153385368754787E+07,];
Callirrhoe.Data = [1.977763763820812E-01, 1.847486935291020E+07, 1.391634602397001E+02, 2.781861639779593E+02, 1.348299058589128E+01, 2.451311110930465E+06, 5.835847334774594E-06, 1.179308940258741E+02, 1.355907591588098E+02, 2.302957530668452E+07, 2.758428126045885E+07, 6.168770006282298E+07,];
s2010j2.Data = [2.055538978395599E-01, 1.678480436297821E+07, 1.468439134474098E+02, 3.572727492655446E+02, 2.882192930877924E+01, 2.451662344008463E+06, 6.641329816056284E-06, 2.926667293509668E+02, 2.692328076321477E+02, 2.112768168580993E+07, 2.547055900864164E+07, 5.420601144211403E+07,];
S2003J16.Data = [3.351192188521096E-01, 1.426673347146413E+07, 1.495316835074277E+02, 5.290753385255679E+00, 5.558406803095556E+01, 2.451655132046149E+06, 6.488759285969107E-06, 2.982568028720589E+02, 2.594379052150750E+02, 2.145758138298595E+07, 2.864842929450777E+07, 5.548056017094698E+07,];
S2003J2.Data = [3.966845086165908E-01, 1.582508224514702E+07, 1.489852121137193E+02, 3.413919523766253E+02, 1.810753442512277E+02, 2.451814876061298E+06, 4.800987415520604E-06, 2.480539760028111E+02, 2.144536362108432E+02, 2.623019377284664E+07, 3.663530530054627E+07, 7.498457480563146E+07,];
S2017J7.Data = [3.362966031604760E-01, 1.387484142916156E+07, 1.482631465953657E+02, 2.649211014269564E+02, 2.887133557073486E+02, 2.451557124684351E+06, 6.747638909502291E-06, 3.529313575004570E+02, 3.449749001389889E+02, 2.090518369384863E+07, 2.793552595853570E+07, 5.335199539101505E+07,];
S2017J3.Data = [2.127264438792761E-01, 1.694757253014131E+07, 1.495743121077244E+02, 2.792445260237162E+01, 1.057229502279855E+02, 2.451768378452967E+06, 6.457435251966712E-06, 2.353721561235786E+02, 2.182109541438947E+02, 2.152691703967572E+07, 2.610626154921014E+07, 5.574968791059212E+07,];
S2016J1.Data = [3.871996414188415E-01, 1.247115922336875E+07, 1.450261740044535E+02, 2.477135746752629E+02, 2.984322779282052E+02, 2.451782576853927E+06, 7.025077116887351E-06, 2.157987697898314E+02, 1.974847920573653E+02, 2.035109648474054E+07, 2.823103374611232E+07, 5.124498905992191E+07,];
S2017J9.Data = [2.942631961018022E-01, 1.495737011376062E+07, 1.561113705508843E+02, 2.453201020744828E+02, 2.764109610043758E+02, 2.451749532440266E+06, 6.610192469929130E-06, 2.431873039820919E+02, 2.181846909706524E+02, 2.119397774232874E+07, 2.743058537089686E+07, 5.446134914190474E+07,];
S2003J12.Data = [3.461201468801754E-01, 1.146686555248075E+07, 1.448547394225092E+02, 6.118657087734234E+01, 4.848916188133226E+00, 2.451482451652879E+06, 8.782389006576212E-06, 4.746158635398323E+01, 8.541693894645663E+01, 1.753665523990295E+07, 2.360644492732516E+07, 4.099112436609602E+07,];
S2003J4.Data = [3.636495184096096E-01, 1.456565263095500E+07, 1.431601709196745E+02, 1.702142251287012E+02, 2.104761753727389E+02, 2.451783857181187E+06, 5.889554689475920E-06, 2.384557259116920E+02, 2.108483583252952E+02, 2.288935586966475E+07, 3.121305910837451E+07, 6.112516463142555E+07,];
S2017J2.Data = [1.960402537906551E-01, 1.773315172947185E+07, 1.644410021217995E+02, 3.594426200364017E+02, 1.530440307806716E+02, 2.451697252746383E+06, 6.225946401265408E-06, 2.780999333201254E+02, 2.556553845059398E+02, 2.205726320637735E+07, 2.638137468328285E+07, 5.782253440646886E+07,];
S2017J6.Data = [3.463384507332515E-01, 1.472990949433229E+07, 1.424522410300490E+02, 3.129851519743552E+02, 1.557546022808505E+01, 2.451269346203742E+06, 6.029233544973689E-06, 1.435951683533813E+02, 1.607895292954494E+02, 2.253445917211394E+07, 3.033900884989559E+07, 5.970908197777749E+07,];
S2003J19.Data = [1.591934302889368E-01, 1.991216114274217E+07, 1.651149231929306E+02, 2.189319426599200E+01, 1.868163135966464E+02, 2.451882351186057E+06, 5.596279068839636E-06, 1.968844566490109E+02, 1.924419216360134E+02, 2.368221403120677E+07, 2.745226691967137E+07, 6.432845745747352E+07,];
S2010J1.Data = [3.212073334717758E-01, 1.522591665652861E+07, 1.608351188973424E+02, 2.847273310681967E+02, 1.755913054364846E+02, 2.451881654908172E+06, 6.071043660196827E-06, 1.834116497914309E+02, 1.818511774317943E+02, 2.243087971825564E+07, 2.963584277998267E+07, 5.929787696310663E+07,];
S2017J8.Data = [2.594701463746374E-01, 1.654313756632760E+07, 1.651157177072344E+02, 9.706285606783175E+01, 3.311372379410369E+02, 2.451555899718937E+06, 6.108292861976386E-06, 3.542476024472977E+02, 3.498911821461693E+02, 2.233959574396423E+07, 2.813605392160086E+07, 5.893627043342503E+07,];
S2017J5.Data = [3.390528363864901E-01, 1.567618437816975E+07, 1.669585372633496E+02, 4.234188778826542E+01, 2.924846791499041E+02, 2.451401440124493E+06, 5.583703984269745E-06, 6.925788134080489E+01, 1.085715562274563E+02, 2.371775724471742E+07, 3.175933011126509E+07, 6.447333186253820E+07,];
S2011J1.Data = [1.788173376430791E-01, 1.890653280402495E+07, 1.641667156105937E+02, 2.535387323657784E+02, 5.038846806099090E+01, 2.451811842048345E+06, 5.838141735970554E-06, 2.254007491755772E+02, 2.128955218091364E+02, 2.302354113244462E+07, 2.714054946086428E+07, 6.166345667525187E+07,];
S2017J1.Data = [2.935378274679145E-01, 1.599569381014018E+07, 1.453935742518686E+02, 2.518362256871901E+02, 7.468692074101440E+01, 2.451757676702600E+06, 5.986342508319024E-06, 2.499993574294764E+02, 2.229436221118796E+02, 2.264196786759123E+07, 2.928824192504229E+07, 6.013688650452589E+07,];
S2011J2.Data = [5.104619833328713E-01, 1.170616955936796E+07, 1.571647088807603E+02, 2.484956103209191E+01, 2.629445003868069E+02, 2.451676026830884E+06, 5.515567911956837E-06, 2.975598100200330E+02, 2.378756919402144E+02, 2.391268739262759E+07, 3.611920522588721E+07, 6.526979737110656E+07,];
S2003J9.Data = [2.855867104604167E-01, 1.617973349166331E+07, 1.670674233352198E+02, 4.630517062478196E+01, 2.884333266649022E+02, 2.451545553653071E+06, 5.984116741466728E-06, 3.597137460336848E+02, 3.594625041902266E+02, 2.264758190891245E+07, 2.911543032616159E+07, 6.015925416451063E+07,];
S2003J23.Data = [5.564649857482485E-01, 1.032270872655183E+07, 1.502810171364110E+02, 3.092780854561036E+01, 2.565770741278337E+02, 2.451261705395113E+06, 5.744261094212670E-06, 1.406002904974934E+02, 1.661611438390302E+02, 2.327371773334819E+07, 3.622472674014455E+07, 6.267124597847741E+07,];
//saturnian
titan.Data = [2.860860206160348E-02, 1.186682822516045E+06, 2.771834190316363E+01, 1.692390642831065E+02, 1.643968697993720E+02, 2.451537759693921E+06, 2.612822262488788E-04, 1.634483483418236E+02, 1.643512412544440E+02, 1.221632006454418E+06, 1.256581190392791E+06, 1.377820470869265E+06,];
titan.Physical = [2574730, 2574730, 1377648, 200000, 1, 1, 1, 1];
mimas.Data = [2.304473761249852E-02, 1.823438103802271E+05, 2.700141243981482E+01, 1.720548757968890E+02, 1.110439871994092E+02, 2.451544907235838E+06, 4.376733247254765E-03, 3.507874496770435E+01, 3.663279069619451E+01, 1.866449953241584E+05, 1.909461802680897E+05, 8.225312799810320E+04,];
mimas.Physical = [415600, 381200, 81388.8, 0];
enceladus.Data = [7.576534808766119E-03, 2.371994030325412E+05, 2.805193636833910E+01, 1.695063412907003E+02, 1.352939183319798E+02, 2.451544972664756E+06, 3.020297131357134E-03, 7.133232195695123E+00, 7.242065840576029E+00, 2.390102726831780E+05, 2.408211423338148E+05, 1.191935708121003E+05,];
enceladus.Physical = [513200, 496600, 118386.8352, 0];
tethys.Data = [1.954303609162559E-03, 2.949974654497377E+05, 2.722147977072407E+01, 1.679998444428707E+02, 1.510372804535287E+02, 2.451545013715012E+06, 2.196201328182125E-03, 3.573975517672912E+02, 3.573873584437072E+02, 2.955751089519411E+05, 2.961527524541445E+05, 1.639193981810333E+05,];
tethys.Physical = [1076800, 1052600, 163106.0928, 0];
dione.Data = [3.577529612822393E-03, 3.768872222585009E+05, 2.804139561820995E+01, 1.694700229134415E+02, 1.566579806167861E+02, 2.451545150088652E+06, 1.517125605514203E-03, 3.403264316600694E+02, 3.401878325525950E+02, 3.782403884489425E+05, 3.795935546393840E+05, 2.372908338581394E+05,];
dione.Physical = [1128800, 1119200, 236469.456, 0];
rhea.Data = [1.596367385249582E-03, 5.256958712073325E+05, 2.824148381640104E+01, 1.689841969292857E+02, 1.894781476671703E+02, 2.451547215381105E+06, 9.236966773538825E-04, 1.831962096434149E+02, 1.831860305675661E+02, 5.265364167702105E+05, 5.273769623330885E+05, 3.897383295036780E+05,];
rhea.Physical = [1532400, 1524400, 390373.5168, 0];
iapetus.Data = [2.834292338060079E-02, 3.460251400491733E+06, 1.723868500014220E+01, 1.396824729280104E+02, 2.294755520845618E+02, 2.451578445369126E+06, 5.251466788445084E-05, 2.082494201521136E+02, 2.067589183927645E+02, 3.561185817254252E+06, 3.662120234016771E+06, 6.855227586930870E+06,];
iapetus.Physical = [1492000, 1424000, 6853377.6, 0];
//minor
pan.Data = [6.712717068562199E-03, 1.337751571432399E+05, 2.805112331826122E+01, 1.695265420397804E+02, 9.361187367473997E+01, 2.451544979051046E+06, 7.140419924287924E-03, 1.292408622050138E+01, 1.309754792042570E+01, 1.346792206464540E+05, 1.355832841496681E+05, 5.041720288403078E+04,];
daphnis.Data = [6.603627384158156E-03, 1.367257819444895E+05, 2.805215459279434E+01, 1.695309003389035E+02, 1.022786033356686E+02, 2.451544981148444E+06, 6.911668115993517E-03, 1.125754844013145E+01, 1.140648010423245E+01, 1.376346700204460E+05, 1.385435580964026E+05, 5.208583426726818E+04,];
atlas.Data = [2.696313465023390E-03, 1.372932276369656E+05, 2.804826531240664E+01, 1.695258338157791E+02, 3.559179145734119E+02, 2.451545038323409E+06, 6.909428215057042E-03, 3.371218981109667E+02, 3.370014033887064E+02, 1.376644140502238E+05, 1.380356004634820E+05, 5.210271947184966E+04,];
prometheus.Data = [5.723756964036757E-03, 1.391368490967130E+05, 2.805162961284825E+01, 1.695106684012418E+02, 7.961000579380566E+00, 2.451544918209711E+06, 6.741739891870172E-03, 4.764172497392980E+01, 4.812873690861796E+01, 1.399378191636833E+05, 1.407387892306535E+05, 5.339867834920806E+04,];
pandora.Data = [2.360501546055965E-03, 1.414564775393787E+05, 2.803633642040110E+01, 1.696294332376278E+02, 2.060164085971644E+02, 2.451544840001313E+06, 6.609990556567398E-03, 9.137575961175590E+01, 9.164615503146386E+01, 1.417911758291405E+05, 1.421258741189023E+05, 5.446301275609536E+04,];
epimetheus.Data = [5.687315093488552E-03, 1.512559393658286E+05, 2.773793441284173E+01, 1.698739498970633E+02, 2.485786534395985E+02, 2.451545350104393E+06, 5.948267057670003E-03, 1.800707534869398E+02, 1.800699543749928E+02, 1.521210999938618E+05, 1.529862606218950E+05, 6.052182871241421E+04,];
janus.Data = [4.237519014549596E-03, 1.513130907255145E+05, 2.798454463513117E+01, 1.698490401494235E+02, 1.631998335868149E+02, 2.451544843513110E+06, 5.957904359628595E-03, 8.055365118366990E+01, 8.103306160940055E+01, 1.519570114509320E+05, 1.526009321763495E+05, 6.042393067592675E+04,];
aegaeon.Data = [3.642395960304136E-03, 1.674181562683379E+05, 2.805003572224044E+01, 1.695280950830151E+02, 3.501437991110798E+01, 2.451544932816205E+06, 5.123817730142263E-03, 2.974212173686679E+01, 2.995000787164584E+01, 1.680301887490466E+05, 1.686422212297553E+05, 7.026011051919378E+04,];
methone.Data = [4.619552822850308E-03, 1.943855845706815E+05, 2.805424432997450E+01, 1.694888939311487E+02, 1.393906160003787E+02, 2.451544968757169E+06, 4.089424745963520E-03, 1.103891368223466E+01, 1.114085112157678E+01, 1.952877265390831E+05, 1.961898685074848E+05, 8.803194149870079E+04,];
anthe.Data = [1.809167269303736E-03, 1.977521924363077E+05, 2.804622779208723E+01, 1.694889550383712E+02, 2.926857470757188E+02, 2.451545163261569E+06, 4.002331434609694E-03, 3.035439149367962E+02, 3.033709094831103E+02, 1.981106076633942E+05, 1.984690228904807E+05, 8.994757327865004E+04,];
pallene.Data = [6.869932973837476E-03, 2.116101285595725E+05, 2.803387560637843E+01, 1.691396541813085E+02, 9.206244636799512E+01, 2.451544969754376E+06, 3.588220838289566E-03, 9.376817490794789E+00, 9.506174881785737E+00, 2.130739321922050E+05, 2.145377358248374E+05, 1.003282730423038E+05,];
telesto.Data = [1.784934787004983E-03, 2.947630703584148E+05, 2.688455150327974E+01, 1.691071359844098E+02, 2.376345833573609E+02, 2.451545163549430E+06, 2.199384791236813E-03, 3.289212176472856E+02, 3.288154295048379E+02, 2.952901440087156E+05, 2.958172176590165E+05, 1.636821357655909E+05,];
calypso.Data = [1.338958809458797E-03, 2.947803636778906E+05, 2.819811130667535E+01, 1.663571396595821E+02, 4.418787237422819E+01, 2.451544753448131E+06, 2.200665228344218E-03, 4.687875007725596E+01, 4.699087064555953E+01, 2.951755916366497E+05, 2.955708195954087E+05, 1.635868987991710E+05,];
helene.Data = [8.455305049386470E-03, 3.751112399566973E+05, 2.793441695583316E+01, 1.699069784771010E+02, 1.734038348683448E+02, 2.451544879404299E+06, 1.516711471035339E-03, 1.580332743607993E+01, 1.606990462638026E+01, 3.783099661234946E+05, 3.815086922902919E+05, 2.373556255589314E+05,];
polydeuces.Data = [1.961299133674312E-02, 3.698378668929072E+05, 2.820518010127640E+01, 1.697005651979319E+02, 3.396261935809271E+02, 2.451544445290749E+06, 1.523189380462480E-03, 7.300171351931274E+01, 7.516600785974074E+01, 3.772366051618490E+05, 3.846353434307908E+05, 2.363461855877006E+05,];
hyperion.Data = [1.266528368757191E-01, 1.296055441450031E+06, 2.720899193968524E+01, 1.683048377454233E+02, 1.884202232843438E+02, 2.451540798647647E+06, 1.952179014118627E-04, 7.086348196123733E+01, 8.517252351153753E+01, 1.484009447988093E+06, 1.671963454526155E+06, 1.844093176887947E+06,];
kiviuq.Data = [1.575213320242716E-01, 9.527368609332943E+06, 4.877542787187471E+01, 3.526838883905332E+02, 9.175253987683520E+01, 2.451334751215999E+06, 9.280119366089134E-06, 1.685779613659436E+02, 1.715702600423936E+02, 1.130873572410432E+07, 1.309010283887570E+07, 3.879260446966779E+07,];
ijiraq.Data = [3.682778532937338E-01, 7.160701369921560E+06, 4.960657064794191E+01, 1.525201357561276E+02, 6.864072078024550E+01, 2.451509549552643E+06, 9.247630216769597E-06, 2.832473907441206E+01, 5.970709785476150E+01, 1.133520711163399E+07, 1.550971285334643E+07, 3.892889222010393E+07,];
phoebe.Data = [1.649297297054299E-01, 1.081172221159114E+07, 1.732628665852495E+02, 2.633092955513196E+02, 3.540381942736723E+02, 2.451455591194291E+06, 7.575596784138765E-06, 5.852088527090361E+01, 7.628059466251625E+01, 1.294708073822017E+07, 1.508243926484920E+07, 4.752100860934704E+07,];
paaliaq.Data = [4.651030230171061E-01, 7.972397736456208E+06, 4.733841570275851E+01, 3.531498156033144E+02, 2.375805314178804E+02, 2.451649645988657E+06, 6.133331301755405E-06, 3.045460160594416E+02, 2.497642052608042E+02, 1.490454812705207E+07, 2.183669851764793E+07, 5.869567161600504E+07,];
skathi.Data = [2.249650989072480E-01, 1.199415545243819E+07, 1.478504049436299E+02, 2.840842912927094E+02, 2.022766379344091E+02, 2.451310337747099E+06, 5.796982976110337E-06, 1.175327785613802E+02, 1.373587542499394E+02, 1.547563269154352E+07, 1.895710993064885E+07, 6.210126914009898E+07,];
albiorix.Data = [4.909251194594990E-01, 8.337804577472096E+06, 3.708704266943491E+01, 1.111219238546944E+02, 6.279615752588488E+01, 2.451507515504713E+06, 5.324386569241625E-06, 1.724387989779597E+01, 5.265753572688751E+01, 1.637834608657096E+07, 2.441888759566983E+07, 6.761342275177372E+07,];
bebhionn.Data = [3.769196937640281E-01, 1.072091946099765E+07, 4.335707934557929E+01, 1.976856855944249E+02, 5.047460104440455E+00, 2.451161515795193E+06, 4.944730561275605E-06, 1.638339322126266E+02, 1.720716420548078E+02, 1.720632052353368E+07, 2.369172158606970E+07, 7.280477581919648E+07,];
skoll.Data = [4.569314995243285E-01, 9.591445433342045E+06, 1.532474663174113E+02, 2.940527423471083E+02, 1.861210880488155E+02, 2.451425286990551E+06, 4.754780514122380E-06, 4.917966491086403E+01, 1.023722287533202E+02, 1.766157570350875E+07, 2.573170597367545E+07, 7.571327402616131E+07,];
erriapus.Data = [6.174421213982955E-01, 6.593227839134062E+06, 3.431597540496436E+01, 1.462152108090455E+02, 2.797975048092239E+02, 2.451669956278070E+06, 4.932569863246399E-06, 3.067468786281180E+02, 2.329643511559400E+02, 1.723458908553420E+07, 2.787595033193434E+07, 7.298426783215675E+07,];
tarqeq.Data = [1.028368419636962E-01, 1.584965306154207E+07, 5.036105180247366E+01, 9.333893156730728E+01, 7.213030514209591E+01, 2.451253952656201E+06, 4.752828582708626E-06, 1.195169588234121E+02, 1.291149369232886E+02, 1.766641097504887E+07, 1.948316888855568E+07, 7.574436858710289E+07,];
siarnaq.Data = [3.894000879078293E-01, 1.073298806034013E+07, 4.849903069444348E+01, 6.396930832953878E+01, 6.837962489346739E+01, 2.451954225865508E+06, 4.788822960956703E-06, 1.906810369086253E+02, 1.851048422222372E+02, 1.757777531209335E+07, 2.442256256384657E+07, 7.517504884500466E+07,];
tarvos.Data = [6.453483996362130E-01, 6.590835767915341E+06, 3.389681618505585E+01, 9.568936877346970E+01, 2.829148695157511E+02, 2.451818459029560E+06, 4.405211822085078E-06, 2.559186763308987E+02, 2.035222797536249E+02, 1.858397300662039E+07, 3.057711024532544E+07, 8.172138243050581E+07,];
hyrrokkin.Data = [4.628347107388370E-01, 9.969165393565081E+06, 1.547867443863258E+02, 4.015532401121413E+01, 2.648104764265898E+02, 2.451714964981592E+06, 4.414162891242171E-06, 2.951781309025241E+02, 2.412543617520364E+02, 1.855884137129754E+07, 2.714851734903000E+07, 8.155566726235920E+07,];
greip.Data = [3.018329381838972E-01, 1.279602480604821E+07, 1.724894141686400E+02, 3.358189367274598E+02, 1.461557168069919E+02, 2.451679646657664E+06, 4.497809616987575E-06, 3.076748612580620E+02, 2.742715980248414E+02, 1.832802706670611E+07, 2.386002932736401E+07, 8.003895910585725E+07,];
mundilfari.Data = [2.480057310272596E-01, 1.406840149137527E+07, 1.695001361866875E+02, 7.917123528815630E+01, 3.054176052282677E+02, 2.451286679330725E+06, 4.361434054828117E-06, 9.734243593337722E+01, 1.235198226463304E+02, 1.870812328210077E+07, 2.334784507282627E+07, 8.254165842573711E+07,];
suttungr.Data = [1.207926230631422E-01, 1.721766306639414E+07, 1.747014240709576E+02, 2.532051471582964E+02, 6.502219480330336E+01, 2.451666271855765E+06, 4.072399006313610E-06, 3.173298579435716E+02, 3.068429199878374E+02, 1.958316492564036E+07, 2.194866678488658E+07, 8.839998228117554E+07,];
jarnsaxa.Data = [2.847102132883066E-01, 1.358248804214337E+07, 1.632884030269123E+02, 9.240801303494951E+00, 2.291200805951902E+02, 2.451994191255654E+06, 4.265094754155627E-06, 1.944711416358861E+02, 1.884290523679995E+02, 1.898879068941323E+07, 2.439509333668309E+07, 8.440609664046495E+07,];
narvi.Data = [2.691366319649807E-01, 1.424733680128303E+07, 1.388140796628574E+02, 1.789905313781262E+02, 1.779378302851398E+02, 2.451236165296359E+06, 4.100420545993472E-06, 1.094128269804767E+02, 1.347333309627831E+02, 1.949384443714571E+07, 2.474035207300838E+07, 8.779587263354160E+07,];
bergelmir.Data = [1.202452511252318E-01, 1.674893831953999E+07, 1.592450010970142E+02, 2.078542011535027E+02, 1.339200462906937E+02, 2.451677186252468E+06, 4.248505158531126E-06, 3.114782805171756E+02, 3.000954543194901E+02, 1.903819029219492E+07, 2.132744226484985E+07, 8.473568621591744E+07,];
hati.Data = [4.277983937125878E-01, 1.110889481677170E+07, 1.604997549417833E+02, 3.163179050406656E+02, 1.033983267011186E+01, 2.452040803790364E+06, 4.125646106000136E-06, 1.832678515821877E+02, 1.814491246663206E+02, 1.941430204792503E+07, 2.771970927907836E+07, 8.725905973283404E+07,];
farbauti.Data = [2.446935721559041E-01, 1.543155357480317E+07, 1.564481200832253E+02, 1.380480562884841E+02, 3.435883627763340E+02, 2.451772680077478E+06, 3.821597459699335E-06, 2.848232212663681E+02, 2.566178508566185E+02, 2.043085164633131E+07, 2.543014971785946E+07, 9.420144423801325E+07,];
thrymr.Data = [5.062131971490385E-01, 1.004822355591358E+07, 1.749755648584873E+02, 2.473033994170259E+02, 9.215058567936927E+01, 2.451572390057549E+06, 3.844589094710254E-06, 3.509017761696338E+02, 3.288795779319728E+02, 2.034931573281922E+07, 3.065040790972485E+07, 9.363809528964271E+07,];
bestla.Data = [6.187886370001020E-01, 7.679758608699575E+06, 1.462687793163751E+02, 2.829589688817845E+02, 8.562447853868427E+01, 2.451903793358895E+06, 3.903031416281426E-06, 2.390070166514036E+02, 1.986816455603410E+02, 2.014567075929903E+07, 3.261158290989848E+07, 9.223599853648794E+07,];
aegir.Data = [2.849856291463987E-01, 1.484682425783107E+07, 1.678610022002063E+02, 1.819748248180825E+02, 2.448870725298164E+02, 2.451463127016240E+06, 3.729893652257326E-06, 2.638461793690805E+01, 4.704520880762635E+01, 2.076437182669011E+07, 2.668191939554914E+07, 9.651749716298977E+07,];
kari.Data = [4.700686438235694E-01, 1.188835521151059E+07, 1.464927747530625E+02, 2.882794674057113E+02, 1.602564609655086E+02, 2.451755631522047E+06, 3.321401764869468E-06, 2.995552590568290E+02, 2.443270380097426E+02, 2.243376443561981E+07, 3.297917365972904E+07, 1.083879715509659E+08,];
loge.Data = [1.922517225743283E-01, 1.835139264561591E+07, 1.652610348764271E+02, 3.329792452388200E+02, 2.055230625544651E+01, 2.451623237990098E+06, 3.259006034455813E-06, 3.379698937280098E+02, 3.274345120002462E+02, 2.271919750061564E+07, 2.708700235561538E+07, 1.104631277738989E+08,];
fenrir.Data = [1.930611442795672E-01, 1.763915874760109E+07, 1.646058258606839E+02, 2.346374875897848E+02, 1.145675990498817E+02, 2.451049445421992E+06, 3.453176557986996E-06, 1.478509158510870E+02, 1.575710737403243E+02, 2.185934984113870E+07, 2.607954093467631E+07, 1.042518370997686E+08,];
ymir.Data = [3.960091579772068E-01, 1.351059116377516E+07, 1.729349852633039E+02, 2.044500260871613E+02, 4.524894052817844E+01, 2.452042955855609E+06, 3.335866386149641E-06, 2.164797330757575E+02, 1.975361603652504E+02, 2.236886757840163E+07, 3.122714399302810E+07, 1.079179914083798E+08,];
surtur.Data = [5.452085578529339E-01, 1.009628426328528E+07, 1.678936151443407E+02, 2.553207942358422E+02, 3.143644664066916E+02, 2.450992933442802E+06, 3.374043801908703E-06, 1.609369988159069E+02, 1.732702613578276E+02, 2.219981144680474E+07, 3.430333863032420E+07, 1.066968958127773E+08,];
S2004S37.Data = [4.294357557677049E-01, 9.195465193514809E+06, 1.634296454529256E+02, 1.353313950824093E+02, 7.237384571679158E+01, 2.451913589102973E+06, 5.454700575179999E-06, 1.862890682119803E+02, 1.827813023873190E+02, 1.611644137618101E+07, 2.303741755884722E+07, 6.599812309369893E+07,];
S2007S2.Data = [2.127267865815588E-01, 1.259066262341636E+07, 1.763528471916563E+02, 1.074085999578736E+02, 4.636399588488348E+01, 2.451523327782228E+06, 5.518105218981830E-06, 1.033253953883833E+01, 1.621313803374808E+01, 1.599274865296902E+07, 1.939483468252167E+07, 6.523978534545327E+07,];
s2004S29.Data = [4.777949358569508E-01, 8.802863086547330E+06, 3.871803653592818E+01, 1.579053946757096E+02, 3.094738694254421E+02, 2.451908261560811E+06, 5.099180001878924E-06, 1.999581621404827E+02, 1.880767343519963E+02, 1.685710019107731E+07, 2.491133729560728E+07, 7.059958657418422E+07,];
S2004S31.Data = [1.755833730813019E-01, 1.457864263348480E+07, 4.917793836836329E+01, 8.246709944142803E+01, 2.538417573800230E+02, 2.451784332853464E+06, 4.745905898662248E-06, 2.618624562337176E+02, 2.428960141956430E+02, 1.768358637788913E+07, 2.078853012229347E+07, 7.585485420211871E+07,];
S2004S13.Data = [2.211035805027446E-01, 1.422059656617347E+07, 1.685516910078155E+02, 2.177970083250661E+02, 3.553861705489860E+02, 2.451412241376294E+06, 4.523946730609693E-06, 5.189123016068051E+01, 7.521210389879793E+01, 1.825736543422842E+07, 2.229413430228338E+07, 7.957653381817843E+07,];
S2006S1.Data = [7.748656168185275E-02, 1.735722480339045E+07, 1.539473696047010E+02, 3.335486638151999E+02, 1.596854601569250E+02, 2.451314122268471E+06, 4.324274597648367E-06, 8.625992051056011E+01, 9.514091882338724E+01, 1.881514575552932E+07, 2.027306670766819E+07, 8.325095732721870E+07,];
S2007S3.Data = [2.107134339309933E-01, 1.502799738216796E+07, 1.768289850316570E+02, 9.085223114610523E+01, 2.894623570088095E+02, 2.451733550430378E+06, 4.247907443442082E-06, 2.907983712959577E+02, 2.666507194537546E+02, 1.903997613568159E+07, 2.305195488919522E+07, 8.474760921539564E+07,];
S2004S20.Data = [1.604941476453811E-01, 1.616229225194052E+07, 1.622195284764375E+02, 3.308055524797003E+02, 2.714650287108045E+02, 2.451161016251897E+06, 4.177878480213348E-06, 1.386061146389302E+02, 1.491118941028664E+02, 1.925214959086830E+07, 2.234200692979608E+07, 8.616813574281275E+07,];
S2004S17.Data = [1.644599346762835E-01, 1.608413048976672E+07, 1.676580344781545E+02, 1.210285099367542E+01, 1.854684648562999E+02, 2.451959538786717E+06, 4.178584441411583E-06, 2.103391879599725E+02, 2.022866185996225E+02, 1.924998112871485E+07, 2.241583176766299E+07, 8.615357785575517E+07,];
S2004S12.Data = [3.000100649451122E-01, 1.383499422382064E+07, 1.630778293163058E+02, 3.061699348429403E+02, 8.619077745644677E+01, 2.451516343066927E+06, 4.016463873257274E-06, 9.944599945632783E+00, 1.919408319526032E+01, 1.976456164721256E+07, 2.569412907060448E+07, 8.963108130935259E+07,];
S2004S27.Data = [1.719697911881322E-01, 1.667370616075144E+07, 1.672852718688478E+02, 8.448098510682466E+01, 1.301366322626489E+02, 2.451780205591437E+06, 3.905671399402401E-06, 2.806298710743168E+02, 2.608645789974552E+02, 2.013659161623629E+07, 2.359947707172114E+07, 9.217365292305003E+07,];
S2004S7.Data = [4.398071323770413E-01, 1.124523348241741E+07, 1.644873550428887E+02, 3.238124872613150E+02, 6.943310858853270E+01, 2.451368215319853E+06, 3.923993615529848E-06, 5.993584901739380E+01, 1.115506408528115E+02, 2.007386050831708E+07, 2.890248753421675E+07, 9.174326853520887E+07,];
S2004S30.Data = [9.430480291246267E-02, 1.878911983246205E+07, 1.577123217235634E+02, 2.587373328891385E+02, 2.635799778193323E+02, 2.451578545257062E+06, 3.734978340587166E-06, 3.491748741407726E+02, 3.468817498434692E+02, 2.074552221639533E+07, 2.270192460032861E+07, 9.638610111549009E+07,];
S2004S22.Data = [1.905658706236386E-01, 1.697933765922432E+07, 1.775299218679581E+02, 2.790028612807187E+02, 1.039882617494236E+02, 2.451225516797719E+06, 3.673379482066430E-06, 1.013975746668668E+02, 1.214276299462491E+02, 2.097679977036088E+07, 2.497426188149745E+07, 9.800239854268606E+07,];
S2004S25.Data = [6.185714076509522E-01, 7.863827347794242E+06, 1.742259646989078E+02, 2.604650708038644E+02, 3.072681546798674E+02, 2.452004635602165E+06, 3.770019164797939E-06, 2.102830534954755E+02, 1.892086149486369E+02, 2.061677468740467E+07, 3.336972202701510E+07, 9.549023075570886E+07,];
S2004S32.Data = [2.237913410269928E-01, 1.647571182205715E+07, 1.567416749319499E+02, 2.933167144806683E+02, 2.491216560865521E+01, 2.450973832986035E+06, 3.608910312068680E-06, 1.780955014993416E+02, 1.787605519083522E+02, 2.122587996358605E+07, 2.597604810511495E+07, 9.975310242432785E+07,];
S2004S23.Data = [4.787231538093490E-01, 1.115375651184703E+07, 1.779964463706921E+02, 1.777715083476712E+02, 6.817838335252945E+01, 2.451335992176884E+06, 3.565706217620962E-06, 6.439050671765804E+01, 1.201755484124860E+02, 2.139699200790451E+07, 3.164022750396200E+07, 1.009617669063583E+08,];
S2006S3.Data = [3.105093806832563E-01, 1.508686206387075E+07, 1.550948628071768E+02, 2.133046298318045E+02, 1.916721835737982E+02, 2.451124626276705E+06, 3.448012314960021E-06, 1.252328061433228E+02, 1.483394763400470E+02, 2.188117088354472E+07, 2.867547970321868E+07, 1.044079797621529E+08,];
S2004S35.Data = [2.587810060641924E-01, 1.638965719402456E+07, 1.760369464884057E+02, 3.219209635246294E+02, 1.880337116746649E+02, 2.451678341738567E+06, 3.394217354200331E-06, 3.208961511576141E+02, 2.967869519922014E+02, 2.211176093450725E+07, 2.783386467498995E+07, 1.060627421383317E+08,];
S2004S28.Data = [1.908563292755361E-01, 1.770534412355627E+07, 1.699057143384543E+02, 1.287669096141132E+02, 1.923675506029168E+02, 2.451228800638979E+06, 3.447914983720939E-06, 9.419574367059572E+01, 1.151574135153189E+02, 2.188158267085480E+07, 2.605782121815332E+07, 1.044109270964371E+08,];
S2004S38.Data = [5.745981499001378E-01, 9.465001027174566E+06, 1.504813607103319E+02, 1.279238116696183E+02, 3.495926215633852E+02, 2.451207471485405E+06, 3.362735497547683E-06, 9.806565174889970E+01, 1.497348441573662E+02, 2.224955304014939E+07, 3.503410505312422E+07, 1.070556992253879E+08,];
S2004S33.Data = [6.464887279444885E-01, 8.168695278551814E+06, 1.630123664645916E+02, 7.306853372951382E+01, 3.032289155849410E+02, 2.451104612009726E+06, 3.177243507830864E-06, 1.208925978933127E+02, 1.624353028822009E+02, 2.310731205558021E+07, 3.804592883260860E+07, 1.133057630341263E+08,];
s2004S24.Data = [7.895141555992147E-02, 2.121243513976300E+07, 3.561763452021295E+01, 3.540085911958804E+02, 3.383707367980181E+02, 2.451102308319577E+06, 3.193101053294263E-06, 1.221315210180247E+02, 1.293908057774753E+02, 2.303074506396252E+07, 2.484905498816203E+07, 1.127430651242919E+08,];
S2004S21.Data = [3.805729109477934E-01, 1.419857924301382E+07, 1.512464600615558E+02, 1.123475071926074E+02, 1.748446674813663E+02, 2.452130839788892E+06, 3.215826442218961E-06, 1.972259351404809E+02, 1.883943856832773E+02, 2.292211544176934E+07, 3.164565164052486E+07, 1.119463399124225E+08,];
S2004S39.Data = [1.191402330787477E-01, 2.084640204247736E+07, 1.675388653328647E+02, 1.689004035508382E+02, 2.232027425564597E+02, 2.451227683401004E+06, 3.065406982234086E-06, 8.404167036733988E+01, 9.770265540390004E+01, 2.366597138990570E+07, 2.648554073733404E+07, 1.174395445976410E+08,];
S2004S36.Data = [5.435811670152046E-01, 1.106410553042664E+07, 1.510975322695972E+02, 2.127034672382917E+02, 2.134216353009755E+02, 2.451024039013501E+06, 2.956960445481527E-06, 1.330958330538853E+02, 1.629020224535225E+02, 2.424112400899814E+07, 3.741814248756965E+07, 1.217466403888185E+08,];
S2004S34.Data = [2.999423250363349E-01, 1.704154382175791E+07, 1.646785045809976E+02, 2.925755820073249E+02, 3.545080685297082E+02, 2.451446359523126E+06, 2.938407158975642E-06, 2.504268432667726E+01, 4.633378951385934E+01, 2.434305690976448E+07, 3.164456999777105E+07, 1.225153562876220E+08,];
S2004S26.Data = [8.951627947904037E-02, 2.468263567517360E+07, 1.707180637524469E+02, 3.287940921214837E+02, 1.486667847415337E+02, 2.450938667945715E+06, 2.500320163121291E-06, 1.309844961397018E+02, 1.381785138827529E+02, 2.710936518562980E+07, 2.953609469608600E+07, 1.439815609656132E+08,];
//uranian
miranda.Data = [1.405189138844540E-03, 1.296093692405031E+05, 9.726814146449929E+01, 1.720664629581106E+02, 2.469897730782105E+02, 2.451544701489224E+06, 2.949587699252751E-03, 7.607379284636502E+01, 7.623014853858562E+01, 1.297917511996003E+05, 1.299741331586976E+05, 1.220509565086681E+05,];
miranda.Physical = [480000, 465800, 122124.5856, 0];
ariel.Data = [1.493344492955641E-03, 1.906618585105856E+05, 9.772131216656105E+01, 1.676168026006061E+02, 3.908319467927523E+01, 2.451543886328601E+06, 1.652927354254095E-03, 1.590466681765714E+02, 1.591077571173614E+02, 1.909470081736882E+05, 1.912321578367907E+05, 2.177954155537917E+05,];
ariel.Physical = [578900, 578900, 217728, 0];
oberon.Data = [5.304283235255597E-04, 5.831884917397785E+05, 9.787785464847839E+01, 1.677563122950081E+02, 2.468126714557775E+02, 2.451541233109328E+06, 3.094213673479288E-04, 1.007040783465657E+02, 1.007637959470164E+02, 5.834979956033670E+05, 5.838074994669554E+05, 1.163461990636212E+06,];
oberon.Physical = [761400, 761400, 1163223.4176, 0];
umbriel.Data = [4.244110154568894E-03, 2.648140440510109E+05, 9.767930605931362E+01, 1.676370855801954E+02, 3.372237377270009E+02, 2.451546047814725E+06, 1.005635685746137E-03, 2.689586024352161E+02, 2.684723962833017E+02, 2.659427343102308E+05, 2.670714245694506E+05, 3.579825229977752E+05,];
umbriel.Physical = [584700, 584700, 358041.6, 0];
titania.Data = [2.442005925724298E-03, 4.351352299924148E+05, 9.782120121983446E+01, 1.676132171363206E+02, 2.007980827986995E+02, 2.451543168430207E+06, 4.787158235510595E-04, 7.575564456215845E+01, 7.602707724847778E+01, 4.362004340371369E+05, 4.372656380818590E+05, 7.520119082957421E+05,];
titania.Physical = [788400, 788400, 752218.6176, 0];
//minor
cordelia.Data = [5.024243308177208E-03, 4.981029237197572E+04, 9.770939766035198E+01, 1.674790785996115E+02, 1.887098291670856E+02, 2.451545009534245E+06, 1.231324580849175E-02, 3.498568555972723E+02, 3.497548333876714E+02, 5.006181511154512E+04, 5.031333785111451E+04, 2.923680771090660E+04,];
ophelia.Data = [1.503428502964715E-02, 5.327091415715062E+04, 9.771263657364476E+01, 1.675872461540792E+02, 2.588307811011312E+02, 2.451544972923198E+06, 1.096551121593637E-02, 2.565310856276918E+01, 2.641176793482586E+01, 5.408402886262296E+04, 5.489714356809530E+04, 3.283020671911818E+04,];
bianca.Data = [2.868988657993023E-03, 5.914772589677939E+04, 9.763285774505123E+01, 1.676089153948106E+02, 2.599343322072464E+02, 2.451545034150749E+06, 9.546709221163848E-03, 3.318312442335869E+02, 3.316755536162091E+02, 5.931790830291633E+04, 5.948809070905327E+04, 3.770932911645884E+04,];
cressida.Data = [2.943255182518693E-04, 6.175354927342694E+04, 9.774949533446107E+01, 1.675990710581851E+02, 1.247003773766409E+01, 2.451545093312770E+06, 8.983545828888734E-03, 2.875726471621159E+02, 2.875404902557120E+02, 6.177173026995198E+04, 6.178991126647701E+04, 4.007326359290494E+04,];
desdemona.Data = [6.761910909024267E-04, 6.258153523203691E+04, 9.772135870869063E+01, 1.677258260424438E+02, 3.538172174722290E+02, 2.451545108018341E+06, 8.800806446639864E-03, 2.778639684954117E+02, 2.777872025488438E+02, 6.262388094240790E+04, 6.266622665277889E+04, 4.090534227547381E+04,];
juliet.Data = [1.305224604583680E-03, 6.437764441166491E+04, 9.770323337717856E+01, 1.676270391952724E+02, 7.403815671805059E+00, 2.451544932910094E+06, 8.427116183465703E-03, 4.884835087123302E+01, 4.896109191837979E+01, 6.446178151495353E+04, 6.454591861824215E+04, 4.271924014840718E+04,];
portia.Data = [4.784270150284944E-05, 6.607221101660603E+04, 9.776237982350541E+01, 1.676390791496149E+02, 3.821451036002237E+01, 2.451545098120519E+06, 8.120317487966815E-03, 2.911590917723286E+02, 2.911539789039467E+02, 6.607537224091687E+04, 6.607853346522771E+04, 4.433324196171764E+04,];
rosalind.Data = [1.275578203932233E-03, 6.992555342064220E+04, 9.767579314330743E+01, 1.676413269870299E+02, 1.095908676881809E+01, 2.451544960154834E+06, 7.444697805530589E-03, 2.562928307291340E+01, 2.569259962995293E+01, 7.001486285364961E+04, 7.010417228665702E+04, 4.835656320832253E+04,];
cupid.Data = [4.756514753071366E-03, 7.414505527240250E+04, 9.759336618265785E+01, 1.675979509616807E+02, 2.323886093644246E+02, 2.451544868568415E+06, 6.782708651237801E-03, 7.702232987428931E+01, 7.755416675217747E+01, 7.449941282861697E+04, 7.485377038483144E+04, 5.307614089163366E+04,];
belinda.Data = [1.044623874411065E-03, 7.525184005258091E+04, 9.771152055444925E+01, 1.676582602752632E+02, 1.124291129593210E+01, 2.451544941706437E+06, 6.670768731910460E-03, 3.359775269024878E+01, 3.366406466387528E+01, 7.533053212491068E+04, 7.540922419724044E+04, 5.396679370368437E+04,];
perdita.Data = [3.435427475452145E-03, 7.626565274325290E+04, 9.768897545374726E+01, 1.676653624595348E+02, 2.929448750239580E+02, 2.451545056650575E+06, 6.514740420583503E-03, 3.281128884224548E+02, 3.279041723088513E+02, 7.652856106459101E+04, 7.679146938592911E+04, 5.525930071788740E+04,];
puck.Data = [3.612693341374485E-04, 8.598650952313849E+04, 9.743751522474514E+01, 1.674813244941751E+02, 3.237572723974022E+02, 2.451545132485433E+06, 5.467031409699694E-03, 2.974203051652597E+02, 2.973835501273617E+02, 8.601758503880957E+04, 8.604866055448065E+04, 6.584926498890830E+04,];
mab.Data = [3.457133714142448E-03, 9.736902216342244E+04, 9.760195671890239E+01, 1.676427084837363E+02, 5.677777503848306E+01, 2.451545442811653E+06, 4.515909202012133E-03, 1.872261604931249E+02, 1.871765419995617E+02, 9.770680766229298E+04, 9.804459316116352E+04, 7.971816613132886E+04,];
francisco.Data = [1.373878762376789E-01, 3.688374374158480E+06, 1.475397168566461E+02, 1.031042964877163E+02, 1.232678398158602E+02, 2.451528569533681E+06, 1.559923425214460E-05, 2.214455267391397E+01, 2.917316513392104E+01, 4.275820235485993E+06, 4.863266096813506E+06, 2.307805589562878E+07,];
caliban.Data = [8.086387879051141E-02, 6.588943322169067E+06, 1.397953122994656E+02, 1.750877163312286E+02, 3.393090934714978E+02, 2.451502694084869E+06, 7.185856336826508E-06, 2.626596532756766E+01, 3.076889753530181E+01, 7.168626246021857E+06, 7.748309169874646E+06, 5.009841320582077E+07,];
stephano.Data = [1.440515569949102E-01, 6.805678359408239E+06, 1.416259317292828E+02, 1.894733365511626E+02, 2.896971494824836E+01, 2.451742109861261E+06, 6.151722214586712E-06, 2.552343743029392E+02, 2.401489000873048E+02, 7.951037723153812E+06, 9.096397086899385E+06, 5.852019766861103E+07,];
trinculo.Data = [2.234871275688645E-01, 6.596721408604110E+06, 1.661419786765523E+02, 1.989441073563599E+02, 1.616131472977793E+02, 2.451913217358528E+06, 5.570102812379166E-06, 1.827928617723118E+02, 1.818187233404805E+02, 8.495314943010341E+06, 1.039390847741657E+07, 6.463076394208112E+07,];
sycorax.Data = [5.132436970379746E-01, 5.927985051692898E+06, 1.526198210716904E+02, 2.555982454892386E+02, 1.723091784164447E+01, 2.451896117538810E+06, 3.245182783884031E-06, 2.615523328455091E+02, 2.141736199890964E+02, 1.217854810635164E+07, 1.842911116101038E+07, 1.109336588952103E+08,];
margaret.Data = [8.273979378798536E-01, 2.496471160554907E+06, 5.142174612994110E+01, 2.628526133846311E+01, 7.345313097149652E+01, 2.451711815632652E+06, 2.507330463049883E-06, 3.238621703314636E+02, 2.181797056584788E+02, 1.446373890259282E+07, 2.643100664463073E+07, 1.435789997789525E+08,];
prospero.Data = [3.228421518985363E-01, 1.101921849771880E+07, 1.462912757664635E+02, 3.200987471765573E+02, 1.714836191323427E+02, 2.452165488680783E+06, 2.101072892069662E-06, 2.473610157766625E+02, 2.189917877052204E+02, 1.627274723111191E+07, 2.152627596450502E+07, 1.713410331258817E+08,];
setebos.Data = [5.578990448981822E-01, 7.714986415778215E+06, 1.464985834576437E+02, 2.497683947697240E+02, 3.701074750793821E+00, 2.450486292792232E+06, 1.891959643440990E-06, 1.730619052978180E+02, 1.776258649108817E+02, 1.745073455903623E+07, 2.718648270229424E+07, 1.902789001065858E+08,];
ferdinand.Data = [4.214454185805905E-01, 1.181493680206972E+07, 1.671966747536967E+02, 2.235415379505732E+02, 1.669376400399347E+02, 2.451381075484239E+06, 1.494520368628086E-06, 2.116700879526191E+01, 5.263481576385119E+01, 2.042147306669544E+07, 2.902800933132115E+07, 2.408799555742868E+08,];
//neptunian
triton.Data = [5.671571314786252E-06, 3.546896747793749E+05, 1.302556727944128E+02, 2.158519277733081E+02, 7.800915944894076E+01, 2.451545055194519E+06, 7.089698313832315E-04, 3.566190600600210E+02, 3.566190217315179E+02, 3.546916864385692E+05, 3.546936980977636E+05, 5.077790112699493E+05,];
triton.Physical = [1353400, 1353400, 507760.1856, 75000, 1, 1];
//minor
naiad.Data = [1.967475061749722E-04, 4.813838888836525E+04, 3.306941660427439E+01, 5.100452212424830E+01, 5.835421478412398E+00, 2.451544921385961E+06, 1.417995630891426E-02, 9.631385070914315E+01, 9.633625895334234E+01, 4.814786186011389E+04, 4.815733483186252E+04, 2.538794846452984E+04,];
thalassa.Data = [2.547992284496887E-03, 5.013257780633947E+04, 2.847922339902690E+01, 4.916840892340635E+01, 2.668284678332918E+02, 2.451544997975625E+06, 1.329530664748262E-02, 2.325428669049367E+00, 2.337313581745734E+00, 5.026064153317987E+04, 5.038870526002027E+04, 2.707722428261281E+04,];
despina.Data = [4.707263313626790E-04, 5.242071595550723E+04, 2.850005176640787E+01, 4.890328539115887E+01, 3.079930553624617E+02, 2.451544860634074E+06, 1.247323905577789E-02, 1.501929660664259E+02, 1.502197655322886E+02, 5.244540338784082E+04, 5.247009082017442E+04, 2.886178949911488E+04,];
galatea.Data = [6.277403330064098E-04, 6.185104764755362E+04, 2.848262081215547E+01, 4.884343447247595E+01, 1.451774782921829E+02, 2.451545101500664E+06, 9.729952703628503E-03, 2.746716481781870E+02, 2.745999488488332E+02, 6.188989843300568E+04, 6.192874921845773E+04, 3.699915209924386E+04,];
larissa.Data = [7.389827258193474E-04, 7.358506512826713E+04, 2.859321796675960E+01, 4.839423376906645E+01, 1.022665335114382E+02, 2.451545191380216E+06, 7.496771570845134E-03, 2.360390026314005E+02, 2.359688027740645E+02, 7.363948343446346E+04, 7.369390174065978E+04, 4.802067084450542E+04,];
hippocamp.Data = [6.397573590017036E-04, 1.053273099807456E+05, 2.883131248059795E+01, 4.858152763647446E+01, 2.644411737256781E+02, 2.451545046840383E+06, 4.378365523051324E-03, 3.422807150788768E+02, 3.422583856595099E+02, 1.053947370393666E+05, 1.054621640979876E+05, 8.222246363503991E+04,];
proteus.Data = [2.723905136022161E-04, 1.177175574989097E+05, 2.900400125936993E+01, 4.827235727749026E+01, 2.856786273181567E+02, 2.451545110086801E+06, 3.707667855465043E-03, 3.247345186189252E+02, 3.247164919108719E+02, 1.177496313814782E+05, 1.177817052640466E+05, 9.709607603317697E+04,];
nereid.Data = [7.501322931331886E-01, 1.377826303359184E+06, 5.069166218173146E+00, 3.194659266496860E+02, 2.970711218072909E+02, 2.451689282103396E+06, 1.156948139149738E-05, 2.157751488641130E+02, 1.878684711840158E+02, 5.514223188887772E+06, 9.650620074416360E+06, 3.111634720849031E+07,];
halimede.Data = [2.602863983929396E-01, 1.226574595829538E+07, 1.118584744846539E+02, 2.174340232671141E+02, 1.572474200665515E+02, 2.452226088930562E+06, 2.218680981279693E-06, 2.294393134926633E+02, 2.110632506238886E+02, 1.658174992544075E+07, 2.089775389258611E+07, 1.622585685087357E+08,];
sao.Data = [1.429140829379707E-01, 1.907320112941757E+07, 5.297599085617368E+01, 6.211368240386030E+01, 6.255062410474045E+01, 2.451434648041760E+06, 1.427057782414586E-06, 1.360615283808849E+01, 1.825453933844877E+01, 2.225354628949900E+07, 2.543389144958043E+07, 2.522672903902173E+08,];
laomedeia.Data = [3.758597051761389E-01, 1.465155933057691E+07, 3.765920473945624E+01, 5.298959320393249E+01, 1.325843675800401E+02, 2.450183599582877E+06, 1.317158269366986E-06, 1.549307362176084E+02, 1.676133336455838E+02, 2.347478515982008E+07, 3.229801098906326E+07, 2.733156738810232E+08,];
psamathe.Data = [3.392089409772996E-01, 3.098620526333029E+07, 1.235920805306415E+02, 3.201771328739404E+02, 1.285289565832673E+02, 2.455936074085928E+06, 4.665348050678458E-07, 1.830019196692412E+02, 1.815747614113603E+02, 4.689259159946626E+07, 6.279897793560223E+07, 7.716466083332133E+08,];
neso.Data = [6.243958958042096E-01, 1.933449310199238E+07, 1.418177405039185E+02, 3.384363610783215E+01, 6.687437366852051E+01, 2.455378111657179E+06, 4.056362042562140E-07, 2.256610582274365E+02, 1.939548207495874E+02, 5.147572373680436E+07, 8.361695437161633E+07, 8.874947458403180E+08,];
//minor
pluto.Data = [3.609362531659128E-02, 1.985783152326771E+03, 1.128984735197757E+02, 2.274012614225767E+02, 3.213256573993706E+02, 2.451542027319617E+06, 7.005993928559880E-04, 1.799416573745934E+02, 1.799456868617956E+02, 2.060141113787109E+03, 2.134499075247446E+03, 5.138457207798351E+05,];
pluto.Physical = [2376600, 2376600, 551856.672, 100000, 132.993, -6.163, 1.303e22];
charon.Data = [2.072743604774027E-03, 1.739208931057318E+04, 1.128984926230046E+02, 2.274012844469266E+02, 1.445907325672654E+02, 2.451541877754762E+06, 6.549200579117892E-04, 1.766725371869484E+02, 1.766862878182623E+02, 1.742821352870745E+04, 1.746433774684171E+04, 5.496854091594919E+05,];
charon.Physical = [606000, 606000, 551856.672, 0, 0, 0, 1.586e21];
styx.Data = [2.810192112705742E-02, 4.221615151552574E+04, 1.128686709001701E+02, 2.274350940558442E+02, 1.944443155500134E+02, 2.451544249204000E+06, 1.978258497811800E-04, 1.283272042952097E+01, 1.357326071799199E+01, 4.343680930461508E+04, 4.465746709370441E+04, 1.819782401532483E+06,];
nix.Data = [1.203065200877849E-02, 4.854600266964376E+04, 1.128911332289535E+02, 2.274106217201802E+02, 1.373060613261725E+02, 2.451546942079333E+06, 1.644195568005657E-04, 3.324111128772890E+02, 3.317640386021599E+02, 4.913715467827966E+04, 4.972830668691557E+04, 2.189520559507806E+06,];
kerberos.Data = [5.697505124225928E-03, 5.779514226469680E+04, 1.132752030488343E+02, 2.272051199994008E+02, 3.384948167586934E+02, 2.451549818038746E+06, 1.277939810568108E-04, 3.068021071615559E+02, 3.062771030819439E+02, 5.812631725511017E+04, 5.845749224552355E+04, 2.817034081127516E+06,];
hydra.Data = [1.402570193191586E-02, 6.434712046909600E+04, 1.126933569343251E+02, 2.276183238356948E+02, 2.675952923049808E+02, 2.451546852601348E+06, 1.074167941837654E-04, 3.428063569960802E+02, 3.423231759370296E+02, 6.526247245509097E+04, 6.617782444108595E+04, 3.351431242531059E+06,];
dysnomia.Data = [0.0062, 0, 45.49, 126.17, 0, 0, 0, 0, 0, 37273, 0, 0];
makemake1.Data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 21000, 0, 0]
Haumea1.Data = [0.0513, 0, 126.356, 0, 0, 0, 0, 0, 0, 49880, 0, 0]
Haumea2.Data = [0.249, 0, 113.013, 205.016, 178.9, 0, 0, 178.5, 0, 25657, 0, 0]
gonggong1.Data = [0.2908, 0, 83.08, 31.99, 0, 0, 0, 0, 0, 24021, 0, 0]
quaoar1.Data = [0.148, 0, 14, 0, 348, 0, 0, 0, 0, 14500, 0, 0]
orcus1.Data = [0.00091, 0, 105.03, 0, 0, 0, 0, 0, 0, 8999.8, 0, 0]
salacia1.Data = [0.0098, 0, 23.59, 45.2, 134, 0, 0, 0, 0, 5724, 0, 0]
varda1.Data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 4809, 0, 0]
FY27_1.Data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 9800, 0, 0]
AZ84_1.Data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 7200, 0, 0]
UX25_1.Data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 4770, 0, 0]
UK126_1.Data = [0.0236, 0, 43.75, 0, 0, 0, 0, 0, 0, 6035, 0, 0]
