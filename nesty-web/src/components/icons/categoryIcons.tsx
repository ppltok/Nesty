import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { className?: string }

const baseProps = (props: IconProps): SVGProps<SVGSVGElement> => ({
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 32 32',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  ...props,
})

const fillSoft = { fill: 'currentColor', fillOpacity: 0.22, stroke: 'none' } as const

// === 1. General - gift box ===
export const GiftIcon = (props: IconProps) => (
  <svg {...baseProps(props)}>
    <rect x="5" y="13" width="22" height="14" rx="2" {...fillSoft} />
    <rect x="5" y="13" width="22" height="14" rx="2" />
    <rect x="3" y="9" width="26" height="5" rx="1.5" />
    <path d="M16 9v18" />
    <path d="M16 9c-2-3-6-3-6 0s3 2 6 0z" {...fillSoft} />
    <path d="M16 9c-2-3-6-3-6 0s3 2 6 0z" />
    <path d="M16 9c2-3 6-3 6 0s-3 2-6 0z" {...fillSoft} />
    <path d="M16 9c2-3 6-3 6 0s-3 2-6 0z" />
  </svg>
)

// === 2. Stroller ===
export const StrollerIcon = (props: IconProps) => (
  <svg {...baseProps(props)}>
    <path d="M4 11h17a3 3 0 0 1 3 3v3H7a3 3 0 0 1-3-3v-3z" {...fillSoft} />
    <path d="M4 11h17a3 3 0 0 1 3 3v3H7a3 3 0 0 1-3-3v-3z" />
    <path d="M21 11V7a3 3 0 0 0-3-3h-3" />
    <path d="M14 11l-4-7" />
    <circle cx="9" cy="23" r="2.5" {...fillSoft} />
    <circle cx="9" cy="23" r="2.5" />
    <circle cx="22" cy="23" r="2.5" {...fillSoft} />
    <circle cx="22" cy="23" r="2.5" />
  </svg>
)

// === 3. Car Seat ===
export const CarSeatIcon = (props: IconProps) => (
  <svg {...baseProps(props)}>
    <path d="M9 4h7a5 5 0 0 1 5 5v10a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3V8a4 4 0 0 1 3-4z" {...fillSoft} />
    <path d="M9 4h7a5 5 0 0 1 5 5v10a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3V8a4 4 0 0 1 3-4z" />
    <path d="M11 22v3a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3" />
    <circle cx="14" cy="11" r="1.5" fill="currentColor" stroke="none" />
    <path d="M11 16c1.5 1.5 4.5 1.5 6 0" />
    <path d="M21 14h2" />
  </svg>
)

// === 4. Crib (furniture) ===
export const CribIcon = (props: IconProps) => (
  <svg {...baseProps(props)}>
    <path d="M5 11h22v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V11z" {...fillSoft} />
    <path d="M5 11v15" />
    <path d="M27 11v15" />
    <path d="M3 11h26" strokeWidth={2} />
    <path d="M9 13v11M13 13v11M17 13v11M21 13v11M25 13v11" strokeWidth={1} opacity={0.65} />
    <path d="M3 26h26" strokeWidth={1.6} />
    <path d="M14 11V7a2 2 0 0 1 4 0v4" />
  </svg>
)

// === 5. Safety - baby monitor ===
export const MonitorIcon = (props: IconProps) => (
  <svg {...baseProps(props)}>
    <rect x="5" y="6" width="22" height="16" rx="3" {...fillSoft} />
    <rect x="5" y="6" width="22" height="16" rx="3" />
    <circle cx="16" cy="14" r="4" />
    <circle cx="16" cy="14" r="1.5" fill="currentColor" stroke="none" />
    <path d="M9 26h14" strokeWidth={2} />
    <path d="M11 22v4M21 22v4" />
    <circle cx="23" cy="9" r="0.7" fill="currentColor" stroke="none" />
  </svg>
)

// === 6. Feeding - baby bottle ===
export const BottleIcon = (props: IconProps) => (
  <svg {...baseProps(props)}>
    <path d="M12 3h8a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M13 7h6l1 2v15a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V9l1-2z" {...fillSoft} />
    <path d="M13 7h6l1 2v15a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V9l1-2z" />
    <path d="M12 14h8" />
    <path d="M14 18h4" opacity={0.6} />
    <path d="M15 22h2" opacity={0.6} />
  </svg>
)

// === 7. Nursing - heart with droplet ===
export const NursingIcon = (props: IconProps) => (
  <svg {...baseProps(props)}>
    <path d="M16 27s-10-6-10-13a6 6 0 0 1 10-4 6 6 0 0 1 10 4c0 7-10 13-10 13z" {...fillSoft} />
    <path d="M16 27s-10-6-10-13a6 6 0 0 1 10-4 6 6 0 0 1 10 4c0 7-10 13-10 13z" />
    <path d="M16 14c0-2 1.5-3.5 1.5-3.5S19 12 19 14a1.5 1.5 0 1 1-3 0z" fill="currentColor" stroke="none" opacity={0.7} />
  </svg>
)

// === 8. Bath - tub with bubbles ===
export const BathIcon = (props: IconProps) => (
  <svg {...baseProps(props)}>
    <circle cx="11" cy="6" r="1.5" {...fillSoft} />
    <circle cx="11" cy="6" r="1.5" />
    <circle cx="20" cy="4" r="1" fill="currentColor" stroke="none" opacity={0.5} />
    <circle cx="24" cy="7" r="0.8" fill="currentColor" stroke="none" opacity={0.5} />
    <path d="M3 14h26v3a8 8 0 0 1-8 8h-10a8 8 0 0 1-8-8v-3z" {...fillSoft} />
    <path d="M3 14h26v3a8 8 0 0 1-8 8h-10a8 8 0 0 1-8-8v-3z" />
    <path d="M9 14V8a3 3 0 0 1 3-3h0" />
    <path d="M5 28l1-3M27 28l-1-3" />
  </svg>
)

// === 9. Clothing - onesie ===
export const OnesieIcon = (props: IconProps) => (
  <svg {...baseProps(props)}>
    <path d="M11 4h10l3 4-3 3v15a2 2 0 0 1-2 2h-2v-4h-4v4h-2a2 2 0 0 1-2-2V11L8 8l3-4z" {...fillSoft} />
    <path d="M11 4h10l3 4-3 3v15a2 2 0 0 1-2 2h-2v-4h-4v4h-2a2 2 0 0 1-2-2V11L8 8l3-4z" />
    <path d="M13 4c0 1.5 1.5 2.5 3 2.5S19 5.5 19 4" />
    <circle cx="14" cy="14" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="18" cy="14" r="0.7" fill="currentColor" stroke="none" />
    <path d="M14 18c1 1 3 1 4 0" />
  </svg>
)

// === 10. Bedding - pillow/cloud ===
export const PillowIcon = (props: IconProps) => (
  <svg {...baseProps(props)}>
    <path d="M5 11c0-3 2-5 5-5h12c3 0 5 2 5 5v10c0 3-2 5-5 5H10c-3 0-5-2-5-5V11z" {...fillSoft} />
    <path d="M5 11c0-3 2-5 5-5h12c3 0 5 2 5 5v10c0 3-2 5-5 5H10c-3 0-5-2-5-5V11z" />
    <path d="M9 10c1-1 3-1 4 0" opacity={0.6} />
    <path d="M19 10c1-1 3-1 4 0" opacity={0.6} />
    <path d="M12 21c2 1.5 6 1.5 8 0" opacity={0.6} />
  </svg>
)

// === 11. Toys - teddy bear ===
export const TeddyIcon = (props: IconProps) => (
  <svg {...baseProps(props)}>
    <circle cx="9" cy="7" r="2.5" {...fillSoft} />
    <circle cx="9" cy="7" r="2.5" />
    <circle cx="23" cy="7" r="2.5" {...fillSoft} />
    <circle cx="23" cy="7" r="2.5" />
    <circle cx="16" cy="14" r="9" {...fillSoft} />
    <circle cx="16" cy="14" r="9" />
    <circle cx="13" cy="13" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="19" cy="13" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="16" cy="16.5" r="1.2" {...fillSoft} />
    <circle cx="16" cy="16.5" r="1.2" />
    <path d="M14 19c1 1 3 1 4 0" />
  </svg>
)

// === 12. Birth Prep - mom heart ===
export const MomHeartIcon = (props: IconProps) => (
  <svg {...baseProps(props)}>
    <circle cx="16" cy="9" r="4" {...fillSoft} />
    <circle cx="16" cy="9" r="4" />
    <path d="M8 28c0-5 3.5-9 8-9s8 4 8 9" {...fillSoft} />
    <path d="M8 28c0-5 3.5-9 8-9s8 4 8 9" />
    <path d="M16 16.5s-2.5-1.5-2.5-3.5a1.5 1.5 0 0 1 2.5-1 1.5 1.5 0 0 1 2.5 1c0 2-2.5 3.5-2.5 3.5z" fill="currentColor" stroke="none" />
  </svg>
)

// === 13. Siblings - two baby footprints / two hearts ===
export const SiblingsIcon = (props: IconProps) => (
  <svg {...baseProps(props)}>
    <circle cx="11" cy="11" r="4" {...fillSoft} />
    <circle cx="11" cy="11" r="4" />
    <circle cx="21" cy="11" r="4" {...fillSoft} />
    <circle cx="21" cy="11" r="4" />
    <path d="M3 27c0-4 3-7 8-7s8 3 8 7" />
    <path d="M13 27c0-4 3-7 8-7s8 3 8 7" />
    <circle cx="11" cy="11" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="21" cy="11" r="0.8" fill="currentColor" stroke="none" />
  </svg>
)
