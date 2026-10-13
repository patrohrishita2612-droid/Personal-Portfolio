import { Canvas } from '@react-three/fiber'
import { Suspense, useMemo, useRef, useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import Starfield from './Starfield'
import Nebulae from './Nebulae'
import Galaxy from './Galaxy'
import Scenery from './Scenery'
import SpaceObjects from './SpaceObjects'
import Spacecraft from './Spacecraft'
import CameraRig from './CameraRig'
import Destination from './Destination'
import DestinationPanel from './DestinationPanel'
import HUD from './HUD'
import Asteroids from './Asteroids'
import Collectibles from './Collectibles'
import GameHUD from './GameHUD'
import GameTicker from './GameTicker'
import { useControls } from './useControls'
import { destinations, destinationIds } from './destinations'
import { INTERACTION_DISTANCE } from './Destination'
import { getSnapshot, setMode, togglePause } from './GameManager'
import type { GameMode } from './GameManager'

export default function SpaceScene() {
  const controls = useControls()
  const spacecraftRef = useRef<THREE.Group>(null)
  const shakeRef = useRef(0)          // impact shake intensity
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [gameMode, setGameMode] = useState<GameMode>('explore')

  const openPanel = (id: string) => {
    setActivePanel(id)
    window.history.replaceState(null, '', `#dest=${id}`)
  }

  const closePanel = () => {
    setActivePanel(null)
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  }

  const handleExplore = useCallback(() => {
    const ship = spacecraftRef.current
    let nearestId: string | null = null
    let nearestDistSq = INTERACTION_DISTANCE * INTERACTION_DISTANCE
    if (ship) {
      for (const dest of destinations) {
        const dx = ship.position.x - dest.position[0]
        const dy = ship.position.y - dest.position[1]
        const dz = ship.position.z - dest.position[2]
        const distSq = dx * dx + dy * dy + dz * dz
        if (distSq <= nearestDistSq) {
          nearestDistSq = distSq
          nearestId = dest.id
        }
      }
    }
    openPanel(nearestId ?? 'projects')
  }, [])

  // Hash routing
  useEffect(() => {
    const readHash = () => {
      const match = /#dest=([\w-]+)/.exec(window.location.hash)
      const id = match?.[1]
      setActivePanel(id && destinationIds.has(id) ? id : null)
    }
    readHash()
    window.addEventListener('hashchange', readHash)
    return () => window.removeEventListener('hashchange', readHash)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter') {
        handleExplore()
      } else if (e.code === 'Escape') {
        closePanel()
      } else if (e.code === 'KeyP') {
        const snap = getSnapshot()
        if (snap.mode === 'game') togglePause()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleExplore])

  const handleModeChange = useCallback((m: GameMode) => {
    setGameMode(m)
    setMode(m)
  }, [])

  const handleShake = useCallback(() => {
    shakeRef.current = 1.2
  }, [])

  // Painted gradient sky
  const skyTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 8
    canvas.height = 512
    const context = canvas.getContext('2d')
    if (!context) return null
    const gradient = context.createLinearGradient(0, 0, 0, 512)
    gradient.addColorStop(0, '#2b1a5e')
    gradient.addColorStop(0.3, '#182a66')
    gradient.addColorStop(0.58, '#0d1a44')
    gradient.addColorStop(0.78, '#2a1c4e')
    gradient.addColorStop(1, '#3d1f3f')
    context.fillStyle = gradient
    context.fillRect(0, 0, 8, 512)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])

  return (
    <>
      <Canvas
        camera={{ fov: 60, near: 0.1, far: 2500, position: [0, 5, -30] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#101d4d']} />
        <fog attach="fog" args={['#101d4d', 200, 1600]} />
        {skyTexture && (
          <mesh>
            <sphereGeometry args={[5000, 24, 32]} />
            <meshBasicMaterial map={skyTexture} side={THREE.BackSide} fog={false} depthWrite={false} />
          </mesh>
        )}

        <ambientLight intensity={0.3} color="#5f74c4" />
        <directionalLight position={[15, 20, 8]} intensity={1.0} color="#d8e6ff" />
        <directionalLight position={[-20, 5, -15]} intensity={0.55} color="#ffb287" />
        <pointLight position={[0, -15, 5]} intensity={0.35} color="#ff77b3" distance={50} />

        <Suspense fallback={null}>
          <Starfield />
          <Nebulae />
          <Galaxy />
          <Galaxy position={[240, -85, -820]} rotation={[-1.05, 0.2, -0.35]} scale={0.72} />
          <Scenery />
          <SpaceObjects />
          <Spacecraft controls={controls} groupRef={spacecraftRef} />
          <CameraRig controls={controls} target={spacecraftRef} />
          <GameTicker spacecraftRef={spacecraftRef} shakeRef={shakeRef} />

          {/* Game mode elements */}
          <Asteroids
            spacecraftRef={spacecraftRef}
            mode={gameMode}
            onShake={handleShake}
          />
          <Collectibles
            spacecraftRef={spacecraftRef}
            mode={gameMode}
          />

          {destinations.map((dest) => (
            <Destination
              key={dest.id}
              position={dest.position}
              name={dest.name}
              subtitle={dest.subtitle}
              accent={dest.accent}
              palette={dest.palette}
              scale={dest.scale}
              ring={dest.ring}
              moons={dest.moons}
              fullLights={dest.fullLights}
              spacecraftRef={spacecraftRef}
              onExplore={() => openPanel(dest.id)}
            />
          ))}
        </Suspense>
      </Canvas>

      {/* DOM overlays */}
      <HUD controls={controls} onExplore={handleExplore} />
      <GameHUD onModeChange={handleModeChange} />
      {activePanel && (
        <DestinationPanel destinationId={activePanel} onClose={closePanel} />
      )}
    </>
  )
}
