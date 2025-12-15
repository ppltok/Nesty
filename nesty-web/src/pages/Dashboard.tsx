import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  Share2,
  Plus,
  Eye,
  Check,
  Star,
  ExternalLink,
  Trash2,
  ShoppingCart,
  ClipboardList,
  Filter,
  ArrowUpDown,
  Pencil,
  Sparkles,
  Gift,
  Package,
  Banknote,
  LayoutGrid,
  List,
} from 'lucide-react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import AddressModal from '../components/AddressModal'
import AddItemModal from '../components/AddItemModal'
import ShareModal from '../components/ShareModal'
import OnboardingTutorial from '../components/OnboardingTutorial'
import { CATEGORIES } from '../data/categories'
import { supabase } from '../lib/supabase'
import type { Item, ItemCategory } from '../types'

// Helper to get user-specific localStorage keys
const getTutorialKey = (userId: string) => `nesty_tutorial_completed_${userId}`
const getAddressSkippedKey = (userId: string) => `nesty_address_skipped_${userId}`

export default function Dashboard() {
  const { profile, registry, refreshProfile, isLoading: authLoading, user } = useAuth()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [addressModalClosed, setAddressModalClosed] = useState(false)
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(true)

  // Filter and sort state
  const [filterCategory, setFilterCategory] = useState<ItemCategory | ''>('')
  const [filterMostWanted, setFilterMostWanted] = useState(false)
  const [filterPriceRange, setFilterPriceRange] = useState<'all' | '0-200' | '200-500' | '500-1000' | '1000+'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'category'>('date')

  // View Mode State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Quantity selector modal state
  const [quantityModalItem, setQuantityModalItem] = useState<Item | null>(null)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [isEditingPurchased, setIsEditingPurchased] = useState(false)

  // Fetch items for the registry
  const fetchItems = useCallback(async () => {
    if (!registry) return
    setIsLoadingItems(true)
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('registry_id', registry.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (err) {
      console.error('Error fetching items:', err)
    } finally {
      setIsLoadingItems(false)
    }
  }, [registry])

  // Fetch items when registry is available
  useEffect(() => {
    if (registry) {
      fetchItems()
    }
  }, [registry, fetchItems])

  // Show address modal if registry exists but has no address (and user hasn't skipped)
  // Using a ref to prevent double-execution in StrictMode
  const addressModalChecked = useRef(false)
  useEffect(() => {
    // Guard against double execution
    if (addressModalChecked.current) return
    if (!registry) return

    addressModalChecked.current = true

    if (!registry.address_city && !registry.address_street) {
      // Check if user has already skipped the address modal
      try {
        const addressSkipped = user ? localStorage.getItem(getAddressSkippedKey(user.id)) : null
        if (!addressSkipped) {
          setShowAddressModal(true)
        } else {
          // User skipped before, mark as closed so tutorial can proceed
          setAddressModalClosed(true)
        }
      } catch {
        // localStorage error - treat as skipped
        setAddressModalClosed(true)
      }
    } else {
      // If registry has address, mark as closed so tutorial can show
      setAddressModalClosed(true)
    }
  }, [registry, user])

  // Handle highlight parameter for scrolling to specific item
  useEffect(() => {
    const highlightId = searchParams.get('highlight')
    if (highlightId && items.length > 0 && !isLoadingItems) {
      setHighlightedItemId(highlightId)
      // Clear the search param after reading it
      setSearchParams({}, { replace: true })

      // Scroll to the item after a short delay
      setTimeout(() => {
        const itemElement = itemRefs.current[highlightId]
        if (itemElement) {
          itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)

      // Remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightedItemId(null)
      }, 3000)
    }
  }, [searchParams, items, isLoadingItems, setSearchParams])

  // Check if we should show tutorial after address modal closes
  // Only show tutorial once - when user just completed onboarding (came from onboarding flow)
  const tutorialChecked = useRef(false)
  useEffect(() => {
    // Guard against double execution and ensure we only check once
    if (tutorialChecked.current) return
    if (!addressModalClosed || showAddressModal) return

    tutorialChecked.current = true

    // Only show tutorial if:
    // 1. Address modal has been closed (or wasn't needed) - checked above
    // 2. Tutorial hasn't been completed before
    // 3. User just completed onboarding (indicated by coming from celebration/onboarding)
    try {
      const tutorialCompleted = user ? localStorage.getItem(getTutorialKey(user.id)) : null
      const fromOnboarding = location.state?.fromOnboarding === true

      if (!tutorialCompleted && fromOnboarding) {
        // Small delay to ensure page is rendered
        const timer = setTimeout(() => {
          setShowTutorial(true)
        }, 500)
        return () => clearTimeout(timer)
      }
    } catch {
      // localStorage error - skip tutorial
    }
  }, [addressModalClosed, showAddressModal, location.state, user])

  const handleAddressSave = () => {
    refreshProfile()
  }

  const handleAddressModalClose = () => {
    // Save that user skipped the address modal
    try {
      if (user) localStorage.setItem(getAddressSkippedKey(user.id), 'true')
    } catch {
      // localStorage error - continue anyway
    }
    setShowAddressModal(false)
    setAddressModalClosed(true)
  }

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

  const handleItemSave = () => {
    fetchItems()
  }

  const handleOpenAddModal = () => {
    setEditingItem(null)
    setShowAddItemModal(true)
  }

  const handleOpenEditModal = (item: Item) => {
    setEditingItem(item)
    setShowAddItemModal(true)
  }

  const handleCloseItemModal = () => {
    setShowAddItemModal(false)
    setEditingItem(null)
  }

  const handleDeleteItem = async (itemId: string) => {
    const itemToDelete = items.find((i) => i.id === itemId)
    if (!itemToDelete) return

    let purchaseCount = 0
    try {
      const { count, error } = await supabase
        .from('purchases')
        .select('*', { count: 'exact', head: true })
        .eq('item_id', itemId)

      if (error) {
        console.error('Error checking purchase count:', error)
      } else {
        purchaseCount = count || 0
      }
    } catch (err) {
      console.error('Error checking purchase count:', err)
    }

    let confirmMessage = 'האם למחוק את הפריט?'
    if (purchaseCount > 0) {
      confirmMessage = `לפריט זה יש ${purchaseCount} רכישות רשומות.\nמחיקת הפריט תמחק גם את כל הרכישות.\n\nהאם להמשיך?`
    } else if (itemToDelete.quantity_received > 0) {
      confirmMessage = `הפריט סומן כנרכש (${itemToDelete.quantity_received} יחידות).\n\nהאם למחוק?`
    }

    if (!confirm(confirmMessage)) return

    try {
      await supabase.from('purchases').delete().eq('item_id', itemId)

      const { error } = await supabase.from('items').delete().eq('id', itemId)

      if (error) {
        console.error('Delete error:', error)
        alert(`שגיאה במחיקת הפריט: ${error.message}`)
        return
      }

      setItems((prev) => prev.filter((item) => item.id !== itemId))
    } catch (err) {
      console.error('Error deleting item:', err)
    }
  }

  // Handle click on "mark as purchased" button
  const handleMarkPurchasedClick = (item: Item) => {
    const isPurchased = item.quantity_received >= item.quantity

    if (isPurchased) {
      // Toggling OFF - directly call the update function
      updateItemQuantityReceived(item.id, item.quantity_received, item.quantity, 0)
    } else if (item.quantity > 1) {
      // Multi-quantity item - show modal to select quantity
      setSelectedQuantity(item.quantity - item.quantity_received) // Default to remaining
      setIsEditingPurchased(false)
      setQuantityModalItem(item)
    } else {
      // Single quantity - directly mark as purchased
      updateItemQuantityReceived(item.id, item.quantity_received, item.quantity, 1)
    }
  }

  // Handle click on edit purchased quantity
  const handleEditPurchasedClick = (item: Item) => {
    setSelectedQuantity(item.quantity_received)
    setIsEditingPurchased(true)
    setQuantityModalItem(item)
  }

  // Actually update the quantity_received in database
  const updateItemQuantityReceived = async (itemId: string, currentReceived: number, quantity: number, newReceivedOverride?: number) => {
    try {
      let newReceived: number

      if (newReceivedOverride !== undefined) {
        if (newReceivedOverride === 0 && currentReceived >= quantity) {
          // Toggling OFF (unpurchasing) - need to preserve guest purchases
          const { data: purchases, error: purchaseError } = await supabase
            .from('purchases')
            .select('quantity_purchased')
            .eq('item_id', itemId)
            .eq('status', 'confirmed')

          if (purchaseError) {
            console.error('Error fetching purchases:', purchaseError)
            newReceived = 0
          } else {
            newReceived = purchases?.reduce((sum, p) => sum + (p.quantity_purchased || 1), 0) || 0
          }
        } else {
          // Use the override value (adding to current)
          newReceived = Math.min(currentReceived + newReceivedOverride, quantity)
        }
      } else {
        newReceived = quantity
      }

      const { error } = await supabase
        .from('items')
        .update({ quantity_received: newReceived })
        .eq('id', itemId)

      if (error) {
        console.error('Update error:', error)
        alert(`שגיאה בעדכון הפריט: ${error.message}`)
        return
      }

      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity_received: newReceived } : item))
      )
    } catch (err) {
      console.error('Error updating item:', err)
    }
  }

  // Handle quantity modal confirmation
  const handleQuantityModalConfirm = async () => {
    if (!quantityModalItem) return

    if (isEditingPurchased) {
      // Edit mode - set to exact value
      const { error } = await supabase
        .from('items')
        .update({ quantity_received: selectedQuantity })
        .eq('id', quantityModalItem.id)

      if (error) {
        console.error('Update error:', error)
        alert(`שגיאה בעדכון הפריט: ${error.message}`)
        return
      }

      setItems((prev) =>
        prev.map((item) => (item.id === quantityModalItem.id ? { ...item, quantity_received: selectedQuantity } : item))
      )
    } else {
      // Add mode - add to current
      updateItemQuantityReceived(
        quantityModalItem.id,
        quantityModalItem.quantity_received,
        quantityModalItem.quantity,
        selectedQuantity
      )
    }
    setQuantityModalItem(null)
    setIsEditingPurchased(false)
  }

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    let result = [...items]

    // Category Filter
    if (filterCategory) {
      result = result.filter((i) => i.category === filterCategory)
    }

    // Most Wanted Filter
    if (filterMostWanted) {
      result = result.filter((i) => i.is_most_wanted)
    }

    // Price Range Filter
    if (filterPriceRange !== 'all') {
      switch (filterPriceRange) {
        case '0-200':
          result = result.filter((i) => i.price >= 0 && i.price <= 200)
          break
        case '200-500':
          result = result.filter((i) => i.price > 200 && i.price <= 500)
          break
        case '500-1000':
          result = result.filter((i) => i.price > 500 && i.price <= 1000)
          break
        case '1000+':
          result = result.filter((i) => i.price > 1000)
          break
      }
    }

    // Sort
    switch (sortBy) {
      case 'price':
        result.sort((a, b) => b.price - a.price)
        break
      case 'category':
        result.sort((a, b) => a.category.localeCompare(b.category))
        break
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return result
  }, [items, filterCategory, filterMostWanted, filterPriceRange, sortBy])

  // Split items into Active and Purchased
  const { activeItems, purchasedItems } = useMemo(() => {
    return filteredItems.reduce(
      (acc, item) => {
        const isPurchased = item.quantity_received >= item.quantity
        if (isPurchased) {
          acc.purchasedItems.push(item)
        } else {
          acc.activeItems.push(item)
        }
        return acc
      },
      { activeItems: [] as Item[], purchasedItems: [] as Item[] }
    )
  }, [filteredItems])

  // Calculate stats
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPurchased = items.reduce((sum, item) => sum + item.quantity_received, 0)
  const completionPercent = totalItems > 0 ? Math.round((totalPurchased / totalItems) * 100) : 0

  // Get category name helper
  const getCategoryName = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.name || categoryId
  }

  // Item Card Component
  const ItemCard = ({ item }: { item: Item }) => {
    const category = CATEGORIES.find((c) => c.id === item.category)
    const isPurchased = item.quantity_received >= item.quantity
    const CategoryIcon = category?.icon
    const isHighlighted = highlightedItemId === item.id

    if (viewMode === 'list') {
      return (
        <div
          ref={(el) => { itemRefs.current[item.id] = el }}
          className={`bg-white rounded-[20px] border overflow-hidden group transition-all duration-300 flex ${isPurchased ? 'opacity-70' : ''} ${isHighlighted ? 'border-[#6750a4] ring-4 ring-[#6750a4]/30 shadow-lg' : 'border-[#e7e0ec] hover:border-[#d0bcff]'}`}
        >
          {/* Image */}
          <div className="w-32 sm:w-48 aspect-square flex-shrink-0 bg-[#f5f5f5] relative overflow-hidden">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className={`w-full h-full object-cover ${isPurchased ? 'grayscale' : ''}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div
                  className={`w-12 h-12 rounded-[12px] bg-gradient-to-br ${category?.color || 'from-gray-300 to-gray-400'} flex items-center justify-center text-white`}
                >
                  {CategoryIcon ? <CategoryIcon className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                </div>
              </div>
            )}
            {item.is_most_wanted && !isPurchased && (
              <div className="absolute top-2 left-2 bg-[#b3261e] text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3
                    className={`font-bold text-lg leading-tight ${isPurchased ? 'text-[#49454f]' : 'text-[#1d192b]'}`}
                  >
                    {item.name}
                  </h3>
                  <p className="text-xs font-bold text-[#6750a4] uppercase mt-1">
                    {getCategoryName(item.category)}
                  </p>
                </div>
                {item.price > 0 && (
                  <span
                    className={`font-bold text-lg ${isPurchased ? 'text-[#49454f] line-through' : 'text-[#1d192b]'}`}
                  >
                    ₪{item.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-end justify-between gap-4 mt-2">
              <div className="flex-1">
                {/* Progress */}
                <div className="flex items-center gap-2 text-xs text-[#49454f] mb-1">
                  <span>{Math.round((item.quantity_received / item.quantity) * 100)}%</span>
                  <div className="h-1.5 flex-1 bg-[#f3edff] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isPurchased ? 'bg-green-500' : 'bg-[#6750a4]'}`}
                      style={{ width: `${(item.quantity_received / item.quantity) * 100}%` }}
                    />
                  </div>
                  {item.quantity > 1 && (
                    <span className="text-[#49454f] whitespace-nowrap">
                      {isPurchased ? `נרכשו ${item.quantity}` : `נותרו ${item.quantity - item.quantity_received}`}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleMarkPurchasedClick(item)}
                    className={`p-2 rounded-lg text-xs font-bold transition-colors ${isPurchased ? 'bg-green-100 text-green-700' : 'bg-[#1d192b] text-white'}`}
                  >
                    {isPurchased ? 'בטל רכישה' : 'סמן כנרכש'}
                  </button>
                  {/* Edit purchased quantity button - only show for multi-quantity items with some purchased */}
                  {item.quantity > 1 && item.quantity_received > 0 && !isPurchased && (
                    <button
                      onClick={() => handleEditPurchasedClick(item)}
                      className="p-2 rounded-lg text-xs font-medium bg-[#f3edff] text-[#6750a4] hover:bg-[#e8deff] transition-colors"
                      title="ערוך כמות שנרכשה"
                    >
                      {item.quantity_received}/{item.quantity}
                    </button>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-2 rounded-lg bg-gray-100 text-[#49454f] hover:text-[#6750a4]"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 rounded-lg bg-gray-100 text-[#49454f] hover:text-[#b3261e]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Grid View
    return (
      <div
        ref={(el) => { itemRefs.current[item.id] = el }}
        className={`bg-white rounded-[24px] border overflow-hidden group transition-all duration-300 ${isPurchased ? 'opacity-80' : ''} ${isHighlighted ? 'border-[#6750a4] ring-4 ring-[#6750a4]/30 shadow-lg' : 'border-[#e7e0ec] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-[#d0bcff]'}`}
      >
        {/* Image Area */}
        <div className="aspect-square bg-[#f5f5f5] relative overflow-hidden">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isPurchased ? 'grayscale' : ''}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div
                className={`w-20 h-20 rounded-[20px] bg-gradient-to-br ${category?.color || 'from-gray-300 to-gray-400'} flex items-center justify-center text-white shadow-sm ${isPurchased ? 'grayscale' : ''}`}
              >
                {CategoryIcon ? <CategoryIcon className="w-10 h-10" /> : <Package className="w-10 h-10" />}
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {item.is_most_wanted && !isPurchased && (
              <div className="bg-[#b3261e] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Star className="w-3 h-3 fill-current" />
                <span>הכי רוצה!</span>
              </div>
            )}
          </div>

          {/* Status Badge Top Right */}
          <div className="absolute top-3 right-3 z-10">
            {isPurchased && (
              <div className="bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Check className="w-3 h-3" strokeWidth={3} />
                <span>נרכש!</span>
              </div>
            )}
            {item.is_private && !isPurchased && (
              <div className="bg-white/90 backdrop-blur-sm text-[#49454f] px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border border-black/5">
                פרטי
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-4">
            <div className="flex justify-between items-start mb-1">
              <p className="text-xs font-bold text-[#6750a4] uppercase tracking-wide">
                {getCategoryName(item.category)}
              </p>
              {item.price > 0 && (
                <span
                  className={`font-bold text-lg ${isPurchased ? 'text-[#49454f] line-through decoration-[#b3261e]/50' : 'text-[#1d192b]'}`}
                >
                  ₪{item.price.toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex items-start gap-1">
              <h3
                className={`font-bold text-lg leading-tight line-clamp-2 min-h-[3rem] ${isPurchased ? 'text-[#49454f]' : 'text-[#1d192b]'}`}
              >
                {item.name}
              </h3>
            </div>

            {item.store_name && item.store_name !== 'ידני' && (
              <p className="text-sm text-[#49454f] mt-1 flex items-center gap-1">
                <ShoppingCart className="w-3 h-3" /> {item.store_name}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-5">
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className={isPurchased ? 'text-green-600' : 'text-[#49454f]'}>
                {isPurchased ? 'הושלם' : `נרכשו ${item.quantity_received} מתוך ${item.quantity}`}
              </span>
              <span className="text-[#49454f]">
                {Math.round((item.quantity_received / item.quantity) * 100)}%
              </span>
            </div>
            <div className="h-2 w-full bg-[#f3edff] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isPurchased ? 'bg-green-500' : 'bg-[#6750a4]'}`}
                style={{ width: `${(item.quantity_received / item.quantity) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                  isPurchased
                    ? 'border border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                    : 'bg-[#1d192b] text-white hover:bg-[#322f3d]'
                }`}
                onClick={() => handleMarkPurchasedClick(item)}
              >
                {isPurchased ? (
                  <>
                    <Check className="w-4 h-4" />
                    סמן כלא נרכש
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    סמן כנרכש
                  </>
                )}
              </button>
              {/* Edit purchased quantity button - only show for multi-quantity items with some purchased */}
              {item.quantity > 1 && item.quantity_received > 0 && !isPurchased && (
                <button
                  onClick={() => handleEditPurchasedClick(item)}
                  className="px-3 py-2.5 rounded-xl text-sm font-medium bg-[#f3edff] text-[#6750a4] hover:bg-[#e8deff] transition-colors"
                  title="ערוך כמות שנרכשה"
                >
                  {item.quantity_received}/{item.quantity}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {item.original_url && (
                <a href={item.original_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[#e7e0ec] text-[#49454f] text-sm font-medium hover:border-[#6750a4] hover:text-[#6750a4] transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    למוצר
                  </button>
                </a>
              )}
              <button
                className="p-2 rounded-xl text-[#49454f] hover:bg-[#f3edff] hover:text-[#6750a4] transition-colors"
                onClick={() => handleOpenEditModal(item)}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                className="p-2 rounded-xl text-[#49454f] hover:bg-[#ffebee] hover:text-[#b3261e] transition-colors"
                onClick={() => handleDeleteItem(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show loading if auth is still loading or registry hasn't loaded yet
  if (authLoading || !registry) {
    return (
      <div className="min-h-screen bg-[#fffbff] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#6750a4] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[#49454f] font-medium">טוען את הרשימה...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fffbff] font-sans text-[#1d192b]" dir="rtl">
      {/* Address Modal */}
      {registry && (
        <AddressModal
          isOpen={showAddressModal}
          onClose={handleAddressModalClose}
          registryId={registry.id}
          onSave={handleAddressSave}
        />
      )}

      {/* Onboarding Tutorial */}
      {showTutorial && (
        <OnboardingTutorial
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}

      {/* Add/Edit Item Modal */}
      {registry && (
        <AddItemModal
          isOpen={showAddItemModal}
          onClose={handleCloseItemModal}
          registryId={registry.id}
          onSave={handleItemSave}
          editItem={editingItem || undefined}
        />
      )}

      {/* Share Modal */}
      {registry && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          registrySlug={registry.slug}
          ownerName={profile?.first_name || 'משתמש'}
        />
      )}

      {/* Quantity Selector Modal */}
      {quantityModalItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setQuantityModalItem(null); setIsEditingPurchased(false); }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[#1d192b] mb-2 text-center">
              {isEditingPurchased ? 'עריכת כמות שנרכשה' : 'כמה נרכשו?'}
            </h3>
            <p className="text-[#49454f] text-sm mb-6 text-center">
              {quantityModalItem.name}
              <span className="block text-xs mt-1">
                (סה״כ נדרש: {quantityModalItem.quantity})
              </span>
            </p>

            {/* Quantity selector */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => setSelectedQuantity(Math.max(0, selectedQuantity - 1))}
                className="w-12 h-12 rounded-full bg-[#f3edff] text-[#6750a4] text-2xl font-bold hover:bg-[#e8deff] transition-colors"
              >
                -
              </button>
              <span className="text-3xl font-bold text-[#1d192b] w-16 text-center">{selectedQuantity}</span>
              <button
                onClick={() => setSelectedQuantity(Math.min(
                  isEditingPurchased ? quantityModalItem.quantity : quantityModalItem.quantity - quantityModalItem.quantity_received,
                  selectedQuantity + 1
                ))}
                className="w-12 h-12 rounded-full bg-[#f3edff] text-[#6750a4] text-2xl font-bold hover:bg-[#e8deff] transition-colors"
              >
                +
              </button>
            </div>

            {/* All button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setSelectedQuantity(
                  isEditingPurchased ? quantityModalItem.quantity : quantityModalItem.quantity - quantityModalItem.quantity_received
                )}
                className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedQuantity === (isEditingPurchased ? quantityModalItem.quantity : quantityModalItem.quantity - quantityModalItem.quantity_received)
                    ? 'bg-[#6750a4] text-white'
                    : 'bg-[#f3edff] text-[#6750a4] hover:bg-[#e8deff]'
                }`}
              >
                הכל ({isEditingPurchased ? quantityModalItem.quantity : quantityModalItem.quantity - quantityModalItem.quantity_received})
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => { setQuantityModalItem(null); setIsEditingPurchased(false); }}
                className="flex-1 py-3 rounded-xl border border-[#e7e0ec] text-[#49454f] font-medium hover:bg-gray-50 transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={handleQuantityModalConfirm}
                className="flex-1 py-3 rounded-xl bg-[#6750a4] text-white font-bold hover:bg-[#7c6aaf] transition-colors"
              >
                אישור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome & Stats Section */}
        <div className="flex flex-col xl:flex-row gap-8 mb-12">
          {/* Welcome Card */}
          <div className="flex-1 bg-gradient-to-br from-[#1d192b] to-[#49454f] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-1000" />

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[#d0bcff]" />
                  </div>
                  <h1 className="text-3xl font-bold">היי, {profile?.first_name || 'משתמש'}!</h1>
                </div>
                <p className="text-[#eaddff] text-lg max-w-md font-medium leading-relaxed">
                  הרשימה שלך מוכנה. זה הזמן לשתף אותה עם האנשים שאתם אוהבים ולהתחיל להתארגן ברוגע.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <button
                  data-tutorial="add-item-button"
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-2 bg-[#d0bcff] text-[#381e72] px-6 py-3 rounded-full font-bold hover:bg-[#e8def8] transition-all shadow-sm active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  הוסף פריט
                </button>
                {registry && (
                  <>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-full font-medium hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10 active:scale-95"
                    >
                      <Share2 className="w-5 h-5" />
                      שתף
                    </button>
                    <Link to={`/registry/${registry.slug}`}>
                      <button className="flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-full font-medium hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10 active:scale-95">
                        <Eye className="w-5 h-5" />
                        תצוגה מקדימה
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div data-tutorial="dashboard-stats" className="flex flex-col sm:flex-row gap-4 xl:w-auto">
            <div className="bg-[#f3edff] rounded-[32px] p-6 flex flex-col justify-between min-w-[240px] border border-[#eaddff] relative overflow-hidden">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-white p-2 rounded-xl text-[#6750a4] shadow-sm">
                    <Check className="w-5 h-5" strokeWidth={3} />
                  </div>
                  <span className="text-xs font-bold text-[#6750a4] uppercase tracking-wide">סטטוס רשימה</span>
                </div>
                <span className="text-4xl font-bold text-[#1d192b]">{completionPercent}%</span>
              </div>
              <div className="mt-6">
                <div className="h-3 w-full bg-[#eaddff] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#6750a4] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
                <p className="text-sm text-[#49454f] mt-2 font-medium">
                  {totalPurchased} מתוך {totalItems} פריטים נרכשו
                </p>
              </div>
            </div>
            <div className="bg-white rounded-[32px] p-6 flex flex-col justify-between min-w-[200px] border border-[#e7e0ec] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-[#f5f5f5] p-2 rounded-xl text-[#49454f]">
                  <Gift className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#49454f] uppercase tracking-wide">סה״כ מתנות</span>
              </div>
              <div className="mt-auto">
                <span className="text-4xl font-bold text-[#1d192b]">{totalItems}</span>
                <p className="text-sm text-[#49454f] mt-1 font-medium">פריטים ברשימה</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Content */}
        <div className="mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-[#1d192b] flex items-center gap-3">
            הפריטים שלי
            <span className="text-sm font-bold text-[#6750a4] bg-[#eaddff] px-3 py-1 rounded-full">
              {filteredItems.length}
            </span>
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-xl border border-[#e7e0ec] p-1 gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#f3edff] text-[#6750a4] shadow-sm' : 'text-[#49454f] hover:bg-[#f5f5f5]'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#f3edff] text-[#6750a4] shadow-sm' : 'text-[#49454f] hover:bg-[#f5f5f5]'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            <div className="h-8 w-px bg-[#e7e0ec] mx-2 hidden sm:block"></div>

            {/* Most Wanted Toggle */}
            <button
              onClick={() => setFilterMostWanted(!filterMostWanted)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all hover:scale-105 active:scale-95 ${
                filterMostWanted
                  ? 'bg-[#b3261e] text-white border-[#b3261e] shadow-md shadow-red-200'
                  : 'bg-white text-[#49454f] border-[#e7e0ec] hover:border-[#b3261e] hover:text-[#b3261e]'
              }`}
            >
              <Star className={`w-4 h-4 ${filterMostWanted ? 'fill-white' : ''}`} />
              הכי רוצה
            </button>

            {/* Price Range Filter */}
            <div className="relative group">
              <Banknote className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#49454f] pointer-events-none group-hover:text-[#6750a4] transition-colors" />
              <select
                value={filterPriceRange}
                onChange={(e) => setFilterPriceRange(e.target.value as typeof filterPriceRange)}
                className="appearance-none bg-white border border-[#e7e0ec] rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 focus:border-[#6750a4] hover:border-[#d0bcff] transition-all cursor-pointer text-[#1d192b] font-medium min-w-[140px]"
              >
                <option value="all">כל המחירים</option>
                <option value="0-200">עד 200 ₪</option>
                <option value="200-500">200 ₪ - 500 ₪</option>
                <option value="500-1000">500 ₪ - 1,000 ₪</option>
                <option value="1000+">מעל 1,000 ₪</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative group">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#49454f] pointer-events-none group-hover:text-[#6750a4] transition-colors" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as ItemCategory | '')}
                className="appearance-none bg-white border border-[#e7e0ec] rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 focus:border-[#6750a4] hover:border-[#d0bcff] transition-all cursor-pointer text-[#1d192b] font-medium min-w-[140px]"
              >
                <option value="">כל הקטגוריות</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative group">
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#49454f] pointer-events-none group-hover:text-[#6750a4] transition-colors" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'category')}
                className="appearance-none bg-white border border-[#e7e0ec] rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 focus:border-[#6750a4] hover:border-[#d0bcff] transition-all cursor-pointer text-[#1d192b] font-medium"
              >
                <option value="date">לפי תאריך</option>
                <option value="price">לפי מחיר</option>
                <option value="category">לפי קטגוריה</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Empty / Grid */}
        {isLoadingItems ? (
          <div className="bg-white rounded-[32px] border border-[#e7e0ec] p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[#6750a4] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[#49454f] font-medium">טוען פריטים...</p>
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-[32px] border border-[#e7e0ec] p-12 text-center">
            <div className="w-20 h-20 bg-[#f3edff] rounded-[24px] flex items-center justify-center mx-auto mb-6 text-[#6750a4] rotate-3">
              <Package className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-[#1d192b] mb-3">הרשימה שלכם ריקה</h2>
            <p className="text-[#49454f] mb-8 max-w-md mx-auto leading-relaxed">
              זה הזמן למלא את הרשימה! אפשר להוסיף פריטים ידנית או להעזר בצ׳ק ליסט המומלץ שלנו.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 bg-[#6750a4] text-white px-8 py-3 rounded-full font-bold hover:bg-[#503e85] transition-all shadow-md active:scale-95"
              >
                <Plus className="w-5 h-5" />
                הוסף פריט ידנית
              </button>
              <Link to="/checklist">
                <button className="flex items-center gap-2 bg-white border-2 border-[#e7e0ec] text-[#1d192b] px-8 py-3 rounded-full font-bold hover:border-[#6750a4] hover:text-[#6750a4] transition-all active:scale-95">
                  <ClipboardList className="w-5 h-5" />
                  בחר מהצ'קליסט
                </button>
              </Link>
            </div>
          </div>
        ) : (
          /* Grouped Items Grid */
          <div className="space-y-12">
            {/* ACTIVE ITEMS */}
            {CATEGORIES.map((category) => {
              const categoryItems = activeItems.filter((i) => i.category === category.id)
              if (categoryItems.length === 0) return null
              const CategoryIcon = category.icon

              return (
                <div key={category.id}>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`p-2 rounded-xl bg-gradient-to-br ${category.color} text-white shadow-sm`}
                    >
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1d192b]">{category.name}</h3>
                    <div className="h-px flex-1 bg-[#e7e0ec] ml-4" />
                    <span className="text-sm font-medium text-[#49454f] bg-white border border-[#e7e0ec] px-3 py-1 rounded-full">
                      {categoryItems.length} פריטים
                    </span>
                  </div>

                  {/* Grid/List */}
                  <div
                    className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}
                  >
                    {categoryItems.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Catch-all for items without a valid category */}
            {activeItems.filter((i) => !CATEGORIES.find((c) => c.id === i.category)).length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-gray-200 text-gray-600 shadow-sm">
                    <Package className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1d192b]">אחר</h3>
                  <div className="h-px flex-1 bg-[#e7e0ec] ml-4" />
                </div>
                <div
                  className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}
                >
                  {activeItems
                    .filter((i) => !CATEGORIES.find((c) => c.id === i.category))
                    .map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                </div>
              </div>
            )}

            {/* PURCHASED ITEMS SECTION */}
            {purchasedItems.length > 0 && (
              <div className="pt-8 border-t-2 border-dashed border-[#e7e0ec] mt-12">
                <div className="flex items-center gap-3 mb-8 opacity-70">
                  <div className="p-2 rounded-xl bg-green-100 text-green-700 shadow-sm">
                    <Check className="w-5 h-5" strokeWidth={3} />
                  </div>
                  <h3 className="text-xl font-bold text-[#1d192b]">נרכשו כבר</h3>
                  <div className="h-px flex-1 bg-[#e7e0ec] ml-4" />
                  <span className="text-sm font-medium text-[#49454f] bg-white border border-[#e7e0ec] px-3 py-1 rounded-full">
                    {purchasedItems.length} פריטים
                  </span>
                </div>

                <div
                  className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}
                >
                  {purchasedItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
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
