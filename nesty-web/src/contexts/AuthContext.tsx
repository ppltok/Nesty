import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
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
      console.log('fetchProfile: Querying profiles table for user:', userId)

      // Create timeout promise (5 seconds)
      const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) => {
        setTimeout(() => {
          console.error('fetchProfile: Query timeout after 5 seconds')
          resolve({ data: null, error: new Error('Query timeout') })
        }, 5000)
      })

      // Race between query and timeout
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      const { data, error } = await Promise.race([queryPromise, timeoutPromise])

      if (error) {
        console.error('fetchProfile: Error fetching profile:', error)
        return null
      }
      console.log('fetchProfile: Query successful, data:', data)
      return data
    } catch (err) {
      console.error('fetchProfile: Exception during fetch:', err)
      return null
    }
  }, [])

  const fetchRegistry = useCallback(async (userId: string): Promise<Registry | null> => {
    try {
      // Create timeout promise (5 seconds)
      const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) => {
        setTimeout(() => {
          console.error('fetchRegistry: Query timeout after 5 seconds')
          resolve({ data: null, error: new Error('Query timeout') })
        }, 5000)
      })

      // Race between query and timeout
      const queryPromise = supabase
        .from('registries')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle()

      const { data, error } = await Promise.race([queryPromise, timeoutPromise])

      if (error) {
        console.error('Error fetching registry:', error)
        return null
      }
      return data
    } catch (err) {
      console.error('Error fetching registry:', err)
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
      console.log('fetchUserData: Starting profile fetch...')
      const profileData = await fetchProfile(userId)
      console.log('fetchUserData: Profile fetch complete:', !!profileData)

      console.log('fetchUserData: Starting registry fetch...')
      const registryData = await fetchRegistry(userId)
      console.log('fetchUserData: Registry fetch complete:', !!registryData)

      console.log('fetchUserData: Got profile:', !!profileData, 'registry:', !!registryData)
      setProfile(profileData)
      setRegistry(registryData)
    } catch (err) {
      console.error('fetchUserData: Error fetching user data:', err)
    } finally {
      console.log('fetchUserData: Cleaning up, setting fetchingRef to false')
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
    let isMounted = true
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let hasProcessedInitialSession = false

    // Check if we're on the OAuth callback page
    const isOAuthCallback = window.location.pathname.includes('/auth/callback') ||
      window.location.hash.includes('access_token')

    // Longer timeout for OAuth callback to allow session processing
    const timeoutDuration = isOAuthCallback ? 10000 : 5000

    // Safety timeout - if auth takes too long, stop loading anyway
    // This prevents infinite loading on stale/corrupted auth state
    timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn('Auth timeout - forcing loading to complete')
        setIsLoading(false)
      }
    }, timeoutDuration)

    // Set up auth state listener FIRST
    // This is the primary way to detect OAuth sessions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        console.log('Auth event:', event, 'hasSession:', !!session)

        // Clear timeout since we got a response
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

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

        // Handle sign in events
        // IMPORTANT: Only fetch data on INITIAL_SESSION, not SIGNED_IN
        // SIGNED_IN fires during OAuth before Supabase client is fully ready
        // INITIAL_SESSION fires after everything is initialized
        if (event === 'SIGNED_IN') {
          setSession(session)
          setUser(session?.user ?? null)
          if (session?.user) {
            currentUserId.current = session.user.id
          }
          // Don't fetch data yet - wait for INITIAL_SESSION
          setIsLoading(false)
          return
        }

        if (event === 'INITIAL_SESSION') {
          hasProcessedInitialSession = true
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
    // On OAuth callback, Supabase will automatically detect and process the hash
    // The onAuthStateChange above will fire with SIGNED_IN event
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!isMounted) return

        // Clear timeout since we got a response
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        if (error) {
          console.error('Error getting session:', error)
          // On error, clear potentially corrupted auth state
          // This fixes the "clearing localStorage fixes it" issue
          if (error.message?.includes('refresh_token') ||
              error.message?.includes('invalid') ||
              error.message?.includes('expired')) {
            console.warn('Clearing corrupted auth state')
            await supabase.auth.signOut()
          }
          setIsLoading(false)
          return
        }

        // Only set state if onAuthStateChange hasn't already handled it
        // This prevents race conditions between the two
        if (!hasProcessedInitialSession && !currentUserId.current) {
          if (session?.user) {
            setSession(session)
            setUser(session.user)
            currentUserId.current = session.user.id
            await fetchUserData(session.user.id)
          }
          setIsLoading(false)
        }
      } catch (err) {
        if (!isMounted) return
        console.error('Failed to get session:', err)
        setIsLoading(false)
      }
    }

    initializeSession()

    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
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
