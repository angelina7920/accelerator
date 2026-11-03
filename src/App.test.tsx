import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import App from './App.tsx'

function sessionRow(title: string): HTMLElement {
  const heading = screen.getByRole('heading', { name: title })
  const row = heading.closest('li')
  if (row === null) {
    throw new Error(`No row for ${title}`)
  }
  return row
}

function startTime(row: HTMLElement): HTMLTimeElement {
  const time = row.querySelector('time')
  if (!(time instanceof HTMLTimeElement)) {
    throw new Error('Missing start time')
  }
  return time
}

test('filters the loaded sessions by scheduled status', async () => {
  const user = userEvent.setup()
  render(<App />)

  expect(
    await screen.findByRole('heading', { name: 'Intro to React' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('heading', { name: 'Testing Basics' }),
  ).toBeInTheDocument()

  const introRow = sessionRow('Intro to React')
  expect(within(introRow).getByText('Scheduled')).toBeInTheDocument()
  const introTime = startTime(introRow)
  expect(introTime).toHaveAttribute('dateTime', '2026-12-01T09:00:00.000Z')
  expect(introTime.textContent?.trim()).not.toBe('')

  const basicsRow = sessionRow('Testing Basics')
  expect(within(basicsRow).getByText('Completed')).toBeInTheDocument()
  const basicsTime = startTime(basicsRow)
  expect(basicsTime).toHaveAttribute('dateTime', '2026-10-15T14:00:00.000Z')
  expect(basicsTime.textContent?.trim()).not.toBe('')

  await user.click(screen.getByRole('button', { name: 'Scheduled' }))

  expect(
    screen.getByRole('heading', { name: 'Intro to React' }),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('heading', { name: 'Testing Basics' }),
  ).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'All' }))

  expect(
    screen.getByRole('heading', { name: 'Intro to React' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('heading', { name: 'Testing Basics' }),
  ).toBeInTheDocument()
})
