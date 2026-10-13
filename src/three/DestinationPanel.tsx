import './DestinationPanel.css'
import { useState } from 'react'
import { projects } from './projects'
import { destinations } from './destinations'
import SectionBody from './SectionPanels'

type Props = {
  /** Which destination's panel to show — 'projects' keeps Mission Select */
  destinationId: string
  onClose: () => void
}

const sectionMeta: Record<string, { main: string; sub: string; kicker: string; footer: string }> = {
  home: { main: 'BASE', sub: 'COMMAND CENTER', kicker: 'WELCOME ABOARD // HOME SECTOR', footer: 'PORTFOLIO / HOME BASE' },
  about: { main: 'ABOUT', sub: 'EXPLORER PROFILE', kicker: 'PERSONAL LOG // PILOT DOSSIER', footer: 'PORTFOLIO / EXPLORER PROFILE' },
  skills: { main: 'SKILLS', sub: 'SYSTEMS', kicker: 'ONBOARD SYSTEMS // TECHNICAL STACK', footer: 'PORTFOLIO / SYSTEMS BAY' },
  education: { main: 'EDUCATION', sub: 'ACADEMY', kicker: 'TRAINING ROUTE // ACADEMIC LOG', footer: 'PORTFOLIO / ACADEMY' },
  experience: { main: 'EXPERIENCE', sub: 'FLIGHT LOG', kicker: 'MISSION HISTORY // HACKATHONS & BOOTCAMPS', footer: 'PORTFOLIO / FLIGHT LOG' },
  achievements: { main: 'ACHIEVEMENTS', sub: 'MISSION RECORDS', kicker: 'HONOURS ON RECORD // COMPETITIONS', footer: 'PORTFOLIO / MISSION RECORDS' },
  resume: { main: 'RESUME', sub: 'MISSION BRIEF', kicker: 'RESUME / CV // CREDENTIAL BRIEF', footer: 'PORTFOLIO / MISSION BRIEF' },
  contact: { main: 'CONTACT', sub: 'COMMUNICATIONS', kicker: 'OPEN A CHANNEL // DIRECT COMM LINK', footer: 'PORTFOLIO / COMMUNICATIONS' },
}

export default function DestinationPanel({ destinationId, onClose }: Props) {
  const [selectedProject, setSelectedProject] = useState(0)
  const project = projects[selectedProject]

  if (destinationId === 'projects') {
    return (
      <div className="destination-panel-overlay">
        <section className={`destination-panel project-${selectedProject}`} aria-label="Portfolio projects">
          <header className="destination-panel-header">
            <div>
              <p className="destination-panel-handwritten">✦ Celestial Project Archives &amp; Missions ✦</p>
              <h2 className="destination-panel-title">
                <span className="destination-panel-title-main">PROJECTS</span>
                <span className="destination-panel-title-divider">/</span>
                <span className="destination-panel-title-sub">MISSION DOSSIER</span>
              </h2>
            </div>
            <button className="destination-panel-close" type="button" onClick={onClose} aria-label="Close projects">
              <span className="close-icon" aria-hidden="true">✕</span>
              <span className="close-button-label">RETURN TO FLIGHT</span>
            </button>
          </header>

          {/* Whimsical Project Selector Cards (Actual Project Names) */}
          <nav className="project-cards-nav" aria-label="Select a project destination">
            {projects.map((item, index) => {
              const isSelected = selectedProject === index
              return (
                <button
                  className={`project-card-tab${isSelected ? ' is-selected' : ''}`}
                  type="button"
                  key={item.title}
                  onClick={() => setSelectedProject(index)}
                  aria-current={isSelected ? 'true' : undefined}
                >
                  <div className="tab-top-row">
                    <span className="tab-sector-tag">SECTOR {String(index + 1).padStart(2, '0')}</span>
                    <span className="tab-event-badge">{item.event}</span>
                  </div>
                  <h3 className="tab-title">{item.title}</h3>
                  <div className="tab-tech-preview">
                    {item.technologies.slice(0, 3).map((tech) => (
                      <span className="tab-mini-chip" key={tech}>{tech}</span>
                    ))}
                    {item.technologies.length === 0 && (
                      <span className="tab-mini-chip">Full-Stack Security</span>
                    )}
                  </div>
                </button>
              )
            })}
          </nav>

          {/* Illustrated Project Detail Dossier */}
          <article className="project-detail" aria-live="polite">
            <div className="project-dossier-hero">
              {/* Illustrated Cartoon Planet Focal Badge */}
              <div className="illustrated-planet-focal" aria-hidden="true">
                <div className={`planet-sphere planet-theme-${selectedProject}`}>
                  <div className="planet-rings" />
                  <div className="planet-crater crater-1" />
                  <div className="planet-crater crater-2" />
                  <div className="planet-moon" />
                </div>
              </div>

              {/* Project Headline & Context */}
              <div className="project-headline-block">
                <div className="project-event-pill">
                  <span className="event-star">✦</span>
                  <span>{project.event}</span>
                  <span className="event-divider">·</span>
                  <span className="mission-stage-text">MISSION LOG #{String(selectedProject + 1).padStart(2, '0')}</span>
                </div>
                <h1 className="project-main-title">{project.title}</h1>

                {/* Tech Chips */}
                <div className="project-technologies" aria-label="Technologies used">
                  <span className="tech-heading-label">TECH STACK:</span>
                  {project.technologies.length > 0 ? (
                    project.technologies.map((technology) => (
                      <span className="project-tag" key={technology}>
                        <span className="tag-dot" />
                        {technology}
                      </span>
                    ))
                  ) : (
                    <span className="project-tag tag-cyber">
                      <span className="tag-dot" />
                      Cybersecurity &amp; Graph Analytics
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="project-body-section">
              <h2 className="project-section-heading">MISSION OVERVIEW</h2>
              <p className="project-description">{project.description}</p>
            </div>

            {/* Features & Mission Capabilities */}
            <div className="project-body-section">
              <h2 className="project-features-heading">MISSION CAPABILITIES &amp; SYSTEMS</h2>
              <ul className="project-features">
                {project.features.map((feature) => (
                  <li key={feature} className="feature-item">
                    <span className="feature-bullet">✦</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <footer className="destination-panel-footer">
            <div className="footer-left">
              <span className="footer-dot" />
              <span>PORTFOLIO / PROJECT ARCHIVE // HRISHITA PATRO</span>
            </div>
            <span className="footer-hint">PRESS ESC OR CLICK CLOSE TO RETURN</span>
          </footer>
        </section>
      </div>
    )
  }

  // Every other portfolio station — shared illustrated dossier shell
  const meta = sectionMeta[destinationId] ?? sectionMeta.home
  const stationNumber = String(
    Math.max(0, destinations.findIndex((d) => d.id === destinationId)) + 1,
  ).padStart(2, '0')

  return (
    <div className="destination-panel-overlay">
      <section className={`destination-panel dest-${destinationId}`} aria-label={`${meta.main} — ${meta.sub}`}>
        <header className="destination-panel-header">
          <div>
            <p className="destination-panel-handwritten">✦ {meta.kicker} ✦</p>
            <h2 className="destination-panel-title">
              <span className="destination-panel-title-main">{meta.main}</span>
              <span className="destination-panel-title-divider">/</span>
              <span className="destination-panel-title-sub">{meta.sub}</span>
            </h2>
          </div>
          <button className="destination-panel-close" type="button" onClick={onClose} aria-label={`Close ${meta.main.toLowerCase()}`}>
            <span className="close-icon" aria-hidden="true">✕</span>
            <span className="close-button-label">RETURN TO FLIGHT</span>
          </button>
        </header>

        <SectionBody id={destinationId} index={stationNumber} />

        <footer className="destination-panel-footer">
          <div className="footer-left">
            <span className="footer-dot" />
            <span>{meta.footer}</span>
          </div>
          <span className="footer-hint">PRESS ESC OR CLICK CLOSE TO RETURN</span>
        </footer>
      </section>
    </div>
  )
}
