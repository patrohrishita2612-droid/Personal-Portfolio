import { Canvas } from '@react-three/fiber'
import { Suspense, useMemo, useRef, useState, useEffect } from 'react'
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
import { useControls } from './useControls'
import { destinations, destinationIds } from './destinations'
import { INTERACTION_DISTANCE } from './Destination'

export default function SpaceScene() {
  const controls = useControls()
  const spacecraftRef = useRef<THREE.Group>(null)
  // Which destination panel is open (null = none). 'projects' = Mission Select.
  const [activePanel, setActivePanel] = useState<string | null>(null)

  const openPanel = (id: string) => {
    setActivePanel(id)
    window.history.replaceState(null, '', `#dest=${id}`)
  }

  const closePanel = () => {
    setActivePanel(null)
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  }

  // Hash routing: #dest=<id> opens a destination directly (deep links + back/forward)
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

  // Painted gradient sky — layered colour instead of an empty black void
  const skyTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 8
    canvas.height = 512
    const context = canvas.getContext('2d')
    if (!context) return null
    const gradient = context.createLinearGradient(0, 0, 0, 512)
    gradient.addColorStop(0, '#2b1a5e')   // zenith — violet
    gradient.addColorStop(0.3, '#182a66') // indigo
    gradient.addColorStop(0.58, '#0d1a44') // deep navy
    gradient.addColorStop(0.78, '#2a1c4e') // plum band
    gradient.addColorStop(1, '#3d1f3f')   // warm dusty horizon
    context.fillStyle = gradient
    context.fillRect(0, 0, 8, 512)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter') {
        // Open the destination we're parked next to; otherwise fall back to
        // Projects (Mission Select), exactly like the original behaviour
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
      } else if (e.code === 'Escape') {
        closePanel()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <>
      <Canvas
        camera={{ fov: 60, near: 0.1, far: 6000, position: [0, 5, -30] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        {/* Deep navy backdrop + gradient sky shell so the void has painted layers */}
        <color attach="background" args={['#101d4d']} />
        <fog attach="fog" args={['#101d4d', 500, 4200]} />
        {skyTexture && (
          <mesh>
            <sphereGeometry args={[5000, 24, 32]} />
            {/* fog off — the dome must never wash out to flat fog colour */}
            <meshBasicMaterial map={skyTexture} side={THREE.BackSide} fog={false} depthWrite={false} />
          </mesh>
        )}

        {/* Ambient base lighting — soft lift so surfaces stay readable */}
        <ambientLight intensity={0.3} color="#5f74c4" />

        {/* Key light — cool daylight from upper right */}
        <directionalLight position={[15, 20, 8]} intensity={1.0} color="#d8e6ff" />

        {/* Rim light — warm from behind left */}
        <directionalLight position={[-20, 5, -15]} intensity={0.55} color="#ffb287" />

        {/* Fill — faint magenta from below */}
        <pointLight position={[0, -15, 5]} intensity={0.35} color="#ff77b3" distance={50} />

        <Suspense fallback={null}>
          <Starfield />
          <Nebulae />
          {/* Primary landmark ahead-left + a second, dimmer galaxy behind the
              player so turning around never meets an empty void */}
          <Galaxy />
          <Galaxy position={[680, -240, -2350]} rotation={[-1.05, 0.2, -0.35]} scale={0.72} />
          <Scenery />
          <SpaceObjects />
          <Spacecraft controls={controls} groupRef={spacecraftRef} />
          <CameraRig controls={controls} target={spacecraftRef} />
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
            />
          ))}
        </Suspense>
      </Canvas>
      {activePanel && (
        <DestinationPanel destinationId={activePanel} onClose={closePanel} />
      )}
    </>
  )
}
