import { useState, useEffect } from 'react'
import type { ControlsRef, ControlState } from './useControls'
import { setControlState } from './useControls'
import './HUD.css'

type Props = {
  controls?: ControlsRef
  onExplore?: () => void
}

function useIsMobileTouch() {
  const [isMobileTouch, setIsMobileTouch] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const isSmall = window.innerWidth <= 860 || window.innerHeight <= 500
    return hasTouch && isSmall
  })

  useEffect(() => {
    const handleResize = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmall = window.innerWidth <= 860 || window.innerHeight <= 500
      setIsMobileTouch(hasTouch && isSmall)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  return isMobileTouch
}

export default function HUD({ controls, onExplore }: Props) {
  const isMobileTouch = useIsMobileTouch()

  const bindTouchControl = (action: keyof ControlState) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (controls) setControlState(controls, action, true)
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (controls) setControlState(controls, action, false)
    },
    onPointerCancel: (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (controls) setControlState(controls, action, false)
    },
    onPointerLeave: (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (controls) setControlState(controls, action, false)
    },
  })

  return (
    <div className="hud">
      {/* Desktop Key Map Widget */}
      {!isMobileTouch && (
        <div className="hud-panel desktop-only">
          <div className="hud-header">
            <span className="hud-dot" />
            FLIGHT CONTROLS
          </div>
          <div className="hud-row"><span className="hud-key">W / S</span><span className="hud-label">Thrust / Reverse</span></div>
          <div className="hud-row"><span className="hud-key">A / D</span><span className="hud-label">Steer Left / Right</span></div>
          <div className="hud-row"><span className="hud-key">R / F</span><span className="hud-label">Ascend / Descend</span></div>
          <div className="hud-row"><span className="hud-key">SHIFT</span><span className="hud-label">Boost</span></div>
        </div>
      )}

      {/* Mobile Touch Controls Console */}
      {isMobileTouch && (
        <div className="touch-hud mobile-only">
          {/* Left D-Pad */}
          <div className="touch-dpad">
            <button type="button" className="touch-btn dpad-up" aria-label="Thrust Forward" {...bindTouchControl('forward')}>▲</button>
            <button type="button" className="touch-btn dpad-left" aria-label="Steer Left" {...bindTouchControl('left')}>◄</button>
            <button type="button" className="touch-btn dpad-down" aria-label="Reverse" {...bindTouchControl('backward')}>▼</button>
            <button type="button" className="touch-btn dpad-right" aria-label="Steer Right" {...bindTouchControl('right')}>►</button>
            <div className="dpad-center" />
          </div>

          {/* Center Explore Action Button */}
          {onExplore && (
            <button
              type="button"
              className="touch-btn explore-btn"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onExplore()
              }}
            >
              <span className="explore-icon">🚀</span>
              <span>EXPLORE</span>
            </button>
          )}

          {/* Right Action Stack: Ascend, Descend, Boost */}
          <div className="touch-actions">
            <button type="button" className="touch-btn action-up" aria-label="Ascend" {...bindTouchControl('up')}>
              <span className="action-label">ASCEND</span>
              <span className="action-icon">↾</span>
            </button>
            <button type="button" className="touch-btn action-down" aria-label="Descend" {...bindTouchControl('down')}>
              <span className="action-label">DESCEND</span>
              <span className="action-icon">⇂</span>
            </button>
            <button type="button" className="touch-btn action-boost" aria-label="Boost" {...bindTouchControl('boost')}>
              <span className="action-label">BOOST</span>
              <span className="action-icon">⚡</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
