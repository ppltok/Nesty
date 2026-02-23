import { useMemo } from 'react'

interface ParticleBackgroundProps {
    count?: number
    className?: string
}

export default function ParticleBackground({ count = 30, className = '' }: ParticleBackgroundProps) {
    const particles = useMemo(() => {
        return Array.from({ length: count }, (_, i) => {
            const x = Math.random() * 100
            const y = Math.random() * 100
            const size = 2 + Math.random() * 4
            const delay = Math.random() * 8
            const duration = 6 + Math.random() * 8
            const opacity = 0.15 + Math.random() * 0.4

            return { id: i, x, y, size, delay, duration, opacity }
        })
    }, [count])

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-full animate-particle-drift"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        background: `radial-gradient(circle, rgba(255,255,255,${p.opacity}) 0%, rgba(255,255,255,0) 70%)`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                    }}
                />
            ))}

            {/* Larger glow orbs */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-white/5 blur-3xl animate-orb-1" />
            <div className="absolute bottom-1/4 right-1/3 w-48 h-48 rounded-full bg-[#ffd8e4]/10 blur-3xl animate-orb-2" />
            <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-[#eaddff]/10 blur-2xl animate-orb-3" />
        </div>
    )
}
