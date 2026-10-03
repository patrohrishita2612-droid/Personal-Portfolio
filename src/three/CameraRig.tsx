import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { MutableRefObject } from 'react'
import type { ControlsRef } from './useControls'

type Props = {
  controls: ControlsRef
  target: MutableRefObject<THREE.Group | null>
}

// Behind the spacecraft (-Z is rear), slightly above, looking forward (+Z)
// Spacecraft is scaled 0.55x, so effective size ~3.5 units. Camera at -22 puts ship at ~8-12% screen.
const cameraOffset = new THREE.Vector3(0, 3.5, -22)
const lookOffset = new THREE.Vector3(0, 0.5, 5)

export default function CameraRig({ controls, target }: Props) {
  const { camera } = useThree()
  const currentPos = useRef(new THREE.Vector3(0, 5, -30))
  const currentLook = useRef(new THREE.Vector3())
  const shakeOffset = useRef(new THREE.Vector3())

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const c = controls.current
    const spacecraft = target.current

    if (!c || !spacecraft) return

    // Boost pulls camera back for sense of speed
    const boostPullback = c.boost ? 1.25 : 1.0
    const offset = cameraOffset.clone()
    offset.z *= boostPullback

    const desiredPos = offset.applyQuaternion(spacecraft.quaternion).add(spacecraft.position)

    // Camera shake during boost
    if (c.boost) {
      const t = state.clock.elapsedTime
      const shakeAmt = 0.15
      shakeOffset.current.set(
        (Math.sin(t * 37) + Math.sin(t * 53)) * shakeAmt * 0.5,
        (Math.cos(t * 41) + Math.cos(t * 61)) * shakeAmt * 0.5,
        (Math.sin(t * 47)) * shakeAmt * 0.3,
      )
    } else {
      shakeOffset.current.lerp(new THREE.Vector3(0, 0, 0), dt * 5)
    }

    currentPos.current.lerp(desiredPos, 1 - Math.pow(0.001, dt))

    const lookTarget = lookOffset.clone().applyQuaternion(spacecraft.quaternion).add(spacecraft.position)
    currentLook.current.lerp(lookTarget, 1 - Math.pow(0.001, dt))

    camera.position.copy(currentPos.current).add(shakeOffset.current)
    camera.lookAt(currentLook.current)
  })

  return null
}
