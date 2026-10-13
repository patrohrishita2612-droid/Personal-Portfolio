import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { tickGame } from './GameManager'
import type { MutableRefObject } from 'react'

// ---------------------------------------------------------------------------
// GameTicker — runs inside the R3F Canvas loop to advance game state
// and apply screen-shake on impact.
// ---------------------------------------------------------------------------

type Props = {
  spacecraftRef: MutableRefObject<THREE.Group | null>
  shakeRef: MutableRefObject<number>   // shake intensity set by Asteroids
}

export default function GameTicker({ spacecraftRef, shakeRef }: Props) {
  const { camera } = useThree()
  const shakeTime = useRef(0)
  const shakeOffset = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const ship = spacecraftRef.current
    if (!ship) return

    // Speed is tracked by GameManager via Spacecraft position delta
    const vel = ship.userData.velocityLength as number | undefined
    const shipSpeed = vel ?? 0
    const isBoosting = (ship.userData.isBoosting as boolean | undefined) ?? false

    tickGame(delta, shipSpeed, isBoosting)

    // --- Screen Shake on impact ---
    const shakeIntensity = shakeRef.current
    if (shakeIntensity > 0) {
      shakeTime.current += delta * 25
      const decay = Math.max(0, shakeIntensity - delta * 4)
      shakeRef.current = decay

      shakeOffset.current.set(
        (Math.sin(shakeTime.current * 7.3) + Math.sin(shakeTime.current * 13.1)) * shakeIntensity * 0.8,
        (Math.cos(shakeTime.current * 9.7) + Math.cos(shakeTime.current * 17.3)) * shakeIntensity * 0.5,
        Math.sin(shakeTime.current * 5.9) * shakeIntensity * 0.3,
      )
    } else {
      shakeOffset.current.lerp(new THREE.Vector3(0, 0, 0), delta * 6)
      shakeTime.current = 0
    }

    camera.position.addScaledVector(shakeOffset.current, 1)
  })

  return null
}
