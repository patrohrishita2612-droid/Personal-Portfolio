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
        {/* Whimsical Handwritten Intro Note */}
        <div className="start-handwritten-note">
          ✦ An interactive cosmic journey through projects & systems ✦
        </div>

        {/* Playful Top Sector Tag */}
        <div className="start-badge">
          <span className="badge-sparkle">✨</span>
          <span>MISSION CONTROL // SYSTEM ATLAS</span>
          <span className="badge-sparkle">🪐</span>
        </div>

        {/* Hero Title */}
        <h1 className="start-title">HRISHITA PATRO</h1>
        <p className="start-subtitle">COSMIC RESUME & EXPLORATION GAME</p>
        <p className="start-description">
          Pilot your explorer vessel through 9 hand-crafted planetary stations. Inspect project archives, technical skills, education, flight logs, and credentials.
        </p>

        {/* Feature Highlights Pills */}
        <div className="start-highlights">
          <span className="highlight-pill">🪐 9 Planets</span>
          <span className="highlight-pill">⚡ Interactive Hazards</span>
          <span className="highlight-pill">🛰️ Mission Log</span>
          <span className="highlight-pill">📄 Resume Brief</span>
        </div>

        {/* Primary and Secondary Actions */}
        <div className="start-actions">
          <button type="button" className="start-btn-primary" onClick={handleStart}>
            <span className="btn-icon">🚀</span>
            <span>START EXPLORATION</span>
          </button>

          <div className="start-actions-row">
            <button type="button" className="start-btn-secondary" onClick={() => setShowHowToPlay(true)}>
              <span className="btn-icon">📖</span>
              <span>FLIGHT MANUAL</span>
            </button>

            <button type="button" className="start-btn-skip" onClick={handleSkip}>
              <span className="btn-icon">📋</span>
              <span>SKIP GAME / DOSSIER</span>
            </button>
          </div>
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

        {/* Illustrated Flight Manual Modal */}
        {showHowToPlay && (
          <div className="how-to-play-modal" onClick={() => setShowHowToPlay(false)}>
            <div className="how-to-play-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="manual-header">
                <span className="manual-badge">EXPLORER HANDBOOK</span>
                <h2>PILOT FLIGHT MANUAL</h2>
              </div>
              <div className="manual-section">
                <h3>🪐 1. Discover 9 Planetary Stations</h3>
                <p>Fly near any celestial station to reveal its docket. Press <strong>ENTER</strong> or tap <strong>EXPLORE</strong> to inspect project archives, credentials, and contact channels.</p>
              </div>
              <div className="manual-section">
                <h3>☄️ 2. Dodge Intermittent Hazards</h3>
                <p>Occasional asteroid waves are telegraphed by telemetry alerts. Steer around them or hit <strong>SHIFT BOOST</strong> to evade impact. Planetary sectors are 100% safe zones!</p>
              </div>
              <div className="manual-section">
                <h3>⚡ 3. Collect Orbs & Repair Kits</h3>
                <p>Cyan energy orbs replenish boost power. Emerald repair kits restore your hull shield.</p>
              </div>
              <div className="manual-section">
                <h3>🏆 4. Radar Minimap & Missions</h3>
                <p>Check the bottom-right radar minimap for undiscovered destination coordinates and active milestones.</p>
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
