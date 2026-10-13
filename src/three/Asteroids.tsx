import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { MutableRefObject } from 'react'
import { onAsteroidImpact, getSnapshot, setThreatAlert } from './GameManager'

// ---------------------------------------------------------------------------
// Threatening Asteroids System
// Combines route hazard fields with dynamic interceptor asteroids that
// fly across the player's path, triggering proximity warnings and collisions.
// ---------------------------------------------------------------------------

type AsteroidData = {
  id: number
  isInterceptor: boolean
  position: THREE.Vector3
  velocity: THREE.Vector3
  rotAxis: THREE.Vector3
  rotSpeed: number
  scale: number
  radius: number
  color: string
}

type Props = {
  spacecraftRef: MutableRefObject<THREE.Group | null>
  onShake: () => void
}

const _shipPos = new THREE.Vector3()
const _diff = new THREE.Vector3()
const _fwd = new THREE.Vector3()
const _toAsteroid = new THREE.Vector3()

export default function Asteroids({ spacecraftRef, onShake }: Props) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const warningRingRef = useRef<THREE.Mesh>(null)

  // Cratered Asteroid Geometry
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 2)
    const pos = g.getAttribute('position')
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
      const noise =
        Math.sin(x * 3.8 + y * 2.5) * 0.22 +
        Math.cos(z * 3.4 + x * 1.8) * 0.18 +
        Math.sin(y * 5.2 + z * 4.1) * 0.1
      pos.setXYZ(i, x * (1 + noise), y * (1 + noise), z * (1 + noise))
    }
    g.computeVertexNormals()
    return g
  }, [])

  // Materials with varied surface rock tones
  const materials = useMemo(() => {
    const tones = ['#4a453f', '#5e5850', '#3b424d', '#6e5a4b', '#483c4f', '#524e46']
    return tones.map(
      (c) =>
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(c),
          roughness: 0.9,
          metalness: 0.15,
          flatShading: true,
        }),
    )
  }, [])

  // Create Route Asteroids + Dynamic Interceptors
  const asteroids = useMemo<AsteroidData[]>(() => {
    const list: AsteroidData[] = []
    let idCounter = 0

    // 1. Dynamic Interceptor Asteroids (8 asteroids that recycle in front of the player)
    for (let i = 0; i < 8; i++) {
      list.push({
        id: idCounter++,
        isInterceptor: true,
        position: new THREE.Vector3(0, -9999, 0), // initialized offscreen, spawned in useFrame
        velocity: new THREE.Vector3(),
        rotAxis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
        rotSpeed: 0.8 + Math.random() * 1.5,
        scale: 2.4 + Math.random() * 3.2,
        radius: 2.2,
        color: '#6e5a4b',
      })
    }

    // 2. Route Corridor Asteroids (32 asteroids placed along the planetary corridors)
    // Corridors connect Base, Projects, About, Skills, Education, Experience, Achievements, Contact
    const corridors = [
      { from: [-110, 10, -65], to: [0, 0, 55], count: 6 },     // Base -> Projects
      { from: [0, 0, 55], to: [180, -8, 115], count: 6 },      // Projects -> About
      { from: [180, -8, 115], to: [215, 22, 385], count: 6 },  // About -> Education
      { from: [-165, 13, 135], to: [-250, 16, 290], count: 5 },// Resume -> Skills
      { from: [-250, 16, 290], to: [-200, -13, 475], count: 5 },// Skills -> Experience
      { from: [215, 22, 385], to: [270, 11, 275], count: 4 },  // Education -> Achievements
    ]

    for (const c of corridors) {
      for (let j = 0; j < c.count; j++) {
        const t = (j + 0.5) / c.count
        const px = c.from[0] + (c.to[0] - c.from[0]) * t + (Math.random() - 0.5) * 45
        const py = c.from[1] + (c.to[1] - c.from[1]) * t + (Math.random() - 0.5) * 30
        const pz = c.from[2] + (c.to[2] - c.from[2]) * t + (Math.random() - 0.5) * 45

        const scale = 2.2 + Math.random() * 4.5
        list.push({
          id: idCounter++,
          isInterceptor: false,
          position: new THREE.Vector3(px, py, pz),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 4,
          ),
          rotAxis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
          rotSpeed: 0.3 + Math.random() * 0.9,
          scale,
          radius: scale * 0.85,
          color: '#5e5850',
        })
      }
    }

    return list
  }, [])

  // Spawns/recycles an interceptor asteroid in front of the player's path
  const spawnInterceptor = (ast: AsteroidData, ship: THREE.Group, speedMult: number) => {
    _shipPos.copy(ship.position)
    _fwd.set(0, 0, 1).applyQuaternion(ship.quaternion)

    // Spawn 80 to 140 units ahead with random horizontal/vertical spread
    const forwardDist = 85 + Math.random() * 55
    const spreadX = (Math.random() - 0.5) * 48
    const spreadY = (Math.random() - 0.5) * 24

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(ship.quaternion)
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(ship.quaternion)

    ast.position
      .copy(_shipPos)
      .addScaledVector(_fwd, forwardDist)
      .addScaledVector(right, spreadX)
      .addScaledVector(up, spreadY)

    // Aim toward where the player currently is or slightly ahead to create near-miss/collision
    const target = _shipPos.clone().addScaledVector(_fwd, (Math.random() - 0.3) * 20)
    const dirToPlayer = target.sub(ast.position).normalize()

    const speed = (28 + Math.random() * 18) * speedMult
    ast.velocity.copy(dirToPlayer).multiplyScalar(speed)
    ast.scale = 2.6 + Math.random() * 3.8
    ast.radius = ast.scale * 0.85
  }

  // Pre-seed initial interceptors when ship is ready
  useEffect(() => {
    const ship = spacecraftRef.current
    if (ship) {
      asteroids.filter((a) => a.isInterceptor).forEach((a) => spawnInterceptor(a, ship, 1.0))
    }
  }, [asteroids, spacecraftRef])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.08)
    const snap = getSnapshot()
    if (snap.paused) return

    const ship = spacecraftRef.current
    if (!ship) return

    _shipPos.copy(ship.position)
    _fwd.set(0, 0, 1).applyQuaternion(ship.quaternion)

    const isHazardActive = snap.mode === 'active' && !snap.isCrashed
    const speedMult = 0.8 + snap.difficulty * 0.25

    let closestDist = 9999
    let threatIdx: number | null = null

    for (let i = 0; i < asteroids.length; i++) {
      const ast = asteroids[i]
      const mesh = meshRefs.current[i]
      if (!mesh) continue

      if (isHazardActive) {
        // Move asteroid
        ast.position.addScaledVector(ast.velocity, dt * speedMult)
        mesh.rotateOnWorldAxis(ast.rotAxis, ast.rotSpeed * dt)

        // Interceptor recycle logic: if it passed behind ship by > 35 units or flew too far
        if (ast.isInterceptor) {
          _diff.copy(ast.position).sub(_shipPos)
          const forwardDot = _diff.dot(_fwd)

          if (forwardDot < -30 || _diff.length() > 240) {
            spawnInterceptor(ast, ship, speedMult)
          }
        } else {
          // Corridor asteroids drift and stay within sector
          if (ast.position.length() > 600) {
            ast.velocity.negate()
          }
        }

        // Threat Proximity & Warning Calculation
        _diff.copy(ast.position).sub(_shipPos)
        const dist = _diff.length()
        const isApproaching = ast.velocity.dot(_diff) < 0 // velocity vector points toward ship

        if (dist < 65 && isApproaching && dist < closestDist) {
          closestDist = dist
          threatIdx = i
        }

        // Collision Detection
        const hitDistance = ast.radius + 2.8 // 2.8 = spacecraft collision radius
        if (dist < hitDistance) {
          // Collision occurred!
          if (!snap.isInvulnerable) {
            onAsteroidImpact(25)
            onShake()

            // Knockback impulse: push ship away from asteroid center
            _toAsteroid.copy(_shipPos).sub(ast.position).normalize()
            ship.position.addScaledVector(_toAsteroid, 5.0)

            // Deflect asteroid
            ast.velocity.reflect(_toAsteroid)
          }
        }
      }

      mesh.position.copy(ast.position)
      mesh.scale.setScalar(ast.scale)
      mesh.visible = isHazardActive
    }

    // Update Threat Alert
    if (threatIdx !== null && isHazardActive) {
      setThreatAlert({
        active: true,
        distance: Math.round(closestDist),
        direction: closestDist < 30 ? 'CRITICAL IMMINENT' : 'INCOMING AHEAD',
      })

      // Position 3D warning ring around the dangerous asteroid
      const threatMesh = meshRefs.current[threatIdx]
      if (warningRingRef.current && threatMesh) {
        warningRingRef.current.position.copy(threatMesh.position)
        warningRingRef.current.scale.setScalar(threatMesh.scale.x * 1.5)
        warningRingRef.current.visible = true
      }
    } else {
      if (snap.threatAlert.active) {
        setThreatAlert({ active: false, distance: 0, direction: 'CLEAR' })
      }
      if (warningRingRef.current) warningRingRef.current.visible = false
    }
  })

  return (
    <group>
      {asteroids.map((ast, i) => (
        <mesh
          key={ast.id}
          ref={(el) => {
            meshRefs.current[i] = el
          }}
          geometry={geo}
          material={materials[i % materials.length]}
          castShadow
          receiveShadow
        />
      ))}

      {/* 3D Pulsing Red Threat Reticle around incoming threat */}
      <mesh ref={warningRingRef} visible={false}>
        <ringGeometry args={[1.1, 1.35, 24]} />
        <meshBasicMaterial
          color="#ff3344"
          side={THREE.DoubleSide}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}
