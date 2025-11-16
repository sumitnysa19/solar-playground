import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import MainContainer from './mainContainer'
import { OrbitControls } from '@react-three/drei';
import CameraFocusController from './components/CameraFocusController';

export default function App() {
  const controlsRef = useRef(null);
  return (
    <Canvas shadows camera={{fov: 75, near: 0.0001, far: 1000, position: [0, 3, 3] }}>
      <OrbitControls ref={controlsRef} enablePan={false} />
      <CameraFocusController controlsRef={controlsRef} />
      <MainContainer />
    </Canvas>
  );
}
