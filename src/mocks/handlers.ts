import { http, HttpResponse } from 'msw'
import { addSession, getSessions } from './store.ts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readCreateBody(
  value: unknown,
): { title: string; startsAt: string } | null {
  if (!isRecord(value)) {
    return null
  }

  if (typeof value.title !== 'string' || typeof value.startsAt !== 'string') {
    return null
  }

  return {
    title: value.title,
    startsAt: value.startsAt,
  }
}

export const handlers = [
  http.get('/api/sessions', () => {
    return HttpResponse.json({ sessions: getSessions() })
  }),
  http.post('/api/sessions', async ({ request }) => {
    let body: unknown

    try {
      body = await request.json()
    } catch {
      return new HttpResponse(null, { status: 400 })
    }

    const draft = readCreateBody(body)
    if (draft === null) {
      return new HttpResponse(null, { status: 400 })
    }

    return HttpResponse.json(
      { session: addSession(draft) },
      { status: 201 },
    )
  }),
]
