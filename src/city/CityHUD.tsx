import { cityLandmarks } from './cityData'
import './CityHUD.css'

type Props = {
  activeLandmarkId: string | null
  onSelectLandmark: (id: string) => void
  onResetOverview: () => void
}

export default function CityHUD({
  activeLandmarkId,
  onSelectLandmark,
  onResetOverview,
}: Props) {
  return (
    <div className="city-hud">
      {/* Top Header Bar */}
      <header className="city-hud-header">
        <div className="city-brand">
          <span className="city-brand-dot" />
          <div className="city-brand-meta">
            <span className="city-brand-name">HRISHITA PATRO</span>
            <span className="city-brand-sub">3D PORTFOLIO CITY</span>
          </div>
        </div>

        <div className="city-status">
          <span className="city-status-badge">MIDNIGHT EDITION</span>
          <span className="city-status-text">CLICK BUILDINGS TO EXPLORE</span>
        </div>

        <div className="city-header-actions">
          {activeLandmarkId && (
            <button
              type="button"
              className="city-btn city-btn-overview"
              onClick={onResetOverview}
              title="Return camera to overview"
            >
              <span>🏙️</span>
              <span>CITY OVERVIEW</span>
            </button>
          )}
          <a
            href="/Hrishita_Patro_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="city-btn city-btn-resume"
          >
            <span>📄</span>
            <span>CV / RESUME</span>
          </a>
        </div>
      </header>

      {/* Bottom District Navigation Dock */}
      <nav className="city-dock" aria-label="City districts navigation">
        <div className="city-dock-container">
          <button
            type="button"
            className={`city-dock-item ${!activeLandmarkId ? 'is-active' : ''}`}
            onClick={onResetOverview}
            title="Overview"
          >
            <span className="city-dock-icon">🏙️</span>
            <span className="city-dock-label">OVERVIEW</span>
          </button>

          <div className="city-dock-divider" />

          {cityLandmarks.map((landmark) => {
            const isActive = activeLandmarkId === landmark.id
            return (
              <button
                key={landmark.id}
                type="button"
                className={`city-dock-item ${isActive ? 'is-active' : ''}`}
                style={{ '--dock-accent': landmark.accent } as React.CSSProperties}
                onClick={() => onSelectLandmark(landmark.id)}
                title={landmark.name}
              >
                <span className="city-dock-icon">{landmark.icon}</span>
                <span className="city-dock-label">{landmark.badgeText}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Subtle Bottom Controls Hint (Desktop only) */}
      <aside className="city-controls-hint">
        <span>LEFT CLICK: ORBIT</span> · <span>RIGHT CLICK: PAN</span> · <span>SCROLL: ZOOM</span>
      </aside>
    </div>
  )
}
