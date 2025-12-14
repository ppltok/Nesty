import React, { useState, useEffect } from 'react'
import { ArrowRight, Gift, Check, Heart, Store, Phone, CheckCircle, MessageCircle, Sparkles, PackageOpen, Eye, EyeOff, X } from 'lucide-react'

// --- Types & Mocks ---
type Purchase = {
  id: string
  item_id: string
  buyer_name: string
  buyer_phone?: string
  message?: string
  is_surprise: boolean
  status: 'pending' | 'confirmed'
  is_received: boolean
  is_seen: boolean
  thanked_at?: string
  purchased_at: string
  item_name: string
  category: 'nursery' | 'clothing' | 'gear' | 'toys'
}

const MOCK_PURCHASES: Purchase[] = [
  {
    id: '1',
    item_id: 'i1',
    buyer_name: 'סבתא רחל',
    buyer_phone: '0501234567',
    message: 'שיהיה במזל טוב אהובים שלי! נשיקות',
    is_surprise: true,
    status: 'confirmed',
    is_received: false,
    is_seen: false,
    purchased_at: '12/10/2023',
    item_name: 'עגלת תינוק בוגבו',
    category: 'gear'
  },
  {
    id: '2',
    item_id: 'i2',
    buyer_name: 'דוד יוסי',
    buyer_phone: '0529876543',
    message: 'משהו קטן להתחלה',
    is_surprise: false,
    status: 'confirmed',
    is_received: true,
    is_seen: true,
    thanked_at: '14/10/2023',
    purchased_at: '10/10/2023',
    item_name: 'שידת החתלה',
    category: 'nursery'
  },
  {
    id: '3',
    item_id: 'i3',
    buyer_name: 'נועה ודני',
    is_surprise: true,
    status: 'pending',
    is_received: false,
    is_seen: false,
    purchased_at: '15/10/2023',
    item_name: 'מארז בגדי גוף',
    category: 'clothing'
  },
  {
    id: '4',
    item_id: 'i4',
    buyer_name: 'צוות המשרד',
    message: 'מכולנו באהבה גדולה!',
    is_surprise: true,
    status: 'confirmed',
    is_received: false,
    is_seen: false,
    purchased_at: '16/10/2023',
    item_name: 'אוניברסיטה לתינוק',
    category: 'toys'
  },
  {
    id: '5',
    item_id: 'i5',
    buyer_name: 'אמא ואבא',
    buyer_phone: '0509999999',
    is_surprise: false,
    status: 'confirmed',
    is_received: true,
    is_seen: true,
    purchased_at: '01/10/2023',
    item_name: 'מיטת תינוק',
    category: 'nursery'
  },
  {
    id: '6',
    item_id: 'i6',
    buyer_name: 'רונית השכנה',
    message: '',
    is_surprise: false,
    status: 'confirmed',
    is_received: false,
    is_seen: false,
    purchased_at: '18/10/2023',
    item_name: 'סט מצעים',
    category: 'clothing'
  }
]

// --- Components ---

const Button = ({ children, onClick, className, variant = 'primary', size = 'md' }: any) => {
  const baseStyle = "flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
  const variants = {
    primary: "bg-[#6750a4] text-white hover:bg-[#503e85] shadow-md shadow-[#6750a4]/20",
    outline: "border-2 border-[#e7e0ec] text-[#1d192b] hover:border-[#6750a4] hover:text-[#6750a4] bg-white",
    ghost: "text-[#49454f] hover:bg-[#f3edff] hover:text-[#6750a4]",
    whatsapp: "bg-[#25D366] text-white hover:bg-[#128C7E] shadow-sm",
    reveal: "bg-white text-[#6750a4] hover:bg-opacity-90 shadow-lg",
  }
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
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

const StatCard = ({ icon: Icon, value, label, subLabel, colorClass, bgClass }: any) => (
  <div className={`rounded-[24px] rounded-tr-[8px] p-6 flex items-center gap-4 border ${bgClass} transition-all hover:scale-[1.02] hover:shadow-sm`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${colorClass}`}>
      <Icon className="w-7 h-7" />
    </div>
    <div>
      <div className="text-3xl font-bold text-[#1d192b] font-numeric leading-none mb-1">
        {value}
      </div>
      <div className="font-bold text-sm text-[#1d192b]/80">{label}</div>
      {subLabel && <div className="text-xs text-[#1d192b]/50 mt-0.5">{subLabel}</div>}
    </div>
  </div>
)

// --- Main Component ---
export default function Gifts() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [revealedSurprises, setRevealedSurprises] = useState<string[]>([])

  // Simulate Fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setPurchases(MOCK_PURCHASES)
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleRevealSurprise = (purchaseId: string) => {
    setRevealedSurprises(prev => [...prev, purchaseId])
  }

  const handleMarkReceived = (purchaseId: string) => {
    setPurchases(prev => prev.map(p => p.id === purchaseId ? { ...p, is_received: !p.is_received } : p))
  }

  const handleSendThankYou = (purchase: Purchase) => {
    if (!purchase.buyer_phone) return
    let phone = purchase.buyer_phone.replace(/[-\s()]/g, '')
    if (phone.startsWith('0')) phone = '972' + phone.substring(1)
    
    const message = encodeURIComponent(
      `היי ${purchase.buyer_name}! 💝\n\nתודה רבה על המתנה המהממת - ${purchase.item_name}!\nאנחנו מאוד מעריכים את המחשבה והנדיבות שלך.\n\nבאהבה ❤️`
    )
    
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    setPurchases(prev => prev.map(p => p.id === purchase.id ? { ...p, thanked_at: new Date().toISOString() } : p))
  }

  // Stats Calculations
  const totalGifts = purchases.length
  const surprisesHidden = purchases.filter(p => p.is_surprise && !revealedSurprises.includes(p.id)).length
  const thankYousNeeded = purchases.filter(p => !p.thanked_at && p.buyer_phone).length
  const receivedCount = purchases.filter(p => p.is_received).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fffbff] flex items-center justify-center">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
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

        {/* Gifts Grid */}
        {purchases.length === 0 ? (
          <div className="bg-white rounded-[40px] rounded-tr-[12px] rounded-bl-[12px] border border-[#e7e0ec] p-16 text-center shadow-sm">
            {/* Empty State */}
            <div className="w-24 h-24 bg-[#f5f5f5] rounded-full flex items-center justify-center mx-auto mb-6 text-[#49454f]">
              <Gift className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-[#1d192b] mb-3">
              תיבת המתנות ריקה
            </h2>
            <p className="text-[#49454f] mb-8 max-w-md mx-auto text-lg">
              עדיין לא התקבלו מתנות. אל דאגה, ברגע שמישהו יקנה משהו מהרשימה הוא יופיע כאן!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {purchases.map((purchase) => (
              <PurchaseCard
                key={purchase.id}
                purchase={purchase}
                isRevealed={revealedSurprises.includes(purchase.id)}
                onReveal={() => handleRevealSurprise(purchase.id)}
                onMarkReceived={handleMarkReceived}
                onSendThankYou={handleSendThankYou}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// --- Purchase Card Component ---
function PurchaseCard({
  purchase,
  isRevealed,
  onReveal,
  onMarkReceived,
  onSendThankYou,
}: {
  purchase: Purchase
  isRevealed: boolean
  onReveal: () => void
  onMarkReceived: (id: string) => void
  onSendThankYou: (p: Purchase) => void
}) {
  const isSurprise = purchase.is_surprise
  const isHidden = isSurprise && !isRevealed
  const isReceived = purchase.is_received
  const hasThanked = !!purchase.thanked_at

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
           <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-inner animate-bounce-slow border border-white/20">
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
      className={`h-[340px] flex flex-col rounded-[40px] rounded-tr-[12px] rounded-bl-[12px] border-2 transition-all duration-300 relative overflow-hidden bg-white ${
        isReceived 
          ? 'border-[#dcedc8] shadow-none' 
          : 'border-[#e7e0ec] shadow-sm hover:shadow-md hover:border-[#d0bcff]'
      }`}
    >
      {/* Top Banner Status */}
      {isSurprise && (
        <div className="bg-[#fff0f5] text-[#b3261e] text-xs font-bold px-4 py-2 text-center border-b border-[#ffd8e4]">
          🎁 הייתה הפתעה!
        </div>
      )}
      
      <div className="p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${isReceived ? 'bg-[#dcedc8] text-[#33691e]' : 'bg-[#f3edff] text-[#6750a4]'}`}>
              {isReceived ? <CheckCircle className="w-7 h-7" /> : <Gift className="w-7 h-7" />}
           </div>
           <span className="text-xs font-medium text-[#49454f] bg-[#f5f5f5] px-3 py-1 rounded-full">
             {purchase.purchased_at}
           </span>
        </div>

        {/* Item Info */}
        <div className="mb-auto">
           <h3 className="text-xl font-bold text-[#1d192b] leading-tight mb-2 line-clamp-2">
             {purchase.item_name}
           </h3>
           <p className="text-[#49454f] text-sm">
             מאת: <span className="font-bold text-[#6750a4] text-base">{purchase.buyer_name}</span>
           </p>
        </div>

        {/* Message Bubble (if exists) */}
        {purchase.message && (
          <div className="bg-[#f9f9f9] p-3 rounded-xl rounded-tr-sm mb-4 relative mt-2 border border-[#f0f0f0]">
             <Heart className="w-3 h-3 text-[#b3261e] absolute -top-1.5 -right-1.5 fill-current bg-white rounded-full" />
             <p className="text-sm text-[#49454f] italic line-clamp-2">"{purchase.message}"</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t border-[#e7e0ec]/60 flex flex-col gap-2">
           <div className="flex gap-2">
             <Button 
               variant={isReceived ? "outline" : "primary"} 
               size="sm"
               className={`flex-1 text-xs h-9 ${isReceived ? 'bg-white border-[#dcedc8] text-[#33691e]' : ''}`}
               onClick={() => onMarkReceived(purchase.id)}
             >
               {isReceived ? 'בטל קבלה' : 'קיבלתי! 🙌'}
             </Button>
             
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
             <div className="flex items-center justify-center gap-2 bg-[#f1f8e9] text-[#33691e] py-2 px-3 rounded-xl border border-[#dcedc8] mt-1 shadow-sm animate-in fade-in zoom-in duration-300">
               <div className="bg-[#33691e] text-white rounded-full p-0.5">
                 <Check className="w-3 h-3" strokeWidth={3} />
               </div>
               <span className="text-xs font-bold">הודעת תודה נשלחה</span>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}