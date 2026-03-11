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
      accent: { bg: '#f5f3ff', border: '#8b5cf6', text: '#7c3aed', iconBg: '#6750a4' },
      progressBar: { percent: registryProgressPercent, color: '#6750a4', trackColor: '#eaddff' },
    },
    {
      id: 'received',
      label: 'מתנות שהתקבלו',
      value: `₪${receivedValue.toLocaleString()}`,
      icon: Gift,
      accent: { bg: '#ecfdf5', border: '#10b981', text: '#059669', iconBg: '#059669' },
    },
    {
      id: 'saved',
      label: 'חיסכון',
      value: `${moneySavedPercent}%`,
      subtitle: 'מהרשימה נקנתה',
      icon: Percent,
      accent: { bg: '#fff7ed', border: '#f59e0b', text: '#d97706', iconBg: '#d97706' },
    },
    {
      id: 'remaining',
      label: 'פריטים שנותרו',
      value: itemsRemaining.toString(),
      icon: Package,
      accent: { bg: '#fdf2f8', border: '#ec4899', text: '#db2777', iconBg: '#be185d' },
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.id}
            className="bg-white rounded-[20px] p-4 sm:p-5 border border-[#e7e0ec] shadow-sm hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
          >
            {/* Subtle accent line at top */}
            <div
              className="absolute top-0 inset-x-0 h-1 rounded-t-[20px]"
              style={{ backgroundColor: card.accent.border }}
            />

            <div className="flex items-center gap-2 mb-3">
              <div
                className="p-2 rounded-xl text-white shadow-sm"
                style={{ backgroundColor: card.accent.iconBg }}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide" style={{ color: card.accent.text }}>
                {card.label}
              </span>
            </div>

            <div className="text-2xl sm:text-3xl font-bold text-[#1d192b]">
              {card.value}
            </div>

            {card.progressBar && (
              <div className="mt-3">
                <div
                  className="h-2 w-full rounded-full overflow-hidden"
                  style={{ backgroundColor: card.progressBar.trackColor }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${card.progressBar.percent}%`,
                      backgroundColor: card.progressBar.color,
                    }}
                  />
                </div>
              </div>
            )}

            {card.subtitle && (
              <div className="text-xs text-[#49454f] mt-1.5 font-medium">
                {card.subtitle}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
