import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Calendar,
  Gift,
  ArrowRight,
  Check,
  Star,
  EyeOff,
  Package,
  ShoppingCart,
  Heart,
  Sparkles,
  LayoutGrid,
  List,
  Banknote,
  ChevronDown,
} from 'lucide-react'
import type { Registry, Profile, Item, ItemCategory } from '../types'
import { getDaysUntilDueDate } from '../lib/utils'
import PurchaseModal from '../components/PurchaseModal'
import { remainingQuantity, isPurchased } from '../types'
import { CATEGORIES } from '../data/categories'

interface RegistryWithOwner extends Registry {
  profiles: Pick<Profile, 'first_name' | 'last_name' | 'due_date' | 'email'>
}

type ViewMode = 'grid' | 'list'

export default function PublicRegistry() {
  const { slug } = useParams<{ slug: string }>()
  const [registry, setRegistry] = useState<RegistryWithOwner | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [filterCategory, setFilterCategory] = useState<ItemCategory | ''>('')
  const [filterMostWanted, setFilterMostWanted] = useState(false)
  const [filterPriceRange, setFilterPriceRange] = useState<'all' | '0-200' | '200-500' | '500-1000' | '1000+'>('all')
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const priceRangeOptions = [
    { value: 'all' as const, label: 'כל המחירים' },
    { value: '0-200' as const, label: 'עד ₪200' },
    { value: '200-500' as const, label: '₪200-500' },
    { value: '500-1000' as const, label: '₪500-1000' },
    { value: '1000+' as const, label: '₪1000+' },
  ]

  const selectedPriceLabel = priceRangeOptions.find(opt => opt.value === filterPriceRange)?.label || 'כל המחירים'

  // Filter and separate items into available and purchased
  const filteredItems = useMemo(() => {
    let result = items
    if (filterCategory) {
      result = result.filter(item => item.category === filterCategory)
    }
    if (filterMostWanted) {
      result = result.filter(item => item.is_most_wanted)
    }
    if (filterPriceRange !== 'all') {
      result = result.filter(item => {
        switch (filterPriceRange) {
          case '0-200': return item.price >= 0 && item.price <= 200
          case '200-500': return item.price > 200 && item.price <= 500
          case '500-1000': return item.price > 500 && item.price <= 1000
          case '1000+': return item.price > 1000
          default: return true
        }
      })
    }
    return result
  }, [items, filterCategory, filterMostWanted, filterPriceRange])

  const availableItems = useMemo(() =>
    filteredItems.filter((item) => !isPurchased(item)),
    [filteredItems]
  )

  const purchasedItems = useMemo(() =>
    filteredItems.filter((item) => isPurchased(item)),
    [filteredItems]
  )

  // Get unique categories from items for the filter
  const availableCategories = useMemo(() => {
    const categoryIds = [...new Set(items.map(item => item.category))]
    return CATEGORIES.filter(cat => categoryIds.includes(cat.id as ItemCategory))
  }, [items])

  useEffect(() => {
    const fetchRegistry = async () => {
      if (!slug) return

      setIsLoading(true)
      setError(null)

      // Fetch registry with owner profile
      const { data: registryData, error: registryError } = await supabase
        .from('registries')
        .select(`
          *,
          profiles!owner_id (first_name, last_name, due_date, email)
        `)
        .eq('slug', slug)
        .single()

      if (registryError || !registryData) {
        setError('הרשימה לא נמצאה')
        setIsLoading(false)
        return
      }

      setRegistry(registryData as RegistryWithOwner)

      // Fetch public items
      const { data: itemsData } = await supabase
        .from('items')
        .select('*')
        .eq('registry_id', registryData.id)
        .eq('is_private', false)
        .order('is_most_wanted', { ascending: false })
        .order('created_at', { ascending: false })

      setItems(itemsData || [])
      setIsLoading(false)
    }

    fetchRegistry()
  }, [slug])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffbff]" dir="rtl">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#6750a4] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[#49454f] font-medium">טוען רשימה...</p>
        </div>
      </div>
    )
  }

  if (error || !registry) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffbff]" dir="rtl">
        <div className="bg-white rounded-[32px] border border-[#e7e0ec] shadow-xl max-w-md mx-4 p-8 text-center">
          <div className="w-20 h-20 bg-[#ffebee] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Gift className="w-10 h-10 text-[#b3261e]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1d192b] mb-2">
            הרשימה לא נמצאה
          </h1>
          <p className="text-[#49454f] mb-6">
            ייתכן שהקישור שגוי או שהרשימה הוסרה.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#6750a4] text-white px-6 py-3 rounded-full font-bold hover:bg-[#503e85] transition-all shadow-md"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    )
  }

  // Check if registry is private
  if (registry.is_public === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffbff]" dir="rtl">
        <div className="bg-white rounded-[32px] border border-[#e7e0ec] shadow-xl max-w-md mx-4 p-8 text-center">
          <div className="w-20 h-20 bg-[#f5f5f5] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <EyeOff className="w-10 h-10 text-[#49454f]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1d192b] mb-2">
            רשימה פרטית
          </h1>
          <p className="text-[#49454f] mb-6">
            הרשימה הזו מוגדרת כפרטית ואינה זמינה לצפייה.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#6750a4] text-white px-6 py-3 rounded-full font-bold hover:bg-[#503e85] transition-all shadow-md"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    )
  }

  const owner = registry.profiles
  const daysUntilDue = owner.due_date ? getDaysUntilDueDate(owner.due_date) : null

  const handlePurchaseClick = (item: Item) => {
    setSelectedItem(item)
    setIsPurchaseModalOpen(true)
  }

  const handlePurchaseSuccess = () => {
    // Refresh items to get updated quantities
    if (registry) {
      supabase
        .from('items')
        .select('*')
        .eq('registry_id', registry.id)
        .eq('is_private', false)
        .order('is_most_wanted', { ascending: false })
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) setItems(data)
        })
    }
  }

  return (
    <div className="min-h-screen bg-[#fffbff] font-sans text-[#1d192b]" dir="rtl">
      {/* Sticky Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#e7e0ec] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/Nesty_logo.png" alt="Nesty" className="h-10 w-auto" />
          </Link>
          <Link
            to="/"
            className="px-4 py-2 rounded-xl text-[#49454f] font-bold text-sm hover:bg-[#f3edff] hover:text-[#6750a4] transition-all"
          >
            צור רשימה משלך
          </Link>
        </div>
      </header>

      {/* Fun Hero Section with Gradient */}
      <div className="relative overflow-hidden">
        {/* The Fun Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF9A9E] via-[#FECFEF] to-[#E0C3FC] opacity-90" />

        {/* Decorative Shapes */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/30 rounded-full blur-3xl mix-blend-overlay" />
        <div className="absolute bottom-[-20px] left-[-20px] w-48 h-48 bg-[#fffbff]/40 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-md rounded-full px-5 py-1.5 text-[#1d192b] font-bold text-sm mb-6 shadow-sm border border-white/50">
            <span className="text-xl">👶</span> חוגגים את התינוק שבדרך!
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1d192b] mb-6 tracking-tight drop-shadow-sm leading-[1.1]">
            הרשימה של {owner.first_name} {owner.last_name}
          </h1>

          {daysUntilDue !== null && daysUntilDue > 0 && (
            <div className="inline-flex items-center justify-center gap-2 text-[#1d192b] font-bold text-lg bg-white/60 backdrop-blur-md px-8 py-3 rounded-2xl shadow-sm border border-white/50">
              <Calendar className="w-5 h-5 text-[#6750a4]" />
              <span>עוד {daysUntilDue} ימים עד התאריך המשוער</span>
            </div>
          )}
        </div>
      </div>

      {/* Welcome Message Card */}
      {registry.welcome_message && (
        <div className="max-w-3xl mx-auto px-6 -mt-10 relative z-20">
          <div className="bg-white rounded-[32px] shadow-xl shadow-[#6750a4]/10 border border-[#e7e0ec] p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FF9A9E] to-[#E0C3FC]" />
            <div className="w-16 h-16 bg-[#fff0f5] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#b3261e] rotate-3 shadow-sm">
              <Heart className="w-8 h-8 fill-current" />
            </div>
            <p className="text-xl text-[#1d192b] font-medium whitespace-pre-wrap leading-relaxed">
              "{registry.welcome_message}"
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {items.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-[#e7e0ec] p-16 text-center">
            <div className="w-24 h-24 bg-[#f5f5f5] rounded-full flex items-center justify-center mx-auto mb-6 text-[#49454f]">
              <Gift className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-[#1d192b] mb-3">
              עוד לא נוספו פריטים
            </h2>
            <p className="text-[#49454f]">בקרוב יתווספו פריטים לרשימה הזו</p>
          </div>
        ) : (
          <>
            {/* Filters and View Toggle */}
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              {/* View Mode Toggle */}
              <div className="flex bg-white rounded-xl border border-[#e7e0ec] p-1 gap-1 w-fit mx-auto md:mx-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#f3edff] text-[#6750a4] shadow-sm' : 'text-[#49454f] hover:bg-[#f5f5f5]'}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#f3edff] text-[#6750a4] shadow-sm' : 'text-[#49454f] hover:bg-[#f5f5f5]'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filters */}
              {availableCategories.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 justify-center">
                  <button
                    onClick={() => { setFilterCategory(''); setFilterMostWanted(false); setFilterPriceRange('all'); }}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                      filterCategory === '' && !filterMostWanted && filterPriceRange === 'all'
                        ? 'bg-[#1d192b] text-white shadow-lg scale-105'
                        : 'bg-white border border-[#e7e0ec] text-[#49454f] hover:bg-[#f3edff] hover:scale-105'
                    }`}
                  >
                    הכל ({items.length})
                  </button>
                  <button
                    onClick={() => setFilterMostWanted(!filterMostWanted)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                      filterMostWanted
                        ? 'bg-[#b3261e] text-white shadow-lg scale-105 border border-[#b3261e]'
                        : 'bg-white border border-[#e7e0ec] text-[#49454f] hover:border-[#b3261e] hover:text-[#b3261e]'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${filterMostWanted ? 'fill-current' : ''}`} />
                    הכי רוצה
                  </button>
                  {availableCategories.map((category) => {
                    const count = items.filter(item => item.category === category.id).length
                    return (
                      <button
                        key={category.id}
                        onClick={() => setFilterCategory(category.id as ItemCategory)}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                          filterCategory === category.id
                            ? 'bg-[#6750a4] text-white shadow-lg scale-105'
                            : 'bg-white border border-[#e7e0ec] text-[#49454f] hover:bg-[#f3edff] hover:scale-105'
                        }`}
                      >
                        {category.name} <span className="opacity-60 text-xs mr-1">({count})</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Price Filter Dropdown */}
              <div className="relative flex items-center gap-2 justify-center md:justify-start">
                <div className="flex items-center gap-2 text-[#49454f]">
                  <Banknote className="w-4 h-4" />
                  <span className="text-sm font-medium">טווח מחיר:</span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 min-w-[140px] justify-between ${
                      filterPriceRange !== 'all'
                        ? 'bg-[#33691e] text-white shadow-lg'
                        : 'bg-white border border-[#e7e0ec] text-[#49454f] hover:bg-[#f3edff]'
                    }`}
                  >
                    <span>{selectedPriceLabel}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isPriceDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isPriceDropdownOpen && (
                    <>
                      {/* Backdrop to close dropdown */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsPriceDropdownOpen(false)}
                      />
                      {/* Dropdown menu */}
                      <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-[#e7e0ec] overflow-hidden z-20 min-w-[160px]">
                        {priceRangeOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setFilterPriceRange(option.value)
                              setIsPriceDropdownOpen(false)
                            }}
                            className={`w-full px-4 py-3 text-sm text-right transition-colors ${
                              filterPriceRange === option.value
                                ? 'bg-[#f1f8e9] text-[#33691e] font-bold'
                                : 'text-[#49454f] hover:bg-[#f3edff]'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-16">
              {/* Available Items */}
              {availableItems.length > 0 && (
                <div>
                  {/* Group by category if no category selected */}
                  {!filterCategory && !filterMostWanted ? (
                    CATEGORIES.map(category => {
                      const categoryItems = availableItems.filter(i => i.category === category.id)
                      if (categoryItems.length === 0) return null
                      const CategoryIcon = category.icon

                      return (
                        <div key={category.id} className="mb-12">
                          <div className="flex items-center gap-3 mb-6">
                            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${category.color} text-white shadow-sm`}>
                              <CategoryIcon className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#1d192b]">
                              {category.name}
                            </h2>
                            <span className="text-sm font-medium bg-white border border-[#e7e0ec] px-3 py-1 rounded-full text-[#49454f]">
                              {categoryItems.length}
                            </span>
                          </div>
                          <div className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                            {categoryItems.map((item) => (
                              <ItemCard
                                key={item.id}
                                item={item}
                                viewMode={viewMode}
                                onPurchaseClick={handlePurchaseClick}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                      {availableItems.map((item) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          viewMode={viewMode}
                          onPurchaseClick={handlePurchaseClick}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Purchased Items */}
              {purchasedItems.length > 0 && (
                <div className="pt-12 border-t-2 border-dashed border-[#e7e0ec] relative">
                  <div className="absolute top-[-16px] left-1/2 -translate-x-1/2 bg-[#fffbff] px-4 text-[#49454f] text-sm font-medium flex items-center gap-2">
                    <Check className="w-4 h-4" /> כל הכבוד! הפריטים האלו כבר נרכשו
                  </div>

                  <div className="flex items-center gap-3 mb-8 opacity-60">
                    <div className="bg-green-100 p-3 rounded-2xl text-green-700">
                      <Check className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold text-[#1d192b]">
                      נרכשו כבר ({purchasedItems.length})
                    </h2>
                  </div>

                  <div className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                    {purchasedItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        viewMode={viewMode}
                        onPurchaseClick={handlePurchaseClick}
                        isPurchased
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => {
          setIsPurchaseModalOpen(false)
          setSelectedItem(null)
        }}
        item={selectedItem}
        onSuccess={handlePurchaseSuccess}
        ownerInfo={registry ? {
          name: `${owner.first_name} ${owner.last_name}`,
          email: owner.email
        } : undefined}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-[#e7e0ec] py-16 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#f3edff] rounded-[20px] flex items-center justify-center text-[#6750a4]">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          <h3 className="font-bold text-2xl text-[#1d192b] mb-3">רוצים גם רשימה כזו?</h3>
          <p className="text-[#49454f] mb-8 max-w-sm mx-auto text-lg">
            פתחו רשימת מתנות חכמה, מעוצבת וחינמית לגמרי עם Nesty.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 border-2 border-[#6750a4] text-[#6750a4] px-10 py-4 rounded-2xl font-black text-lg hover:bg-[#f3edff] hover:scale-105 transition-all shadow-lg"
          >
            התחילו בחינם
          </Link>
          <p className="text-[#49454f]/40 text-sm mt-12">
            © 2024 Nesty - לבנות את הקן שלכם, חכם יותר.
          </p>
        </div>
      </footer>
    </div>
  )
}

// Item Card Component
function ItemCard({
  item,
  viewMode,
  onPurchaseClick,
  isPurchased: isItemPurchased = false,
}: {
  item: Item
  viewMode: ViewMode
  onPurchaseClick: (item: Item) => void
  isPurchased?: boolean
}) {
  const remaining = remainingQuantity(item)
  const category = CATEGORIES.find(c => c.id === item.category)
  const CategoryIcon = category?.icon || Package

  // List View
  if (viewMode === 'list') {
    return (
      <div className={`bg-white rounded-[24px] border border-[#e7e0ec] overflow-hidden group hover:border-[#d0bcff] transition-all duration-300 flex ${isItemPurchased ? 'opacity-70 grayscale' : ''}`}>
        <div className="w-32 sm:w-48 aspect-square flex-shrink-0 bg-[#f5f5f5] relative">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className={`w-12 h-12 rounded-[12px] bg-gradient-to-br ${category?.color || 'from-gray-300 to-gray-400'} flex items-center justify-center text-white`}>
                <CategoryIcon className="w-6 h-6" />
              </div>
            </div>
          )}
          {item.is_most_wanted && !isItemPurchased && (
            <div className="absolute top-2 left-2 bg-[#b3261e] text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
            </div>
          )}
        </div>

        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg leading-tight text-[#1d192b] mb-1">{item.name}</h3>
                <p className="text-xs font-bold text-[#6750a4] uppercase">{category?.name}</p>
              </div>
              {item.price > 0 && (
                <span className="font-bold text-[#1d192b] text-lg">₪{item.price.toLocaleString()}</span>
              )}
            </div>
          </div>

          {!isItemPurchased && (
            <div className="flex justify-end mt-2">
              <button
                onClick={() => onPurchaseClick(item)}
                className="flex items-center gap-2 bg-[#6750a4] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#503e85] transition-all shadow-sm active:scale-95"
              >
                <Gift className="w-4 h-4" /> קנה מתנה
              </button>
            </div>
          )}
          {isItemPurchased && (
            <div className="flex justify-end mt-2">
              <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> נרכש
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Grid View
  return (
    <div
      className={`bg-white rounded-[32px] rounded-tr-[4px] border border-[#e7e0ec] overflow-hidden group hover:shadow-[0_20px_40px_-15px_rgba(103,80,164,0.15)] hover:border-[#d0bcff] hover:-translate-y-1 transition-all duration-300 flex flex-col ${isItemPurchased ? 'opacity-70 grayscale' : ''}`}
    >
      {/* Image Area */}
      <div className="aspect-[4/3] bg-[#f5f5f5] relative overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
            <div className={`w-20 h-20 rounded-[20px] bg-gradient-to-br ${category?.color || 'from-gray-300 to-gray-400'} flex items-center justify-center text-white shadow-sm`}>
              <CategoryIcon className="w-10 h-10" />
            </div>
          </div>
        )}

        {/* Most Wanted Badge */}
        {item.is_most_wanted && !isItemPurchased && (
          <div className="absolute top-4 right-4 bg-[#b3261e] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg z-10">
            <Star className="w-3 h-3 fill-current" />
            <span>הכי רוצה!</span>
          </div>
        )}

        {/* Quantity Badge */}
        {!isItemPurchased && item.quantity > 1 && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-[#1d192b] text-xs px-3 py-1.5 rounded-full font-bold shadow-sm border border-white/50">
            נותרו {remaining} מתוך {item.quantity}
          </div>
        )}

        {isItemPurchased && (
          <div className="absolute inset-0 bg-green-900/10 flex items-center justify-center backdrop-blur-[1px]">
            <div className="bg-green-600 text-white rounded-full px-4 py-2 font-bold flex items-center gap-2 shadow-lg transform -rotate-3">
              <Check className="w-5 h-5" strokeWidth={3} />
              נרכש!
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4 flex-1">
          <p className="text-xs font-bold text-[#6750a4] uppercase mb-2 tracking-wide">
            {category?.name}
          </p>
          <h3 className="font-bold text-[#1d192b] text-xl leading-snug mb-3 line-clamp-2">
            {item.name}
          </h3>
          {item.store_name && item.store_name !== 'ידני' && (
            <p className="text-sm text-[#49454f] flex items-center gap-2 bg-[#f5f5f5] px-3 py-1.5 rounded-lg w-fit">
              <ShoppingCart className="w-3 h-3" />
              {item.store_name}
            </p>
          )}
        </div>

        {!isItemPurchased && (
          <div className="mt-auto pt-4 border-t border-[#e7e0ec]/50">
            <div className="flex justify-between items-end gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-[#49454f]">מחיר משוער</span>
                {item.price > 0 ? (
                  <span className="font-bold text-[#1d192b] text-2xl">
                    ₪{item.price.toLocaleString()}
                  </span>
                ) : (
                  <span className="font-bold text-[#1d192b]">לא צוין</span>
                )}
              </div>

              <button
                onClick={() => onPurchaseClick(item)}
                className="flex items-center gap-2 bg-[#6750a4] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#503e85] transition-all shadow-lg shadow-[#6750a4]/20 active:scale-95"
              >
                <Gift className="w-5 h-5" />
                קנה מתנה
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
