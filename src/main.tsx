import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { worker } from './mocks/browser.ts'
import App from './App.tsx'

async function renderApp() {
  try {
    await worker.start({ onUnhandledRequest: 'bypass' })
  } catch {
    // A worker that fails to start still leaves the list error and retry.
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void renderApp()
