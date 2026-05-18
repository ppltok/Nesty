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
  Pencil,
  Sparkles,
  Gift,
  Package,
  LayoutGrid,
  List,
  Search,
  X,
  Users,
} from 'lucide-react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import AddressModal from '../components/AddressModal'
import AddItemModal from '../components/AddItemModal'
import ShareModal from '../components/ShareModal'
import ExtensionBanner from '../components/ExtensionBanner'
import ExtensionGuideModal from '../components/ExtensionGuideModal'
import PriceStatusBadge from '../components/PriceStatusBadge'
import FadedIconsBackground from '../components/animations/FadedIconsBackground'
import PostOnboardingWizard from '../components/popups/PostOnboardingWizard'
import SharePromptModal from '../components/popups/SharePromptModal'
import MilestoneToast, { type MilestoneKind } from '../components/popups/MilestoneToast'
import PartnerInviteCard from '../components/popups/PartnerInviteCard'
import { useExtensionDetection } from '../hooks/useExtensionDetection'
import { useDashboardLayout } from '../components/layout/DashboardLayout'
import { usePopupState, advanceMilestone, milestoneForCount } from '../hooks/usePopups'
import { CATEGORIES } from '../data/categories'
import { supabase } from '../lib/supabase'
import type { Item, ItemCategory } from '../types'

// Category accent colors (same as Checklist)
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

// Helper to get user-specific localStorage keys
const getAddressSkippedKey = (userId: string) => `nesty_address_skipped_${userId}`

export default function Dashboard() {
  const { profile, registry, refreshProfile, isLoading: authLoading, user } = useAuth()
  const { tutorialActive, tutorialCheckComplete } = useDashboardLayout()
  const { isInstalled: extensionInstalled } = useExtensionDetection()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showExtensionGuideModal, setShowExtensionGuideModal] = useState(false)
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(true)

  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<ItemCategory | ''>('')
  const [filterMostWanted, setFilterMostWanted] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'purchased'>('all')
  const [filterPriceRange, setFilterPriceRange] = useState<'all' | '0-200' | '200-500' | '500-1000' | '1000+'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'category'>('date')

  // View Mode State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  // Co-parent indicator
  const [partnerName, setPartnerName] = useState<string | null>(null)

  // Quantity selector modal state
  const [quantityModalItem, setQuantityModalItem] = useState<Item | null>(null)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [isEditingPurchased, setIsEditingPurchased] = useState(false)

  // Delete confirmation modal state
  const [deleteModalItem, setDeleteModalItem] = useState<Item | null>(null)
  const [deleteModalPurchaseCount, setDeleteModalPurchaseCount] = useState(0)

  // Unmark confirmation modal state (when guest has purchased)
  const [unmarkModalItem, setUnmarkModalItem] = useState<Item | null>(null)
  const [unmarkModalGuestCount, setUnmarkModalGuestCount] = useState(0)

  // Engagement popups / toasts
  const popups = usePopupState(user?.id)
  const [showPostOnboarding, setShowPostOnboarding] = useState(false)
  const [showSharePrompt, setShowSharePrompt] = useState(false)
  const [showPartnerInvite, setShowPartnerInvite] = useState(false)
  const [activeToast, setActiveToast] = useState<MilestoneKind | null>(null)
  // Snapshot of items.length before the latest add, so handleItemSave can
  // detect milestone crossings without re-fetching state mid-flow.
  const itemsCountBeforeSave = useRef<number>(0)

  // Track if address modal is shown right after onboarding (to redirect to checklist on close)
  const addressModalFromOnboarding = useRef(false)

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

      if (error) {
        throw error
      }
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

  // Post-onboarding wizard: show once for users who haven't dismissed AND
  // still have an empty registry. Grandfathered users (any prior items) are
  // auto-dismissed via migration 3c.
  useEffect(() => {
    if (!popups.loaded || !user) return
    if (popups.dismissed.post_onboarding) return
    if (isLoadingItems) return
    if (items.length > 0) return
    if (tutorialActive) return
    if (showAddressModal) return
    setShowPostOnboarding(true)
  }, [popups.loaded, popups.dismissed.post_onboarding, user, isLoadingItems, items.length, tutorialActive, showAddressModal])

  // Partner invite card — fires once for solo registries (no partner_id).
  // Only when the user has at least 3 items so it doesn't ambush brand-new
  // accounts on their first session. Dismissed key persists in profiles.
  useEffect(() => {
    if (!popups.loaded || !user || !registry) return
    if (popups.dismissed.partner_invite_card) return
    if (registry.partner_id) return
    if (isLoadingItems || items.length < 3) return
    if (showPostOnboarding || showAddressModal || showSharePrompt) return
    setShowPartnerInvite(true)
  }, [popups.loaded, popups.dismissed.partner_invite_card, user, registry, isLoadingItems, items.length, showPostOnboarding, showAddressModal, showSharePrompt])

  // First-gift celebration toast — fires once when the registry receives its
  // very first purchase. Uses milestone integer 100 (reserved for first_gift)
  // to persist via last_milestone_shown without colliding with item-count
  // milestones (1, 5, 10).
  useEffect(() => {
    if (!popups.loaded || !user || !registry) return
    if (popups.lastMilestoneShown >= 100) return
    let cancelled = false
    void (async () => {
      const { data: itemRows } = await supabase
        .from('items')
        .select('id')
        .eq('registry_id', registry.id)
      if (cancelled || !itemRows || itemRows.length === 0) return
      const { count } = await supabase
        .from('purchases')
        .select('*', { count: 'exact', head: true })
        .in('item_id', itemRows.map(i => i.id))
      if (cancelled) return
      if ((count ?? 0) >= 1) {
        setActiveToast({ kind: 'first_gift' })
        void advanceMilestone(user.id, 100)
      }
    })()
    return () => { cancelled = true }
  }, [popups.loaded, popups.lastMilestoneShown, user, registry])

  // Fetch partner name for shared registry indicator
  useEffect(() => {
    if (!registry?.partner_id || !user) {
      setPartnerName(null)
      return
    }
    const partnerId = registry.owner_id === user.id ? registry.partner_id : registry.owner_id
    supabase
      .from('profiles')
      .select('first_name')
      .eq('id', partnerId)
      .maybeSingle()
      .then(({ data }) => {
        setPartnerName(data?.first_name || null)
      })
  }, [registry, user])

  // Address modal trigger — gated by signup vintage so the change only
  // affects users who came through the new onboarding (Apr 30, 2026 onward).
  //
  // - NEW users: deferred until they have 3+ items (engagement signal). The
  //   first-item step in onboarding already gives them the wow moment, so
  //   nagging for an address right after is friction at the worst time.
  // - EXISTING users: original behavior preserved — modal shows immediately
  //   on Dashboard load if registry has no address (and they haven't skipped
  //   it). They never went through the new flow, so flipping the rule mid-
  //   account-life would feel inconsistent.
  const NEW_FLOW_CUTOFF = new Date('2026-04-30T00:00:00Z').getTime()
  const isNewFlowUser = profile?.created_at
    ? new Date(profile.created_at).getTime() >= NEW_FLOW_CUTOFF
    : false

  const addressModalChecked = useRef(false)
  useEffect(() => {
    if (!tutorialCheckComplete) return
    if (tutorialActive) return
    if (addressModalChecked.current) return
    if (!registry) return
    // Defer until 3+ items only for new-flow users; old users keep the
    // immediate prompt they're used to.
    if (isNewFlowUser && items.length < 3) return

    addressModalChecked.current = true

    if (!registry.address_city && !registry.address_street) {
      try {
        const addressSkipped = user ? localStorage.getItem(getAddressSkippedKey(user.id)) : null
        if (!addressSkipped) {
          // Pre-existing users that hit this on first dashboard load still
          // need the "from onboarding" close-redirect; new-flow users don't.
          addressModalFromOnboarding.current = !isNewFlowUser
          setShowAddressModal(true)
        }
      } catch {
        // localStorage error — skip showing modal
      }
    }
  }, [registry, user, tutorialActive, tutorialCheckComplete, items.length, isNewFlowUser])

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

  // Handle product data from extension
  const extensionProductChecked = useRef(false)
  const [extensionProductData, setExtensionProductData] = useState<any>(null)

  useEffect(() => {
    // Guard against double execution
    if (extensionProductChecked.current) return

    const addProduct = searchParams.get('addProduct')
    if (addProduct === 'true') {
      extensionProductChecked.current = true

      try {
        const storedData = localStorage.getItem('nesty_extension_product')
        if (storedData) {
          const extensionData = JSON.parse(storedData)
          console.log('📦 Extension product data found:', extensionData)

          // Map the extension data to the format expected by AddItemModal
          const mappedData = {
            name: extensionData.productData.name || '',
            price: extensionData.productData.price || '',
            category: extensionData.productData.category || '',
            brand: extensionData.productData.brand || '',
            storeName: extractStoreName(extensionData.sourceUrl),
            originalUrl: extensionData.sourceUrl || '',
            priceCurrency: extensionData.productData.priceCurrency || '₪',
            imageUrls: extensionData.productData.imageUrls || []
          }

          setExtensionProductData(mappedData)

          // Clear the URL parameter
          setSearchParams({}, { replace: true })

          // Clear localStorage
          localStorage.removeItem('nesty_extension_product')

          // Open the add item modal after a short delay
          setTimeout(() => {
            setShowAddItemModal(true)
          }, 500)
        }
      } catch (error) {
        console.error('❌ Failed to load extension product data:', error)
      }
    }
  }, [searchParams, setSearchParams])

  // Helper function to extract store name from URL
  const extractStoreName = (url: string): string => {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.replace('www.', '')
      // Remove TLD and capitalize
      const storeName = hostname.split('.')[0]
      return storeName.charAt(0).toUpperCase() + storeName.slice(1)
    } catch {
      return ''
    }
  }

  const handleAddressSave = () => {
    refreshProfile()
    // If this was shown right after onboarding, navigate to checklist
    if (addressModalFromOnboarding.current) {
      addressModalFromOnboarding.current = false
      navigate('/checklist')
    }
  }

  const handleAddressModalClose = () => {
    // Save that user skipped the address modal
    try {
      if (user) localStorage.setItem(getAddressSkippedKey(user.id), 'true')
    } catch {
      // localStorage error - continue anyway
    }
    setShowAddressModal(false)
    // If this was shown right after onboarding, navigate to checklist
    if (addressModalFromOnboarding.current) {
      addressModalFromOnboarding.current = false
      navigate('/checklist')
    }
  }

  const handleItemSave = async () => {
    const beforeCount = itemsCountBeforeSave.current
    await fetchItems()
    // After refetch, items.length is in a stale closure — read the new count
    // via a targeted DB query. Avoids depending on React state timing.
    if (!registry || !user) return
    const { count } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('registry_id', registry.id)
    const newCount = count ?? 0

    // Share prompt: fires when user crosses to 5+ items, never shared,
    // never previously dismissed. Grandfathered users have dismissed=true.
    // registry_shared_at lives on profiles, not registries.
    if (beforeCount < 5 && newCount >= 5 && !profile?.registry_shared_at && !popups.dismissed.share_prompt_5) {
      setShowSharePrompt(true)
    }

    // Milestone toast: fires only when the NEW milestone is strictly higher
    // than what the user has ever seen. Grandfathered users have
    // last_milestone_shown set to their current position on rollout day.
    const prevMilestone = milestoneForCount(beforeCount)
    const newMilestone = milestoneForCount(newCount)
    if (newMilestone > prevMilestone && newMilestone > popups.lastMilestoneShown) {
      setActiveToast({ kind: 'items', count: newMilestone as 1 | 5 | 10 })
      void advanceMilestone(user.id, newMilestone)
    }
  }

  const handleOpenAddModal = () => {
    setEditingItem(null)
    // Snapshot the count so handleItemSave can detect crossings.
    itemsCountBeforeSave.current = items.length

    // Check if extension is installed and if user hasn't dismissed the guide
    const hasExtension = extensionInstalled
    const guideDismissed = localStorage.getItem('nesty_extension_guide_dismissed') === 'true'

    if (!hasExtension && !guideDismissed) {
      // Show guide modal if extension not installed and user hasn't dismissed it
      setShowExtensionGuideModal(true)
    } else {
      // Otherwise, open the add item modal normally
      setShowAddItemModal(true)
    }
  }

  const handleOpenEditModal = (item: Item) => {
    setEditingItem(item)
    setShowAddItemModal(true)
  }

  const handleCloseItemModal = () => {
    setShowAddItemModal(false)
    setEditingItem(null)
    setExtensionProductData(null) // Clear extension data when modal closes
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

    // Show custom confirmation modal instead of browser confirm()
    setDeleteModalPurchaseCount(purchaseCount)
    setDeleteModalItem(itemToDelete)
  }

  const confirmDeleteItem = async () => {
    if (!deleteModalItem) return

    try {
      await supabase.from('purchases').delete().eq('item_id', deleteModalItem.id)

      const { error } = await supabase.from('items').delete().eq('id', deleteModalItem.id)

      if (error) {
        console.error('Delete error:', error)
        alert(`שגיאה במחיקת הפריט: ${error.message}`)
        return
      }

      setItems((prev) => prev.filter((item) => item.id !== deleteModalItem.id))
    } catch (err) {
      console.error('Error deleting item:', err)
    } finally {
      setDeleteModalItem(null)
      setDeleteModalPurchaseCount(0)
    }
  }

  // Handle click on "mark as purchased" button
  const handleMarkPurchasedClick = async (item: Item) => {
    const isPurchased = item.quantity_received >= item.quantity

    if (isPurchased) {
      // Toggling OFF - check if there are guest purchases first
      try {
        const { data: purchases, error } = await supabase
          .from('purchases')
          .select('quantity_purchased')
          .eq('item_id', item.id)
          .eq('status', 'confirmed')

        if (error) {
          console.error('Error checking purchases:', error)
        }

        const guestPurchaseCount = purchases?.reduce((sum, p) => sum + (p.quantity_purchased || 1), 0) || 0

        if (guestPurchaseCount > 0) {
          // Show warning modal
          setUnmarkModalGuestCount(guestPurchaseCount)
          setUnmarkModalItem(item)
          return
        }
      } catch (err) {
        console.error('Error checking purchases:', err)
      }

      // No guest purchases, proceed directly
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

  // Confirm unmarking item with guest purchases
  const confirmUnmarkItem = async () => {
    if (!unmarkModalItem) return

    // Force set to 0, ignoring guest purchases
    try {
      const { error } = await supabase
        .from('items')
        .update({ quantity_received: 0 })
        .eq('id', unmarkModalItem.id)

      if (error) {
        console.error('Update error:', error)
        alert(`שגיאה בעדכון הפריט: ${error.message}`)
        return
      }

      setItems((prev) =>
        prev.map((item) => (item.id === unmarkModalItem.id ? { ...item, quantity_received: 0 } : item))
      )
    } catch (err) {
      console.error('Error updating item:', err)
    } finally {
      setUnmarkModalItem(null)
      setUnmarkModalGuestCount(0)
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

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((i) =>
        i.name.toLowerCase().includes(q) ||
        i.store_name?.toLowerCase().includes(q) ||
        i.notes?.toLowerCase().includes(q) ||
        getCategoryName(i.category).toLowerCase().includes(q)
      )
    }

    // Category Filter
    if (filterCategory) {
      result = result.filter((i) => i.category === filterCategory)
    }

    // Most Wanted Filter
    if (filterMostWanted) {
      result = result.filter((i) => i.is_most_wanted)
    }

    // Status Filter
    if (statusFilter === 'active') {
      result = result.filter((i) => i.quantity_received < i.quantity)
    } else if (statusFilter === 'purchased') {
      result = result.filter((i) => i.quantity_received >= i.quantity)
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
  }, [items, searchQuery, filterCategory, filterMostWanted, statusFilter, filterPriceRange, sortBy])

  // Check if any filters are active
  const hasActiveFilters = searchQuery || filterCategory || filterMostWanted || statusFilter !== 'all' || filterPriceRange !== 'all'
  const clearAllFilters = () => {
    setSearchQuery('')
    setFilterCategory('')
    setFilterMostWanted(false)
    setStatusFilter('all')
    setFilterPriceRange('all')
  }

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
          className={`bg-white rounded-[20px] border overflow-hidden group transition-all duration-300 flex animate-fade-in-up ${isPurchased ? 'opacity-70' : ''} ${isHighlighted ? 'border-[#6750a4] ring-4 ring-[#6750a4]/30 shadow-lg' : 'border-[#e7e0ec] hover:border-[#d0bcff] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]'}`}
        >
          {/* Image */}
          <div className="w-24 sm:w-36 aspect-square flex-shrink-0 bg-[#f5f5f5] relative overflow-hidden">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
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
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`font-bold text-lg ${isPurchased ? 'text-[#49454f] line-through' : 'text-[#1d192b]'}`}
                    >
                      ₪{item.price.toLocaleString()}
                    </span>
                    <PriceStatusBadge
                      originalPrice={item.price}
                      lastCheckedPrice={item.last_checked_price}
                      lastPriceCheck={item.last_price_check}
                    />
                  </div>
                )}
              </div>
              {item.notes && (
                <p className="text-xs text-[#49454f] mt-2 italic line-clamp-2">
                  {item.notes}
                </p>
              )}
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
        className={`bg-white rounded-[24px] border overflow-hidden group transition-all duration-300 animate-fade-in-up ${isPurchased ? 'opacity-80' : ''} ${isHighlighted ? 'border-[#6750a4] ring-4 ring-[#6750a4]/30 shadow-lg' : 'border-[#e7e0ec] hover:shadow-[0_20px_40px_-12px_rgba(103,80,164,0.12)] hover:border-[#d0bcff] hover:-translate-y-1'}`}
      >
        {/* Image Area */}
        <div className="aspect-[4/3] bg-[#f5f5f5] relative overflow-hidden">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
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
        <div className="p-4">
          <div className="mb-3">
            <div className="flex justify-between items-start mb-1">
              <p className="text-xs font-bold text-[#6750a4] uppercase tracking-wide">
                {getCategoryName(item.category)}
              </p>
              {item.price > 0 && (
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`font-bold text-lg ${isPurchased ? 'text-[#49454f] line-through decoration-[#b3261e]/50' : 'text-[#1d192b]'}`}
                  >
                    ₪{item.price.toLocaleString()}
                  </span>
                  <PriceStatusBadge
                    originalPrice={item.price}
                    lastCheckedPrice={item.last_checked_price}
                    lastPriceCheck={item.last_price_check}
                  />
                </div>
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

            {item.notes && (
              <p className="text-sm text-[#49454f] mt-2 italic line-clamp-2">
                {item.notes}
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
                className={`h-full rounded-full animate-progress-fill ${isPurchased ? 'bg-green-500' : 'bg-[#6750a4]'}`}
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
    <div className="min-h-screen bg-[#fffbff] font-sans text-[#1d192b] relative" dir="rtl">
      {/* Address Modal */}
      {registry && (
        <AddressModal
          isOpen={showAddressModal}
          onClose={handleAddressModalClose}
          registryId={registry.id}
          onSave={handleAddressSave}
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
          prefilledData={extensionProductData || undefined}
        />
      )}

      {/* Share Modal */}
      {registry && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          registrySlug={registry.slug}
          ownerName={profile?.first_name || 'משתמש'}
          registryId={registry.id}
          userId={user?.id}
          itemsCount={items.length}
        />
      )}

      {/* Extension Guide Modal */}
      <ExtensionGuideModal
        isOpen={showExtensionGuideModal}
        onClose={() => setShowExtensionGuideModal(false)}
      />

      {/* Engagement popups */}
      {showPostOnboarding && user && (
        <PostOnboardingWizard
          userId={user.id}
          onClose={() => setShowPostOnboarding(false)}
          onAddItem={handleOpenAddModal}
        />
      )}

      {showSharePrompt && user && (
        <SharePromptModal
          userId={user.id}
          onClose={() => setShowSharePrompt(false)}
          onShare={() => setShowShareModal(true)}
        />
      )}

      {showPartnerInvite && user && (
        <PartnerInviteCard
          userId={user.id}
          onClose={() => setShowPartnerInvite(false)}
        />
      )}

      {activeToast && (
        <MilestoneToast
          milestone={activeToast}
          onClose={() => setActiveToast(null)}
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

      {/* Delete Confirmation Modal */}
      {deleteModalItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setDeleteModalItem(null); setDeleteModalPurchaseCount(0); }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-[#ffebee] rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-[#b3261e]" />
            </div>
            <h3 className="text-xl font-bold text-[#1d192b] mb-2 text-center">
              למחוק את הפריט?
            </h3>
            <p className="text-[#49454f] text-sm mb-2 text-center">
              {deleteModalItem.name}
            </p>
            {deleteModalPurchaseCount > 0 ? (
              <p className="text-[#b3261e] text-sm mb-6 text-center bg-[#ffebee] rounded-xl px-4 py-3">
                לפריט זה יש {deleteModalPurchaseCount} רכישות רשומות.
                <br />
                מחיקת הפריט תמחק גם את כל הרכישות.
              </p>
            ) : deleteModalItem.quantity_received > 0 ? (
              <p className="text-[#49454f] text-sm mb-6 text-center">
                הפריט סומן כנרכש ({deleteModalItem.quantity_received} יחידות)
              </p>
            ) : (
              <div className="mb-6" />
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteModalItem(null); setDeleteModalPurchaseCount(0); }}
                className="flex-1 py-3 rounded-xl border border-[#e7e0ec] text-[#49454f] font-medium hover:bg-gray-50 transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={confirmDeleteItem}
                className="flex-1 py-3 rounded-xl bg-[#b3261e] text-white font-bold hover:bg-[#8c1d18] transition-colors"
              >
                מחק
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unmark Guest Purchase Confirmation Modal */}
      {unmarkModalItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setUnmarkModalItem(null); setUnmarkModalGuestCount(0); }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-[#fff3e0] rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-7 h-7 text-[#e65100]" />
            </div>
            <h3 className="text-xl font-bold text-[#1d192b] mb-2 text-center">
              שימי לב!
            </h3>
            <p className="text-[#49454f] text-sm mb-2 text-center">
              {unmarkModalItem.name}
            </p>
            <p className="text-[#e65100] text-sm mb-6 text-center bg-[#fff3e0] rounded-xl px-4 py-3">
              {unmarkModalGuestCount === 1
                ? 'משתמש אחד כבר סימן שקנה את הפריט הזה.'
                : `${unmarkModalGuestCount} משתמשים כבר סימנו שקנו את הפריט הזה.`
              }
              <br />
              האם את בטוחה שברצונך לסמן כלא נרכש?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => { setUnmarkModalItem(null); setUnmarkModalGuestCount(0); }}
                className="flex-1 py-3 rounded-xl border border-[#e7e0ec] text-[#49454f] font-medium hover:bg-gray-50 transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={confirmUnmarkItem}
                className="flex-1 py-3 rounded-xl bg-[#e65100] text-white font-bold hover:bg-[#bf360c] transition-colors"
              >
                כן, סמני כלא נרכש
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Extension Banner */}
        <ExtensionBanner />

        {/* Welcome & Stats Section */}
        <div className="flex flex-col xl:flex-row gap-8 mb-12">
          {/* Welcome Card */}
          <div className="flex-1 bg-[#1d192b] rounded-[32px] p-8 text-white shadow-[0_20px_60px_-15px_rgba(29,25,43,0.4)] relative overflow-hidden group">
            {/* Dynamic flowing aurora background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Deep purple blob */}
              <div className="aurora-blob-1 absolute -top-1/4 -right-1/4 w-[70%] h-[70%] rounded-full bg-[#6750a4]/40 blur-[60px]" />
              {/* Warm violet blob */}
              <div className="aurora-blob-2 absolute -bottom-1/3 -left-1/4 w-[65%] h-[65%] rounded-full bg-[#9c27b0]/25 blur-[70px]" />
              {/* Cool indigo blob */}
              <div className="aurora-blob-3 absolute top-1/4 left-1/3 w-[50%] h-[50%] rounded-full bg-[#3f51b5]/20 blur-[50px]" />
              {/* Soft lavender accent */}
              <div className="aurora-blob-4 absolute -bottom-1/4 right-1/4 w-[45%] h-[45%] rounded-full bg-[#d0bcff]/15 blur-[55px]" />
              {/* Subtle base gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#1d192b]/30 to-[#49454f]/20" />
            </div>
            {/* Faded icons inside welcome card */}
            <FadedIconsBackground count={18} className="opacity-30" />

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[#d0bcff]" />
                  </div>
                  <h1 className="text-3xl font-bold">היי, {profile?.first_name || 'משתמש'}!</h1>
                </div>
                <p className="text-[#eaddff] text-lg max-w-md font-medium leading-relaxed">
                  הרשימה שלך מוכנה. זה הזמן לשתף אותה עם האנשים שאת אוהבת ולהתחיל להתארגן ברוגע.
                </p>
                {registry?.partner_id && partnerName && (
                  <div className="flex items-center gap-2 mt-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 w-fit">
                    <Users className="w-4 h-4 text-[#d0bcff]" />
                    <span className="text-sm text-[#eaddff]">
                      רשימה משותפת עם {partnerName}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5 mt-8">
                <button
                  data-tutorial="add-item-button"
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-1.5 bg-[#d0bcff] text-[#381e72] px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#e8def8] hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  הוסף פריט
                </button>
                {registry && (
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-1.5 bg-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-white/30 hover:-translate-y-0.5 transition-all backdrop-blur-sm border border-white/30 active:scale-95 shadow-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    שתף
                  </button>
                )}
                <Link to="/checklist">
                  <button className="flex items-center gap-1.5 bg-white/8 text-white/80 px-4 py-2.5 rounded-full text-sm font-medium hover:bg-white/15 hover:-translate-y-0.5 transition-all backdrop-blur-sm border border-white/10 active:scale-95">
                    <ClipboardList className="w-4 h-4" />
                    צ'קליסט
                  </button>
                </Link>
                {registry && (
                  <Link to={`/registry/${registry.slug}`}>
                    <button className="flex items-center gap-1.5 bg-white/8 text-white/80 px-4 py-2.5 rounded-full text-sm font-medium hover:bg-white/15 hover:-translate-y-0.5 transition-all backdrop-blur-sm border border-white/10 active:scale-95">
                      <Eye className="w-4 h-4" />
                      צפה כאורח
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div data-tutorial="dashboard-stats" className="flex flex-col sm:flex-row gap-4 xl:w-auto">
            <div className="bg-[#f3edff] rounded-[32px] p-6 flex flex-col justify-between min-w-[240px] border border-[#eaddff] relative overflow-hidden hover:shadow-[0_20px_40px_-12px_rgba(103,80,164,0.15)] hover:-translate-y-1 transition-all duration-300">
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
                    className="h-full bg-[#6750a4] rounded-full animate-progress-fill"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
                <p className="text-sm text-[#49454f] mt-2 font-medium">
                  {totalPurchased} מתוך {totalItems} פריטים נרכשו
                </p>
              </div>
            </div>
            <div className="bg-white rounded-[32px] p-6 flex flex-col justify-between min-w-[200px] border border-[#e7e0ec] shadow-sm hover:shadow-[0_20px_40px_-12px_rgba(103,80,164,0.15)] hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-[#f3edff] p-2 rounded-xl text-[#6750a4]">
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

        {/* Filters & Content — Full-width sticky bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e7e0ec]/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] -mx-4 sm:-mx-6 lg:-mx-8 mb-8">
          {/* Row 1: Title + View toggle */}
          <div className="px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between gap-4">
            <h2 className="text-xl sm:text-3xl font-bold text-[#1d192b] flex items-center gap-3">
              הפריטים שלי
              <span className="text-sm font-bold text-[#6750a4] bg-[#eaddff] px-3 py-1 rounded-full">
                {filteredItems.length}
              </span>
            </h2>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex bg-[#f5f5f5] rounded-xl p-1 gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[#6750a4] shadow-sm' : 'text-[#49454f] hover:bg-white/50'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-[#6750a4] shadow-sm' : 'text-[#49454f] hover:bg-white/50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Search + Filters */}
          <div className="px-4 sm:px-6 pb-3">
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
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'purchased')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  statusFilter !== 'all'
                    ? 'bg-[#6750a4] text-white border-[#6750a4]'
                    : 'bg-[#f5f5f5] text-[#49454f] border-transparent hover:bg-[#e7e0ec]'
                }`}
              >
                <option value="all">הכל</option>
                <option value="active">טרם נרכש</option>
                <option value="purchased">נרכש</option>
              </select>

              {/* Price filter */}
              <select
                value={filterPriceRange}
                onChange={(e) => setFilterPriceRange(e.target.value as typeof filterPriceRange)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer hidden sm:block ${
                  filterPriceRange !== 'all'
                    ? 'bg-[#6750a4] text-white border-[#6750a4]'
                    : 'bg-[#f5f5f5] text-[#49454f] border-transparent hover:bg-[#e7e0ec]'
                }`}
              >
                <option value="all">מחיר</option>
                <option value="0-200">עד 200 ₪</option>
                <option value="200-500">200-500 ₪</option>
                <option value="500-1000">500-1,000 ₪</option>
                <option value="1000+">1,000+ ₪</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'category')}
                className="py-2 px-3 rounded-xl text-xs font-medium border border-transparent bg-[#f5f5f5] text-[#49454f] hover:bg-[#e7e0ec] transition-all cursor-pointer hidden sm:block"
              >
                <option value="date">תאריך</option>
                <option value="price">מחיר</option>
                <option value="category">קטגוריה</option>
              </select>

              {/* Most Wanted Toggle */}
              <button
                onClick={() => setFilterMostWanted(!filterMostWanted)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  filterMostWanted
                    ? 'bg-[#b3261e] text-white border-[#b3261e]'
                    : 'bg-[#f5f5f5] text-[#49454f] border-transparent hover:bg-[#ffebee] hover:text-[#b3261e]'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${filterMostWanted ? 'fill-white' : ''}`} />
                <span className="hidden sm:inline">הכי רוצה</span>
              </button>
            </div>

            {/* Active filter indicator */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-[#49454f]">
                  מציג {filteredItems.length} מתוך {items.length} פריטים
                </p>
                <button onClick={clearAllFilters} className="text-xs text-[#6750a4] font-medium hover:underline">
                  נקה סינון
                </button>
              </div>
            )}
          </div>

          {/* Row 3: Category chips — scrollable */}
          {items.length > 0 && (
            <div className="px-4 sm:px-6 pb-3 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-1.5 min-w-max">
                {/* All categories chip */}
                <button
                  onClick={() => setFilterCategory('')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                    !filterCategory
                      ? 'bg-[#6750a4] text-white border-[#6750a4] shadow-sm'
                      : 'border-transparent text-[#49454f] hover:bg-[#f5f5f5]'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>הכל</span>
                </button>

                {CATEGORIES.map(cat => {
                  const catItems = items.filter(i => i.category === cat.id)
                  if (catItems.length === 0) return null
                  const isActive = filterCategory === cat.id
                  const CategoryIcon = cat.icon
                  const colors = CATEGORY_COLORS[cat.id] || CATEGORY_COLORS.general
                  const purchasedCount = catItems.filter(i => i.quantity_received >= i.quantity).length

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setFilterCategory(isActive ? '' : cat.id as ItemCategory)}
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
                      {purchasedCount === catItems.length && catItems.length > 0 && <Check className="w-3 h-3 text-[#00c875]" />}
                      {purchasedCount < catItems.length && <span className="opacity-60">{catItems.length}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Loading / Empty / Grid */}
        {isLoadingItems ? (
          <div className="bg-white rounded-[32px] border border-[#e7e0ec] p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[#6750a4] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[#49454f] font-medium">טוען פריטים...</p>
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-[32px] border border-[#e7e0ec] p-12 text-center relative overflow-hidden animate-fade-in-up">
            <FadedIconsBackground count={25} className="opacity-50" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-[#f3edff] rounded-[24px] flex items-center justify-center mx-auto mb-6 text-[#6750a4] rotate-3 shadow-lg">
                <Package className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-[#1d192b] mb-3">הרשימה שלכם ריקה</h2>
              <p className="text-[#49454f] mb-8 max-w-md mx-auto leading-relaxed">
                זה הזמן למלא את הרשימה! אפשר להוסיף פריטים ידנית או להעזר בצ׳ק ליסט המומלץ שלנו.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-2 bg-[#6750a4] text-white px-8 py-3.5 rounded-[28px] font-bold hover:bg-[#503e85] hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  הוסף פריט ידנית
                </button>
                <Link to="/checklist">
                  <button className="flex items-center gap-2 bg-white border-2 border-[#e7e0ec] text-[#1d192b] px-8 py-3.5 rounded-[28px] font-bold hover:border-[#6750a4] hover:text-[#6750a4] hover:-translate-y-0.5 transition-all active:scale-95">
                    <ClipboardList className="w-5 h-5" />
                    בחרי מהצ'קליסט
                  </button>
                </Link>
              </div>
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
              const colors = CATEGORY_COLORS[category.id] || CATEGORY_COLORS.general

              return (
                <div key={category.id}>
                  {/* Category Header — colored like Checklist */}
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="flex items-center gap-3 rounded-2xl py-2 px-3 pr-4"
                      style={{ backgroundColor: colors.bg + '60' }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        <CategoryIcon className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-[#1d192b]">{category.name}</h3>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent ml-4" style={{ backgroundColor: colors.border + '30' }} />
                    <span
                      className="text-sm font-medium px-3 py-1 rounded-full border"
                      style={{ color: colors.text, backgroundColor: colors.bg, borderColor: colors.border + '30' }}
                    >
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
              <div className="pt-8 border-t-2 border-dashed border-[#e7e0ec] mt-12 bg-gradient-to-b from-green-50/30 to-transparent rounded-[32px] px-4 -mx-4 pb-4">
                <div className="flex items-center gap-3 mb-8 opacity-80">
                  <div className="flex items-center gap-3 bg-gradient-to-l from-transparent to-green-50/60 rounded-2xl py-2 px-3 pr-4">
                    <div className="p-2.5 rounded-xl bg-green-100 text-green-700 shadow-md">
                      <Check className="w-5 h-5" strokeWidth={3} />
                    </div>
                    <h3 className="text-xl font-bold text-[#1d192b]">נרכשו כבר</h3>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#e7e0ec] ml-4" />
                  <span className="text-sm font-medium text-green-700 bg-green-50 border border-green-100 px-3 py-1 rounded-full">
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
