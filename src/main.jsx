import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

function registerPwa() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return

  const announceUpdate = (registration) => {
    if (!registration.waiting) return
    window.__iskuulCaawiyePwaUpdate = registration
    window.dispatchEvent(new CustomEvent('iskuulcaawiye:pwa-update', { detail: registration }))
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`/sw.js?build=${__PWA_BUILD_ID__}`, { updateViaCache: 'none' })
      .then((registration) => {
        announceUpdate(registration)
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing
          if (!worker) return
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) announceUpdate(registration)
          })
        })
      })
      .catch(() => {
        // PWA support must never block login or normal web use.
      })
  })
}

registerPwa()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
