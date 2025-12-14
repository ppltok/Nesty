import { useEffect, useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import SideNav from './SideNav'

export default function DashboardLayout() {
  const { registry } = useAuth()
  const [giftsCount, setGiftsCount] = useState(0)

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
      {/* Side Navigation */}
      <SideNav giftsCount={giftsCount} />

      {/* Main Content - with padding for mobile bottom nav */}
      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        <Outlet context={{ giftsCount, refreshGiftsCount: fetchGiftsCount }} />
      </main>
    </div>
  )
}

// Hook to access layout context
import { useOutletContext } from 'react-router-dom'

interface DashboardLayoutContext {
  giftsCount: number
  refreshGiftsCount: () => Promise<void>
}

export function useDashboardLayout() {
  return useOutletContext<DashboardLayoutContext>()
}
