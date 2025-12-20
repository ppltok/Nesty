import { useEffect, useState, useCallback, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import SideNav from './SideNav'
import OnboardingTutorial from '../OnboardingTutorial'

// Helper to get user-specific localStorage keys
const getTutorialKey = (userId: string) => `nesty_tutorial_completed_${userId}`

export default function DashboardLayout() {
  const { registry, user } = useAuth()
  const location = useLocation()
  const [giftsCount, setGiftsCount] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)
  // Track if tutorial check is complete (so address modal knows when it's safe to show)
  const [tutorialCheckComplete, setTutorialCheckComplete] = useState(false)

  // Tutorial state management
  const tutorialChecked = useRef(false)
  const fromOnboardingRef = useRef(location.state?.fromOnboarding === true)

  // Capture fromOnboarding state on mount
  useEffect(() => {
    if (location.state?.fromOnboarding === true) {
      fromOnboardingRef.current = true
      try {
        sessionStorage.setItem('nesty_from_onboarding', 'true')
      } catch {
        // Ignore
      }
    } else if (!fromOnboardingRef.current) {
      // Check sessionStorage as fallback
      try {
        if (sessionStorage.getItem('nesty_from_onboarding') === 'true') {
          fromOnboardingRef.current = true
        }
      } catch {
        // Ignore
      }
    }
  }, [location.state])

  // Check if we should show tutorial
  useEffect(() => {
    if (tutorialChecked.current) return
    if (!user) return
    if (!registry) return

    tutorialChecked.current = true

    try {
      const tutorialCompleted = localStorage.getItem(getTutorialKey(user.id))
      const fromOnboarding = fromOnboardingRef.current

      if (!tutorialCompleted && fromOnboarding) {
        // Clear the sessionStorage flag
        try {
          sessionStorage.removeItem('nesty_from_onboarding')
        } catch {
          // Ignore
        }
        // Small delay to ensure page is rendered, then show tutorial
        const timer = setTimeout(() => {
          setShowTutorial(true)
          setTutorialCheckComplete(true)
        }, 500)
        return () => clearTimeout(timer)
      } else {
        // No tutorial needed, mark check as complete immediately
        setTutorialCheckComplete(true)
      }
    } catch {
      // localStorage error - skip tutorial, mark as complete
      setTutorialCheckComplete(true)
    }
  }, [user, registry])

  const handleTutorialComplete = () => {
    try {
      if (user) localStorage.setItem(getTutorialKey(user.id), 'true')
    } catch {
      // localStorage error - continue anyway
    }
    setShowTutorial(false)
  }

  const handleTutorialSkip = () => {
    try {
      if (user) localStorage.setItem(getTutorialKey(user.id), 'true')
    } catch {
      // localStorage error - continue anyway
    }
    setShowTutorial(false)
  }

  const fetchGiftsCount = useCallback(async () => {
    if (!registry) return
    try {
      const { data: itemIds } = await supabase
        .from('items')
        .select('id')
        .eq('registry_id', registry.id)

      if (!itemIds || itemIds.length === 0) {
        setGiftsCount(0)
        return
      }

      // Count only unseen confirmed purchases for the badge
      const { count, error } = await supabase
        .from('purchases')
        .select('*', { count: 'exact', head: true })
        .in('item_id', itemIds.map(i => i.id))
        .eq('status', 'confirmed')
        .eq('is_seen', false)

      if (error) throw error
      setGiftsCount(count || 0)
    } catch (err) {
      console.error('Error fetching gifts count:', err)
    }
  }, [registry])

  useEffect(() => {
    if (registry) {
      fetchGiftsCount()
    }
  }, [registry, fetchGiftsCount])

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Onboarding Tutorial - rendered at layout level so it persists across route changes */}
      {showTutorial && (
        <OnboardingTutorial
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}

      {/* Side Navigation */}
      <SideNav giftsCount={giftsCount} />

      {/* Main Content - with padding for mobile bottom nav */}
      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        <Outlet context={{
          giftsCount,
          refreshGiftsCount: fetchGiftsCount,
          tutorialActive: showTutorial,
          // tutorialCheckComplete is false until we've decided whether to show tutorial or not
          tutorialCheckComplete
        }} />
      </main>
    </div>
  )
}

// Hook to access layout context
import { useOutletContext } from 'react-router-dom'

interface DashboardLayoutContext {
  giftsCount: number
  refreshGiftsCount: () => Promise<void>
  tutorialActive: boolean
  tutorialCheckComplete: boolean
}

export function useDashboardLayout() {
  return useOutletContext<DashboardLayoutContext>()
}
