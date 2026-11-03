import { useEffect, useState } from 'react'
import { CreateSessionForm } from './CreateSessionForm.tsx'
import { listSessions } from './sessionClient.ts'
import type { Session, SessionStatus } from './types.ts'

type ListPhase = 'loading' | 'ready' | 'error'
type StatusFilter = 'all' | 'scheduled'

const STATUS_TEXT: Record<SessionStatus, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
}

function formatStart(startsAt: string): string {
  return new Date(startsAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function SessionWorkspace() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [phase, setPhase] = useState<ListPhase>('loading')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const nextSessions = await listSessions()
        if (!active) {
          return
        }
        setSessions(nextSessions)
        setPhase('ready')
      } catch {
        if (!active) {
          return
        }
        setPhase('error')
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [loadAttempt])

  function retry() {
    setPhase('loading')
    setLoadAttempt((current) => current + 1)
  }

  function handleCreated(session: Session) {
    setSessions((current) => [...current, session])
    setFormOpen(false)
  }

  if (phase === 'loading') {
    return (
      <section className="workspace">
        <h1>Training sessions</h1>
        <p role="status">Loading…</p>
      </section>
    )
  }

  if (phase === 'error') {
    return (
      <section className="workspace">
        <h1>Training sessions</h1>
        <p role="alert">Sessions could not be loaded.</p>
        <button type="button" onClick={retry}>
          Try again
        </button>
      </section>
    )
  }

  const visibleSessions =
    filter === 'scheduled'
      ? sessions.filter((session) => session.status === 'scheduled')
      : sessions

  return (
    <section className="workspace">
      <h1>Training sessions</h1>
      <div className="filters">
        <button
          type="button"
          aria-pressed={filter === 'all'}
          onClick={() => {
            setFilter('all')
          }}
        >
          All
        </button>
        <button
          type="button"
          aria-pressed={filter === 'scheduled'}
          onClick={() => {
            setFilter('scheduled')
          }}
        >
          Scheduled
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          setFormOpen(true)
        }}
      >
        Create session
      </button>
      {formOpen ? <CreateSessionForm onCreated={handleCreated} /> : null}
      <ul className="session-list">
        {visibleSessions.map((session) => (
          <li key={session.id}>
            <h2>{session.title}</h2>
            <p className="session-status">{STATUS_TEXT[session.status]}</p>
            <time className="session-start" dateTime={session.startsAt}>
              {formatStart(session.startsAt)}
            </time>
          </li>
        ))}
      </ul>
    </section>
  )
}
