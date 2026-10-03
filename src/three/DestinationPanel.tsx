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

// Presentation metadata for the non-Projects stations. Same console language
// as Mission Select, different identity per destination.
const sectionMeta: Record<string, { main: string; sub: string; kicker: string; footer: string }> = {
  home: { main: 'BASE', sub: 'COMMAND CENTER', kicker: 'WELCOME ABOARD', footer: 'PORTFOLIO / HOME BASE' },
  about: { main: 'ABOUT', sub: 'EXPLORER PROFILE', kicker: 'PERSONAL LOG', footer: 'PORTFOLIO / EXPLORER PROFILE' },
  skills: { main: 'SKILLS', sub: 'SYSTEMS', kicker: 'ONBOARD SYSTEMS', footer: 'PORTFOLIO / SYSTEMS BAY' },
  education: { main: 'EDUCATION', sub: 'ACADEMY', kicker: 'TRAINING ROUTE', footer: 'PORTFOLIO / ACADEMY' },
  experience: { main: 'EXPERIENCE', sub: 'FLIGHT LOG', kicker: 'MISSION HISTORY', footer: 'PORTFOLIO / FLIGHT LOG' },
  achievements: { main: 'ACHIEVEMENTS', sub: 'MISSION RECORDS', kicker: 'HONOURS ON RECORD', footer: 'PORTFOLIO / MISSION RECORDS' },
  resume: { main: 'RESUME', sub: 'MISSION BRIEF', kicker: 'RESUME / CV', footer: 'PORTFOLIO / MISSION BRIEF' },
  contact: { main: 'CONTACT', sub: 'COMMUNICATIONS', kicker: 'OPEN A CHANNEL', footer: 'PORTFOLIO / COMMUNICATIONS' },
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
            <h2 className="destination-panel-title">
              <span className="destination-panel-title-main">PROJECTS</span>
              <span className="destination-panel-title-divider">/</span>
              <span className="destination-panel-title-sub">MISSION SELECT</span>
            </h2>
            <p className="destination-panel-kicker">SELECT A PROJECT DESTINATION</p>
          </div>
          <button className="destination-panel-close" type="button" onClick={onClose} aria-label="Close projects">
            <span aria-hidden="true">×</span>
            <span className="close-button-label">CLOSE</span>
          </button>
        </header>

        <nav className="project-selector" aria-label="Select a project">
          {projects.map((item, index) => (
            <button
              className={`project-selector-item${selectedProject === index ? ' is-selected' : ''}`}
              type="button"
              key={item.title}
              onClick={() => setSelectedProject(index)}
              aria-current={selectedProject === index ? 'true' : undefined}
            >
              <span className="project-selector-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="project-selector-title">{item.title}</span>
            </button>
          ))}
        </nav>

        <article className="project-detail" aria-live="polite">
          <div className="project-detail-index">
            <span>PROJECT</span>
            <span className="project-detail-number">{String(selectedProject + 1).padStart(2, '0')}</span>
          </div>
          <h1>{project.title}</h1>
          <div className="project-meta">
            {project.technologies.length > 0 && (
              <div className="project-meta-block" aria-label="Technologies">
                <span className="project-meta-label">TECH</span>
                <div className="project-technologies">
                  {project.technologies.map((technology) => (
                    <span className="project-tag" key={technology}>{technology}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="project-meta-block">
              <span className="project-meta-label">EVENT</span>
              <span className="project-event">{project.event}</span>
            </div>
          </div>
          <p className="project-description">{project.description}</p>
          <h2 className="project-features-heading">MISSION CAPABILITIES</h2>
          <ul className="project-features">
            {project.features.map((feature) => <li key={feature}>{feature}</li>)}
          </ul>
        </article>

        <footer className="destination-panel-footer">
          <span>PORTFOLIO / PROJECT ARCHIVE</span>
          <span>PRESS ESC TO RETURN</span>
        </footer>
      </section>
    </div>
    )
  }

  // Every other portfolio station — same shell, own identity + body
  const meta = sectionMeta[destinationId] ?? sectionMeta.home
  const stationNumber = String(
    Math.max(0, destinations.findIndex((d) => d.id === destinationId)) + 1,
  ).padStart(2, '0')

  return (
    <div className="destination-panel-overlay">
      <section className={`destination-panel dest-${destinationId}`} aria-label={`${meta.main} — ${meta.sub}`}>
        <header className="destination-panel-header">
          <div>
            <h2 className="destination-panel-title">
              <span className="destination-panel-title-main">{meta.main}</span>
              <span className="destination-panel-title-divider">/</span>
              <span className="destination-panel-title-sub">{meta.sub}</span>
            </h2>
            <p className="destination-panel-kicker">{meta.kicker}</p>
          </div>
          <button className="destination-panel-close" type="button" onClick={onClose} aria-label={`Close ${meta.main.toLowerCase()}`}>
            <span aria-hidden="true">×</span>
            <span className="close-button-label">CLOSE</span>
          </button>
        </header>

        <SectionBody id={destinationId} index={stationNumber} />

        <footer className="destination-panel-footer">
          <span>{meta.footer}</span>
          <span>PRESS ESC TO RETURN</span>
        </footer>
      </section>
    </div>
  )
}
