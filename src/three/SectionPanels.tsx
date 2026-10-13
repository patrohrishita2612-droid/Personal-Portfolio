import type { ReactNode } from 'react'
import {
  home,
  about,
  skillGroups,
  educationRoute,
  experienceLog,
  achievements,
  resume,
  contactChannels,
} from './portfolio'

type BodyProps = { index: string }

// Shared screen chrome — same geometry as the Projects detail screen so every
// station feels designed by the same hand
function Screen({ index, children }: BodyProps & { children: ReactNode }) {
  return (
    <article className="section-screen">
      <div className="section-index">
        <span>DESTINATION</span>
        <span className="section-ghost" aria-hidden="true">{index}</span>
      </div>
      {children}
    </article>
  )
}

/* ------------------------------ HOME / BASE ------------------------------ */

function HomeBody({ index }: BodyProps) {
  return (
    <Screen index={index}>
      <p className="section-eyebrow">WELCOME ABOARD</p>
      <h1 className="section-hero-name">{home.name}</h1>
      <p className="section-role">{home.role}</p>
      <p className="section-lede">{home.intro1}</p>
      <p className="section-lede">{home.intro2}</p>
      <dl className="section-facts">
        {home.facts.map((fact) => (
          <div className="section-fact" key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
      <p className="section-hint">
        <span className="hint-key">W A S D</span> FLY ·
        <span className="hint-key">SHIFT</span> BOOST ·
        ARRIVE AT A PLANET AND PRESS <span className="hint-key">ENTER</span>
      </p>
    </Screen>
  )
}

/* ------------------------------ ABOUT ----------------------------------- */

function AboutBody({ index }: BodyProps) {
  return (
    <Screen index={index}>
      <h1>About Me</h1>
      <p className="section-lede">{about.intro1}</p>
      <p className="section-lede">{about.intro2}</p>

      <h2 className="section-heading">AREAS OF INTEREST</h2>
      <div className="chip-row">
        {about.interests.map((item) => (
          <span className="chip chip-accent" key={item}>{item}</span>
        ))}
      </div>

      <h2 className="section-heading">STRENGTHS</h2>
      <div className="chip-row">
        {about.strengths.map((item) => (
          <span className="chip" key={item}>{item}</span>
        ))}
      </div>
    </Screen>
  )
}

/* ------------------------------ SKILLS ---------------------------------- */

function SkillsBody({ index }: BodyProps) {
  return (
    <Screen index={index}>
      <h1>What I Work With</h1>
      <div className="skill-grid">
        {skillGroups.map((group) => (
          <div className="skill-group" key={group.label}>
            <h2>{group.label}</h2>
            <div className="skill-chips">
              {group.items.map((item) => (
                <span className="skill-chip" key={item}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="section-note">No proficiency percentages — these are the tools I actually use.</p>
    </Screen>
  )
}

/* ------------------------------ EDUCATION -------------------------------- */

function EducationBody({ index }: BodyProps) {
  return (
    <Screen index={index}>
      <h1>Academic Route</h1>
      <ol className="route">
        {educationRoute.map((stop, i) => (
          <li className="route-stop" key={stop.title}>
            <span className="route-marker">{String(i + 1).padStart(2, '0')}</span>
            <div className="route-body">
              <span className="route-stage">
                {stop.stage}
                {stop.period ? ` · ${stop.period}` : ''}
              </span>
              <h2>{stop.title}</h2>
              {stop.place && <p className="route-place">{stop.place}</p>}
              {stop.note && <span className="route-note">{stop.note}</span>}
            </div>
          </li>
        ))}
      </ol>
    </Screen>
  )
}

/* ------------------------------ EXPERIENCE ------------------------------- */

function ExperienceBody({ index }: BodyProps) {
  return (
    <Screen index={index}>
      <h1>Events &amp; Hackathons</h1>
      <ol className="log">
        {experienceLog.map((entry, i) => (
          <li className="log-stop" key={entry.name}>
            <span className="log-marker">{String(i + 1).padStart(2, '0')}</span>
            <div className="log-body">
              <h2>{entry.name}</h2>
              {entry.project && (
                <p className="log-project">
                  <span>PROJECT</span> {entry.project}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Screen>
  )
}

/* ------------------------------ ACHIEVEMENTS ----------------------------- */

function AchievementsBody({ index }: BodyProps) {
  return (
    <Screen index={index}>
      <h1>Competition Record</h1>
      <div className="badge-grid">
        {achievements.map((item) => (
          <div className={`badge badge-${item.place.toLowerCase().replace('-', '')}`} key={item.title}>
            <span className="badge-place">{item.place}</span>
            <h2>{item.title}</h2>
            <span className="badge-year">{item.year}</span>
          </div>
        ))}
      </div>
    </Screen>
  )
}

/* ------------------------------ RESUME ----------------------------------- */

function ResumeBody({ index }: BodyProps) {
  const undergrad = educationRoute[educationRoute.length - 1]

  return (
    <Screen index={index}>
      <h1>Resume / CV</h1>

      <section className="resume-block">
        <h2>EDUCATION</h2>
        <p>
          {undergrad.title}
          {undergrad.place ? ` — ${undergrad.place}` : ''}
          {undergrad.period ? ` (${undergrad.period})` : ''}
        </p>
        <p className="resume-sub">
          {educationRoute.slice(0, -1).map((s) => `${s.title}${s.note ? ` — ${s.note}` : ''}`).join(' · ')}
        </p>
      </section>

      <section className="resume-block">
        <h2>SKILLS</h2>
        <p className="resume-sub">
          {skillGroups.map((g) => `${g.label}: ${g.items.join(', ')}`).join(' · ')}
        </p>
      </section>

      <section className="resume-block">
        <h2>EXPERIENCE</h2>
        <p className="resume-sub">{experienceLog.map((e) => e.name).join(' · ')}</p>
      </section>

      <section className="resume-block">
        <h2>ACHIEVEMENTS</h2>
        <p className="resume-sub">
          {achievements.map((a) => `${a.place} — ${a.title} (${a.year})`).join(' · ')}
        </p>
      </section>

      <div className="resume-actions">
        {resume.file ? (
          <>
            <a className="section-action" href={resume.file} target="_blank" rel="noreferrer">
              VIEW RESUME
            </a>
            <a className="section-action" href={resume.file} download>
              DOWNLOAD RESUME
            </a>
          </>
        ) : (
          <>
            <button className="section-action" type="button" disabled>
              VIEW RESUME
            </button>
            <button className="section-action" type="button" disabled>
              DOWNLOAD RESUME
            </button>
            <span className="resume-pending">RESUME PDF NOT CONNECTED YET</span>
          </>
        )}
      </div>
    </Screen>
  )
}

/* ------------------------------ CONTACT ---------------------------------- */

function ContactBody({ index }: BodyProps) {
  return (
    <Screen index={index}>
      <p className="section-eyebrow">COMMUNICATIONS FREQUENCY</p>
      <h1>Open a Channel</h1>
      <p className="section-lede">
        Direct channels for collaboration, technical inquiries, and project discussions.
      </p>
      <div className="channel-list">
        {contactChannels.map((channel) => (
          <div className="channel" key={channel.label}>
            <div className="channel-info">
              <span className="channel-label">{channel.label}</span>
              <span className="channel-value">{channel.value}</span>
            </div>
            {channel.href ? (
              <a
                className="channel-link"
                href={channel.href}
                target={channel.href.startsWith('mailto:') || channel.href.startsWith('tel:') ? undefined : '_blank'}
                rel={channel.href.startsWith('mailto:') || channel.href.startsWith('tel:') ? undefined : 'noopener noreferrer'}
                onClick={(e) => e.stopPropagation()}
              >
                OPEN CHANNEL
              </a>
            ) : (
              <span className="channel-pending">COMING ONLINE</span>
            )}
          </div>
        ))}
      </div>
      <p className="section-note">
        TRANSMISSION CHANNELS ACTIVE · Direct channels verified and ready for incoming signals.
      </p>
    </Screen>
  )
}

/* ------------------------------ ROUTER ----------------------------------- */

export default function SectionBody({ id, index }: { id: string; index: string }) {
  switch (id) {
    case 'about':
      return <AboutBody index={index} />
    case 'skills':
      return <SkillsBody index={index} />
    case 'education':
      return <EducationBody index={index} />
    case 'experience':
      return <ExperienceBody index={index} />
    case 'achievements':
      return <AchievementsBody index={index} />
    case 'resume':
      return <ResumeBody index={index} />
    case 'contact':
      return <ContactBody index={index} />
    case 'home':
    default:
      return <HomeBody index={index} />
  }
}
