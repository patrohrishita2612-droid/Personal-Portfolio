// ---------------------------------------------------------------------------
// Single source of truth for portfolio content.
// RULE: only information that exists in the actual resume / existing project
// data may live here. Never invent employers, dates, links, scores or awards.
// If a value is unknown, leave it null / empty rather than making it up.
// ---------------------------------------------------------------------------

export type SkillGroup = { label: string; items: string[] }

export const home = {
  name: 'HRISHITA PATRO',
  role: 'Artificial Intelligence & Data Science Student',
  intro1:
    "I'm Hrishita Patro — a B.Tech Artificial Intelligence & Data Science student (2025–2029) at Dwarkadas J. Sanghvi College of Engineering.",
  intro2:
    'I build hands-on projects across privacy tooling and front-end web development, and take them into hackathons and build events like MINITHON 4.0 and DJS Infomatrix Bootcamp.',
  facts: [
    { label: 'PROGRAMME', value: 'B.Tech — Artificial Intelligence & Data Science' },
    { label: 'INSTITUTE', value: 'Dwarkadas J. Sanghvi College of Engineering' },
    { label: 'PERIOD', value: '2025 — 2029' },
  ],
}

export const about = {
  intro1:
    'Currently pursuing B.Tech in Artificial Intelligence & Data Science (2025–2029) at Dwarkadas J. Sanghvi College of Engineering.',
  intro2:
    "On the engineering side I work with C, Java and Python, and build front-ends with React and Tailwind CSS. On the communication side, I'm trained in public speaking, debate and presentation — skills backed by school-level competition wins.",
  interests: [
    'Artificial Intelligence & Data Science',
    'Web Development',
    'Privacy & Security',
    'Hackathons & Build Events',
  ],
  strengths: [
    'Logical & Analytical Thinking',
    'Problem Solving',
    'Public Speaking',
    'Debate',
    'Presentation',
    'Teamwork',
    'Coordination',
  ],
}

export const skillGroups: SkillGroup[] = [
  { label: 'PROGRAMMING', items: ['C', 'Java', 'Python'] },
  { label: 'WEB', items: ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind CSS'] },
  { label: 'THINKING', items: ['Logical & Analytical Thinking', 'Problem Solving'] },
  { label: 'COMMUNICATION', items: ['Public Speaking', 'Debate', 'Presentation'] },
  { label: 'COLLABORATION', items: ['Teamwork', 'Coordination'] },
]

export type EducationStop = {
  stage: string
  period?: string
  title: string
  place?: string
  note?: string
}

// Chronological route — oldest stop first, newest last
export const educationRoute: EducationStop[] = [
  {
    stage: 'SECONDARY',
    title: 'Class X',
    place: "St. Joseph's Convent",
    note: '89%',
  },
  {
    stage: 'HIGHER SECONDARY',
    title: 'HSC',
    note: '75%',
  },
  {
    stage: 'UNDERGRADUATE',
    period: '2025 — 2029',
    title: 'B.Tech — Artificial Intelligence & Data Science',
    place: 'Dwarkadas J. Sanghvi College of Engineering',
    note: 'MHCET — 98.60 percentile',
  },
]

export type ExperienceEntry = {
  name: string
  project?: string
}

export const experienceLog: ExperienceEntry[] = [
  { name: 'MINITHON 4.0', project: 'Digital Footprint & Privacy Risk Auditor' },
  { name: 'Unplugged: Enter the Wild' },
  { name: "HACKOPS '26" },
  { name: 'Hackprep 7.0' },
  {
    name: 'DJS Infomatrix Bootcamp',
    project: 'Kanban Task Management Board · Silver String – Art Exhibition Website',
  },
]

export type Achievement = {
  place: 'WINNER' | 'RUNNER-UP' | 'PARTICIPANT'
  title: string
  year: string
}

export const achievements: Achievement[] = [
  { place: 'WINNER', title: 'Elocution Competition', year: '2023' },
  { place: 'RUNNER-UP', title: 'Inter-School Debate Competition', year: '2021' },
  { place: 'WINNER', title: 'Inter-School Science Exhibition', year: '2020' },
  { place: 'PARTICIPANT', title: 'H Ward Science Exhibition', year: '2023' },
]

export const resume = {
  file: '/Hrishita_Patro_Resume.pdf' as string | null,
}


export type ContactChannel = { label: string; value: string; href: string | null }

export const contactChannels: ContactChannel[] = [
  { label: 'EMAIL', value: 'patrohrishita2612@gmail.com', href: 'mailto:patrohrishita2612@gmail.com' },
  { label: 'MOBILE', value: '7977350002', href: 'tel:7977350002' },
  { label: 'LINKEDIN', value: 'https://linkedin.com/in/HrishitaPatro', href: 'https://linkedin.com/in/HrishitaPatro' },
  { label: 'GITHUB', value: 'https://github.com/patrohrishita2612-droid', href: 'https://github.com/patrohrishita2612-droid' },
]
