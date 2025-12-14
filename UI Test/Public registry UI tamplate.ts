import React, { useState, useEffect, useMemo } from 'react'
import { Calendar, Gift, ArrowRight, Check, Star, MessageSquare, EyeOff, Filter, Package, ShoppingCart, Heart, Sparkles, X, Smile, LayoutGrid, List, Home, Car, Shirt, Bath, Utensils } from 'lucide-react'

// --- Types ---
type ItemCategory = 'nursery' | 'travel' | 'clothing' | 'bath' | 'feeding'

interface Item {
  id: string
  name: string
  category: string
  price: number
  quantity: number
  quantity_received: number
  image_url?: string
  store_name?: string
  is_most_wanted: boolean
  is_private: boolean
}

interface Profile {
  first_name: string
  last_name: string
  due_date: string
}

interface RegistryWithOwner {
  id: string
  title: string
  welcome_message?: string
  is_public: boolean
  profiles: Profile
}

// --- Mock Data ---
const CATEGORIES = [
  { id: 'nursery', name: 'חדר תינוק', icon: Home, color: 'bg-blue-100 text-blue-700' },
  { id: 'travel', name: 'טיולים', icon: Car, color: 'bg-green-100 text-green-700' },
  { id: 'clothing', name: 'ביגוד', icon: Shirt, color: 'bg-purple-100 text-purple-700' },
  { id: 'bath', name: 'אמבטיה', icon: Bath, color: 'bg-cyan-100 text-cyan-700' },
  { id: 'feeding', name: 'הנקה והאכלה', icon: Utensils, color: 'bg-orange-100 text-orange-700' }
]

const MOCK_REGISTRY: RegistryWithOwner = {
  id: 'reg_123',
  title: 'הרשימה של נועה ודני',
  welcome_message: "היי כולם! \nאנחנו כל כך מתרגשים לקראת הלידה ומעריכים מאוד את העזרה והאהבה שלכם. \nתודה שאתם חלק מהמסע שלנו! ❤️",
  is_public: true,
  profiles: {
    first_name: 'נועה',
    last_name: 'כהן',
    due_date: '2024-05-15'
  }
}

const MOCK_ITEMS: Item[] = [
  {
    id: '1',
    name: 'עגלת תינוק בוגבו דרגונפליי',
    category: 'travel',
    price: 4500,
    quantity: 1,
    quantity_received: 0,
    store_name: 'שילב',
    is_most_wanted: true,
    is_private: false,
  },
  {
    id: '2',
    name: 'שידת החתלה רחבה',
    category: 'nursery',
    price: 1200,
    quantity: 1,
    quantity_received: 1, // Purchased
    store_name: 'איקאה',
    is_most_wanted: false,
    is_private: false,
  },
  {
    id: '3',
    name: 'מארז בגדי גוף (6 יח׳)',
    category: 'clothing',
    price: 150,
    quantity: 2,
    quantity_received: 1, // Partially purchased
    store_name: 'Next',
    is_most_wanted: false,
    is_private: false,
  },
  {
    id: '4',
    name: 'אוניברסיטה לתינוק',
    category: 'nursery',
    price: 350,
    quantity: 1,
    quantity_received: 0,
    store_name: 'מוצצים',
    is_most_wanted: true,
    is_private: false,
  },
  {
    id: '5',
    name: 'בקבוקים (מארז שלישייה)',
    category: 'feeding',
    price: 120,
    quantity: 2,
    quantity_received: 0,
    store_name: 'סופר-פארם',
    is_most_wanted: false,
    is_private: false,
  }
]

// --- Utils ---
const getDaysUntilDueDate = (dateString: string) => {
  const due = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(due.getTime() - now.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const isPurchased = (item: Item) => item.quantity_received >= item.quantity
const remainingQuantity = (item: Item) => item.quantity - item.quantity_received

// --- Components ---
const Button = ({ children, onClick, className, variant = 'primary', size = 'md' }: any) => {
  const baseStyle = "flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
  const variants = {
    primary: "bg-[#6750a4] text-white hover:bg-[#503e85] shadow-md shadow-[#6750a4]/20",
    secondary: "bg-[#eaddff] text-[#21005d] hover:bg-[#d0bcff]",
    outline: "border-2 border-[#e7e0ec] text-[#1d192b] hover:border-[#6750a4] hover:text-[#6750a4] bg-white",
    ghost: "text-[#49454f] hover:bg-[#f3edff] hover:text-[#6750a4]",
  }
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
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
    <div className="fixed inset-0 bg-[#1d192b]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#fffbff] rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative">
        <button onClick={onClose} className="absolute top-4 left-4 p-2 hover:bg-[#f3edff] rounded-full text-[#49454f] transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-[#1d192b]">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  )
}

// --- Main Component ---
export default function PublicRegistry() {
  const [registry, setRegistry] = useState<RegistryWithOwner | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  
  // Filter States
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterMostWanted, setFilterMostWanted] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setRegistry(MOCK_REGISTRY)
      setItems(MOCK_ITEMS)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filter Logic
  const filteredItems = useMemo(() => {
    let result = items
    if (filterCategory) {
      result = result.filter(item => item.category === filterCategory)
    }
    if (filterMostWanted) {
      result = result.filter(item => item.is_most_wanted)
    }
    return result
  }, [items, filterCategory, filterMostWanted])

  const availableItems = useMemo(() => filteredItems.filter(item => !isPurchased(item)), [filteredItems])
  const purchasedItems = useMemo(() => filteredItems.filter(item => isPurchased(item)), [filteredItems])

  const availableCategories = useMemo(() => {
    const categoryIds = [...new Set(items.map(item => item.category))]
    return CATEGORIES.filter(cat => categoryIds.includes(cat.id))
  }, [items])

  const handlePurchaseClick = (item: Item) => {
    setSelectedItem(item)
    setIsPurchaseModalOpen(true)
  }

  const handlePurchaseConfirm = () => {
    if (selectedItem) {
        setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, quantity_received: i.quantity_received + 1 } : i))
    }
    setIsPurchaseModalOpen(false)
    setSelectedItem(null)
  }

  // --- ITEM CARD RENDERER ---
  const ItemCard = ({ item }: { item: Item }) => {
    const remaining = remainingQuantity(item)
    const category = CATEGORIES.find(c => c.id === item.category)
    const isItemPurchased = isPurchased(item)

    if (viewMode === 'list') {
        return (
            <div className={`bg-white rounded-[24px] border border-[#e7e0ec] overflow-hidden group hover:border-[#d0bcff] transition-all duration-300 flex ${isItemPurchased ? 'opacity-70 grayscale' : ''}`}>
                <div className="w-32 sm:w-48 aspect-square flex-shrink-0 bg-[#f5f5f5] relative">
                    {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className={`w-12 h-12 rounded-[12px] bg-gradient-to-br ${category?.color || 'from-gray-300 to-gray-400'} flex items-center justify-center text-[#6750a4]`}>
                                {category?.icon && <category.icon className="w-6 h-6" />}
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
                                <span className="font-bold text-[#1d192b] font-numeric text-lg">₪{item.price.toLocaleString()}</span>
                            )}
                        </div>
                    </div>
                    
                    {!isItemPurchased && (
                        <div className="flex justify-end mt-2">
                            <Button 
                                onClick={() => handlePurchaseClick(item)} 
                                className="px-6 h-10 text-sm shadow-sm"
                            >
                                <Gift className="w-4 h-4 ml-2" /> קנה מתנה
                            </Button>
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
            key={item.id} 
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
                    <div className="w-20 h-20 rounded-[20px] bg-white flex items-center justify-center text-[#6750a4] shadow-sm">
                        {category?.icon ? <category.icon className="w-10 h-10" /> : <Package className="w-10 h-10" />}
                    </div>
                </div>
            )}
            
            {/* Most Wanted Badge */}
            {item.is_most_wanted && !isItemPurchased && (
                <div className="absolute top-4 right-4 bg-[#b3261e] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg animate-pulse-slow z-10">
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
                            <span className="font-bold text-[#1d192b] font-numeric text-2xl">
                                ₪{item.price.toLocaleString()}
                            </span>
                            ) : (
                            <span className="font-bold text-[#1d192b]">לא צוין</span>
                            )}
                        </div>
                        
                        <Button
                            onClick={() => handlePurchaseClick(item)}
                            className="px-6 h-12 shadow-lg shadow-[#6750a4]/20"
                        >
                            <Gift className="w-5 h-5 ml-2" />
                            קנה מתנה
                        </Button>
                    </div>
                </div>
            )}
            </div>
        </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffbff]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#6750a4] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[#49454f] font-medium">טוען רשימה...</p>
        </div>
      </div>
    )
  }

  if (!registry) return <div>שגיאה בטעינת הרשימה</div>

  const owner = registry.profiles
  const daysUntilDue = getDaysUntilDueDate(owner.due_date)

  return (
    <div className="min-h-screen bg-[#fffbff] font-sans text-[#1d192b]" dir="rtl">
      
      {/* Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#e7e0ec] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-[#6750a4] rounded-lg flex items-center justify-center text-white shadow-sm">
               <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-[#1d192b]">Nesty</span>
          </div>
          <Button variant="ghost" size="sm">
            צור רשימה משלך
          </Button>
        </div>
      </header>

      {/* Fun Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-[#fffbff]">
        {/* The Fun Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF9A9E] via-[#FECFEF] to-[#E0C3FC] opacity-90" />
        
        {/* Decorative Shapes */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/30 rounded-full blur-3xl mix-blend-overlay" />
        <div className="absolute bottom-[-20px] left-[-20px] w-48 h-48 bg-[#fffbff]/40 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-md rounded-full px-5 py-1.5 text-[#1d192b] font-bold text-sm mb-6 shadow-sm border border-white/50">
             <span className="text-xl">👶</span> חוגגים את התינוק שבדרך!
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-[#1d192b] mb-6 tracking-tight drop-shadow-sm leading-[1.1]">
            הרשימה של {owner.first_name} {owner.last_name}
          </h1>
          
          {daysUntilDue > 0 && (
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Filters and View Toggle */}
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-xl border border-[#e7e0ec] p-1 gap-1 w-fit mx-auto md:mx-0">
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

            {/* Category Filters */}
            {availableCategories.length > 1 && (
            <div className="flex flex-wrap items-center gap-3 justify-center">
                <button
                onClick={() => setFilterCategory('')}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                    filterCategory === ''
                    ? 'bg-[#1d192b] text-white shadow-lg scale-105'
                    : 'bg-white border border-[#e7e0ec] text-[#49454f] hover:bg-[#f3edff] hover:scale-105'
                }`}
                >
                הכל
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
                    onClick={() => setFilterCategory(category.id)}
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
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="bg-white rounded-[32px] border border-[#e7e0ec] p-16 text-center">
            <div className="w-24 h-24 bg-[#f5f5f5] rounded-full flex items-center justify-center mx-auto mb-6 text-[#49454f]">
              <Gift className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-[#1d192b] mb-3">
              עוד לא נוספו פריטים
            </h2>
            <p className="text-[#49454f]">בקרוב יתווספו פריטים לרשימה הזו</p>
          </div>
        )}

        <div className="space-y-16">
          {/* Available Items */}
          {availableItems.length > 0 && (
            <div>
              {/* Group by category if no category selected */}
              {!filterCategory ? (
                 CATEGORIES.map(category => {
                    const categoryItems = availableItems.filter(i => i.category === category.id)
                    if (categoryItems.length === 0) return null
                    
                    return (
                        <div key={category.id} className="mb-12">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 rounded-xl text-[#21005d] shadow-sm ${category.color}`}>
                                    <category.icon className="w-6 h-6" />
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
                                    <ItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        </div>
                    )
                 })
              ) : (
                 <div className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                    {availableItems.map((item) => (
                        <ItemCard key={item.id} item={item} />
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
                    <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

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
          <Button variant="outline" size="xl" className="rounded-2xl border-2 border-[#6750a4] text-[#6750a4] hover:bg-[#f3edff] hover:scale-105 transition-transform text-lg px-12 h-16 font-black shadow-lg">
            התחילו בחינם
          </Button>
          <p className="text-[#49454f]/40 text-sm mt-12">
            © 2024 Nesty - לבנות את הקן שלכם, חכם יותר.
          </p>
        </div>
      </footer>

      {/* Purchase Modal Simulation */}
      <Modal 
        isOpen={isPurchaseModalOpen} 
        onClose={() => setIsPurchaseModalOpen(false)}
        title="איזה כיף!"
      >
         <div className="text-center">
            <div className="w-20 h-20 bg-[#f3edff] rounded-full flex items-center justify-center mx-auto mb-4 text-[#6750a4]">
               <Gift className="w-10 h-10" />
            </div>
            <p className="text-[#1d192b] text-lg font-medium mb-2">
               בחרתם לקנות את:
            </p>
            <p className="text-[#6750a4] text-xl font-bold mb-6">
               {selectedItem?.name}
            </p>
            
            <div className="space-y-3">
               <Button onClick={handlePurchaseConfirm} className="w-full text-lg h-14 shadow-lg">
                  סימון כנרכש
               </Button>
               <Button variant="ghost" onClick={() => setIsPurchaseModalOpen(false)} className="w-full">
                  ביטול
               </Button>
            </div>
            <p className="text-xs text-[#49454f] mt-4">
               לחיצה על "סימון כנרכש" תעדכן את הרשימה כדי למנוע כפילויות.
            </p>
         </div>
      </Modal>

    </div>
  )
}