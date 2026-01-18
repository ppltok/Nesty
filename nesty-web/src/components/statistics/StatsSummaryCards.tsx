import { Gift, Percent, Package, TrendingUp } from 'lucide-react'

interface StatsSummaryCardsProps {
  receivedValue: number
  moneySavedPercent: number
  itemsRemaining: number
  registryProgressPercent: number
  totalPurchased: number
  totalItems: number
}

export default function StatsSummaryCards({
  receivedValue,
  moneySavedPercent,
  itemsRemaining,
  registryProgressPercent,
  totalPurchased,
  totalItems,
}: StatsSummaryCardsProps) {
  const cards = [
    {
      id: 'progress',
      label: 'התקדמות הרשימה',
      value: `${registryProgressPercent}%`,
      subtitle: `${totalPurchased} מתוך ${totalItems} פריטים`,
      icon: TrendingUp,
      bgColor: 'bg-[#f3edff]',
      iconBg: 'bg-[#6750a4]',
    },
    {
      id: 'received',
      label: 'מתנות שהתקבלו',
      value: `₪${receivedValue.toLocaleString()}`,
      icon: Gift,
      bgColor: 'bg-[#e8f5e9]',
      iconBg: 'bg-[#2e7d32]',
    },
    {
      id: 'saved',
      label: 'חיסכון',
      value: `${moneySavedPercent}%`,
      subtitle: 'מהרשימה נקנתה :)',
      icon: Percent,
      bgColor: 'bg-[#fff3e0]',
      iconBg: 'bg-[#f57c00]',
    },
    {
      id: 'remaining',
      label: 'פריטים שנותרו',
      value: itemsRemaining.toString(),
      icon: Package,
      bgColor: 'bg-[#fce4ec]',
      iconBg: 'bg-[#7a5582]',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.id}
            className={`${card.bgColor} rounded-[16px] p-3 sm:p-4 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`${card.iconBg} p-2 rounded-lg text-white shadow-sm`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#49454f] uppercase tracking-wide leading-tight">
                {card.label}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#1d192b]">
              {card.value}
            </div>
            {card.subtitle && (
              <div className="text-xs sm:text-sm text-[#49454f] mt-0.5">
                {card.subtitle}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
