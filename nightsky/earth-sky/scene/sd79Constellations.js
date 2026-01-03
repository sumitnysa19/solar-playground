import * as THREE from "../assets/three/three.module.js";
import { createLabelSprite } from "./labelSprite.js";
import { raDecToAltAz, altAzToVector3 } from "../astro/coordinates.js";

const IAU_NAMES = {
    And: "Andromeda", Ant: "Antlia", Aps: "Apus", Aqr: "Aquarius", Aql: "Aquila", Ara: "Ara", Ari: "Aries", Aur: "Auriga",
    Boo: "Boötes", Cae: "Caelum", Cam: "Camelopardalis", Cnc: "Cancer", CVn: "Canes Venatici", CMa: "Canis Major", CMi: "Canis Minor",
    Cap: "Capricornus", Car: "Carina", Cas: "Cassiopeia", Cen: "Centaurus", Cep: "Cepheus", Cet: "Cetus", Cha: "Chamaeleon",
    Cir: "Circinus", Col: "Columba", Com: "Coma Berenices", CrA: "Corona Australis", CrB: "Corona Borealis", Crv: "Corvus", Crt: "Crater",
    Cru: "Crux", Cyg: "Cygnus", Del: "Delphinus", Dor: "Dorado", Dra: "Draco", Equ: "Equuleus", Eri: "Eridanus", For: "Fornax",
    Gem: "Gemini", Gru: "Grus", Her: "Hercules", Hor: "Horologium", Hya: "Hydra", Hyi: "Hydrus", Ind: "Indus", Lac: "Lacerta",
    Leo: "Leo", LMi: "Leo Minor", Lep: "Lepus", Lib: "Libra", Lup: "Lupus", Lyn: "Lynx", Lyr: "Lyra", Men: "Mensa", Mic: "Microscopium",
    Mon: "Monoceros", Mus: "Musca", Nor: "Norma", Oct: "Octans", Oph: "Ophiuchus", Ori: "Orion", Pav: "Pavo", Peg: "Pegasus",
    Per: "Perseus", Phe: "Phoenix", Pic: "Pictor", Psc: "Pisces", PsA: "Piscis Austrinus", Pup: "Puppis", Pyx: "Pyxis", Ret: "Reticulum",
    Sge: "Sagitta", Sgr: "Sagittarius", Sco: "Scorpius", Scl: "Sculptor", Sct: "Scutum", Ser: "Serpens", Sex: "Sextans", Tau: "Taurus",
    Tel: "Telescopium", Tri: "Triangulum", TrA: "Triangulum Australe", Tuc: "Tucana", UMa: "Ursa Major", UMi: "Ursa Minor", Vel: "Vela",
    Vir: "Virgo", Vol: "Volans", Vul: "Vulpecula"
};

function raDecToSkyVector3(raDeg, decDeg, radius) {
    const ra = (raDeg * Math.PI) / 180;
    const dec = (decDeg * Math.PI) / 180;
    return new THREE.Vector3(
        radius * Math.cos(dec) * Math.sin(ra),
        radius * Math.sin(dec),
        radius * Math.cos(dec) * Math.cos(ra)
    );
}

export async function createSD79Constellations({ radius = 1490 }) {
    const group = new THREE.Group();
    group.name = "SD79_Constellations";
    group.userData.kind = "sd79Constellations";
    group.userData.radius = radius;

    const material = new THREE.LineBasicMaterial({
        color: 0x7aa2ff,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
    });

    try {
        const res = await fetch("../../../assets/constellations.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        for (const c of data) {
            if (!c.lines || c.lines.length === 0) continue;

            const flats = [];
            const positions = [];
            const centerSum = { ra: 0, dec: 0, count: 0 };

            for (const line of c.lines) {
                const p1 = line[0];
                const p2 = line[1];
                flats.push(p1[0], p1[1], p2[0], p2[1]);

                const v1 = raDecToSkyVector3(p1[0], p1[1], radius);
                const v2 = raDecToSkyVector3(p2[0], p2[1], radius);
                positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);

                centerSum.ra += p1[0] + p2[0];
                centerSum.dec += p1[1] + p2[1];
                centerSum.count += 2;
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
            geometry.computeBoundingSphere();

            const lines = new THREE.LineSegments(geometry, material);
            lines.name = `Constellation:${c.name}`;
            lines.userData.flats = flats;
            group.add(lines);

            if (centerSum.count > 0) {
                const fullName = IAU_NAMES[c.name] || c.name;
                const label = createLabelSprite(fullName, {
                    font: "600 24px system-ui, Arial",
                    backgroundColor: "rgba(0,0,0,0.4)",
                    textColor: "rgba(220,230,255,0.9)",
                });
                const textLen = fullName.length;
                label.scale.set(textLen * 18 + 30, 40, 1);

                label.userData.originalRA = centerSum.ra / centerSum.count;
                label.userData.originalDec = centerSum.dec / centerSum.count;
                label.position.copy(raDecToSkyVector3(label.userData.originalRA, label.userData.originalDec, radius));
                label.name = `Label:${fullName}`;
                group.add(label);
            }
        }

    } catch (err) {
        console.warn("Failed to load SD79 constellations:", err);
    }

    return group;
}

export function updateSD79ConstellationsForObserver(group, observer) {
    if (!group || !observer) return;
    const { latitudeDeg, lstDeg } = observer;
    const radius = group.userData.radius || 1490;
    const useHorizon = !!observer.useHorizonFrame;

    // Cache to avoid redundant updates if in Equatorial mode
    if (!useHorizon && group.userData._lastUseHorizon === false) return;
    group.userData._lastUseHorizon = useHorizon;

    group.children.forEach(obj => {
        if (obj.isLineSegments && obj.userData.flats) {
            const flats = obj.userData.flats;
            const posAttr = obj.geometry.getAttribute("position");
            const out = posAttr.array;

            for (let i = 0; i < flats.length; i += 2) {
                const ra = flats[i];
                const dec = flats[i + 1];
                let v;
                if (useHorizon) {
                    const hor = raDecToAltAz(ra, dec, latitudeDeg, lstDeg);
                    const alt = hor.altitudeDeg + (hor.refractionDeg || 0);
                    v = altAzToVector3(alt, hor.azimuthDeg, radius);
                } else {
                    v = raDecToSkyVector3(ra, dec, radius);
                }
                const idx = (i / 2) * 3;
                out[idx] = v.x;
                out[idx + 1] = v.y;
                out[idx + 2] = v.z;
            }
            posAttr.needsUpdate = true;
        } else if (obj.isSprite && obj.userData.originalRA !== undefined) {
            const ra = obj.userData.originalRA;
            const dec = obj.userData.originalDec;
            let v;
            if (useHorizon) {
                const hor = raDecToAltAz(ra, dec, latitudeDeg, lstDeg);
                const alt = hor.altitudeDeg + (hor.refractionDeg || 0);
                v = altAzToVector3(alt, hor.azimuthDeg, radius);
            } else {
                v = raDecToSkyVector3(ra, dec, radius);
            }
            obj.position.copy(v);
        }
    });
}
