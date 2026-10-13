import { useState, useEffect, useCallback } from 'react'
import { subscribe, getSnapshot, setMode, togglePause, restartGame } from './GameManager'
import type { GameStateSnapshot, GameMode } from './GameManager'
import './GameHUD.css'

type Props = {
  onModeChange?: (mode: GameMode) => void
}

export default function GameHUD({ onModeChange }: Props) {
  const [snap, setSnap] = useState<GameStateSnapshot>(getSnapshot)

  useEffect(() => {
    return subscribe((s) => setSnap(s))
  }, [])

  const switchMode = useCallback((m: GameMode) => {
    setMode(m)
    onModeChange?.(m)
  }, [onModeChange])

  const handleRestart = useCallback(() => {
    restartGame()
  }, [])

  const isGame = snap.mode === 'game'

  return (
    <div className={`game-hud ${isGame ? 'game-hud--game' : 'game-hud--explore'}`}>
      {/* Mode Toggle Bar */}
      <div className="game-hud-modebar">
        <button
          className={`mode-btn ${snap.mode === 'explore' ? 'mode-btn--active' : ''}`}
          onClick={() => switchMode('explore')}
          title="Explore Mode: Navigate planets freely"
        >
          <span className="mode-icon">🔭</span>
          <span>EXPLORE</span>
        </button>
        <div className="mode-divider" />
        <button
          className={`mode-btn ${snap.mode === 'game' ? 'mode-btn--active' : ''}`}
          onClick={() => switchMode('game')}
          title="Game Mode: Pilot your ship, dodge asteroids, collect energy"
        >
          <span className="mode-icon">🚀</span>
          <span>GAME</span>
        </button>
      </div>

      {/* Game Mode HUD (only shown in game mode) */}
      {isGame && (
        <div className="game-stats">
          {/* Score */}
          <div className="stat-block stat-score">
            <span className="stat-label">SCORE</span>
            <span className="stat-value">{snap.score.toLocaleString()}</span>
          </div>

          {/* Distance */}
          <div className="stat-block stat-dist">
            <span className="stat-label">DISTANCE</span>
            <span className="stat-value">{Math.floor(snap.distance)} <span className="stat-unit">AU</span></span>
          </div>

          {/* Collectibles */}
          <div className="stat-block stat-collect">
            <span className="stat-label">ORBS</span>
            <span className="stat-value">⚡ {snap.collectibles}</span>
          </div>

          {/* Difficulty */}
          <div className="stat-block stat-diff">
            <span className="stat-label">THREAT</span>
            <div className="diff-pips">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`diff-pip ${i < snap.difficulty ? 'diff-pip--active' : ''}`} />
              ))}
            </div>
          </div>

          {/* Objective */}
          <div className="stat-objective">
            <span className="stat-label">MISSION</span>
            <span className="objective-text">{snap.objectives[0]}</span>
          </div>

          {/* Health bar */}
          <div className="meter-row">
            <span className="meter-label">🛡 SHIELD</span>
            <div className="meter-bar">
              <div
                className={`meter-fill meter-fill--health ${snap.health < 30 ? 'meter-fill--critical' : ''} ${snap.invulnerable ? 'meter-fill--invuln' : ''}`}
                style={{ width: `${snap.health}%` }}
              />
            </div>
            <span className="meter-pct">{Math.round(snap.health)}%</span>
          </div>

          {/* Boost bar */}
          <div className="meter-row">
            <span className="meter-label">⚡ BOOST</span>
            <div className="meter-bar">
              <div
                className="meter-fill meter-fill--boost"
                style={{ width: `${snap.boost}%` }}
              />
            </div>
            <span className="meter-pct">{Math.round(snap.boost)}%</span>
          </div>

          {/* Pause / Restart */}
          <div className="game-actions">
            <button className="game-action-btn" onClick={togglePause} title="Pause / Resume (P)">
              {snap.paused ? '▶ RESUME' : '⏸ PAUSE'}
            </button>
            <button className="game-action-btn game-action-btn--restart" onClick={handleRestart} title="Restart game">
              ↺ RESTART
            </button>
          </div>

          {/* Paused overlay */}
          {snap.paused && (
            <div className="pause-overlay">
              <div className="pause-card">
                <div className="pause-title">⏸ PAUSED</div>
                <p className="pause-sub">Press P or tap RESUME to continue</p>
                <div className="pause-actions">
                  <button className="game-action-btn" onClick={togglePause}>▶ RESUME</button>
                  <button className="game-action-btn game-action-btn--restart" onClick={handleRestart}>↺ RESTART</button>
                  <button className="game-action-btn" onClick={() => switchMode('explore')}>🔭 EXPLORE MODE</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
