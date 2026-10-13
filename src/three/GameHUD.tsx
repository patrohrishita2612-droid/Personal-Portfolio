import { useState, useEffect, useCallback } from 'react'
import type { MutableRefObject } from 'react'
import type * as THREE from 'three'
import {
  subscribe,
  getSnapshot,
  setGameMode,
  togglePause,
  restartGame,
  respawnShip,
  toggleAudio,
  skipToPortfolio,
} from './GameManager'
import type { GameStateSnapshot } from './GameManager'
import Minimap from './Minimap'
import './GameHUD.css'

type Props = {
  isPanelOpen?: boolean
  spacecraftRef: MutableRefObject<THREE.Group | null>
  onOpenPortfolioDirectly?: () => void
}

export default function GameHUD({ isPanelOpen = false, spacecraftRef, onOpenPortfolioDirectly }: Props) {
  const [snap, setSnap] = useState<GameStateSnapshot>(getSnapshot)

  useEffect(() => {
    return subscribe((s) => setSnap(s))
  }, [])

  const handleToggleMode = useCallback(() => {
    const nextMode = snap.mode === 'active' ? 'cruise' : 'active'
    setGameMode(nextMode)
  }, [snap.mode])

  const handleDirectPortfolio = useCallback(() => {
    skipToPortfolio()
    if (onOpenPortfolioDirectly) {
      onOpenPortfolioDirectly()
    }
  }, [onOpenPortfolioDirectly])

  if (!snap.gameStarted) {
    return null
  }

  return (
    <div className={`unified-hud-root ${isPanelOpen ? 'hud-panel-open' : ''}`}>
      {/* ── Impact Damage Screen Flash ── */}
      {snap.damageFlash && !isPanelOpen && <div className="damage-flash-vignette" />}

      {/* ── Floating Alerts (Damage, Pickups, Threat, Discovery, Mission Complete) ── */}
      {!isPanelOpen && (
        <div className="hud-floating-alerts">
          {snap.missionCompleteNotice && (
            <div className="hud-alert-banner alert-mission-complete">
              <span className="alert-icon">🏆</span>
              <span>{snap.missionCompleteNotice}</span>
            </div>
          )}
          {snap.discoveryNotice && (
            <div className="hud-alert-banner alert-discovery">
              <span className="alert-icon">🪐</span>
              <span>{snap.discoveryNotice}</span>
            </div>
          )}
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

      {/* ── Top Flight Status Bar ── */}
      <header className="hud-topbar">
        <div className="topbar-left">
          <span className="ship-callsign">
            PILOT: {snap.difficultyTier.name.toUpperCase()} (LVL {snap.difficultyTier.level})
          </span>
          <span className="status-divider">/</span>
          <span className={`status-pill ${snap.mode === 'active' ? 'status-pill--active' : 'status-pill--cruise'}`}>
            {snap.mode === 'active' ? '⚡ SURVIVAL HAZARDS' : '🛡️ SAFE CRUISE'}
          </span>
        </div>

        <div className="topbar-center">
          {snap.waypoint && (
            <div className="waypoint-ticker">
              <span className="waypoint-target">WAYPOINT: {snap.waypoint.name}</span>
              <span className="waypoint-dist">[{snap.waypoint.distance} AU]</span>
            </div>
          )}
          <div className="mission-ticker">
            <span className="mission-label">MISSION:</span>
            <span className="mission-text">
              {snap.activeMission.title} ({snap.missionProgress}/{snap.activeMission.target})
            </span>
          </div>
        </div>

        <div className="topbar-right">
          <button
            type="button"
            className="hud-btn-icon"
            onClick={toggleAudio}
            title={snap.soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
          >
            {snap.soundEnabled ? '🔊' : '🔇'}
          </button>
          <button
            type="button"
            className="hud-mode-toggle"
            onClick={handleToggleMode}
            title={snap.mode === 'active' ? 'Switch to Safe Cruise (No hazards)' : 'Switch to Survival Mode'}
          >
            {snap.mode === 'active' ? 'HAZARDS: ON' : 'CRUISE: SAFE'}
          </button>
          <button type="button" className="hud-btn-pause" onClick={togglePause} title="Pause / Menu (P)">
            {snap.paused ? '▶' : '⏸'}
          </button>
        </div>
      </header>

      {/* ── Cockpit Instruments Cluster (Right Side) ── */}
      {!isPanelOpen && (
        <aside className="hud-cockpit-panel" aria-label="Flight Telemetry">
          {/* Score & Exploration Progress */}
          <div className="instrument-card">
            <div className="instrument-stat">
              <span className="inst-label">SCORE</span>
              <span className="inst-value inst-score">{snap.score.toLocaleString()}</span>
            </div>
            <div className="instrument-stat">
              <span className="inst-label">DISCOVERED</span>
              <span className="inst-value">
                {snap.discoveredPlanets.length}/{snap.totalPlanets} <span className="unit">SECTORS</span>
              </span>
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

          {/* Inventory & Streaks */}
          <div className="inventory-chips">
            <span className="inv-chip" title="Energy Orbs Collected">
              ⚡ {snap.collectibles} ORBS
            </span>
            <span className="inv-chip" title="Shield Kits Collected">
              🛡️ {snap.shieldKits} KITS
            </span>
            {snap.cleanStreak > 0 && (
              <span className="inv-chip chip-streak" title="Clean Flight Streak">
                🔥 {snap.cleanStreak} STREAK
              </span>
            )}
          </div>
        </aside>
      )}

      {/* ── Tactical Radar Minimap ── */}
      {!isPanelOpen && <Minimap spacecraftRef={spacecraftRef} />}

      {/* ── Desktop Key Controls Guide (Bottom Center) ── */}
      {!isPanelOpen && (
        <div className="hud-controls-helper desktop-only">
          <span className="key-chip">W / S</span> Thrust ·
          <span className="key-chip">A / D</span> Steer ·
          <span className="key-chip">SHIFT</span> Boost ·
          <span className="key-chip">R / F</span> Ascend ·
          <span className="key-chip">ENTER</span> Dock/Inspect Planet
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

      {/* ── ⏸ Pause & Tactical Settings Modal ── */}
      {snap.paused && !snap.isCrashed && !isPanelOpen && (
        <div className="pause-modal-overlay">
          <div className="pause-dialog">
            <h2>⏸ FLIGHT PAUSED</h2>
            <p>Vessel in orbital hold. Review missions or browse portfolio.</p>

            <div className="pause-dialog-actions">
              <button type="button" className="btn-resume" onClick={togglePause}>
                ▶ RESUME FLIGHT
              </button>
              <button
                type="button"
                className="btn-mode-toggle"
                onClick={handleDirectPortfolio}
              >
                📋 OPEN PORTFOLIO DIRECTLY
              </button>
              <button
                type="button"
                className="btn-mode-toggle"
                onClick={toggleAudio}
              >
                {snap.soundEnabled ? '🔊 AUDIO: ON' : '🔇 AUDIO: MUTED'}
              </button>
              <button
                type="button"
                className="btn-mode-toggle"
                onClick={handleToggleMode}
              >
                MODE: {snap.mode === 'active' ? 'SURVIVAL HAZARDS' : 'SAFE CRUISE'}
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
