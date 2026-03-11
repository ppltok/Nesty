import { Star, Heart } from 'lucide-react'
import CircularProgress from './CircularProgress'
import FadedIconsBackground from '../animations/FadedIconsBackground'

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
      <div className="bg-white rounded-[28px] border border-[#e7e0ec] p-6 shadow-sm hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.08)] transition-all duration-300">
        <h3 className="text-lg font-bold text-[#1d192b] mb-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#f5f3ff] flex items-center justify-center">
            <Star className="w-4.5 h-4.5 text-[#6750a4]" />
          </div>
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
          <div className="bg-[#fef2f2] rounded-2xl p-3.5">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#b3261e]" />
                <span className="text-sm font-bold text-[#1d192b]">חובה</span>
              </div>
              <span className="text-sm font-medium text-[#49454f]">
                {essentialChecked}/{essentialTotal} ({essentialPercent}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-white/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#b3261e] rounded-full transition-all duration-700"
                style={{ width: `${essentialPercent}%` }}
              />
            </div>
          </div>

          {/* Nice-to-have items */}
          <div className="bg-[#fdf2f8] rounded-2xl p-3.5">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7a5582]" />
                <span className="text-sm font-bold text-[#1d192b]">פינוק</span>
              </div>
              <span className="text-sm font-medium text-[#49454f]">
                {niceToHaveChecked}/{niceToHaveTotal} ({niceToHavePercent}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-white/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7a5582] rounded-full transition-all duration-700"
                style={{ width: `${niceToHavePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Readiness Meter Card */}
      <div className="bg-[#1d192b] rounded-[28px] p-6 shadow-[0_20px_60px_-15px_rgba(29,25,43,0.3)] text-white relative overflow-hidden">
        {/* Aurora flowing background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="aurora-blob-1 absolute -top-1/3 -left-1/4 w-[60%] h-[60%] rounded-full bg-[#6750a4]/35 blur-[50px]" />
          <div className="aurora-blob-3 absolute -bottom-1/4 right-1/3 w-[50%] h-[50%] rounded-full bg-[#d0bcff]/15 blur-[45px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#1d192b]/20 to-[#49454f]/10" />
        </div>
        <FadedIconsBackground count={10} className="opacity-15" />

        <h3 className="text-lg font-bold mb-6 flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Heart className="w-4.5 h-4.5 text-[#d0bcff]" />
          </div>
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
            <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
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
          <div className="flex justify-between mt-2 text-xs text-white/50 font-medium">
            <span>התחלה</span>
            <span>מוכנה!</span>
          </div>
        </div>
      </div>
    </div>
  )
}
