import { Link } from 'react-router-dom'
import { BarChart3, Plus, ClipboardList, Package, Wallet, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useStatistics } from '../hooks/useStatistics'
import StatsSummaryCards from '../components/statistics/StatsSummaryCards'
import NestingIndexSection from '../components/statistics/NestingIndexSection'
import CategoryBreakdown from '../components/statistics/CategoryBreakdown'
import FadedIconsBackground from '../components/animations/FadedIconsBackground'

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
        {/* Hero Banner - aurora flowing background */}
        <div className="mb-10">
          <div className="bg-[#1d192b] rounded-[32px] p-8 text-white shadow-[0_20px_60px_-15px_rgba(29,25,43,0.4)] relative overflow-hidden group">
            {/* Dynamic flowing aurora background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="aurora-blob-1 absolute -top-1/4 -right-1/4 w-[70%] h-[70%] rounded-full bg-[#6750a4]/40 blur-[60px]" />
              <div className="aurora-blob-2 absolute -bottom-1/3 -left-1/4 w-[65%] h-[65%] rounded-full bg-[#9c27b0]/25 blur-[70px]" />
              <div className="aurora-blob-3 absolute top-1/4 left-1/3 w-[50%] h-[50%] rounded-full bg-[#3f51b5]/20 blur-[50px]" />
              <div className="aurora-blob-4 absolute -bottom-1/4 right-1/4 w-[45%] h-[45%] rounded-full bg-[#d0bcff]/15 blur-[55px]" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#1d192b]/30 to-[#49454f]/20" />
            </div>
            <FadedIconsBackground count={14} className="opacity-20" />

            <div className="relative z-10">
              {/* Title row */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-[#d0bcff]" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">כמה אני מוכנה?</h1>
              </div>

              {/* Hero Stats Row */}
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
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

              {/* Back to dashboard link */}
              <div className="mt-6 flex justify-center">
                <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-[#d0bcff]/70 hover:text-[#d0bcff] transition-colors font-medium">
                  <ArrowLeft className="w-4 h-4" />
                  חזרה לרשימה
                </Link>
              </div>
            </div>
          </div>
        </div>

        {!hasData ? (
          /* Empty State */
          <div className="bg-white rounded-[32px] border border-[#e7e0ec] p-12 text-center relative overflow-hidden">
            <FadedIconsBackground count={20} className="opacity-40" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-[#f3edff] rounded-[24px] flex items-center justify-center mx-auto mb-6 text-[#6750a4] rotate-3 shadow-lg">
                <Package className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-[#1d192b] mb-3">אין עדיין נתונים</h2>
              <p className="text-[#49454f] mb-8 max-w-md mx-auto leading-relaxed">
                כדי לראות את הסטטיסטיקות, התחילי להוסיף פריטים לרשימה או סמני פריטים בצ'קליסט.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/dashboard">
                  <button className="flex items-center gap-2 bg-[#6750a4] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#503e85] transition-all shadow-md active:scale-95">
                    <Plus className="w-4 h-4" />
                    הוסיפי פריטים
                  </button>
                </Link>
                <Link to="/checklist">
                  <button className="flex items-center gap-2 bg-white border-2 border-[#e7e0ec] text-[#1d192b] px-6 py-3 rounded-full text-sm font-bold hover:border-[#6750a4] hover:text-[#6750a4] transition-all active:scale-95">
                    <ClipboardList className="w-4 h-4" />
                    לצ'קליסט
                  </button>
                </Link>
              </div>
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
            <div className="flex flex-wrap gap-3 justify-center pt-4">
              <Link to="/dashboard">
                <button className="flex items-center gap-1.5 bg-white border-2 border-[#e7e0ec] text-[#1d192b] px-5 py-2.5 rounded-full text-sm font-medium hover:border-[#6750a4] hover:text-[#6750a4] transition-all active:scale-95">
                  <Plus className="w-4 h-4" />
                  לרשימה שלי
                </button>
              </Link>
              <Link to="/checklist">
                <button className="flex items-center gap-1.5 bg-white border-2 border-[#e7e0ec] text-[#1d192b] px-5 py-2.5 rounded-full text-sm font-medium hover:border-[#6750a4] hover:text-[#6750a4] transition-all active:scale-95">
                  <ClipboardList className="w-4 h-4" />
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
