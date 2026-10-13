import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import * as THREE from 'three'
import { destinations } from './destinations'
import { getSnapshot } from './GameManager'
import './Minimap.css'

// ---------------------------------------------------------------------------
// Tactical Radar Minimap
// Displays real-time 2D top-down tactical radar with player position,
// destination stations, waypoint markers, and incoming hazards.
// ---------------------------------------------------------------------------

type Props = {
  spacecraftRef: MutableRefObject<THREE.Group | null>
}

const RADAR_RADIUS_WORLD = 450 // world units shown in radar radius

export default function Minimap({ spacecraftRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let animId: number

    const renderRadar = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2
      const radarR = w / 2 - 4

      ctx.clearRect(0, 0, w, h)

      // Background disk
      ctx.fillStyle = 'rgba(6, 12, 32, 0.75)'
      ctx.beginPath()
      ctx.arc(cx, cy, radarR, 0, Math.PI * 2)
      ctx.fill()

      // Concentric range rings
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)'
      ctx.lineWidth = 1
      ;[0.33, 0.66, 1.0].forEach((ratio) => {
        ctx.beginPath()
        ctx.arc(cx, cy, radarR * ratio, 0, Math.PI * 2)
        ctx.stroke()
      })

      // Crosshairs
      ctx.beginPath()
      ctx.moveTo(cx, cy - radarR)
      ctx.lineTo(cx, cy + radarR)
      ctx.moveTo(cx - radarR, cy)
      ctx.lineTo(cx + radarR, cy)
      ctx.stroke()

      const ship = spacecraftRef.current
      if (!ship) {
        animId = requestAnimationFrame(renderRadar)
        return
      }

      const shipX = ship.position.x
      const shipZ = ship.position.z
      const shipAngle = ship.rotation.y

      // World to Radar transform
      // We orient radar so North/Forward is up or relative to world coordinates
      const toRadar = (wx: number, wz: number) => {
        const dx = wx - shipX
        const dz = wz - shipZ
        const dist = Math.sqrt(dx * dx + dz * dz)
        const angle = Math.atan2(dz, dx) - shipAngle + Math.PI / 2

        const rDist = (dist / RADAR_RADIUS_WORLD) * radarR
        const clampedR = Math.min(radarR - 4, rDist)

        return {
          rx: cx + Math.cos(angle) * clampedR,
          ry: cy + Math.sin(angle) * clampedR,
          inRange: dist <= RADAR_RADIUS_WORLD,
        }
      }

      const snap = getSnapshot()
      const waypointId = snap.waypoint?.id

      // ── Render Destination Planets ──
      destinations.forEach((dest) => {
        const { rx, ry } = toRadar(dest.position[0], dest.position[2])
        const isTargeted = dest.id === waypointId

        // Waypoint selection highlight ring
        if (isTargeted) {
          ctx.strokeStyle = '#f59e0b'
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(rx, ry, 6, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Planet blip dot
        ctx.fillStyle = dest.accent || '#38bdf8'
        ctx.beginPath()
        ctx.arc(rx, ry, 3.5, 0, Math.PI * 2)
        ctx.fill()

        // Planet label initial
        ctx.fillStyle = '#cbd5e1'
        ctx.font = '7px Consolas, monospace'
        ctx.fillText(dest.name.substring(0, 3), rx + 4, ry - 3)
      })

      // ── Render Player Ship in Center ──
      ctx.save()
      ctx.translate(cx, cy)
      // Player always points UP on this radar
      ctx.fillStyle = '#38bdf8'
      ctx.beginPath()
      ctx.moveTo(0, -6)
      ctx.lineTo(4, 5)
      ctx.lineTo(0, 3)
      ctx.lineTo(-4, 5)
      ctx.closePath()
      ctx.fill()

      // Shield ring around ship
      ctx.strokeStyle = snap.shield < 30 ? '#ef4444' : snap.isInvulnerable ? '#a855f7' : 'rgba(56, 189, 248, 0.5)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(0, 0, 8, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()

      // Radar bezel ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(cx, cy, radarR, 0, Math.PI * 2)
      ctx.stroke()

      animId = requestAnimationFrame(renderRadar)
    }

    animId = requestAnimationFrame(renderRadar)
    return () => cancelAnimationFrame(animId)
  }, [spacecraftRef])

  return (
    <div className="radar-minimap-container" title="Tactical Sensor Radar">
      <div className="radar-header">
        <span className="radar-label">RADAR SENSOR</span>
        <span className="radar-range">450 AU</span>
      </div>
      <canvas ref={canvasRef} width={130} height={130} className="radar-canvas" />
    </div>
  )
}
