import { useRef, useMemo } from 'react'
import type { MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ControlsRef } from './useControls'

type Props = {
  controls: ControlsRef
  groupRef: MutableRefObject<THREE.Group | null>
}

const MAX_SPEED = 45
const BOOST_MULT = 2.2
const ACCEL = 30
const DAMPING = 0.96
const ROT_ACCEL = 2.5
const ROT_DAMPING = 0.88
const MAX_ROT = 1.8

export default function Spacecraft({ controls, groupRef }: Props) {
  const group = useRef<THREE.Group>(null)
  const velocity = useRef(new THREE.Vector3())
  const rotationSpeed = useRef(0)

  const engineCore = useRef<THREE.Mesh>(null)
  const engineOuter = useRef<THREE.Mesh>(null)
  const engineTrail = useRef<THREE.Mesh>(null)
  const engineTrailBoost = useRef<THREE.Mesh>(null)

  // Trail particle system
  const trailPoints = useRef<THREE.Points>(null)
  const trailData = useRef({
    ages: new Float32Array(120),
    head: 0,
    count: 120,
    boostAccum: 0,
    normalAccum: 0,
    emitIntervalBoost: 0.015,
    emitIntervalNormal: 0.04,
    maxAge: 1.2,
    maxAgeBoost: 0.6,
    speed: 0,
    speedRatio: 0,
    isBoost: false,
    isThrusting: false,
    currentPos: new THREE.Vector3(),
    backwardDir: new THREE.Vector3(),
    emitPos: new THREE.Vector3(),
    emitDir: new THREE.Vector3(),
    pColor: new THREE.Color(),
    pColor2: new THREE.Color(),
    pColor3: new THREE.Color(),
    pColor4: new THREE.Color(),
  })

  // --- Geometry: larger, more detailed spacecraft ---

  // Main fuselage: elongated pointed nose (aligned along +Z = forward)
  const fuselageGeo = useMemo(() => {
    const points: THREE.Vector2[] = []
    points.push(new THREE.Vector2(0.0, -3.0))   // tail
    points.push(new THREE.Vector2(0.5, -2.8))
    points.push(new THREE.Vector2(0.9, -2.2))
    points.push(new THREE.Vector2(1.1, -1.4))
    points.push(new THREE.Vector2(1.15, -0.5))
    points.push(new THREE.Vector2(1.1, 0.5))
    points.push(new THREE.Vector2(0.9, 1.4))
    points.push(new THREE.Vector2(0.6, 2.2))
    points.push(new THREE.Vector2(0.3, 2.8))
    points.push(new THREE.Vector2(0.0, 3.5))   // nose tip
    const geo = new THREE.LatheGeometry(points, 20)
    geo.rotateX(-Math.PI / 2) // Y-axis profile -> Z-axis (nose at +Z, tail at -Z)
    return geo
  }, [])

  // Cockpit canopy
  const canopyGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.7, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.45)
    geo.scale(0.8, 0.7, 1.4)
    return geo
  }, [])

  // Swept wings using ExtrudeGeometry
  const wingShape = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(4.0, -0.8)
    shape.lineTo(3.6, 0.6)
    shape.lineTo(0, 0.8)
    shape.lineTo(0, 0)
    return shape
  }, [])

  const leftWingGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.2, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.05, bevelSegments: 2 })
    geo.center()
    return geo
  }, [wingShape])

  const rightWingGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.2, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.05, bevelSegments: 2 })
    geo.center()
    geo.scale(-1, 1, 1)
    return geo
  }, [wingShape])

  // Engine housing
  const engineHousingGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.55, 0.7, 1.2, 16)
    geo.rotateX(Math.PI / 2)
    return geo
  }, [])

  // Engine nozzle ring
  const nozzleGeo = useMemo(() => {
    const geo = new THREE.TorusGeometry(0.5, 0.08, 8, 20)
    return geo
  }, [])

  // Tail fin
  const tailFinGeo = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(0, 1.4)
    shape.lineTo(0.8, 1.2)
    shape.lineTo(1.0, 0)
    shape.lineTo(0, 0)
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false })
    geo.center()
    return geo
  }, [])

  // Small detail pipes
  const pipeGeo = useMemo(() => new THREE.CylinderGeometry(0.06, 0.06, 2.5, 8), [])

  // Trail geometry setup
  const trailGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(120 * 3)
    const colors = new Float32Array(120 * 3)
    const sizes = new Float32Array(120)
    // Initialize far away
    for (let i = 0; i < 120; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = -10000
      positions[i * 3 + 2] = 0
      sizes[i] = 0
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    return geo
  }, [])

  const trailMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [])

  useFrame((state, delta) => {
    if (!group.current) return
    groupRef.current = group.current
    const dt = Math.min(delta, 0.05)
    const c = controls.current
    if (!c) return

    // --- Rotation ---
    const rotInput = (c.left ? 1 : 0) - (c.right ? 1 : 0)
    rotationSpeed.current += rotInput * ROT_ACCEL * dt
    rotationSpeed.current *= ROT_DAMPING
    rotationSpeed.current = THREE.MathUtils.clamp(rotationSpeed.current, -MAX_ROT, MAX_ROT)
    group.current.rotation.y += rotationSpeed.current * dt

    // --- Movement ---
    const forwardInput = (c.forward ? 1 : 0) - (c.backward ? 1 : 0)
    const vertInput = (c.up ? 1 : 0) - (c.down ? 1 : 0)
    const speedLimit = c.boost ? MAX_SPEED * BOOST_MULT : MAX_SPEED
    const accel = c.boost ? ACCEL * BOOST_MULT : ACCEL

    if (forwardInput !== 0) {
      const forwardDir = new THREE.Vector3(0, 0, 1).applyQuaternion(group.current.quaternion)
      velocity.current.addScaledVector(forwardDir, forwardInput * accel * dt)
    }

    if (vertInput !== 0) {
      velocity.current.y += vertInput * accel * 0.65 * dt
    } else {
      velocity.current.y *= 0.95
    }

    if (velocity.current.length() > speedLimit) {
      velocity.current.normalize().multiplyScalar(speedLimit)
    }

    if (forwardInput === 0 && vertInput === 0) {
      velocity.current.multiplyScalar(DAMPING)
    }

    group.current.position.addScaledVector(velocity.current, dt)

    // --- Engine visuals ---
    const speed = velocity.current.length()
    const speedRatio = Math.min(speed / MAX_SPEED, 1.5)
    const isBoost = c.boost && c.forward
    const isThrusting = c.forward
    const t = state.clock.elapsedTime
    const pulse = 0.7 + Math.sin(t * 15) * 0.15
    const glowIntensity = speedRatio * pulse * 0.6 + 0.15

    if (engineCore.current) {
      const mat = engineCore.current.material as THREE.MeshBasicMaterial
      mat.opacity = glowIntensity
      engineCore.current.scale.setScalar(0.7 + speedRatio * 0.5)
    }
    if (engineOuter.current) {
      const mat = engineOuter.current.material as THREE.MeshBasicMaterial
      mat.opacity = glowIntensity * 0.4
      engineOuter.current.scale.setScalar(1.2 + speedRatio * 0.8)
    }

    // Engine trail mesh (cone-shaped glow behind engine)
    if (engineTrail.current) {
      const mat = engineTrail.current.material as THREE.MeshBasicMaterial
      const trailLen = 2 + speedRatio * 4
      const trailOp = Math.min(0.15 + speedRatio * 0.25, 0.5)
      mat.opacity = trailOp
      engineTrail.current.scale.set(1, 1, trailLen / 4)
    }
    if (engineTrailBoost.current) {
      const mat = engineTrailBoost.current.material as THREE.MeshBasicMaterial
      if (isBoost) {
        const boostLen = 6 + speedRatio * 8
        mat.opacity = 0.35
        engineTrailBoost.current.scale.set(1.3, 1.3, boostLen / 8)
      } else {
        mat.opacity = 0
        engineTrailBoost.current.scale.set(0.01, 0.01, 0.01)
      }
    }

    // --- Banking ---
    const targetBank = rotInput * 0.3
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetBank, dt * 4)
    const targetPitch = forwardInput * 0.06
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetPitch, dt * 3)

    // --- Trail particle emission ---
    const td = trailData.current
    td.speed = speed
    td.speedRatio = speedRatio
    td.isBoost = isBoost
    td.isThrusting = isThrusting

    td.currentPos.copy(group.current.position)
    td.backwardDir.set(0, 0, -1).applyQuaternion(group.current.quaternion)
    td.emitPos.copy(td.currentPos).addScaledVector(td.backwardDir, 3.2)
    td.emitDir.copy(td.backwardDir)

    // Emit new particles
    const emitInterval = isBoost ? td.emitIntervalBoost : td.emitIntervalNormal
    const accumKey = isBoost ? 'boostAccum' : 'normalAccum'
    td[accumKey] += dt
    const shouldEmit = (isThrusting || isBoost) && td[accumKey] >= emitInterval

    if (trailPoints.current) {
      const posAttr = trailGeometry.attributes.position as THREE.BufferAttribute
      const colAttr = trailGeometry.attributes.color as THREE.BufferAttribute
      const sizeAttr = trailGeometry.attributes.size as THREE.BufferAttribute
      const positions = posAttr.array as Float32Array
      const colors = colAttr.array as Float32Array
      const sizes = sizeAttr.array as Float32Array

      // Emit new particles directly into geometry buffers
      if (shouldEmit) {
        td[accumKey] = 0
        const idx = td.head * 3
        const jitter = 0.3
        positions[idx] = td.emitPos.x + (Math.random() - 0.5) * jitter
        positions[idx + 1] = td.emitPos.y + (Math.random() - 0.5) * jitter
        positions[idx + 2] = td.emitPos.z + (Math.random() - 0.5) * jitter
        td.ages[td.head] = isBoost ? td.maxAgeBoost : td.maxAge
        td.head = (td.head + 1) % td.count
      }

      // Color cache
      td.pColor.setHex(0x00ddff)
      td.pColor2.setHex(0x0088ff)
      td.pColor3.setHex(0x66eeff)
      td.pColor4.setHex(0xff44aa)

      for (let i = 0; i < td.count; i++) {
        if (td.ages[i] > 0) {
          td.ages[i] -= dt
          if (td.ages[i] <= 0) {
            td.ages[i] = 0
            positions[i * 3 + 1] = -10000
            sizes[i] = 0
            continue
          }
          // Move particle backward
          positions[i * 3] += td.emitDir.x * speed * dt * 0.8
          positions[i * 3 + 1] += td.emitDir.y * speed * dt * 0.8
          positions[i * 3 + 2] += td.emitDir.z * speed * dt * 0.8

          const lifeRatio = td.ages[i] / (td.maxAge)
          const sz = lifeRatio * (td.isBoost ? 3.0 : 1.8)
          sizes[i] = sz

          // Color: cyan to blue fade, magenta tint on boost
          if (td.isBoost) {
            td.pColor3.lerpColors(td.pColor4, td.pColor, lifeRatio)
          } else {
            td.pColor3.lerpColors(td.pColor2, td.pColor, lifeRatio)
          }
          colors[i * 3] = td.pColor3.r * lifeRatio
          colors[i * 3 + 1] = td.pColor3.g * lifeRatio
          colors[i * 3 + 2] = td.pColor3.b * lifeRatio
        }
      }
      posAttr.needsUpdate = true
      colAttr.needsUpdate = true
      sizeAttr.needsUpdate = true
    }
  })

  return (
    <group ref={group} position={[0, 0, 0]} scale={0.55}>
      {/* === Main Fuselage === */}
      <mesh geometry={fuselageGeo} castShadow>
        <meshStandardMaterial color="#6a8dc5" metalness={0.8} roughness={0.3} emissive="#1a2a4a" emissiveIntensity={0.15} />
      </mesh>

      {/* === Cockpit Canopy === */}
      <mesh geometry={canopyGeo} position={[0, 0.55, 1.0]}>
        <meshStandardMaterial
          color="#aaeeff"
          metalness={0.95}
          roughness={0.05}
          emissive="#4466bb"
          emissiveIntensity={0.6}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* === Left Wing === */}
      <mesh geometry={leftWingGeo} position={[-2.2, 0, -0.3]} rotation={[0, 0, -0.05]}>
        <meshStandardMaterial color="#4a6a9a" metalness={0.7} roughness={0.35} side={THREE.DoubleSide} emissive="#0a1a3a" emissiveIntensity={0.1} />
      </mesh>
      {/* Wing edge stripe */}
      <mesh position={[-4.5, 0.02, -0.6]} rotation={[Math.PI / 2, 0, -0.1]}>
        <boxGeometry args={[0.05, 0.04, 3.8]} />
        <meshStandardMaterial color="#00ddff" emissive="#00ddff" emissiveIntensity={0.6} />
      </mesh>

      {/* === Right Wing === */}
      <mesh geometry={rightWingGeo} position={[2.2, 0, -0.3]} rotation={[0, 0, 0.05]}>
        <meshStandardMaterial color="#4a6a9a" metalness={0.7} roughness={0.35} side={THREE.DoubleSide} emissive="#0a1a3a" emissiveIntensity={0.1} />
      </mesh>
      {/* Wing edge stripe */}
      <mesh position={[4.5, 0.02, -0.6]} rotation={[Math.PI / 2, 0, 0.1]}>
        <boxGeometry args={[0.05, 0.04, 3.8]} />
        <meshStandardMaterial color="#00ddff" emissive="#00ddff" emissiveIntensity={0.6} />
      </mesh>

      {/* === Tail Fin === */}
      <mesh geometry={tailFinGeo} position={[0, 0.7, -2.2]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#4a6a9a" metalness={0.7} roughness={0.35} side={THREE.DoubleSide} emissive="#0a1a3a" emissiveIntensity={0.1} />
      </mesh>

      {/* === Engine Housing === */}
      <mesh geometry={engineHousingGeo} position={[0, 0, -2.5]}>
        <meshStandardMaterial color="#3a4a6a" metalness={0.9} roughness={0.2} emissive="#001122" emissiveIntensity={0.1} />
      </mesh>

      {/* === Engine Nozzle Ring === */}
      <mesh geometry={nozzleGeo} position={[0, 0, -3.1]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#1a2a4a" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* === Engine Core Glow === */}
      <mesh ref={engineCore} position={[0, 0, -3.15]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.45, 20]} />
        <meshBasicMaterial color="#00ddff" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* === Engine Outer Glow === */}
      <mesh ref={engineOuter} position={[0, 0, -3.2]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.65, 20]} />
        <meshBasicMaterial color="#0088ff" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* === Engine Trail (cone mesh) === */}
      <mesh ref={engineTrail} position={[0, 0, -5.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.5, 4, 12, 1, true]} />
        <meshBasicMaterial color="#00ddff" transparent opacity={0.2} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* === Boost Trail (larger cone) === */}
      <mesh ref={engineTrailBoost} position={[0, 0, -8]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.7, 8, 12, 1, true]} />
        <meshBasicMaterial color="#ff44aa" transparent opacity={0} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* === Trail Particles === */}
      <points ref={trailPoints} geometry={trailGeometry} material={trailMaterial} />

      {/* === Detail: side pipes === */}
      <mesh geometry={pipeGeo} position={[-0.7, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#4a6a9a" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh geometry={pipeGeo} position={[0.7, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#4a6a9a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* === Detail: vent grilles on top === */}
      <mesh position={[0, 0.9, -1.0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.04, 1.2]} />
        <meshStandardMaterial color="#1a2a3a" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.15, 0.93, -1.0]}>
        <boxGeometry args={[0.05, 0.04, 1.0]} />
        <meshStandardMaterial color="#0a1a2a" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.15, 0.93, -1.0]}>
        <boxGeometry args={[0.05, 0.04, 1.0]} />
        <meshStandardMaterial color="#0a1a2a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* === Detail: wing tip lights === */}
      <mesh position={[-5.0, 0.05, -0.7]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#ff4444" transparent opacity={0.9} />
      </mesh>
      <mesh position={[5.0, 0.05, -0.7]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#44ff44" transparent opacity={0.9} />
      </mesh>

      {/* === Lights === */}
      {/* Engine glow light */}
      <pointLight position={[0, 0, -3.5]} color="#00ddff" intensity={4} distance={25} />
      {/* Rim light from above-right — reveals fuselage and canopy silhouette */}
      <spotLight position={[4, 6, 3]} angle={Math.PI / 4} penumbra={0.6} intensity={2.5} color="#bbddff" distance={40} />
      {/* Rim light from above-left — fills the other side */}
      <spotLight position={[-4, 5, 2]} angle={Math.PI / 4} penumbra={0.6} intensity={1.5} color="#88aadd" distance={35} />
      {/* Fill from below — magenta accent on underside */}
      <pointLight position={[-2, -3, 0]} intensity={1.0} color="#ff66aa" distance={20} />
      {/* Warm fill on rear section */}
      <pointLight position={[0, 1, -4]} intensity={0.6} color="#ffaa66" distance={12} />
      {/* Cockpit glow */}
      <pointLight position={[0, 0.5, 1.0]} color="#4488ff" intensity={1.0} distance={6} />
    </group>
  )
}
