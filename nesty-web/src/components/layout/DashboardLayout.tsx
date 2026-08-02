import { useEffect, useState, useCallback, useRef } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import SideNav from './SideNav'
import OnboardingTutorial from '../OnboardingTutorial'
import FadedIconsBackground from '../animations/FadedIconsBackground'
import { usePopupState, dismissPopup } from '../../hooks/usePopups'

// Helper to get user-specific localStorage keys
const getTutorialKey = (userId: string) => `nesty_tutorial_completed_${userId}`

export default function DashboardLayout() {
  const { registry, user, profile } = useAuth()
  const navigate = useNavigate()
  const [giftsCount, setGiftsCount] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStepId, setTutorialStepId] = useState<string | null>(null)
  // Track if tutorial check is complete (so address modal knows when it's safe to show)
  const [tutorialCheckComplete, setTutorialCheckComplete] = useState(false)

  // Tutorial state management. The trigger is DB-first: any user who finished
  // onboarding but never completed the tour gets it - reliably, once, on any
  // device. The old trigger required a one-shot sessionStorage flag set at
  // the celebration screen (lost on email-confirmation redirects / new tabs),
  // which is why most users never saw the tutorial at all.
  const popups = usePopupState(user?.id)
  const tutorialChecked = useRef(false)

  useEffect(() => {
    if (tutorialChecked.current) return
    if (!user || !registry || !profile) return
    if (!popups.loaded) return

    tutorialChecked.current = true
    // The old one-shot flag is no longer part of the trigger - clean it up.
    try { sessionStorage.removeItem('nesty_from_onboarding') } catch { /* ignore */ }

    if (!profile.onboarding_completed || popups.dismissed.tutorial_done) {
      setTutorialCheckComplete(true)
      return
    }

    let localDone = false
    try { localDone = !!localStorage.getItem(getTutorialKey(user.id)) } catch { /* ignore */ }
    if (localDone) {
      // Grandfather: finished the tour on this device before the DB flag
      // existed - record it account-wide instead of re-showing.
      void dismissPopup(user.id, 'tutorial_done')
      setTutorialCheckComplete(true)
      return
    }

    // Small delay to ensure page is rendered, then show tutorial
    const timer = setTimeout(() => {
      setShowTutorial(true)
      setTutorialCheckComplete(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [user, registry, profile, popups.loaded, popups.dismissed.tutorial_done])

  const markTutorialDone = () => {
    try {
      if (user) localStorage.setItem(getTutorialKey(user.id), 'true')
    } catch {
      // localStorage error - continue anyway
    }
    // Account-wide flag so the tour never re-fires on another device.
    if (user) void dismissPopup(user.id, 'tutorial_done')
  }

  const handleTutorialComplete = () => {
    markTutorialDone()
    setShowTutorial(false)
    // Land on /checklist after the tutorial - that's where the user starts
    // engaging with the product (browsing categories, picking items).
    navigate('/checklist')
  }

  const handleTutorialSkip = () => {
    markTutorialDone()
    setShowTutorial(false)
    navigate('/checklist')
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
          onStepChange={setTutorialStepId}
        />
      )}

      {/* Side Navigation */}
      <SideNav giftsCount={giftsCount} />

      {/* Main Content - with padding for mobile bottom nav */}
      <main className="flex-1 min-w-0 pb-20 lg:pb-0 relative">
        {/* Faded icons background across all dashboard pages */}
        <FadedIconsBackground count={40} className="z-0 opacity-70" />
        <Outlet context={{
          giftsCount,
          refreshGiftsCount: fetchGiftsCount,
          tutorialActive: showTutorial,
          tutorialStepId,
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
  tutorialStepId: string | null
  tutorialCheckComplete: boolean
}

export function useDashboardLayout() {
  return useOutletContext<DashboardLayoutContext>()
}
