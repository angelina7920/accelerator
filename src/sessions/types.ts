export type SessionStatus = 'scheduled' | 'completed'

export type Session = {
  id: string
  title: string
  status: SessionStatus
  startsAt: string
}
