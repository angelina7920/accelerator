import type { Session, SessionStatus } from './types.ts'

const LIST_ERROR = 'Sessions could not be loaded.'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isSessionStatus(value: unknown): value is SessionStatus {
  return value === 'scheduled' || value === 'completed'
}

function readSession(value: unknown): Session | null {
  if (!isRecord(value)) {
    return null
  }

  if (
    typeof value.id !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.startsAt !== 'string' ||
    !isSessionStatus(value.status)
  ) {
    return null
  }

  return {
    id: value.id,
    title: value.title,
    status: value.status,
    startsAt: value.startsAt,
  }
}

function readSessionList(value: unknown): Session[] | null {
  if (!isRecord(value) || !Array.isArray(value.sessions)) {
    return null
  }

  const sessions: Session[] = []

  for (const item of value.sessions) {
    const session = readSession(item)
    if (session === null) {
      return null
    }
    sessions.push(session)
  }

  return sessions
}

function readCreatedSession(value: unknown): Session | null {
  if (!isRecord(value)) {
    return null
  }

  return readSession(value.session)
}

export async function listSessions(): Promise<Session[]> {
  try {
    const response = await fetch('/api/sessions')
    if (!response.ok) {
      throw new Error(LIST_ERROR)
    }

    const sessions = readSessionList(await response.json())
    if (sessions === null) {
      throw new Error(LIST_ERROR)
    }

    return sessions
  } catch (error) {
    if (error instanceof Error && error.message === LIST_ERROR) {
      throw error
    }

    throw new Error(LIST_ERROR)
  }
}

export async function createSession(input: {
  title: string
  startsAt: string
}): Promise<Session> {
  const response = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: input.title,
      startsAt: input.startsAt,
    }),
  })

  if (!response.ok) {
    throw new Error('Session could not be created.')
  }

  const session = readCreatedSession(await response.json())
  if (session === null) {
    throw new Error('Session could not be created.')
  }

  return session
}
