import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  ChevronDown, Check, Plus, Trash2, Sparkles,
  RotateCcw, X, Info, Lightbulb,
  EyeOff, ShoppingBag, ExternalLink, Search
} from 'lucide-react'
import AddItemModal from '../components/AddItemModal'
import { CATEGORIES, ITEMS_DATA } from '../data/categories'
import { supabase } from '../lib/supabase'
import type { ChecklistPreference, PriorityLevel } from '../types'

// Category accent colors for left border + header tint
const CATEGORY_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  strollers:  { border: '#6366f1', bg: '#eef2ff', text: '#4338ca' },
  car_safety: { border: '#ef4444', bg: '#fef2f2', text: '#dc2626' },
  furniture:  { border: '#f59e0b', bg: '#fffbeb', text: '#d97706' },
  safety:     { border: '#10b981', bg: '#ecfdf5', text: '#059669' },
  feeding:    { border: '#3b82f6', bg: '#eff6ff', text: '#2563eb' },
  nursing:    { border: '#ec4899', bg: '#fdf2f8', text: '#db2777' },
  birth_prep: { border: '#8b5cf6', bg: '#f5f3ff', text: '#7c3aed' },
  bath:       { border: '#06b6d4', bg: '#ecfeff', text: '#0891b2' },
  clothing:   { border: '#f97316', bg: '#fff7ed', text: '#ea580c' },
  bedding:    { border: '#14b8a6', bg: '#f0fdfa', text: '#0d9488' },
  toys:       { border: '#a855f7', bg: '#faf5ff', text: '#9333ea' },
  general:    { border: '#64748b', bg: '#f8fafc', text: '#475569' },
  siblings:   { border: '#e11d48', bg: '#fff1f2', text: '#be123c' },
}

export default function Checklist() {
  const { user, registry, isLoading: authLoading } = useAuth()

  // For co-parent support: checklist data is stored under the registry owner's user_id
  // Both owner and partner read/write the same checklist
  const checklistUserId = registry?.owner_id || user?.id

  // === Existing state (unchanged) ===
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [prefilledCategory, setPrefilledCategory] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [preferences, setPreferences] = useState<ChecklistPreference[]>([])
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({})
  const [showDeletedSection, setShowDeletedSection] = useState(false)
  const [showAddCustomItem, setShowAddCustomItem] = useState(false)
  const [customItemName, setCustomItemName] = useState('')
  const [customItemCategory, setCustomItemCategory] = useState('')
  const [activePopover, setActivePopover] = useState<{ item: string; type: 'info' | 'tip' } | null>(null)
  const [activeProductsPopover, setActiveProductsPopover] = useState<string | null>(null)
  const [prefilledProductData, setPrefilledProductData] = useState<{
    name?: string; category?: string; price?: string; storeName?: string; originalUrl?: string; imageUrl?: string
  } | undefined>()
  const [isFromRecommendedProduct, setIsFromRecommendedProduct] = useState(false)

  // === NEW: Redesign state ===
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'done' | 'remaining'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'essential' | 'nice_to_have'>('all')
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(() => {
    // Default: all collapsed. Persist opened sections in localStorage.
    const allIds = new Set(CATEGORIES.map(c => c.id))
    try {
      const saved = localStorage.getItem('checklist_open_categories')
      if (saved) {
        const openIds: string[] = JSON.parse(saved)
        openIds.forEach(id => allIds.delete(id))
      }
    } catch { /* ignore */ }
    return allIds
  })
  const [savingNotes, setSavingNotes] = useState<Set<string>>(new Set())
  const [savedNotes, setSavedNotes] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0]?.id || '')

  // Refs
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const autoSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const savedTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const chipScrollRef = useRef<HTMLDivElement>(null)

  // === Key helper ===
  const getNotesKey = (categoryId: string, itemName: string) => `${categoryId}::${itemName}`

  // === Fetch preferences (unchanged) ===
  const fetchPreferences = useCallback(async () => {
    if (!checklistUserId) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('checklist_preferences')
        .select('*')
        .eq('user_id', checklistUserId)
      if (error) throw error
      setPreferences(data || [])
      const notesMap: Record<string, string> = {}
      data?.forEach(pref => {
        notesMap[getNotesKey(pref.category_id, pref.item_name)] = pref.notes || ''
      })
      setLocalNotes(notesMap)
    } catch (err) {
      console.error('Error fetching checklist preferences:', err)
    } finally {
      setIsLoading(false)
    }
  }, [checklistUserId])

  useEffect(() => {
    if (checklistUserId) fetchPreferences()
  }, [checklistUserId, fetchPreferences])

  // Cleanup timers on unmount
  useEffect(() => {
    const autoTimers = autoSaveTimers.current
    const svdTimers = savedTimers.current
    return () => {
      Object.values(autoTimers).forEach(clearTimeout)
      Object.values(svdTimers).forEach(clearTimeout)
    }
  }, [])

  // === DB helpers (unchanged) ===
  const getPreference = (categoryId: string, itemName: string): ChecklistPreference | undefined => {
    return preferences.find(p => p.category_id === categoryId && p.item_name === itemName)
  }

  // Priority to use when the user has no explicit override. Mirrors ITEMS_DATA.type
  // so that editing type in categories.ts actually drives the UI badge.
  const getDefaultPriority = (itemName: string): PriorityLevel =>
    ITEMS_DATA[itemName]?.type === 'treat' ? 'nice_to_have' : 'essential'

  const upsertPreference = async (
    categoryId: string,
    itemName: string,
    updates: Partial<Pick<ChecklistPreference, 'quantity' | 'is_checked' | 'is_hidden' | 'priority' | 'checked_at'>>
  ) => {
    if (!user) return
    const existing = getPreference(categoryId, itemName)
    try {
      if (existing) {
        const { error } = await supabase
          .from('checklist_preferences')
          .update(updates)
          .eq('id', existing.id)
        if (error) throw error
        setPreferences(prev => prev.map(p => p.id === existing.id ? { ...p, ...updates } : p))
      } else {
        const { data, error } = await supabase
          .from('checklist_preferences')
          .insert({
            user_id: checklistUserId,
            category_id: categoryId,
            item_name: itemName,
            quantity: updates.quantity ?? 1,
            is_checked: updates.is_checked ?? false,
            is_hidden: updates.is_hidden ?? false,
            notes: '',
            priority: updates.priority ?? getDefaultPriority(itemName),
          })
          .select()
          .single()
        if (error) throw error
        if (data) setPreferences(prev => [...prev, data])
      }
    } catch (err) {
      console.error('Error saving preference:', err)
    }
  }

  // === Auto-save notes ===
  const autoSaveNote = useCallback(async (categoryId: string, itemName: string, notes: string) => {
    if (!user) return
    const key = getNotesKey(categoryId, itemName)
    setSavingNotes(prev => new Set(prev).add(key))
    try {
      const existing = getPreference(categoryId, itemName)
      if (existing) {
        await supabase.from('checklist_preferences').update({ notes }).eq('id', existing.id)
        setPreferences(prev => prev.map(p => p.id === existing.id ? { ...p, notes } : p))
      } else {
        const { data } = await supabase.from('checklist_preferences')
          .insert({ user_id: checklistUserId, category_id: categoryId, item_name: itemName, quantity: 1, is_checked: false, is_hidden: false, notes, priority: getDefaultPriority(itemName) })
          .select().single()
        if (data) setPreferences(prev => [...prev, data])
      }
      setSavedNotes(prev => new Set(prev).add(key))
      savedTimers.current[key] = setTimeout(() => {
        setSavedNotes(prev => { const n = new Set(prev); n.delete(key); return n })
      }, 2000)
    } catch (err) {
      console.error('Error auto-saving note:', err)
    } finally {
      setSavingNotes(prev => { const n = new Set(prev); n.delete(key); return n })
    }
  }, [user, preferences])

  const updateLocalNotes = (categoryId: string, itemName: string, notes: string) => {
    const key = getNotesKey(categoryId, itemName)
    setLocalNotes(prev => ({ ...prev, [key]: notes }))
    if (autoSaveTimers.current[key]) clearTimeout(autoSaveTimers.current[key])
    autoSaveTimers.current[key] = setTimeout(() => autoSaveNote(categoryId, itemName, notes), 1000)
  }

  const handleNotesBlur = (categoryId: string, itemName: string) => {
    const key = getNotesKey(categoryId, itemName)
    const localNote = localNotes[key] ?? ''
    const dbNote = getPreference(categoryId, itemName)?.notes ?? ''
    if (localNote !== dbNote) {
      if (autoSaveTimers.current[key]) clearTimeout(autoSaveTimers.current[key])
      autoSaveNote(categoryId, itemName, localNote)
    }
  }

  // === Item operations (unchanged logic) ===
  const hideSuggestion = async (categoryId: string, itemName: string) => {
    if (!confirm(`בטוח שאתם לא צריכים "${itemName}"?`)) return
    await upsertPreference(categoryId, itemName, { is_hidden: true })
  }

  const restoreSuggestion = async (categoryId: string, itemName: string) => {
    await upsertPreference(categoryId, itemName, { is_hidden: false })
  }

  const addCustomItem = async () => {
    if (!customItemName.trim() || !customItemCategory) return
    await upsertPreference(customItemCategory, customItemName.trim(), {
      is_checked: false, is_hidden: false, priority: getDefaultPriority(customItemName.trim()), quantity: 1,
    })
    setCustomItemName('')
    setCustomItemCategory('')
    setShowAddCustomItem(false)
  }

  const toggleSuggestionCheck = async (categoryId: string, itemName: string) => {
    const pref = getPreference(categoryId, itemName)
    const newChecked = !(pref?.is_checked ?? false)
    await upsertPreference(categoryId, itemName, {
      is_checked: newChecked,
      checked_at: newChecked ? new Date().toISOString() : null,
    })
  }

  const isSuggestionChecked = (categoryId: string, itemName: string): boolean => {
    return getPreference(categoryId, itemName)?.is_checked ?? false
  }

  const isSuggestionHidden = (categoryId: string, itemName: string): boolean => {
    return getPreference(categoryId, itemName)?.is_hidden ?? false
  }

  const getQuantity = (categoryId: string, itemName: string): number => {
    return getPreference(categoryId, itemName)?.quantity ?? 1
  }

  const setQuantity = async (categoryId: string, itemName: string, qty: number) => {
    await upsertPreference(categoryId, itemName, { quantity: Math.max(1, qty) })
  }

  const getPriority = (categoryId: string, itemName: string): PriorityLevel => {
    return getPreference(categoryId, itemName)?.priority ?? getDefaultPriority(itemName)
  }

  const togglePriority = async (categoryId: string, itemName: string) => {
    const current = getPriority(categoryId, itemName)
    await upsertPreference(categoryId, itemName, { priority: current === 'essential' ? 'nice_to_have' : 'essential' })
  }

  const getLocalNotes = (categoryId: string, itemName: string): string => {
    const key = getNotesKey(categoryId, itemName)
    if (key in localNotes) return localNotes[key]
    return getPreference(categoryId, itemName)?.notes ?? ''
  }

  // === Deleted items (unchanged) ===
  const getDeletedItems = () => {
    const deleted: { categoryId: string; categoryName: string; itemName: string }[] = []
    CATEGORIES.forEach(category => {
      category.suggestedItems.forEach(item => {
        if (isSuggestionHidden(category.id, item)) {
          deleted.push({ categoryId: category.id, categoryName: category.name, itemName: item })
        }
      })
    })
    preferences
      .filter(p => p.is_hidden && !CATEGORIES.some(c => c.suggestedItems.includes(p.item_name)))
      .forEach(p => {
        const category = CATEGORIES.find(c => c.id === p.category_id)
        if (category) {
          deleted.push({ categoryId: p.category_id, categoryName: category.name, itemName: p.item_name })
        }
      })
    return deleted
  }
  const deletedItems = getDeletedItems()

  // === Modal handlers (unchanged) ===
  const handleAddFromSuggestion = (categoryId: string) => {
    setPrefilledCategory(categoryId)
    setShowAddItemModal(true)
  }

  const handleGlobalAdd = () => {
    setPrefilledCategory(undefined)
    setShowAddItemModal(true)
  }

  const handleCloseModal = () => {
    setShowAddItemModal(false)
    setPrefilledCategory(undefined)
  }

  // === Category progress (unchanged) ===
  const getCategoryProgress = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId)
    if (!category) return { checked: 0, total: 0 }
    const visibleSuggestions = category.suggestedItems.filter(item => !isSuggestionHidden(categoryId, item))
    const customItems = preferences
      .filter(p => p.category_id === categoryId && !p.is_hidden && !category.suggestedItems.includes(p.item_name))
      .map(p => p.item_name)
    const allVisibleItems = [...visibleSuggestions, ...customItems]
    const checkedCount = allVisibleItems.filter(itemName => isSuggestionChecked(categoryId, itemName)).length
    return { checked: checkedCount, total: allVisibleItems.length }
  }

  // === Metrics (unchanged) ===
  const allItems = [
    ...CATEGORIES.flatMap(cat =>
      cat.suggestedItems
        .filter(item => !isSuggestionHidden(cat.id, item))
        .map(item => ({ categoryId: cat.id, name: item }))
    ),
    ...preferences
      .filter(p => !p.is_hidden && !CATEGORIES.some(c => c.id === p.category_id && c.suggestedItems.includes(p.item_name)))
      .map(p => ({ categoryId: p.category_id, name: p.item_name }))
  ]
  const totalItems = allItems.length
  const checkedItems = allItems.filter(i => isSuggestionChecked(i.categoryId, i.name)).length
  const essentialItems = allItems.filter(i => getPriority(i.categoryId, i.name) === 'essential')
  const checkedEssential = essentialItems.filter(i => isSuggestionChecked(i.categoryId, i.name)).length
  const nestingScore = essentialItems.length > 0 ? Math.round((checkedEssential / essentialItems.length) * 100) : 0
  const remainingEssential = essentialItems.length - checkedEssential

  // === NEW: Category collapse toggle ===
  const toggleCategoryCollapse = (categoryId: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      // Persist: save which categories are OPEN to localStorage
      const allIds = CATEGORIES.map(c => c.id)
      const openIds = allIds.filter(id => !next.has(id))
      try { localStorage.setItem('checklist_open_categories', JSON.stringify(openIds)) } catch { /* ignore */ }
      return next
    })
  }

  // === NEW: Filter items ===
  const getFilteredItems = (categoryId: string, items: string[]) => {
    return items.filter(item => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!item.toLowerCase().includes(q)) return false
      }
      if (statusFilter === 'done' && !isSuggestionChecked(categoryId, item)) return false
      if (statusFilter === 'remaining' && isSuggestionChecked(categoryId, item)) return false
      if (priorityFilter !== 'all' && getPriority(categoryId, item) !== priorityFilter) return false
      return true
    })
  }

  // === NEW: Scroll to category ===
  const scrollToCategory = (categoryId: string) => {
    const el = categoryRefs.current[categoryId]
    if (el) {
      const offset = 200
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
    // If collapsed, expand it (and persist)
    setCollapsedCategories(prev => {
      const next = new Set(prev)
      next.delete(categoryId)
      const allIds = CATEGORIES.map(c => c.id)
      const openIds = allIds.filter(id => !next.has(id))
      try { localStorage.setItem('checklist_open_categories', JSON.stringify(openIds)) } catch { /* ignore */ }
      return next
    })
  }

  // === NEW: IntersectionObserver for active category ===
  useEffect(() => {
    if (isLoading) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const catId = entry.target.getAttribute('data-category-id')
            if (catId) setActiveCategory(catId)
          }
        })
      },
      { rootMargin: '-200px 0px -60% 0px', threshold: 0 }
    )
    Object.entries(categoryRefs.current).forEach(([, el]) => {
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [isLoading])

  // Has any active filters?
  const hasActiveFilters = searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'

  // Count filtered results
  const filteredCount = useMemo(() => {
    if (!hasActiveFilters) return totalItems
    return CATEGORIES.reduce((acc, cat) => {
      const visible = cat.suggestedItems.filter(item => !isSuggestionHidden(cat.id, item))
      const custom = preferences
        .filter(p => p.category_id === cat.id && !p.is_hidden && !cat.suggestedItems.includes(p.item_name))
        .map(p => p.item_name)
      return acc + getFilteredItems(cat.id, [...visible, ...custom]).length
    }, 0)
  }, [searchQuery, statusFilter, priorityFilter, preferences, hasActiveFilters])

  // === Loading state ===
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#fffbff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-[#6750a4] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[#49454f]">טוען צ'קליסט...</p>
        </div>
      </div>
    )
  }

  // === RENDER ===
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-[#1d192b]" dir="rtl">
      {/* Add Item Modal */}
      {registry && (
        <AddItemModal
          isOpen={showAddItemModal}
          onClose={() => { handleCloseModal(); setPrefilledProductData(undefined); setIsFromRecommendedProduct(false) }}
          registryId={registry.id}
          onSave={() => { handleCloseModal(); setPrefilledProductData(undefined); setIsFromRecommendedProduct(false) }}
          prefilledData={prefilledProductData || (prefilledCategory ? { category: prefilledCategory } : undefined)}
          forceManualTab={isFromRecommendedProduct}
          highlightColor={isFromRecommendedProduct}
        />
      )}

      {/* Mobile Info/Tip Bottom Sheet */}
      {activePopover && ITEMS_DATA[activePopover.item] && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setActivePopover(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-lg bg-white rounded-t-[24px] p-5 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-[#e7e0ec] rounded-full mx-auto mb-4" />
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                activePopover.type === 'info' ? 'bg-[#e3f2fd] text-[#1976d2]' : 'bg-[#fff8e1] text-[#f9a825]'
              }`}>
                {activePopover.type === 'info' ? <Info className="w-5 h-5" /> : <Lightbulb className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold mb-1 ${activePopover.type === 'info' ? 'text-[#1976d2]' : 'text-[#f9a825]'}`}>
                  {activePopover.type === 'info' ? 'מה זה?' : 'הטיפ שלנו'}
                </p>
                <p className="text-sm font-medium text-[#1d192b] mb-2">{activePopover.item}</p>
                <p className="text-sm text-[#49454f] leading-relaxed">
                  {activePopover.type === 'info' ? ITEMS_DATA[activePopover.item].description : ITEMS_DATA[activePopover.item].tip}
                </p>
              </div>
            </div>
            <button onClick={() => setActivePopover(null)} className="mt-5 w-full py-3 bg-[#f3edff] hover:bg-[#eaddff] text-[#6750a4] rounded-xl font-medium transition-colors">
              סגור
            </button>
          </div>
        </div>
      )}

      {/* === STICKY HEADER + FILTERS === */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e7e0ec]/80 shadow-sm">
        {/* Top bar: Score + Add button */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-3">
          <div className="flex items-center justify-between gap-4">
            {/* Nesting Score - compact */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3edff" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6750a4" strokeWidth="3"
                    strokeDasharray={`${nestingScore} ${100 - nestingScore}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#6750a4]">{nestingScore}%</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-[#1d192b] truncate">צ'קליסט ההכנה</h1>
                <p className="text-xs text-[#49454f] truncate">
                  <span className="font-semibold text-[#6750a4]">{checkedItems}</span>/{totalItems} פריטים
                  {remainingEssential > 0 && <span className="text-[#b3261e]"> · {remainingEssential} חובה נותרו</span>}
                  {remainingEssential === 0 && checkedItems > 0 && <span className="text-[#00c875]"> · כל החובה הושלמו! 🎉</span>}
                </p>
              </div>
            </div>

            {/* Add button */}
            {registry && (
              <button
                onClick={handleGlobalAdd}
                className="flex items-center gap-1.5 bg-[#6750a4] hover:bg-[#503e85] text-white px-4 py-2 rounded-full font-medium text-sm transition-all shadow-md active:scale-95 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">הוסף פריט</span>
              </button>
            )}
          </div>
        </div>

        {/* Search + Filters */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-3">
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#49454f]/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חיפוש פריט..."
                className="w-full pr-9 pl-3 py-2 bg-[#f5f5f5] rounded-xl text-sm text-[#1d192b] placeholder:text-[#49454f]/40 focus:outline-none focus:ring-2 focus:ring-[#6750a4]/30 focus:bg-white transition-all border border-transparent focus:border-[#6750a4]/20"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#e7e0ec] text-[#49454f]">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'done' | 'remaining')}
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                statusFilter !== 'all'
                  ? 'bg-[#6750a4] text-white border-[#6750a4]'
                  : 'bg-[#f5f5f5] text-[#49454f] border-transparent hover:bg-[#e7e0ec]'
              }`}
            >
              <option value="all">הכל</option>
              <option value="remaining">נותרו</option>
              <option value="done">הושלמו</option>
            </select>

            {/* Priority filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as 'all' | 'essential' | 'nice_to_have')}
              className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                priorityFilter !== 'all'
                  ? 'bg-[#6750a4] text-white border-[#6750a4]'
                  : 'bg-[#f5f5f5] text-[#49454f] border-transparent hover:bg-[#e7e0ec]'
              }`}
            >
              <option value="all">עדיפות</option>
              <option value="essential">חובה</option>
              <option value="nice_to_have">פינוק</option>
            </select>
          </div>

          {/* Active filter indicator */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-[#49454f]">
                מציג {filteredCount} מתוך {totalItems} פריטים
              </p>
              <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); setPriorityFilter('all') }} className="text-xs text-[#6750a4] font-medium hover:underline">
                נקה סינון
              </button>
            </div>
          )}
        </div>

        {/* Category navigation chips */}
        <div ref={chipScrollRef} className="max-w-5xl mx-auto px-4 sm:px-6 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1.5 min-w-max">
            {CATEGORIES.filter(c => c.suggestedItems.length > 0).map(cat => {
              const progress = getCategoryProgress(cat.id)
              const isDone = progress.checked === progress.total && progress.total > 0
              const isActive = activeCategory === cat.id
              const CategoryIcon = cat.icon
              const colors = CATEGORY_COLORS[cat.id] || CATEGORY_COLORS.general

              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                    isActive
                      ? 'shadow-sm scale-105'
                      : 'border-transparent hover:bg-[#f5f5f5]'
                  }`}
                  style={isActive ? {
                    backgroundColor: colors.bg,
                    borderColor: colors.border + '40',
                    color: colors.text,
                  } : {
                    color: '#49454f',
                  }}
                >
                  <CategoryIcon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                  {isDone && <Check className="w-3 h-3 text-[#00c875]" />}
                  {!isDone && <span className="opacity-60">{progress.checked}/{progress.total}</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Category Groups */}
        {CATEGORIES.filter(cat => cat.suggestedItems.length > 0).map((category) => {
          const CategoryIcon = category.icon
          const progress = getCategoryProgress(category.id)
          const progressPercent = progress.total > 0 ? (progress.checked / progress.total) * 100 : 0
          const isCollapsed = collapsedCategories.has(category.id)
          const colors = CATEGORY_COLORS[category.id] || CATEGORY_COLORS.general

          // Get visible items
          const visibleSuggestedItems = category.suggestedItems.filter(item => !isSuggestionHidden(category.id, item))
          const customItems = preferences
            .filter(p => p.category_id === category.id && !p.is_hidden && !category.suggestedItems.includes(p.item_name))
            .map(p => p.item_name)
          const allVisibleItems = [...visibleSuggestedItems, ...customItems]
          const filteredItems = getFilteredItems(category.id, allVisibleItems)

          // Skip category if all filtered out
          if (hasActiveFilters && filteredItems.length === 0) return null

          return (
            <div
              key={category.id}
              ref={el => { categoryRefs.current[category.id] = el }}
              data-category-id={category.id}
              data-tutorial={category.id === 'strollers' ? 'checklist-category' : undefined}
              className="bg-white rounded-2xl border border-[#e7e0ec]/80 overflow-hidden shadow-sm"
              style={{ borderRight: `4px solid ${colors.border}` }}
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategoryCollapse(category.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f9f9f9] transition-colors"
                style={{ backgroundColor: isCollapsed ? 'transparent' : colors.bg + '40' }}
              >
                <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: colors.bg, color: colors.text }}>
                  <CategoryIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#1d192b]">{category.name}</span>
                    {category.id === 'birth_prep' && (
                      <span className="flex items-center gap-1 bg-[#fce4ec] text-[#880e4f] text-[10px] px-1.5 py-0.5 rounded-full">
                        <EyeOff className="w-2.5 h-2.5" />
                        פרטי
                      </span>
                    )}
                    {progress.checked === progress.total && progress.total > 0 && (
                      <span className="text-[10px] bg-[#e8f5e9] text-[#2e7d32] px-1.5 py-0.5 rounded-full font-semibold">הושלם ✓</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden max-w-[200px]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%`, backgroundColor: progressPercent === 100 ? '#00c875' : colors.border }}
                      />
                    </div>
                    <span className="text-[10px] text-[#49454f] font-medium">{progress.checked}/{progress.total}</span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#49454f] transition-transform flex-shrink-0 ${isCollapsed ? '-rotate-90' : ''}`} />
              </button>

              {/* Items — flat layout: no expand needed */}
              {!isCollapsed && filteredItems.length > 0 && (
                <div className="border-t border-[#e7e0ec]/60">
                  {filteredItems.map((item, index) => {
                    const isChecked = isSuggestionChecked(category.id, item)
                    const priority = getPriority(category.id, item)
                    const hasProducts = ITEMS_DATA[item]?.products && ITEMS_DATA[item].products!.length > 0
                    const hasItemData = !!ITEMS_DATA[item]
                    const quantity = getQuantity(category.id, item)
                    const notes = getLocalNotes(category.id, item)
                    const noteKey = getNotesKey(category.id, item)
                    const isSavingNote = savingNotes.has(noteKey)
                    const isSavedNote = savedNotes.has(noteKey)

                    return (
                      <div key={index} className={`border-b border-[#e7e0ec]/40 last:border-b-0 ${isChecked ? 'bg-[#f9f8fc]' : ''}`}>
                        {/* Row 1: Checkbox + Name + Priority + Delete(desktop) */}
                        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 pt-2.5 pb-1 group">
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleSuggestionCheck(category.id, item)}
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                              isChecked
                                ? 'border-[#6750a4] bg-[#6750a4] text-white'
                                : 'border-[#d0d0d0] bg-white hover:border-[#6750a4]'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} />}
                          </button>

                          {/* Item name + Desktop info/tip hover icons */}
                          <div className="flex-1 min-w-0 flex items-center gap-1.5">
                            <span className={`text-sm font-medium transition-all truncate ${isChecked ? 'text-[#49454f]/50 line-through decoration-[#6750a4]/30' : 'text-[#1d192b]'}`}>
                              {item}
                            </span>
                            {hasItemData && (
                              <div className="hidden sm:flex items-center gap-0.5 flex-shrink-0">
                                <div className="relative group/info">
                                  <span className="p-0.5 rounded text-[#90a4ae] hover:text-[#1976d2] transition-colors cursor-help">
                                    <Info className="w-3.5 h-3.5" />
                                  </span>
                                  <div className="absolute z-[100] top-full right-0 mt-2 w-64 p-3 bg-white rounded-xl shadow-xl border border-[#e7e0ec] opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 pointer-events-none group-hover/info:pointer-events-auto">
                                    <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white border-r border-t border-[#e7e0ec] transform rotate-[-45deg]" />
                                    <p className="text-xs font-bold text-[#1976d2] mb-1">מה זה?</p>
                                    <p className="text-xs text-[#49454f] leading-relaxed">{ITEMS_DATA[item].description}</p>
                                  </div>
                                </div>
                                <div className="relative group/tip">
                                  <span className="p-0.5 rounded text-[#90a4ae] hover:text-[#f9a825] transition-colors cursor-help">
                                    <Lightbulb className="w-3.5 h-3.5" />
                                  </span>
                                  <div className="absolute z-[100] top-full right-0 mt-2 w-72 p-3 bg-white rounded-xl shadow-xl border border-[#e7e0ec] opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200 pointer-events-none group-hover/tip:pointer-events-auto">
                                    <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white border-r border-t border-[#e7e0ec] transform rotate-[-45deg]" />
                                    <p className="text-xs font-bold text-[#f9a825] mb-1">הטיפ שלנו</p>
                                    <p className="text-xs text-[#49454f] leading-relaxed">{ITEMS_DATA[item].tip}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Priority badge */}
                          <button
                            onClick={() => togglePriority(category.id, item)}
                            className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold transition-all border flex-shrink-0 ${
                              priority === 'essential'
                                ? 'bg-[#fef3c7] text-[#92400e] border-[#fde68a] hover:bg-[#fde68a]'
                                : 'bg-[#f5f5f5] text-[#9e9e9e] border-[#e0e0e0] hover:border-[#bdbdbd]'
                            }`}
                          >
                            {priority === 'essential' ? 'חובה' : 'פינוק'}
                          </button>

                          {/* Delete — desktop, shown on hover */}
                          <button
                            onClick={() => hideSuggestion(category.id, item)}
                            className="hidden sm:flex p-1.5 rounded-lg text-[#c0c0c0] hover:text-[#b3261e] hover:bg-[#ffebee] opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Row 2: Notes + Quantity + Actions — always visible */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 px-3 sm:px-4 pb-2.5 mr-8 sm:mr-10">
                          {/* Notes — compact inline with label */}
                          <div className="flex items-center gap-1.5 sm:flex-1 sm:min-w-0">
                            <span className="text-[10px] text-[#9e9e9e] font-medium whitespace-nowrap flex-shrink-0">הערה:</span>
                            <div className="relative flex-1 min-w-0">
                              <input
                                type="text"
                                placeholder="הוסיפי הערה..."
                                value={notes}
                                onChange={(e) => updateLocalNotes(category.id, item, e.target.value)}
                                onBlur={() => handleNotesBlur(category.id, item)}
                                className="w-full bg-transparent border-b border-[#e7e0ec] focus:border-[#6750a4] py-0.5 text-xs text-[#1d192b] placeholder:text-[#d0d0d0] focus:outline-none transition-all"
                              />
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[9px] font-medium pointer-events-none">
                                {isSavingNote && <span className="text-[#f9a825] animate-pulse">שומר...</span>}
                                {isSavedNote && !isSavingNote && <span className="text-[#00c875]">✓</span>}
                              </div>
                            </div>
                          </div>

                          {/* Actions row */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Quantity */}
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-[#9e9e9e] font-medium">כמות:</span>
                              <button onClick={() => setQuantity(category.id, item, quantity - 1)} disabled={quantity <= 1} className="w-5 h-5 rounded bg-[#f5f5f5] hover:bg-[#e7e0ec] text-[#49454f] text-xs font-medium flex items-center justify-center disabled:opacity-30 transition-colors">-</button>
                              <span className="w-4 text-center text-xs font-bold text-[#1d192b]">{quantity}</span>
                              <button onClick={() => setQuantity(category.id, item, quantity + 1)} className="w-5 h-5 rounded bg-[#f5f5f5] hover:bg-[#e7e0ec] text-[#49454f] text-xs font-medium flex items-center justify-center transition-colors">+</button>
                            </div>

                            {/* Mobile info/tip */}
                            {hasItemData && (
                              <div className="flex sm:hidden items-center gap-0.5">
                                <button onClick={() => setActivePopover({ item, type: 'info' })} className="p-1 rounded-md bg-[#e3f2fd]/40 text-[#1976d2]">
                                  <Info className="w-3 h-3" />
                                </button>
                                <button onClick={() => setActivePopover({ item, type: 'tip' })} className="p-1 rounded-md bg-[#fff8e1]/50 text-[#f9a825]">
                                  <Lightbulb className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            {/* Spacer to push add/delete to end when no products badge here */}

                            {/* Add to registry */}
                            {registry && (
                              <button
                                onClick={() => handleAddFromSuggestion(category.id)}
                                className="flex items-center gap-1.5 bg-[#6750a4] hover:bg-[#503e85] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm hover:shadow-md"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>הוסף לרשימה</span>
                              </button>
                            )}

                            {/* Mobile delete */}
                            <button
                              onClick={() => hideSuggestion(category.id, item)}
                              className="sm:hidden p-1 rounded-md text-[#c0c0c0] hover:text-[#b3261e] hover:bg-[#ffebee] transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Recommended Products — prominent banner + carousel */}
                        {hasProducts && (
                          <div className="mx-2 sm:mx-3 mb-2 mr-8 sm:mr-10">
                            <button
                              onClick={() => setActiveProductsPopover(activeProductsPopover === item ? null : item)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                                activeProductsPopover === item
                                  ? 'bg-gradient-to-l from-[#e8f5e9] to-[#f1f8e9] ring-1 ring-[#a5d6a7]/60'
                                  : 'bg-gradient-to-l from-[#f1f8e9]/60 to-[#f9fbe7]/40 hover:from-[#e8f5e9] hover:to-[#f1f8e9]'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                  activeProductsPopover === item ? 'bg-[#2e7d32] text-white' : 'bg-[#c8e6c9] text-[#2e7d32]'
                                }`}>
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-bold text-[#2e7d32]">מוצרים מומלצים</p>
                                  <p className="text-[10px] text-[#66bb6a]">{ITEMS_DATA[item].products!.length} מוצרים נבחרו עבורך</p>
                                </div>
                              </div>
                              <ChevronDown className={`w-4 h-4 text-[#43a047] transition-transform duration-200 ${activeProductsPopover === item ? 'rotate-180' : ''}`} />
                            </button>

                            {activeProductsPopover === item && (
                              <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
                                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                                  {ITEMS_DATA[item].products!.map((product, pIndex) => (
                                    <div key={pIndex} className="flex-shrink-0 w-44 sm:w-52 snap-start bg-white rounded-xl border border-[#e7e0ec] p-2.5 shadow-sm hover:shadow-md transition-shadow">
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-28 sm:h-32 object-contain rounded-lg mb-2 bg-[#f5f5f5]"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/favicon.png' }}
                                      />
                                      <p className="text-xs font-semibold text-[#1d192b] mb-0.5 leading-tight line-clamp-2">{product.name}</p>
                                      <p className="text-[10px] text-[#49454f] mb-1">{product.store}</p>
                                      <p className="text-sm font-bold text-[#2e7d32] mb-2">₪{product.price.toLocaleString()}</p>
                                      <div className="flex gap-1.5">
                                        <a
                                          href={product.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#f5f5f5] hover:bg-[#e0e0e0] text-[#49454f] text-[10px] font-medium transition-colors"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          לחנות
                                        </a>
                                        <button
                                          onClick={() => {
                                            setPrefilledProductData({
                                              name: product.name,
                                              category: category.id,
                                              price: product.price.toString(),
                                              storeName: product.store,
                                              originalUrl: product.url,
                                              imageUrl: product.image,
                                            })
                                            setIsFromRecommendedProduct(true)
                                            setActiveProductsPopover(null)
                                            setShowAddItemModal(true)
                                          }}
                                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#6750a4] hover:bg-[#503e85] text-white text-[10px] font-medium transition-colors"
                                        >
                                          <Plus className="w-3 h-3" />
                                          הוסף
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                  {/* Add custom product card */}
                                  <div
                                    onClick={() => {
                                      setPrefilledCategory(category.id)
                                      setActiveProductsPopover(null)
                                      setShowAddItemModal(true)
                                    }}
                                    className="flex-shrink-0 w-32 sm:w-40 snap-start bg-white rounded-xl border-2 border-dashed border-[#d0bcff] p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#f3edff] hover:border-[#6750a4] transition-all min-h-[180px]"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-[#f3edff] flex items-center justify-center text-[#6750a4]">
                                      <Plus className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-medium text-[#6750a4] text-center">הוסף פריט אחר</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Empty category state */}
              {!isCollapsed && filteredItems.length === 0 && !hasActiveFilters && allVisibleItems.length === 0 && (
                <div className="border-t border-[#e7e0ec]/60 p-6 text-center">
                  <Sparkles className="w-5 h-5 text-[#d0d0d0] mx-auto mb-2" />
                  <p className="text-sm text-[#9e9e9e]">כל הפריטים בקטגוריה זו הוסרו</p>
                </div>
              )}
            </div>
          )
        })}

        {/* Add Custom Item Section */}
        <div className="mt-6">
          {!showAddCustomItem ? (
            <button
              onClick={() => setShowAddCustomItem(true)}
              className="w-full flex items-center justify-center gap-3 p-4 bg-white rounded-2xl border-2 border-dashed border-[#e7e0ec] hover:border-[#6750a4] hover:bg-[#f3edff]/20 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-[#f3edff] flex items-center justify-center text-[#6750a4] group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-sm text-[#49454f] font-medium group-hover:text-[#6750a4]">הוסף פריט מותאם אישית לצ'קליסט</span>
            </button>
          ) : (
            <div className="bg-white rounded-2xl border border-[#e7e0ec] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#1d192b]">הוסף פריט חדש</h3>
                <button onClick={() => { setShowAddCustomItem(false); setCustomItemName(''); setCustomItemCategory('') }} className="p-1.5 rounded-full hover:bg-[#f5f5f5] text-[#49454f]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <select
                  value={customItemCategory}
                  onChange={(e) => setCustomItemCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#e7e0ec] bg-white text-sm text-[#1d192b] focus:outline-none focus:ring-2 focus:ring-[#6750a4]/30 focus:border-[#6750a4]/30"
                >
                  <option value="">בחרי קטגוריה...</option>
                  {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                <input
                  type="text"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  placeholder="שם הפריט..."
                  className="w-full p-2.5 rounded-xl border border-[#e7e0ec] bg-white text-sm text-[#1d192b] placeholder:text-[#49454f]/40 focus:outline-none focus:ring-2 focus:ring-[#6750a4]/30 focus:border-[#6750a4]/30"
                />
                <button
                  onClick={addCustomItem}
                  disabled={!customItemName.trim() || !customItemCategory}
                  className="w-full flex items-center justify-center gap-2 bg-[#6750a4] hover:bg-[#503e85] disabled:bg-[#e7e0ec] disabled:text-[#49454f] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md disabled:shadow-none"
                >
                  <Plus className="w-4 h-4" />
                  הוסף לצ'קליסט
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Deleted Items Section */}
        {deletedItems.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowDeletedSection(!showDeletedSection)}
              className="w-full flex items-center justify-between p-3 bg-[#fff8f8] rounded-2xl border border-[#ffebee] hover:bg-[#ffebee]/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ffebee] flex items-center justify-center text-[#b3261e]">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-[#1d192b]">פריטים שהוסרו</p>
                  <p className="text-xs text-[#49454f]">{deletedItems.length} פריטים • לחץ לשחזור</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#49454f] transition-transform ${showDeletedSection ? 'rotate-180' : ''}`} />
            </button>

            {showDeletedSection && (
              <div className="mt-2 bg-white rounded-2xl border border-[#e7e0ec] overflow-hidden">
                <div className="divide-y divide-[#e7e0ec]/60">
                  {deletedItems.map((item, index) => (
                    <div key={`${item.categoryId}-${item.itemName}-${index}`} className="flex items-center justify-between px-4 py-3 hover:bg-[#f3edff]/20 transition-colors">
                      <div className="flex items-center gap-2">
                        <Trash2 className="w-3.5 h-3.5 text-[#c0c0c0]" />
                        <div>
                          <p className="text-sm font-medium text-[#1d192b]">{item.itemName}</p>
                          <p className="text-[10px] text-[#49454f]">{item.categoryName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => restoreSuggestion(item.categoryId, item.itemName)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f3edff] hover:bg-[#eaddff] text-[#6750a4] rounded-full font-medium text-xs transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        שחזר
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom spacer for scroll comfort */}
        <div className="h-20" />
      </div>
    </div>
  )
}
