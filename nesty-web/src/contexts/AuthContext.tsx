import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isAuthError, forceSignOut } from '../lib/supabase'
import type { Profile, Registry } from '../types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  registry: Registry | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [registry, setRegistry] = useState<Registry | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Track current user ID to avoid redundant fetches
  const currentUserId = useRef<string | null>(null)
  // Track if a fetch is in progress to prevent race conditions
  const fetchingRef = useRef(false)

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        // Check for auth errors and force logout
        if (isAuthError(error)) {
          console.error('Auth error in fetchProfile, forcing logout')
          await forceSignOut()
          return null
        }
        return null
      }
      return data
    } catch (err) {
      console.error('Error fetching profile:', err)
      if (isAuthError(err)) {
        console.error('Auth error caught in fetchProfile, forcing logout')
        await forceSignOut()
      }
      return null
    }
  }, [])

  const fetchRegistry = useCallback(async (userId: string): Promise<Registry | null> => {
    try {
      const { data, error } = await supabase
        .from('registries')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching registry:', error)
        // Check for auth errors and force logout
        if (isAuthError(error)) {
          console.error('Auth error in fetchRegistry, forcing logout')
          await forceSignOut()
          return null
        }
        return null
      }
      return data
    } catch (err) {
      console.error('Error fetching registry:', err)
      if (isAuthError(err)) {
        console.error('Auth error caught in fetchRegistry, forcing logout')
        await forceSignOut()
      }
      return null
    }
  }, [])

  const fetchUserData = useCallback(async (userId: string) => {
    // Prevent concurrent fetches for the same user
    if (fetchingRef.current) {
      console.log('fetchUserData: Already fetching, skipping')
      return
    }
    fetchingRef.current = true
    console.log('fetchUserData: Fetching data for user', userId)

    try {
      const [profileData, registryData] = await Promise.all([
        fetchProfile(userId),
        fetchRegistry(userId)
      ])
      console.log('fetchUserData: Got profile:', !!profileData, 'registry:', !!registryData)
      setProfile(profileData)
      setRegistry(registryData)
    } catch (err) {
      console.error('fetchUserData: Error fetching user data:', err)
      // Check if this is an auth error or abort/timeout error
      if (isAuthError(err)) {
        console.error('Auth error in fetchUserData, forcing logout')
        await forceSignOut()
        return
      }
      if (err instanceof Error && err.name === 'AbortError') {
        console.warn('Request timed out - auth state may be corrupted. Clearing session.')
        await forceSignOut()
        return
      }
    } finally {
      fetchingRef.current = false
    }
  }, [fetchProfile, fetchRegistry])

  const refreshProfile = useCallback(async () => {
    // Use the ref to get current user ID to avoid stale closure issues
    const userId = currentUserId.current
    if (userId) {
      // Reset the fetching ref to allow refresh even if a fetch was in progress
      fetchingRef.current = false
      await fetchUserData(userId)
    }
  }, [fetchUserData])

  const signOut = useCallback(async () => {
    currentUserId.current = null
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setRegistry(null)
    setSession(null)
  }, [])

  useEffect(() => {
    // Set up auth state listener first (before getting session)
    // This ensures we catch the SIGNED_IN event from OAuth callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event)

        // Only process significant auth events, not token refreshes
        if (event === 'TOKEN_REFRESHED') {
          setSession(session)
          return
        }

        // Handle sign out event
        if (event === 'SIGNED_OUT') {
          currentUserId.current = null
          setSession(null)
          setUser(null)
          setProfile(null)
          setRegistry(null)
          setIsLoading(false)
          return
        }

        // Handle sign in events (including OAuth callback)
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            currentUserId.current = session.user.id
            await fetchUserData(session.user.id)
          }

          setIsLoading(false)
          return
        }

        // For other events, update state
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user && currentUserId.current !== session.user.id) {
          currentUserId.current = session.user.id
          await fetchUserData(session.user.id)
        } else if (!session?.user) {
          currentUserId.current = null
          setProfile(null)
          setRegistry(null)
        }

        setIsLoading(false)
      }
    )

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
        // If there's an auth error getting the session, clear corrupted state
        if (isAuthError(error)) {
          console.error('Auth error getting session, clearing corrupted state')
          // Clear localStorage but don't redirect - just reset to logged out state
          const keysToRemove = Object.keys(localStorage).filter(key =>
            key.startsWith('sb-') || key.includes('supabase')
          )
          keysToRemove.forEach(key => localStorage.removeItem(key))
        }
        setIsLoading(false)
        return
      }

      // Only set state if no session event has fired yet
      if (!currentUserId.current && session?.user) {
        setSession(session)
        setUser(session.user)
        currentUserId.current = session.user.id
        await fetchUserData(session.user.id)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUserData])

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      registry,
      session,
      isLoading,
      isAuthenticated: !!user,
      refreshProfile,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
