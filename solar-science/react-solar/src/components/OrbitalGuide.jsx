import { useMemo, useEffect, forwardRef } from 'react'
import * as THREE from 'three'

const buildCircleGeometry = (radius, segments) => {
  const points = []
  for (let i = 0; i <= segments; i += 1) {
    const fraction = i / segments
    const angle = fraction * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0))
  }
  return new THREE.BufferGeometry().setFromPoints(points)
}

const buildRadialGeometries = (radius, sectors) => {
  const geoms = []
  for (let i = 0; i < sectors; i += 1) {
    const angle = (i / sectors) * Math.PI * 2
    const end = new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
    geoms.push(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), end]))
  }
  return geoms
}

const buildSectorRingGeometries = (radius, sectors, innerRadius, segments) => {
  const geoms = []
  for (let i = 0; i < sectors; i += 1) {
    const startAngle = (i / sectors) * Math.PI * 2
    const length = (1 / sectors) * Math.PI * 2
    geoms.push(new THREE.RingGeometry(innerRadius, radius, segments, 1, startAngle, length))
  }
  return geoms
}

const buildDefaultColors = (sectors) =>
  Array.from({ length: sectors }, (_, index) => {
    const hue = (index / sectors) * 360
    return new THREE.Color(`hsl(${hue}, 70%, 55%)`)
  })

const OrbitalGuide = forwardRef(({
  radius = 1,
  segments = 256,
  sectors = 12,
  ringColor = '#ffffff',
  ringOpacity = 0.45,
  fillOpacity = 0.2,
  radialOpacity = 0.8,
  fillInnerRadius = 0,
  fillSegments = 64,
  colors,
  position = [0, 0, 0],
  rotation = [Math.PI / 2, 0, 0],
}, ref) => {
  const circleGeometry = useMemo(() => buildCircleGeometry(radius, segments), [radius, segments])
  const radialGeometries = useMemo(() => buildRadialGeometries(radius, sectors), [radius, sectors])
  const fillGeometries = useMemo(
    () => buildSectorRingGeometries(radius, sectors, fillInnerRadius, fillSegments),
    [radius, sectors, fillInnerRadius, fillSegments],
  )

  const colorPalette = useMemo(
    () => (Array.isArray(colors) && colors.length ? colors : buildDefaultColors(sectors)),
    [colors, sectors],
  )

  const ringMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: ringOpacity,
      }),
    [ringColor, ringOpacity],
  )

  const radialMaterials = useMemo(
    () =>
      colorPalette.map(
        (color) =>
          new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity: radialOpacity,
          }),
      ),
    [colorPalette, radialOpacity],
  )

  const fillMaterials = useMemo(
    () =>
      colorPalette.map(
        (color) =>
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: fillOpacity,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
      ),
    [colorPalette, fillOpacity],
  )

  useEffect(() => {
    return () => {
      circleGeometry.dispose()
      radialGeometries.forEach((geom) => geom.dispose())
      fillGeometries.forEach((geom) => geom.dispose())
      ringMaterial.dispose()
      radialMaterials.forEach((mat) => mat.dispose())
      fillMaterials.forEach((mat) => mat.dispose())
    }
  }, [circleGeometry, radialGeometries, fillGeometries, ringMaterial, radialMaterials, fillMaterials])

  return (
    <group ref={ref} position={position} rotation={rotation}>
      {fillGeometries.map((geometry, index) => (
        <mesh key={`orbital-guide-fill-${index}`} geometry={geometry} material={fillMaterials[index]} />
      ))}
      <line geometry={circleGeometry} material={ringMaterial} />
      {radialGeometries.map((geometry, index) => (
        <line key={`orbital-guide-radial-${index}`} geometry={geometry} material={radialMaterials[index]} />
      ))}
    </group>
  )
})

OrbitalGuide.displayName = 'OrbitalGuide'

export default OrbitalGuide
