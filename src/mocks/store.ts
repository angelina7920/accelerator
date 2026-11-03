import type { Session } from '../sessions/types.ts'
import { seedSessions } from './seed.ts'

function copySessions(sessions: readonly Session[]): Session[] {
  return sessions.map((session) => ({ ...session }))
}

let sessions = copySessions(seedSessions)

export function getSessions(): Session[] {
  return copySessions(sessions)
}

export function addSession(input: {
  title: string
  startsAt: string
}): Session {
  const session: Session = {
    id: crypto.randomUUID(),
    title: input.title,
    status: 'scheduled',
    startsAt: input.startsAt,
  }

  sessions = [...sessions, session]
  return { ...session }
}

export function resetSessions(): void {
  sessions = copySessions(seedSessions)
}
