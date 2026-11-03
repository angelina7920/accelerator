import { useRef, useState, type FormEvent } from 'react'
import { createSession } from './sessionClient.ts'
import type { Session } from './types.ts'
import {
  validateSessionDraft,
  type SessionFieldMessages,
} from './validation.ts'

type CreateSessionFormProps = {
  onCreated: (session: Session) => void
}

export function CreateSessionForm({ onCreated }: CreateSessionFormProps) {
  const [title, setTitle] = useState('')
  const [start, setStart] = useState('')
  const [messages, setMessages] = useState<SessionFieldMessages>({})
  const [pending, setPending] = useState(false)
  const pendingRef = useRef(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const startInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pendingRef.current) {
      return
    }

    const result = validateSessionDraft({ title, start }, new Date())
    if (!result.ok) {
      setMessages(result.messages)
      if (result.messages.title !== undefined) {
        titleInputRef.current?.focus()
        return
      }
      startInputRef.current?.focus()
      return
    }

    setMessages({})
    pendingRef.current = true
    setPending(true)

    try {
      const session = await createSession({
        title: result.title,
        startsAt: result.startsAt,
      })
      setTitle('')
      setStart('')
      pendingRef.current = false
      setPending(false)
      onCreated(session)
    } catch {
      pendingRef.current = false
      setPending(false)
    }
  }

  return (
    <form className="session-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="session-title">Title</label>
        <input
          ref={titleInputRef}
          id="session-title"
          name="title"
          type="text"
          autoComplete="off"
          value={title}
          aria-invalid={messages.title !== undefined}
          aria-describedby={
            messages.title !== undefined ? 'session-title-error' : undefined
          }
          onChange={(event) => {
            setTitle(event.target.value)
          }}
        />
        <div aria-live="polite">
          {messages.title !== undefined ? (
            <p id="session-title-error" className="field-error">
              {messages.title}
            </p>
          ) : null}
        </div>
      </div>
      <div className="field">
        <label htmlFor="session-start">Start</label>
        <input
          ref={startInputRef}
          id="session-start"
          name="start"
          type="datetime-local"
          autoComplete="off"
          value={start}
          aria-invalid={messages.start !== undefined}
          aria-describedby={
            messages.start !== undefined ? 'session-start-error' : undefined
          }
          onChange={(event) => {
            setStart(event.target.value)
          }}
        />
        <div aria-live="polite">
          {messages.start !== undefined ? (
            <p id="session-start-error" className="field-error">
              {messages.start}
            </p>
          ) : null}
        </div>
      </div>
      <button type="submit" disabled={pending}>
        Save session
      </button>
    </form>
  )
}
