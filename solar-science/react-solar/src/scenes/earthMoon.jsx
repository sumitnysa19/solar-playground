import Moon from './moon';
import Earth from './earth';
import ISS from './ISS';

const EarthMoon = () => {
    return (
        <group>
            <Earth renderMode="tiles" /* hybrid | procedural | tiles */ tileQuality={{ errorTarget: 6, maxDepth: 16, anisotropy: true }}  />
            <ISS />
            <Moon displacementScale={0.02} />
        </group>
    )
}

export default EarthMoon;