import { useState, useEffect } from 'react'
import CityScene from './city/CityScene'
import DestinationPanel from './three/DestinationPanel'
import { home, resume } from './three/portfolio'
import { cityLandmarks } from './city/cityData'

function WebGLFallback() {
  const [activeDest, setActiveDest] = useState<string | null>(null)

  return (
    <main style={{ minHeight: '100vh', padding: '40px 24px', background: '#090e24', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ maxWidth: 800, margin: '0 auto 40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: 8, color: '#ffffff' }}>{home.name}</h1>
        <p style={{ color: '#38bdf8', fontSize: '1.2rem', marginBottom: 16 }}>{home.role}</p>
        <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{home.intro1}</p>
      </header>

      <section style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {cityLandmarks.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveDest(l.id)}
            style={{
              padding: '20px',
              background: '#131b3b',
              border: `1.5px solid ${l.accent}`,
              borderRadius: 12,
              color: '#ffffff',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <span style={{ fontSize: '1.8rem' }}>{l.icon}</span>
            <strong style={{ fontSize: '1.1rem' }}>{l.badgeText}</strong>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{l.description}</span>
          </button>
        ))}
      </section>

      <footer style={{ maxWidth: 800, margin: '40px auto 0', textAlign: 'center', color: '#64748b' }}>
        <p>Interactive 3D Portfolio City · Hrishita Patro</p>
        {resume.file && (
          <a href={resume.file} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', marginRight: 16 }}>
            Download Resume PDF
          </a>
        )}
      </footer>

      {activeDest && (
        <DestinationPanel destinationId={activeDest} onClose={() => setActiveDest(null)} />
      )}
    </main>
  )
}

function App() {
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      setHasWebGL(Boolean(gl))
    } catch {
      setHasWebGL(false)
    }
  }, [])

  if (!hasWebGL) {
    return <WebGLFallback />
  }

  return (
    <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden', background: '#080d22' }}>
      <CityScene />
    </div>
  )
}

export default App
