import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ChevronDown, Check, Plus, Trash2, ClipboardList, Sparkles, Heart, AlertCircle, Feather, Save, RotateCcw, X, Info, Lightbulb } from 'lucide-react'
import AddItemModal from '../components/AddItemModal'
import { CATEGORIES, ITEMS_DATA } from '../data/categories'
import { supabase } from '../lib/supabase'
import type { ChecklistPreference, PriorityLevel } from '../types'

export default function Checklist() {
  const { user, registry, isLoading: authLoading } = useAuth()
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [prefilledCategory, setPrefilledCategory] = useState<string | undefined>()
  const [expandedCategory, setExpandedCategory] = useState<string | null>('strollers')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeletedSection, setShowDeletedSection] = useState(false)
  const [showAddCustomItem, setShowAddCustomItem] = useState(false)
  const [customItemName, setCustomItemName] = useState('')
  const [customItemCategory, setCustomItemCategory] = useState('')

  // Checklist preferences from database
  const [preferences, setPreferences] = useState<ChecklistPreference[]>([])

  // Local notes state (not synced to DB until save)
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({})
  const [hasUnsavedNotes, setHasUnsavedNotes] = useState(false)

  // State for mobile info/tip popovers
  const [activePopover, setActivePopover] = useState<{ item: string; type: 'info' | 'tip' } | null>(null)

  // Create a key for the notes map
  const getNotesKey = (categoryId: string, itemName: string) => `${categoryId}::${itemName}`

  // Fetch preferences from database
  const fetchPreferences = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('checklist_preferences')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      setPreferences(data || [])

      // Initialize local notes from fetched data
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
  }, [user])

  useEffect(() => {
    if (user) {
      fetchPreferences()
    }
  }, [user, fetchPreferences])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedNotes) {
        e.preventDefault()
        e.returnValue = 'יש לך הערות שלא נשמרו. האם אתה בטוח שברצונך לעזוב?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedNotes])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  // Get preference for a specific item
  const getPreference = (categoryId: string, itemName: string): ChecklistPreference | undefined => {
    return preferences.find(p => p.category_id === categoryId && p.item_name === itemName)
  }

  // Upsert preference (create or update) - excluding notes
  const upsertPreference = async (
    categoryId: string,
    itemName: string,
    updates: Partial<Pick<ChecklistPreference, 'quantity' | 'is_checked' | 'is_hidden' | 'priority'>>
  ) => {
    if (!user) return

    const existing = getPreference(categoryId, itemName)

    try {
      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('checklist_preferences')
          .update(updates)
          .eq('id', existing.id)

        if (error) throw error

        setPreferences(prev =>
          prev.map(p =>
            p.id === existing.id ? { ...p, ...updates } : p
          )
        )
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('checklist_preferences')
          .insert({
            user_id: user.id,
            category_id: categoryId,
            item_name: itemName,
            quantity: updates.quantity ?? 1,
            is_checked: updates.is_checked ?? false,
            is_hidden: updates.is_hidden ?? false,
            notes: '',
            priority: updates.priority ?? 'essential',
          })
          .select()
          .single()

        if (error) throw error
        if (data) {
          setPreferences(prev => [...prev, data])
        }
      }
    } catch (err) {
      console.error('Error saving preference:', err)
    }
  }

  // Save all unsaved notes
  const saveAllNotes = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      // Find all notes that differ from DB
      const notesToSave: { categoryId: string; itemName: string; notes: string }[] = []

      Object.entries(localNotes).forEach(([key, localNote]) => {
        const [categoryId, itemName] = key.split('::')
        const dbNote = getPreference(categoryId, itemName)?.notes ?? ''
        if (localNote !== dbNote) {
          notesToSave.push({ categoryId, itemName, notes: localNote })
        }
      })

      // Save each note
      for (const { categoryId, itemName, notes } of notesToSave) {
        const existing = getPreference(categoryId, itemName)

        if (existing) {
          await supabase
            .from('checklist_preferences')
            .update({ notes })
            .eq('id', existing.id)

          setPreferences(prev =>
            prev.map(p =>
              p.id === existing.id ? { ...p, notes } : p
            )
          )
        } else {
          const { data } = await supabase
            .from('checklist_preferences')
            .insert({
              user_id: user.id,
              category_id: categoryId,
              item_name: itemName,
              quantity: 1,
              is_checked: false,
              is_hidden: false,
              notes,
              priority: 'essential',
            })
            .select()
            .single()

          if (data) {
            setPreferences(prev => [...prev, data])
          }
        }
      }

      setHasUnsavedNotes(false)
    } catch (err) {
      console.error('Error saving notes:', err)
      alert('שגיאה בשמירת ההערות. נסה שוב.')
    } finally {
      setIsSaving(false)
    }
  }

  // Hide a suggestion from the checklist
  const hideSuggestion = async (categoryId: string, itemName: string) => {
    if (!confirm(`בטוח שאתם לא צריכים "${itemName}"?`)) return
    await upsertPreference(categoryId, itemName, { is_hidden: true })
  }

  // Restore a hidden suggestion
  const restoreSuggestion = async (categoryId: string, itemName: string) => {
    await upsertPreference(categoryId, itemName, { is_hidden: false })
  }

  // Add a custom item to a category
  const addCustomItem = async () => {
    if (!customItemName.trim() || !customItemCategory) return

    await upsertPreference(customItemCategory, customItemName.trim(), {
      is_checked: false,
      is_hidden: false,
      priority: 'essential',
      quantity: 1,
    })

    setCustomItemName('')
    setCustomItemCategory('')
    setShowAddCustomItem(false)
  }

  // Toggle check on a suggestion
  const toggleSuggestionCheck = async (categoryId: string, itemName: string) => {
    const pref = getPreference(categoryId, itemName)
    const newChecked = !(pref?.is_checked ?? false)
    await upsertPreference(categoryId, itemName, { is_checked: newChecked })
  }

  // Check if a suggestion is checked
  const isSuggestionChecked = (categoryId: string, itemName: string): boolean => {
    return getPreference(categoryId, itemName)?.is_checked ?? false
  }

  // Check if a suggestion is hidden
  const isSuggestionHidden = (categoryId: string, itemName: string): boolean => {
    return getPreference(categoryId, itemName)?.is_hidden ?? false
  }

  // Get all deleted (hidden) items across all categories
  const getDeletedItems = () => {
    const deleted: { categoryId: string; categoryName: string; itemName: string }[] = []

    CATEGORIES.forEach(category => {
      category.suggestedItems.forEach(item => {
        if (isSuggestionHidden(category.id, item)) {
          deleted.push({
            categoryId: category.id,
            categoryName: category.name,
            itemName: item,
          })
        }
      })
    })

    // Also include custom items that are hidden
    preferences
      .filter(p => p.is_hidden && !CATEGORIES.some(c => c.suggestedItems.includes(p.item_name)))
      .forEach(p => {
        const category = CATEGORIES.find(c => c.id === p.category_id)
        if (category) {
          deleted.push({
            categoryId: p.category_id,
            categoryName: category.name,
            itemName: p.item_name,
          })
        }
      })

    return deleted
  }

  const deletedItems = getDeletedItems()

  // Get/set quantity for a suggestion
  const getQuantity = (categoryId: string, itemName: string): number => {
    return getPreference(categoryId, itemName)?.quantity ?? 1
  }

  const setQuantity = async (categoryId: string, itemName: string, qty: number) => {
    await upsertPreference(categoryId, itemName, { quantity: Math.max(1, qty) })
  }

  // Priority helpers
  const getPriority = (categoryId: string, itemName: string): PriorityLevel => {
    return getPreference(categoryId, itemName)?.priority ?? 'essential'
  }

  const togglePriority = async (categoryId: string, itemName: string) => {
    const current = getPriority(categoryId, itemName)
    const newPriority = current === 'essential' ? 'nice_to_have' : 'essential'
    await upsertPreference(categoryId, itemName, { priority: newPriority })
  }

  // Notes helpers - now use local state
  const getLocalNotes = (categoryId: string, itemName: string): string => {
    const key = getNotesKey(categoryId, itemName)
    if (key in localNotes) {
      return localNotes[key]
    }
    return getPreference(categoryId, itemName)?.notes ?? ''
  }

  const updateLocalNotes = (categoryId: string, itemName: string, notes: string) => {
    const key = getNotesKey(categoryId, itemName)
    setLocalNotes(prev => ({ ...prev, [key]: notes }))

    // Check if this differs from DB
    const dbNote = getPreference(categoryId, itemName)?.notes ?? ''
    if (notes !== dbNote) {
      setHasUnsavedNotes(true)
    } else {
      // Check if any other notes are unsaved
      const otherUnsaved = Object.entries(localNotes).some(([k, v]) => {
        if (k === key) return false
        const [catId, itemN] = k.split('::')
        const dbN = getPreference(catId, itemN)?.notes ?? ''
        return v !== dbN
      })
      setHasUnsavedNotes(otherUnsaved)
    }
  }

  // Open add modal with category prefilled but name blank
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

  // Get category progress
  const getCategoryProgress = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId)
    if (!category) return { checked: 0, total: 0 }

    const visibleSuggestions = category.suggestedItems.filter(
      item => !isSuggestionHidden(categoryId, item)
    )

    // Include custom items
    const customItems = preferences
      .filter(p => p.category_id === categoryId && !p.is_hidden && !category.suggestedItems.includes(p.item_name))
      .map(p => p.item_name)

    const allVisibleItems = [...visibleSuggestions, ...customItems]

    const checkedCount = allVisibleItems.filter(itemName =>
      isSuggestionChecked(categoryId, itemName)
    ).length

    return {
      checked: checkedCount,
      total: allVisibleItems.length
    }
  }

  // Calculate all items for metrics (including custom items)
  const allItems = [
    // Suggested items
    ...CATEGORIES.flatMap(cat =>
      cat.suggestedItems
        .filter(item => !isSuggestionHidden(cat.id, item))
        .map(item => ({ categoryId: cat.id, name: item }))
    ),
    // Custom items
    ...preferences
      .filter(p => !p.is_hidden && !CATEGORIES.some(c => c.id === p.category_id && c.suggestedItems.includes(p.item_name)))
      .map(p => ({ categoryId: p.category_id, name: p.item_name }))
  ]

  const totalItems = allItems.length
  const checkedItems = allItems.filter(i => isSuggestionChecked(i.categoryId, i.name)).length

  // Mom's Metric: Weighted towards "Essential" items
  const essentialItems = allItems.filter(i => getPriority(i.categoryId, i.name) === 'essential')
  const checkedEssential = essentialItems.filter(i => isSuggestionChecked(i.categoryId, i.name)).length
  const nestingScore = essentialItems.length > 0 ? Math.round((checkedEssential / essentialItems.length) * 100) : 0

  // Show loading if auth or checklist is still loading
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

  return (
    <div className="min-h-screen bg-[#fffbff] font-sans text-[#1d192b]" dir="rtl">
      {/* Add Item Modal */}
      {registry && (
        <AddItemModal
          isOpen={showAddItemModal}
          onClose={handleCloseModal}
          registryId={registry.id}
          onSave={handleCloseModal}
          prefilledData={prefilledCategory ? { category: prefilledCategory } : undefined}
        />
      )}

      {/* Mobile Info/Tip Popover Modal */}
      {activePopover && ITEMS_DATA[activePopover.item] && (
        <div
          className="md:hidden fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setActivePopover(null)}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative w-full max-w-lg bg-white rounded-t-[24px] p-5 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="w-12 h-1.5 bg-[#e7e0ec] rounded-full mx-auto mb-4" />

            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                activePopover.type === 'info' ? 'bg-[#e3f2fd] text-[#1976d2]' : 'bg-[#fff8e1] text-[#f9a825]'
              }`}>
                {activePopover.type === 'info' ? <Info className="w-5 h-5" /> : <Lightbulb className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold mb-1 ${
                  activePopover.type === 'info' ? 'text-[#1976d2]' : 'text-[#f9a825]'
                }`}>
                  {activePopover.type === 'info' ? 'מה זה?' : 'הטיפ שלנו'}
                </p>
                <p className="text-sm font-medium text-[#1d192b] mb-2">{activePopover.item}</p>
                <p className="text-sm text-[#49454f] leading-relaxed">
                  {activePopover.type === 'info'
                    ? ITEMS_DATA[activePopover.item].description
                    : ITEMS_DATA[activePopover.item].tip
                  }
                </p>
              </div>
            </div>

            <button
              onClick={() => setActivePopover(null)}
              className="mt-5 w-full py-3 bg-[#f3edff] hover:bg-[#eaddff] text-[#6750a4] rounded-xl font-medium transition-colors"
            >
              סגור
            </button>
          </div>
        </div>
      )}

      {/* Unsaved Changes Banner */}
      {hasUnsavedNotes && (
        <div className="sticky top-0 z-40 bg-[#fff3cd] border-b border-[#ffc107] px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <p className="text-[#856404] font-medium text-sm">
              יש לך הערות שלא נשמרו
            </p>
            <button
              onClick={saveAllNotes}
              disabled={isSaving}
              className="flex items-center gap-2 bg-[#6750a4] hover:bg-[#503e85] text-white px-4 py-2 rounded-full font-medium text-sm transition-all shadow-md disabled:opacity-50"
            >
              {isSaving ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              שמור הערות
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">

          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-[28px] bg-[#eaddff] flex items-center justify-center text-[#21005d] shadow-inner rotate-3 hover:rotate-6 transition-transform duration-500">
              <ClipboardList className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-medium text-[#1d192b] tracking-tight leading-tight">
                מה <span className="text-[#6750a4]">באמת</span> צריך?
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <p className="text-[#49454f] text-lg font-medium">
                  התחילי כאן לגלות מה לקנות לתינוק.
                </p>
                {/* Global Add Button */}
                {registry && (
                  <button
                    onClick={handleGlobalAdd}
                    className="flex items-center gap-2 bg-[#6750a4] hover:bg-[#503e85] text-white px-5 py-2 rounded-full font-medium transition-all shadow-md active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    הוסף פריט
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Nesting Score Metric */}
          <div className="bg-gradient-to-br from-[#ffd8e4] to-[#fff0f5] rounded-[24px] p-5 w-full md:w-72 border border-[#ffd8e4] shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 bg-white/40 w-24 h-24 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-white/60 p-1.5 rounded-lg text-[#b3261e]">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-xs font-bold text-[#b3261e] uppercase tracking-wide">מדד הקינון</span>
                </div>
                <span className="text-3xl font-bold text-[#1d192b]">{nestingScore}%</span>
              </div>
              <div className="w-full bg-white/50 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-[#b3261e] rounded-full transition-all duration-1000" style={{ width: `${nestingScore}%` }} />
              </div>
              <p className="text-xs text-[#1d192b]/70 mt-2 font-medium">
                {checkedItems} מתוך {totalItems} פריטים
              </p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-6">
          {CATEGORIES.filter(cat => cat.suggestedItems.length > 0).map((category) => {
            const CategoryIcon = category.icon
            const isExpanded = expandedCategory === category.id
            const progress = getCategoryProgress(category.id)
            const progressPercent = progress.total > 0 ? (progress.checked / progress.total) * 100 : 0
            // Get suggested items that aren't hidden
            const visibleSuggestedItems = category.suggestedItems.filter(item => !isSuggestionHidden(category.id, item))
            // Get custom items for this category (not in suggested items and not hidden)
            const customItems = preferences
              .filter(p => p.category_id === category.id && !p.is_hidden && !category.suggestedItems.includes(p.item_name))
              .map(p => p.item_name)
            // Combine both
            const visibleItems = [...visibleSuggestedItems, ...customItems]

            return (
              <div
                key={category.id}
                data-tutorial={category.id === 'strollers' ? 'checklist-category' : undefined}
                className={`bg-white rounded-[24px] border border-[#e7e0ec] overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-[#eaddff]' : 'hover:shadow-md'}`}
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-[#f3edff]/30 transition-colors group"
                >
                  <div className={`w-12 h-12 rounded-[16px] flex-shrink-0 flex items-center justify-center relative transition-transform group-hover:scale-105 ${isExpanded ? 'bg-[#eaddff] text-[#21005d]' : 'bg-[#f5f5f5] text-gray-500'}`}>
                    <CategoryIcon className="w-6 h-6" />
                    {progress.checked === progress.total && progress.total > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#00c875] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-bold text-lg text-right ${isExpanded ? 'text-[#1d192b]' : 'text-[#49454f]'}`}>
                        {category.name}
                      </p>
                      <span className="text-xs text-[#49454f] font-medium whitespace-nowrap mr-2">
                        {progress.checked}/{progress.total}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-[#f3edff] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progressPercent === 100 ? 'bg-[#00c875]' : 'bg-[#6750a4]'}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-[#f3edff] rotate-180 text-[#6750a4]' : 'bg-transparent text-[#49454f]'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {/* Content Area */}
                {isExpanded && visibleItems.length > 0 && (
                  <div className="border-t border-[#e7e0ec]">
                    {/* Desktop Table - Enhanced with Priority & Notes */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-[#fffbff] border-b border-[#e7e0ec]">
                          <tr>
                            <th className="px-6 py-4 text-right text-xs font-bold text-[#6750a4] uppercase tracking-wider w-16">סטטוס</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-[#49454f] uppercase tracking-wider w-32">עדיפות</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-[#49454f] uppercase tracking-wider">פריט</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-[#49454f] uppercase tracking-wider w-64">הערות</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-[#49454f] uppercase tracking-wider w-32">כמות</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-[#49454f] uppercase tracking-wider w-24">פעולות</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e7e0ec]">
                          {visibleItems.map((item, index) => {
                            const isChecked = isSuggestionChecked(category.id, item)
                            const quantity = getQuantity(category.id, item)
                            const priority = getPriority(category.id, item)
                            const notes = getLocalNotes(category.id, item)
                            const dbNotes = getPreference(category.id, item)?.notes ?? ''
                            const hasUnsavedNote = notes !== dbNotes

                            return (
                              <tr
                                key={index}
                                className={`transition-colors group/row ${isChecked ? 'bg-[#f3edff]/30' : 'hover:bg-[#f3edff]/20'}`}
                              >
                                {/* Status Checkbox */}
                                <td className="px-6 py-4 align-middle">
                                  <button
                                    onClick={() => toggleSuggestionCheck(category.id, item)}
                                    className={`w-8 h-8 rounded-[8px] border-2 flex items-center justify-center transition-all duration-200 shadow-sm ${
                                      isChecked
                                        ? 'border-[#6750a4] bg-[#6750a4] text-white scale-105'
                                        : 'border-[#e7e0ec] bg-white text-transparent hover:border-[#6750a4]'
                                    }`}
                                  >
                                    <Check className="w-5 h-5" strokeWidth={3} />
                                  </button>
                                </td>

                                {/* Priority Badge */}
                                <td className="px-6 py-4 align-middle">
                                  <button
                                    onClick={() => togglePriority(category.id, item)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 w-fit ${
                                      priority === 'essential'
                                        ? 'bg-[#1d192b] text-white border-[#1d192b] shadow-sm hover:bg-[#49454f]'
                                        : 'bg-white text-[#49454f] border-[#e7e0ec] hover:border-[#6750a4] hover:text-[#6750a4]'
                                    }`}
                                  >
                                    {priority === 'essential' ? (
                                      <>
                                        <AlertCircle className="w-3 h-3" />
                                        <span>חובה</span>
                                      </>
                                    ) : (
                                      <>
                                        <Feather className="w-3 h-3" />
                                        <span>פינוק</span>
                                      </>
                                    )}
                                  </button>
                                </td>

                                {/* Item Name with Info & Tip */}
                                <td className="px-6 py-4 align-middle">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-base font-medium transition-all ${isChecked ? 'text-[#49454f]/60 line-through decoration-[#6750a4]/30' : 'text-[#1d192b]'}`}>
                                      {item}
                                    </span>
                                    {/* Info & Tip Icons */}
                                    {ITEMS_DATA[item] && (
                                      <div className="flex items-center gap-1">
                                        {/* Info Icon with Tooltip */}
                                        <div className="relative group/info">
                                          <button className="p-1 rounded-full hover:bg-[#e3f2fd] text-[#1976d2] transition-colors">
                                            <Info className="w-4 h-4" />
                                          </button>
                                          <div className="absolute z-[100] top-full right-0 mt-2 w-64 p-3 bg-white rounded-xl shadow-xl border border-[#e7e0ec] opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200">
                                            <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white border-r border-t border-[#e7e0ec] transform rotate-[-45deg]"></div>
                                            <div className="flex items-start gap-2">
                                              <Info className="w-4 h-4 text-[#1976d2] flex-shrink-0 mt-0.5" />
                                              <div>
                                                <p className="text-xs font-bold text-[#1976d2] mb-1">מה זה?</p>
                                                <p className="text-xs text-[#49454f] leading-relaxed">{ITEMS_DATA[item].description}</p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        {/* Tip Icon with Tooltip */}
                                        <div className="relative group/tip">
                                          <button className="p-1 rounded-full hover:bg-[#fff8e1] text-[#f9a825] transition-colors">
                                            <Lightbulb className="w-4 h-4" />
                                          </button>
                                          <div className="absolute z-[100] top-full right-0 mt-2 w-72 p-3 bg-white rounded-xl shadow-xl border border-[#e7e0ec] opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200">
                                            <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white border-r border-t border-[#e7e0ec] transform rotate-[-45deg]"></div>
                                            <div className="flex items-start gap-2">
                                              <Lightbulb className="w-4 h-4 text-[#f9a825] flex-shrink-0 mt-0.5" />
                                              <div>
                                                <p className="text-xs font-bold text-[#f9a825] mb-1">הטיפ שלנו</p>
                                                <p className="text-xs text-[#49454f] leading-relaxed">{ITEMS_DATA[item].tip}</p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* Notes Input */}
                                <td className="px-6 py-4 align-middle">
                                  <div className="relative">
                                    <input
                                      type="text"
                                      placeholder="הוסף הערה..."
                                      value={notes}
                                      onChange={(e) => updateLocalNotes(category.id, item, e.target.value)}
                                      className={`w-full bg-transparent border-b ${hasUnsavedNote ? 'border-[#ffc107]' : 'border-transparent hover:border-[#e7e0ec]'} focus:border-[#6750a4] focus:outline-none text-sm text-[#1d192b] py-1 transition-colors placeholder:text-[#49454f]/30`}
                                    />
                                    {hasUnsavedNote && (
                                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#ffc107]" title="לא נשמר"></span>
                                    )}
                                  </div>
                                </td>

                                {/* Quantity Control */}
                                <td className="px-6 py-4 align-middle">
                                  <div className="flex items-center justify-center gap-2 bg-[#f5f5f5] rounded-full p-1 w-fit mx-auto border border-[#e7e0ec]">
                                    <button
                                      onClick={() => setQuantity(category.id, item, quantity - 1)}
                                      className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-[#49454f] hover:text-[#6750a4] disabled:opacity-50"
                                      disabled={quantity <= 1}
                                    >
                                      -
                                    </button>
                                    <span className="w-6 text-center text-sm font-bold text-[#1d192b]">{quantity}</span>
                                    <button
                                      onClick={() => setQuantity(category.id, item, quantity + 1)}
                                      className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-[#49454f] hover:text-[#6750a4]"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 align-middle">
                                  <div className="flex items-center justify-center gap-2">
                                    {registry && (
                                      <button
                                        onClick={() => handleAddFromSuggestion(category.id)}
                                        className="p-2 rounded-xl bg-[#6750a4] text-white hover:bg-[#503e85] shadow-sm transition-all hover:scale-105"
                                        title="הוסף לרשימה שלי"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => hideSuggestion(category.id, item)}
                                      className="p-2 rounded-xl text-[#49454f] hover:bg-[#ffebee] hover:text-[#b3261e] transition-colors"
                                      title="הסר מהרשימה"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards (Stack Layout) */}
                    <div className="md:hidden p-4 space-y-3 bg-[#fdfcff]">
                      {visibleItems.map((item, index) => {
                        const isChecked = isSuggestionChecked(category.id, item)
                        const quantity = getQuantity(category.id, item)
                        const priority = getPriority(category.id, item)
                        const notes = getLocalNotes(category.id, item)
                        const dbNotes = getPreference(category.id, item)?.notes ?? ''
                        const hasUnsavedNote = notes !== dbNotes

                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-[20px] border transition-all ${
                              isChecked
                                ? 'bg-[#f3edff] border-[#eaddff]'
                                : 'bg-white border-[#e7e0ec] shadow-sm'
                            }`}
                          >
                            <div className="flex items-start gap-4 mb-3">
                              <button
                                onClick={() => toggleSuggestionCheck(category.id, item)}
                                className={`w-8 h-8 rounded-[8px] border-2 flex-shrink-0 flex items-center justify-center transition-all mt-0.5 ${
                                  isChecked
                                    ? 'border-[#6750a4] bg-[#6750a4] text-white'
                                    : 'border-[#e7e0ec] bg-white'
                                }`}
                              >
                                {isChecked && <Check className="w-5 h-5" strokeWidth={3} />}
                              </button>

                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-base font-medium ${isChecked ? 'line-through text-[#49454f]/60' : 'text-[#1d192b]'}`}>
                                      {item}
                                    </span>
                                    {/* Info & Tip Icons for Mobile (Click-based) */}
                                    {ITEMS_DATA[item] && (
                                      <div className="flex items-center gap-0.5">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setActivePopover(activePopover?.item === item && activePopover?.type === 'info' ? null : { item, type: 'info' })
                                          }}
                                          className="p-1 rounded-full hover:bg-[#e3f2fd] text-[#1976d2] transition-colors"
                                        >
                                          <Info className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setActivePopover(activePopover?.item === item && activePopover?.type === 'tip' ? null : { item, type: 'tip' })
                                          }}
                                          className="p-1 rounded-full hover:bg-[#fff8e1] text-[#f9a825] transition-colors"
                                        >
                                          <Lightbulb className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => togglePriority(category.id, item)}
                                    className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-colors flex-shrink-0 ${
                                      priority === 'essential'
                                        ? 'bg-[#1d192b] text-white border-[#1d192b]'
                                        : 'bg-white text-[#49454f] border-[#e7e0ec]'
                                    }`}
                                  >
                                    {priority === 'essential' ? 'חובה' : 'פינוק'}
                                  </button>
                                </div>
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="הערות..."
                                    value={notes}
                                    onChange={(e) => updateLocalNotes(category.id, item, e.target.value)}
                                    className={`w-full bg-transparent border-b border-dashed ${hasUnsavedNote ? 'border-[#ffc107]' : 'border-[#e7e0ec]'} focus:border-[#6750a4] focus:outline-none text-xs text-[#1d192b] py-2 mt-1 transition-colors placeholder:text-[#49454f]/40`}
                                  />
                                  {hasUnsavedNote && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#ffc107]" title="לא נשמר"></span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#e7e0ec]/60">
                              <div className="flex items-center gap-3 bg-[#f5f5f5] rounded-full p-1 pl-3">
                                <span className="text-xs text-[#49454f]">כמות:</span>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => setQuantity(category.id, item, quantity - 1)} className="w-6 h-6 bg-white rounded-full shadow-sm text-sm" disabled={quantity <= 1}>-</button>
                                  <span className="font-bold text-sm min-w-[1rem] text-center">{quantity}</span>
                                  <button onClick={() => setQuantity(category.id, item, quantity + 1)} className="w-6 h-6 bg-white rounded-full shadow-sm text-sm">+</button>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {/* Primary CTA on Mobile */}
                                {registry && (
                                  <button onClick={() => handleAddFromSuggestion(category.id)} className="p-2 bg-[#6750a4] text-white rounded-full shadow-sm active:scale-95 transition-transform">
                                    <Plus className="w-4 h-4" />
                                  </button>
                                )}
                                <button onClick={() => hideSuggestion(category.id, item)} className="p-2 text-[#49454f] hover:text-[#b3261e] hover:bg-[#ffebee] rounded-full">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {isExpanded && visibleItems.length === 0 && (
                  <div className="border-t border-[#e7e0ec] p-8 text-center bg-[#fffbff]">
                    <div className="w-12 h-12 bg-[#f5f5f5] rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-[#49454f]">כל הפריטים בקטגוריה זו הוסרו</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Add Custom Item Section */}
        <div className="mt-8">
          {!showAddCustomItem ? (
            <button
              onClick={() => setShowAddCustomItem(true)}
              className="w-full flex items-center justify-center gap-3 p-4 bg-white rounded-[20px] border-2 border-dashed border-[#e7e0ec] hover:border-[#6750a4] hover:bg-[#f3edff]/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-[#f3edff] flex items-center justify-center text-[#6750a4] group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[#49454f] font-medium group-hover:text-[#6750a4]">הוסף פריט מותאם אישית לצ'קליסט</span>
            </button>
          ) : (
            <div className="bg-white rounded-[24px] border border-[#e7e0ec] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#1d192b]">הוסף פריט חדש</h3>
                <button
                  onClick={() => {
                    setShowAddCustomItem(false)
                    setCustomItemName('')
                    setCustomItemCategory('')
                  }}
                  className="p-2 rounded-full hover:bg-[#f5f5f5] text-[#49454f]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#49454f] mb-2">קטגוריה</label>
                  <select
                    value={customItemCategory}
                    onChange={(e) => setCustomItemCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#e7e0ec] bg-white text-[#1d192b] focus:outline-none focus:ring-2 focus:ring-[#6750a4] focus:border-transparent"
                  >
                    <option value="">בחרי קטגוריה...</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#49454f] mb-2">שם הפריט</label>
                  <input
                    type="text"
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    placeholder="לדוגמה: שמיכת תינוק מיוחדת"
                    className="w-full p-3 rounded-xl border border-[#e7e0ec] bg-white text-[#1d192b] placeholder:text-[#49454f]/40 focus:outline-none focus:ring-2 focus:ring-[#6750a4] focus:border-transparent"
                  />
                </div>

                <button
                  onClick={addCustomItem}
                  disabled={!customItemName.trim() || !customItemCategory}
                  className="w-full flex items-center justify-center gap-2 bg-[#6750a4] hover:bg-[#503e85] disabled:bg-[#e7e0ec] disabled:text-[#49454f] text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md disabled:shadow-none"
                >
                  <Plus className="w-5 h-5" />
                  הוסף לצ'קליסט
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Deleted Items Section */}
        {deletedItems.length > 0 && (
          <div className="mt-8">
            <button
              onClick={() => setShowDeletedSection(!showDeletedSection)}
              className="w-full flex items-center justify-between p-4 bg-[#fff8f8] rounded-[20px] border border-[#ffebee] hover:bg-[#ffebee]/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ffebee] flex items-center justify-center text-[#b3261e]">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1d192b]">פריטים שהוסרו</p>
                  <p className="text-sm text-[#49454f]">{deletedItems.length} פריטים • לחץ לשחזור</p>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${showDeletedSection ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5 text-[#49454f]" />
              </div>
            </button>

            {showDeletedSection && (
              <div className="mt-3 bg-white rounded-[20px] border border-[#e7e0ec] overflow-hidden">
                <div className="divide-y divide-[#e7e0ec]">
                  {deletedItems.map((item, index) => (
                    <div
                      key={`${item.categoryId}-${item.itemName}-${index}`}
                      className="flex items-center justify-between p-4 hover:bg-[#f3edff]/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] flex items-center justify-center text-[#49454f]">
                          <Trash2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-[#1d192b]">{item.itemName}</p>
                          <p className="text-xs text-[#49454f]">{item.categoryName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => restoreSuggestion(item.categoryId, item.itemName)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#f3edff] hover:bg-[#eaddff] text-[#6750a4] rounded-full font-medium text-sm transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        שחזר
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
