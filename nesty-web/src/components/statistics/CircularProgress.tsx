interface CircularProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  primaryColor?: string
  secondaryColor?: string
  showLabel?: boolean
  label?: string
}

export default function CircularProgress({
  percentage,
  size = 160,
  strokeWidth = 12,
  primaryColor = '#6750a4',
  secondaryColor = '#f3edff',
  showLabel = true,
  label,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={secondaryColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-[#1d192b]">{percentage}%</span>
          {label && (
            <span className="text-sm text-[#49454f] mt-1">{label}</span>
          )}
        </div>
      )}
    </div>
  )
}
