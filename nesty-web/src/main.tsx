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
    console.warn('Detected storage-related error, clearing Nesty data (preserving auth)')
    try {
      // Only clear Nesty keys, not Supabase auth session
      const nestyKeys = [
        'nesty-checked-suggestions',
        'nesty-hidden-suggestions',
        'nesty-suggestion-quantities',
        'nesty-revealed-surprises',
        'nesty-storage-version',
      ]
      nestyKeys.forEach(key => localStorage.removeItem(key))
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

// NOTE: StrictMode removed to prevent double-execution issues with Supabase auth
// In production, Vite doesn't use StrictMode anyway, so this matches prod behavior
createRoot(document.getElementById('root')!).render(<App />)
