import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Gift, Check, Heart, CheckCircle, MessageCircle, Sparkles, PackageOpen, Eye, LayoutGrid, List, Filter, X, AlertTriangle, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { safeGetItem, safeSetItem } from '../lib/storage-version'
import { useDashboardLayout } from '../components/layout/DashboardLayout'
import { CATEGORIES } from '../data/categories'
import type { Purchase } from '../types'

type ViewMode = 'grid' | 'list'

// Format date to Hebrew format
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export default function Gifts() {
  const { registry } = useAuth()
  const { refreshGiftsCount } = useDashboardLayout()
  const [purchases, setPurchases] = useState<(Purchase & { item_name?: string; item_category?: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [revealedSurprises, setRevealedSurprises] = useState<string[]>(() =>
    safeGetItem('nesty-revealed-surprises', [])
  )
  const hasMarkedSeen = useRef(false)

  // View mode and filters
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showSurpriseWarning, setShowSurpriseWarning] = useState<string | null>(null)
  const [selectedGift, setSelectedGift] = useState<(Purchase & { item_name?: string; item_category?: string }) | null>(null)

  // Reveal a surprise gift with warning
  const handleRevealClick = (purchaseId: string) => {
    setShowSurpriseWarning(purchaseId)
  }

  const confirmReveal = () => {
    if (showSurpriseWarning) {
      const newRevealed = [...revealedSurprises, showSurpriseWarning]
      setRevealedSurprises(newRevealed)
      safeSetItem('nesty-revealed-surprises', newRevealed)
      setShowSurpriseWarning(null)
    }
  }

  const cancelReveal = () => {
    setShowSurpriseWarning(null)
  }

  const isSurpriseRevealed = (purchaseId: string): boolean => {
    return revealedSurprises.includes(purchaseId)
  }

  // Mark all unseen purchases as seen
  const markPurchasesAsSeen = useCallback(async (purchaseIds: string[]) => {
    if (purchaseIds.length === 0) return
    try {
      const { error } = await supabase
        .from('purchases')
        .update({ is_seen: true })
        .in('id', purchaseIds)

      if (error) {
        console.error('Error marking purchases as seen:', error)
        return
      }

      refreshGiftsCount()
    } catch (err) {
      console.error('Error marking purchases as seen:', err)
    }
  }, [refreshGiftsCount])

  // Mark a gift as received
  const handleMarkReceived = async (purchaseId: string) => {
    try {
      const purchase = purchases.find(p => p.id === purchaseId)
      const newValue = !purchase?.is_received

      const { error } = await supabase
        .from('purchases')
        .update({ is_received: newValue })
        .eq('id', purchaseId)

      if (error) {
        console.error('Error marking purchase as received:', error)
        return
      }

      setPurchases(prev =>
        prev.map(p => p.id === purchaseId ? { ...p, is_received: newValue } : p)
      )
    } catch (err) {
      console.error('Error marking purchase as received:', err)
    }
  }

  // Send WhatsApp thank you message
  const handleSendThankYou = async (purchase: Purchase & { item_name?: string }) => {
    if (!purchase.buyer_phone) return

    let phone = purchase.buyer_phone.replace(/[-\s()]/g, '')
    if (phone.startsWith('0')) {
      phone = '972' + phone.substring(1)
    }

    const message = encodeURIComponent(
      `היי ${purchase.buyer_name}! 💝\n\nתודה רבה על המתנה המהממת - ${purchase.item_name}!\nאנחנו מאוד מעריכים את המחשבה והנדיבות שלך.\n\nבאהבה ❤️`
    )

    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')

    try {
      const { error } = await supabase
        .from('purchases')
        .update({ thanked_at: new Date().toISOString() })
        .eq('id', purchase.id)

      if (error) {
        console.error('Error marking purchase as thanked:', error)
        return
      }

      setPurchases(prev =>
        prev.map(p => p.id === purchase.id ? { ...p, thanked_at: new Date().toISOString() } : p)
      )
    } catch (err) {
      console.error('Error marking purchase as thanked:', err)
    }
  }

  const fetchPurchases = useCallback(async () => {
    if (!registry) return
    setIsLoading(true)
    try {
      const { data: items } = await supabase
        .from('items')
        .select('id, name, category')
        .eq('registry_id', registry.id)

      if (!items || items.length === 0) {
        setPurchases([])
        setIsLoading(false)
        return
      }

      const { data: purchasesData, error } = await supabase
        .from('purchases')
        .select('*')
        .in('item_id', items.map(i => i.id))
        .order('created_at', { ascending: false })

      if (error) throw error

      const purchasesWithNames = (purchasesData || []).map(p => {
        const item = items.find(i => i.id === p.item_id)
        return {
          ...p,
          item_name: item?.name || 'פריט',
          item_category: item?.category || ''
        }
      })

      setPurchases(purchasesWithNames)

      if (!hasMarkedSeen.current) {
        const unseenIds = purchasesWithNames
          .filter(p => !p.is_seen)
          .map(p => p.id)
        if (unseenIds.length > 0) {
          markPurchasesAsSeen(unseenIds)
          hasMarkedSeen.current = true
        }
      }
    } catch (err) {
      console.error('Error fetching purchases:', err)
    } finally {
      setIsLoading(false)
    }
  }, [registry, markPurchasesAsSeen])

  useEffect(() => {
    if (registry) {
      fetchPurchases()
    }
  }, [registry, fetchPurchases])

  // Get unique categories from purchases
  const purchaseCategories = [...new Set(purchases.map(p => p.item_category).filter(Boolean))]

  // Filter purchases by category
  const filteredPurchases = categoryFilter === 'all'
    ? purchases
    : purchases.filter(p => p.item_category === categoryFilter)

  // Stats calculations
  const totalGifts = purchases.filter(p => p.status === 'confirmed').length
  const surprisesHidden = purchases.filter(p => p.is_surprise && !revealedSurprises.includes(p.id)).length
  const thankYousNeeded = purchases.filter(p => !p.thanked_at && p.buyer_phone && p.status === 'confirmed').length
  const receivedCount = purchases.filter(p => p.is_received).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fffbff] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-[#6750a4] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[#49454f]">פותח מתנות...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fffbff] font-sans text-[#1d192b]" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Header Title */}
        <div className="mb-10 text-center sm:text-right">
          <h1 className="text-4xl md:text-5xl font-medium text-[#1d192b] tracking-tight leading-tight mb-2">
            חגיגת <span className="text-[#6750a4] relative">
              מתנות
              <Sparkles className="w-6 h-6 text-[#ffd8e4] absolute -top-4 -left-6 fill-current animate-pulse" />
            </span>
          </h1>
          <p className="text-[#49454f] text-lg font-medium">
            כל האהבה שקיבלתם במקום אחד.
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={Gift}
            value={totalGifts}
            label="מתנות התקבלו"
            subLabel={`מתוכן ${receivedCount} אצלכם`}
            bgClass="bg-[#f3edff] border-[#eaddff]"
            colorClass="bg-white text-[#6750a4]"
          />
          <StatCard
            icon={PackageOpen}
            value={surprisesHidden}
            label="הפתעות סגורות"
            subLabel="מחכות שתרשו להציץ"
            bgClass="bg-[#fff0f5] border-[#ffd8e4]"
            colorClass="bg-white text-[#b3261e]"
          />
          <StatCard
            icon={MessageCircle}
            value={thankYousNeeded}
            label="תודות לשלוח"
            subLabel="בוואטסאפ בקליק"
            bgClass="bg-[#f1f8e9] border-[#dcedc8]"
            colorClass="bg-white text-[#33691e]"
          />
        </div>

        {/* Filters and View Toggle */}
        {purchases.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#49454f]" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-[#e7e0ec] rounded-xl px-4 py-2 text-sm font-medium text-[#1d192b] focus:border-[#6750a4] focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20"
              >
                <option value="all">כל הקטגוריות</option>
                {purchaseCategories.map(cat => {
                  const category = CATEGORIES.find(c => c.id === cat)
                  return (
                    <option key={cat} value={cat}>
                      {category?.name || cat}
                    </option>
                  )
                })}
              </select>
              {categoryFilter !== 'all' && (
                <button
                  onClick={() => setCategoryFilter('all')}
                  className="p-1.5 text-[#49454f] hover:text-[#b3261e] hover:bg-[#ffebee] rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#f3edff] rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#6750a4] shadow-sm'
                    : 'text-[#49454f] hover:text-[#6750a4]'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">תצוגת כרטיסים</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-[#6750a4] shadow-sm'
                    : 'text-[#49454f] hover:text-[#6750a4]'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">תצוגת רשימה</span>
              </button>
            </div>
          </div>
        )}

        {/* Gifts Display */}
        {purchases.length === 0 ? (
          <div className="bg-white rounded-[40px] rounded-tr-[12px] rounded-bl-[12px] border border-[#e7e0ec] p-16 text-center shadow-sm">
            <div className="w-24 h-24 bg-[#f5f5f5] rounded-full flex items-center justify-center mx-auto mb-6 text-[#49454f]">
              <Gift className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-[#1d192b] mb-3">
              תיבת המתנות ריקה
            </h2>
            <p className="text-[#49454f] mb-8 max-w-md mx-auto text-lg">
              עדיין לא התקבלו מתנות. אל דאגה, ברגע שמישהו יקנה משהו מהרשימה הוא יופיע כאן!
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-[#6750a4] text-white px-8 py-3 rounded-full font-bold hover:bg-[#503e85] transition-all shadow-md"
            >
              חזרה לרשימה
            </Link>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="bg-white rounded-[28px] border border-[#e7e0ec] p-12 text-center">
            <p className="text-[#49454f]">אין מתנות בקטגוריה זו</p>
            <button
              onClick={() => setCategoryFilter('all')}
              className="mt-4 text-[#6750a4] font-bold hover:underline"
            >
              הצג את כל המתנות
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPurchases.map((purchase) => (
              <PurchaseCard
                key={purchase.id}
                purchase={purchase}
                isRevealed={isSurpriseRevealed(purchase.id)}
                onReveal={() => handleRevealClick(purchase.id)}
                onMarkReceived={handleMarkReceived}
                onSendThankYou={handleSendThankYou}
                onViewDetails={() => setSelectedGift(purchase)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPurchases.map((purchase) => (
              <PurchaseListItem
                key={purchase.id}
                purchase={purchase}
                isRevealed={isSurpriseRevealed(purchase.id)}
                onReveal={() => handleRevealClick(purchase.id)}
                onMarkReceived={handleMarkReceived}
                onSendThankYou={handleSendThankYou}
                onViewDetails={() => setSelectedGift(purchase)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Surprise Warning Modal */}
      {showSurpriseWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={cancelReveal} />
          <div className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-md p-6 text-center">
            <div className="w-16 h-16 bg-[#fff0f5] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-[#b3261e]" />
            </div>
            <h3 className="text-xl font-bold text-[#1d192b] mb-2">
              התראת ספוילר!
            </h3>
            <p className="text-[#49454f] mb-6">
              מי שקנה את המתנה ביקש לשמור אותה כהפתעה עד התאריך המיועד.
              <br />
              <span className="font-bold">בטוחים שאתם רוצים לראות עכשיו?</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelReveal}
                className="flex-1 px-6 py-3 rounded-full border-2 border-[#e7e0ec] text-[#49454f] font-bold hover:bg-[#f3edff] transition-all"
              >
                לא, אשמור להפתעה
              </button>
              <button
                onClick={confirmReveal}
                className="flex-1 px-6 py-3 rounded-full bg-[#6750a4] text-white font-bold hover:bg-[#503e85] transition-all shadow-md"
              >
                כן, הראה לי!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gift Detail Modal */}
      {selectedGift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedGift(null)} />
          <div className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white rounded-t-[28px] border-b border-[#e7e0ec] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f3edff] rounded-xl flex items-center justify-center">
                  <Gift className="w-5 h-5 text-[#6750a4]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1d192b]">פרטי המתנה</h3>
                  <p className="text-xs text-[#49454f]">מאת {selectedGift.buyer_name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGift(null)}
                className="p-2 text-[#49454f] hover:text-[#1d192b] hover:bg-[#f3edff] rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Item Name */}
              <div className="mb-6">
                <p className="text-xs text-[#49454f] mb-1">שם המתנה</p>
                <h2 className="text-xl font-bold text-[#1d192b]">{selectedGift.item_name}</h2>
                {selectedGift.quantity_purchased > 1 && (
                  <p className="text-sm text-[#6750a4] mt-1">כמות: {selectedGift.quantity_purchased}</p>
                )}
              </div>

              {/* Greeting Message */}
              {selectedGift.gift_message && (
                <div className="mb-6">
                  <p className="text-xs text-[#49454f] mb-2">ברכה מ{selectedGift.buyer_name}</p>
                  <div className="bg-[#f3edff] rounded-2xl p-5 border border-[#eaddff]">
                    <Heart className="w-5 h-5 text-[#b3261e] fill-current mb-3" />
                    <p className="text-[#1d192b] leading-relaxed whitespace-pre-wrap text-base">
                      "{selectedGift.gift_message}"
                    </p>
                  </div>
                </div>
              )}

              {/* Purchase Info */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-[#e7e0ec]">
                  <span className="text-[#49454f]">התקבל ב:</span>
                  <span className="font-medium text-[#1d192b]">{formatDate(selectedGift.created_at)}</span>
                </div>
                {selectedGift.buyer_email && (
                  <div className="flex justify-between items-center py-2 border-b border-[#e7e0ec]">
                    <span className="text-[#49454f]">אימייל:</span>
                    <span className="font-medium text-[#1d192b]">{selectedGift.buyer_email}</span>
                  </div>
                )}
                {selectedGift.buyer_phone && (
                  <div className="flex justify-between items-center py-2 border-b border-[#e7e0ec]">
                    <span className="text-[#49454f]">טלפון:</span>
                    <span className="font-medium text-[#1d192b]">{selectedGift.buyer_phone}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#49454f]">סטטוס:</span>
                  <span className={`font-medium ${selectedGift.is_received ? 'text-green-600' : 'text-[#6750a4]'}`}>
                    {selectedGift.is_received ? '✓ התקבל' : 'ממתין לקבלה'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white rounded-b-[28px] border-t border-[#e7e0ec] p-4 flex gap-3">
              <button
                onClick={() => {
                  handleMarkReceived(selectedGift.id)
                  setSelectedGift(prev => prev ? { ...prev, is_received: !prev.is_received } : null)
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                  selectedGift.is_received
                    ? 'bg-[#f1f8e9] text-[#33691e] border border-[#dcedc8]'
                    : 'bg-[#6750a4] text-white'
                }`}
              >
                {selectedGift.is_received ? '✓ התקבל' : 'קיבלתי!'}
              </button>
              {selectedGift.buyer_phone && !selectedGift.thanked_at && (
                <button
                  onClick={() => {
                    handleSendThankYou(selectedGift)
                    setSelectedGift(null)
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#128C7E] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  שלח תודה
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Stat Card Component
function StatCard({ icon: Icon, value, label, subLabel, colorClass, bgClass }: {
  icon: React.ComponentType<{ className?: string }>
  value: number
  label: string
  subLabel?: string
  colorClass: string
  bgClass: string
}) {
  return (
    <div className={`rounded-[24px] rounded-tr-[8px] p-6 flex items-center gap-4 border ${bgClass} transition-all hover:scale-[1.02] hover:shadow-sm`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${colorClass}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <div className="text-3xl font-bold text-[#1d192b] leading-none mb-1">
          {value}
        </div>
        <div className="font-bold text-sm text-[#1d192b]/80">{label}</div>
        {subLabel && <div className="text-xs text-[#1d192b]/50 mt-0.5">{subLabel}</div>}
      </div>
    </div>
  )
}

// Purchase Card Component (Grid View)
function PurchaseCard({
  purchase,
  isRevealed,
  onReveal,
  onMarkReceived,
  onSendThankYou,
  onViewDetails,
}: {
  purchase: Purchase & { item_name?: string; item_category?: string }
  isRevealed: boolean
  onReveal: () => void
  onMarkReceived: (purchaseId: string) => void
  onSendThankYou: (purchase: Purchase & { item_name?: string }) => void
  onViewDetails: () => void
}) {
  const isSurprise = purchase.is_surprise
  const isHidden = isSurprise && !isRevealed
  const isReceived = purchase.is_received
  const hasThanked = !!purchase.thanked_at
  const isPending = purchase.status === 'pending'

  // --- WRAPPED GIFT VIEW ---
  if (isHidden) {
    return (
      <div
        className="relative h-[340px] rounded-[40px] rounded-tr-[12px] rounded-bl-[12px] overflow-hidden cursor-pointer group transition-transform hover:-translate-y-1 duration-300 shadow-xl shadow-[#6750a4]/10"
        onClick={onReveal}
      >
        {/* Wrapping Paper Pattern */}
        <div className="absolute inset-0 bg-[#6750a4] z-0">
          <div className="absolute inset-0 opacity-10"
               style={{
                 backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)',
                 backgroundSize: '20px 20px'
               }}
          />
        </div>

        {/* Content Centered */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/20">
            <Gift className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>

          <h3 className="text-3xl font-bold text-white mb-2">הפתעה!</h3>
          <p className="text-[#eaddff] font-medium text-lg mb-8 max-w-[200px] leading-relaxed">
            <span className="font-bold text-white">{purchase.buyer_name}</span> שלח/ה מתנה סודית
          </p>

          <button className="bg-white text-[#6750a4] px-8 py-3 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
            <Eye className="w-4 h-4" />
            הצץ למתנה
          </button>
        </div>
      </div>
    )
  }

  // --- REVEALED / NORMAL VIEW ---
  return (
    <div
      onClick={onViewDetails}
      className={`h-[340px] flex flex-col rounded-[40px] rounded-tr-[12px] rounded-bl-[12px] border-2 transition-all duration-300 relative overflow-hidden bg-white cursor-pointer ${
        isReceived
          ? 'border-[#dcedc8] shadow-none hover:shadow-sm'
          : isPending
          ? 'border-orange-200 shadow-sm hover:shadow-md'
          : 'border-[#e7e0ec] shadow-sm hover:shadow-md hover:border-[#d0bcff]'
      }`}
    >
      {/* Top Banner Status */}
      {isSurprise && (
        <div className="bg-[#fff0f5] text-[#b3261e] text-xs font-bold px-4 py-2 text-center border-b border-[#ffd8e4]">
          🎁 הייתה הפתעה!
        </div>
      )}
      {isPending && !isSurprise && (
        <div className="bg-orange-50 text-orange-700 text-xs font-bold px-4 py-2 text-center border-b border-orange-200">
          ⏳ ממתין לאישור
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${isReceived ? 'bg-[#dcedc8] text-[#33691e]' : 'bg-[#f3edff] text-[#6750a4]'}`}>
            {isReceived ? <CheckCircle className="w-7 h-7" /> : <Gift className="w-7 h-7" />}
          </div>
        </div>

        {/* Item Info */}
        <div className="mb-auto">
          <h3 className="text-xl font-bold text-[#1d192b] leading-tight mb-2 line-clamp-2">
            {purchase.item_name}
          </h3>
          <p className="text-[#49454f] text-sm">
            מאת: <span className="font-bold text-[#6750a4] text-base">{purchase.buyer_name}</span>
          </p>
          {purchase.quantity_purchased > 1 && (
            <p className="text-xs text-[#49454f] mt-1">כמות: {purchase.quantity_purchased}</p>
          )}
        </div>

        {/* Message Bubble (if exists) */}
        {purchase.gift_message && (
          <div className="bg-[#f9f9f9] p-3 rounded-xl rounded-tr-sm mb-4 relative mt-2 border border-[#f0f0f0] w-full text-right">
            <Heart className="w-3 h-3 text-[#b3261e] absolute -top-1.5 -right-1.5 fill-current bg-white rounded-full" />
            <p className="text-sm text-[#49454f] italic line-clamp-2">"{purchase.gift_message}"</p>
          </div>
        )}

        {/* Action Buttons */}
        {purchase.status === 'confirmed' && (
          <div className="mt-4 pt-4 border-t border-[#e7e0ec]/60 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-2">
              <button
                onClick={() => onMarkReceived(purchase.id)}
                className={`flex-1 text-xs h-9 flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 ${
                  isReceived
                    ? 'bg-white border-2 border-[#dcedc8] text-[#33691e] hover:bg-[#f1f8e9]'
                    : 'bg-[#6750a4] text-white hover:bg-[#503e85] shadow-md shadow-[#6750a4]/20'
                }`}
              >
                {isReceived ? 'בטל קבלה' : 'קיבלתי! 🙌'}
              </button>

              {/* See Item Button */}
              <Link
                to={`/dashboard?highlight=${purchase.item_id}`}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#f3edff] text-[#6750a4] hover:bg-[#eaddff] transition-colors"
                title="צפה בפריט"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>

              {purchase.buyer_phone && !hasThanked && (
                <button
                  onClick={() => onSendThankYou(purchase)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#25D366] text-white hover:bg-[#128C7E] transition-colors shadow-sm"
                  title="שלח תודה בוואטסאפ"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              )}
            </div>

            {hasThanked && (
              <div className="flex items-center justify-center gap-2 bg-[#f1f8e9] text-[#33691e] py-2 px-3 rounded-xl border border-[#dcedc8] mt-1 shadow-sm">
                <div className="bg-[#33691e] text-white rounded-full p-0.5">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </div>
                <span className="text-xs font-bold">הודעת תודה נשלחה</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Purchase List Item Component (List View)
function PurchaseListItem({
  purchase,
  isRevealed,
  onReveal,
  onMarkReceived,
  onSendThankYou,
  onViewDetails,
}: {
  purchase: Purchase & { item_name?: string; item_category?: string }
  isRevealed: boolean
  onReveal: () => void
  onMarkReceived: (purchaseId: string) => void
  onSendThankYou: (purchase: Purchase & { item_name?: string }) => void
  onViewDetails: () => void
}) {
  const isSurprise = purchase.is_surprise
  const isHidden = isSurprise && !isRevealed
  const isReceived = purchase.is_received
  const hasThanked = !!purchase.thanked_at
  const isPending = purchase.status === 'pending'
  const category = CATEGORIES.find(c => c.id === purchase.item_category)

  // --- WRAPPED GIFT VIEW (LIST) ---
  if (isHidden) {
    return (
      <div
        className="bg-[#6750a4] rounded-2xl p-4 cursor-pointer hover:bg-[#503e85] transition-all"
        onClick={onReveal}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-white">הפתעה מ{purchase.buyer_name}!</p>
            <p className="text-[#eaddff] text-sm">לחץ לחשיפה</p>
          </div>
          <button className="bg-white text-[#6750a4] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            הצץ
          </button>
        </div>
      </div>
    )
  }

  // --- REVEALED / NORMAL VIEW (LIST) ---
  return (
    <div
      onClick={onViewDetails}
      className={`bg-white rounded-2xl border-2 p-4 transition-all cursor-pointer ${
        isReceived
          ? 'border-[#dcedc8] hover:shadow-sm'
          : isPending
          ? 'border-orange-200 hover:shadow-sm'
          : 'border-[#e7e0ec] hover:border-[#d0bcff] hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isReceived ? 'bg-[#dcedc8] text-[#33691e]' : 'bg-[#f3edff] text-[#6750a4]'
        }`}>
          {isReceived ? <CheckCircle className="w-6 h-6" /> : <Gift className="w-6 h-6" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-[#1d192b] truncate">{purchase.item_name}</h3>
            {isSurprise && (
              <span className="text-xs bg-[#fff0f5] text-[#b3261e] px-2 py-0.5 rounded-full font-bold">
                הייתה הפתעה
              </span>
            )}
            {isPending && (
              <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                ממתין
              </span>
            )}
          </div>
          <p className="text-sm text-[#49454f]">
            מאת: <span className="font-bold text-[#6750a4]">{purchase.buyer_name}</span>
            {category && <span className="text-[#49454f]/60"> • {category.name}</span>}
          </p>
          {purchase.gift_message && (
            <p className="text-xs text-[#49454f] mt-1 italic line-clamp-2 sm:line-clamp-3">
              "{purchase.gift_message}"
            </p>
          )}
        </div>

        {/* Actions */}
        {purchase.status === 'confirmed' && (
          <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onMarkReceived(purchase.id)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                isReceived
                  ? 'bg-[#f1f8e9] text-[#33691e] border border-[#dcedc8]'
                  : 'bg-[#6750a4] text-white'
              }`}
            >
              {isReceived ? '✓ התקבל' : 'קיבלתי'}
            </button>

            {/* See Item Button */}
            <Link
              to={`/dashboard?highlight=${purchase.item_id}`}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#f3edff] text-[#6750a4] hover:bg-[#eaddff] transition-colors"
              title="צפה בפריט"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>

            {purchase.buyer_phone && !hasThanked && (
              <button
                onClick={() => onSendThankYou(purchase)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#25D366] text-white hover:bg-[#128C7E] transition-colors"
                title="שלח תודה"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            )}

            {hasThanked && (
              <div className="flex items-center gap-1 text-[#33691e] text-xs font-bold">
                <Check className="w-4 h-4" />
                תודה נשלחה
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
