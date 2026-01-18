import { CATEGORIES } from '../../data/categories'
import { Gift, ShoppingBag } from 'lucide-react'

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
    <div className="bg-white rounded-[28px] border border-[#e7e0ec] p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#1d192b] mb-1">
          פירוט לפי קטגוריה
        </h3>
        <p className="text-sm text-[#49454f]">
          התקדמות המתנות שהתקבלו מתוך הפריטים ברשימה שלך
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-[#e7e0ec]">
        <div className="flex items-center gap-2 text-xs text-[#49454f]">
          <Gift className="w-4 h-4 text-green-600" />
          <span>התקבל</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#49454f]">
          <ShoppingBag className="w-4 h-4 text-[#79747e]" />
          <span>סה"כ ברשימה</span>
        </div>
      </div>

      <div className="space-y-5">
        {categoryStats.map((stat) => {
          const category = CATEGORIES.find(c => c.id === stat.id)
          const CategoryIcon = category?.icon

          return (
            <div key={stat.id} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {CategoryIcon && (
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-sm`}>
                      <CategoryIcon className="w-4 h-4" />
                    </div>
                  )}
                  <span className="font-medium text-[#1d192b]">{stat.name}</span>
                </div>
                <div className="text-left flex items-center gap-1">
                  <span className="text-sm font-bold text-green-600">
                    ₪{stat.receivedValue.toLocaleString()}
                  </span>
                  <span className="text-sm text-[#79747e]">/</span>
                  <span className="text-sm text-[#49454f]">
                    ₪{stat.totalValue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-[#f5f5f5] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${stat.color} transition-all duration-700 ease-out`}
                    style={{ width: `${stat.progressPercent}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-[#49454f] w-12 text-left">
                  {stat.progressPercent}%
                </span>
              </div>

              {/* Item count */}
              <div className="flex justify-between mt-1.5 text-xs text-[#79747e]">
                <span>
                  <span className="text-green-600 font-medium">{stat.receivedCount}</span>
                  {' מתוך '}
                  <span className="font-medium">{stat.itemCount}</span>
                  {' פריטים התקבלו'}
                </span>
                {stat.progressPercent === 100 && (
                  <span className="text-green-600 font-medium">הושלם! 🎉</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Note about data source */}
      <div className="mt-6 pt-4 border-t border-[#e7e0ec]">
        <p className="text-xs text-[#79747e] text-center">
          מוצגות רק קטגוריות עם פריטים ברשימה שלך
        </p>
      </div>
    </div>
  )
}
