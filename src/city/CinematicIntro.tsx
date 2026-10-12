import { useState, useEffect } from 'react'
import { home } from '../three/portfolio'
import { cityLandmarks } from './cityData'
import './CinematicIntro.css'

type Props = {
  onStart: () => void
  onSelectLandmark: (id: string) => void
}

export default function CinematicIntro({ onStart, onSelectLandmark }: Props) {
  const [fadedIn, setFadedIn] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setFadedIn(true), 150)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`city-intro-overlay ${fadedIn ? 'is-visible' : ''}`}>
      <div className="city-intro-card">
        <div className="city-intro-beacon">
          <span className="city-intro-pulse" />
          <span className="city-intro-skyline-icon">🏙️</span>
        </div>

        <div className="city-intro-meta">
          <span className="city-intro-badge">INTERACTIVE 3D DIORAMA</span>
          <h1 className="city-intro-name">{home.name}</h1>
          <p className="city-intro-role">{home.role}</p>
        </div>

        <p className="city-intro-desc">
          Welcome to my interactive miniature city. Navigate through illuminated urban districts
          to explore projects, core engineering systems, academic routes, competition honours, and direct contact frequencies.
        </p>

        <div className="city-intro-actions">
          <button type="button" className="city-intro-btn-primary" onClick={onStart}>
            <span>ENTER CITY</span>
            <span className="city-intro-arrow">➜</span>
          </button>
          <button type="button" className="city-intro-btn-secondary" onClick={onStart}>
            SKIP INTRO
          </button>
        </div>

        <div className="city-intro-quicklinks">
          <span className="city-intro-quick-label">QUICK JUMP:</span>
          <div className="city-intro-pills">
            {cityLandmarks.slice(0, 5).map((l) => (
              <button
                key={l.id}
                type="button"
                className="city-intro-pill"
                onClick={() => onSelectLandmark(l.id)}
              >
                <span>{l.icon}</span>
                <span>{l.badgeText}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
