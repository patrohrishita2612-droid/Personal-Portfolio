export type Project = {
  title: string
  technologies: string[]
  event: string
  description: string
  features: string[]
}

export const projects: Project[] = [
  {
    title: 'Digital Footprint & Privacy Risk Auditor',
    technologies: [],
    event: 'MINITHON 4.0',
    description:
      "A platform that maps how a user's accounts, linked services, app permissions, and recovery emails or phone numbers connect without storing real passwords.",
    features: [
      'Connection graph',
      'Network-aware risk score',
      'Breach-history and permission risk analysis',
      'Prioritized fix checklist',
      'Simulated breach alerts',
      'Privacy improvement dashboard',
    ],
  },
  {
    title: 'Kanban Task Management Board',
    technologies: ['React', 'JavaScript', 'CSS'],
    event: 'DJS InfoMatrix Bootcamp',
    description:
      'A task management board with separate To Do, Growing, and Finished columns.',
    features: [
      'Create tasks',
      'Delete tasks',
      'Move tasks between columns',
      'React state management',
    ],
  },
  {
    title: 'Silver String – Art Exhibition Website',
    technologies: ['HTML', 'Tailwind CSS', 'JavaScript'],
    event: 'DJS InfoMatrix Bootcamp',
    description:
      'A responsive art exhibition website featuring curated collections, exhibitions, and artwork.',
    features: [
      'Navigation',
      'Exhibition sections',
      'Artwork cards',
      'Ticket and reservation interface',
    ],
  },
]
