import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ---------------------------------------------------------------------------
// SpaceObjects — Environmental objects at compact-layout positions
// ---------------------------------------------------------------------------

interface AsteroidFieldProps {
  center: [number, number, number]
  radius: number
  count: number
  color: string
  speed?: number
}

function AsteroidField({ center, radius, count, color, speed = 0.02 }: AsteroidFieldProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.4, 1)
    const pos = geo.getAttribute('position')
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)
      const noise = (Math.sin(x * 3.5 + y * 2.1) + Math.cos(z * 3.2)) * 0.22
      pos.setXYZ(i, x * (1 + noise), y * (1 + noise), z * (1 + noise))
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.85,
        metalness: 0.15,
        flatShading: true,
      }),
    [color],
  )

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useMemo(() => {
    const seed = center[0] * 17 + center[2] * 31
    let pseudoRand = Math.sin(seed) * 10000

    const getRand = () => {
      pseudoRand = (pseudoRand * 9301 + 49297) % 233280
      return pseudoRand / 233280
    }

    setTimeout(() => {
      if (!meshRef.current) return
      for (let i = 0; i < count; i++) {
        const theta = getRand() * Math.PI * 2
        const phi = (getRand() - 0.5) * Math.PI * 0.4
        const dist = (0.2 + 0.8 * Math.sqrt(getRand())) * radius

        const x = Math.cos(theta) * Math.cos(phi) * dist
        const y = Math.sin(phi) * (dist * 0.35)
        const z = Math.sin(theta) * Math.cos(phi) * dist

        const scale = 0.6 + getRand() * 2.4
        dummy.position.set(x, y, z)
        dummy.rotation.set(getRand() * Math.PI, getRand() * Math.PI, getRand() * Math.PI)
        dummy.scale.set(scale * (0.8 + getRand() * 0.4), scale * (0.8 + getRand() * 0.4), scale)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
      }
      meshRef.current.instanceMatrix.needsUpdate = true
    }, 0)
  }, [count, radius, center, dummy])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += speed * delta
    }
  })

  return (
    <group position={center} ref={groupRef}>
      <instancedMesh ref={meshRef} args={[geometry, material, count]} castShadow receiveShadow />
    </group>
  )
}

function AbandonedSatellite({ position }: { position: [number, number, number] }) {
  const satelliteRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (satelliteRef.current) {
      satelliteRef.current.rotation.y += 0.15 * delta
      satelliteRef.current.rotation.z += 0.08 * delta
      satelliteRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 1.5
    }
  })

  return (
    <group ref={satelliteRef} position={position} scale={1.2}>
      <mesh>
        <octahedronGeometry args={[2.2, 0]} />
        <meshStandardMaterial color="#8a99ad" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[-5, 0, 0]}>
        <boxGeometry args={[5, 1.2, 0.1]} />
        <meshStandardMaterial color="#1e3a60" emissive="#102540" emissiveIntensity={0.5} metalness={0.95} />
      </mesh>
      <mesh position={[5, 0, 0]}>
        <boxGeometry args={[5, 1.2, 0.1]} />
        <meshStandardMaterial color="#1e3a60" emissive="#102540" emissiveIntensity={0.5} metalness={0.95} />
      </mesh>
      <mesh position={[0, 2.5, 0]} rotation={[-Math.PI / 4, 0, 0]}>
        <coneGeometry args={[1.5, 0.8, 16, 1, true]} />
        <meshStandardMaterial color="#b0c4de" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -2.4, 0]}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshBasicMaterial color="#ff3344" />
      </mesh>
      <pointLight position={[0, -2.4, 0]} color="#ff2233" intensity={4} distance={25} />
    </group>
  )
}

function FloatingCrystals({ position }: { position: [number, number, number] }) {
  const crystalRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += 0.1 * delta
      const t = state.clock.elapsedTime
      crystalRef.current.position.y = position[1] + Math.cos(t * 0.6) * 2.0
    }
  })

  return (
    <group ref={crystalRef} position={position}>
      {[
        { pos: [0, 0, 0] as [number, number, number], rot: [0, 0, 0], scale: 3.2 },
        { pos: [-2.5, -1, 1.5] as [number, number, number], rot: [0.3, 0.2, -0.4], scale: 2.1 },
        { pos: [2.8, -1.2, -1.2] as [number, number, number], rot: [-0.2, 0.4, 0.3], scale: 2.4 },
        { pos: [1.2, -2, 2.2] as [number, number, number], rot: [0.4, -0.3, 0.2], scale: 1.8 },
        { pos: [-1.8, -1.8, -2.0] as [number, number, number], rot: [-0.3, -0.2, -0.5], scale: 1.9 },
      ].map((c, i) => (
        <mesh key={i} position={c.pos} rotation={c.rot as [number, number, number]} scale={c.scale}>
          <coneGeometry args={[0.8, 3.5, 5]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.8}
            metalness={0.4}
            roughness={0.15}
            flatShading
          />
        </mesh>
      ))}
      <pointLight color="#38bdf8" intensity={12} distance={45} />
    </group>
  )
}

function RingDebris({ position }: { position: [number, number, number] }) {
  const ringRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.x += 0.05 * delta
      ringRef.current.rotation.y += 0.03 * delta
    }
  })

  return (
    <group ref={ringRef} position={position} rotation={[Math.PI / 4, Math.PI / 6, 0]}>
      <mesh>
        <torusGeometry args={[18, 0.6, 8, 48, Math.PI * 1.2]} />
        <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[14, 8, 0]}>
        <boxGeometry args={[3, 2, 2]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  )
}

export default function SpaceObjects() {
  return (
    <group>
      {/* Asteroid Belts repositioned for compact layout */}
      <AsteroidField center={[-50, 5, -10]} radius={20} count={60} color="#475569" speed={0.015} />
      <AsteroidField center={[80, -5, 90]} radius={25} count={70} color="#334155" speed={0.012} />
      <AsteroidField center={[-145, 8, 175]} radius={28} count={80} color="#474056" speed={0.018} />
      <AsteroidField center={[85, 9, 275]} radius={30} count={85} color="#524632" speed={0.01} />
      <AsteroidField center={[-100, -11, 370]} radius={32} count={90} color="#3b4252" speed={0.014} />

      {/* Environmental discoveries at compact positions */}
      <AbandonedSatellite position={[-70, 12, 155]} />
      <FloatingCrystals position={[100, -7, 220]} />
      <RingDebris position={[-92, -5, 315]} />
    </group>
  )
}
