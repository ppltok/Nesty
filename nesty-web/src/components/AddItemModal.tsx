import { useState, useEffect, useRef } from 'react'
import { X, Plus, Link as LinkIcon, Star, Eye, EyeOff, Package, Palette, Pencil, Link2, Chrome, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { CATEGORIES } from '../data/categories'
import type { Item } from '../types'
import { extractProductFromUrl, guessCategoryFromName, type ExtractionError } from '../lib/productExtraction'
import { useAuth } from '../contexts/AuthContext'
import { useExtensionDetection } from '../hooks/useExtensionDetection'
import { trackItemAdded, trackItemEdited, trackGoogleAdsFirstProductConversion } from '../utils/tracking'

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
    imageUrl?: string
  }
  editItem?: Item
  forceManualTab?: boolean
  highlightColor?: boolean
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
  /** Original price from source page, before EUR/USD/GBP → ILS conversion. */
  sourcePrice?: string | null
  /** Original currency code from source page (e.g. 'EUR'). NULL when source was already ILS. */
  sourceCurrency?: string | null
}

export default function AddItemModal({
  isOpen,
  onClose,
  registryId,
  onSave,
  prefilledData,
  editItem,
  forceManualTab,
  highlightColor,
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
    sourcePrice: null,
    sourceCurrency: null,
  })

  // URL extraction state
  const { session } = useAuth()
  // Default to 'paste' for new items, 'manual' for editing existing items or when forceManualTab is true
  const [activeTab, setActiveTab] = useState<'manual' | 'paste'>(editItem || forceManualTab ? 'manual' : 'paste')

  // State for color field highlight animation
  const [colorHighlighted, setColorHighlighted] = useState(false)
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

  // Initialize the form only when the modal transitions closed → open.
  // Re-running on every prefilledData/editItem identity change wipes whatever
  // the user has typed mid-edit (parent re-renders recreate these props).
  const wasOpenRef = useRef(false)
  useEffect(() => {
    const justOpened = isOpen && !wasOpenRef.current
    wasOpenRef.current = isOpen
    if (justOpened) {
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
          sourcePrice: editItem.source_price != null ? editItem.source_price.toString() : null,
          sourceCurrency: editItem.source_currency || null,
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
          imageUrl: prefilledData.imageUrl || '',
        }))
      }
    }
  }, [isOpen, prefilledData, editItem])

  // Auto-set privacy to true when birth_prep category is selected (for new items only)
  useEffect(() => {
    if (!editItem && formData.category === 'birth_prep') {
      setFormData(prev => ({ ...prev, isPrivate: true }))
    }
  }, [formData.category, editItem])

  // Handle forceManualTab and highlightColor when modal opens
  useEffect(() => {
    if (isOpen && forceManualTab) {
      setActiveTab('manual')
    }
    if (isOpen && highlightColor) {
      // Trigger highlight animation after a short delay
      setTimeout(() => {
        setColorHighlighted(true)
        // Remove highlight after animation
        setTimeout(() => setColorHighlighted(false), 2000)
      }, 300)
    }
  }, [isOpen, forceManualTab, highlightColor])

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

      // Populate form with extracted data. `price` is already in ILS when
      // the source was EUR/USD/GBP (productExtraction.convertPriceToILS).
      // Hold onto sourcePrice / sourceCurrency in state so they can be
      // persisted on submit — see handleSubmit.
      setFormData({
        ...formData,
        name: productData.name,
        price: productData.price,
        // Auto-suggest a category from the product name (same keyword logic
        // as the extension); never override a category the user already chose
        category: formData.category || guessCategoryFromName(productData.name),
        originalUrl: urlInput,
        storeName: new URL(urlInput).hostname,
        notes: productData.brand ? `מותג: ${productData.brand}` : formData.notes,
        imageUrl: productData.imageUrls[0] || '',
        sourcePrice: productData.sourcePrice ?? null,
        sourceCurrency: productData.sourceCurrency ?? null,
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
      const isArticle = errorMessage.includes('כתבה')
      setExtractionStatus({
        state: 'error',
        message: isArticle
          ? errorMessage
          : 'לא הצלחנו לחלץ את פרטי המוצר, אז שמרנו את הקישור. עוד רגע נעבור למילוי ידני'
      })

      // Don't dead-end the user: carry the URL + store into the manual form
      // and switch there so only name/category are left to fill by hand
      let hostname = ''
      try { hostname = new URL(urlInput).hostname } catch { /* validated above */ }
      if (!isArticle) {
        setFormData(prev => ({
          ...prev,
          originalUrl: prev.originalUrl || urlInput,
          storeName: prev.storeName || hostname,
        }))
        setTimeout(() => {
          setActiveTab('manual')
          setExtractionStatus({ state: 'idle', message: null })
        }, 2500)
      }

      // Auto-report extraction failure for analytics, including page
      // diagnostics (title, ld+json types found) attached by productExtraction
      try {
        const diagnostics = (error as ExtractionError | null)?.diagnostics
        await supabase.from('extraction_reports').insert({
          user_id: session?.user?.id || null,
          url: urlInput,
          hostname,
          error_type: isArticle ? 'non_product_page' : 'no_product_data',
          extracted_data: { error: errorMessage, ...(diagnostics ? { diagnostics } : {}) },
        })
      } catch {
        // Non-blocking — don't show error for reporting
      }
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
      // Manual adds that include a product link should still get an image —
      // when none was provided, make a quick best-effort extraction attempt
      // for it (time-capped so saving never feels stuck).
      let imageUrl = formData.imageUrl
      if (!imageUrl && formData.originalUrl.trim() && session?.access_token) {
        try {
          new URL(formData.originalUrl)
          const extracted = await Promise.race([
            extractProductFromUrl(formData.originalUrl, session.access_token),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
          ])
          imageUrl = extracted?.imageUrls?.[0] || ''
        } catch {
          // No image found — the item is saved without one
        }
      }

      let combinedNotes = ''
      if (formData.color) {
        combinedNotes += `צבע: ${formData.color}`
      }
      if (formData.notes) {
        combinedNotes += combinedNotes ? `\n${formData.notes}` : formData.notes
      }

      // In edit mode, a manual price change invalidates the stored source
      // price/currency (they described the old price), so reset them. When
      // the price is unchanged, preserve the values loaded from editItem.
      const priceChanged = isEditMode && editItem
        ? (formData.price ? parseFloat(formData.price) : 0) !== editItem.price
        : false

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
        image_url: imageUrl || null,
        // Preserve original price/currency when extraction did EUR/USD/GBP → ILS
        // conversion. Default for source_currency in DB is 'ILS', so only set
        // these columns when the source was actually a foreign currency.
        source_price: priceChanged ? null : (formData.sourcePrice ? parseFloat(formData.sourcePrice) : null),
        source_currency: priceChanged ? 'ILS' : (formData.sourceCurrency || 'ILS'),
      }

      const addedVia: 'paste_url' | 'manual' = isExtractedData ? 'paste_url' : 'manual'

      if (isEditMode && editItem) {
        const { error: updateError } = await supabase
          .from('items')
          .update(itemData)
          .eq('id', editItem.id)

        if (updateError) throw updateError

        // Track item edit
        trackItemEdited({
          registry_id: registryId,
          item_id: editItem.id,
          item_name: formData.name.trim(),
        })
      } else {
        const { data: insertedItem, error: insertError } = await supabase
          .from('items')
          .insert({ ...itemData, registry_id: registryId, added_via: addedVia })
          .select('id')
          .single()

        if (insertError) throw insertError

        // Track item addition
        if (insertedItem) {
          // Determine source based on how item was added
          const source = prefilledData?.originalUrl ? 'chrome_extension'
            : isExtractedData ? 'paste'
            : 'manual'

          trackItemAdded({
            registry_id: registryId,
            item_id: insertedItem.id,
            item_name: formData.name.trim(),
            item_category: formData.category,
            item_price: formData.price ? parseFloat(formData.price) : undefined,
            source,
            has_extension: extensionInstalled,
          })

          // Google Ads first-product conversion (deduped per-user via localStorage)
          if (session?.user?.id) {
            trackGoogleAdsFirstProductConversion(session.user.id)
          }
        }
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" dir="rtl">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-5 border-b border-[#e7e0ec] flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Tab Navigation - hide tabs in edit mode */}
            {!isEditMode && (
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={() => setActiveTab('paste')}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                    activeTab === 'paste'
                      ? 'bg-[#6750a4] text-white'
                      : 'bg-[#f3edff] text-[#6750a4] opacity-70 hover:opacity-100'
                  }`}
                >
                  <Link2 className="w-4 h-4 hidden sm:block" />
                  <span className="whitespace-nowrap">הדבקת קישור</span>
                  <span className="bg-orange-100 text-orange-600 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">מומלץ</span>
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`px-2 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
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

            {/* Extension Status Badge - hide on mobile */}
            {extensionInstalled && !isEditMode && (
              <div className="hidden sm:flex items-center gap-1.5 bg-[#e8f5e9] text-[#1b5e20] px-3 py-1.5 rounded-full text-xs font-semibold">
                <Check className="w-3.5 h-3.5" />
                תוסף פעיל
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-[#49454f] hover:text-[#1d192b] hover:bg-[#f3edff] rounded-xl transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1">
          {error && (
            <div className="bg-[#ffebee] text-[#b3261e] px-4 py-2.5 rounded-xl text-sm mb-4 font-medium">
              {error}
            </div>
          )}

          {/* Paste Tab Content */}
          {activeTab === 'paste' && (
            <div className="py-4 sm:py-8 px-2 sm:px-4 flex flex-col items-center max-w-md mx-auto">
              <Link2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#6750a4] mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-bold text-[#1d192b] mb-1 sm:mb-2">הדבק קישור למוצר</h3>
              <p className="text-xs sm:text-sm text-[#49454f] text-center mb-4 sm:mb-6">
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

              {/* Extension Tip - hide on mobile to save space */}
              {!extensionInstalled && (
                <div className="hidden sm:block mt-6 bg-[#f3edff] rounded-2xl p-4 border border-[#d0bcff]">
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
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {/* Name - Full width */}
            <div className="col-span-2">
              <label className="block text-xs font-bold text-[#49454f] uppercase tracking-wide mb-1">
                שם המוצר *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="למשל: עגלת תינוק"
                className="w-full rounded-xl border border-[#e7e0ec] bg-white px-3 py-2 text-[#1d192b] text-sm focus:border-[#6750a4] focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 transition-all placeholder:text-[#49454f]/40"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-[#49454f] uppercase tracking-wide mb-1">
                קטגוריה *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-[#e7e0ec] bg-white px-3 py-2 text-[#1d192b] text-sm focus:border-[#6750a4] focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">בחרו קטגוריה</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-[#49454f] uppercase tracking-wide mb-1">
                מחיר (₪)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full rounded-xl border border-[#e7e0ec] bg-white px-3 py-2 text-[#1d192b] text-sm focus:border-[#6750a4] focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 transition-all placeholder:text-[#49454f]/40"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-[#49454f] uppercase tracking-wide mb-1">
                כמות
              </label>
              <div className="flex items-center rounded-xl border border-[#e7e0ec] bg-white">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, quantity: Math.max(getMinQuantity(editItem), formData.quantity - 1) })}
                  className="px-3 py-2 text-[#49454f] hover:text-[#6750a4] transition-colors text-lg font-medium"
                >
                  −
                </button>
                <span className="flex-1 text-center font-bold text-[#1d192b]">{formData.quantity}</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, quantity: formData.quantity + 1 })}
                  className="px-3 py-2 text-[#49454f] hover:text-[#6750a4] transition-colors text-lg font-medium"
                >
                  +
                </button>
              </div>
            </div>

            {/* Color */}
            <div className={`transition-all duration-500 ${colorHighlighted ? 'scale-105' : ''}`}>
              <label className={`block text-xs font-bold uppercase tracking-wide mb-1 transition-colors duration-500 ${colorHighlighted ? 'text-[#6750a4]' : 'text-[#49454f]'}`}>
                <Palette className="w-3 h-3 inline ml-1" />
                צבע מועדף
                {colorHighlighted && <span className="text-[10px] mr-2 animate-pulse">בחרי צבע!</span>}
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="אפור, ורוד..."
                className={`w-full rounded-xl border bg-white px-3 py-2 text-[#1d192b] text-sm focus:border-[#6750a4] focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 transition-all placeholder:text-[#49454f]/40 ${colorHighlighted ? 'border-[#6750a4] ring-2 ring-[#6750a4]/30 bg-[#f3edff]' : 'border-[#e7e0ec]'}`}
              />
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-xs font-bold text-[#49454f] uppercase tracking-wide mb-1">
                <Package className="w-3 h-3 inline ml-1" />
                חנות
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="בייבי סטאר..."
                className="w-full rounded-xl border border-[#e7e0ec] bg-white px-3 py-2 text-[#1d192b] text-sm focus:border-[#6750a4] focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 transition-all placeholder:text-[#49454f]/40"
              />
            </div>

            {/* Product URL - Full width */}
            <div className="col-span-2">
              <label className="block text-xs font-bold text-[#49454f] uppercase tracking-wide mb-1">
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
                className="w-full rounded-xl border border-[#e7e0ec] bg-white px-3 py-2 text-[#1d192b] text-sm focus:border-[#6750a4] focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 transition-all placeholder:text-[#49454f]/40"
              />
            </div>

            {/* Notes - Full width */}
            <div className="col-span-2">
              <label className="block text-xs font-bold text-[#49454f] uppercase tracking-wide mb-1">
                הערות
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="מידה, פרטים נוספים..."
                className="w-full rounded-xl border border-[#e7e0ec] bg-white px-3 py-2 text-[#1d192b] text-sm focus:border-[#6750a4] focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 transition-all placeholder:text-[#49454f]/40"
              />
              <p className="text-[10px] text-[#49454f] mt-1 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                האורחים יראו הערה זו
              </p>
            </div>

            {/* Toggle buttons - side by side */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isMostWanted: !formData.isMostWanted })}
              className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${
                formData.isMostWanted
                  ? 'border-[#b3261e] bg-[#ffebee]'
                  : 'border-[#e7e0ec] hover:border-[#d0bcff]'
              }`}
            >
              <Star className={`w-4 h-4 ${formData.isMostWanted ? 'text-[#b3261e] fill-[#b3261e]' : 'text-[#49454f]'}`} />
              <div className="text-right flex-1">
                <p className={`text-sm font-bold ${formData.isMostWanted ? 'text-[#b3261e]' : 'text-[#1d192b]'}`}>
                  הכי רוצה!
                </p>
              </div>
              <div className={`w-9 h-5 rounded-full transition-colors relative ${formData.isMostWanted ? 'bg-[#b3261e]' : 'bg-[#e7e0ec]'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${formData.isMostWanted ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
              className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${
                formData.isPrivate
                  ? 'border-[#6750a4] bg-[#f3edff]'
                  : 'border-[#e7e0ec] hover:border-[#d0bcff]'
              }`}
            >
              {formData.isPrivate ? (
                <EyeOff className="w-4 h-4 text-[#6750a4]" />
              ) : (
                <Eye className="w-4 h-4 text-[#49454f]" />
              )}
              <div className="text-right flex-1">
                <p className={`text-sm font-bold ${formData.isPrivate ? 'text-[#6750a4]' : 'text-[#1d192b]'}`}>
                  פריט פרטי
                </p>
              </div>
              <div className={`w-9 h-5 rounded-full transition-colors relative ${formData.isPrivate ? 'bg-[#6750a4]' : 'bg-[#e7e0ec]'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${formData.isPrivate ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </button>
          </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-t border-[#e7e0ec] bg-[#fdfcff] rounded-b-[28px] flex-shrink-0">
          <button
            onClick={handleClose}
            className="flex-1 px-4 sm:px-6 py-2.5 rounded-full border border-[#e7e0ec] text-[#49454f] font-bold text-sm hover:bg-[#f3edff] hover:text-[#6750a4] hover:border-[#d0bcff] transition-all"
          >
            ביטול
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || (activeTab === 'paste' && !urlInput.trim())}
            className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-full bg-[#6750a4] text-white font-bold text-sm hover:bg-[#503e85] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
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
