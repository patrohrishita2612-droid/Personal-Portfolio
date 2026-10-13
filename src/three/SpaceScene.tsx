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
import ShootingStars from './ShootingStars'
import GameHUD from './GameHUD'
import GameTicker from './GameTicker'
import StartScreen from './StartScreen'
import { useControls } from './useControls'
import { destinations, destinationIds } from './destinations'
import { INTERACTION_DISTANCE } from './Destination'
import { getSnapshot, setPaused, togglePause, respawnShip } from './GameManager'

export default function SpaceScene() {
  const controls = useControls()
  const spacecraftRef = useRef<THREE.Group>(null)
  const shakeRef = useRef(0) // impact shake intensity
  const [activePanel, setActivePanel] = useState<string | null>(null)

  const openPanel = useCallback((id: string) => {
    setActivePanel(id)
    setPaused(true) // pause game hazards while reading portfolio
    window.history.replaceState(null, '', `#dest=${id}`)
  }, [])

  const closePanel = useCallback(() => {
    setActivePanel(null)
    setPaused(false) // resume game hazards
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  }, [])

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
  }, [openPanel])

  // Hash routing
  useEffect(() => {
    const readHash = () => {
      const match = /#dest=([\w-]+)/.exec(window.location.hash)
      const id = match?.[1]
      if (id && destinationIds.has(id)) {
        setActivePanel(id)
        setPaused(true)
      } else {
        setActivePanel(null)
        setPaused(false)
      }
    }
    readHash()
    window.addEventListener('hashchange', readHash)
    return () => window.removeEventListener('hashchange', readHash)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter') {
        const snap = getSnapshot()
        if (snap.isCrashed) {
          respawnShip()
        } else if (!activePanel) {
          handleExplore()
        }
      } else if (e.code === 'Escape') {
        if (activePanel) {
          closePanel()
        }
      } else if (e.code === 'KeyP') {
        if (!activePanel) togglePause()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activePanel, closePanel, handleExplore])

  const handleShake = useCallback(() => {
    shakeRef.current = 1.4
  }, [])

  // Painted gradient sky
  const skyTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 8
    canvas.height = 512
    const context = canvas.getContext('2d')
    if (!context) return null
    const gradient = context.createLinearGradient(0, 0, 0, 512)
    gradient.addColorStop(0, '#23154c')   // deep cosmic violet
    gradient.addColorStop(0.28, '#141a4a') // deep indigo
    gradient.addColorStop(0.55, '#070b25') // midnight space navy
    gradient.addColorStop(0.78, '#18244e') // twilight cyan-blue
    gradient.addColorStop(1, '#2d1844')   // dusky magenta base
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
        <color attach="background" args={['#070b25']} />
        <fog attach="fog" args={['#070b25', 250, 1800]} />
        {skyTexture && (
          <mesh>
            <sphereGeometry args={[5000, 24, 32]} />
            <meshBasicMaterial map={skyTexture} side={THREE.BackSide} fog={false} depthWrite={false} />
          </mesh>
        )}

        <ambientLight intensity={0.55} color="#7b8ed9" />
        <directionalLight position={[20, 25, 10]} intensity={1.3} color="#fff4e0" />
        <directionalLight position={[-25, 8, -18]} intensity={0.8} color="#38bdf8" />
        <pointLight position={[0, -15, 5]} intensity={0.5} color="#e879f9" distance={60} />

        <Suspense fallback={null}>
          <Starfield />
          <Nebulae />
          <Galaxy />
          <Galaxy position={[240, -85, -820]} rotation={[-1.05, 0.2, -0.35]} scale={0.72} />
          <ShootingStars />
          <Scenery />
          <SpaceObjects />
          <Spacecraft controls={controls} groupRef={spacecraftRef} />
          <CameraRig controls={controls} target={spacecraftRef} />
          <GameTicker spacecraftRef={spacecraftRef} shakeRef={shakeRef} />

          {/* Active survival game systems */}
          <Asteroids
            spacecraftRef={spacecraftRef}
            onShake={handleShake}
          />
          <Collectibles
            spacecraftRef={spacecraftRef}
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

      {/* Unified HUD & Portfolio Modals */}
      <HUD controls={controls} onExplore={handleExplore} />
      <GameHUD
        isPanelOpen={Boolean(activePanel)}
        spacecraftRef={spacecraftRef}
        onOpenPortfolioDirectly={() => openPanel('projects')}
      />
      <StartScreen onOpenPortfolioDirectly={() => openPanel('projects')} />
      {activePanel && (
        <DestinationPanel destinationId={activePanel} onClose={closePanel} />
      )}
    </>
  )
}
