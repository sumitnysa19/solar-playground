import { useRef, useEffect, useCallback } from 'react';
import { useLoader, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BasisTextureLoader } from 'three-stdlib';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { TilesRenderer } from '3d-tiles-renderer';
import { CesiumIonAuthPlugin, GLTFExtensionsPlugin, TilesFadePlugin, UpdateOnChangePlugin } from '3d-tiles-renderer/plugins';
import { useTimeStore } from '../store/useTimeStore';
import { useCameraTargetStore } from '../store/useCameraTargetStore';
import useOrbitalGuide from '../hooks/useOrbitalGuide';

const GOOGLE_TILES_ASSET_ID = '2275207'
const GOOGLE_TILES_TOKEN = import.meta.env?.VITE_CESIUM_ION_TOKEN || ''
const TILE_FADE_START = 3.5
const TILE_FADE_END = 1.4
const EARTH_RADIUS_METERS = 6378137
const TILE_SCALE = 1 / EARTH_RADIUS_METERS
const ROTATION_SPEED_PLANET = 0.03
const ROTATION_SPEED_CLOUDS = 0.04
const CLOUD_SHEAR_SPEED = 0.01
const TIME_SCALE_MIN = 0.003
const TIME_SLOW_START_ALT_METERS = 400000
const TIME_STATIC_ALT_METERS = 25000
const TILE_DETAIL_NEAR_ALT_METERS = 10000
const TILE_DETAIL_FAR_ALT_METERS = 250000
const TILE_ERROR_MULTIPLIER_CLOSE = 0.02
const TILE_MAX_DEPTH_BOOST = 14
const TILE_DETAIL_EASING_POWER = 0.4
const TILE_RESOLUTION_MULTIPLIER_NEAR = 2.1
const EQUATOR_RADIUS = 20
const EQUATOR_FILL_INNER_RADIUS = 0
const EQUATOR_FILL_SEGMENTS = 64
const EQUATOR_SEGMENTS = 256
const EQUATOR_SECTORS = 12
const EQUATOR_OPACITY = 0.45
const EQUATOR_CIRCLE_COLOR = '#3db2ff'
const EQUATOR_FILL_OPACITY = 0.2
const EQUATOR_RADIAL_OPACITY = 0.8
const DEFAULT_TILE_QUALITY = {
  errorTarget: 4,
  maxDepth: 16,
  anisotropy: true,
}

const Earth = ({ renderMode = 'hybrid', tileQuality = DEFAULT_TILE_QUALITY }) => {
  const planetRef = useRef(null)
  const cloudsRef = useRef(null)
  const tilesRef = useRef(null)
  const tilesContainerRef = useRef(null)
  const tilesResolutionRef = useRef(new THREE.Vector2())
  const { gl, camera, scene } = useThree()
  const setTimeScale = useTimeStore((state) => state.setTimeScale)
  const setCameraTarget = useCameraTargetStore((state) => state.setTarget)
  const timeScaleRef = useRef(useTimeStore.getState().timeScale)
  const enableProcedural = renderMode === 'procedural' || renderMode === 'hybrid'
  const enableTiles = renderMode === 'tiles' || renderMode === 'hybrid'
  const enableClouds = enableProcedural || enableTiles
  const isHybrid = enableProcedural && enableTiles

  const { errorTarget: baseErrorTarget, maxDepth: baseMaxDepth, anisotropy } = {
    ...DEFAULT_TILE_QUALITY,
    ...(tileQuality || {}),
  }

  const { orbitalGuide, showOrbitalGuide } = useOrbitalGuide({
    radius: EQUATOR_RADIUS,
    segments: EQUATOR_SEGMENTS,
    sectors: EQUATOR_SECTORS,
    ringColor: EQUATOR_CIRCLE_COLOR,
    ringOpacity: EQUATOR_OPACITY,
    fillOpacity: EQUATOR_FILL_OPACITY,
    radialOpacity: EQUATOR_RADIAL_OPACITY,
    fillInnerRadius: EQUATOR_FILL_INNER_RADIUS,
    fillSegments: EQUATOR_FILL_SEGMENTS,
    rotation: [Math.PI / 2, 0, 0],
  })

  useEffect(() => {
    const unsub = useTimeStore.subscribe((state) => {
      timeScaleRef.current = state.timeScale
    })
    return unsub
  }, [])

  useEffect(() => {
    showOrbitalGuide(false)
    return () => showOrbitalGuide(false)
  }, [showOrbitalGuide])

  // Load Basis (.basis) textures using BasisTextureLoader
  const [colorMap, bumpMap, specMap, cloudsMap, nightMap, dispMap] = useLoader(BasisTextureLoader, [
    '/textures/earth.basis',
    '/textures/earth_bump.basis',
    '/textures/earth_spec.basis',
    '/textures/earth_clouds.basis',
    '/textures/earth_night.basis',
    '/textures/earth_disp.basis',
  ], (loader) => {
    loader.setTranscoderPath('/basis/')
    loader.detectSupport(gl)
  })

  // Ensure consistent orientation, color space, and fix horizontal mirroring
  useEffect(() => {
    if (!enableClouds) return

    const toUpdate = [colorMap, bumpMap, specMap, cloudsMap, nightMap, dispMap].filter(Boolean)
    toUpdate.forEach((tex) => {
      tex.flipY = false
      tex.wrapS = THREE.RepeatWrapping
      tex.wrapT = THREE.RepeatWrapping
      // Flip horizontally to correct mirrored appearance
      tex.repeat.x = -1
      tex.offset.x = 1
      tex.needsUpdate = true
    })

    // Day and clouds are color textures: use sRGB color space
    if (colorMap) {
      colorMap.colorSpace = THREE.SRGBColorSpace
      colorMap.needsUpdate = true
    }
    if (cloudsMap) {
      cloudsMap.colorSpace = THREE.SRGBColorSpace
      cloudsMap.needsUpdate = true
    }
    if (nightMap) {
      nightMap.colorSpace = THREE.SRGBColorSpace
      nightMap.needsUpdate = true
    }
  }, [colorMap, bumpMap, specMap, cloudsMap, nightMap, dispMap, enableClouds])

  useEffect(() => {
    if (!enableProcedural) return
    if (planetRef.current?.material) {
      planetRef.current.material.transparent = true
      planetRef.current.material.opacity = 1
    }
  }, [enableProcedural])

  useEffect(() => {
    if (!enableTiles) {
      if (tilesContainerRef.current) {
        scene.remove(tilesContainerRef.current)
        tilesContainerRef.current = null
      }
      if (tilesRef.current) {
        tilesRef.current.dispose()
        tilesRef.current = null
      }
      return
    }

    if (!gl || !camera || !scene) return
    if (!GOOGLE_TILES_TOKEN) {
      console.warn('VITE_CESIUM_ION_TOKEN is not defined. Skipping 3D Tiles setup.')
      return
    }

    const tiles = new TilesRenderer()
    tiles.errorTarget = baseErrorTarget
    tiles.maxDepth = baseMaxDepth
    tiles.registerPlugin(new CesiumIonAuthPlugin({
      apiToken: GOOGLE_TILES_TOKEN,
      assetId: GOOGLE_TILES_ASSET_ID,
      autoRefreshToken: true,
    }))

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    tiles.registerPlugin(new GLTFExtensionsPlugin({ dracoLoader }))
    tiles.registerPlugin(new TilesFadePlugin())
    tiles.registerPlugin(new UpdateOnChangePlugin())
    tiles.setCamera(camera)
    tiles.setResolutionFromRenderer(camera, gl)
    tiles.group.rotation.x = -Math.PI / 2

    const container = new THREE.Group()
    container.scale.setScalar(TILE_SCALE)
    container.add(tiles.group)
    container.visible = false
    scene.add(container)
    tilesRef.current = tiles
    tilesContainerRef.current = container

    const maxAniso = anisotropy && gl ? gl.capabilities.getMaxAnisotropy() : 0
    const applyAnisotropy = (sceneTarget) => {
      if (!anisotropy || !sceneTarget) return
      sceneTarget.traverse((child) => {
        if (!child.isMesh) return
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((mat) => {
          if (!mat) return
          ;['map', 'normalMap', 'roughnessMap', 'metalnessMap'].forEach((key) => {
            if (mat[key]) {
              mat[key].anisotropy = maxAniso
              mat[key].needsUpdate = true
            }
          })
        })
      })
    }

    const onLoadModel = ({ scene: modelScene }) => applyAnisotropy(modelScene)
    tiles.addEventListener('load-model', onLoadModel)

    return () => {
      tiles.removeEventListener('load-model', onLoadModel)
      scene.remove(container)
      tiles.dispose()
      if (dracoLoader.dispose) dracoLoader.dispose()
      tilesRef.current = null
      tilesContainerRef.current = null
    }
  }, [camera, gl, scene, enableTiles, baseErrorTarget, baseMaxDepth, anisotropy])

  useFrame((state, delta) => {
    const tiles = tilesRef.current
    const cameraDistance = state.camera.position.length()
    const cameraAltitudeMeters = Math.max(cameraDistance - 1, 0) * EARTH_RADIUS_METERS
    if (tiles && enableTiles) {
      tiles.setCamera(state.camera)
      const detailRange = Math.max(TILE_DETAIL_FAR_ALT_METERS - TILE_DETAIL_NEAR_ALT_METERS, 1)
      const detailBlend = THREE.MathUtils.clamp(
        (cameraAltitudeMeters - TILE_DETAIL_NEAR_ALT_METERS) / detailRange,
        0,
        1,
      )
      const detailEased = Math.pow(detailBlend, TILE_DETAIL_EASING_POWER)
      const closeErrorTarget = Math.max(baseErrorTarget * TILE_ERROR_MULTIPLIER_CLOSE, 0.02)
      tiles.errorTarget = THREE.MathUtils.lerp(closeErrorTarget, baseErrorTarget, detailEased)
      const boostedDepth = Math.round(
        THREE.MathUtils.lerp(
          baseMaxDepth + TILE_MAX_DEPTH_BOOST,
          baseMaxDepth,
          detailEased,
        ),
      )
      tiles.maxDepth = Math.max(baseMaxDepth, boostedDepth)
      const resolutionVec = tilesResolutionRef.current
      state.gl.getDrawingBufferSize(resolutionVec)
      const resolutionMultiplier = THREE.MathUtils.lerp(
        TILE_RESOLUTION_MULTIPLIER_NEAR,
        1,
        detailEased,
      )
      tiles.setResolution(
        state.camera,
        resolutionVec.x * resolutionMultiplier,
        resolutionVec.y * resolutionMultiplier,
      )
    }
    const rawBlend =
      TILE_FADE_START === TILE_FADE_END
        ? 1
        : THREE.MathUtils.clamp(
            1 - (cameraDistance - TILE_FADE_END) / (TILE_FADE_START - TILE_FADE_END),
            0,
            1,
          )
    const blend = isHybrid ? rawBlend : enableTiles ? 1 : 0
    const blendForTime = enableTiles ? rawBlend : 0
    const baseTimeScale = THREE.MathUtils.lerp(1, TIME_SCALE_MIN, blendForTime)
    const altitudeRange = Math.max(TIME_SLOW_START_ALT_METERS - TIME_STATIC_ALT_METERS, 1)
    const altitudeBlend = THREE.MathUtils.clamp(
      (cameraAltitudeMeters - TIME_STATIC_ALT_METERS) / altitudeRange,
      0,
      1,
    )
    const easedAltitude = Math.pow(altitudeBlend, 1.5)
    const altitudeTimeScale = THREE.MathUtils.lerp(TIME_SCALE_MIN, 1, easedAltitude)
    const targetTimeScale = Math.min(baseTimeScale, altitudeTimeScale)
    if (Math.abs(targetTimeScale - timeScaleRef.current) > 0.0005) {
      setTimeScale(targetTimeScale)
      timeScaleRef.current = targetTimeScale
    }

    const scaledDelta = delta * timeScaleRef.current
    const rotationStep = scaledDelta * ROTATION_SPEED_PLANET
    const planetDirection = renderMode === 'procedural' ? -1 : 1
    if (planetRef.current) {
      planetRef.current.rotation.y += rotationStep * planetDirection
    }
    if (enableClouds && cloudsRef.current) {
      const cloudFactor = ROTATION_SPEED_CLOUDS / ROTATION_SPEED_PLANET
      const cloudStep = rotationStep * cloudFactor
      const relativeStep = cloudStep + scaledDelta * CLOUD_SHEAR_SPEED
      cloudsRef.current.rotation.y -= relativeStep
      cloudsRef.current.visible = true
      const tilesOpacity = THREE.MathUtils.lerp(0.6, 0.35, blend)
      const targetOpacity = enableTiles ? tilesOpacity : 0.6
      cloudsRef.current.material.opacity = targetOpacity
    }
    if (tilesContainerRef.current && enableTiles) {
      tilesContainerRef.current.rotation.y += rotationStep
    }

    if (enableProcedural && planetRef.current?.material) {
      const mat = planetRef.current.material
      if (isHybrid) {
        mat.transparent = true
        mat.opacity = THREE.MathUtils.lerp(1, 0.2, blend)
      } else {
        mat.opacity = 1
        mat.transparent = false
      }
    } else if (!enableProcedural && enableTiles) {
      const baseOpacity = THREE.MathUtils.lerp(1, 0.2, blend)
      if (tilesContainerRef.current?.children[0]?.material) {
        tilesContainerRef.current.children[0].material.opacity = baseOpacity
        tilesContainerRef.current.children[0].material.transparent = true
      }
    }

    if (tiles && enableTiles) {
      if (tilesContainerRef.current) {
        tilesContainerRef.current.visible = renderMode === 'tiles' ? true : blend > 0.01
      }
      tiles.update()
    }
  })
    
  const focusEarth = useCallback((event) => {
    event?.stopPropagation?.()
    setCameraTarget('earth', { x: 0, y: 0, z: 0 })
  }, [setCameraTarget])

  return (
    <>
      {/* Main Earth */}
      {enableProcedural && (
        <mesh receiveShadow ref={planetRef}>
          <sphereGeometry args={[1, 512, 512]} />
          <meshPhongMaterial
            map={colorMap}
            bumpMap={bumpMap}
            bumpScale={0.05}
            specularMap={specMap}
            specular={new THREE.Color('grey')}
            shininess={15}
            displacementMap={dispMap}
            displacementScale={0.01}
            emissiveMap={nightMap}
            emissive={new THREE.Color('white')}
            emissiveIntensity={0.20}
          />
        </mesh>
      )}

      {/* Clouds Layer */}
      {enableClouds && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[1.01, 64, 64]} />
          <meshLambertMaterial
            map={cloudsMap}
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Equatorial guide */}
      {orbitalGuide}

      {/* Invisible focus capture */}
      <mesh onDoubleClick={focusEarth}>
        <sphereGeometry args={[1.05, 16, 16]} />
        <meshBasicMaterial
          transparent
          opacity={0.02}
          depthWrite={false}
          depthTest={false}
          color="white"
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  )
}

export default Earth;
