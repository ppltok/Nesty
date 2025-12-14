import React, { useState, useEffect, useMemo } from 'react'
import { Share2, Plus, Eye, Check, Star, ExternalLink, Trash2, ShoppingCart, ClipboardList, Filter, ArrowUpDown, Pencil, Sparkles, Gift, Package, Home, X, Banknote, LayoutGrid, List } from 'lucide-react'

// --- Types ---
type ItemCategory = 'nursery' | 'travel' | 'clothing' | 'bath' | 'feeding'

interface Item {
  id: string
  registry_id: string
  name: string
  category: string
  price: number
  quantity: number
  quantity_received: number
  image_url?: string
  original_url?: string
  store_name?: string
  is_most_wanted: boolean
  is_private: boolean
  created_at: string
}

// --- Mock Data ---
const CATEGORIES = [
  { id: 'nursery', name: 'חדר תינוק', icon: Home, color: 'from-blue-400 to-blue-600' },
  { id: 'travel', name: 'טיולים', icon: Package, color: 'from-green-400 to-green-600' },
  { id: 'clothing', name: 'ביגוד', icon: Gift, color: 'from-purple-400 to-purple-600' },
  { id: 'bath', name: 'אמבטיה', icon: Sparkles, color: 'from-cyan-400 to-cyan-600' },
  { id: 'feeding', name: 'הנקה והאכלה', icon: ShoppingCart, color: 'from-orange-400 to-orange-600' }
]

const MOCK_ITEMS: Item[] = [
  {
    id: '1',
    registry_id: 'reg_123',
    name: 'עגלת תינוק בוגבו דרגונפליי',
    category: 'travel',
    price: 4500,
    quantity: 1,
    quantity_received: 1,
    store_name: 'שילב',
    is_most_wanted: true,
    is_private: false,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    registry_id: 'reg_123',
    name: 'שידת החתלה רחבה',
    category: 'nursery',
    price: 1200,
    quantity: 1,
    quantity_received: 0,
    store_name: 'איקאה',
    is_most_wanted: false,
    is_private: false,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    registry_id: 'reg_123',
    name: 'מארז בגדי גוף (6 יח׳)',
    category: 'clothing',
    price: 150,
    quantity: 2,
    quantity_received: 1,
    store_name: 'Next',
    is_most_wanted: false,
    is_private: false,
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
]

// --- Mock Components ---
const Button = ({ children, onClick, className, variant = 'primary', size = 'md' }: any) => {
  const baseStyle = "flex items-center justify-center rounded-full font-medium transition-all active:scale-95 disabled:opacity-50"
  const variants = {
    primary: "bg-[#6750a4] text-white hover:bg-[#503e85] shadow-sm",
    outline: "border-2 border-[#e7e0ec] text-[#1d192b] hover:border-[#6750a4] hover:text-[#6750a4] bg-transparent",
    ghost: "text-[#49454f] hover:bg-[#f3edff] hover:text-[#6750a4]",
    destructive: "text-red-600 hover:bg-red-50",
  }
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  }
  
  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${sizes[size as keyof typeof sizes]} ${className || ''}`}
    >
      {children}
    </button>
  )
}

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[28px] w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#1d192b]">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// Simple Mock Implementations of the missing Modals
const AddressModal = (props: any) => <Modal title="כתובת למשלוח" {...props}><p>טופס כתובת כאן...</p></Modal>
const AddItemModal = (props: any) => <Modal title={props.editItem ? "עריכת פריט" : "הוספת פריט"} {...props}><p>טופס הוספת פריט...</p><div className="flex justify-end gap-2 mt-4"><Button variant="ghost" onClick={props.onClose}>ביטול</Button><Button onClick={props.onSave}>שמור</Button></div></Modal>
const ShareModal = (props: any) => <Modal title="שיתוף רשימה" {...props}><p>אפשרויות שיתוף...</p></Modal>

// --- Main Component ---
export default function Dashboard() {
  // Mock Auth Hook
  const profile = { first_name: 'דני' }
  const registry = { id: 'reg_123', slug: 'dani-registry', address_city: '', address_street: '' }
  const refreshProfile = () => {}

  // State
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(true)

  // Filter and sort state
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterMostWanted, setFilterMostWanted] = useState(false)
  const [filterPriceRange, setFilterPriceRange] = useState<'all' | '0-200' | '200-500' | '500-1000' | '1000+'>('all')
  const [sortBy, setSortBy] = useState<'price' | 'category'>('price')
  
  // View Mode State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Simulate Fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setItems(MOCK_ITEMS)
      setIsLoadingItems(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Show address modal simulation
  useEffect(() => {
    if (registry && !registry.address_city) {
      // Intentionally commented out for better UX in demo
      // setShowAddressModal(true) 
    }
  }, [registry])

  const handleAddressSave = () => {
    refreshProfile()
    setShowAddressModal(false)
  }

  const handleItemSave = () => {
    // Mock save
    setShowAddItemModal(false)
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
    if (!window.confirm('האם למחוק את הפריט?')) return
    setItems(prev => prev.filter(item => item.id !== itemId))
  }

  const handleMarkPurchased = async (itemId: string, currentReceived: number, quantity: number) => {
    const newReceived = currentReceived >= quantity ? 0 : quantity
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity_received: newReceived } : item
    ))
  }

  const filteredItems = useMemo(() => {
    let result = [...items]
    
    // Category Filter
    if (filterCategory) {
      result = result.filter(i => i.category === filterCategory)
    }

    // Most Wanted Filter
    if (filterMostWanted) {
      result = result.filter(i => i.is_most_wanted)
    }

    // Price Range Filter
    if (filterPriceRange !== 'all') {
      switch (filterPriceRange) {
        case '0-200': result = result.filter(i => i.price >= 0 && i.price <= 200); break;
        case '200-500': result = result.filter(i => i.price > 200 && i.price <= 500); break;
        case '500-1000': result = result.filter(i => i.price > 500 && i.price <= 1000); break;
        case '1000+': result = result.filter(i => i.price > 1000); break;
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
    }
    return result
  }, [items, filterCategory, filterMostWanted, filterPriceRange, sortBy])

  // Split items into Active and Purchased
  const { activeItems, purchasedItems } = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      const isPurchased = item.quantity_received >= item.quantity
      if (isPurchased) {
        acc.purchasedItems.push(item)
      } else {
        acc.activeItems.push(item)
      }
      return acc
    }, { activeItems: [] as Item[], purchasedItems: [] as Item[] })
  }, [filteredItems])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPurchased = items.reduce((sum, item) => sum + item.quantity_received, 0)
  const completionPercent = totalItems > 0 ? Math.round((totalPurchased / totalItems) * 100) : 0

  const getCategoryName = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.name || categoryId
  }

  // Helper component for rendering an item card
  const ItemCard = ({ item }: { item: Item }) => {
    const category = CATEGORIES.find((c) => c.id === item.category)
    const isPurchased = item.quantity_received >= item.quantity

    if (viewMode === 'list') {
      return (
        <div className={`bg-white rounded-[20px] border border-[#e7e0ec] overflow-hidden group hover:border-[#d0bcff] transition-all duration-300 flex ${isPurchased ? 'opacity-70' : ''}`}>
          {/* Image */}
          <div className="w-32 sm:w-48 aspect-square flex-shrink-0 bg-[#f5f5f5] relative overflow-hidden">
             {item.image_url ? (
                <img src={item.image_url} alt={item.name} className={`w-full h-full object-cover ${isPurchased ? 'grayscale' : ''}`} />
             ) : (
                <div className="w-full h-full flex items-center justify-center">
                   <div className={`w-12 h-12 rounded-[12px] bg-gradient-to-br ${category?.color || 'from-gray-300 to-gray-400'} flex items-center justify-center text-white`}>
                      {category?.icon ? <category.icon className="w-6 h-6" /> : <Package className="w-6 h-6" />}
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
                    <h3 className={`font-bold text-lg leading-tight ${isPurchased ? 'text-[#49454f]' : 'text-[#1d192b]'}`}>{item.name}</h3>
                    <p className="text-xs font-bold text-[#6750a4] uppercase mt-1">{getCategoryName(item.category)}</p>
                  </div>
                  {item.price > 0 && (
                    <span className={`font-bold font-numeric text-lg ${isPurchased ? 'text-[#49454f] line-through' : 'text-[#1d192b]'}`}>
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
                        <div className={`h-full rounded-full ${isPurchased ? 'bg-green-500' : 'bg-[#6750a4]'}`} style={{ width: `${(item.quantity_received / item.quantity) * 100}%` }} />
                      </div>
                   </div>
                   <div className="flex gap-2 mt-2">
                      <button onClick={() => handleMarkPurchased(item.id, item.quantity_received, item.quantity)} className={`p-2 rounded-lg text-xs font-bold transition-colors ${isPurchased ? 'bg-green-100 text-green-700' : 'bg-[#1d192b] text-white'}`}>
                        {isPurchased ? 'בטל רכישה' : 'סמן כנרכש'}
                      </button>
                      <div className="flex gap-1">
                         <button onClick={() => handleOpenEditModal(item)} className="p-2 rounded-lg bg-gray-100 text-[#49454f] hover:text-[#6750a4]"><Pencil className="w-4 h-4" /></button>
                         <button onClick={() => handleDeleteItem(item.id)} className="p-2 rounded-lg bg-gray-100 text-[#49454f] hover:text-[#b3261e]"><Trash2 className="w-4 h-4" /></button>
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
        className={`bg-white rounded-[24px] border border-[#e7e0ec] overflow-hidden group hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-[#d0bcff] transition-all duration-300 ${
          isPurchased ? 'opacity-80' : ''
        }`}
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
                <div className={`w-20 h-20 rounded-[20px] bg-gradient-to-br ${category?.color || 'from-gray-300 to-gray-400'} flex items-center justify-center text-white shadow-sm ${isPurchased ? 'grayscale' : ''}`}>
                  {category?.icon ? <category.icon className="w-10 h-10" /> : <Package className="w-10 h-10" />}
                </div>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {item.is_most_wanted && !isPurchased && (
              <div className="bg-[#b3261e] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm animate-pulse-slow">
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
                <span className={`font-bold font-numeric text-lg ${isPurchased ? 'text-[#49454f] line-through decoration-[#b3261e]/50' : 'text-[#1d192b]'}`}>
                  ₪{item.price.toLocaleString()}
                </span>
              )}
            </div>
            
            <div className="flex items-start gap-1">
               <h3 className={`font-bold text-lg leading-tight line-clamp-2 min-h-[3rem] ${isPurchased ? 'text-[#49454f]' : 'text-[#1d192b]'}`}>
                 {item.name}
               </h3>
            </div>
            
            {item.store_name && (
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
                <span className="text-[#49454f]">{Math.round((item.quantity_received / item.quantity) * 100)}%</span>
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
            <Button
              variant={isPurchased ? 'outline' : 'primary'}
              size="sm"
              className={`w-full rounded-xl font-bold text-sm ${isPurchased ? 'border-green-200 text-green-700 bg-green-50' : 'bg-[#1d192b] text-white hover:bg-[#322f3d]'}`}
              onClick={() => handleMarkPurchased(item.id, item.quantity_received, item.quantity)}
            >
              {isPurchased ? (
                <>
                  <Check className="w-4 h-4 ml-2" />
                  סמן כלא נרכש
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 ml-2" />
                  סמן כנרכש
                </>
              )}
            </Button>

            <div className="flex items-center gap-2">
                {item.original_url && (
                  <a
                    href={item.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full rounded-xl border-[#e7e0ec] text-[#49454f] hover:border-[#6750a4] hover:text-[#6750a4]">
                      <ExternalLink className="w-3 h-3 ml-2" />
                      למוצר
                    </Button>
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 rounded-xl text-[#49454f] hover:bg-[#f3edff] hover:text-[#6750a4]"
                  onClick={() => handleOpenEditModal(item)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 rounded-xl text-[#49454f] hover:bg-[#ffebee] hover:text-[#b3261e]"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fffbff] font-sans text-[#1d192b]" dir="rtl">
      {/* Modals */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={handleAddressSave}
      />
      <AddItemModal
        isOpen={showAddItemModal}
        onClose={handleCloseItemModal}
        onSave={handleItemSave}
        editItem={editingItem}
      />
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

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
                  <h1 className="text-3xl font-bold">
                    היי, {profile?.first_name}!
                  </h1>
                </div>
                <p className="text-[#eaddff] text-lg max-w-md font-medium leading-relaxed">
                  הרשימה שלך מוכנה. זה הזמן לשתף אותה עם האנשים שאתם אוהבים ולהתחיל להתארגן ברוגע.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <button 
                  onClick={handleOpenAddModal} 
                  className="flex items-center gap-2 bg-[#d0bcff] text-[#381e72] px-6 py-3 rounded-full font-bold hover:bg-[#e8def8] transition-all shadow-sm active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  הוסף פריט
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-full font-medium hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10 active:scale-95"
                >
                  <Share2 className="w-5 h-5" />
                  שתף
                </button>
                <button className="flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-full font-medium hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10 active:scale-95">
                  <Eye className="w-5 h-5" />
                  תצוגה מקדימה
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex flex-col sm:flex-row gap-4 xl:w-auto">
             <div className="bg-[#f3edff] rounded-[32px] p-6 flex flex-col justify-between min-w-[240px] border border-[#eaddff] relative overflow-hidden">
               <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white p-2 rounded-xl text-[#6750a4] shadow-sm">
                       <Check className="w-5 h-5" strokeWidth={3} />
                    </div>
                    <span className="text-xs font-bold text-[#6750a4] uppercase tracking-wide">סטטוס רשימה</span>
                  </div>
                  <span className="text-4xl font-bold text-[#1d192b] font-numeric">{completionPercent}%</span>
               </div>
               <div className="mt-6">
                 <div className="h-3 w-full bg-[#eaddff] rounded-full overflow-hidden">
                    <div 
                       className="h-full bg-[#6750a4] rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                       style={{ width: `${completionPercent}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                    </div>
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
                   <span className="text-4xl font-bold text-[#1d192b] font-numeric">{totalItems}</span>
                   <p className="text-sm text-[#49454f] mt-1 font-medium">
                     פריטים ברשימה
                   </p>
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
                onChange={(e) => setFilterPriceRange(e.target.value as any)}
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
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none bg-white border border-[#e7e0ec] rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 focus:border-[#6750a4] hover:border-[#d0bcff] transition-all cursor-pointer text-[#1d192b] font-medium min-w-[140px]"
              >
                <option value="">כל הקטגוריות</option>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative group">
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#49454f] pointer-events-none group-hover:text-[#6750a4] transition-colors" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'category')}
                className="appearance-none bg-white border border-[#e7e0ec] rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6750a4]/20 focus:border-[#6750a4] hover:border-[#d0bcff] transition-all cursor-pointer text-[#1d192b] font-medium"
              >
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
            <h2 className="text-2xl font-bold text-[#1d192b] mb-3">
              הרשימה שלכם ריקה
            </h2>
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
              <button className="flex items-center gap-2 bg-white border-2 border-[#e7e0ec] text-[#1d192b] px-8 py-3 rounded-full font-bold hover:border-[#6750a4] hover:text-[#6750a4] transition-all active:scale-95">
                <ClipboardList className="w-5 h-5" />
                בחר מהצ'קליסט
              </button>
            </div>
          </div>
        ) : (
          /* Grouped Items Grid */
          <div className="space-y-12">
            
            {/* ACTIVE ITEMS */}
            {CATEGORIES.map(category => {
               const categoryItems = activeItems.filter(i => i.category === category.id)
               if (categoryItems.length === 0) return null

               return (
                 <div key={category.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                   {/* Category Header */}
                   <div className="flex items-center gap-3 mb-6">
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${category.color} text-white shadow-sm`}>
                         <category.icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-[#1d192b]">
                        {category.name}
                      </h3>
                      <div className="h-px flex-1 bg-[#e7e0ec] ml-4" />
                      <span className="text-sm font-medium text-[#49454f] bg-white border border-[#e7e0ec] px-3 py-1 rounded-full">
                        {categoryItems.length} פריטים
                      </span>
                   </div>

                   {/* Grid/List */}
                   <div className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                      {categoryItems.map(item => (
                        <ItemCard key={item.id} item={item} />
                      ))}
                   </div>
                 </div>
               )
            })}
            
            {/* Catch-all for items without a valid category */}
            {activeItems.filter(i => !CATEGORIES.find(c => c.id === i.category)).length > 0 && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-xl bg-gray-200 text-gray-600 shadow-sm">
                         <Package className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-[#1d192b]">אחר</h3>
                      <div className="h-px flex-1 bg-[#e7e0ec] ml-4" />
                   </div>
                   <div className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                      {activeItems.filter(i => !CATEGORIES.find(c => c.id === i.category)).map(item => (
                        <ItemCard key={item.id} item={item} />
                      ))}
                   </div>
               </div>
            )}

            {/* PURCHASED ITEMS SECTION */}
            {purchasedItems.length > 0 && (
              <div className="pt-8 border-t-2 border-dashed border-[#e7e0ec] mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
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
                
                <div className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                  {purchasedItems.map(item => (
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