// ---------------------------------------------------------------------------
// Destination registry — every portfolio station in the universe.
// Positions are spread across a comfortable, navigable 3D flight envelope
// (Y coords within [-15, +22]) so every destination is naturally reachable
// without extreme climbing or descending. Projects retains its benchmark position.
// ---------------------------------------------------------------------------

export type PlanetPalette = {
  deep: string
  mid: string
  light: string
  accent: string
  pole: string
}

export type DestinationDef = {
  id: string
  /** First line of the floating label */
  name: string
  /** Second line of the floating label */
  subtitle: string
  position: [number, number, number]
  /** Panel accent identity colour */
  accent: string
  /** Planet surface palette — omit to keep the original Projects palette */
  palette?: PlanetPalette
  scale?: number
  ring?: boolean
  moons?: boolean
  type?: 'planet' | 'moon' | 'crystal' | 'star' | 'satellite' | 'anomaly'
  /** Projects keeps its original three-light rig */
  fullLights?: boolean
}

export const destinations: DestinationDef[] = [
  {
    id: 'home',
    name: 'BASE',
    subtitle: 'COMMAND CENTER',
    position: [-320, 25, -180],
    accent: '#46e0e8',
    scale: 1.12,
    moons: true,
    ring: true,
    type: 'planet',
    palette: {
      deep: '#101c4e',
      mid: '#2f57b8',
      light: '#56cbe6',
      accent: '#e8ddc8',
      pole: '#eef4ff',
    },
  },
  {
    // Benchmark — position, palette, ring, moons and lights all stay as-is
    id: 'projects',
    name: 'PROJECTS',
    subtitle: 'MISSION SELECT',
    position: [0, 0, 150],
    accent: '#46e0e8',
    ring: true,
    moons: true,
    type: 'planet',
    fullLights: true,
  },
  {
    id: 'about',
    name: 'ABOUT',
    subtitle: 'EXPLORER PROFILE',
    position: [520, -20, 320],
    accent: '#b48ce8',
    scale: 1.0,
    type: 'moon',
    palette: {
      deep: '#2c1b5e',
      mid: '#7a55c9',
      light: '#c9a4ef',
      accent: '#f2b8d0',
      pole: '#efe6ff',
    },
  },
  {
    id: 'skills',
    name: 'SKILLS',
    subtitle: 'SYSTEMS',
    position: [-720, 45, 820],
    accent: '#35cfc4',
    scale: 1.05,
    type: 'crystal',
    palette: {
      deep: '#0c3a4a',
      mid: '#1f8fa0',
      light: '#56dbe6',
      accent: '#a8f0ef',
      pole: '#e6fbff',
    },
  },
  {
    id: 'education',
    name: 'EDUCATION',
    subtitle: 'ACADEMY',
    position: [620, 60, 1100],
    accent: '#e8b64c',
    scale: 1.15,
    ring: true,
    type: 'planet',
    palette: {
      deep: '#12245f',
      mid: '#2f5ac9',
      light: '#7fa8e8',
      accent: '#e8b64c',
      pole: '#f4ead0',
    },
  },
  {
    id: 'experience',
    name: 'EXPERIENCE',
    subtitle: 'FLIGHT LOG',
    position: [-580, -35, 1350],
    accent: '#ff8b3d',
    scale: 1.05,
    moons: true,
    type: 'planet',
    palette: {
      deep: '#4a2410',
      mid: '#b8642a',
      light: '#f0a04a',
      accent: '#ffd08a',
      pole: '#fff0dc',
    },
  },
  {
    id: 'achievements',
    name: 'ACHIEVEMENTS',
    subtitle: 'MISSION RECORDS',
    position: [780, 30, 780],
    accent: '#ffd9a0',
    scale: 1.1,
    type: 'star',
    palette: {
      deep: '#4a3a18',
      mid: '#b8924a',
      light: '#ecd08a',
      accent: '#fff2d8',
      pole: '#fffaf0',
    },
  },
  {
    id: 'resume',
    name: 'RESUME',
    subtitle: 'MISSION BRIEF',
    position: [-480, 35, 380],
    accent: '#7da8ff',
    scale: 0.95,
    type: 'satellite',
    palette: {
      deep: '#141c52',
      mid: '#3a4fb8',
      light: '#6fa8e8',
      accent: '#56cbe6',
      pole: '#e4f2ff',
    },
  },
  {
    id: 'contact',
    name: 'CONTACT',
    subtitle: 'COMMUNICATIONS',
    position: [480, -20, -320],
    accent: '#4fd4c8',
    scale: 1.0,
    type: 'anomaly',
    palette: {
      deep: '#0e3f4a',
      mid: '#1f9aa8',
      light: '#6fd6d0',
      accent: '#ffb07a',
      pole: '#eafffc',
    },
  },
]

export const destinationIds = new Set(destinations.map((d) => d.id))
