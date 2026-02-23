import { useMemo } from 'react'

interface FloatingElementsProps {
    count?: number
    type?: 'hearts' | 'sparkles' | 'dots' | 'mixed'
    className?: string
}

export default function FloatingElements({ count = 8, type = 'mixed', className = '' }: FloatingElementsProps) {
    const elements = useMemo(() => {
        return Array.from({ length: count }, (_, i) => {
            const left = Math.random() * 100
            const top = Math.random() * 100
            const delay = Math.random() * 6
            const duration = 4 + Math.random() * 4
            const size = 8 + Math.random() * 16
            const opacity = 0.15 + Math.random() * 0.35

            let elementType = type
            if (type === 'mixed') {
                const types: ('hearts' | 'sparkles' | 'dots')[] = ['hearts', 'sparkles', 'dots']
                elementType = types[i % 3]
            }

            return { id: i, left, top, delay, duration, size, opacity, elementType }
        })
    }, [count, type])

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {elements.map((el) => (
                <div
                    key={el.id}
                    className="absolute animate-floating-element"
                    style={{
                        left: `${el.left}%`,
                        top: `${el.top}%`,
                        animationDelay: `${el.delay}s`,
                        animationDuration: `${el.duration}s`,
                        opacity: el.opacity,
                    }}
                >
                    {el.elementType === 'hearts' && (
                        <svg width={el.size} height={el.size} viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                fill="#ffd8e4"
                            />
                        </svg>
                    )}
                    {el.elementType === 'sparkles' && (
                        <svg width={el.size} height={el.size} viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z"
                                fill="#eaddff"
                            />
                        </svg>
                    )}
                    {el.elementType === 'dots' && (
                        <div
                            className="rounded-full"
                            style={{
                                width: el.size * 0.5,
                                height: el.size * 0.5,
                                background: ['#6750a4', '#ffd8e4', '#eaddff', '#f4acb7'][el.id % 4],
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}
