import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useRef, useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import CityIsland from './CityIsland'
import CityBuildings from './CityBuildings'
import CityEnvironment from './CityEnvironment'
import LandmarkBuilding from './LandmarkBuilding'
import CityHUD from './CityHUD'
import CinematicIntro from './CinematicIntro'
import { cityLandmarks, landmarkIds, CITY_OVERVIEW_CAMERA } from './cityData'
import DestinationPanel from '../three/DestinationPanel'

// Smooth camera controller that transitions between overview and selected landmarks
function CameraManager({
  activeLandmarkId,
  isIntroPlaying,
}: {
  activeLandmarkId: string | null
  isIntroPlaying: boolean
}) {
  const { camera } = useThree()
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  
  // Target position and lookAt vectors
  const targetCamPos = useRef(new THREE.Vector3(...CITY_OVERVIEW_CAMERA.position))
  const targetLookAt = useRef(new THREE.Vector3(...CITY_OVERVIEW_CAMERA.target))

  // Update target when landmark changes
  useEffect(() => {
    if (activeLandmarkId) {
      const landmark = cityLandmarks.find((l) => l.id === activeLandmarkId)
      if (landmark) {
        targetCamPos.current.set(
          landmark.position[0] + landmark.cameraOffset[0],
          landmark.position[1] + landmark.cameraOffset[1],
          landmark.position[2] + landmark.cameraOffset[2],
        )
        targetLookAt.current.set(
          landmark.position[0],
          landmark.position[1] + 2.5,
          landmark.position[2],
        )
      }
    } else {
      targetCamPos.current.set(...CITY_OVERVIEW_CAMERA.position)
      targetLookAt.current.set(...CITY_OVERVIEW_CAMERA.target)
    }
  }, [activeLandmarkId])

  useFrame((_, delta) => {
    if (isIntroPlaying) return

    // Smoothly lerp camera position
    camera.position.lerp(targetCamPos.current, 3.8 * delta)

    // Smoothly update OrbitControls target
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, 3.8 * delta)
      controlsRef.current.update()
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2.25}
      minPolarAngle={Math.PI / 8}
      minDistance={16}
      maxDistance={85}
      target={CITY_OVERVIEW_CAMERA.target}
    />
  )
}

export default function CityScene() {
  const [activeLandmark, setActiveLandmark] = useState<string | null>(null)
  const [isIntroActive, setIsIntroActive] = useState(true)

  // Open landmark panel & sync URL hash
  const selectLandmark = useCallback((id: string) => {
    setActiveLandmark(id)
    window.history.replaceState(null, '', `#dest=${id}`)
  }, [])

  // Close panel & return to city overview
  const resetToOverview = useCallback(() => {
    setActiveLandmark(null)
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  }, [])

  // Sync with browser URL hash
  useEffect(() => {
    const handleHash = () => {
      const match = /#dest=([\w-]+)/.exec(window.location.hash)
      const id = match?.[1]
      if (id && landmarkIds.has(id)) {
        setActiveLandmark(id)
        setIsIntroActive(false)
      } else if (!id) {
        setActiveLandmark(null)
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  // Keyboard controls: ESC to reset/close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        resetToOverview()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [resetToOverview])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100dvh', overflow: 'hidden', background: '#090e24' }}>
      <Canvas
        shadows
        camera={{
          fov: 38,
          near: 0.5,
          far: 240,
          position: CITY_OVERVIEW_CAMERA.position,
        }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        {/* Deep midnight blue backdrop & atmospheric fog */}
        <color attach="background" args={['#080d22']} />
        <fog attach="fog" args={['#080d22', 40, 160]} />

        {/* -------------------- NIGHT LIGHTING -------------------- */}
        {/* Soft Ambient Moonlight */}
        <ambientLight intensity={0.55} color="#435585" />

        {/* Directional Key Moonbeam with soft shadows */}
        <directionalLight
          position={[38, 55, 32]}
          intensity={1.15}
          color="#dbeafe"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={10}
          shadow-camera-far={120}
          shadow-camera-left={-32}
          shadow-camera-right={32}
          shadow-camera-top={32}
          shadow-camera-bottom={-32}
          shadow-bias={-0.0005}
        />

        {/* Warm City Glow Uplights */}
        <pointLight position={[0, 8, 2]} intensity={25} distance={30} color="#fbbf24" />
        <pointLight position={[-16, 6, -6]} intensity={20} distance={25} color="#38bdf8" />
        <pointLight position={[16, 6, 16]} intensity={20} distance={25} color="#f59e0b" />
        <pointLight position={[-14, 6, 16]} intensity={20} distance={25} color="#2dd4bf" />

        <Suspense fallback={null}>
          <CityIsland />
          <CityBuildings />
          <CityEnvironment />

          {/* Landmarks */}
          {cityLandmarks.map((landmark) => (
            <LandmarkBuilding
              key={landmark.id}
              landmark={landmark}
              isSelected={activeLandmark === landmark.id}
              onSelect={selectLandmark}
            />
          ))}

          <CameraManager activeLandmarkId={activeLandmark} isIntroPlaying={isIntroActive} />
        </Suspense>
      </Canvas>

      {/* Cinematic Intro Overlay */}
      {isIntroActive && (
        <CinematicIntro
          onStart={() => setIsIntroActive(false)}
          onSelectLandmark={(id) => {
            setIsIntroActive(false)
            selectLandmark(id)
          }}
        />
      )}

      {/* City Navigation HUD */}
      {!isIntroActive && (
        <CityHUD
          activeLandmarkId={activeLandmark}
          onSelectLandmark={selectLandmark}
          onResetOverview={resetToOverview}
        />
      )}

      {/* Destination / Landmark Info Panel */}
      {activeLandmark && (
        <DestinationPanel destinationId={activeLandmark} onClose={resetToOverview} />
      )}
    </div>
  )
}
