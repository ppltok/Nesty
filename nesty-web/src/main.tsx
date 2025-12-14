import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global error handler for uncaught errors
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', { message, source, lineno, colno, error })

  // Check if it's a localStorage-related error
  if (
    String(message).includes('localStorage') ||
    String(message).includes('JSON') ||
    String(message).includes('parse')
  ) {
    console.warn('Detected storage-related error, clearing localStorage')
    try {
      localStorage.clear()
      window.location.reload()
    } catch {
      // Can't do anything
    }
  }
}

// Global handler for unhandled promise rejections
window.onunhandledrejection = (event) => {
  console.error('Unhandled promise rejection:', event.reason)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
