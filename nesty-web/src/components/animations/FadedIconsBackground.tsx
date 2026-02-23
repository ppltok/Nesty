import { useMemo } from 'react'

interface FadedIconsBackgroundProps {
    count?: number
    className?: string
}

const ICONS = [
    // Baby bottle
    (size: number) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2v4M14 2v4M12 6a4 4 0 0 0-4 4v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-8a4 4 0 0 0-4-4z" />
            <path d="M8 14h8" />
        </svg>
    ),
    // Heart
    (size: number) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    ),
    // Star
    (size: number) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
            <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
        </svg>
    ),
    // Pacifier / circle
    (size: number) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="4" />
            <circle cx="12" cy="12" r="9" />
        </svg>
    ),
    // Teddy bear (simplified)
    (size: number) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" opacity="0.5">
            <circle cx="8" cy="6" r="3" />
            <circle cx="16" cy="6" r="3" />
            <circle cx="12" cy="14" r="7" />
        </svg>
    ),
    // Stroller / carriage
    (size: number) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12h16M4 12l2-6h8l2 6M8 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM16 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        </svg>
    ),
    // Rattle
    (size: number) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" opacity="0.5">
            <circle cx="9" cy="7" r="5" />
            <circle cx="15" cy="17" r="5" />
            <rect x="10.5" y="9" width="3" height="6" rx="1.5" transform="rotate(-45 12 12)" />
        </svg>
    ),
    // Moon
    (size: number) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" opacity="0.5">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    ),
    // Cloud
    (size: number) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" opacity="0.4">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        </svg>
    ),
    // Sparkle / diamond
    (size: number) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
            <path d="M12 2L15 10L22 12L15 14L12 22L9 14L2 12L9 10L12 2Z" />
        </svg>
    ),
    // Onesie / romper
    (size: number) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3h8l3 4v3h-3v8H8v-8H5V7l3-4z" />
        </svg>
    ),
    // Gift
    (size: number) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="8" width="18" height="13" rx="2" />
            <path d="M12 8v13M3 12h18M8 8a3 3 0 0 1 4-2.83M16 8a3 3 0 0 0-4-2.83" />
        </svg>
    ),
]

const COLORS = [
    '#6750a4', // purple
    '#ffd8e4', // pink
    '#eaddff', // light purple
    '#f4acb7', // soft pink
    '#d1c4e9', // lavender
    '#b39ddb', // medium purple
]

export default function FadedIconsBackground({ count = 30, className = '' }: FadedIconsBackgroundProps) {
    const items = useMemo(() => {
        return Array.from({ length: count }, (_, i) => {
            const left = Math.random() * 100
            const top = Math.random() * 100
            const delay = Math.random() * 20
            const duration = 15 + Math.random() * 20
            const size = 28 + Math.random() * 40
            const opacity = 0.08 + Math.random() * 0.1
            const rotation = Math.random() * 360
            const iconIndex = i % ICONS.length
            const colorIndex = i % COLORS.length
            const driftX = -20 + Math.random() * 40
            const driftY = -20 + Math.random() * 40

            return { id: i, left, top, delay, duration, size, opacity, rotation, iconIndex, colorIndex, driftX, driftY }
        })
    }, [count])

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {items.map((item) => (
                <div
                    key={item.id}
                    className="absolute animate-faded-icon-drift"
                    style={{
                        left: `${item.left}%`,
                        top: `${item.top}%`,
                        animationDelay: `${item.delay}s`,
                        animationDuration: `${item.duration}s`,
                        opacity: item.opacity,
                        transform: `rotate(${item.rotation}deg)`,
                        color: COLORS[item.colorIndex],
                        ['--drift-x' as string]: `${item.driftX}px`,
                        ['--drift-y' as string]: `${item.driftY}px`,
                    }}
                >
                    {ICONS[item.iconIndex](item.size)}
                </div>
            ))}
        </div>
    )
}
