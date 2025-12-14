import React, { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronUp, Check, Plus, Trash2, ClipboardList, Sparkles, Filter, ArrowLeft, Baby, Car, Shirt, Bath, Bed, Utensils, Heart, AlertCircle, Feather } from 'lucide-react'

// --- Types ---
type PriorityLevel = 'essential' | 'nice_to_have'

interface ChecklistPreference {
  id: string
  user_id: string
  category_id: string
  item_name: string
  quantity: number
  is_checked: boolean
  is_hidden: boolean
  notes: string
  priority: PriorityLevel
}

// --- Mock Data ---
const CATEGORIES = [
  {
    id: 'nursery',
    name: 'חדר תינוק ושינה',
    icon: Bed,
    color: 'from-blue-400 to-blue-600',
    suggestedItems: ['עריסה מתחברת', 'שידת החתלה', 'מזרון עריסה', 'מצעים (3 סטים)', 'מנורת לילה', 'מוניטור לתינוק', 'שמיכה קלה']
  },
  {
    id: 'travel',
    name: 'טיולים ונסיעות',
    icon: Car,
    color: 'from-green-400 to-green-600',
    suggestedItems: ['עגלה משולבת', 'סלקל לרכב', 'תיק עגלה', 'מראה לרכב', 'צלון לרכב']
  },
  {
    id: 'clothing',
    name: 'ביגוד ראשוני',
    icon: Shirt,
    color: 'from-purple-400 to-purple-600',
    suggestedItems: ['בגדי גוף מעטפת (6)', 'רגליות (6)', 'כובע (2)', 'גרביים', 'כפפות', 'חליפה ליציאה מבית חולים']
  },
  {
    id: 'bath',
    name: 'אמבטיה והיגיינה',
    icon: Bath,
    color: 'from-cyan-400 to-cyan-600',
    suggestedItems: ['אמבטיה + מעמד', 'מד חום למים', 'שמפו לתינוק', 'סבון לתינוק', 'מגבת רחצה עם כובע', 'מספריים לציפורניים', 'אלכוהול 70%']
  },
  {
    id: 'feeding',
    name: 'הנקה והאכלה',
    icon: Utensils,
    color: 'from-orange-400 to-orange-600',
    suggestedItems: ['בקבוקים (2 קטנים)', 'מוצצים (2)', 'מברשת לבקבוקים', 'מתקן ייבוש בקבוקים', 'סינר הנקה', 'רפידות הנקה']
  }
]

// --- Mock Components ---
const AddItemModal = ({ isOpen, onClose, onSave, prefilledData }: any) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl m-4">
        <h3 className="text-xl font-bold mb-4 text-[#1d192b]">הוספת פריט חדש</h3>
        <p className="text-gray-600 mb-6">
          {prefilledData?.category 
            ? `הוספה לקטגוריה: ${CATEGORIES.find(c => c.id === prefilledData?.category)?.name}`
            : 'הוספת פריט כללי'
          }
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">ביטול</button>
          <button onClick={onSave} className="px-4 py-2 bg-[#6750a4] text-white rounded-lg hover:bg-[#523e85]">שמור</button>
        </div>
      </div>
    </div>
  )
}

// --- Main Component ---
export default function Checklist() {
  // Mock State
  const [user] = useState({ id: 'user_123' })
  const [registry] = useState({ id: 'reg_123' })
  
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [prefilledCategory, setPrefilledCategory] = useState<string | undefined>()
  const [expandedCategory, setExpandedCategory] = useState<string | null>('nursery')
  const [isLoading, setIsLoading] = useState(true)

  // Checklist preferences (Simulating DB)
  const [preferences, setPreferences] = useState<ChecklistPreference[]>([
    { id: '1', user_id: 'user_123', category_id: 'nursery', item_name: 'עריסה מתחברת', quantity: 1, is_checked: true, is_hidden: false, notes: 'להזמין מאמאזון', priority: 'essential' },
    { id: '2', user_id: 'user_123', category_id: 'nursery', item_name: 'שידת החתלה', quantity: 1, is_checked: false, is_hidden: false, notes: '', priority: 'essential' },
    { id: '3', user_id: 'user_123', category_id: 'clothing', item_name: 'בגדי גוף מעטפת (6)', quantity: 2, is_checked: true, is_hidden: false, notes: '', priority: 'nice_to_have' },
    { id: '4', user_id: 'user_123', category_id: 'nursery', item_name: 'מנורת לילה', quantity: 1, is_checked: false, is_hidden: false, notes: 'שיהיה אור צהוב', priority: 'nice_to_have' },
  ])

  // Simulate Fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  const getPreference = (categoryId: string, itemName: string): ChecklistPreference | undefined => {
    return preferences.find(p => p.category_id === categoryId && p.item_name === itemName)
  }

  // Mock Upsert
  const upsertPreference = async (
    categoryId: string,
    itemName: string,
    updates: Partial<Pick<ChecklistPreference, 'quantity' | 'is_checked' | 'is_hidden' | 'notes' | 'priority'>>
  ) => {
    const existing = getPreference(categoryId, itemName)
    
    if (existing) {
      setPreferences(prev => prev.map(p => p.id === existing.id ? { ...p, ...updates } : p))
    } else {
      const newPref: ChecklistPreference = {
        id: Math.random().toString(),
        user_id: user.id,
        category_id: categoryId,
        item_name: itemName,
        quantity: updates.quantity ?? 1,
        is_checked: updates.is_checked ?? false,
        is_hidden: updates.is_hidden ?? false,
        notes: updates.notes ?? '',
        priority: updates.priority ?? 'essential',
      }
      setPreferences(prev => [...prev, newPref])
    }
  }

  const hideSuggestion = async (categoryId: string, itemName: string) => {
    if (!window.confirm(`בטוח שאתם לא צריכים "${itemName}"?`)) return
    await upsertPreference(categoryId, itemName, { is_hidden: true })
  }

  const toggleSuggestionCheck = async (categoryId: string, itemName: string) => {
    const pref = getPreference(categoryId, itemName)
    const newChecked = !(pref?.is_checked ?? false)
    await upsertPreference(categoryId, itemName, { is_checked: newChecked })
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

  // New helpers for Priority and Notes
  const getPriority = (categoryId: string, itemName: string): PriorityLevel => {
    return getPreference(categoryId, itemName)?.priority ?? 'essential'
  }

  const togglePriority = async (categoryId: string, itemName: string) => {
    const current = getPriority(categoryId, itemName)
    const newPriority = current === 'essential' ? 'nice_to_have' : 'essential'
    await upsertPreference(categoryId, itemName, { priority: newPriority })
  }

  const getNotes = (categoryId: string, itemName: string): string => {
    return getPreference(categoryId, itemName)?.notes ?? ''
  }

  const updateNotes = async (categoryId: string, itemName: string, notes: string) => {
    await upsertPreference(categoryId, itemName, { notes })
  }

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

  const getCategoryProgress = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId)
    if (!category) return { checked: 0, total: 0 }
    const visibleSuggestions = category.suggestedItems.filter(item => !isSuggestionHidden(categoryId, item))
    const checkedCount = visibleSuggestions.filter(itemName => isSuggestionChecked(categoryId, itemName)).length
    return { checked: checkedCount, total: visibleSuggestions.length }
  }

  // Calculate Metrics
  const allItems = CATEGORIES.flatMap(cat => 
    cat.suggestedItems
      .filter(item => !isSuggestionHidden(cat.id, item))
      .map(item => ({ categoryId: cat.id, name: item }))
  )

  const totalItems = allItems.length
  const checkedItems = allItems.filter(i => isSuggestionChecked(i.categoryId, i.name)).length
  const completionPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0

  // Mom's Metric: Weighted towards "Essential" items
  const essentialItems = allItems.filter(i => getPriority(i.categoryId, i.name) === 'essential')
  const checkedEssential = essentialItems.filter(i => isSuggestionChecked(i.categoryId, i.name)).length
  const nestingScore = essentialItems.length > 0 ? Math.round((checkedEssential / essentialItems.length) * 100) : 0

  if (isLoading) {
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
      {registry && (
        <AddItemModal
          isOpen={showAddItemModal}
          onClose={handleCloseModal}
          onSave={handleCloseModal}
          prefilledData={prefilledCategory ? { category: prefilledCategory } : undefined}
        />
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
                 צ'ק ליסט <span className="text-[#6750a4]">חכם</span>
               </h1>
               <div className="flex flex-wrap items-center gap-4 mt-2">
                 <p className="text-[#49454f] text-lg font-medium">
                   הדרך הרגועה להכין את הקן.
                 </p>
                 {/* Global Add Button */}
                 <button 
                   onClick={handleGlobalAdd}
                   className="flex items-center gap-2 bg-[#6750a4] hover:bg-[#503e85] text-white px-5 py-2 rounded-full font-medium transition-all shadow-md active:scale-95"
                 >
                   <Plus className="w-4 h-4" />
                   הוסף פריט
                 </button>
               </div>
             </div>
          </div>
          
          {/* Metrics Container */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            
            {/* Mom's Metric (Nesting Score) */}
            <div className="bg-gradient-to-br from-[#ffd8e4] to-[#fff0f5] rounded-[24px] p-5 flex-1 md:w-64 border border-[#ffd8e4] shadow-sm relative overflow-hidden group">
               <div className="absolute -right-6 -top-6 bg-white/40 w-24 h-24 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
               <div className="relative z-10">
                 <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                     <div className="bg-white/60 p-1.5 rounded-lg text-[#b3261e]">
                        <Heart className="w-4 h-4 fill-current" />
                     </div>
                     <span className="text-xs font-bold text-[#b3261e] uppercase tracking-wide">מדד הקינון</span>
                   </div>
                   <span className="text-3xl font-bold text-[#1d192b] font-numeric">{nestingScore}%</span>
                 </div>
                 <div className="w-full bg-white/50 h-2 rounded-full overflow-hidden">
                   <div className="h-full bg-[#b3261e] rounded-full transition-all duration-1000" style={{ width: `${nestingScore}%` }} />
                 </div>
                 <p className="text-xs text-[#1d192b]/70 mt-2 font-medium">
                   {nestingScore > 80 ? "את מוכנה לגמרי! 🐣" : nestingScore > 40 ? "אנחנו בכיוון הנכון 🌱" : "בואי נתחיל להתארגן ✨"}
                 </p>
               </div>
            </div>

            {/* General Progress */}
            <div className="bg-[#f3edff] rounded-[24px] p-5 flex-1 md:w-64 border border-[#eaddff] shadow-sm relative overflow-hidden">
               <div className="flex justify-between items-start mb-2">
                 <div className="flex items-center gap-2">
                   <div className="bg-white/60 p-1.5 rounded-lg text-[#6750a4]">
                      <Check className="w-4 h-4" strokeWidth={3} />
                   </div>
                   <span className="text-xs font-bold text-[#6750a4] uppercase tracking-wide">הושלם</span>
                 </div>
                 <span className="text-3xl font-bold text-[#1d192b] font-numeric">{completionPercent}%</span>
               </div>
               <div className="w-full bg-white/50 h-2 rounded-full overflow-hidden">
                 <div className="h-full bg-[#6750a4] rounded-full transition-all duration-1000" style={{ width: `${completionPercent}%` }} />
               </div>
               <p className="text-xs text-[#1d192b]/70 mt-2 font-medium">
                 {checkedItems} מתוך {totalItems} פריטים
               </p>
            </div>

          </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-6">
          {CATEGORIES.map((category) => {
            const CategoryIcon = category.icon
            const isExpanded = expandedCategory === category.id
            const progress = getCategoryProgress(category.id)
            const progressPercent = progress.total > 0 ? (progress.checked / progress.total) * 100 : 0
            const visibleItems = category.suggestedItems.filter(item => !isSuggestionHidden(category.id, item))

            return (
              <div
                key={category.id}
                className={`bg-white rounded-[24px] border border-[#e7e0ec] overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-[#eaddff]' : 'hover:shadow-md'}`}
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-[#f3edff]/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center relative transition-transform group-hover:scale-105 ${isExpanded ? 'bg-[#eaddff] text-[#21005d]' : 'bg-[#f5f5f5] text-gray-500'}`}>
                      <CategoryIcon className="w-6 h-6" />
                      {progress.checked === progress.total && progress.total > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#00c875] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-bold text-lg ${isExpanded ? 'text-[#1d192b]' : 'text-[#49454f]'}`}>
                        {category.name}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-1">
                        <div className="w-24 h-1.5 bg-[#f3edff] rounded-full overflow-hidden">
                           <div
                             className={`h-full rounded-full transition-all duration-500 ${progressPercent === 100 ? 'bg-[#00c875]' : 'bg-[#6750a4]'}`}
                             style={{ width: `${progressPercent}%` }}
                           />
                        </div>
                        <span className="text-xs text-[#49454f] font-medium">
                          {progress.checked}/{progress.total}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-[#f3edff] rotate-180 text-[#6750a4]' : 'bg-transparent text-[#49454f]'}`}>
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
                            const notes = getNotes(category.id, item)

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

                                {/* Item Name */}
                                <td className="px-6 py-4 align-middle">
                                  <span className={`text-base font-medium transition-all ${isChecked ? 'text-[#49454f]/60 line-through decoration-[#6750a4]/30' : 'text-[#1d192b]'}`}>
                                    {item}
                                  </span>
                                </td>

                                {/* Notes Input */}
                                <td className="px-6 py-4 align-middle">
                                   <input 
                                     type="text" 
                                     placeholder="הוסף הערה..."
                                     value={notes}
                                     onChange={(e) => updateNotes(category.id, item, e.target.value)}
                                     className="w-full bg-transparent border-b border-transparent hover:border-[#e7e0ec] focus:border-[#6750a4] focus:outline-none text-sm text-[#1d192b] py-1 transition-colors placeholder:text-[#49454f]/30"
                                   />
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

                                {/* Actions - Primary CTA Update */}
                                <td className="px-6 py-4 align-middle">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleAddFromSuggestion(category.id)}
                                      className="p-2 rounded-xl bg-[#6750a4] text-white hover:bg-[#503e85] shadow-sm transition-all hover:scale-105"
                                      title="הוסף לרשימה שלי"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
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
                        const notes = getNotes(category.id, item)

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
                                  <span className={`text-base font-medium block ${isChecked ? 'line-through text-[#49454f]/60' : 'text-[#1d192b]'}`}>
                                    {item}
                                  </span>
                                  <button 
                                     onClick={() => togglePriority(category.id, item)}
                                     className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                                       priority === 'essential' 
                                         ? 'bg-[#1d192b] text-white border-[#1d192b]' 
                                         : 'bg-white text-[#49454f] border-[#e7e0ec]'
                                     }`}
                                   >
                                      {priority === 'essential' ? 'חובה' : 'פינוק'}
                                   </button>
                                </div>
                                <input 
                                     type="text" 
                                     placeholder="הערות..."
                                     value={notes}
                                     onChange={(e) => updateNotes(category.id, item, e.target.value)}
                                     className="w-full bg-transparent border-b border-dashed border-[#e7e0ec] focus:border-[#6750a4] focus:outline-none text-xs text-[#1d192b] py-2 mt-1 transition-colors placeholder:text-[#49454f]/40"
                                   />
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#e7e0ec]/60">
                              <div className="flex items-center gap-3 bg-[#f5f5f5] rounded-full p-1 pl-3">
                                <span className="text-xs text-[#49454f]">כמות:</span>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => setQuantity(category.id, item, quantity - 1)} className="w-6 h-6 bg-white rounded-full shadow-sm text-sm">-</button>
                                  <span className="font-bold text-sm min-w-[1rem] text-center">{quantity}</span>
                                  <button onClick={() => setQuantity(category.id, item, quantity + 1)} className="w-6 h-6 bg-white rounded-full shadow-sm text-sm">+</button>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {/* Primary CTA on Mobile */}
                                <button onClick={() => handleAddFromSuggestion(category.id)} className="p-2 bg-[#6750a4] text-white rounded-full shadow-sm active:scale-95 transition-transform">
                                  <Plus className="w-4 h-4" />
                                </button>
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
      </div>
    </div>
  )
}