import { useEffect, useMemo } from 'react'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { useStore, DEFAULT_FONTS } from '../store/useStore'
import { useFont } from './useFont'

/**
 * Renders the 3D extruded text mesh with a physical material.
 * All parameters come from the Zustand store and update reactively.
 */
export function Text3DObject() {
  const text = useStore((s) => s.text)
  const fontId = useStore((s) => s.fontId)
  const customFontSource = useStore((s) => s.customFontSource)

  const size = useStore((s) => s.size)
  const depth = useStore((s) => s.depth)
  const curveSegments = useStore((s) => s.curveSegments)
  const bevelEnabled = useStore((s) => s.bevelEnabled)
  const bevelThickness = useStore((s) => s.bevelThickness)
  const bevelSize = useStore((s) => s.bevelSize)
  const bevelSegments = useStore((s) => s.bevelSegments)

  const color = useStore((s) => s.color)
  const roughness = useStore((s) => s.roughness)
  const metalness = useStore((s) => s.metalness)
  const clearcoat = useStore((s) => s.clearcoat)
  const clearcoatRoughness = useStore((s) => s.clearcoatRoughness)
  const reflectivity = useStore((s) => s.reflectivity)

  // Resolve the active font source: URL for defaults, Font object for custom upload.
  const fontSource =
    fontId === 'custom'
      ? customFontSource
      : DEFAULT_FONTS.find((f) => f.id === fontId)?.url

  const font = useFont(fontSource)

  // Build the TextGeometry. Always use a non-empty string to avoid empty-shape
  // crashes in TextGeometry; we render an invisible space for empty input.
  const geometry = useMemo(() => {
    if (!font) return null
    const safeText = text && text.length > 0 ? text : ' '
    const geom = new TextGeometry(safeText, {
      font,
      size,
      depth,
      curveSegments,
      bevelEnabled,
      bevelThickness: bevelEnabled ? bevelThickness : 0,
      bevelSize: bevelEnabled ? bevelSize : 0,
      bevelOffset: 0,
      bevelSegments,
    })
    geom.computeBoundingBox()
    geom.computeVertexNormals()
    return geom
  }, [
    font,
    text,
    size,
    depth,
    curveSegments,
    bevelEnabled,
    bevelThickness,
    bevelSize,
    bevelSegments,
  ])

  // Dispose the previous geometry when it's replaced or on unmount.
  useEffect(() => {
    return () => {
      if (geometry) geometry.dispose()
    }
  }, [geometry])

  if (!geometry) return null

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        clearcoat={clearcoat}
        clearcoatRoughness={clearcoatRoughness}
        reflectivity={reflectivity}
        envMapIntensity={1.25}
      />
    </mesh>
  )
}
