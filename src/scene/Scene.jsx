import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import {
  OrbitControls,
  Environment,
  ContactShadows,
  PerspectiveCamera,
  Center,
} from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store/useStore'
import { Text3DObject } from './Text3DObject'

/**
 * Bridges imperative renderer actions (PNG export, camera reset) into the store
 * so UI components outside of the Canvas can trigger them.
 */
function CanvasBridge() {
  const { gl, scene, camera } = useThree()

  useEffect(() => {
    useStore.setState({
      exportPNG: () => {
        // Render the latest frame, then snapshot the canvas.
        gl.render(scene, camera)
        const dataURL = gl.domElement.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = `3d-text-${Date.now()}.png`
        link.href = dataURL
        link.click()
      },
      resetCamera: () => {
        camera.position.set(0, 1.2, 6)
        camera.lookAt(0, 0, 0)
      },
    })
  }, [gl, scene, camera])

  return null
}

export function Scene() {
  const background = useStore((s) => s.background)
  const envPreset = useStore((s) => s.envPreset)
  const envIntensity = useStore((s) => s.envIntensity)
  const autoRotate = useStore((s) => s.autoRotate)
  const autoRotateSpeed = useStore((s) => s.autoRotateSpeed)
  const showShadows = useStore((s) => s.showShadows)

  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
      style={{ background }}
    >
      <CanvasBridge />

      <PerspectiveCamera makeDefault position={[0, 1.2, 6]} fov={32} />

      {/* Soft ambient + key fill — the HDRI does most of the lighting work */}
      <ambientLight intensity={0.18} />
      <directionalLight
        position={[6, 8, 6]}
        intensity={0.55}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0005}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />

      <Suspense fallback={null}>
        <Center>
          <Text3DObject />
        </Center>

        <Environment
          preset={envPreset}
          background={false}
          environmentIntensity={envIntensity}
        />

        {showShadows && (
          <ContactShadows
            position={[0, -1.15, 0]}
            opacity={0.55}
            scale={18}
            blur={2.6}
            far={6}
            resolution={1024}
            color="#000000"
          />
        )}
      </Suspense>

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
        minDistance={2}
        maxDistance={24}
        target={[0, 0, 0]}
        makeDefault
      />
    </Canvas>
  )
}
