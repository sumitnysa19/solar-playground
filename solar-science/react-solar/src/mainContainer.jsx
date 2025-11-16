import { useHelper } from "@react-three/drei";
import AnimatedStars from "./animatedStars.jsx";
import { useRef } from "react";
import EarthMoon from "./scenes/earthMoon.jsx";
import * as THREE from "three";

const MainContainer = () => {
    const directionalLightRef = useRef();
    const directionalLightRef2 = useRef();
    useHelper(directionalLightRef, THREE.DirectionalLightHelper, 1, "hotpink");
    useHelper(directionalLightRef2, THREE.DirectionalLightHelper, 1, "hotpink");
    return (
    < >
        <color attach='background' args={['black']} />
        <AnimatedStars />
        
        {<directionalLight castShadowref={directionalLightRef} position={[0, 0, 10]} intensity={3}/> }
            
        
        {
            /* <ambientLight intensity={0.8} /> */
        }
        <group rotation={[0, 0, Math.PI]}>
            <EarthMoon />
        </group>
    </>
    );
};

export default MainContainer;
