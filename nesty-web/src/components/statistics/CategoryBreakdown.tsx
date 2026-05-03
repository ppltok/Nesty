import { CATEGORIES } from '../../data/categories'
import { Gift, ShoppingBag, Check } from 'lucide-react'

// Category accent colors (same as Dashboard/Checklist)
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

interface CategoryStat {
  id: string
  name: string
  totalValue: number
  receivedValue: number
  itemCount: number
  receivedCount: number
  progressPercent: number
  color: string
}

interface CategoryBreakdownProps {
  categoryStats: CategoryStat[]
}

export default function CategoryBreakdown({ categoryStats }: CategoryBreakdownProps) {
  if (categoryStats.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-[28px] border border-[#e7e0ec] p-6 shadow-sm hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.08)] transition-all duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#1d192b] mb-1 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#f3edff] flex items-center justify-center">
            <ShoppingBag className="w-4.5 h-4.5 text-[#6750a4]" />
          </div>
          פירוט לפי קטגוריה
        </h3>
        <p className="text-sm text-[#49454f] mr-12">
          התקדמות המתנות שהתקבלו מתוך הפריטים ברשימה שלך
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-5 pb-4 border-b border-[#e7e0ec]">
        <div className="flex items-center gap-2 text-xs text-[#49454f] font-medium">
          <Gift className="w-3.5 h-3.5 text-green-600" />
          <span>התקבל</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#49454f] font-medium">
          <ShoppingBag className="w-3.5 h-3.5 text-[#49454f]" />
          <span>סה"כ ברשימה</span>
        </div>
      </div>

      <div className="space-y-3">
        {categoryStats.map((stat) => {
          const category = CATEGORIES.find(c => c.id === stat.id)
          const CategoryIcon = category?.icon
          const colors = CATEGORY_COLORS[stat.id] || CATEGORY_COLORS.general
          const isComplete = stat.progressPercent === 100

          return (
            <div
              key={stat.id}
              className="group rounded-2xl p-4 border transition-all duration-300 hover:shadow-sm"
              style={{
                backgroundColor: isComplete ? colors.bg + '40' : '#fafafa',
                borderColor: isComplete ? colors.border + '30' : '#e7e0ec',
              }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-3">
                  {CategoryIcon && (
                    <div
                      className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      <CategoryIcon className="w-4.5 h-4.5" />
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-[#1d192b] text-sm">{stat.name}</span>
                    <div className="text-xs text-[#49454f] mt-0.5">
                      <span className="text-green-600 font-medium">{stat.receivedCount}</span>
                      {' מתוך '}
                      <span className="font-medium">{stat.itemCount}</span>
                      {' פריטים'}
                    </div>
                  </div>
                </div>
                <div className="text-left flex items-center gap-2">
                  {isComplete && (
                    <div className="w-6 h-6 rounded-full bg-[#00c875] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-bold" style={{ color: colors.text }}>
                      ₪{stat.receivedValue.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#49454f]"> / ₪{stat.totalValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 bg-white rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${stat.progressPercent}%`,
                      backgroundColor: colors.border,
                    }}
                  />
                </div>
                <span
                  className="text-xs font-bold w-10 text-left"
                  style={{ color: colors.text }}
                >
                  {stat.progressPercent}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Note */}
      <div className="mt-5 pt-4 border-t border-[#e7e0ec]">
        <p className="text-[11px] text-[#49454f] text-center font-medium">
          מוצגות רק קטגוריות עם פריטים ברשימה שלך
        </p>
      </div>
    </div>
  )
}
