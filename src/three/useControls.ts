import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'

export type ControlState = {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  up: boolean
  down: boolean
  boost: boolean
}

export type ControlsRef = MutableRefObject<ControlState>

export function useControls(): ControlsRef {
  const controls = useRef<ControlState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    boost: false,
  })

  useEffect(() => {
    const keyMap: Record<string, keyof ControlState> = {
      KeyW: 'forward',
      ArrowUp: 'forward',
      KeyS: 'backward',
      ArrowDown: 'backward',
      KeyA: 'left',
      ArrowLeft: 'left',
      KeyD: 'right',
      ArrowRight: 'right',
      KeyR: 'up',
      KeyE: 'up',
      KeyF: 'down',
      KeyQ: 'down',
      ShiftLeft: 'boost',
      ShiftRight: 'boost',
    }

    const handleDown = (e: KeyboardEvent) => {
      const action = keyMap[e.code]
      if (action) {
        controls.current[action] = true
        e.preventDefault()
      }
    }

    const handleUp = (e: KeyboardEvent) => {
      const action = keyMap[e.code]
      if (action) {
        controls.current[action] = false
        e.preventDefault()
      }
    }

    const handleBlur = () => {
      controls.current.forward = false
      controls.current.backward = false
      controls.current.left = false
      controls.current.right = false
      controls.current.up = false
      controls.current.down = false
      controls.current.boost = false
    }

    window.addEventListener('keydown', handleDown)
    window.addEventListener('keyup', handleUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  return controls
}
