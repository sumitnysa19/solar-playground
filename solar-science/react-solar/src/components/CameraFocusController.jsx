import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useCameraTargetStore } from '../store/useCameraTargetStore'

const EARTH_UNIT_RADIUS = 1
const EARTH_RADIUS_METERS = 6378137
const metersToUnitAltitude = (meters) => EARTH_UNIT_RADIUS + meters / EARTH_RADIUS_METERS
const metersToUnitDistance = (meters) => meters / EARTH_RADIUS_METERS

const TARGET_PROFILES = {
  earth: {
    offset: new THREE.Vector3(0, 1.5, 4),
    minDistance: metersToUnitAltitude(1000),
    maxDistance: 18,
    preferredDistance: metersToUnitAltitude(5000),
  },
  moon: {
    offset: new THREE.Vector3(0, 0.8, 2.2),
    minDistance: 0.55,
    maxDistance: 14,
  },
  iss: {
    offset: new THREE.Vector3(0, 0.2, 1.4),
    minDistance: 0.0005,
    maxDistance: 0.15,
    preferredDistance: 0.015,
    zoomSpeedRange: { min: 0.01, max: 0.45 },
    zoomEasingPower: 3.2,
    followTarget: true,
  },
}

const MIN_ZOOM_SPEED = 0.08
const MAX_ZOOM_SPEED = 1.4
const MIN_ROTATE_SPEED = 0.015
const MAX_ROTATE_SPEED = 2.2
const DAMPING_FACTOR = 0.12
const ROTATE_EASING_POWER = 0.85

const DEFAULT_PROFILE = {
  offset: new THREE.Vector3(0, 1.2, 4),
  minDistance: 0.8,
  maxDistance: 22,
  preferredDistance: null,
  zoomSpeedRange: null,
  zoomEasingPower: null,
  followTarget: false,
}

const applyZoomBehavior = (controls, profile) => {
  if (!controls) return
  const minDistance = profile.minDistance ?? DEFAULT_PROFILE.minDistance
  const fallbackMax = profile.maxDistance ?? DEFAULT_PROFILE.maxDistance
  const maxDistance = Math.max(fallbackMax, minDistance + 0.5)
  const zoomRange = profile.zoomSpeedRange || { min: MIN_ZOOM_SPEED, max: MAX_ZOOM_SPEED }
  const zoomEasePower = profile.zoomEasingPower ?? 2

  controls.minDistance = minDistance
  controls.maxDistance = maxDistance
  controls.enableDamping = true
  controls.dampingFactor = DAMPING_FACTOR

  const currentDistance = controls.object.position.distanceTo(controls.target)
  const range = Math.max(maxDistance - minDistance, 0.001)
  const normalized = THREE.MathUtils.clamp((currentDistance - minDistance) / range, 0, 1)
  const zoomEased = 1 - Math.pow(1 - normalized, zoomEasePower)
  const rotateEased = Math.pow(normalized, ROTATE_EASING_POWER)

  controls.zoomSpeed = THREE.MathUtils.lerp(zoomRange.min, zoomRange.max, zoomEased)
  controls.rotateSpeed = THREE.MathUtils.lerp(MIN_ROTATE_SPEED, MAX_ROTATE_SPEED, rotateEased)
}

const CameraFocusController = ({ controlsRef }) => {
  const { camera } = useThree()
  const coords = useCameraTargetStore((state) => state.target)
  const targetId = useCameraTargetStore((state) => state.targetId)

  const animationRef = useRef(null)
  const targetVec = useRef(new THREE.Vector3(coords.x, coords.y, coords.z))
  const lastTarget = useRef(targetId)

  const focusProfile = useMemo(() => {
    const profile = TARGET_PROFILES[targetId] || DEFAULT_PROFILE
    return {
      ...DEFAULT_PROFILE,
      ...profile,
    }
  }, [targetId])

  useEffect(() => {
    const controls = controlsRef?.current
    const cameraObj = controls ? controls.object : camera
    const previousTarget = targetVec.current.clone()
    const targetChanged = lastTarget.current !== targetId

    targetVec.current.set(coords.x, coords.y, coords.z)
    const toTarget = targetVec.current.clone()

    const updateLookAt = () => {
      if (controls) {
        controls.target.copy(toTarget)
        controls.update()
      } else {
        camera.lookAt(toTarget)
      }
    }

    if (!targetChanged) {
      updateLookAt()
      if (focusProfile.followTarget) {
        const deltaTarget = toTarget.clone().sub(previousTarget)
        if (deltaTarget.lengthSq() > 0) {
          cameraObj.position.add(deltaTarget)
          if (controls) {
            controls.update()
          } else {
            camera.lookAt(toTarget)
          }
        }
      }
      return
    }

    console.info(`[CameraFocus] focus target: ${targetId}`)
    lastTarget.current = targetId
    updateLookAt()
    animationRef.current = null
  }, [coords.x, coords.y, coords.z, controlsRef, camera, focusProfile, targetId])

  useFrame((_, delta) => {
    const controls = controlsRef?.current
    if (controls) {
      applyZoomBehavior(controls, focusProfile)
    }

    const anim = animationRef.current
    if (!anim) {
      if (controls?.enableDamping) {
        controls.update()
      }
      return
    }

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
