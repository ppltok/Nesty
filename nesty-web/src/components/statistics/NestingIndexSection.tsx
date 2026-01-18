import { Star, Heart } from 'lucide-react'
import CircularProgress from './CircularProgress'

interface NestingIndexSectionProps {
  nestingScore: number
  essentialPercent: number
  niceToHavePercent: number
  essentialChecked: number
  essentialTotal: number
  niceToHaveChecked: number
  niceToHaveTotal: number
  totalChecklistItems: number
  totalChecked: number
  overallReadiness: number
  readinessLabel: string
}

export default function NestingIndexSection({
  nestingScore,
  essentialPercent,
  niceToHavePercent,
  essentialChecked,
  essentialTotal,
  niceToHaveChecked,
  niceToHaveTotal,
  totalChecklistItems,
  totalChecked,
  overallReadiness,
  readinessLabel,
}: NestingIndexSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Nesting Index Card */}
      <div className="bg-white rounded-[28px] border border-[#e7e0ec] p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1d192b] mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-[#f3edff] flex items-center justify-center">
            <Star className="w-4 h-4 text-[#6750a4]" />
          </span>
          מדד הקינון
        </h3>

        <div className="flex flex-col items-center mb-6">
          <CircularProgress
            percentage={nestingScore}
            size={180}
            strokeWidth={14}
            primaryColor="#6750a4"
            secondaryColor="#f3edff"
            label={`${totalChecked} מתוך ${totalChecklistItems}`}
          />
        </div>

        {/* Breakdown bars */}
        <div className="space-y-4">
          {/* Essential items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#b3261e]" />
                <span className="text-sm font-medium text-[#1d192b]">חובה</span>
              </div>
              <span className="text-sm text-[#49454f]">
                {essentialChecked}/{essentialTotal} ({essentialPercent}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-[#ffebee] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#b3261e] rounded-full transition-all duration-700"
                style={{ width: `${essentialPercent}%` }}
              />
            </div>
          </div>

          {/* Nice-to-have items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#7a5582]" />
                <span className="text-sm font-medium text-[#1d192b]">פינוק</span>
              </div>
              <span className="text-sm text-[#49454f]">
                {niceToHaveChecked}/{niceToHaveTotal} ({niceToHavePercent}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-[#fce4ec] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7a5582] rounded-full transition-all duration-700"
                style={{ width: `${niceToHavePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Readiness Meter Card */}
      <div className="bg-gradient-to-br from-[#1d192b] to-[#49454f] rounded-[28px] p-6 shadow-lg text-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
          <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Heart className="w-4 h-4 text-[#d0bcff]" />
          </span>
          מד מוכנות
        </h3>

        <div className="relative z-10">
          {/* Big readiness number */}
          <div className="text-center mb-8">
            <div className="text-7xl font-bold text-white mb-2">
              {overallReadiness}%
            </div>
            <div className="text-xl text-[#d0bcff] font-medium">
              {readinessLabel}
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#d0bcff] to-[#eaddff] rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${overallReadiness}%` }}
              />
            </div>
            {/* Milestone markers */}
            <div className="absolute top-0 left-0 right-0 h-4 flex justify-between px-0.5">
              {[25, 50, 75].map((milestone) => (
                <div
                  key={milestone}
                  className="w-0.5 h-full bg-white/20"
                  style={{ marginRight: `${100 - milestone}%`, marginLeft: `${milestone}%` }}
                />
              ))}
            </div>
          </div>

          {/* Labels */}
          <div className="flex justify-between mt-2 text-xs text-white/60">
            <span>התחלה</span>
            <span>מוכנה!</span>
          </div>
        </div>
      </div>
    </div>
  )
}
