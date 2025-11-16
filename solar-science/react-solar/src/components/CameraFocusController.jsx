import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useCameraTargetStore } from '../store/useCameraTargetStore'

const OFFSETS = {
  earth: new THREE.Vector3(0, 1.5, 4),
  moon: new THREE.Vector3(0, 0.8, 2.2),
  iss: new THREE.Vector3(0, 0.4, 1.6),
}

const DEFAULT_OFFSET = new THREE.Vector3(0, 1.2, 4)

const CameraFocusController = ({ controlsRef }) => {
  const { camera } = useThree()
  const coords = useCameraTargetStore((state) => state.target)
  const targetId = useCameraTargetStore((state) => state.targetId)

  const animationRef = useRef(null)
  const targetVec = useRef(new THREE.Vector3(coords.x, coords.y, coords.z))
  const lastTarget = useRef(targetId)

  const buildOffsets = useMemo(() => {
    const offset = OFFSETS[targetId]?.clone() || DEFAULT_OFFSET.clone()
    return offset
  }, [targetId])

  useEffect(() => {
    const controls = controlsRef?.current
    const offset = buildOffsets.clone()
    const targetChanged = lastTarget.current !== targetId

    targetVec.current.set(coords.x, coords.y, coords.z)
    lastTarget.current = targetId

    if (!targetChanged && !animationRef.current) return

    const fromTarget = controls ? controls.target.clone() : targetVec.current.clone()
    const fromPos = camera.position.clone()
    const distance = controls
      ? controls.object.position.distanceTo(controls.target)
      : camera.position.distanceTo(targetVec.current)

    if (distance > 0) {
      offset.setLength(Math.max(distance, offset.length()))
    }

    const toTarget = targetVec.current.clone()
    const toPos = targetVec.current.clone().add(offset)

    animationRef.current = {
      progress: 0,
      fromPos,
      toPos,
      fromTarget,
      toTarget,
    }
  }, [coords.x, coords.y, coords.z, buildOffsets, controlsRef, camera, targetId])

  useFrame((_, delta) => {
    const controls = controlsRef?.current
    if (!animationRef.current) return
    const anim = animationRef.current
    anim.progress += delta * 1.5
    const t = Math.min(anim.progress, 1)
    const eased = 1 - Math.pow(1 - t, 3)

    camera.position.lerpVectors(anim.fromPos, anim.toPos, eased)
    if (controls) {
      const targetInterpolated = new THREE.Vector3().lerpVectors(anim.fromTarget, anim.toTarget, eased)
      controls.target.copy(targetInterpolated)
      controls.update()
    } else {
      camera.lookAt(anim.toTarget)
    }

    if (t >= 1) {
      animationRef.current = null
    }
  })

  return null
}

export default CameraFocusController
