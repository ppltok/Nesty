import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import ErrorBoundary from './components/ErrorBoundary'
import ScrollToTop from './components/ScrollToTop'
import { initializeStorageVersion } from './lib/storage-version'

// Pages
import Home from './pages/Home'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import AuthCallback from './pages/auth/AuthCallback'
import Onboarding from './pages/onboarding/Onboarding'
import Dashboard from './pages/Dashboard'
import Checklist from './pages/Checklist'
import PublicRegistry from './pages/PublicRegistry'
import Gifts from './pages/Gifts'
import Settings from './pages/Settings'
import Example from './pages/Example'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Contact from './pages/Contact'

// Initialize localStorage versioning BEFORE React renders
// This runs synchronously when the module is loaded
try {
  initializeStorageVersion()
} catch (e) {
  // If initialization fails, log but don't clear - Supabase auth might get wiped
  console.error('Failed to initialize storage:', e)
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">טוען...</p>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { isLoading, profile } = useAuth()

  // Storage is already initialized at module load time
  // No need to re-initialize here as it can cause race conditions

  // Don't block public routes with auth loading - let them render immediately
  // This ensures guests can view public registries without waiting for auth
  const pathname = window.location.pathname

  const isPublicRoute = pathname === '/' ||
    pathname.startsWith('/registry/') ||
    pathname.startsWith('/auth/') ||
    pathname === '/example' ||
    pathname === '/terms' ||
    pathname === '/privacy' ||
    pathname === '/contact'

  if (isLoading && !isPublicRoute) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/example" element={<Example />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/auth/signin" element={<SignIn />} />
      <Route path="/auth/signup" element={<SignUp />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Public registry view */}
      <Route path="/registry/:slug" element={<PublicRegistry />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        {/* Onboarding - no side nav */}
        <Route path="/onboarding" element={
          profile?.onboarding_completed
            ? <Navigate to="/dashboard" replace />
            : <Onboarding />
        } />

        {/* Dashboard layout with side nav */}
        <Route element={<DashboardLayout />}>
          {/* Dashboard - redirect to onboarding if not completed */}
          <Route path="/dashboard" element={
            profile && !profile.onboarding_completed
              ? <Navigate to="/onboarding" replace />
              : <Dashboard />
          } />

          {/* Gifts page */}
          <Route path="/gifts" element={<Gifts />} />

          {/* Checklist page */}
          <Route path="/checklist" element={<Checklist />} />

          {/* Settings page */}
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        <AuthProvider>
          <div dir="rtl" className="font-sans min-h-screen bg-background">
            <AppRoutes />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
