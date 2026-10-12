export type LandmarkDistrict = {
  id: string
  name: string
  subtitle: string
  district: string
  description: string
  position: [number, number, number]
  cameraOffset: [number, number, number]
  accent: string
  icon: string
  badgeText: string
}

export const CITY_OVERVIEW_CAMERA = {
  position: [36, 42, 36] as [number, number, number],
  target: [0, 2, 0] as [number, number, number],
}

export const cityLandmarks: LandmarkDistrict[] = [
  {
    id: 'about',
    name: 'CIVIC PLAZA & TOWER',
    subtitle: 'EXPLORER PROFILE',
    district: 'Central District',
    description: 'City Hall & central clock tower at the heart of the portfolio city.',
    position: [0, 0, 2],
    cameraOffset: [14, 18, 14],
    accent: '#38bdf8',
    icon: '🏛️',
    badgeText: 'ABOUT ME',
  },
  {
    id: 'projects',
    name: 'INNOVATION QUARTER',
    subtitle: 'PROJECT SHOWCASE',
    district: 'Creative Sector',
    description: 'Multi-building studio and digital labs housing key projects.',
    position: [-16, 0, -6],
    cameraOffset: [12, 16, 14],
    accent: '#46e0e8',
    icon: '💡',
    badgeText: 'PROJECTS',
  },
  {
    id: 'skills',
    name: 'DATA SYSTEMS TOWER',
    subtitle: 'TECHNICAL STACK',
    district: 'Technology Sector',
    description: 'High-tech server monolith with cyan antenna arrays.',
    position: [-14, 0, 16],
    cameraOffset: [14, 18, 14],
    accent: '#2dd4bf',
    icon: '⚡',
    badgeText: 'SKILLS',
  },
  {
    id: 'education',
    name: 'ACADEMY CAMPUS',
    subtitle: 'ACADEMIC ROUTE',
    district: 'University Quarter',
    description: 'Classical collegiate campus with hall columns and green courtyard.',
    position: [15, 0, 16],
    cameraOffset: [14, 18, 14],
    accent: '#fbbf24',
    icon: '🎓',
    badgeText: 'EDUCATION',
  },
  {
    id: 'experience',
    name: 'CORPORATE TOWER',
    subtitle: 'MISSION HISTORY',
    district: 'Financial District',
    description: 'Tall modernist skyscraper with lit office floors and hackathon records.',
    position: [18, 0, -5],
    cameraOffset: [14, 20, 14],
    accent: '#f97316',
    icon: '🏢',
    badgeText: 'EXPERIENCE',
  },
  {
    id: 'achievements',
    name: 'HONORS OBSERVATORY',
    subtitle: 'COMPETITION RECORDS',
    district: 'Heritage Park',
    description: 'Illuminated golden dome observatory celebrating competition wins.',
    position: [14, 0, -18],
    cameraOffset: [14, 18, 14],
    accent: '#f59e0b',
    icon: '🏆',
    badgeText: 'AWARDS',
  },
  {
    id: 'resume',
    name: 'CITY ARCHIVES',
    subtitle: 'MISSION BRIEF',
    district: 'Civic Commons',
    description: 'Contemporary archive pavilion with direct resume preview and download.',
    position: [-1, 0, -17],
    cameraOffset: [12, 16, 14],
    accent: '#818cf8',
    icon: '📄',
    badgeText: 'RESUME',
  },
  {
    id: 'contact',
    name: 'TELECOM TERMINAL',
    subtitle: 'COMMUNICATIONS',
    district: 'Transmission Station',
    description: 'Broadcast antenna array and interactive message hub.',
    position: [-17, 0, -18],
    cameraOffset: [14, 18, 14],
    accent: '#34d399',
    icon: '📡',
    badgeText: 'CONTACT',
  },
]

export const landmarkIds = new Set(cityLandmarks.map((l) => l.id))
