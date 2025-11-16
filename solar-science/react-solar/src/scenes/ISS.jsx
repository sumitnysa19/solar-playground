import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useCallback, useMemo, useRef } from "react"
import * as THREE from "three"
import { useCameraTargetStore } from "../store/useCameraTargetStore"

const ORBIT_SEGMENTS = 256

const ISS = () => {
  const issRef = useRef(null)
  const { scene } = useGLTF('/models/ISS.glb')

  const target = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  const focusVec = useMemo(() => new THREE.Vector3(), [])
  const setCameraTarget = useCameraTargetStore((state) => state.setTarget)
  const inclinationQuat = useMemo(() => {
    const quat = new THREE.Quaternion()
    quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), THREE.MathUtils.degToRad(51.6))
    return quat
  }, [])
  const orbitLine = useMemo(() => {
    const orbitRadius = 1.064
    const positions = []
    const angles = []
    for (let i = 0; i <= ORBIT_SEGMENTS; i += 1) {
      const fraction = i / ORBIT_SEGMENTS
      const angle = fraction * Math.PI * 2
      const point = new THREE.Vector3(
        Math.cos(angle) * orbitRadius,
        0,
        Math.sin(angle) * orbitRadius
      )
      point.applyQuaternion(inclinationQuat)
      positions.push(point.x, point.y, point.z)
      angles.push(fraction)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('aAngle', new THREE.Float32BufferAttribute(angles, 1))

    const uniforms = {
      uColor: { value: new THREE.Color('#ffffff') },
      uCenter: { value: 0 },
      uTailLength: { value: 0.5 }, // show half-orbit
      uMaxOpacity: { value: 0.9 },
      uMinOpacity: { value: 0.05 },
    }

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms,
      vertexShader: `
        attribute float aAngle;
        varying float vAngle;
        void main() {
          vAngle = aAngle;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uCenter;
        uniform float uTailLength;
        uniform float uMaxOpacity;
        uniform float uMinOpacity;
        varying float vAngle;

        float wrapDiff(float a, float b) {
          float diff = mod(a - b + 1.0, 1.0);
          return diff;
        }

        void main() {
          float diff = wrapDiff(uCenter, vAngle);
          if (diff > uTailLength) discard;
          float t = 1.0 - (diff / uTailLength);
          float alpha = mix(uMinOpacity, uMaxOpacity, t);
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    })

    const line = new THREE.LineLoop(geometry, material)
    line.raycast = () => null
    line.userData.uniforms = uniforms
    return line
  }, [inclinationQuat])

  useFrame(({ clock }) => {
    if (!issRef.current) return
    const elapsed = clock.getElapsedTime()

    const orbitRadius = 1.064 // Earth radius 1 + ~408km altitude
    const orbitSpeed = (2 * Math.PI) / (92 * 60) // one revolution ~92 minutes
    const angle = elapsed * orbitSpeed

    const localPos = new THREE.Vector3(
      Math.cos(angle) * orbitRadius,
      0,
      Math.sin(angle) * orbitRadius
    )

    localPos.applyQuaternion(inclinationQuat)
    issRef.current.position.copy(localPos)

    issRef.current.up.set(1, 0, 0)
    issRef.current.lookAt(target)

    // yaw 90° so solar arrays roughly align tangential to the orbit
    issRef.current.rotateY(Math.PI / 2)
    issRef.current.rotateX(-Math.PI / 12)
    if (orbitLine.userData.uniforms) {
      orbitLine.userData.uniforms.uCenter.value = (angle / (2 * Math.PI)) % 1
    }
  })

  const handleFocus = useCallback(
    (event) => {
      event.stopPropagation()
      if (!issRef.current) return
      focusVec.copy(issRef.current.position)
      setCameraTarget('iss', focusVec)
    },
    [focusVec, setCameraTarget],
  )

  return (
    <>
      <group ref={issRef} onPointerDown={handleFocus}>
        <primitive object={scene.clone()} scale={0.00005} />
      </group>
      <primitive object={orbitLine} />
    </>
  )
}

export default ISS
useGLTF.preload('/models/ISS.glb')
