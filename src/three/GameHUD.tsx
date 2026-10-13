import { useState, useEffect, useCallback } from 'react'
import {
  subscribe,
  getSnapshot,
  setGameMode,
  togglePause,
  restartGame,
  respawnShip,
} from './GameManager'
import type { GameStateSnapshot } from './GameManager'
import './GameHUD.css'

type Props = {
  isPanelOpen?: boolean
}

export default function GameHUD({ isPanelOpen = false }: Props) {
  const [snap, setSnap] = useState<GameStateSnapshot>(getSnapshot)

  useEffect(() => {
    return subscribe((s) => setSnap(s))
  }, [])

  const handleToggleMode = useCallback(() => {
    const nextMode = snap.mode === 'active' ? 'cruise' : 'active'
    setGameMode(nextMode)
  }, [snap.mode])

  return (
    <div className={`unified-hud-root ${isPanelOpen ? 'hud-panel-open' : ''}`}>
      {/* ── Impact Damage Screen Flash ── */}
      {snap.damageFlash && !isPanelOpen && <div className="damage-flash-vignette" />}

      {/* ── Floating Alerts (Damage / Pickups) ── */}
      {!isPanelOpen && (
        <div className="hud-floating-alerts">
        {snap.damageNotice && (
          <div className="hud-alert-banner alert-damage">
            <span className="alert-icon">💥</span>
            <span>{snap.damageNotice}</span>
          </div>
        )}
        {snap.collectNotice && (
          <div className="hud-alert-banner alert-pickup">
            <span className="alert-icon">✨</span>
            <span>{snap.collectNotice}</span>
          </div>
        )}
        {snap.threatAlert.active && !snap.isCrashed && snap.mode === 'active' && (
          <div className="hud-alert-banner alert-threat">
            <span className="threat-pulse-dot" />
            <span>⚠️ COLLISION ALERT: INCOMING ASTEROID ({snap.threatAlert.distance}m) — EVASIVE ACTION!</span>
          </div>
        )}
      </div>
      )}

      {/* ── Top Flight Status & Controls Bar ── */}
      <header className="hud-topbar">
        <div className="topbar-left">
          <span className="ship-callsign">VESSEL: EXPLORER-1</span>
          <span className="status-divider">/</span>
          <span className={`status-pill ${snap.mode === 'active' ? 'status-pill--active' : 'status-pill--cruise'}`}>
            {snap.mode === 'active' ? '⚡ HAZARDS ACTIVE' : '🛡️ SAFE CRUISE'}
          </span>
        </div>

        <div className="topbar-center">
          <div className="mission-ticker">
            <span className="mission-label">MISSION:</span>
            <span className="mission-text">{snap.objective}</span>
          </div>
        </div>

        <div className="topbar-right">
          <button
            type="button"
            className="hud-mode-toggle"
            onClick={handleToggleMode}
            title={snap.mode === 'active' ? 'Switch to Safe Cruise (No hazards)' : 'Switch to Survival Mode'}
          >
            {snap.mode === 'active' ? 'MODE: SURVIVAL' : 'MODE: SAFE CRUISE'}
          </button>
          <button type="button" className="hud-btn-pause" onClick={togglePause} title="Pause / Resume (P)">
            {snap.paused ? '▶' : '⏸'}
          </button>
        </div>
      </header>

      {/* ── Cockpit Instruments Cluster (Right Side) ── */}
      {!isPanelOpen && (
        <aside className="hud-cockpit-panel" aria-label="Flight Telemetry">
          {/* Score & Distance */}
          <div className="instrument-card">
            <div className="instrument-stat">
              <span className="inst-label">SCORE</span>
              <span className="inst-value inst-score">{snap.score.toLocaleString()}</span>
            </div>
            <div className="instrument-stat">
              <span className="inst-label">DISTANCE</span>
              <span className="inst-value">{Math.floor(snap.distance)} <span className="unit">AU</span></span>
            </div>
          </div>

          {/* Shield Integrity Bar */}
          <div className="instrument-meter">
            <div className="meter-header">
              <span className="meter-title">🛡️ HULL SHIELD</span>
              <span className={`meter-value ${snap.shield < 30 ? 'text-critical' : ''}`}>{Math.round(snap.shield)}%</span>
            </div>
            <div className="meter-track">
              <div
                className={`meter-bar meter-bar--shield ${snap.shield < 30 ? 'bar-critical' : ''} ${snap.isInvulnerable ? 'bar-invuln' : ''}`}
                style={{ width: `${snap.shield}%` }}
              />
            </div>
          </div>

          {/* Thruster Boost Gauge */}
          <div className="instrument-meter">
            <div className="meter-header">
              <span className="meter-title">⚡ THRUSTER BOOST</span>
              <span className="meter-value">{Math.round(snap.boost)}%</span>
            </div>
            <div className="meter-track">
              <div
                className="meter-bar meter-bar--boost"
                style={{ width: `${snap.boost}%` }}
              />
            </div>
          </div>

          {/* Inventory / Pickups */}
          <div className="inventory-chips">
            <span className="inv-chip" title="Energy Orbs Collected">
              ⚡ {snap.collectibles} ORBS
            </span>
            <span className="inv-chip" title="Shield Kits Collected">
              🛡️ {snap.shieldKits} KITS
            </span>
            {snap.mode === 'active' && (
              <span className="inv-chip chip-threat" title="Current Threat Level">
                LVL {snap.difficulty}
              </span>
            )}
          </div>
        </aside>
      )}

      {/* ── Desktop Key Controls Guide (Bottom Center) ── */}
      {!isPanelOpen && (
        <div className="hud-controls-helper desktop-only">
          <span className="key-chip">W / S</span> Thrust ·
          <span className="key-chip">A / D</span> Steer ·
          <span className="key-chip">SHIFT</span> Boost ·
          <span className="key-chip">R / F</span> Ascend ·
          <span className="key-chip">ENTER</span> Explore Planet
        </div>
      )}

      {/* ── 🚨 Full-Screen SHIP DESTROYED Crash Modal ── */}
      {snap.isCrashed && (
        <div className="crash-modal-overlay">
          <div className="crash-card">
            <div className="crash-alert-icon">💥</div>
            <h1 className="crash-title">SHIP DESTROYED</h1>
            <p className="crash-subtitle">CRITICAL HULL FAILURE · CATASTROPHIC ASTEROID IMPACT</p>

            <div className="countdown-box">
              <span className="countdown-label">EMERGENCY RESPAWN TELEMETRY IN</span>
              <span className="countdown-digit">{snap.crashCountdown}</span>
              <span className="countdown-sec">SECONDS</span>
            </div>

            <div className="crash-actions">
              <button
                type="button"
                className="crash-respawn-btn"
                onClick={() => respawnShip()}
              >
                RESPAWN IMMEDIATELY
              </button>
              <button
                type="button"
                className="crash-restart-btn"
                onClick={() => restartGame()}
              >
                RESTART MISSION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ⏸ Pause Modal ── */}
      {snap.paused && !snap.isCrashed && !isPanelOpen && (
        <div className="pause-modal-overlay">
          <div className="pause-dialog">
            <h2>⏸ FLIGHT PAUSED</h2>
            <p>Vessel systems in temporary orbital hold.</p>
            <div className="pause-dialog-actions">
              <button type="button" className="btn-resume" onClick={togglePause}>
                ▶ RESUME FLIGHT
              </button>
              <button
                type="button"
                className="btn-mode-toggle"
                onClick={handleToggleMode}
              >
                TOGGLE {snap.mode === 'active' ? 'SAFE CRUISE' : 'SURVIVAL HAZARDS'}
              </button>
              <button type="button" className="btn-restart" onClick={restartGame}>
                ↺ RESTART GAME
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
