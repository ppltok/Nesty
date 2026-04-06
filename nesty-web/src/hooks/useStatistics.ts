import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { CATEGORIES, ITEMS_DATA } from '../data/categories'
import type { Item } from '../types'

interface ChecklistPreference {
  item_name: string
  is_checked: boolean
  is_hidden: boolean
  priority: 'essential' | 'nice_to_have'
  category_id: string
}

interface CategoryStats {
  id: string
  name: string
  totalValue: number
  receivedValue: number
  itemCount: number
  receivedCount: number
  progressPercent: number
  color: string
}

interface StatisticsData {
  // Registry stats
  totalValue: number
  receivedValue: number
  moneySavedPercent: number
  itemsRemaining: number
  totalItems: number
  totalPurchased: number
  registryProgressPercent: number

  // Nesting Index (checklist)
  nestingScore: number
  essentialTotal: number
  essentialChecked: number
  niceToHaveTotal: number
  niceToHaveChecked: number
  essentialPercent: number
  niceToHavePercent: number
  totalChecklistItems: number
  totalChecked: number

  // Category breakdown
  categoryStats: CategoryStats[]

  // Readiness indicator
  overallReadiness: number
  readinessLabel: string
}

export function useStatistics() {
  const { registry, user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [checklistPreferences, setChecklistPreferences] = useState<ChecklistPreference[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      if (!registry || !user) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Fetch items and checklist preferences in parallel
        const [itemsResult, checklistResult] = await Promise.all([
          supabase
            .from('items')
            .select('*')
            .eq('registry_id', registry.id),
          supabase
            .from('checklist_preferences')
            .select('*')
            .eq('user_id', registry.owner_id)
        ])

        if (itemsResult.error) throw itemsResult.error
        if (checklistResult.error) throw checklistResult.error

        setItems(itemsResult.data || [])
        setChecklistPreferences(checklistResult.data || [])
      } catch (err) {
        console.error('Error fetching statistics data:', err)
        setError('שגיאה בטעינת הנתונים')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [registry, user])

  // Calculate all statistics
  const statistics = useMemo<StatisticsData>(() => {
    // Default values
    const defaultStats: StatisticsData = {
      totalValue: 0,
      receivedValue: 0,
      moneySavedPercent: 0,
      itemsRemaining: 0,
      totalItems: 0,
      totalPurchased: 0,
      registryProgressPercent: 0,
      nestingScore: 0,
      essentialTotal: 0,
      essentialChecked: 0,
      niceToHaveTotal: 0,
      niceToHaveChecked: 0,
      essentialPercent: 0,
      niceToHavePercent: 0,
      totalChecklistItems: 0,
      totalChecked: 0,
      categoryStats: [],
      overallReadiness: 0,
      readinessLabel: 'בואי נתחיל!',
    }

    if (!items.length && !checklistPreferences.length) {
      return defaultStats
    }

    // === Registry Stats (from items) ===
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const receivedValue = items.reduce((sum, item) => sum + (item.price * item.quantity_received), 0)
    const moneySavedPercent = totalValue > 0 ? Math.round((receivedValue / totalValue) * 100) : 0

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPurchased = items.reduce((sum, item) => sum + item.quantity_received, 0)
    const itemsRemaining = totalItems - totalPurchased
    const registryProgressPercent = totalItems > 0 ? Math.round((totalPurchased / totalItems) * 100) : 0

    // === Nesting Index (from checklist - ALL suggested items) ===
    // Build map of user preferences for quick lookup
    const prefsMap = new Map<string, ChecklistPreference>()
    checklistPreferences.forEach(pref => {
      prefsMap.set(`${pref.category_id}::${pref.item_name}`, pref)
    })

    // Calculate essential and nice-to-have counts from ALL suggested items
    // Essential items: items marked as 'must' in ITEMS_DATA
    // Nice-to-have: items marked as 'treat' in ITEMS_DATA
    let essentialTotal = 0
    let essentialChecked = 0
    let niceToHaveTotal = 0
    let niceToHaveChecked = 0

    // Go through ALL suggested items in ALL categories
    CATEGORIES.forEach(category => {
      category.suggestedItems.forEach(itemName => {
        const prefKey = `${category.id}::${itemName}`
        const pref = prefsMap.get(prefKey)

        // Skip hidden items
        if (pref?.is_hidden) return

        const itemData = ITEMS_DATA[itemName]
        // Use user's priority if set, otherwise use item's default type
        const isEssential = pref?.priority === 'essential' ||
          (pref?.priority !== 'nice_to_have' && itemData?.type === 'must')

        if (isEssential) {
          essentialTotal++
          if (pref?.is_checked) essentialChecked++
        } else {
          niceToHaveTotal++
          if (pref?.is_checked) niceToHaveChecked++
        }
      })
    })

    // Also count custom items (items in preferences but not in suggested items)
    checklistPreferences.forEach(pref => {
      const isInSuggested = CATEGORIES.some(cat =>
        cat.id === pref.category_id && cat.suggestedItems.includes(pref.item_name)
      )
      if (!isInSuggested && !pref.is_hidden) {
        const isEssential = pref.priority === 'essential'
        if (isEssential) {
          essentialTotal++
          if (pref.is_checked) essentialChecked++
        } else {
          niceToHaveTotal++
          if (pref.is_checked) niceToHaveChecked++
        }
      }
    })

    const essentialPercent = essentialTotal > 0 ? Math.round((essentialChecked / essentialTotal) * 100) : 0
    const niceToHavePercent = niceToHaveTotal > 0 ? Math.round((niceToHaveChecked / niceToHaveTotal) * 100) : 0

    // Nesting score is based on total checked items (both essential and nice-to-have)
    const totalChecklistItems = essentialTotal + niceToHaveTotal
    const totalChecked = essentialChecked + niceToHaveChecked
    const nestingScore = totalChecklistItems > 0 ? Math.round((totalChecked / totalChecklistItems) * 100) : 0

    // === Category Breakdown ===
    const categoryStats: CategoryStats[] = CATEGORIES
      .filter(cat => cat.id !== 'general') // Exclude general category
      .map(category => {
        const categoryItems = items.filter(item => item.category === category.id)
        const totalCategoryValue = categoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const receivedCategoryValue = categoryItems.reduce((sum, item) => sum + (item.price * item.quantity_received), 0)
        const itemCount = categoryItems.reduce((sum, item) => sum + item.quantity, 0)
        const receivedCount = categoryItems.reduce((sum, item) => sum + item.quantity_received, 0)
        const progressPercent = itemCount > 0 ? Math.round((receivedCount / itemCount) * 100) : 0

        return {
          id: category.id,
          name: category.name,
          totalValue: totalCategoryValue,
          receivedValue: receivedCategoryValue,
          itemCount,
          receivedCount,
          progressPercent,
          color: category.color,
        }
      })
      .filter(cat => cat.itemCount > 0) // Only show categories with items

    // === Overall Readiness ===
    // Combine registry progress (40%) and nesting score (60%)
    const overallReadiness = Math.round(
      (registryProgressPercent * 0.4) + (nestingScore * 0.6)
    )

    // Readiness label
    let readinessLabel = 'בואי נתחיל!'
    if (overallReadiness >= 90) {
      readinessLabel = 'מוכנה לגמרי! 🎉'
    } else if (overallReadiness >= 75) {
      readinessLabel = 'כמעט שם!'
    } else if (overallReadiness >= 50) {
      readinessLabel = 'באמצע הדרך'
    } else if (overallReadiness >= 25) {
      readinessLabel = 'מתקדמת יפה'
    } else if (overallReadiness > 0) {
      readinessLabel = 'התחלה טובה'
    }

    return {
      totalValue,
      receivedValue,
      moneySavedPercent,
      itemsRemaining,
      totalItems,
      totalPurchased,
      registryProgressPercent,
      nestingScore,
      essentialTotal,
      essentialChecked,
      niceToHaveTotal,
      niceToHaveChecked,
      essentialPercent,
      niceToHavePercent,
      totalChecklistItems,
      totalChecked,
      categoryStats,
      overallReadiness,
      readinessLabel,
    }
  }, [items, checklistPreferences])

  return {
    statistics,
    isLoading,
    error,
    hasData: items.length > 0 || checklistPreferences.length > 0,
  }
}
