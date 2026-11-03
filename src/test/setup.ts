import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../mocks/node.ts'
import { resetSessions } from '../mocks/store.ts'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  resetSessions()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
