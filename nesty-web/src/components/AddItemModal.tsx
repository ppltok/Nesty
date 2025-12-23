import { useState, useEffect } from 'react'
import { X, Plus, Link as LinkIcon, Star, Eye, EyeOff, Package, Palette, Pencil, Link2, Chrome, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { CATEGORIES } from '../data/categories'
import type { Item } from '../types'
import { extractProductFromUrl } from '../lib/productExtraction'
import { useAuth } from '../contexts/AuthContext'
import { useExtensionDetection } from '../hooks/useExtensionDetection'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  registryId: string
  onSave: () => void
  prefilledData?: {
    name?: string
    category?: string
    price?: string
    brand?: string
    storeName?: string
    originalUrl?: string
  }
  editItem?: Item
}

const getMinQuantity = (editItem?: Item): number => {
  if (!editItem) return 1
  return Math.max(1, editItem.quantity_received)
}

interface ItemFormData {
  name: string
  price: string
  category: string
  quantity: number
  color: string
  originalUrl: string
  storeName: string
  notes: string
  isMostWanted: boolean
  isPrivate: boolean
  imageUrl: string
}

export default function AddItemModal({
  isOpen,
  onClose,
  registryId,
  onSave,
  prefilledData,
  editItem,
}: AddItemModalProps) {
  const { isInstalled: extensionInstalled } = useExtensionDetection()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    price: '',
    category: '',
    quantity: 1,
    color: '',
    originalUrl: '',
    storeName: '',
    notes: '',
    isMostWanted: false,
    isPrivate: false,
    imageUrl: '',
  })

  // URL extraction state
  const { session } = useAuth()
  // Default to 'paste' for new items, 'manual' for editing existing items
  const [activeTab, setActiveTab] = useState<'manual' | 'paste'>(editItem ? 'manual' : 'paste')
  const [extractionStatus, setExtractionStatus] = useState<{
    state: 'idle' | 'loading' | 'success' | 'error'
    message: string | null
  }>({ state: 'idle', message: null })
  const [urlInput, setUrlInput] = useState('')
  const [isExtractedData, setIsExtractedData] = useState(false)

  const isEditMode = !!editItem

  const extractColorFromNotes = (notes: string | null): { color: string; cleanNotes: string } => {
    if (!notes) return { color: '', cleanNotes: '' }
    const colorMatch = notes.match(/^צבע: (.+?)(?:\n|$)/)
    if (colorMatch) {
      const color = colorMatch[1]
      const cleanNotes = notes.replace(/^צבע: .+?\n?/, '').trim()
      return { color, cleanNotes }
    }
    return { color: '', cleanNotes: notes }
  }

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        // When editing, always show manual tab with existing data
        setActiveTab('manual')
        const { color, cleanNotes } = extractColorFromNotes(editItem.notes)
        setFormData({
          name: editItem.name,
          price: editItem.price > 0 ? editItem.price.toString() : '',
          category: editItem.category,
          quantity: editItem.quantity,
          color: color,
          originalUrl: editItem.original_url || '',
          storeName: editItem.store_name === 'ידני' ? '' : (editItem.store_name || ''),
          notes: cleanNotes,
          isMostWanted: editItem.is_most_wanted,
          isPrivate: editItem.is_private,
          imageUrl: editItem.image_url || '',
        })
      } else if (prefilledData) {
        setFormData((prev) => ({
          ...prev,
          name: prefilledData.name || '',
          category: prefilledData.category || '',
          price: prefilledData.price || '',
          storeName: prefilledData.storeName || '',
          originalUrl: prefilledData.originalUrl || '',
          notes: prefilledData.brand ? `מותג: ${prefilledData.brand}` : '',
        }))
      }
    }
  }, [isOpen, prefilledData, editItem])

  const handleExtractUrl = async () => {
    // Validate URL format
    try {
      new URL(urlInput)
    } catch {
      setExtractionStatus({
        state: 'error',
        message: 'כתובת URL לא תקינה. ודא שהכתובת מתחילה ב-https://'
      })
      return
    }

    // Check authentication
    if (!session?.access_token) {
      setExtractionStatus({
        state: 'error',
        message: 'נדרשת התחברות לשימוש בתכונה זו'
      })
      return
    }

    setExtractionStatus({ state: 'loading', message: null })

    try {
      const productData = await extractProductFromUrl(urlInput, session.access_token)

      // Populate form with extracted data
      setFormData({
        ...formData,
        name: productData.name,
        price: productData.price,
        originalUrl: urlInput,
        storeName: new URL(urlInput).hostname,
        notes: productData.brand ? `מותג: ${productData.brand}` : formData.notes,
        imageUrl: productData.imageUrls[0] || ''
      })

      setIsExtractedData(true)
      setExtractionStatus({
        state: 'success',
        message: '✓ המוצר חולץ בהצלחה'
      })

      // Auto-switch to manual tab after 1 second
      setTimeout(() => {
        setActiveTab('manual')
        setExtractionStatus({ state: 'idle', message: null })
      }, 1000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'שגיאה בחילוץ המוצר'
      setExtractionStatus({
        state: 'error',
        message: errorMessage.includes('לא נמצא מידע')
          ? errorMessage
          : 'שגיאה בחילוץ המוצר. נסה שוב או מלא ידנית'
      })
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('יש להזין שם מוצר')
      return
    }
    if (!formData.category) {
      setError('יש לבחור קטגוריה')
      return
    }
    if (isEditMode && editItem && formData.quantity < editItem.quantity_received) {
      setError(`לא ניתן להפחית כמות מתחת ל-${editItem.quantity_received} (כבר נרכשו)`)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let combinedNotes = ''
      if (formData.color) {
        combinedNotes += `צבע: ${formData.color}`
      }
      if (formData.notes) {
        combinedNotes += combinedNotes ? `\n${formData.notes}` : formData.notes
      }

      const itemData = {
        name: formData.name.trim(),
        price: formData.price ? parseFloat(formData.price) : 0,
        category: formData.category,
        quantity: formData.quantity,
        original_url: formData.originalUrl || null,
        store_name: formData.storeName || 'ידני',
        notes: combinedNotes || null,
        is_most_wanted: formData.isMostWanted,
        is_private: formData.isPrivate,
        image_url: formData.imageUrl || null,
      }

      if (isEditMode && editItem) {
        const { error: updateError } = await supabase
          .from('items')
          .update(itemData)
          .eq('id', editItem.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('items')
          .insert({ ...itemData, registry_id: registryId })

        if (insertError) throw insertError
      }

      onSave()
      handleClose()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה לא ידועה'
      setError(`שגיאה ב${isEditMode ? 'עדכון' : 'הוספת'} הפריט: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      price: '',
      category: '',
      quantity: 1,
      color: '',
      originalUrl: '',
      storeName: '',
      notes: '',
      isMostWanted: false,
      isPrivate: false,
      imageUrl: '',
    })
    setError(null)
    setActiveTab('paste')
    setExtractionStatus({ state: 'idle', message: null })
    setUrlInput('')
    setIsExtractedData(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e7e0ec]">
          <div className="flex items-center gap-3">
            {/* Tab Navigation - hide tabs in edit mode */}
            {!isEditMode && (
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('paste')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === 'paste'
                      ? 'bg-[#6750a4] text-white'
                      : 'bg-[#f3edff] text-[#6750a4] opacity-70 hover:opacity-100'
                  }`}
                >
                  <Link2 className="w-4 h-4" />
                  הדבקת קישור
                  <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">מומלץ</span>
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === 'manual'
                      ? 'bg-[#6750a4] text-white'
                      : 'bg-[#f3edff] text-[#6750a4] opacity-70 hover:opacity-100'
                  }`}
                >
                  מילוי ידני
                </button>
              </div>
            )}
            {isEditMode && (
              <h2 className="text-lg font-bold text-[#1d192b]">עריכת פריט</h2>
            )}

            {/* Extension Status Badge */}
            {extensionInstalled && !isEditMode && (
              <div className="flex items-center gap-1.5 bg-[#e8f5e9] text-[#1b5e20] px-3 py-1.5 rounded-full text-xs font-semibold">
                <Check className="w-3.5 h-3.5" />
                תוסף פעיל
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-[#49454f] hover:text-[#1d192b] hover:bg-[#f3edff] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {error && (
            <div className="bg-[#ffebee] text-[#b3261e] px-4 py-2.5 rounded-xl text-sm mb-4 font-medium">
              {error}
            </div>
          )}

          {/* Paste Tab Content */}
          {activeTab === 'paste' && (
            <div className="py-8 px-4 flex flex-col items-center max-w-md mx-auto">
              <Link2 className="w-12 h-12 text-[#6750a4] mb-4" />
              <h3 className="text-lg font-bold text-[#1d192b] mb-2">הדבק קישור למוצר</h3>
              <p className="text-sm text-[#49454f] text-center mb-6">
                הדבק כתובת URL של מוצר מכל אתר מסחר אלקטרוני
              </p>

              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/product"
                dir="ltr"
                className="w-full rounded-xl border border-[#e7e0ec] bg-white px-4 py-2.5 text-[#1d192b] text-sm focus:border-[#6750a4] focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 transition-all mb-4"
              />

              <button
                onClick={handleExtractUrl}
                disabled={!urlInput.trim() || extractionStatus.state === 'loading'}
                className="w-full px-6 py-3 rounded-full bg-[#6750a4] text-white font-bold text-sm hover:bg-[#503e85] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {extractionStatus.state === 'loading' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    מחלץ...
                  </>
                ) : (
                  'הוספה מהירה מלינק'
                )}
              </button>

              {extractionStatus.message && (
                <div className={`mt-4 text-center text-sm font-medium ${
                  extractionStatus.state === 'error' ? 'text-[#b3261e]' : 'text-green-600'
                }`}>
                  {extractionStatus.message}
                </div>
              )}

              {/* Extension Tip */}
              {!extensionInstalled && (
                <div className="mt-6 bg-[#f3edff] rounded-2xl p-4 border border-[#d0bcff]">
                  <div className="flex items-start gap-3">
                    <Chrome className="w-5 h-5 text-[#6750a4] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-[#381e72] mb-1">טיפ: התקן את התוסף לכרום</p>
                      <p className="text-xs text-[#49454f] leading-relaxed">
                        עם התוסף תוכל להוסיף מוצרים ישירות מכל אתר קניות בלחיצה אחת, בלי להעתיק קישורים
                      </p>
                      <a
                        href="https://chromewebstore.google.com/detail/add-to-nesty-button/mkkadfpabelceniomobeaejhlfcihkll"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-[#6750a4] hover:text-[#503e85] transition-colors"
                      >
                        להתקנת התוסף
                        <Link2 className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manual Tab Content */}
          {activeTab === 'manual' && (
          <div className="grid grid-cols-2 gap-4">
            {/* Name - Full width */}
            <div className="col-span-2">
              <label className="block text-xs font-bold text-[#49454f] uppercase tracking-wide mb-1.5">
                שם המוצר *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="למשל: עגלת תינוק"
                className="w-full rounded-xl border border-[#e7e0ec] bg-white px-4 py-2.5 text-[#1d192b] text-sm focus:border-[#6750a4] focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 transition-all placeholder:text-[#49454f]/40"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-[#49454f] uppercase tracking-wide mb-1.5">
                קטגוריה *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-[#e7e0ec] bg-white px-4 py-2.5 text-[#1d192b] text-sm focus:border-[#6750a4] focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">בחרו קטגוריה</option>
                <option value="general">כללי</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-[#49454f] uppercase tracking-wide mb-1.5">
                מחיר (₪)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full rounded-xl border border-[#e7e0ec] bg-white px-4 py-2.5 text-[#1d192b] text-sm focus:border-[#6750a4] focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 transition-all placeholder:text-[#49454f]/40"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-[#49454f] uppercase tracking-wide mb-1.5">
                כמות
              </label>
              <div className="flex items-center rounded-xl border border-[#e7e0ec] bg-white">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, quantity: Math.max(getMinQuantity(editItem), formData.quantity - 1) })}
                  className="px-3 py-2.5 text-[#49454f] hover:text-[#6750a4] transition-colors text-lg font-medium"
                >
                  −
                </button>
                <span className="flex-1 text-center font-bold text-[#1d192b]">{formData.quantity}</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, quantity: formData.quantity + 1 })}
                  className="px-3 py-2.5 text-[#49454f] hover:text-[#6750a4] transition-colors text-lg font-medium"
                >
                  +
                </button>
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-bold text-[#49454f] uppercase tracking-wide mb-1.5">
                <Palette className="w-3 h-3 inline ml-1" />
                צבע מועדף
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="אפור, ורוד..."
                className="w-full rounded-xl border border-[#e7e0ec] bg-white px-4 py-2.5 text-[#1d192b] text-sm focus:border-[#6750a4] focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 transition-all placeholder:text-[#49454f]/40"
              />
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-xs font-bold text-[#49454f] uppercase tracking-wide mb-1.5">
                <Package className="w-3 h-3 inline ml-1" />
                חנות
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="בייבי סטאר..."
                className="w-full rounded-xl border border-[#e7e0ec] bg-white px-4 py-2.5 text-[#1d192b] text-sm focus:border-[#6750a4] focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 transition-all placeholder:text-[#49454f]/40"
              />
            </div>

            {/* Product URL - Full width */}
            <div className="col-span-2">
              <label className="block text-xs font-bold text-[#49454f] uppercase tracking-wide mb-1.5">
                <LinkIcon className="w-3 h-3 inline ml-1" />
                קישור למוצר
                {isExtractedData && (
                  <span className="text-xs text-[#6750a4] mr-2 font-normal">
                    (חולץ אוטומטית)
                  </span>
                )}
              </label>
              <input
                type="text"
                value={formData.originalUrl}
                onChange={(e) => {
                  setFormData({ ...formData, originalUrl: e.target.value })
                  setIsExtractedData(false) // Clear indicator on manual edit
                }}
                placeholder="https://..."
                className="w-full rounded-xl border border-[#e7e0ec] bg-white px-4 py-2.5 text-[#1d192b] text-sm focus:border-[#6750a4] focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 transition-all placeholder:text-[#49454f]/40"
              />
            </div>

            {/* Notes - Full width */}
            <div className="col-span-2">
              <label className="block text-xs font-bold text-[#49454f] uppercase tracking-wide mb-1.5">
                הערות
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="מידה, פרטים נוספים..."
                className="w-full rounded-xl border border-[#e7e0ec] bg-white px-4 py-2.5 text-[#1d192b] text-sm focus:border-[#6750a4] focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 transition-all placeholder:text-[#49454f]/40"
              />
            </div>

            {/* Toggle buttons - side by side */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isMostWanted: !formData.isMostWanted })}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                formData.isMostWanted
                  ? 'border-[#b3261e] bg-[#ffebee]'
                  : 'border-[#e7e0ec] hover:border-[#d0bcff]'
              }`}
            >
              <Star className={`w-5 h-5 ${formData.isMostWanted ? 'text-[#b3261e] fill-[#b3261e]' : 'text-[#49454f]'}`} />
              <div className="text-right flex-1">
                <p className={`text-sm font-bold ${formData.isMostWanted ? 'text-[#b3261e]' : 'text-[#1d192b]'}`}>
                  הכי רוצה!
                </p>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors relative ${formData.isMostWanted ? 'bg-[#b3261e]' : 'bg-[#e7e0ec]'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${formData.isMostWanted ? 'right-1' : 'left-1'}`} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                formData.isPrivate
                  ? 'border-[#6750a4] bg-[#f3edff]'
                  : 'border-[#e7e0ec] hover:border-[#d0bcff]'
              }`}
            >
              {formData.isPrivate ? (
                <EyeOff className="w-5 h-5 text-[#6750a4]" />
              ) : (
                <Eye className="w-5 h-5 text-[#49454f]" />
              )}
              <div className="text-right flex-1">
                <p className={`text-sm font-bold ${formData.isPrivate ? 'text-[#6750a4]' : 'text-[#1d192b]'}`}>
                  פריט פרטי
                </p>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors relative ${formData.isPrivate ? 'bg-[#6750a4]' : 'bg-[#e7e0ec]'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${formData.isPrivate ? 'right-1' : 'left-1'}`} />
              </div>
            </button>
          </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-5 border-t border-[#e7e0ec] bg-[#fdfcff] rounded-b-[28px]">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-3 rounded-full border border-[#e7e0ec] text-[#49454f] font-bold text-sm hover:bg-[#f3edff] hover:text-[#6750a4] hover:border-[#d0bcff] transition-all"
          >
            ביטול
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || (activeTab === 'paste' && !urlInput.trim())}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#6750a4] text-white font-bold text-sm hover:bg-[#503e85] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isEditMode ? (
              <>
                <Pencil className="w-4 h-4" />
                שמור שינויים
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                הוסף לרשימה
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
