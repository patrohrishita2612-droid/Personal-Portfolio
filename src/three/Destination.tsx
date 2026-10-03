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
}

export const INTERACTION_DISTANCE = 35

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
}: Props) {
  const { camera } = useThree()
  const planetRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const moonOrbitRef = useRef<THREE.Group>(null)
  const crystalRef = useRef<THREE.Group>(null)
  const anomalyRef = useRef<THREE.Group>(null)
  const [nearby, setNearby] = useState(false)
  const [labelMode, setLabelMode] = useState<'on' | 'faded' | 'off'>('on')

  // Planet surface geometry with procedural color bands
  const planetGeo = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(8, 3)
    const positions = geometry.getAttribute('position')
    const colors = new Float32Array(positions.count * 3)
    const p = palette ?? DEFAULT_PALETTE
    const abyss = new THREE.Color(p.deep)
    const cobalt = new THREE.Color(p.mid)
    const cyan = new THREE.Color(p.light)
    const teal = new THREE.Color(p.accent)
    const silver = new THREE.Color(p.pole)
    const cloudWhite = new THREE.Color('#f2f7ff')

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i) / 8
      const y = positions.getY(i) / 8
      const z = positions.getZ(i) / 8
      const longitude = Math.atan2(z, x)

      const grain = Math.sin(longitude * 7.3 + y * 11.7) * Math.cos(longitude * 5.1 - y * 8.3)
      const stripe = Math.sin(y * 9 + Math.sin(longitude * 3) * 0.9)
      const band = 0.5 + 0.5 * Math.sin(longitude * 2 + y * 4.5)
      const current = abyss.clone().lerp(cobalt, 0.3 + 0.34 * band + 0.14 * grain + 0.08 * stripe)

      const shallow = Math.max(0, Math.sin(longitude * 1.7 - y * 3.4 + grain * 0.6) - 0.3) * 0.6
      const tealRegion = Math.max(0, Math.cos(longitude * 2.6 + y * 4.1 + grain * 0.4) - 0.7) * 0.55
      const silverRegion = Math.max(
        0,
        Math.sin(longitude * 1.15 + y * 2.6) * Math.cos(longitude * 2.4 - y * 1.7) - 0.58,
      ) * 1.35

      const polar = Math.max(0, (Math.abs(y) - 0.66) / 0.34)
      const cloud = Math.max(0, stripe - 0.5) * 0.5 * (1 - Math.abs(y) * 0.5)

      current.lerp(cyan, Math.min(0.8, shallow))
      current.lerp(teal, tealRegion)
      current.lerp(silver, Math.min(0.7, silverRegion))
      current.lerp(silver, Math.min(0.92, polar * (0.7 + 0.3 * stripe)))
      current.lerp(cloudWhite, cloud)

      colors[i * 3] = current.r
      colors[i * 3 + 1] = current.g
      colors[i * 3 + 2] = current.b
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geometry
  }, [palette])

  const atmosphereGeo = useMemo(() => new THREE.SphereGeometry(10.5, 32, 32), [])
  const ringGeo = useMemo(() => new THREE.TorusGeometry(14, 0.2, 8, 64), [])
  const outerRingGeo = useMemo(() => new THREE.TorusGeometry(17, 0.15, 8, 64), [])
  const moonGeo = useMemo(() => new THREE.IcosahedronGeometry(1.7, 2), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.05 * delta
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.15 * delta
    }
    if (moonOrbitRef.current) {
      moonOrbitRef.current.rotation.y += 0.12 * delta
    }
    if (crystalRef.current) {
      crystalRef.current.rotation.y += 0.4 * delta
      crystalRef.current.rotation.x = Math.sin(t * 0.8) * 0.15
    }
    if (anomalyRef.current) {
      anomalyRef.current.rotation.y += 0.3 * delta
      anomalyRef.current.rotation.z += 0.2 * delta
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
    const mode = !inFront ? 'off' : distToCam > 2800 ? 'faded' : 'on'
    setLabelMode((prev) => (prev === mode ? prev : mode))
  })

  const p = palette ?? DEFAULT_PALETTE

  return (
    <group position={position} scale={scale}>
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
            <sphereGeometry args={[7.5, 32, 32]} />
            <meshStandardMaterial
              color="#fff4d0"
              emissive="#ffd700"
              emissiveIntensity={1.8}
              roughness={0.2}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[10.5, 32, 32]} />
            <meshBasicMaterial
              color="#ffcc00"
              transparent
              opacity={0.25}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[14.5, 32, 32]} />
            <meshBasicMaterial
              color="#ffaa00"
              transparent
              opacity={0.1}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <pointLight color="#ffe066" intensity={60} distance={70} />
        </group>
      ) : type === 'crystal' ? (
        /* Energy Cluster / Crystalline Body for SKILLS */
        <group ref={crystalRef}>
          <mesh>
            <octahedronGeometry args={[8, 0]} />
            <meshStandardMaterial
              color={p.mid}
              emissive={p.light}
              emissiveIntensity={0.65}
              metalness={0.7}
              roughness={0.2}
              flatShading
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[10, 32, 32]} />
            <meshBasicMaterial
              color={p.light}
              transparent
              opacity={0.2}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh ref={ringRef} geometry={ringGeo} rotation={[Math.PI / 3, 0, 0]}>
            <meshStandardMaterial color={p.accent} emissive={p.light} emissiveIntensity={0.6} transparent opacity={0.6} />
          </mesh>
        </group>
      ) : type === 'anomaly' ? (
        /* Cosmic Anomaly / Pulsating Beacon for CONTACT */
        <group ref={anomalyRef}>
          <mesh>
            <dodecahedronGeometry args={[7, 1]} />
            <meshStandardMaterial
              color="#0e3f4a"
              emissive="#38bdf8"
              emissiveIntensity={0.8}
              roughness={0.3}
              wireframe={false}
            />
          </mesh>
          <mesh ref={ringRef} geometry={ringGeo} rotation={[Math.PI / 4, Math.PI / 6, 0]}>
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.8} transparent opacity={0.6} />
          </mesh>
          <mesh geometry={outerRingGeo} rotation={[-Math.PI / 3, -Math.PI / 4, 0]}>
            <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.6} transparent opacity={0.4} />
          </mesh>
        </group>
      ) : type === 'moon' ? (
        /* Moon / Atmospheric World for ABOUT */
        <group ref={planetRef}>
          <mesh>
            <sphereGeometry args={[7.5, 32, 32]} />
            <meshStandardMaterial color={p.mid} roughness={0.7} metalness={0.1} emissive={p.deep} emissiveIntensity={0.4} />
          </mesh>
          <mesh geometry={atmosphereGeo}>
            <meshBasicMaterial color={p.light} transparent opacity={0.18} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      ) : type === 'satellite' ? (
        /* Moon with Orbital Satellite Probe for RESUME */
        <group ref={planetRef}>
          <mesh>
            <icosahedronGeometry args={[7.2, 2]} />
            <meshStandardMaterial color={p.mid} roughness={0.85} metalness={0.15} emissive={p.deep} emissiveIntensity={0.3} flatShading />
          </mesh>
          <group ref={moonOrbitRef}>
            <mesh position={[11, 0, 0]}>
              <boxGeometry args={[1.4, 0.8, 0.8]} />
              <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.6} metalness={0.8} />
            </mesh>
          </group>
        </group>
      ) : (
        /* Standard Planet (PROJECTS, BASE, EDUCATION, EXPERIENCE) */
        <group ref={planetRef}>
          <mesh geometry={planetGeo}>
            <meshStandardMaterial color="#ffffff" vertexColors metalness={0.16} roughness={0.62} emissive="#060a1e" emissiveIntensity={0.35} flatShading />
          </mesh>
          <mesh geometry={atmosphereGeo}>
            <meshBasicMaterial color={p.light} transparent opacity={0.14} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[11.2, 32, 32]} />
            <meshBasicMaterial color="#a9c2ff" transparent opacity={0.035} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      )}

      {/* Lighting */}
      <pointLight position={[-10, 7, -8]} color="#e6f0ff" intensity={38} distance={54} />
      <pointLight position={[9, -3, 7]} color="#7fd8ea" intensity={10} distance={34} />
      {fullLights && <pointLight position={[3, 9, -3]} color="#f0c07a" intensity={7} distance={26} />}

      {/* Orbiting moons */}
      {moons && type === 'planet' && (
        <group ref={moonOrbitRef} rotation={[0.42, 0, 0.16]}>
          <mesh geometry={moonGeo} position={[13, 0, 0]}>
            <meshStandardMaterial color="#cfd7ea" roughness={0.95} metalness={0.04} emissive="#2a3050" emissiveIntensity={0.25} flatShading />
          </mesh>
          <mesh geometry={moonGeo} position={[-16, 0, 0]} scale={0.62}>
            <meshStandardMaterial color="#e3c9a8" roughness={0.95} metalness={0.03} emissive="#4a3520" emissiveIntensity={0.2} flatShading />
          </mesh>
        </group>
      )}

      {/* Orbiting rings */}
      {ring && type === 'planet' && (
        <mesh ref={ringRef} geometry={ringGeo} rotation={[Math.PI / 2.5, 0, 0]}>
          <meshStandardMaterial color="#e8cf96" emissive="#8a6a3c" emissiveIntensity={0.28} metalness={0.5} roughness={0.42} transparent opacity={0.55} />
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
          <div className="destination-prompt">
            <span className="prompt-icon">➜</span>
            <span>PRESS ENTER TO EXPLORE</span>
          </div>
        </Html>
      )}
    </group>
  )
}
