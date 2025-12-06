import { useMemo, useState, useCallback, useRef } from 'react'
import OrbitalGuide from '../components/OrbitalGuide'

const DEFAULT_OPTIONS = {
  radius: 1,
  segments: 256,
  sectors: 12,
  ringColor: '#ffffff',
  ringOpacity: 0.45,
  fillOpacity: 0.2,
  radialOpacity: 0.8,
  fillInnerRadius: 0,
  fillSegments: 64,
  position: [0, 0, 0],
  rotation: [Math.PI / 2, 0, 0],
  colors: null,
}

const useOrbitalGuide = (initialOptions = {}) => {
  const [config, setConfig] = useState({
    ...DEFAULT_OPTIONS,
    ...initialOptions,
  })
  const [visible, setVisible] = useState(false)
  const guideRef = useRef(null)

  const showOrbitalGuide = useCallback((shouldShow = true) => {
    setVisible(shouldShow)
  }, [])

  const updateOrbitalGuideOptions = useCallback((overrides = {}) => {
    setConfig((prev) => ({
      ...prev,
      ...overrides,
    }))
  }, [])

  const orbitalGuideElement = useMemo(() => {
    if (!visible) return null
    return <OrbitalGuide ref={guideRef} {...config} />
  }, [visible, config])

  return {
    orbitalGuide: orbitalGuideElement,
    showOrbitalGuide,
    updateOrbitalGuideOptions,
  }
}

export default useOrbitalGuide
