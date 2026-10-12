import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type TreeSpec = {
  position: [number, number, number]
  scale: number
  type: 'round' | 'pine'
}

type LampSpec = {
  position: [number, number, number]
  rotationY: number
}

type CarSpec = {
  id: number
  axis: 'x' | 'z'
  dir: number
  speed: number
  startX: number
  endX: number
  startZ: number
  endZ: number
  color: string
}

export default function CityEnvironment() {
  const carsRef = useRef<THREE.Group>(null)

  // Streetlamps positioned along avenues and parks
  const streetlamps = useMemo<LampSpec[]>(() => {
    return [
      // Along East-West Avenue
      { position: [-18, 0, 2.8], rotationY: 0 },
      { position: [-10, 0, 2.8], rotationY: 0 },
      { position: [-3, 0, 2.8], rotationY: 0 },
      { position: [3, 0, 2.8], rotationY: 0 },
      { position: [10, 0, 2.8], rotationY: 0 },
      { position: [18, 0, 2.8], rotationY: 0 },

      { position: [-18, 0, -2.8], rotationY: Math.PI },
      { position: [-10, 0, -2.8], rotationY: Math.PI },
      { position: [-3, 0, -2.8], rotationY: Math.PI },
      { position: [3, 0, -2.8], rotationY: Math.PI },
      { position: [10, 0, -2.8], rotationY: Math.PI },
      { position: [18, 0, -2.8], rotationY: Math.PI },

      // Along North-South Boulevard
      { position: [2.8, 0, 18], rotationY: Math.PI / 2 },
      { position: [2.8, 0, 10], rotationY: Math.PI / 2 },
      { position: [2.8, 0, -10], rotationY: Math.PI / 2 },
      { position: [2.8, 0, -18], rotationY: Math.PI / 2 },

      { position: [-2.8, 0, 18], rotationY: -Math.PI / 2 },
      { position: [-2.8, 0, 10], rotationY: -Math.PI / 2 },
      { position: [-2.8, 0, -10], rotationY: -Math.PI / 2 },
      { position: [-2.8, 0, -18], rotationY: -Math.PI / 2 },
    ]
  }, [])

  // Trees in parks and sidewalks
  const trees = useMemo<TreeSpec[]>(() => {
    return [
      // Central Plaza Park
      { position: [-3.8, 0, 2.2], scale: 1.1, type: 'round' },
      { position: [3.8, 0, 2.2], scale: 1.0, type: 'round' },
      { position: [-3.8, 0, -2.2], scale: 0.95, type: 'pine' },
      { position: [3.8, 0, -2.2], scale: 1.1, type: 'round' },

      // Academy Campus Greens (Northeast)
      { position: [12, 0, 12], scale: 1.2, type: 'round' },
      { position: [14, 0, 11], scale: 1.0, type: 'round' },
      { position: [18, 0, 12], scale: 1.3, type: 'round' },
      { position: [19, 0, 16], scale: 1.1, type: 'pine' },
      { position: [13, 0, 19], scale: 0.9, type: 'pine' },

      // Heritage Park Greens (Southeast)
      { position: [11, 0, -12], scale: 1.3, type: 'round' },
      { position: [13, 0, -13], scale: 1.1, type: 'pine' },
      { position: [17, 0, -14], scale: 1.2, type: 'pine' },
      { position: [12, 0, -19], scale: 1.0, type: 'round' },
      { position: [17, 0, -19], scale: 1.15, type: 'round' },

      // Tech District Parklets (Northwest)
      { position: [-12, 0, 11], scale: 1.0, type: 'pine' },
      { position: [-17, 0, 11], scale: 1.2, type: 'round' },
      { position: [-18, 0, 17], scale: 1.1, type: 'pine' },

      // Civic Archives Green (South)
      { position: [2.5, 0, -15], scale: 1.0, type: 'round' },
      { position: [-4.5, 0, -15], scale: 1.1, type: 'pine' },
    ]
  }, [])

  // Cars initial state
  const cars = useMemo<CarSpec[]>(() => {
    return [
      { id: 1, axis: 'x', dir: 1, speed: 7.2, startX: -26, endX: 26, startZ: -1.2, endZ: -1.2, color: '#38bdf8' },
      { id: 2, axis: 'x', dir: -1, speed: 6.5, startX: 26, endX: -26, startZ: 1.2, endZ: 1.2, color: '#ef4444' },
      { id: 3, axis: 'z', dir: 1, speed: 6.8, startX: 1.2, endX: 1.2, startZ: -26, endZ: 26, color: '#fbbf24' },
      { id: 4, axis: 'z', dir: -1, speed: 7.5, startX: -1.2, endX: -1.2, startZ: 26, endZ: -26, color: '#f8fafc' },
      { id: 5, axis: 'x', dir: 1, speed: 5.8, startX: -24, endX: 24, startZ: 8.8, endZ: 8.8, color: '#10b981' },
      { id: 6, axis: 'x', dir: -1, speed: 6.2, startX: 24, endX: -24, startZ: -8.8, endZ: -8.8, color: '#ec4899' },
    ]
  }, [])

  // Animate cars along roads
  useFrame((_, delta) => {
    if (!carsRef.current) return
    const children = carsRef.current.children
    cars.forEach((car, i) => {
      const mesh = children[i] as THREE.Group
      if (!mesh) return
      if (car.axis === 'x') {
        mesh.position.x += car.dir * car.speed * delta
        if (car.dir > 0 && mesh.position.x > car.endX) mesh.position.x = car.startX
        if (car.dir < 0 && mesh.position.x < car.endX) mesh.position.x = car.startX
      } else {
        mesh.position.z += car.dir * car.speed * delta
        if (car.dir > 0 && mesh.position.z > car.endZ) mesh.position.z = car.startZ
        if (car.dir < 0 && mesh.position.z < car.endZ) mesh.position.z = car.startZ
      }
    })
  })

  return (
    <group>
      {/* -------------------- 1. STREETLAMPS -------------------- */}
      <group>
        {streetlamps.map((lamp, i) => (
          <group key={i} position={lamp.position} rotation={[0, lamp.rotationY, 0]}>
            {/* Pole */}
            <mesh position={[0, 1.1, 0]}>
              <cylinderGeometry args={[0.04, 0.06, 2.2, 8]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Lamp Arm */}
            <mesh position={[0.2, 2.1, 0]} rotation={[0, 0, -Math.PI / 3]}>
              <cylinderGeometry args={[0.03, 0.03, 0.5, 6]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Lamp Head */}
            <mesh position={[0.42, 2.25, 0]}>
              <boxGeometry args={[0.22, 0.08, 0.14]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            {/* Glowing Bulb */}
            <mesh position={[0.42, 2.18, 0]}>
              <sphereGeometry args={[0.09, 8, 8]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
            {/* Ground Light Pool */}
            <mesh position={[0.42, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[1.2, 16]} />
              <meshBasicMaterial color="#fde047" transparent opacity={0.12} />
            </mesh>
          </group>
        ))}
      </group>

      {/* -------------------- 2. TREES -------------------- */}
      <group>
        {trees.map((tree, i) => (
          <group key={i} position={tree.position} scale={tree.scale}>
            {/* Trunk */}
            <mesh position={[0, 0.45, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.16, 0.9, 6]} />
              <meshStandardMaterial color="#2c1d11" roughness={0.9} />
            </mesh>

            {tree.type === 'round' ? (
              /* Deciduous round foliage */
              <group position={[0, 1.3, 0]}>
                <mesh castShadow>
                  <sphereGeometry args={[0.85, 8, 8]} />
                  <meshStandardMaterial color="#154734" roughness={0.7} />
                </mesh>
                <mesh position={[0.15, 0.35, 0.1]}>
                  <sphereGeometry args={[0.65, 8, 8]} />
                  <meshStandardMaterial color="#1d5c43" roughness={0.7} />
                </mesh>
              </group>
            ) : (
              /* Conical Pine Foliage */
              <group position={[0, 1.2, 0]}>
                <mesh position={[0, 0, 0]} castShadow>
                  <coneGeometry args={[0.9, 1.2, 6]} />
                  <meshStandardMaterial color="#0e3a2f" roughness={0.7} />
                </mesh>
                <mesh position={[0, 0.7, 0]} castShadow>
                  <coneGeometry args={[0.7, 1.0, 6]} />
                  <meshStandardMaterial color="#144d3e" roughness={0.7} />
                </mesh>
              </group>
            )}
          </group>
        ))}
      </group>

      {/* -------------------- 3. ANIMATED CARS -------------------- */}
      <group ref={carsRef}>
        {cars.map((car) => (
          <group
            key={car.id}
            position={[car.startX, 0.25, car.startZ]}
            rotation={[
              0,
              car.axis === 'x'
                ? car.dir > 0 ? Math.PI / 2 : -Math.PI / 2
                : car.dir > 0 ? 0 : Math.PI,
              0,
            ]}
          >
            {/* Car Body */}
            <mesh castShadow>
              <boxGeometry args={[0.7, 0.35, 1.2]} />
              <meshStandardMaterial color={car.color} roughness={0.4} metalness={0.6} />
            </mesh>
            {/* Cabin */}
            <mesh position={[0, 0.24, -0.05]}>
              <boxGeometry args={[0.55, 0.25, 0.65]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
            </mesh>
            {/* Headlights (Front: +Z) */}
            <mesh position={[-0.22, 0, 0.62]}>
              <boxGeometry args={[0.12, 0.08, 0.05]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
            <mesh position={[0.22, 0, 0.62]}>
              <boxGeometry args={[0.12, 0.08, 0.05]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
            {/* Taillights (Rear: -Z) */}
            <mesh position={[-0.22, 0, -0.62]}>
              <boxGeometry args={[0.12, 0.08, 0.05]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0.22, 0, -0.62]}>
              <boxGeometry args={[0.12, 0.08, 0.05]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}
