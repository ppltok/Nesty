import type { LucideProps } from 'lucide-react'
import { forwardRef } from 'react'

const StrollerIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ color = 'currentColor', size = 24, strokeWidth = 2, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Stroller body */}
      <path d="M14 3a2 2 0 0 1 2 2v4a4 4 0 0 1-4 4H6" />
      <path d="M6 9V5a2 2 0 0 1 2-2" />
      {/* Handle */}
      <path d="M18 5v8a2 2 0 0 1-2 2H6" />
      {/* Carriage */}
      <path d="M4 13h12a2 2 0 0 1 2 2v2H4a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2z" />
      {/* Wheels */}
      <circle cx="7" cy="19" r="2" />
      <circle cx="15" cy="19" r="2" />
    </svg>
  )
)

StrollerIcon.displayName = 'StrollerIcon'

export default StrollerIcon
