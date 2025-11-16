import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useCallback, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useCameraTargetStore } from '../store/useCameraTargetStore';

const Moon = ({ displacementScale }) => {
    const groupRef = useRef(null);
    const moonRef = useRef(null);
    const setCameraTarget = useCameraTargetStore((state) => state.setTarget);
    const focusVec = useMemo(() => new THREE.Vector3(), []);

    const [moonTexture, displacementMap] = useTexture(['/assets/lroc_color_poles_4k.jpg', '/assets/ldem_hw5x3.jpg']);

    useFrame(({ clock }) => {
        if (groupRef.current) {
            groupRef.current.position.x = Math.sin(clock.getElapsedTime() * 0.01) * 4;
            groupRef.current.position.z = Math.cos(clock.getElapsedTime() * 0.01) * 4;
        }
        if (moonRef.current) {
            moonRef.current.rotation.y += 0.0002;
        }
    })

    const handleFocus = useCallback((event) => {
        event?.stopPropagation?.();
        if (!groupRef.current) return;
        groupRef.current.getWorldPosition(focusVec);
        setCameraTarget('moon', focusVec);
    }, [focusVec, setCameraTarget]);

    return (
        <group ref={groupRef} position={[4, 0, 0]} onDoubleClick={handleFocus}>
            <mesh castShadow ref={moonRef}>
                <sphereGeometry args={[0.5, 64, 64]} />
                <meshStandardMaterial map={moonTexture} displacementMap={displacementMap} displacementScale={displacementScale} />
            </mesh>
        </group>
    )
}

export default Moon;
