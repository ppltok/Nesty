import { Link } from 'react-router-dom'
import { BarChart3, Plus, ClipboardList, Package, Wallet, ShoppingBag } from 'lucide-react'
import { useStatistics } from '../hooks/useStatistics'
import StatsSummaryCards from '../components/statistics/StatsSummaryCards'
import NestingIndexSection from '../components/statistics/NestingIndexSection'
import CategoryBreakdown from '../components/statistics/CategoryBreakdown'

export default function Statistics() {
  const { statistics, isLoading, error, hasData } = useStatistics()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fffbff] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#6750a4] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[#49454f] font-medium">טוען נתונים...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fffbff] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#ffebee] rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-[#b3261e]" />
          </div>
          <p className="text-[#b3261e] font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fffbff] font-sans text-[#1d192b]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header with Hero Stats */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6750a4] to-[#503e85] flex items-center justify-center text-white shadow-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-[#1d192b]">כמה אני מוכנה?</h1>
          </div>

          {/* Hero Stats - Always Visible */}
          <div className="bg-gradient-to-br from-[#1d192b] to-[#49454f] rounded-[28px] p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-around gap-6">
              {/* Registry Value */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-[#d0bcff]" />
                  <span className="text-sm text-[#d0bcff] font-medium">שווי הרשימה</span>
                </div>
                <div className="text-4xl sm:text-5xl font-bold">
                  ₪{statistics.totalValue.toLocaleString()}
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-16 bg-white/20" />
              <div className="sm:hidden h-px w-24 bg-white/20" />

              {/* Item Count */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ShoppingBag className="w-5 h-5 text-[#d0bcff]" />
                  <span className="text-sm text-[#d0bcff] font-medium">מספר פריטים</span>
                </div>
                <div className="text-4xl sm:text-5xl font-bold">
                  {statistics.totalItems}
                </div>
              </div>
            </div>
          </div>
        </div>

        {!hasData ? (
          /* Empty State */
          <div className="bg-white rounded-[32px] border border-[#e7e0ec] p-12 text-center">
            <div className="w-20 h-20 bg-[#f3edff] rounded-[24px] flex items-center justify-center mx-auto mb-6 text-[#6750a4]">
              <Package className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-[#1d192b] mb-3">אין עדיין נתונים</h2>
            <p className="text-[#49454f] mb-8 max-w-md mx-auto leading-relaxed">
              כדי לראות את הסטטיסטיקות, התחילי להוסיף פריטים לרשימה או סמני פריטים בצ'קליסט.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <button className="flex items-center gap-2 bg-[#6750a4] text-white px-8 py-3 rounded-full font-bold hover:bg-[#503e85] transition-all shadow-md active:scale-95">
                  <Plus className="w-5 h-5" />
                  הוסיפי פריטים
                </button>
              </Link>
              <Link to="/checklist">
                <button className="flex items-center gap-2 bg-white border-2 border-[#e7e0ec] text-[#1d192b] px-8 py-3 rounded-full font-bold hover:border-[#6750a4] hover:text-[#6750a4] transition-all active:scale-95">
                  <ClipboardList className="w-5 h-5" />
                  לצ'קליסט
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <StatsSummaryCards
              receivedValue={statistics.receivedValue}
              moneySavedPercent={statistics.moneySavedPercent}
              itemsRemaining={statistics.itemsRemaining}
              registryProgressPercent={statistics.registryProgressPercent}
              totalPurchased={statistics.totalPurchased}
              totalItems={statistics.totalItems}
            />

            {/* Nesting Index + Readiness */}
            <NestingIndexSection
              nestingScore={statistics.nestingScore}
              essentialPercent={statistics.essentialPercent}
              niceToHavePercent={statistics.niceToHavePercent}
              essentialChecked={statistics.essentialChecked}
              essentialTotal={statistics.essentialTotal}
              niceToHaveChecked={statistics.niceToHaveChecked}
              niceToHaveTotal={statistics.niceToHaveTotal}
              totalChecklistItems={statistics.totalChecklistItems}
              totalChecked={statistics.totalChecked}
              overallReadiness={statistics.overallReadiness}
              readinessLabel={statistics.readinessLabel}
            />

            {/* Category Breakdown */}
            <CategoryBreakdown categoryStats={statistics.categoryStats} />

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link to="/dashboard">
                <button className="flex items-center gap-2 bg-white border-2 border-[#e7e0ec] text-[#1d192b] px-6 py-3 rounded-full font-medium hover:border-[#6750a4] hover:text-[#6750a4] transition-all active:scale-95">
                  <Plus className="w-5 h-5" />
                  לרשימה שלי 
                </button>
              </Link>
              <Link to="/checklist">
                <button className="flex items-center gap-2 bg-white border-2 border-[#e7e0ec] text-[#1d192b] px-6 py-3 rounded-full font-medium hover:border-[#6750a4] hover:text-[#6750a4] transition-all active:scale-95">
                  <ClipboardList className="w-5 h-5" />
                  המשיכי בצ'קליסט
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
