import { useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import type { MutableRefObject, CSSProperties } from 'react'
import type { PlanetPalette } from './destinations'
import './Destination.css'

type Props = {
  position: [number, number, number]
  name: string
  /** Optional second label line, e.g. MISSION SELECT */
  subtitle?: string
  /** Accent colour for the label sub-line + panel identity */
  accent?: string
  /** Surface palette — defaults to the original Projects planet look */
  palette?: PlanetPalette
  scale?: number
  ring?: boolean
  moons?: boolean
  type?: 'planet' | 'moon' | 'crystal' | 'star' | 'satellite' | 'anomaly'
  /** Projects keeps its original three-light rig; others use key + rim */
  fullLights?: boolean
  spacecraftRef: MutableRefObject<THREE.Group | null>
  onExplore?: () => void
}

export const INTERACTION_DISTANCE = 32

const DEFAULT_PALETTE: PlanetPalette = {
  deep: '#16215f',
  mid: '#3a72c9',
  light: '#56cbe6',
  accent: '#2fa5ae',
  pole: '#dde6f5',
}

// Scratch vectors for per-frame label visibility checks
const scratchA = new THREE.Vector3()
const scratchB = new THREE.Vector3()

// Generates procedural illustrated cartoon planet texture
function createCartoonPlanetTexture(p: PlanetPalette): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  // Base planetary fill
  ctx.fillStyle = p.mid
  ctx.fillRect(0, 0, 512, 256)

  // Bold wavy cartoon latitude bands
  const bands = [
    { y: 38, h: 26, color: p.deep, wave: 12, freq: 3 },
    { y: 72, h: 20, color: p.light, wave: 8, freq: 4 },
    { y: 104, h: 42, color: p.accent, wave: 16, freq: 2 },
    { y: 154, h: 28, color: p.deep, wave: 14, freq: 3 },
    { y: 190, h: 20, color: p.light, wave: 9, freq: 5 },
  ]

  for (const b of bands) {
    ctx.fillStyle = b.color
    ctx.beginPath()
    ctx.moveTo(0, b.y)
    for (let x = 0; x <= 512; x += 16) {
      const cy = b.y + Math.sin((x / 512) * Math.PI * 2 * b.freq) * b.wave
      ctx.lineTo(x, cy)
    }
    for (let x = 512; x >= 0; x -= 16) {
      const cy = b.y + b.h + Math.sin((x / 512) * Math.PI * 2 * b.freq + 0.4) * b.wave
      ctx.lineTo(x, cy)
    }
    ctx.closePath()
    ctx.fill()
  }

  // Cartoon crater dots with inner shadow and highlight rim
  const craters = [
    { x: 80, y: 55, r: 14 },
    { x: 140, y: 125, r: 22 },
    { x: 260, y: 75, r: 16 },
    { x: 330, y: 165, r: 20 },
    { x: 420, y: 88, r: 13 },
    { x: 460, y: 165, r: 14 },
    { x: 210, y: 185, r: 15 },
    { x: 490, y: 45, r: 10 },
  ]

  for (const c of craters) {
    // Outer highlight rim
    ctx.fillStyle = p.pole
    ctx.beginPath()
    ctx.arc(c.x, c.y, c.r + 2, 0, Math.PI * 2)
    ctx.fill()

    // Inner shadow floor
    ctx.fillStyle = p.deep
    ctx.beginPath()
    ctx.arc(c.x + 1.5, c.y + 1.5, c.r, 0, Math.PI * 2)
    ctx.fill()

    // Base crater floor
    ctx.fillStyle = p.mid
    ctx.beginPath()
    ctx.arc(c.x - 1, c.y - 1, Math.max(1, c.r - 2.5), 0, Math.PI * 2)
    ctx.fill()

    // Crescent highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
    ctx.beginPath()
    ctx.arc(c.x - 2, c.y - 2, Math.max(1, c.r - 6), 0, Math.PI * 2)
    ctx.fill()
  }

  // Wavy cartoon polar caps
  ctx.fillStyle = p.pole
  // North cap
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(512, 0)
  ctx.lineTo(512, 24)
  for (let x = 512; x >= 0; x -= 16) {
    ctx.lineTo(x, 22 + Math.sin((x / 512) * Math.PI * 8) * 5)
  }
  ctx.closePath()
  ctx.fill()

  // South cap
  ctx.beginPath()
  ctx.moveTo(0, 256)
  ctx.lineTo(512, 256)
  ctx.lineTo(512, 232)
  for (let x = 512; x >= 0; x -= 16) {
    ctx.lineTo(x, 234 - Math.sin((x / 512) * Math.PI * 8) * 5)
  }
  ctx.closePath()
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// Generates procedural striped cartoon ring texture
function createCartoonRingTexture(p: PlanetPalette): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 16
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  const grad = ctx.createLinearGradient(0, 0, 256, 0)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(0.12, p.deep)
  grad.addColorStop(0.28, p.accent)
  grad.addColorStop(0.48, p.light)
  grad.addColorStop(0.65, p.mid)
  grad.addColorStop(0.85, p.pole)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 16)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export default function Destination({
  position,
  name,
  subtitle,
  accent = '#46e0e8',
  palette,
  scale = 1,
  ring = true,
  moons = true,
  type = 'planet',
  fullLights = false,
  spacecraftRef,
  onExplore,
}: Props) {
  const { camera } = useThree()
  const planetRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const moonOrbitRef = useRef<THREE.Group>(null)
  const crystalRef = useRef<THREE.Group>(null)
  const anomalyRef = useRef<THREE.Group>(null)
  const [nearby, setNearby] = useState(false)
  const [labelMode, setLabelMode] = useState<'on' | 'faded' | 'off'>('on')

  const p = palette ?? DEFAULT_PALETTE

  // Procedural illustrated textures
  const planetTexture = useMemo(() => createCartoonPlanetTexture(p), [p])
  const ringTexture = useMemo(() => createCartoonRingTexture(p), [p])

  // Geometries
  const planetSphereGeo = useMemo(() => new THREE.SphereGeometry(7.8, 48, 48), [])
  const atmosphereGeo = useMemo(() => new THREE.SphereGeometry(9.6, 32, 32), [])
  const moonGeo = useMemo(() => new THREE.SphereGeometry(1.6, 16, 16), [])

  // Dotted orbital path circle around galaxy center
  const orbitLine = useMemo(() => {
    const r = Math.hypot(position[0], position[2])
    if (r < 15) return null
    const pts: THREE.Vector3[] = []
    const segments = 128
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(theta) * r - position[0], 0, Math.sin(theta) * r - position[2]))
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    const mat = new THREE.LineDashedMaterial({
      color: accent,
      dashSize: 5,
      gapSize: 4,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    })
    const line = new THREE.Line(geo, mat)
    line.computeLineDistances()
    return line
  }, [position, accent])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.06 * delta
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.08 * delta
    }
    if (moonOrbitRef.current) {
      moonOrbitRef.current.rotation.y += 0.12 * delta
    }
    if (crystalRef.current) {
      crystalRef.current.rotation.y += 0.35 * delta
      crystalRef.current.rotation.x = Math.sin(t * 0.8) * 0.15
    }
    if (anomalyRef.current) {
      anomalyRef.current.rotation.y += 0.25 * delta
      anomalyRef.current.rotation.z += 0.18 * delta
    }

    const ship = spacecraftRef.current
    if (ship) {
      const dist = ship.position.distanceTo(scratchA.set(...position))
      setNearby(dist < INTERACTION_DISTANCE)
    }

    // Label visibility & camera facing checks
    const toSelf = scratchA.set(...position).sub(camera.position)
    const distToCam = toSelf.length()
    camera.getWorldDirection(scratchB)
    const inFront = toSelf.dot(scratchB) > 0
    const mode = !inFront ? 'off' : distToCam > 900 ? 'faded' : 'on'
    setLabelMode((prev) => (prev === mode ? prev : mode))
  })

  return (
    <group position={position} scale={scale}>
      {/* Delicate cyan dotted orbital path line running through the solar system */}
      {orbitLine && <primitive object={orbitLine} />}

      {/* Subtle distant beacon halo for long-range discovery */}
      <mesh>
        <sphereGeometry args={[22, 16, 16]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Visual Object Render by Type */}

      {type === 'star' ? (
        /* Star Cluster / Golden Stellar Core for ACHIEVEMENTS */
        <group ref={planetRef}>
          <mesh>
            <sphereGeometry args={[7.8, 32, 32]} />
            <meshStandardMaterial
              color="#fffbeb"
              emissive="#f59e0b"
              emissiveIntensity={2.0}
              roughness={0.15}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[10.5, 32, 32]} />
            <meshBasicMaterial
              color="#fbbf24"
              transparent
              opacity={0.35}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[15, 32, 32]} />
            <meshBasicMaterial
              color="#f97316"
              transparent
              opacity={0.15}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <pointLight color="#fde047" intensity={70} distance={80} />
        </group>
      ) : type === 'crystal' ? (
        /* Energy Cluster / Crystalline Body for SKILLS */
        <group ref={crystalRef}>
          <mesh>
            <octahedronGeometry args={[8, 0]} />
            <meshStandardMaterial
              color={p.light}
              emissive={p.mid}
              emissiveIntensity={0.8}
              metalness={0.4}
              roughness={0.15}
              flatShading
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[10.5, 32, 32]} />
            <meshBasicMaterial
              color={p.light}
              transparent
              opacity={0.28}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
            <ringGeometry args={[11, 15, 48]} />
            <meshStandardMaterial
              color={p.accent}
              emissive={p.light}
              emissiveIntensity={0.7}
              transparent
              opacity={0.75}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ) : type === 'anomaly' ? (
        /* Cosmic Anomaly / Pulsating Beacon for CONTACT */
        <group ref={anomalyRef}>
          <mesh>
            <dodecahedronGeometry args={[7.2, 1]} />
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#22d3ee"
              emissiveIntensity={0.9}
              roughness={0.25}
              flatShading
            />
          </mesh>
          <mesh ref={ringRef} rotation={[Math.PI / 4, Math.PI / 6, 0]}>
            <ringGeometry args={[11, 15, 48]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#06b6d4"
              emissiveIntensity={0.8}
              transparent
              opacity={0.75}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 3, -Math.PI / 4, 0]}>
            <ringGeometry args={[13.5, 17.5, 48]} />
            <meshStandardMaterial
              color="#c084fc"
              emissive="#a855f7"
              emissiveIntensity={0.7}
              transparent
              opacity={0.65}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ) : type === 'moon' ? (
        /* Moon / Atmospheric World for ABOUT */
        <group ref={planetRef}>
          <mesh geometry={planetSphereGeo}>
            <meshStandardMaterial
              map={planetTexture}
              roughness={0.45}
              metalness={0.06}
              emissive={p.deep}
              emissiveIntensity={0.25}
            />
          </mesh>
          <mesh geometry={atmosphereGeo}>
            <meshBasicMaterial
              color={p.light}
              transparent
              opacity={0.22}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ) : type === 'satellite' ? (
        /* Moon with Orbital Satellite Probe for RESUME */
        <group ref={planetRef}>
          <mesh geometry={planetSphereGeo}>
            <meshStandardMaterial
              map={planetTexture}
              roughness={0.45}
              metalness={0.06}
              emissive={p.deep}
              emissiveIntensity={0.25}
            />
          </mesh>
          <mesh geometry={atmosphereGeo}>
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.22}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <group ref={moonOrbitRef}>
            <mesh position={[12, 0, 0]}>
              <boxGeometry args={[1.5, 0.9, 0.9]} />
              <meshStandardMaterial color="#fffbeb" emissive="#38bdf8" emissiveIntensity={0.6} metalness={0.6} />
            </mesh>
            <mesh position={[12, 0, 0]}>
              <boxGeometry args={[3.6, 0.08, 0.7]} />
              <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.4} metalness={0.8} />
            </mesh>
          </group>
        </group>
      ) : (
        /* Illustrated Cartoon Planet (PROJECTS, BASE, EDUCATION, EXPERIENCE) */
        <group ref={planetRef}>
          <mesh geometry={planetSphereGeo}>
            <meshStandardMaterial
              map={planetTexture}
              roughness={0.38}
              metalness={0.06}
              emissive={p.deep}
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* Atmospheric Soft Rim Glow */}
          <mesh geometry={atmosphereGeo}>
            <meshBasicMaterial
              color={p.light}
              transparent
              opacity={0.2}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[11, 32, 32]} />
            <meshBasicMaterial
              color={accent}
              transparent
              opacity={0.06}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {/* Lighting for cartoon form definition */}
      <pointLight position={[-10, 7, -8]} color="#fffbeb" intensity={42} distance={60} />
      <pointLight position={[9, -3, 7]} color="#38bdf8" intensity={15} distance={40} />
      {fullLights && <pointLight position={[3, 9, -3]} color="#fde047" intensity={10} distance={30} />}

      {/* Orbiting moons */}
      {moons && type === 'planet' && (
        <group ref={moonOrbitRef} rotation={[0.42, 0, 0.16]}>
          <mesh geometry={moonGeo} position={[13.5, 0, 0]}>
            <meshStandardMaterial
              color={p.light}
              roughness={0.5}
              metalness={0.05}
              emissive={p.deep}
              emissiveIntensity={0.25}
            />
          </mesh>
          <mesh geometry={moonGeo} position={[-16.5, 0, 0]} scale={0.65}>
            <meshStandardMaterial
              color={p.accent}
              roughness={0.5}
              metalness={0.05}
              emissive={p.mid}
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>
      )}

      {/* Striped cartoon rings */}
      {ring && type === 'planet' && (
        <mesh ref={ringRef} rotation={[Math.PI / 2.6, 0.2, 0]}>
          <ringGeometry args={[11.5, 18.5, 64]} />
          <meshStandardMaterial
            map={ringTexture}
            roughness={0.4}
            metalness={0.1}
            transparent
            opacity={0.88}
            side={THREE.DoubleSide}
            emissive={p.accent}
            emissiveIntensity={0.25}
          />
        </mesh>
      )}

      {/* Floating Label */}
      <Html position={[0, 16, 0]} center occlude={false} zIndexRange={[10, 0]}>
        <div
          className={`destination-label label-${labelMode}`}
          style={{ '--label-accent': accent } as CSSProperties}
        >
          <span className="destination-label-dot" style={{ backgroundColor: accent }} />
          <span className="destination-label-name">{name}</span>
          {subtitle && <span className="destination-label-sub">{subtitle}</span>}
        </div>
      </Html>

      {/* Proximity prompt */}
      {nearby && labelMode !== 'off' && (
        <Html position={[0, 11.5, 0]} center distanceFactor={34} occlude={false} zIndexRange={[11, 0]}>
          <div
            className="destination-prompt"
            onClick={() => onExplore?.()}
            role="button"
            tabIndex={0}
          >
            <span className="prompt-icon">➜</span>
            <span>PRESS ENTER / TAP TO EXPLORE</span>
          </div>
        </Html>
      )}
    </group>
  )
}
