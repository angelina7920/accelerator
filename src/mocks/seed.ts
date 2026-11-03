import type { Session } from '../sessions/types.ts'

export const seedSessions: readonly Session[] = [
  {
    id: 'ses-scheduled',
    title: 'Intro to React',
    status: 'scheduled',
    startsAt: '2026-12-01T09:00:00.000Z',
  },
  {
    id: 'ses-completed',
    title: 'Testing Basics',
    status: 'completed',
    startsAt: '2026-10-15T14:00:00.000Z',
  },
]
