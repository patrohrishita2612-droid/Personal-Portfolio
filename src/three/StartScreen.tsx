import { useState, useEffect } from 'react'
import { startGame, skipToPortfolio, subscribe, getSnapshot } from './GameManager'
import './StartScreen.css'

type Props = {
  onOpenPortfolioDirectly?: () => void
}

export default function StartScreen({ onOpenPortfolioDirectly }: Props) {
  const [gameStarted, setGameStarted] = useState(() => getSnapshot().gameStarted)
  const [showHowToPlay, setShowHowToPlay] = useState(false)

  useEffect(() => {
    return subscribe((snap) => setGameStarted(snap.gameStarted))
  }, [])

  const handleStart = () => {
    startGame()
  }

  const handleSkip = () => {
    skipToPortfolio()
    if (onOpenPortfolioDirectly) {
      onOpenPortfolioDirectly()
    }
  }

  if (gameStarted) return null

  return (
    <div className="start-screen-overlay">
      <div className="start-screen-card">
        {/* Top Header Badge */}
        <div className="start-badge">
          <span className="badge-dot" />
          <span>PORTFOLIO FLIGHT SYSTEM // VER 2.5</span>
        </div>

        {/* Hero Title */}
        <h1 className="start-title">HRISHITA PATRO</h1>
        <p className="start-subtitle">INTERACTIVE 3D SPACE EXPLORATION // RESUME</p>
        <p className="start-description">
          Pilot your explorer vessel through celestial sectors representing my projects, technical skills, education, and achievements.
        </p>

        {/* Action Buttons */}
        <div className="start-actions">
          <button type="button" className="start-btn-primary" onClick={handleStart}>
            <span className="btn-icon">🚀</span>
            <span>START EXPLORATION</span>
          </button>

          <button type="button" className="start-btn-secondary" onClick={() => setShowHowToPlay(true)}>
            <span className="btn-icon">❓</span>
            <span>HOW TO PLAY</span>
          </button>

          <button type="button" className="start-btn-skip" onClick={handleSkip}>
            <span className="btn-icon">📋</span>
            <span>SKIP GAME / VIEW PORTFOLIO</span>
          </button>
        </div>

        {/* Controls Quick Glance */}
        <div className="start-controls-glance">
          <div className="glance-col">
            <span className="key-tag">W / S</span>
            <span className="key-desc">Thrust & Reverse</span>
          </div>
          <div className="glance-col">
            <span className="key-tag">A / D</span>
            <span className="key-desc">Steer Left & Right</span>
          </div>
          <div className="glance-col">
            <span className="key-tag">SHIFT</span>
            <span className="key-desc">Boost Thrusters</span>
          </div>
          <div className="glance-col">
            <span className="key-tag">ENTER</span>
            <span className="key-desc">Dock & Inspect Planet</span>
          </div>
        </div>

        {/* How to Play Modal */}
        {showHowToPlay && (
          <div className="how-to-play-modal" onClick={() => setShowHowToPlay(false)}>
            <div className="how-to-play-dialog" onClick={(e) => e.stopPropagation()}>
              <h2>PILOT FLIGHT MANUAL</h2>
              <div className="manual-section">
                <h3>🪐 1. Discover Planets</h3>
                <p>Fly near any of the 9 celestial destinations to discover it. Press <strong>ENTER</strong> or tap <strong>EXPLORE</strong> to inspect project archives, credentials, and contact info.</p>
              </div>
              <div className="manual-section">
                <h3>☄️ 2. Dodge Intermittent Hazards</h3>
                <p>Asteroid waves occur periodically with early proximity alerts. Steer away or use <strong>SHIFT BOOST</strong> to evade collisions and preserve your shield.</p>
              </div>
              <div className="manual-section">
                <h3>⚡ 3. Collect Orbs & Repair Kits</h3>
                <p>Cyan energy orbs recharge boost fuel. Emerald repair kits restore your hull shield. Planetary sectors are safe zones!</p>
              </div>
              <div className="manual-section">
                <h3>🏆 4. Missions & Radar</h3>
                <p>Use the bottom-right radar minimap to navigate toward unvisited sectors and fulfill active exploration missions.</p>
              </div>
              <button type="button" className="btn-close-manual" onClick={() => setShowHowToPlay(false)}>
                GOT IT // CLOSE MANUAL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
