const TITLE_MESSAGE = 'Title must be between 3 and 80 characters.'
const START_REQUIRED_MESSAGE = 'A date and time are required.'
const START_FUTURE_MESSAGE = 'Start must be in the future.'

const LOCAL_DATE_TIME =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/

export type SessionFieldMessages = {
  title?: string
  start?: string
}

export type SessionDraftResult =
  | { ok: true; title: string; startsAt: string }
  | { ok: false; messages: SessionFieldMessages }

function parseLocalDateTime(value: string): Date | null {
  const match = LOCAL_DATE_TIME.exec(value)
  if (match === null) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  const second = match[6] === undefined ? 0 : Number(match[6])
  const parsed = new Date(year, month - 1, day, hour, minute, second, 0)

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day ||
    parsed.getHours() !== hour ||
    parsed.getMinutes() !== minute ||
    parsed.getSeconds() !== second
  ) {
    return null
  }

  return parsed
}

export function validateSessionDraft(
  input: { title: string; start: string },
  submittedAt: Date,
): SessionDraftResult {
  const title = input.title.trim()
  const messages: SessionFieldMessages = {}

  if (title.length < 3 || title.length > 80) {
    messages.title = TITLE_MESSAGE
  }

  const startValue = input.start.trim()
  let startsAt: string | null = null

  if (startValue === '') {
    messages.start = START_REQUIRED_MESSAGE
  } else {
    const parsed = parseLocalDateTime(startValue)
    if (parsed === null || parsed.getTime() <= submittedAt.getTime()) {
      messages.start = START_FUTURE_MESSAGE
    } else {
      startsAt = parsed.toISOString()
    }
  }

  if (messages.title !== undefined || messages.start !== undefined) {
    return { ok: false, messages }
  }

  if (startsAt === null) {
    return {
      ok: false,
      messages: { start: START_FUTURE_MESSAGE },
    }
  }

  return { ok: true, title, startsAt }
}
